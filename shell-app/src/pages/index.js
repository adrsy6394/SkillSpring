import { ArrowRight, BookOpen, Clock, Star, Play, CheckCircle, Smartphone, Award, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import CourseCard from '@/components/CourseCard';

// const trendingCourses = [
//   {
//     id: "fsd-001",
//     title: "Mastering Full-Stack Web Development with Next.js 16",
//     instructor: "Sarah Jenkins",
//     price: 89.99,
//     rating: 4.9,
//     reviewsCount: 3240,
//     lessonsCount: 48,
//     level: "Advanced",
//     category: "Development",
//     thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&q=80&w=800"
//   },
//   {
//     id: "ui-002",
//     title: "The Ultimate Guide to Product Design & User Experience",
//     instructor: "Michael Chen",
//     price: 59.99,
//     rating: 4.8,
//     reviewsCount: 1850,
//     lessonsCount: 32,
//     level: "Intermediate",
//     category: "Design",
//     thumbnail: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=800"
//   },
//   {
//     id: "ds-003",
//     title: "Data Science Specialization: Python, SQl & Machine Learning",
//     instructor: "Dr. Elena Rodriguez",
//     price: 129.99,
//     rating: 4.7,
//     reviewsCount: 940,
//     lessonsCount: 64,
//     level: "Beginner",
//     category: "Data Science",
//     thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
//   },
//   {
//     id: "mk-004",
//     title: "Digital Marketing Blueprint for 2026: From Zero to Hero",
//     instructor: "Alex Rivera",
//     price: 45.99,
//     rating: 4.6,
//     reviewsCount: 2100,
//     lessonsCount: 28,
//     level: "Beginner",
//     category: "Marketing",
//     thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
//   }
// ];

const categories = [
  { name: 'Development', icon: '💻', count: '1,240 courses' },
  { name: 'Business', icon: '📈', count: '850 courses' },
  { name: 'Design', icon: '🎨', count: '620 courses' },
  { name: 'Marketing', icon: '🚀', count: '430 courses' },
  { name: 'Data Science', icon: '📊', count: '310 courses' },
  { name: 'Lifestyle', icon: '🧘', count: '210 courses' },
];

import { useRouter } from 'next/router';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function Home() {
  const [heroSearch, setHeroSearch] = useState('');
  const router = useRouter();

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/courses?q=${encodeURIComponent(heroSearch.trim())}`);
      setHeroSearch('');
    }
  };

  return (
    <div className="font-inter">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-50 border border-violet-100 mb-8">
                <span className="flex h-2 w-2 rounded-full bg-violet-600 mr-3 animate-pulse"></span>
                <span className="text-sm font-bold text-violet-700 uppercase tracking-widest">New: Generative AI for Designers</span>
              </div>
              
              <h1 className="text-5xl sm:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
                Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500">Potential</span> with Expert Mentorship.
              </h1>
              
              <p className="text-lg text-slate-600 leading-relaxed mb-10 opacity-90 max-w-xl mx-auto lg:mx-0 font-medium">
                Learn the most in-demand skills from industry leaders. Access 10,000+ top-rated courses on development, design, business, and more.
              </p>

              <form onSubmit={handleHeroSearch} className="relative mb-10 max-w-xl mx-auto lg:mx-0 group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                </div>
                <input 
                  type="text"
                  placeholder="What do you want to learn today?"
                  className="w-full pl-16 pr-32 py-6 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-violet-100 focus:ring-4 focus:ring-violet-50 outline-none transition-all font-bold text-slate-900 shadow-xl shadow-slate-100 placeholder-slate-400"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:brightness-110 shadow-lg shadow-violet-200 transition-all active:scale-95"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link 
                  href="/courses" 
                  className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-violet-600 text-violet-600 rounded-2xl font-black text-lg hover:bg-violet-50 transition-all active:scale-95 flex items-center justify-center group"
                >
                  Explore All Courses
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center space-x-4 px-6 text-slate-400 font-bold uppercase tracking-widest text-xs">
                   <span>Trusted by 5M+ learners</span>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
               <div className="absolute -top-20 -right-20 w-96 h-96 bg-violet-50 rounded-full blur-[100px] opacity-60"></div>
               <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-fuchsia-100 rounded-full blur-[100px] opacity-60"></div>
               <div className="relative rounded-[3rem] overflow-hidden shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] border-8 border-white group">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" 
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000"
                    alt="Learning together"
                  />
                  <div className="absolute inset-0 bg-violet-600/10 mix-blend-multiply"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Build Your Path</h2>
              <p className="text-slate-500 font-medium">Explore categories and find your next passion.</p>
            </div>
            <Link href="/courses" className="hidden sm:flex items-center text-violet-600 font-black text-sm uppercase tracking-widest group">
              View All <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-violet-100 hover:shadow-xl hover:shadow-violet-900/5 transition-all cursor-pointer group text-center">
                <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{cat.icon}</span>
                <h3 className="font-black text-slate-900 text-sm mb-1">{cat.name}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{cat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Trending Courses This Week</h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-violet-600 to-fuchsia-500 mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Join thousands of other professional learners and master the skills that top companies are actually hiring for.
            </p>
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trendingCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div> */}
          
          <div className="mt-20 text-center">
            <Link 
              href="/courses" 
              className="px-12 py-5 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-black hover:bg-slate-900 hover:text-white transition-all shadow-xl shadow-slate-100"
            >
              Browse 10,000+ Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-violet-600/10 skew-x-12 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl font-black mb-10 leading-tight">Why SkillSpring is the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">#1Choice</span> for Learners Globally.</h2>
              <div className="space-y-8">
                {[
                  { icon: Award, title: "Industry Recognition", desc: "Our certificates are recognized by Fortune 500 companies." },
                  { icon: Smartphone, title: "Learn Anywhere", desc: "Access courses on any device, even without internet access." },
                  { icon: ThumbsUp, title: "Lifetime Access", desc: "Once you buy a course, it's yours forever. No subscriptions." }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-6">
                    <div className="bg-violet-600/20 p-4 rounded-2xl border border-violet-400/20 shadow-lg shadow-violet-900/20">
                      <item.icon className="h-6 w-6 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg mb-1">{item.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 relative">
              <div className="space-y-4 pt-12">
                  <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 text-center">
                    <p className="text-3xl font-black mb-1 text-white">5M+</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-slate-400">Learners</p>
                 </div>
                 <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 p-8 rounded-[2rem] text-center shadow-2xl shadow-violet-900/50">
                    <p className="text-3xl font-black mb-1 text-white">10k+</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 text-white">Courses</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 p-8 rounded-[2rem] text-center shadow-2xl shadow-violet-900/50">
                    <p className="text-3xl font-black mb-1 text-white">98%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 text-white">Satisfaction</p>
                 </div>
                 <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 text-center">
                    <p className="text-3xl font-black mb-1 text-white">450+</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-slate-400">Instructors</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl shadow-violet-200">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-8 tracking-tight">Ready to master a new skill?</h2>
                <p className="text-violet-50 text-lg mb-12 opacity-90 max-w-2xl mx-auto font-medium">
                  Create your account today and get 20% off your first 3 courses. Lifetime access, 30-day money-back guarantee.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link 
                    href="http://localhost:3001/signup" 
                    className="w-full sm:w-auto px-12 py-5 bg-white text-violet-600 rounded-2xl font-black text-xl hover:bg-slate-50 transition-all shadow-xl hover:-translate-y-1"
                  >
                    Join for Free
                  </Link>
                  <Link 
                    href="#" 
                    className="w-full sm:w-auto px-12 py-5 bg-violet-800 text-white rounded-2xl font-black text-xl hover:bg-violet-900 transition-all hover:-translate-y-1"
                  >
                    For Business
                  </Link>
                </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}
