import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Globe } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function InstructorLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Verify user is an instructor
        const { data: userProfile } = await supabase
          .from('users')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        if (userProfile?.role !== 'instructor') {
          throw new Error('Access denied. This portal is for instructors only.');
        }

        router.push('/instructor');
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
        <Link href="https://skill-spring-nv2s.vercel.app/" className="inline-flex items-center space-x-2 mb-8 cursor-pointer">
          <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 p-2 rounded-xl shadow-lg shadow-violet-200">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 border-b-2 border-violet-600 font-outfit">
            SKILLSPRING
          </span>
        </Link>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Instructor Login</h2>
        <p className="mt-3 text-sm font-bold text-slate-400 uppercase tracking-widest">
          Access Your Teaching Dashboard
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
              <label htmlFor="email" className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 font-semibold"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 font-semibold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-black uppercase tracking-widest rounded-2xl text-white bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200 shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Want to teach on SkillSpring?{' '}
              <Link href="https://skill-spring-nv2s.vercel.app/" className="text-violet-600 hover:text-violet-700 font-black transition-colors">
                Learn More
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
