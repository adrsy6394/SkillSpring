import Link from 'next/link';
import { Search, ShoppingCart, Menu, X, Globe, User, BookOpen, LogOut, LayoutDashboard, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/student/courses?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 p-1.5 rounded-lg shadow-lg shadow-violet-200">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 font-inter uppercase">
                SKILL<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500">SPRING</span>
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full group flex items-center bg-gray-50 rounded-full border border-transparent focus-within:border-violet-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100/50 transition-all">
              <div className="pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-3 pr-4 py-2.5 bg-transparent border-none text-sm font-medium text-slate-900 placeholder-slate-400 outline-none"
                placeholder="What do you want to learn?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="mr-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-md shadow-violet-100 transition-all"
              >
                Search
              </button>
            </form>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/student/courses" className="text-sm font-bold text-slate-600 hover:text-violet-600 transition-colors">
              Explore
            </Link>
            
            {user ? (
              <>
                <Link href="/student/dashboard" className="text-sm font-bold text-slate-600 hover:text-violet-600 transition-colors flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link href="/student/profile" className="text-sm font-bold text-slate-600 hover:text-violet-600 transition-colors flex items-center gap-1">
                  <UserCircle className="h-4 w-4" />
                  Profile
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
             <>
               <Link href="https://skill-spring-eight.vercel.app/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
                 Log in
               </Link>
              <Link 
                href="https://skill-spring-eight.vercel.app/signup" 
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-full text-sm font-bold hover:shadow-lg hover:shadow-violet-200 transition-all transform active:scale-95"
              >
                Start Learning
              </Link>
             </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <button className="p-2 text-gray-500">
              <Search className="h-6 w-6" />
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-900"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="px-4 py-6 space-y-4 font-inter">
            <Link href="/student/courses" className="block text-base font-bold text-gray-900 border-b border-gray-50 pb-2">
              Explore Courses
            </Link>
            {user ? (
              <>
                  <Link href="/student/dashboard" className="block text-base font-bold text-gray-900 border-b border-gray-50 pb-2">
                  Dashboard
                </Link>
                  <Link href="/student/profile" className="block text-base font-bold text-gray-900 border-b border-gray-50 pb-2">
                  Profile
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="block w-full text-left text-base font-bold text-red-600 border-b border-gray-50 pb-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="https://skill-spring-eight.vercel.app/login" className="block text-base font-bold text-gray-900 border-b border-gray-50 pb-2">
                  Log in
                </Link>
                <Link 
                  href="https://skill-spring-eight.vercel.app/signup"
                  className="block w-full text-center py-4 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-2xl font-bold shadow-lg shadow-violet-100"
                >
                  Start Learning
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
