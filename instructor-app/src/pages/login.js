import { useEffect } from 'react';

export default function LoginRedirect() {
  useEffect(() => {
    const dashboardUrl = 'https://skill-spring-9fgn.vercel.app/instructor';
    const params = new URLSearchParams(window.location.search);
    const customRedirect = params.get('redirect');
    
    const finalRedirect = customRedirect || dashboardUrl;
    window.location.href = `https://skill-spring-eight.vercel.app/login?redirect=${encodeURIComponent(finalRedirect)}`;
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Redirecting to Secure Login...</p>
      </div>
    </div>
  );
}
