import React from 'react';

export const Card = ({ children, className = '', title, action }: { children?: React.ReactNode, className?: string, title?: string, action?: React.ReactNode }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {(title || action) && (
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        {title && <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>}
        {action}
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

export const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const baseStyle = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm focus:outline-none focus:ring-2 focus:ring-offset-1";
  const variants: any = {
    primary: "bg-parami text-white hover:bg-parami-light shadow-lg shadow-parami/30 active:scale-95 focus:ring-parami",
    secondary: "bg-a7 text-white hover:bg-a7-light shadow-lg shadow-a7/30 active:scale-95 focus:ring-a7",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-300",
    ghost: "text-slate-600 hover:bg-slate-100 focus:ring-slate-200",
    danger: "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 focus:ring-red-200",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Badge = ({ children, variant = 'info', className = '' }: { children?: React.ReactNode, variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral', className?: string }) => {
  const styles = {
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    danger: "bg-red-100 text-red-700 border-red-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
    neutral: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Input = ({ label, className = '', containerClassName = '', ...props }: any) => (
  <div className={`w-full ${containerClassName}`}>
    {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
    <input 
      className={`w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-a7/20 focus:border-a7 transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
      {...props}
    />
  </div>
);

export const ProgressBar = ({ value, max = 100, variant = 'info', className = '' }: any) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const colors: any = {
    info: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    parami: 'bg-parami',
  };
  return (
    <div className={`h-2 w-full bg-slate-100 rounded-full overflow-hidden ${className}`}>
      <div className={`h-full ${colors[variant]} transition-all duration-500 ease-out`} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

export const Tabs = ({ tabs, activeTab, onChange, className = '' }: { tabs: { id: string, label: string, count?: number }[], activeTab: string, onChange: (id: string) => void, className?: string }) => (
  <div className={`flex p-1 bg-slate-100 rounded-xl ${className}`}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
          activeTab === tab.id 
            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
        }`}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-slate-100 text-slate-900' : 'bg-slate-200 text-slate-600'}`}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);