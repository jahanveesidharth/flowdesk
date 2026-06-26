import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Mail, Lock, User, Eye, EyeOff, ArrowRight,
  Map, Zap, Users, BarChart3, Sparkles,
  Armchair, Car, Layers, MapPin
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { DEMO_CREDENTIALS, enterDemoMode } from '../lib/demoMode';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'signup' | 'magic_link' | 'forgot' | 'reset';
type AuthRole = 'employee' | 'admin';
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_PATTERN = /^(?=.*\d).{8,}$/;

export function AuthPage() {
  const navigate = useNavigate();
  const isResetPath = window.location.pathname === '/reset-password';
  const [mode, setMode] = useState<AuthMode>(isResetPath ? 'reset' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [authRole, setAuthRole] = useState<AuthRole>('employee');
  const [adminKey, setAdminKey] = useState('');

  const isSubmittingRef = useRef(false);

  const resetToDemoData = useAppStore(s => s.resetToDemoData);
  const setDemoRole = useAppStore(s => s.setDemoRole);
  const setCurrentUserFromProfile = useAppStore(s => s.setCurrentUserFromProfile);
  const integrations = useAppStore(s => s.integrations);
  const theme = useAppStore(s => s.theme);

  const oktaConnected = integrations?.find(i => i.name === 'Okta SSO')?.connected ?? true;
  const notConfigured = !isSupabaseConfigured();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (notConfigured) return;

    // If already authed and not in reset mode, redirect to dashboard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isSubmittingRef.current) return;
      if (session && mode !== 'reset') {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }: any) => {
            if (profile) {
              setCurrentUserFromProfile(profile as ProfileRow);
              const nextRole = profile.role || 'employee';
              navigate(nextRole === 'admin' || nextRole === 'manager' ? '/admin/dashboard' : '/dashboard');
            }
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isSubmittingRef.current) return;
      if (session) {
        if (event === 'PASSWORD_RECOVERY') {
          setMode('reset');
          navigate('/reset-password');
          return;
        }
        if (mode !== 'reset' && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single() as any;
          if (profile) {
            setCurrentUserFromProfile(profile as ProfileRow);
            const nextRole = profile.role || 'employee';
            navigate(nextRole === 'admin' || nextRole === 'manager' ? '/admin/dashboard' : '/dashboard');
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, setCurrentUserFromProfile, mode, notConfigured]);

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

    if (mode !== 'reset' && !EMAIL_PATTERN.test(trimmedEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if ((mode === 'signup' || mode === 'reset') && !PASSWORD_PATTERN.test(password)) {
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
    isSubmittingRef.current = true;

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
        const userId = data.user?.id;
        if (userId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single() as { data: ProfileRow | null };
          if (profile) {
            const role = profile.role || 'employee';
            
            // Enforce role-toggle restrictions:
            // - If user selected 'Admin' tab: role MUST be 'admin'
            // - If user selected 'Employee' tab: role MUST be 'employee' or 'manager'
            if (authRole === 'admin' && role !== 'admin') {
              await supabase.auth.signOut();
              throw new Error('Access Denied: Only administrators can sign in under the Admin portal.');
            }
            if (authRole === 'employee' && role === 'admin') {
              await supabase.auth.signOut();
              throw new Error('Access Denied: Administrators must sign in under the Admin portal.');
            }
            
            setCurrentUserFromProfile(profile);
            const search = window.location.search;
            navigate(role === 'admin' ? `/admin/dashboard${search}` : `/dashboard${search}`);
            return;
          } else {
            await supabase.auth.signOut();
            throw new Error('Profile not found in system database.');
          }
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success('Password reset email sent!');
        setMode('login');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast.success('Password updated successfully!');

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single() as { data: ProfileRow | null };
          if (profile) {
            setCurrentUserFromProfile(profile);
            const nextRole = profile.role || 'employee';
            navigate(nextRole === 'admin' || nextRole === 'manager' ? '/admin/dashboard' : '/dashboard');
            return;
          }
        }
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message);
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  if (magicSent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 max-w-sm w-full text-center">
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
    <div className="h-screen w-screen bg-gray-50 dark:bg-gray-950 flex overflow-hidden">
      {/* Responsive SVG Clip-Path Definition for Organic Wave Curve */}
      <svg className="absolute w-0 h-0">
        <defs>
          <clipPath id="organic-curve" clipPathUnits="objectBoundingBox">
            <path d="M 1,0 L 0.35,0 C 0.2,0.2 0.05,0.35 0.05,0.5 C 0.05,0.65 0.2,0.8 0.35,1 L 1,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Main split-screen container */}
      <div className="w-full h-full flex overflow-hidden bg-white dark:bg-gray-950">
        {/* Left Side: Custom background image (Illustration, Badges, and Copyright are baked into Background.png) */}
        <div
          className="w-[58%] shrink-0 hidden md:block relative h-full bg-cover bg-left"
          style={{
            backgroundImage: theme === 'dark'
              ? "url('/BackgroundDark.png'), url('/Background.png')"
              : "url('/Background.png')"
          }}
        >
          {/* Dark overlay for dark mode to match theme and make white logo readable */}
          <div className="absolute inset-0 bg-black/0 dark:bg-black/55 transition-colors pointer-events-none z-10" />

          {/* Transparent high-res original SVG logo overlay in the top-left blank area */}
          <div className="absolute top-8 left-8 lg:top-12 lg:left-12 z-20">
            <img
              src={theme === 'dark' ? '/grabdesk light.svg' : '/grabdesk.svg'}
              alt="GrabDesk Logo"
              className="h-10 w-auto"
            />
          </div>
        </div>

        {/* Right Side: Authentication Form Card */}
        <div className="flex-1 h-full flex items-center justify-center p-6 md:p-8 relative z-20 bg-gray-50/20 dark:bg-black/10">
          {/* Main Auth Form Container Card */}
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-xl p-6 sm:p-8 relative flex flex-col pt-10">

            {/* Title / Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {mode === 'login' ? 'Welcome back' :
                  mode === 'signup' ? 'Create account' :
                    mode === 'magic_link' ? 'Sign in with email' :
                      mode === 'forgot' ? 'Reset password' :
                        'Update password'}
              </h2>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 font-semibold">
                {mode === 'login' ? 'Sign in to your GrabDesk workspace' :
                  mode === 'signup' ? 'Get started with GrabDesk for free' :
                    mode === 'magic_link' ? "We'll send you a one-time link" :
                      mode === 'forgot' ? 'Enter your email and we\'ll send a reset link' :
                        'Enter your new password below'}
              </p>
            </div>

            {(mode === 'login' || mode === 'signup') && (
              <div className="grid grid-cols-2 gap-1 bg-gray-100 dark:bg-gray-900 rounded-xl p-1 mb-5">
                {([
                  { value: 'employee', label: 'Employee' },
                  { value: 'admin', label: 'Admin' },
                ] as Array<{ value: AuthRole; label: string }>).map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAuthRole(option.value)}
                    className={`h-9 rounded-lg text-[11px] font-bold transition-all ${authRole === option.value
                        ? 'bg-white dark:bg-gray-800 text-brand-600 shadow-sm'
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
                <div className="bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus-within:border-brand-500 rounded-xl px-4 py-3 flex items-center gap-3">
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

              {mode !== 'reset' && (
                <div className="bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus-within:border-brand-500 rounded-xl px-4 py-3 flex items-center gap-3">
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
              )}

              {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
                <div className="bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus-within:border-brand-500 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'reset' ? 'New Password' : '••••••••'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none text-sm placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-white"
                    required
                    minLength={mode === 'signup' || mode === 'reset' ? 8 : 6}
                    pattern={mode === 'signup' || mode === 'reset' ? PASSWORD_PATTERN.source : undefined}
                    title={mode === 'signup' || mode === 'reset' ? 'Password must be at least 8 characters and include a number.' : undefined}
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
                <div className="bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus-within:border-brand-500 rounded-xl px-4 py-3 flex items-center gap-3">
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
                  {mode === 'login' ? 'Sign in' :
                    mode === 'signup' ? 'Create account' :
                      mode === 'magic_link' ? 'Send magic link' :
                        mode === 'forgot' ? 'Send reset email' :
                          'Update password'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* SSO / Alternative Login Section */}
            {(mode === 'login' || mode === 'signup') && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-150 dark:border-gray-800" /></div>
                  <div className="relative flex justify-center text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 px-3 font-medium">or</div>
                </div>

                <div className="space-y-3">
                  {/* Try Demo Mode Option */}
                  <button
                    type="button"
                    onClick={() => {
                      resetToDemoData();
                      localStorage.setItem('show_demo_mode', 'true');
                      handleDemoLogin(authRole);
                    }}
                    className="w-full bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 hover:dark:bg-brand-950/35 border border-brand-200 dark:border-brand-900/40 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-bold text-brand-600 dark:text-brand-400 transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-4 h-4 shrink-0 text-brand-500 animate-pulse" />
                    <span>Try Demo Mode</span>
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
                      className="w-full bg-brand-200/50 hover:bg-brand-200 dark:bg-brand-900/30 hover:dark:bg-brand-900/50 border border-brand-300 dark:border-brand-800/80 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-bold text-brand-850 dark:text-brand-300 transition-colors shadow-2xs"
                    >
                      <Lock className="w-4 h-4 shrink-0 text-brand-700 dark:text-brand-400" />
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
                  <button type="button" onClick={() => setMode('signup')} className="text-brand-500 font-bold hover:underline">
                    Create account
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setMode('login'); navigate('/login'); }} className="text-brand-500 font-bold hover:underline">
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
