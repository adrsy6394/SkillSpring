'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StudentDashboard() {
  const { user, role, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-violet-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          <p className="text-violet-600 font-medium animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 py-10 text-white">
            <h1 className="text-3xl font-extrabold tracking-tight">Student Dashboard</h1>
            <p className="mt-2 text-violet-50 opacity-90">Manage your learning journey and courses.</p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Name: <span className="font-medium text-gray-900">{user?.user_metadata?.full_name || 'N/A'}</span></p>
                  <p className="text-sm text-gray-600">Email: <span className="font-medium text-gray-900">{user?.email}</span></p>
                  <p className="text-sm text-gray-600 italic">Role: <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500 font-bold uppercase">{role}</span></p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                <div className="h-16 w-16 bg-violet-100 rounded-full flex items-center justify-center mb-4 text-violet-600">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900">Welcome Back!</h3>
                <p className="text-sm text-gray-500 mt-1">You're logged in to the student portal.</p>
              </div>
            </div>

            <div className="mt-10 border-t border-gray-100 pt-8 flex justify-end">
              <button
                onClick={signOut}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 shadow-lg transform transition hover:scale-105 active:scale-95"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
