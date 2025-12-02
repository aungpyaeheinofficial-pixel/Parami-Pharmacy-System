import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, Truck, 
  Users, BarChart3, Settings, LogOut, Menu, Bell, Search,
  ChevronDown, HeartPulse, CreditCard, ShoppingBag,
  Check, ScanLine, Building2, MapPin, X, Loader2
} from 'lucide-react';
import { useAuthStore, useGlobalStore, useBranchStore, useDistributionStore } from '../store';

const NavItem = ({ to, icon: Icon, label, subLabel }: { to: string, icon: any, label: string, subLabel?: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
        isActive 
          ? 'bg-gradient-to-r from-parami to-parami-dark text-white shadow-lg shadow-parami/30' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-a7'
      }`
    }
  >
    <Icon size={20} className="shrink-0 relative z-10" />
    <div className="flex flex-col relative z-10">
      <span className="font-medium text-sm leading-tight">{label}</span>
      {subLabel && <span className={`text-[10px] ${subLabel === 'MM' ? 'font-mm' : 'font-mm'} opacity-80 leading-tight mt-0.5`}>{subLabel}</span>}
    </div>
  </NavLink>
);

export const Sidebar = () => {
  const { isSidebarOpen } = useGlobalStore();
  
  if (!isSidebarOpen) return null;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-20 transition-all duration-300 shadow-xl shadow-slate-200/50">
      <div className="p-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-parami to-parami-dark rounded-xl flex items-center justify-center text-white shadow-lg shadow-parami/30 transform rotate-3">
            <HeartPulse size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight font-mm text-lg">ပါရမီဆေးဆိုင်</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Pharmacy System</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-hide">
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-1">Operations</p>
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" subLabel="ဒက်ရှ်ဘုတ်" />
        <NavItem to="/pos" icon={ShoppingCart} label="Point of Sale" subLabel="အရောင်းကောင်တာ" />
        <NavItem to="/inventory" icon={Package} label="Inventory" subLabel="ကုန်ပစ္စည်းများ" />
        <NavItem to="/expiry" icon={HeartPulse} label="Expiry Center" subLabel="သက်တမ်းကုန်ဆုံးမည့်စာရင်း" />
        
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-6">Management</p>
        <NavItem to="/distribution" icon={Truck} label="Distribution" subLabel="ဖြန့်ချိရေး" />
        <NavItem to="/purchase" icon={ShoppingBag} label="Purchase" subLabel="အဝယ်ပိုင်း" />
        <NavItem to="/finance" icon={CreditCard} label="Finance" subLabel="ငွေစာရင်း" />
        <NavItem to="/customers" icon={Users} label="Customers" subLabel="ဖောက်သည်များ" />
        <NavItem to="/settings" icon={Settings} label="Settings" subLabel="ပြင်ဆင်မှုများ" />

        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-6">Tools</p>
        <NavItem to="/scanner" icon={ScanLine} label="Scanner Utility" subLabel="ဘားကုဒ်စကင်ဖတ်စက်" />
      </div>

      <div className="p-4 bg-slate-50/50 border-t border-slate-100">
        <div className="text-center">
           <p className="text-[10px] text-slate-400 font-medium">Powered by</p>
           <div className="flex items-center justify-center gap-1.5 mt-1">
             <div className="w-2 h-2 bg-a7 rounded-full"></div>
             <span className="font-bold text-slate-700 text-xs">A7 Business Systems</span>
           </div>
        </div>
      </div>
    </aside>
  );
};

export const Header = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useGlobalStore();
  const { branches, currentBranchId, setBranch } = useBranchStore();
  const { allOrders } = useDistributionStore();
  const navigate = useNavigate();
  
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentBranch = branches.find(b => b.id === currentBranchId) || branches[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBranchMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Safety: If current ID is invalid, reset to first available branch
  useEffect(() => {
     if (branches.length > 0 && !branches.find(b => b.id === currentBranchId)) {
         setBranch(branches[0].id);
     }
  }, [branches, currentBranchId, setBranch]);

  // Clear search when closing
  useEffect(() => {
    if (!isBranchMenuOpen) setSearchTerm('');
  }, [isBranchMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  const handleSwitchBranch = (branchId: string, branchName: string) => {
    if (branchId === currentBranchId) {
       setIsBranchMenuOpen(false);
       return;
    }
    
    // Switch immediately without reload for smoother experience
    setIsLoading(true);
    setIsBranchMenuOpen(false);
    
    setTimeout(() => {
        setBranch(branchId);
        setIsLoading(false);
    }, 500);
  };

  const getBranchStats = (branchId: string) => {
     // Calculate stats from allOrders (simulating backend counts)
     const branchOrders = allOrders.filter(o => o.branchId === branchId);
     return {
        pending: branchOrders.filter(o => o.status === 'PENDING').length,
        packing: branchOrders.filter(o => o.status === 'PACKING').length
     };
  };

  const filteredBranches = branches.filter(b => 
    b.status === 'active' &&
    (b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (b.address && b.address.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <>
      {isLoading && (
         <div className="fixed inset-0 z-[2000] bg-white/90 backdrop-blur-sm flex items-center justify-center flex-col animate-in fade-in duration-300">
            <div className="w-16 h-16 border-4 border-parami border-t-transparent rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-bold text-slate-800">Switching Branch...</h3>
            <p className="text-slate-500 mt-2">Loading environment for {branches.find(b => b.id === currentBranchId)?.name}</p>
         </div>
      )}

      {/* Mobile Backdrop */}
      {isBranchMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[900] md:hidden" aria-hidden="true" />
      )}

      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={toggleSidebar} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
            <Menu size={20} />
          </button>
          
          {/* Branch Selector */}
          <div className="relative group" ref={dropdownRef}>
            <button 
              onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
              className={`flex items-center gap-3 px-3 py-1.5 bg-white md:bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition-all select-none ${isBranchMenuOpen ? 'ring-2 ring-a7/20 border-a7' : ''}`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600">
                 <Building2 size={16} />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="hidden md:block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Current Branch</span>
                <span className="font-bold font-mm text-slate-800 text-sm max-w-[140px] md:max-w-xs truncate text-left">{currentBranch?.name || 'Unknown Branch'}</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-200 text-slate-400 ml-1 ${isBranchMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isBranchMenuOpen && (
              <div className="fixed inset-x-0 bottom-0 md:absolute md:top-full md:left-0 md:bottom-auto md:mt-2 w-full md:w-[400px] bg-white md:rounded-xl rounded-t-2xl shadow-2xl border border-slate-100 z-[1000] flex flex-col max-h-[85vh] md:max-h-[600px] overflow-hidden animate-in slide-in-from-bottom-10 md:slide-in-from-top-2 fade-in duration-200">
                
                {/* Dropdown Header */}
                <div className="p-3 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
                   <div className="flex items-center justify-between md:hidden mb-3 px-1">
                      <span className="font-bold text-slate-700">Select Branch</span>
                      <button onClick={() => setIsBranchMenuOpen(false)} className="p-1 bg-slate-200 rounded-full text-slate-600">
                        <X size={16} />
                      </button>
                   </div>
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Search branches..." 
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-a7/20 focus:border-a7 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                   </div>
                </div>

                {/* Branch List */}
                <div className="overflow-y-auto max-h-[400px] scrollbar-hide">
                   <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white sticky top-0 z-10 border-b border-slate-50/50">
                      Active Branches
                   </div>
                   <div className="p-2 space-y-1">
                      {filteredBranches.map(branch => {
                         const stats = getBranchStats(branch.id);
                         const isActive = branch.id === currentBranchId;
                         
                         return (
                            <button
                               key={branch.id}
                               onClick={() => handleSwitchBranch(branch.id, branch.name)}
                               className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all border group relative ${
                                  isActive 
                                    ? 'bg-blue-50/50 border-blue-100 shadow-sm' 
                                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'
                               }`}
                            >
                               {/* Icon / Avatar */}
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                  isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600 group-hover:shadow-sm'
                               }`}>
                                  {isActive ? <Check size={20} /> : <Building2 size={20} />}
                               </div>
                               
                               {/* Content */}
                               <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                     <span className={`font-semibold text-sm truncate ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>
                                        {branch.name}
                                     </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mt-0.5">
                                     <MapPin size={10} className="shrink-0" />
                                     <span className="truncate">{branch.address || 'No address set'}</span>
                                  </div>
                               </div>

                               {/* Badges */}
                               <div className="flex flex-col gap-1 items-end shrink-0">
                                  {stats.pending > 0 && (
                                     <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-full shadow-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                        {stats.pending} Pending
                                     </span>
                                  )}
                                  {stats.packing > 0 && (
                                     <span className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded-full shadow-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                        {stats.packing} Packing
                                     </span>
                                  )}
                               </div>
                            </button>
                         );
                      })}
                      
                      {filteredBranches.length === 0 && (
                        <div className="p-8 text-center text-slate-400">
                           <Building2 size={32} className="mx-auto mb-2 opacity-20" />
                           <p className="text-sm">No branches found</p>
                        </div>
                      )}
                   </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-100 bg-slate-50">
                   <button 
                      onClick={() => { setIsBranchMenuOpen(false); navigate('/settings?tab=branches'); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-slate-600 hover:text-white hover:bg-slate-800 rounded-lg transition-all border border-slate-200 hover:border-slate-800 hover:shadow-lg uppercase tracking-wide"
                   >
                      <Settings size={14} />
                      Manage All Branches
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800 leading-none">{user?.name || 'Guest'}</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">{user?.role || 'Viewer'}</p>
            </div>
            <div className="relative group">
               <button className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden hover:ring-2 hover:ring-parami/20 transition-all">
                 <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} alt="Profile" className="w-full h-full object-cover" />
               </button>
               {/* User Dropdown */}
               <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 hidden group-hover:block hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-slate-50 md:hidden">
                    <p className="font-bold text-slate-800">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.role}</p>
                  </div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                     <LogOut size={16} /> Sign Out
                  </button>
               </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
