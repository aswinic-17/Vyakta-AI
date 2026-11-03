import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Sliders,
  FileText,
  BarChart3,
  History,
  Database,
} from 'lucide-react';
import { BrandPreset, ReviewDecision, ValidationReport } from '../types';
import { useAuth } from '../context/AuthContext';

export type NavView = 'submit' | 'review' | 'evidence' | 'guidelines' | 'analytics' | 'audit';

interface NavbarProps {
  currentBrand: BrandPreset;
  brands: BrandPreset[];
  onSelectBrand: (brand: BrandPreset) => void;
  onOpenCreateBrandModal: () => void;
  activeView: NavView;
  onChangeView: (view: NavView) => void;
  decision: ReviewDecision;
  onOpenDownloadModal?: () => void;
  onOpenAuthModal?: () => void;
  report: ValidationReport | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentBrand,
  brands,
  onSelectBrand,
  onOpenCreateBrandModal,
  activeView,
  onChangeView,
  decision,
  onOpenDownloadModal,
  onOpenAuthModal,
  report,
}) => {
  const { user, logout } = useAuth();

  const navItems: Array<{
    id: NavView;
    label: string;
    shortLabel: string;
    icon: React.FC<{ className?: string }>;
  }> = [
    { id: 'submit', label: 'Submit Copy', shortLabel: 'Submit', icon: FileText },
    { id: 'review', label: 'Review Space', shortLabel: 'Review', icon: Sliders },
    { id: 'evidence', label: 'Evidence Library', shortLabel: 'Evidence', icon: Database },
    { id: 'guidelines', label: 'Guidelines', shortLabel: 'Guidelines', icon: Sliders },
    { id: 'analytics', label: 'Analytics', shortLabel: 'Analytics', icon: BarChart3 },
    { id: 'audit', label: 'Audit Trail', shortLabel: 'Audit', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-md">
      {/* Title Bar (Row 1) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onChangeView('submit')}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity text-left cursor-pointer group shrink-0"
            title="Vyakta AI - Go to Content Submission"
          >
            <img
              src="/assets/aistudio/image_e94e150e.png"
              alt="Vyakta AI Logo"
              className="w-9 h-9 object-contain rounded-xl border border-stone-200/80 bg-white shadow-xs p-0.5 group-hover:border-indigo-300 transition-colors"
            />
            <div>
              <span className="font-bold text-base text-stone-900 tracking-tight block leading-tight shrink-0">
                Vyakta AI
              </span>
              <span className="text-[10px] text-stone-500 font-medium tracking-wide uppercase hidden sm:block">
                Enterprise Brand Governance
              </span>
            </div>
          </button>
        </div>

        {/* Right Actions: Brand Switcher, User Profile / Demo Badge & Decision */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
          {/* Brand Switcher */}
          <div className="flex items-center bg-stone-100/80 rounded-xl p-1 border border-stone-200/80 text-xs shadow-xs shrink-0 whitespace-nowrap">
            <span className="text-stone-500 px-2 font-medium hidden sm:inline whitespace-nowrap">
              Brand:
            </span>
            <select
              value={currentBrand.id}
              onChange={(e) => {
                if (e.target.value === '__add_new__') {
                  onOpenCreateBrandModal();
                } else {
                  const found = brands.find((b) => b.id === e.target.value);
                  if (found) onSelectBrand(found);
                }
              }}
              className="bg-white text-stone-800 text-xs font-medium rounded-lg px-2.5 py-1.5 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer shadow-xs max-w-[125px] sm:max-w-[155px] truncate"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
              <option value="__add_new__">+ Add Any Brand...</option>
            </select>
          </div>

          {/* User Account / Demo Profile Pill */}
          {user && (
            <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl p-1 gap-1.5 text-xs shrink-0">
              <div
                className="flex items-center gap-1.5 px-2 py-1 text-stone-700"
                title={`Logged in as ${user.name} (${user.email})`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-stone-800 truncate max-w-[120px] hidden md:inline">
                  {user.email === 'demo@vyaktaai.com' ? 'Demo Reviewer' : user.name}
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-stone-200 text-stone-700 text-[10px] font-mono">
                  {user.role}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1 px-2 py-1 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer text-xs font-medium"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}

          {/* Decision Status Badge */}
          {decision.status === 'approved' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Approved</span>
            </span>
          ) : decision.status === 'rejected' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Rejected</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Pending</span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation Row Under Title Bar */}
      <div className="border-t border-stone-200/80 bg-stone-50/90 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-start gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
