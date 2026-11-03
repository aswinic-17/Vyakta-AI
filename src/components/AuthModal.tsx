import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, loginAsDemo, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    const res = await loginAsDemo();
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to login with demo credentials');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (tab === 'login') {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Invalid email or password');
      }
    } else {
      const res = await register(name, email, password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to register account');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-stone-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Vyakta AI Governance Access</h2>
              <p className="text-xs text-stone-500">Sign in to review and govern brand content</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Highlighted Official Demo Credentials Card */}
        <div className="p-6 bg-gradient-to-br from-indigo-50/70 via-stone-50 to-emerald-50/50 border-b border-stone-200/80">
          <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-indigo-100 space-y-1.5 text-xs text-stone-700 font-mono shadow-xs">
            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-sans">Email:</span>
              <span className="font-semibold text-stone-900 select-all">demo@vyaktaai.com</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-sans">Password:</span>
              <span className="font-semibold text-indigo-700 select-all">VyaktaDemo@2026</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-stone-100 text-[10px] text-stone-500 font-sans">
              <span>Role: Editorial Reviewer</span>
              <span className="text-emerald-700 font-medium">✓ Full Workspace Access</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="mt-3 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{loading ? 'Authenticating...' : 'Login as Demo'}</span>
          </button>
        </div>

        {/* Manual Tab Navigation */}
        <div className="px-6 pt-4 flex gap-4 border-b border-stone-100 text-xs font-medium">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`pb-2.5 border-b-2 transition-colors ${
              tab === 'login'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            Manual Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`pb-2.5 border-b-2 transition-colors ${
              tab === 'register'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2 px-4 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : tab === 'login' ? 'Sign In to Workspace' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
