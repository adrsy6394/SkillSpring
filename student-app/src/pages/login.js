import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

export default function LoginRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // If already logged in, just go to dashboard
      router.push('/student/dashboard');
      return;
    }

    // Otherwise redirect to central login portal
    const dashboardUrl = 'http://localhost:3003/student/dashboard';
    const params = new URLSearchParams(window.location.search);
    const customRedirect = params.get('redirect');
    
    // If we have a custom redirect, use it, otherwise default to dashboard
    const finalRedirect = customRedirect || dashboardUrl;
    
    window.location.href = `http://localhost:3001/login?redirect=${encodeURIComponent(finalRedirect)}`;
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Redirecting to Secure Login...</p>
      </div>
    </div>
  );
}
