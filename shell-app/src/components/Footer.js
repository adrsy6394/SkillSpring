import Link from 'next/link';
import { Globe, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-20 font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 text-white mb-6">
              <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 p-1.5 rounded-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight uppercase">
                SKILL<span className="text-violet-400">SPRING</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              The next-generation learning platform designed to bridge the gap between knowledge and achievement. 
            </p>
            <div className="flex space-x-4">
              <Twitter className="h-5 w-5 hover:text-white cursor-pointer transition-colors" />
              <Github className="h-5 w-5 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h3 className="text-white font-bold mb-6">Platform</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/courses" className="hover:text-violet-400 transition-colors">All Courses</Link></li>
              <li><Link href="#" className="hover:text-violet-400 transition-colors">Become an Instructor</Link></li>
              <li><Link href="#" className="hover:text-violet-400 transition-colors">Enterprise Solutions</Link></li>
              <li><Link href="#" className="hover:text-violet-400 transition-colors">Certification Pathways</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h3 className="text-white font-bold mb-6">Company</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="#" className="hover:text-white transition-colors">About SkillSpring</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Impact & Mission</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Press & Media</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-6">Stay Inspired</h3>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Email address"
                className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 transition-all outline-none"
              />
              <button className="absolute right-2 top-2 p-1.5 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-lg group hover:brightness-110 transition-all">
                <Mail className="h-4 w-4 text-white" />
              </button>
            </div>
            <p className="mt-4 text-xs">Join 50k+ learners receiving weekly growth tips.</p>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest">
          <p>© 2026 SkillSpring. All rights reserved.</p>
          <div className="flex space-x-8">
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <Link href="#" className="hover:text-white">Terms of Service</Link>
            <Link href="#" className="hover:text-white">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
