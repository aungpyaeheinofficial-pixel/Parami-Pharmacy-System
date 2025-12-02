
import React, { useState, useMemo } from 'react';
import { Card, Button, Badge, Input } from '../components/UI';
import { usePurchaseStore, useSupplierStore } from '../store';
import { PurchaseOrder, Supplier } from '../types';
import { ShoppingBag, Plus, Phone, Mail, FileText, Download, Edit2, Trash2, X, Save, Minus, CheckCircle, Clock, Truck, CreditCard, Banknote, Search, AlertCircle, Loader2, Check } from 'lucide-react';

// --- Types ---
interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
}

const Purchase = () => {
  // Use stores
  const { purchaseOrders, addPO, updatePO, deletePO } = usePurchaseStore();
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSupplierStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);

  // Delete State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // PO Form State
  const [formData, setFormData] = useState<PurchaseOrder>({
    id: '',
    supplierId: '',
    supplierName: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PENDING',
    paymentType: 'CASH',
    items: [],
    totalAmount: 0,
    notes: '',
    branchId: '' // Will be set by store
  });
  
  // New Item Input State
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unitCost: 0 });

  // --- Supplier State ---
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierFormData, setSupplierFormData] = useState<Supplier>({
    id: '',
    name: '',
    contact: '',
    email: '',
    credit: 0,
    outstanding: 0,
    branchId: ''
  });

  // --- Helpers ---
  const calculateTotal = (items: PurchaseItem[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'RECEIVED': return 'success';
      case 'ORDERED': return 'info';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'danger';
      default: return 'neutral';
    }
  };
  
  const totalPayables = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + s.outstanding, 0);
  }, [suppliers]);

  // --- PO Handlers ---
  const handleCreateNew = () => {
    setEditingPO(null);
    setFormData({
      id: `PO-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth()+1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      supplierId: suppliers[0]?.id || '',
      supplierName: suppliers[0]?.name || '',
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      paymentType: 'CASH',
      items: [],
      totalAmount: 0,
      notes: '',
      branchId: ''
    });
    setNewItem({ name: '', quantity: 1, unitCost: 0 });
    setIsModalOpen(true);
  };

  const handleEdit = (po: PurchaseOrder) => {
    setEditingPO(po);
    setFormData({ ...po }); 
    setNewItem({ name: '', quantity: 1, unitCost: 0 });
    setIsModalOpen(true);
  };

  const handleDeleteRow = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); 
    const po = purchaseOrders.find(p => p.id === id);
    if (!po) return;
    setEditingPO(po);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!editingPO) return;
    setIsDeleting(true);

    setTimeout(() => {
      deletePO(editingPO.id);
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
      setIsModalOpen(false);
      setEditingPO(null);
      setSuccessMsg("Purchase Order deleted successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 1000);
  };

  const handleSave = () => {
    if (!formData.supplierName) {
      alert("Please select a supplier");
      return;
    }

    const updatedTotal = calculateTotal(formData.items);
    const finalPO = { ...formData, totalAmount: updatedTotal };

    if (editingPO) {
      updatePO(finalPO);
      setSuccessMsg("Purchase Order updated successfully");
    } else {
      addPO(finalPO);
      setSuccessMsg("Purchase Order created successfully");
    }
    setIsModalOpen(false);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // PO Item Handlers
  const handleAddItem = () => {
    if (!newItem.name) return alert("Enter item name");
    if (newItem.quantity <= 0) return alert("Quantity must be > 0");
    
    const item: PurchaseItem = {
      id: Date.now().toString(),
      name: newItem.name,
      quantity: newItem.quantity,
      unitCost: newItem.unitCost
    };

    const newItems = [...formData.items, item];
    setFormData({
      ...formData,
      items: newItems,
      totalAmount: calculateTotal(newItems)
    });
    setNewItem({ name: '', quantity: 1, unitCost: 0 });
  };

  const handleRemoveItem = (itemId: string) => {
    const newItems = formData.items.filter(i => i.id !== itemId);
    setFormData({
      ...formData,
      items: newItems,
      totalAmount: calculateTotal(newItems)
    });
  };

  // --- Supplier Handlers ---
  const handleCreateSupplier = () => {
    setEditingSupplier(null);
    setSupplierFormData({
      id: `s${Date.now()}`,
      name: '',
      contact: '',
      email: '',
      credit: 0,
      outstanding: 0,
      branchId: ''
    });
    setIsSupplierModalOpen(true);
  };

  const handleEditSupplier = (e: React.MouseEvent, supplier: Supplier) => {
    e.stopPropagation();
    setEditingSupplier(supplier);
    setSupplierFormData({ ...supplier });
    setIsSupplierModalOpen(true);
  };

  const handleDeleteSupplier = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      deleteSupplier(id);
      setIsSupplierModalOpen(false);
    }
  };

  const handleSaveSupplier = () => {
    if (!supplierFormData.name) return alert("Supplier Name is required");

    // Ensure numeric values
    const cleanData = {
        ...supplierFormData,
        credit: Number(supplierFormData.credit),
        outstanding: Number(supplierFormData.outstanding)
    };

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, cleanData);
      setSuccessMsg("Supplier updated successfully");
    } else {
      addSupplier(cleanData);
      setSuccessMsg("Supplier added successfully");
    }
    setIsSupplierModalOpen(false);
    setEditingSupplier(null);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Purchase Management
            <span className="text-base font-normal text-slate-400 font-mm ml-2">အဝယ်ပိုင်း</span>
          </h1>
          <p className="text-slate-500 text-sm">Manage suppliers, purchase orders, and receiving.</p>
        </div>
        
        {successMsg && (
             <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 absolute top-6 right-1/2 translate-x-1/2 shadow-lg">
                <Check size={16} /> {successMsg}
             </div>
        )}

        <Button variant="primary" className="gap-2 shadow-lg shadow-parami/20" onClick={handleCreateNew}>
             <Plus size={18} /> Create PO
        </Button>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
        {/* Main List Column */}
        <div className="md:col-span-2 flex flex-col gap-6 overflow-hidden min-h-0">
           {/* Suppliers Teaser */}
           <Card 
             title="Active Suppliers" 
             className="shrink-0"
             action={
               <button 
                 onClick={handleCreateSupplier}
                 className="flex items-center gap-1.5 px-3 py-1.5 bg-parami/10 text-parami hover:bg-parami/20 rounded-lg text-xs font-bold transition-colors"
               >
                 <Plus size={14} /> Add Supplier
               </button>
             }
           >
              <div className="overflow-x-auto max-h-[200px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 sticky top-0">
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-2 bg-slate-50">Supplier Name</th>
                      <th className="px-4 py-2 bg-slate-50">Contact</th>
                      <th className="px-4 py-2 text-right bg-slate-50">Outstanding</th>
                      <th className="px-4 py-2 w-[80px] bg-slate-50"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {suppliers.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors text-sm group cursor-pointer" onClick={(e) => handleEditSupplier(e, s)}>
                        <td className="px-4 py-2 font-medium text-slate-800">{s.name}</td>
                        <td className="px-4 py-2 text-slate-500">{s.contact}</td>
                        <td className="px-4 py-2 text-right">
                           <span className={`font-bold ${s.outstanding > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                             {s.outstanding.toLocaleString()}
                           </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                           <div className="flex justify-end gap-1 opacity-100 transition-all">
                               <button 
                                 type="button"
                                 onClick={(e) => handleEditSupplier(e, s)}
                                 className="p-1 text-slate-400 hover:text-a7 hover:bg-slate-100 rounded"
                                 title="Edit"
                               >
                                 <Edit2 size={14} />
                               </button>
                               <button 
                                 type="button"
                                 onClick={(e) => handleDeleteSupplier(e, s.id)}
                                 className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                 title="Delete"
                               >
                                 <Trash2 size={14} />
                               </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {suppliers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-slate-400 text-sm">
                          No active suppliers. Add one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
           </Card>
           
           {/* PO List */}
           <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-0">
             <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0">
                <h3 className="font-semibold text-slate-800 text-lg">Purchase Orders</h3>
                <div className="relative">
                   <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-a7" placeholder="Search PO..." />
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-0">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 bg-slate-50">PO Number</th>
                      <th className="px-6 py-3 bg-slate-50">Supplier</th>
                      <th className="px-6 py-3 bg-slate-50">Status</th>
                      <th className="px-6 py-3 bg-slate-50">Payment</th>
                      <th className="px-6 py-3 text-right bg-slate-50">Total</th>
                      <th className="px-6 py-3 w-[80px] bg-slate-50"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchaseOrders.map(po => (
                      <tr 
                        key={po.id} 
                        onClick={() => handleEdit(po)}
                        className="hover:bg-slate-50 cursor-pointer group transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-medium text-slate-700">{po.id}</span>
                          <p className="text-xs text-slate-400 mt-0.5">{po.date}</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">{po.supplierName}</td>
                        <td className="px-6 py-4">
                           <Badge variant={getStatusColor(po.status)}>{po.status}</Badge>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-1.5 text-xs font-medium">
                              {po.paymentType === 'CASH' ? (
                                <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                   <Banknote size={12} /> Cash (လက်ငင်း)
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                   <CreditCard size={12} /> Credit (အကြွေး)
                                </span>
                              )}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-800">
                          {po.totalAmount.toLocaleString()} Ks
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2 opacity-100 transition-all">
                               <button 
                                 type="button"
                                 onClick={(e) => { e.stopPropagation(); handleEdit(po); }}
                                 className="relative z-10 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-a7 rounded transition-colors"
                                 title="Edit"
                               >
                                 <Edit2 size={16} />
                               </button>
                               <button 
                                 type="button"
                                 onClick={(e) => handleDeleteRow(e, po.id)}
                                 className="relative z-10 p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                                 title="Delete"
                               >
                                 <Trash2 size={16} />
                               </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {purchaseOrders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                           <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
                           <p>No purchase orders found for this branch.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
           </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-6 overflow-y-auto">
           <div className="bg-gradient-to-br from-a7 to-a7-dark text-white p-6 rounded-xl shadow-lg shadow-a7/30 shrink-0">
              <h3 className="font-bold text-lg mb-1">Total Payables</h3>
              <p className="text-3xl font-bold mb-4">{totalPayables.toLocaleString()} Ks</p>
              <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm text-sm space-y-2">
                <p className="flex justify-between"><span>Active Suppliers</span> <span className="font-bold">{suppliers.length}</span></p>
                <div className="h-[1px] bg-white/20"></div>
                <p className="flex justify-between"><span>Suppliers Owed</span> <span className="font-bold text-red-200">{suppliers.filter(s => s.outstanding > 0).length}</span></p>
              </div>
           </div>
        </div>
      </div>
      
      {/* Create/Edit PO Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                 <div>
                   <h3 className="font-bold text-xl text-slate-800">
                     {editingPO ? `Edit Purchase Order ${editingPO.id}` : 'Create Purchase Order'}
                   </h3>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
                    <X size={20} />
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                     {/* Supplier Info */}
                     <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Supplier</label>
                        <select 
                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-a7/20"
                            value={formData.supplierId}
                            onChange={(e) => {
                               const supp = suppliers.find(s => s.id === e.target.value);
                               setFormData({ ...formData, supplierId: e.target.value, supplierName: supp ? supp.name : '' });
                            }}
                        >
                            <option value="">-- Select Supplier --</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <Input label="Order Date" type="date" value={formData.date} onChange={(e: any) => setFormData({...formData, date: e.target.value})} />
                     </div>
                     {/* Payment & Status */}
                     <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                        <select className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})}>
                            <option value="PENDING">Pending</option>
                            <option value="ORDERED">Ordered</option>
                            <option value="RECEIVED">Received</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Type</label>
                             <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="paymentType" 
                                        checked={formData.paymentType === 'CASH'} 
                                        onChange={() => setFormData({...formData, paymentType: 'CASH'})}
                                        className="text-parami focus:ring-parami"
                                    />
                                    <span>Cash</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="paymentType" 
                                        checked={formData.paymentType === 'CREDIT'} 
                                        onChange={() => setFormData({...formData, paymentType: 'CREDIT'})}
                                        className="text-parami focus:ring-parami"
                                    />
                                    <span>Credit</span>
                                </label>
                             </div>
                        </div>
                     </div>
                 </div>
                 
                 <div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                       <table className="w-full text-left text-sm">
                         <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                           <tr>
                             <th className="px-4 py-3">Item Name</th>
                             <th className="px-4 py-3">Cost</th>
                             <th className="px-4 py-3">Qty</th>
                             <th className="px-4 py-3 text-right">Total</th>
                             <th className="px-4 py-3"></th>
                           </tr>
                         </thead>
                         <tbody>
                            {formData.items.map(item => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3">{item.name}</td>
                                    <td className="px-4 py-3">{item.unitCost}</td>
                                    <td className="px-4 py-3">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right">{(item.unitCost * item.quantity).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right"><button onClick={() => handleRemoveItem(item.id)}><X size={16}/></button></td>
                                </tr>
                            ))}
                             <tr className="bg-slate-50/50">
                                <td className="px-4 py-2"><input placeholder="Product..." className="w-full border rounded px-2 py-1" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} /></td>
                                <td className="px-4 py-2"><input type="number" placeholder="Cost" className="w-full border rounded px-2 py-1" value={newItem.unitCost} onChange={(e) => setNewItem({...newItem, unitCost: parseInt(e.target.value) || 0})} /></td>
                                <td className="px-4 py-2"><input type="number" className="w-12 border rounded px-1" value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})} /></td>
                                <td className="px-4 py-2 text-right">{(newItem.unitCost * newItem.quantity).toLocaleString()}</td>
                                <td className="px-4 py-2"><button onClick={handleAddItem}><Plus size={16}/></button></td>
                             </tr>
                         </tbody>
                       </table>
                    </div>
                 </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                 <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                 <Button variant="primary" onClick={handleSave}>Save Order</Button>
              </div>
           </div>
        </div>
      )}

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                   <h3 className="font-bold text-xl text-slate-800">{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h3>
                   <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
               </div>
               <div className="p-6 space-y-4">
                   <Input label="Supplier Name" value={supplierFormData.name} onChange={(e: any) => setSupplierFormData({...supplierFormData, name: e.target.value})} required />
                   <Input label="Contact Person / Phone" value={supplierFormData.contact} onChange={(e: any) => setSupplierFormData({...supplierFormData, contact: e.target.value})} />
                   <Input label="Email" value={supplierFormData.email} onChange={(e: any) => setSupplierFormData({...supplierFormData, email: e.target.value})} />
                   <Input label="Opening Balance (Outstanding)" type="number" value={supplierFormData.outstanding} onChange={(e: any) => setSupplierFormData({...supplierFormData, outstanding: parseInt(e.target.value) || 0})} />
                   <Input label="Credit Limit" type="number" value={supplierFormData.credit} onChange={(e: any) => setSupplierFormData({...supplierFormData, credit: parseInt(e.target.value) || 0})} />
               </div>
               <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                   <Button variant="outline" onClick={() => setIsSupplierModalOpen(false)}>Cancel</Button>
                   <Button variant="primary" onClick={handleSaveSupplier}>Save Supplier</Button>
               </div>
           </div>
        </div>
      )}

      {/* Delete PO Confirm Modal */}
      {isDeleteConfirmOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                          <Trash2 size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Purchase Order</h3>
                      <p className="text-slate-500 text-sm mb-6">
                          Are you sure you want to delete this order? This action cannot be undone.
                      </p>
                      <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={() => setIsDeleteConfirmOpen(false)} disabled={isDeleting}>Cancel</Button>
                          <Button 
                              variant="danger" 
                              className="flex-1 bg-red-600 hover:bg-red-700 border-red-600 text-white" 
                              onClick={confirmDelete} 
                              disabled={isDeleting}
                          >
                              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                          </Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Purchase;
