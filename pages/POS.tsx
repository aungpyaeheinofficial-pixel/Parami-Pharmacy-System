
import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, User, CreditCard, Banknote, QrCode, RotateCcw, Save, ShoppingCart, ScanLine, Image as ImageIcon, CheckCircle, AlertCircle, X, Check } from 'lucide-react';
import { useCartStore, useProductStore, useTransactionStore, useCustomerStore, useBranchStore } from '../store';
import { Button, Input, Badge } from '../components/UI';
import { Product, Transaction } from '../types';
import CameraScanner from '../components/CameraScanner';

// --- GS1 Parser Utilities ---

const convertYYMMDDtoDate = (yymmdd: string) => {
  const yy = parseInt(yymmdd.substring(0, 2));
  const mm = yymmdd.substring(2, 4);
  const dd = yymmdd.substring(4, 6);
  // Assume 20xx for years 00-50, 19xx for 51-99
  const yyyy = yy <= 50 ? 2000 + yy : 1900 + yy;
  return `${yyyy}-${mm}-${dd}`;
}

const parseGS1Barcode = (scannedData: string) => {
  const result = {
    gtin: null as string | null,
    expiryDate: null as string | null,
    batchNumber: null as string | null,
    serialNumber: null as string | null
  };
  
  let data = scannedData.replace(/^\]d2/, '').replace(/^\]C1/, '');
  
  if (data.includes('(')) {
      const gtinMatch = data.match(/\(01\)(\d{14})|01(\d{14})/);
      if (gtinMatch) result.gtin = gtinMatch[1] || gtinMatch[2];
      
      const expiryMatch = data.match(/\(17\)(\d{6})|17(\d{6})/);
      if (expiryMatch) result.expiryDate = convertYYMMDDtoDate(expiryMatch[1] || expiryMatch[2]);
      
      const batchMatch = data.match(/\(10\)([^\(]*)|10([^\\x1D]*)/);
      if (batchMatch) result.batchNumber = (batchMatch[1] || batchMatch[2]).trim();
      
      const serialMatch = data.match(/\(21\)([^\(]*)|21([^\\x1D]*)/);
      if (serialMatch) result.serialNumber = (serialMatch[1] || serialMatch[2]).trim();
  } else {
      const gtinMatch = data.match(/01(\d{14})/);
      if (gtinMatch) result.gtin = gtinMatch[1];
      
      const expiryMatch = data.match(/17(\d{6})/);
      if (expiryMatch) result.expiryDate = convertYYMMDDtoDate(expiryMatch[1]);
      
      const batchMatch = data.match(/10([^\x1D]*)/);
      if (batchMatch) result.batchNumber = batchMatch[1].trim();
      
      const serialMatch = data.match(/21([^\x1D]*)/);
      if (serialMatch) result.serialNumber = serialMatch[1].trim();
  }

  return result;
};


const ProductCard: React.FC<{ product: Product, onAdd: (p: Product) => void }> = ({ product, onAdd }) => (
  <div 
    onClick={() => onAdd(product)}
    className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 hover:border-parami hover:shadow-md cursor-pointer transition-all group flex flex-col h-full"
  >
    <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-slate-100 flex items-center justify-center">
       {product.image ? (
          <img src={product.image} alt={product.nameEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
       ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
             <ImageIcon size={32} className="opacity-50" />
          </div>
       )}
       {product.stockLevel < product.minStockLevel && (
         <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">LOW STOCK</span>
       )}
    </div>
    <div className="flex-1">
      <h4 className="font-medium text-slate-800 text-sm line-clamp-2 leading-tight">{product.nameEn}</h4>
      <div className="flex flex-col mt-1">
        <p className="text-xs text-slate-500 font-mm">{product.nameMm}</p>
        {product.genericName && <p className="text-[10px] text-slate-400 italic mt-0.5 truncate">{product.genericName}</p>}
      </div>
    </div>
    <div className="mt-3 flex items-center justify-between">
      <span className="font-bold text-parami">{product.price.toLocaleString()} Ks</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${product.stockLevel < product.minStockLevel ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
        {product.stockLevel} left
      </span>
    </div>
  </div>
);

const POS = () => {
  const { items, addItem, removeItem, updateQuantity, total, clearCart, customer, setCustomer } = useCartStore();
  const { products } = useProductStore();
  const { customers } = useCustomerStore();
  const { addTransaction } = useTransactionStore();
  const { currentBranchId } = useBranchStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Scanned Feedback State
  const [scannedInfo, setScannedInfo] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const categories = ['All', 'Antibiotics', 'Analgesics', 'Vitamins', 'Supplements', 'Gastrointestinal', 'Diabetic'];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = p.nameEn.toLowerCase().includes(lowerSearch) || 
                            p.nameMm.includes(searchTerm) ||
                            p.sku.toLowerCase().includes(lowerSearch) ||
                            (p.genericName && p.genericName.toLowerCase().includes(lowerSearch));
                            
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const processBarcode = (code: string) => {
       const gs1Data = parseGS1Barcode(code);
       
       if (gs1Data.gtin) {
           const product = products.find(p => p.gtin === gs1Data.gtin);
           if (product) {
              let selectedBatchId = undefined;
              let batchMsg = "";

              if (gs1Data.batchNumber) {
                 const batch = product.batches.find(b => b.batchNumber === gs1Data.batchNumber);
                 if (batch) {
                    selectedBatchId = batch.id;
                    batchMsg = ` - Batch: ${batch.batchNumber}`;
                 } else {
                    batchMsg = ` - New Batch: ${gs1Data.batchNumber}`;
                 }
              }

              addItem(product, selectedBatchId);
              setSearchTerm('');
              setScannedInfo({ 
                 msg: `Scanned: ${product.nameEn}${batchMsg}`, 
                 type: 'success' 
              });
              return true;
           } else {
              setScannedInfo({ msg: `Product with GTIN ${gs1Data.gtin} not found`, type: 'error' });
              return false;
           }
       } else {
          // Fallback search or add if exact match
          // Look for SKU, ID, or GTIN (for simple barcodes)
          const exactMatch = products.find(p => p.sku === code || p.id === code || p.gtin === code);
          if (exactMatch) {
             addItem(exactMatch);
             setSearchTerm('');
             setScannedInfo({ msg: `Added: ${exactMatch.nameEn}`, type: 'success' });
             return true;
          } else {
             setScannedInfo({ msg: `Unknown barcode: ${code}`, type: 'error' });
             return false;
          }
       }
  };

  const handleScanInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm) {
       processBarcode(searchTerm);
       setSearchTerm('');
       setTimeout(() => setScannedInfo(null), 3000);
    }
  };

  const handleCameraScan = (code: string) => {
      const success = processBarcode(code);
      if (success) {
          setIsScannerOpen(false); // Close scanner on success
      }
  };

  const handleCheckout = () => {
    const totalAmount = total();
    const newTransaction: Transaction = {
      id: `TRX-${Date.now()}`,
      type: 'INCOME',
      category: 'Sales',
      amount: totalAmount,
      date: new Date().toISOString().split('T')[0],
      description: `POS Sale - ${items.length} items`,
      paymentMethod: 'CASH',
      branchId: currentBranchId,
    };
    
    addTransaction(newTransaction);
    
    setPaymentModalOpen(false);
    clearCart();
    
    setSuccessMsg('Transaction Completed Successfully!');
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 relative">
      {/* Success Toast */}
      {successMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
           <CheckCircle size={20} />
           <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Left Side - Product Catalog */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">
        
        {/* Search & Filter Bar */}
        <div className="p-4 bg-white border-b border-slate-200 space-y-4">
          <div className="flex gap-2">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search products or scan barcode..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-transparent focus:bg-white focus:border-a7 rounded-xl text-sm transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleScanInput}
                  autoFocus
                />
             </div>
             <button 
               onClick={() => setIsScannerOpen(true)}
               className="bg-slate-800 text-white p-2.5 rounded-xl hover:bg-slate-700 transition-colors"
               title="Open Camera Scanner"
             >
                <ScanLine size={20} />
             </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-a7 text-white shadow-md shadow-a7/30' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Scan Feedback */}
          {scannedInfo && (
             <div className={`p-3 rounded-lg text-sm flex items-center gap-2 animate-in slide-in-from-top-2 fade-in ${
                scannedInfo.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
             }`}>
                {scannedInfo.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {scannedInfo.msg}
             </div>
          )}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onAdd={() => addItem(product)} />
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-slate-400 py-12">
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Search size={32} className="opacity-50" />
                   </div>
                   <p>No products found matching "{searchTerm}"</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Right Side - Cart */}
      <div className="w-96 bg-white flex flex-col shrink-0 shadow-xl z-10">
         {/* Customer Selector */}
         <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <ShoppingCart size={18} /> Current Sale
               </h3>
               <button onClick={clearCart} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1">
                  <RotateCcw size={12} /> Clear
               </button>
            </div>
            <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <select 
                 className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-a7 appearance-none"
                 value={customer?.id || ''}
                 onChange={(e) => {
                    const c = customers.find(cust => cust.id === e.target.value);
                    setCustomer(c || null);
                 }}
               >
                  <option value="">Walk-in Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.tier})</option>
                  ))}
               </select>
            </div>
         </div>

         {/* Cart Items */}
         <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.map(item => (
              <div key={item.cartId} className="flex gap-3 bg-white border border-slate-100 rounded-xl p-3 hover:border-slate-300 transition-colors group relative">
                 <button 
                   onClick={() => removeItem(item.cartId)}
                   className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                    <Trash2 size={14} />
                 </button>
                 
                 <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                    {item.image ? <img src={item.image} className="w-full h-full object-cover rounded-lg" alt={item.nameEn} /> : <ImageIcon size={20} className="text-slate-400" />}
                 </div>
                 
                 <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-800 truncate pr-4">{item.nameEn}</h4>
                    <p className="text-xs text-slate-500 mb-2 font-mono">
                       {item.price.toLocaleString()} Ks
                       {item.selectedBatchId && <span className="ml-1 text-[10px] bg-slate-100 px-1 rounded">Batch set</span>}
                    </p>
                    
                    <div className="flex items-center gap-3">
                       <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                          <button 
                            onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md text-slate-600 transition-shadow shadow-sm"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button 
                             onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                             className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md text-slate-600 transition-shadow shadow-sm"
                          >
                            <Plus size={12} />
                          </button>
                       </div>
                       <p className="text-sm font-bold text-slate-800 ml-auto">
                          {(item.price * item.quantity).toLocaleString()}
                       </p>
                    </div>
                 </div>
              </div>
            ))}

            {items.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 opacity-60">
                  <ShoppingCart size={48} />
                  <p className="text-sm font-medium">Cart is empty</p>
               </div>
            )}
         </div>

         {/* Footer Totals */}
         <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="space-y-1 text-sm">
               <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{total().toLocaleString()} Ks</span>
               </div>
               <div className="flex justify-between text-slate-500">
                  <span>Tax (0%)</span>
                  <span>0 Ks</span>
               </div>
               {customer && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                     <span>Member Discount ({customer.tier})</span>
                     <span>-0 Ks</span>
                  </div>
               )}
               <div className="flex justify-between text-lg font-bold text-slate-800 pt-2 border-t border-slate-200 mt-2">
                  <span>Total</span>
                  <span>{total().toLocaleString()} Ks</span>
               </div>
            </div>

            <Button 
               variant="primary" 
               className="w-full h-12 text-base shadow-xl shadow-a7/20 bg-gradient-to-r from-a7 to-a7-dark"
               disabled={items.length === 0}
               onClick={() => setPaymentModalOpen(true)}
            >
               Checkout
            </Button>
         </div>
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
               <h3 className="text-xl font-bold text-slate-800 mb-1">Confirm Payment</h3>
               <p className="text-sm text-slate-500 mb-6">Total Amount: <span className="font-bold text-slate-900">{total().toLocaleString()} Ks</span></p>
               
               <div className="grid grid-cols-2 gap-3 mb-6">
                  <button className="flex flex-col items-center justify-center gap-2 p-4 border border-a7 bg-a7/5 rounded-xl text-a7 ring-1 ring-a7 ring-offset-2">
                     <Banknote size={24} />
                     <span className="font-medium text-sm">Cash</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 p-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600">
                     <QrCode size={24} />
                     <span className="font-medium text-sm">KBZ Pay</span>
                  </button>
               </div>

               <div className="space-y-3">
                  <Input label="Cash Received" placeholder="0" autoFocus />
                  <div className="flex justify-between text-sm p-3 bg-slate-100 rounded-lg">
                     <span className="text-slate-500">Change</span>
                     <span className="font-bold text-slate-800">0 Ks</span>
                  </div>
               </div>

               <div className="flex gap-3 mt-8">
                  <Button variant="outline" className="flex-1" onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
                  <Button variant="primary" className="flex-1" onClick={handleCheckout}>Confirm & Print</Button>
               </div>
            </div>
         </div>
      )}

      {/* Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
           <div className="p-4 flex justify-between items-center text-white bg-black/50 backdrop-blur absolute top-0 left-0 right-0 z-10">
              <span className="font-bold">Scan Barcode</span>
              <button onClick={() => setIsScannerOpen(false)} className="p-2 bg-white/10 rounded-full"><X size={20} /></button>
           </div>
           <div className="flex-1 bg-black relative">
               <CameraScanner onScan={handleCameraScan} className="h-full w-full" />
           </div>
           <div className="p-6 bg-slate-900 text-white text-center">
              <p className="text-sm opacity-70">Align barcode within the frame</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default POS;
