
import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, Users, AlertTriangle, ArrowUpRight, ArrowDownRight, Calendar, Filter, RefreshCw, ShoppingCart, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/UI';
import { useProductStore, useTransactionStore, useCustomerStore } from '../store';
import { Transaction } from '../types';

// --- Types & Interfaces ---

interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

interface DashboardMetrics {
  totalSales: number;
  salesGrowth: number;
  lowStockCount: number;
  lowStockChange: number;
  totalCustomers: number;
  customerGrowth: number;
  recentTransactions: Transaction[];
  chartData: any[];
  categoryData: any[];
}

// --- Helper Functions ---

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const getQuickFilterRange = (type: 'today' | 'week' | 'month' | 'year'): DateRange => {
  const end = new Date();
  const start = new Date();
  
  if (type === 'week') {
    start.setDate(end.getDate() - 7);
  } else if (type === 'month') {
    start.setMonth(end.getMonth() - 1);
  } else if (type === 'year') {
    start.setFullYear(end.getFullYear() - 1);
  }
  
  return { start: formatDate(start), end: formatDate(end) };
};

const COLORS = ['#D7000F', '#0060CE', '#F59E0B', '#10B981', '#8B5CF6'];

// --- Components ---

const StatCard = ({ title, value, subValue, trend, trendValue, icon: Icon, colorClass, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
      <Icon size={64} />
    </div>
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-lg ${colorClass} bg-opacity-10 flex items-center justify-center mb-4 text-${colorClass.split('-')[1]}-600`}>
        <Icon size={24} className={colorClass.replace('bg-', 'text-').replace('100', '600')} />
      </div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      {trendValue && (
        <div className="flex items-center mt-2 gap-2">
          <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {trend === 'up' ? <ArrowUpRight size={12} className="mr-1"/> : <ArrowDownRight size={12} className="mr-1"/>}
            {trendValue}
          </span>
          <span className="text-xs text-slate-400">vs previous period</span>
        </div>
      )}
      {subValue && <p className="text-xs text-slate-400 mt-2">{subValue}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { products } = useProductStore();
  const { customers } = useCustomerStore();
  const { transactions, getTransactionsByDateRange } = useTransactionStore();

  // --- State ---
  const [filterType, setFilterType] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [dateRange, setDateRange] = useState<DateRange>(getQuickFilterRange('month'));
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalSales: 0,
    salesGrowth: 0,
    lowStockCount: 0,
    lowStockChange: 0,
    totalCustomers: 0,
    customerGrowth: 0,
    recentTransactions: [],
    chartData: [],
    categoryData: []
  });

  // --- Data Fetching Logic (Simulated API) ---
  const fetchData = () => {
    setLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      // 1. Transactions Logic
      const currentPeriodTrans = getTransactionsByDateRange(dateRange.start, dateRange.end);
      
      // Calculate Previous Period for Comparison
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      const duration = end.getTime() - start.getTime();
      const prevEnd = new Date(start.getTime() - 86400000); // 1 day before start
      const prevStart = new Date(prevEnd.getTime() - duration);
      const prevPeriodTrans = getTransactionsByDateRange(formatDate(prevStart), formatDate(prevEnd));

      // 2. Metrics Calculation
      const currentSales = currentPeriodTrans
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

      const prevSales = prevPeriodTrans
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

      const salesGrowth = prevSales === 0 ? 100 : ((currentSales - prevSales) / prevSales) * 100;

      // 3. Low Stock Logic
      const lowStockItems = products.filter(p => p.stockLevel <= p.minStockLevel).length;
      
      // 4. Chart Data Aggregation (Revenue)
      // Group by date
      const salesByDate: Record<string, number> = {};
      const datesInRange: string[] = [];
      let iterDate = new Date(start);
      while(iterDate <= end) {
        datesInRange.push(formatDate(iterDate));
        iterDate.setDate(iterDate.getDate() + 1);
      }

      // Initialize map
      datesInRange.forEach(d => salesByDate[d] = 0);

      // Fill map
      currentPeriodTrans
        .filter(t => t.type === 'INCOME')
        .forEach(t => {
          if (salesByDate[t.date] !== undefined) {
             salesByDate[t.date] += t.amount;
          }
        });

      // Convert to array
      const chartData = Object.keys(salesByDate).map(date => ({
        name: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        date: date,
        revenue: salesByDate[date]
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // 5. Category Aggregation
      const salesByCategory: Record<string, number> = {};
      currentPeriodTrans
        .filter(t => t.type === 'INCOME')
        .forEach(t => {
           salesByCategory[t.category] = (salesByCategory[t.category] || 0) + t.amount;
        });
      
      const categoryData = Object.keys(salesByCategory)
        .map(cat => ({ name: cat, value: salesByCategory[cat] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5

      setMetrics({
        totalSales: currentSales,
        salesGrowth: salesGrowth,
        lowStockCount: lowStockItems,
        lowStockChange: 0, // Mock change
        totalCustomers: customers.length,
        customerGrowth: 1.2, // Mock growth
        recentTransactions: currentPeriodTrans.slice(0, 5),
        chartData,
        categoryData
      });

      setLastUpdated(new Date());
      setLoading(false);
    }, 600);
  };

  // --- Effects ---
  useEffect(() => {
    fetchData();
    // Real-time polling every 30s
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [dateRange, transactions, products, customers]); // Re-fetch when params or store data changes

  // Handle quick filter change
  const handleQuickFilter = (type: 'today' | 'week' | 'month' | 'year') => {
    setFilterType(type);
    setDateRange(getQuickFilterRange(type));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* --- Filter Header --- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            Real-time business analytics
            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-400">
               Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 items-center">
           <div className="flex bg-slate-100 p-1 rounded-lg">
              {(['today', 'week', 'month', 'year'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => handleQuickFilter(type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                    filterType === type 
                      ? 'bg-parami text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  {type}
                </button>
              ))}
           </div>

           <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>

           <div className="flex items-center gap-2">
              <div className="relative">
                 <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input 
                   type="date" 
                   value={dateRange.start}
                   onChange={(e) => {
                     setFilterType('today'); // Custom
                     setDateRange(prev => ({ ...prev, start: e.target.value }));
                   }}
                   className="pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-a7 w-32"
                 />
              </div>
              <span className="text-slate-400">-</span>
              <div className="relative">
                 <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input 
                   type="date" 
                   value={dateRange.end}
                   onChange={(e) => {
                     setFilterType('today'); // Custom
                     setDateRange(prev => ({ ...prev, end: e.target.value }));
                   }}
                   className="pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-a7 w-32"
                 />
              </div>
           </div>

           <Button variant="outline" onClick={fetchData} disabled={loading} className="px-3">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
           </Button>
        </div>
      </div>

      {/* --- Key Metrics --- */}
      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>)}
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={`${metrics.totalSales.toLocaleString()} MMK`} 
            trend={metrics.salesGrowth >= 0 ? 'up' : 'down'} 
            trendValue={`${Math.abs(metrics.salesGrowth).toFixed(1)}%`} 
            icon={TrendingUp} 
            colorClass="bg-emerald-100" 
          />
          <StatCard 
            title="Low Stock Items" 
            value={metrics.lowStockCount} 
            subValue="Requires immediate attention"
            trend="down" 
            icon={AlertTriangle} 
            colorClass="bg-amber-100"
            onClick={() => navigate('/inventory?filter=low_stock')}
          />
          <StatCard 
            title="Total Customers" 
            value={metrics.totalCustomers.toLocaleString()} 
            trend="up" 
            trendValue="+1.2%" 
            icon={Users} 
            colorClass="bg-purple-100" 
            onClick={() => navigate('/customers')}
          />
        </div>
      )}

      {/* --- Charts Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2" title="Revenue Analytics">
          <div className="h-[300px] w-full mt-4">
            {metrics.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D7000F" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#D7000F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} minTickGap={30} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()} MMK`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#D7000F', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#D7000F" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-slate-400 flex-col">
                  <Activity size={32} className="opacity-20 mb-2" />
                  <p>No revenue data for selected period</p>
               </div>
            )}
          </div>
        </Card>

        {/* Top Categories */}
        <Card title="Top Selling Categories">
          <div className="mt-2 h-[320px]">
            {metrics.categoryData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={metrics.categoryData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11, fill: '#64748b'}} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`${value.toLocaleString()} Ks`, 'Sales']}
                    />
                    <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                      {metrics.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                 </BarChart>
               </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-slate-400 flex-col">
                  <ShoppingCart size={32} className="opacity-20 mb-2" />
                  <p>No category data available</p>
               </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* --- Recent Transactions Table --- */}
      <Card title="Recent Transactions">
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 text-slate-500">
               <tr>
                 <th className="px-6 py-3 font-medium">Transaction ID</th>
                 <th className="px-6 py-3 font-medium">Description</th>
                 <th className="px-6 py-3 font-medium">Date</th>
                 <th className="px-6 py-3 font-medium">Amount</th>
                 <th className="px-6 py-3 font-medium">Category</th>
                 <th className="px-6 py-3 font-medium text-right">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {metrics.recentTransactions.length > 0 ? (
                 metrics.recentTransactions.map((t) => (
                   <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                     <td className="px-6 py-4 font-mono text-slate-600 text-xs">#{t.id}</td>
                     <td className="px-6 py-4 font-medium text-slate-900">{t.description}</td>
                     <td className="px-6 py-4 text-slate-600">{t.date}</td>
                     <td className={`px-6 py-4 font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                       {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()} Ks
                     </td>
                     <td className="px-6 py-4">
                       <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-semibold border border-slate-200">
                         {t.category}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                       <button className="text-a7 hover:underline text-xs">Details</button>
                     </td>
                   </tr>
                 ))
               ) : (
                 <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                       No transactions found in this period.
                    </td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
         <div className="p-4 border-t border-slate-100 text-center">
            <Button variant="ghost" onClick={() => navigate('/finance')} className="text-sm">View All Financial Records</Button>
         </div>
      </Card>
    </div>
  );
};

export default Dashboard;
