import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'signup' | 'magic_link' | 'forgot';

export function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const notConfigured = !isSupabaseConfigured();

  const handleDemoLogin = () => {
    localStorage.setItem('flowdesk_demo_logged_in', 'true');
    toast.success('Demo mode — using mock data');
    navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (notConfigured) { handleDemoLogin(); return; }
    setLoading(true);

    try {
      if (mode === 'magic_link') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        setMagicSent(true);
        toast.success('Magic link sent! Check your inbox.');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { name } },
        });
        if (error) throw error;
        toast.success('Account created! Check your email to confirm.');
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
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
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-brand-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
          <p className="text-gray-500 text-sm mb-4">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-blue-50 flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gray-950 text-white p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">DeskFlow</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Your office,<br />
            <span className="text-brand-400">perfectly organised.</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Book desks, rooms, and parking in seconds. See where your team sits. Never fight over a hot desk again.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🗺', text: 'Interactive floor maps' },
              { icon: '⚡', text: 'One-click booking' },
              { icon: '👥', text: 'Team coordination' },
              { icon: '📊', text: 'Usage analytics' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                <span className="text-xl">{f.icon}</span>
                <span className="text-sm text-gray-300">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-gray-600 text-sm">© 2026 DeskFlow. All rights reserved.</p>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">DeskFlow</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {/* Demo mode banner */}
            {notConfigured && (
              <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                <strong>Demo mode</strong> — Supabase not configured. Any credentials will log you into the demo.
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {mode === 'login'       ? 'Welcome back'      :
               mode === 'signup'      ? 'Create your account' :
               mode === 'magic_link'  ? 'Sign in with email' :
               'Reset password'}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {mode === 'login'       ? 'Sign in to your DeskFlow workspace'    :
               mode === 'signup'      ? 'Get started with DeskFlow for free'    :
               mode === 'magic_link'  ? 'We\'ll send you a one-time link'       :
               'Enter your email and we\'ll send a reset link'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <Input
                  label="Full Name"
                  placeholder="Lisa Chen"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  iconLeft={<User className="w-4 h-4" />}
                  required
                />
              )}

              <Input
                label="Email"
                type="email"
                placeholder="lisa@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                iconLeft={<Mail className="w-4 h-4" />}
                required
              />

              {(mode === 'login' || mode === 'signup') && (
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  iconLeft={<Lock className="w-4 h-4" />}
                  iconRight={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  required
                  minLength={6}
                />
              )}

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => setMode('forgot')} className="text-xs text-brand-600 hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              <Button type="submit" className="w-full h-10" loading={loading} iconRight={<ArrowRight className="w-4 h-4" />}>
                {mode === 'login'       ? 'Sign in'            :
                 mode === 'signup'      ? 'Create account'     :
                 mode === 'magic_link'  ? 'Send magic link'    :
                 'Send reset email'}
              </Button>
            </form>

            {(mode === 'login' || mode === 'signup') && (
              <>
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or</div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  iconLeft={<Mail className="w-4 h-4" />}
                  onClick={() => setMode('magic_link')}
                >
                  Continue with magic link
                </Button>
              </>
            )}

            <div className="mt-5 text-center text-sm">
              {mode === 'login' ? (
                <span className="text-gray-500">
                  No account?{' '}
                  <button onClick={() => setMode('signup')} className="text-brand-600 font-medium hover:underline">
                    Sign up free
                  </button>
                </span>
              ) : (
                <span className="text-gray-500">
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-brand-600 font-medium hover:underline">
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            By signing in, you agree to our{' '}
            <a href="#" className="underline">Terms</a> and{' '}
            <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
