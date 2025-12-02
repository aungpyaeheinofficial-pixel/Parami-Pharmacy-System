
import React, { useState, useMemo } from 'react';
import { Button, Input, Badge } from '../components/UI';
import { useDistributionStore } from '../store';
import { DistributionOrder, DistributionItem } from '../types';
import { Truck, MapPin, Package, Clock, Search, Filter, Plus, X, Trash2, Save, Calendar, DollarSign, CreditCard, ShoppingBag, ChevronRight, Minus } from 'lucide-react';

const Distribution = () => {
  // Use store
  const { orders, addOrder, updateOrder, deleteOrder } = useDistributionStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<DistributionOrder | null>(null);

  // Modal Form State
  const [formData, setFormData] = useState<DistributionOrder>({
    id: '',
    customer: '',
    address: '',
    status: 'PENDING',
    total: 0,
    date: new Date().toISOString().split('T')[0],
    deliveryTime: '09:00',
    paymentType: 'CASH',
    itemsList: [],
    branchId: ''
  });

  // State for the "Add Item" row inputs
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, price: 0 });

  // CRUD Handlers
  const handleEditClick = (order: DistributionOrder) => {
    setEditingOrder(order);
    setFormData({ ...order }); 
    setIsModalOpen(true);
    setNewItem({ name: '', quantity: 1, price: 0 });
  };

  const handleNewOrder = () => {
    setEditingOrder(null);
    setFormData({
      id: `ORD-${Date.now().toString().slice(-4)}`,
      customer: '',
      address: '',
      status: 'PENDING',
      total: 0,
      date: new Date().toISOString().split('T')[0],
      deliveryTime: '09:00',
      paymentType: 'CASH',
      itemsList: [],
      branchId: ''
    });
    setNewItem({ name: '', quantity: 1, price: 0 });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.customer) return alert("Customer Name is required");

    const calculatedTotal = formData.itemsList.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalData = { ...formData, total: calculatedTotal };

    if (editingOrder) {
      updateOrder(finalData);
    } else {
      addOrder(finalData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteOrder = () => {
    if (!editingOrder) return;
    if (window.confirm("Are you sure you want to delete this order permanently?")) {
      deleteOrder(editingOrder.id);
      setIsModalOpen(false);
    }
  };

  // --- Item Management inside Modal ---
  const handleAddItem = () => {
    if (!newItem.name.trim()) return alert("Please enter an item name");
    if (newItem.quantity <= 0) return alert("Quantity must be greater than 0");
    
    const itemToAdd: DistributionItem = {
      id: Date.now().toString(),
      name: newItem.name,
      quantity: newItem.quantity,
      price: newItem.price
    };

    const updatedItems = [...formData.itemsList, itemToAdd];
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    setFormData({
      ...formData,
      itemsList: updatedItems,
      total: newTotal
    });
    setNewItem({ name: '', quantity: 1, price: 0 });
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = formData.itemsList.filter(item => item.id !== itemId);
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setFormData({
      ...formData,
      itemsList: updatedItems,
      total: newTotal
    });
  };

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  // Status Columns
  const columns = ['PENDING', 'PACKING', 'DELIVERING', 'COMPLETED'];

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Distribution Management
            <span className="text-base font-normal text-slate-400 font-mm ml-2">ဖြန့်ချိရေး</span>
          </h1>
          <p className="text-slate-500 text-sm">Track deliveries, manage logistics, and orders.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-a7/20 w-64"
            />
          </div>
          <Button variant="primary" className="gap-2 shadow-lg shadow-parami/20" onClick={handleNewOrder}>
            <Plus size={18} /> New Order
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-6 h-full min-w-[1024px]">
          {columns.map(status => (
            <div key={status} className="flex-1 flex flex-col bg-slate-100/50 rounded-2xl border border-slate-200/60 h-full">
              {/* Column Header */}
              <div className="p-3 border-b border-slate-200/60 flex items-center justify-between bg-slate-50/80 rounded-t-2xl backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'PENDING' ? 'bg-amber-400' :
                    status === 'PACKING' ? 'bg-blue-400' :
                    status === 'DELIVERING' ? 'bg-purple-400' : 'bg-emerald-400'
                  }`}></div>
                  <h3 className="font-bold text-slate-700 text-sm">{status}</h3>
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium">
                    {filteredOrders.filter(o => o.status === status).length}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-hide">
                {filteredOrders.filter(o => o.status === status).map(order => (
                  <div 
                    key={order.id} 
                    onClick={() => handleEditClick(order)}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-a7 group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-mono text-xs text-slate-400 block mb-0.5">{order.id}</span>
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{order.customer}</h4>
                      </div>
                      {order.paymentType === 'CASH' ? (
                        <Badge variant="success" className="text-[10px] px-1.5">CASH</Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px] px-1.5">CREDIT</Badge>
                      )}
                    </div>
                    
                    {/* Items Preview */}
                    <div className="mb-3 bg-slate-50 rounded-lg p-2 border border-slate-100">
                      <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1">
                        <ShoppingBag size={10} /> Items ({order.itemsList.length})
                      </div>
                      <div className="space-y-1">
                        {order.itemsList.slice(0, 2).map((item, idx) => (
                           <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                              <span className="truncate max-w-[120px]">{item.name}</span>
                              <span className="text-slate-400">x{item.quantity}</span>
                           </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                      <MapPin size={12} className="shrink-0" />
                      <span className="truncate">{order.address}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                        <Clock size={12} /> {order.deliveryTime}
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{order.total.toLocaleString()} Ks</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit/Create Modal (Structure mostly same, logic simplified via store) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div>
                <h3 className="font-bold text-xl text-slate-800">
                  {editingOrder ? `Edit Order #${editingOrder.id}` : 'Create New Distribution Order'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 {/* Form inputs bound to formData ... */}
                 <div className="space-y-4">
                    <Input label="Customer / Shop Name" value={formData.customer} onChange={(e: any) => setFormData({...formData, customer: e.target.value})} />
                    <Input label="Delivery Address" value={formData.address} onChange={(e: any) => setFormData({...formData, address: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Date" type="date" value={formData.date} onChange={(e: any) => setFormData({...formData, date: e.target.value})} />
                        <Input label="Time" type="time" value={formData.deliveryTime} onChange={(e: any) => setFormData({...formData, deliveryTime: e.target.value})} />
                    </div>
                 </div>
                 <div className="space-y-4">
                     <label className="block text-sm font-medium text-slate-700">Status</label>
                     <select className="w-full border rounded-lg p-2" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})}>
                        <option value="PENDING">PENDING</option>
                        <option value="PACKING">PACKING</option>
                        <option value="DELIVERING">DELIVERING</option>
                        <option value="COMPLETED">COMPLETED</option>
                     </select>
                 </div>
               </div>
               
               {/* Items Table */}
               <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-4 py-2">Item</th>
                            <th className="px-4 py-2">Price</th>
                            <th className="px-4 py-2">Qty</th>
                            <th className="px-4 py-2">Total</th>
                            <th className="px-4 py-2"></th>
                        </tr>
                     </thead>
                     <tbody>
                        {formData.itemsList.map(item => (
                            <tr key={item.id}>
                                <td className="px-4 py-2">{item.name}</td>
                                <td className="px-4 py-2">{item.price}</td>
                                <td className="px-4 py-2">{item.quantity}</td>
                                <td className="px-4 py-2">{(item.price * item.quantity).toLocaleString()}</td>
                                <td className="px-4 py-2"><button onClick={() => handleRemoveItem(item.id)}><X size={16}/></button></td>
                            </tr>
                        ))}
                        <tr className="bg-slate-50/50">
                            <td className="px-4 py-2"><input placeholder="Name" className="border rounded w-full px-2 py-1" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} /></td>
                            <td className="px-4 py-2"><input placeholder="Price" type="number" className="border rounded w-full px-2 py-1" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseInt(e.target.value) || 0})} /></td>
                            <td className="px-4 py-2"><input placeholder="Qty" type="number" className="border rounded w-full px-2 py-1" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})} /></td>
                            <td className="px-4 py-2">{(newItem.price * newItem.quantity).toLocaleString()}</td>
                            <td className="px-4 py-2"><button onClick={handleAddItem}><Plus size={16}/></button></td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between">
                <div>
                  {editingOrder && <Button variant="danger" onClick={handleDeleteOrder}><Trash2 size={16}/> Delete</Button>}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>Save</Button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Distribution;
