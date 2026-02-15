'use client';

import { useState, Suspense } from 'react';
import { createClient } from '../../lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Globe } from 'lucide-react';

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Get redirect URL from query params
  const redirectUrl = searchParams.get('redirect');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: userProfile, error: roleError } = await supabase
            .from('users')
            .select('role')
            .eq('id', authData.user.id)
            .single();

        const role = userProfile?.role;
        
        // If there's a specific redirect URL in params, use it
        if (redirectUrl) {
            window.location.href = redirectUrl;
            return;
        }

        if (role === 'student') {
            setError('Students: Please login at https://skill-spring-ow1g.vercel.app/login');
            await supabase.auth.signOut();
            return;
        } else if (role === 'instructor') {
            setError('Instructors: Please login at https://skill-spring-9fgn.vercel.app/login');
            await supabase.auth.signOut();
            return;
        } else if (role === 'admin') {
            router.push('/admin/dashboard');
        } else {
            setError('Invalid user role');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2 mb-8 cursor-pointer">
          <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 p-2 rounded-xl shadow-lg shadow-violet-200">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 border-b-2 border-violet-600 font-outfit">
            SKILLSPRING
          </span>
        </Link>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
        <p className="mt-3 text-sm font-bold text-slate-400 uppercase tracking-widest">
          Log in to the SkillSpring Portal
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-6 shadow-2xl shadow-violet-900/5 sm:rounded-[3rem] sm:px-12 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full translate-x-1/2 -translate-y-1/2"></div>
          
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-2xl bg-red-50 p-4 border border-red-100 mb-6">
                <p className="text-xs font-bold text-red-600 uppercase tracking-widest text-center">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-violet-600 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium text-slate-900 shadow-sm"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3 ml-1">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-violet-600 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-violet-100 outline-none transition-all font-medium text-slate-900 shadow-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-5 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-lg font-black rounded-2xl shadow-xl shadow-violet-100 hover:brightness-110 transition-all hover:-translate-y-1 active:scale-95 group ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Sign In'}
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs font-black uppercase tracking-widest italic">
                <span className="px-4 bg-white text-slate-400">Security Encrypted</span>
              </div>
            </div>
          </div>
        </div>
        
        <p className="mt-10 text-center text-sm font-bold text-slate-500 uppercase tracking-widest">
          Go back to{' '}
          <Link href="/signup" className="text-violet-600 hover:text-violet-700 underline decoration-2 underline-offset-4">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
