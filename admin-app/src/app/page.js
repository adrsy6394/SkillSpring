import Link from 'next/link';
import { ArrowRight, BookOpen, Globe, Shield, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 p-4 rounded-3xl shadow-2xl shadow-violet-200 animate-bounce">
              <Globe className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 sm:text-7xl font-outfit uppercase">
            Access <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500">SkillSpring</span>
          </h1>
          <p className="mt-8 text-lg font-bold leading-8 text-slate-500 uppercase tracking-widest max-w-md mx-auto">
            The professional suite for students and administrators.
          </p>
          <div className="mt-12 flex items-center justify-center gap-x-6">
            <Link href="/login" className="px-8 py-5 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-lg font-black rounded-2xl shadow-2xl shadow-violet-200 hover:brightness-110 hover:-translate-y-1 active:scale-95 transition-all flex items-center group">
              Get started
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
