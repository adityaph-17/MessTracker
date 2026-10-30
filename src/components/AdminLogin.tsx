import React, { useState } from 'react';
import { dbService } from '../services/db';
import { AdminAuthSession } from '../types';
import {
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface AdminLoginProps {
  onSuccess: (admin: AdminAuthSession) => void;
  onSwitchToStudent?: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onSuccess,
  onSwitchToStudent,
  isModal = false,
  onClose,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = dbService.loginAdmin(username, password);
    if (result.success) {
      setSuccessMsg(`Welcome back, ${result.admin.name}! Accessing Mess Admin Console...`);
      setTimeout(() => {
        onSuccess(result.admin);
        if (onClose) onClose();
      }, 500);
    } else {
      setErrorMsg(result.error);
    }
  };

  const handleQuickDemo = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  return (
    <div
      className={
        isModal
          ? 'fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150'
          : 'w-full max-w-lg mx-auto animate-in fade-in duration-150'
      }
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider mb-2 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Mess Administration</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Admin Mess Login</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Access kitchen management, tomorrow&apos;s forecast &amp; meal capacity controls.
            </p>
          </div>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        {/* Feedback banners */}
        {errorMsg && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-900 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="font-medium">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="font-medium">{successMsg}</div>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleLogin} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin', 'admin@123')}
                className="text-[11px] font-semibold text-amber-600 hover:underline"
              >
                Use default: admin@123
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Building2 className="w-4 h-4" />
            <span>Log In to Admin Portal</span>
          </button>

          {/* Quick Demo Login Preset matching student login */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Default Admin Credentials:
            </span>
            <div
              onClick={() => handleQuickDemo('admin', 'admin@123')}
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <span className="font-bold block text-slate-900 text-xs">
                  Mess Supervisor &amp; Kitchen Authority
                </span>
                <span className="text-slate-500 text-[11px]">
                  Username: <strong className="text-slate-800 font-mono">admin</strong> · Password:{' '}
                  <strong className="text-slate-800 font-mono">admin@123</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickDemo('admin', 'admin@123');
                }}
                className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 text-white rounded-lg shadow-2xs group-hover:bg-amber-700 transition-colors shrink-0"
              >
                Autofill
              </button>
            </div>
          </div>

          {/* Role navigation helper */}
          {onSwitchToStudent && (
            <div className="pt-2 text-center border-t border-slate-100 mt-3">
              <button
                type="button"
                onClick={onSwitchToStudent}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-700 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Student Dining Terminal</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

