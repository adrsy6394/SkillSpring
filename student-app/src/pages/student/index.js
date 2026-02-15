import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function StudentIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/student/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
        <p className="text-slate-600 font-bold">Redirecting to Dashboard...</p>
      </div>
    </div>
  );
}
