import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Mail, Lock, User, Eye, EyeOff, ArrowRight,
  Map, Zap, Users, BarChart3, Sparkles
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { DEMO_CREDENTIALS, enterDemoMode } from '../lib/demoMode';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'signup' | 'magic_link' | 'forgot';
type AuthRole = 'employee' | 'admin';
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_PATTERN = /^(?=.*\d).{8,}$/;

export function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [authRole, setAuthRole] = useState<AuthRole>('employee');
  const [adminKey, setAdminKey] = useState('');
  
  const resetToDemoData = useAppStore(s => s.resetToDemoData);
  const setDemoRole = useAppStore(s => s.setDemoRole);
  const setCurrentUserFromProfile = useAppStore(s => s.setCurrentUserFromProfile);
  const integrations = useAppStore(s => s.integrations);
  const theme = useAppStore(s => s.theme);
  
  const oktaConnected = integrations?.find(i => i.name === 'Okta SSO')?.connected ?? true;
  const notConfigured = !isSupabaseConfigured();

  const handleDemoLogin = (role: AuthRole = authRole) => {
    enterDemoMode();
    setDemoRole(role);
    toast.success(`Demo mode - use ${DEMO_CREDENTIALS.email} / ${DEMO_CREDENTIALS.password}`);
    const search = window.location.search;
    navigate(role === 'admin' ? `/admin/dashboard${search}` : `/dashboard${search}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (mode === 'signup' && !PASSWORD_PATTERN.test(password)) {
      toast.error('Password must be at least 8 characters and include a number.');
      return;
    }

    if (mode === 'signup' && authRole === 'admin') {
      const expectedKey = import.meta.env.VITE_ADMIN_REGISTRATION_KEY || 'GrabDeskAdmin2026';
      if (adminKey.trim() !== expectedKey) {
        toast.error('Invalid Admin Secret Key.');
        return;
      }
    }

    if (notConfigured) { handleDemoLogin(); return; }
    setLoading(true);

    try {
      if (mode === 'magic_link') {
        const { error } = await supabase.auth.signInWithOtp({
          email: trimmedEmail,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        setMagicSent(true);
        toast.success('Magic link sent! Check your inbox.');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail, password,
          options: { data: { name, role: authRole } },
        });
        if (error) throw error;
        toast.success(`${authRole === 'admin' ? 'Admin' : 'Employee'} account created! Check your email to confirm.`);
      } else if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        if (error) throw error;
        let nextRole: AuthRole | 'manager' = authRole;
        const userId = data.user?.id;
        if (userId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single() as { data: ProfileRow | null };
          if (profile) {
            setCurrentUserFromProfile(profile);
            nextRole = profile.role || authRole;
          }
        }
        const search = window.location.search;
        navigate(nextRole === 'admin' || nextRole === 'manager' ? `/admin/dashboard${search}` : `/dashboard${search}`);
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success('Password reset email sent!');
        setMode('login');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (magicSent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#030712] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl border border-gray-100 dark:border-[#1e293b] p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-brand-100 dark:bg-brand-950/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-brand-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your inbox</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            We sent a magic link to <strong>{email}</strong>.<br />
            Click it to sign in — no password needed.
          </p>
          <Button variant="ghost" size="sm" onClick={() => setMagicSent(false)}>
            Use a different email
          </Button>
        </div>
      </div>
    );
  }

  const features = [
    { 
      icon: <Map className="w-4.5 h-4.5 text-brand-500" />, 
      title: 'Interactive floor maps', 
      desc: 'Find and book the perfect spot.' 
    },
    { 
      icon: <Zap className="w-4.5 h-4.5 text-brand-500" />, 
      title: 'One-click booking', 
      desc: 'Book desks, rooms, and parking instantly.' 
    },
    { 
      icon: <Users className="w-4.5 h-4.5 text-brand-500" />, 
      title: 'Team coordination', 
      desc: "See who's in and where your team sits." 
    },
    { 
      icon: <BarChart3 className="w-4.5 h-4.5 text-brand-500" />, 
      title: 'Usage analytics', 
      desc: 'Understand space usage and optimise.' 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#030712] flex items-center justify-center p-4 md:p-8">
      {/* Responsive SVG Clip-Path Definition for Organic Wave Curve */}
      <svg className="absolute w-0 h-0">
        <defs>
          <clipPath id="organic-curve" clipPathUnits="objectBoundingBox">
            <path d="M 1,0 L 0.35,0 C 0.2,0.2 0.05,0.35 0.05,0.5 C 0.05,0.65 0.2,0.8 0.35,1 L 1,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Main card box */}
      <div className="w-full max-w-6xl bg-white dark:bg-[#090f1d] rounded-[24px] border border-gray-150 dark:border-[#1e293b] shadow-2xl overflow-hidden flex min-h-[680px]">
        
        {/* Left Side: Branding & Features (Width: 55%-58%) */}
        <div className="w-[55%] lg:w-[58%] shrink-0 hidden md:flex p-8 lg:p-12 relative z-10 bg-gray-50/50 dark:bg-[#070b14]/50 border-r border-gray-150 dark:border-[#1e293b]">
          
          {/* Content column: constrained to leave space for the wavy image */}
          <div className="w-[54%] lg:w-[52%] flex flex-col justify-between h-full relative z-20">
            {/* Logo & Headline */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img
                  src={theme === 'dark' ? '/grabdesk light.svg' : '/grabdesk.svg'}
                  alt="GrabDesk Logo"
                  className="h-9 w-auto"
                />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50/50 dark:bg-brand-950/10 border border-brand-100/40 dark:border-brand-900/10 text-xs font-semibold text-brand-600 dark:text-brand-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>All-in-one workspace management</span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
                Your office,<br />
                <span className="text-brand-500">perfectly organised.</span>
              </h1>
              
              <p className="text-gray-550 dark:text-gray-400 text-xs font-semibold leading-relaxed">
                Book desks, rooms, and parking in seconds. See where your team sits. Never fight over a hot desk again.
              </p>
            </div>

            {/* Features cards list */}
            <div className="space-y-3">
              {features.map((f, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-4 p-3.5 rounded-2xl bg-white dark:bg-[#131f30]/20 border border-gray-200/50 dark:border-[#202e43]/30 shadow-xs hover:translate-x-1 transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/20 flex items-center justify-center shrink-0">
                    {f.icon}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{f.title}</h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold leading-normal">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-gray-400 dark:text-gray-600 text-xs font-semibold">© 2026 GrabDesk. All rights reserved.</p>
          </div>

          {/* Vertical organic wavy image strip (aligned to absolute right) */}
          <div className="w-[42%] lg:w-[44%] absolute top-0 bottom-0 right-0 overflow-hidden select-none pointer-events-none z-10">
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ 
                clipPath: 'url(#organic-curve)',
                backgroundImage: `url('https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=80')`
              }}
            />
          </div>
        </div>

        {/* Right Side: Authentication Form Card */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-8 relative z-20">
          
          {/* Main Auth Form Container Card */}
          <div className="w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-150 dark:border-[#1e293b] shadow-xl p-8 relative flex flex-col pt-10">
            
            {/* Floating Logo Badge */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-150 dark:border-[#1e293b] shadow-md flex items-center justify-center">
              <img
                src={theme === 'dark' ? '/grabdesk favicon light.svg' : '/grabdesk favicon.svg'}
                alt="GrabDesk Badge"
                className="w-10 h-10 object-contain"
              />
            </div>

            {/* Title / Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {mode === 'login'       ? 'Welcome back'        :
                 mode === 'signup'      ? 'Create account'      :
                 mode === 'magic_link'  ? 'Sign in with email'  :
                 'Reset password'}
              </h2>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 font-semibold">
                {mode === 'login'       ? 'Sign in to your GrabDesk workspace'  :
                 mode === 'signup'      ? 'Get started with GrabDesk for free'  :
                 mode === 'magic_link'  ? "We'll send you a one-time link"      :
                 'Enter your email and we\'ll send a reset link'}
              </p>
            </div>

            {(mode === 'login' || mode === 'signup') && (
              <div className="grid grid-cols-2 gap-1 bg-gray-100 dark:bg-[#090f1d] rounded-xl p-1 mb-5">
                {([
                  { value: 'employee', label: mode === 'signup' ? 'Sign up as Employee' : 'Login as Employee' },
                  { value: 'admin', label: mode === 'signup' ? 'Sign up as Admin' : 'Login as Admin' },
                ] as Array<{ value: AuthRole; label: string }>).map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAuthRole(option.value)}
                    className={`h-9 rounded-lg text-[11px] font-bold transition-all ${
                      authRole === option.value
                        ? 'bg-white dark:bg-[#131f30] text-brand-600 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="bg-gray-50/50 dark:bg-[#090f1d] border border-gray-200 dark:border-[#1e293b] focus-within:border-brand-500 rounded-xl px-4 py-3 flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none text-sm placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              )}

              <div className="bg-gray-50/50 dark:bg-[#090f1d] border border-gray-200 dark:border-[#1e293b] focus-within:border-brand-500 rounded-xl px-4 py-3 flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none text-sm placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {(mode === 'login' || mode === 'signup') && (
                <div className="bg-gray-50/50 dark:bg-[#090f1d] border border-gray-200 dark:border-[#1e293b] focus-within:border-brand-500 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none text-sm placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-white"
                    required
                    minLength={mode === 'signup' ? 8 : 6}
                    pattern={mode === 'signup' ? PASSWORD_PATTERN.source : undefined}
                    title={mode === 'signup' ? 'Password must be at least 8 characters and include a number.' : undefined}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>
                </div>
              )}

              {mode === 'signup' && authRole === 'admin' && (
                <div className="bg-gray-50/50 dark:bg-[#090f1d] border border-gray-200 dark:border-[#1e293b] focus-within:border-brand-500 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="password"
                    placeholder="Admin Secret Key"
                    value={adminKey}
                    onChange={e => setAdminKey(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none text-sm placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => setMode('forgot')} className="text-xs text-brand-500 hover:text-brand-600 font-semibold transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              <Button type="submit" className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-4 shadow-sm" loading={loading}>
                <span>
                  {mode === 'login'       ? 'Sign in'            :
                   mode === 'signup'      ? 'Create account'     :
                   mode === 'magic_link'  ? 'Send magic link'    :
                   'Send reset email'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* SSO / Alternative Login Section */}
            {(mode === 'login' || mode === 'signup') && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-150 dark:border-[#1e293b]" /></div>
                  <div className="relative flex justify-center text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-[#0f172a] px-3 font-medium">or</div>
                </div>

                <div className="space-y-3">
                  {/* Try Demo Option */}
                  <button
                    type="button"
                    onClick={() => handleDemoLogin()}
                    className="w-full bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 hover:dark:bg-brand-950/35 border border-brand-200 dark:border-brand-900/40 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-bold text-brand-600 dark:text-brand-400 transition-colors shadow-2xs"
                  >
                    <User className="w-4 h-4 shrink-0 text-brand-500" />
                    <span>Try Demo Login</span>
                  </button>



                  {/* Okta SSO Option (Conditional) */}
                  {oktaConnected && (
                    <button
                      type="button"
                      onClick={() => {
                        toast.success('Initiating Okta SSO authentication...');
                        setTimeout(() => {
                          handleDemoLogin();
                        }, 1000);
                      }}
                      className="w-full bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-950/20 hover:dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400 transition-colors shadow-2xs"
                    >
                      <Lock className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span>Sign in with Okta SSO</span>
                    </button>
                  )}

                  {/* Magic Link Option */}
                  <button
                    type="button"
                    onClick={() => setMode('magic_link')}
                    className="w-full bg-transparent hover:bg-gray-50 dark:hover:bg-[#090f1d] border border-gray-200 dark:border-[#1e293b] rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors shadow-2xs"
                  >
                    <Mail className="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500" />
                    <span>Continue with magic link</span>
                  </button>
                </div>
              </>
            )}

            {/* Footer switcher */}
            <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
              {mode === 'login' ? (
                <span>
                  New to GrabDesk?{' '}
                  <button onClick={() => setMode('signup')} className="text-brand-500 font-bold hover:underline">
                    Create account
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-brand-500 font-bold hover:underline">
                    Sign in
                  </button>
                </span>
              )}
            </div>

            {/* Form terms footer */}
            <p className="mt-5 text-center text-[10px] text-gray-400 dark:text-gray-500 font-medium">
              By signing in, you agree to our{' '}
              <a href="#" className="underline hover:text-gray-600 dark:hover:text-gray-300">Terms</a> and{' '}
              <a href="#" className="underline hover:text-gray-600 dark:hover:text-gray-300">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
