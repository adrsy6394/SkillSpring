'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Mail, Lock, ArrowRight, Globe, User, Shield, BookOpen } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setRole = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            full_name: formData.fullName,
            email: formData.email,
            role: formData.role,
          });

        if (dbError) throw dbError;
        router.push('/login?message=Account created successfully!');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-inter overflow-hidden">
      {/* Left Side - Visual Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 to-fuchsia-600 relative overflow-hidden items-center justify-center p-20">
         <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
         </div>
         
         <div className="relative z-10 max-w-lg text-white">
            <a href="/" className="inline-flex items-center space-x-2 mb-16 cursor-pointer">
              <div className="bg-white p-2 rounded-xl">
                <Globe className="h-8 w-8 text-violet-600" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-outfit">SkillSpring</span>
            </a>
            
            <h2 className="text-5xl font-black mb-10 leading-tight">Join the Elite Network of Learners.</h2>
            
            <div className="space-y-8">
               <div className="flex items-start space-x-6">
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                     <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl mb-1">Encrypted Access</h3>
                    <p className="text-violet-100 opacity-80 text-sm">Enterprise-grade security for your data and learning history.</p>
                  </div>
               </div>
               <div className="flex items-start space-x-6">
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                     <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl mb-1">Centralized Admin</h3>
                    <p className="text-violet-100 opacity-80 text-sm">Manage entire learning ecosystems from a single interface.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-24 bg-white overflow-y-auto relative">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden mb-12 text-center">
             <a href="/" className="inline-flex items-center space-x-2 justify-center cursor-pointer">
               <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
                 <Globe className="h-6 w-6 text-white" />
               </div>
               <span className="text-xl font-black text-slate-900 border-b-2 border-indigo-600 font-outfit">SkillSpring</span>
             </a>
          </div>

          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Create Student Account</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-10">Start your learning journey with SkillSpring</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-2xl bg-red-50 p-4 border border-red-100 mb-6 font-bold text-red-600 text-xs text-center uppercase tracking-widest">
                {error}
              </div>
            )}

            {/* Role is hardcoded to student as per requirement */}
            <input type="hidden" name="role" value="student" />

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-violet-600 transition-colors" />
                </div>
                <input
                  name="fullName"
                  type="text"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium text-slate-900 shadow-sm"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-violet-600 transition-colors" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium text-slate-900 shadow-sm"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-violet-600 transition-colors" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium text-slate-900 shadow-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-lg font-black rounded-2xl shadow-2xl shadow-violet-100 hover:brightness-110 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center group ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating...' : 'Get Started'}
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-12 text-center text-sm font-bold text-slate-500 uppercase tracking-widest">
            Already have access?{' '}
            <Link href="/login" className="text-violet-600 hover:text-violet-700 underline decoration-2 underline-offset-4">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
