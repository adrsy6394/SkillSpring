import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Define public routes that don't need authentication (if any)
  const publicRoutes = ["/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublicRoute) {
        // Redirect to decentralized login on shell-app
        const currentUrl = window.location.href;
        window.location.href = "https://skill-spring-eight.vercel.app/login?redirect=" + encodeURIComponent(currentUrl);
      }
    }
  }, [user, loading, router.pathname, isPublicRoute]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Verifying access...</p>
      </div>
    );
  }

  // If not logged in and it's not a public route, don't show anything (redirect will trigger)
  if (!user && !isPublicRoute) {
    return null;
  }

  return children;
}
