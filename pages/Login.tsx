
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useBranchStore } from '../store';
import { Button, Input } from '../components/UI';
import { HeartPulse } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@parami.com');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(email);
      
      // Auto-select branch if user is restricted
      const user = useAuthStore.getState().user;
      if (user?.branchId) {
          useBranchStore.getState().setBranch(user.branchId);
      }
      
      navigate('/');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-parami to-parami-dark transform -skew-y-6 origin-top-left translate-y-[-20%] z-0"></div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl z-10 overflow-hidden">
        <div className="p-8 pb-6 text-center">
           <div className="w-16 h-16 bg-gradient-to-br from-parami to-parami-dark rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-6 transform rotate-3 hover:rotate-6 transition-transform">
             <HeartPulse size={32} />
           </div>
           <h1 className="text-2xl font-bold text-slate-800 font-mm">ပါရမီဆေးဆိုင်</h1>
           <p className="text-slate-500 mt-2">Pharmacy System</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-5">
           <Input 
             label="Email Address" 
             type="email" 
             value={email}
             onChange={(e: any) => setEmail(e.target.value)}
             placeholder="Enter your email" 
             className="h-12"
           />
           <Input 
             label="Password" 
             type="password" 
             value="password"
             readOnly
             placeholder="••••••••" 
             className="h-12"
           />
           
           <div className="flex items-center justify-between text-sm">
             <label className="flex items-center gap-2 cursor-pointer">
               <input type="checkbox" className="rounded border-slate-300 text-parami focus:ring-parami" />
               <span className="text-slate-600">Remember me</span>
             </label>
             <a href="#" className="text-parami hover:underline font-medium">Forgot password?</a>
           </div>

           <Button type="submit" variant="primary" className="w-full h-12 text-base shadow-xl shadow-parami/20 mt-4" disabled={loading}>
             {loading ? 'Authenticating...' : 'Sign In'}
           </Button>
        </form>

        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
           <p className="text-xs text-slate-400">© 2024 A7 Corporation. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
