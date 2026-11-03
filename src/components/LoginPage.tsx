import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Mail,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, loginAsDemo, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoLogin = async () => {
    setError(null);
    setIsDemoLoading(true);
    try {
      const res = await loginAsDemo();
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Failed to authenticate demo account. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error occurred during demo sign in.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await login(email, password);
        if (res.success) {
          if (onSuccess) onSuccess();
        } else {
          setError(res.error || 'Invalid email or password. Please verify credentials.');
        }
      } else {
        const res = await register(name, email, password);
        if (res.success) {
          if (onSuccess) onSuccess();
        } else {
          setError(res.error || 'Failed to create account. Please try another email.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Network error occurred. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-indigo-50/40 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Brand Bar */}
      <header className="w-full border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/image_e94e150e.png"
              alt="Vyakta AI Logo"
              className="w-9 h-9 object-contain rounded-xl border border-stone-200/80 bg-white shadow-xs p-0.5"
            />
            <div>
              <span className="font-bold text-base text-stone-900 tracking-tight block leading-tight">
                Vyakta AI
              </span>
              <span className="text-[10px] text-stone-500 font-medium tracking-wide uppercase">
                Enterprise Brand Governance
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Secure System Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Content: Split / Responsive Hero & Auth Panel */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Brand Context & Governance Pillars (Visible on Desktop & Tablet) */}
          <div className="lg:col-span-6 space-y-6 lg:pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Round 3 Brand Governance Release</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                Factual Brand Governance & Semantic Content Auditing
              </h1>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                Ensure marketing, product, and enterprise copy adheres strictly to approved guidelines, 
                eliminating fabricated numbers, unverified claims, and brand voice drift.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Zero Fabricated Claims</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-normal">
                  Strict numerical guardrails prevent unverified metrics or inflated stats.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs mb-1">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span>Evidence Fact Library</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-normal">
                  Cross-verify copy against approved corporate benchmarks and cited sources.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs mb-1">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Dual-Engine Validation</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-normal">
                  Combines deterministic phrase rules with Google Gemini semantic reasoning.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs mb-1">
                  <FileCheck2 className="w-4 h-4 text-indigo-600" />
                  <span>Audit Trail & PDF Report</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-normal">
                  Download immutable compliance records with reviewer sign-offs.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-stone-200/90 overflow-hidden">
              
              {/* Card Header */}
              <div className="p-6 pb-4 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Sign in to Vyakta AI</h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Authorized reviewer and editorial governance access
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
              </div>

              {/* Prominent Demo Account Section */}
              <div className="p-6 bg-gradient-to-br from-indigo-50/80 via-white to-emerald-50/40 border-b border-stone-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-indigo-900 tracking-wider uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    Demo Account Credentials
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-100/70 text-indigo-800">
                    Pre-Configured
                  </span>
                </div>

                {/* Credentials Display Box */}
                <div className="bg-white/95 rounded-xl border border-indigo-100/90 p-3.5 shadow-2xs space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-medium">Email:</span>
                    <span className="font-mono font-semibold text-stone-900 select-all bg-stone-50 px-2 py-0.5 rounded border border-stone-200/60">
                      demo@vyaktaai.com
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-medium">Password:</span>
                    <span className="font-mono font-semibold text-indigo-700 select-all bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100">
                      VyaktaDemo@2026
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-stone-100 text-[11px]">
                    <span className="text-stone-500">Access Level:</span>
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Editorial Reviewer (Full Workspace)
                    </span>
                  </div>
                </div>

                {/* Prominent "Login as Demo" Button */}
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isDemoLoading || loading}
                  className="mt-3.5 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  <KeyRound className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{isDemoLoading ? 'Authenticating Demo Session...' : 'Login as Demo'}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              {/* Navigation Tabs: Manual Sign In & Create Account */}
              <div className="px-6 pt-4 flex gap-4 border-b border-stone-100 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setError(null);
                  }}
                  className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                    tab === 'login'
                      ? 'border-stone-900 text-stone-900 font-semibold'
                      : 'border-transparent text-stone-500 hover:text-stone-700'
                  }`}
                >
                  Manual Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setError(null);
                  }}
                  className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                    tab === 'register'
                      ? 'border-stone-900 text-stone-900 font-semibold'
                      : 'border-transparent text-stone-500 hover:text-stone-700'
                  }`}
                >
                  Create New Account
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {tab === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="reviewer@company.com"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || isDemoLoading}
                  className="w-full mt-2 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-stone-50 text-xs font-medium rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : tab === 'login' ? (
                    <>
                      <span>Sign In to Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Create Account & Start</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Card Footer */}
              <div className="px-6 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span>Enterprise Brand Protection</span>
                <span className="font-mono text-stone-400">v3.2 Secure</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-stone-200/80 bg-white/60 py-3 text-center text-xs text-stone-500">
        <p>© 2026 Vyakta AI. All rights reserved. Persistent SQLite governance & policy engine.</p>
      </footer>
    </div>
  );
};
