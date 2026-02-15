import Head from 'next/head';
import Layout from '../components/Layout';
import CourseCard from '../components/CourseCard';
import { courseApi } from '../services/courseApi';
import { ArrowRight, Code, Briefcase, Music, Camera, PenTool, Database } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home({ trendingCourses, error }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/student/dashboard');
    }
  }, [user, loading, router]);

  const categories = [
    { name: 'Development', icon: Code, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Business', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: 'Design', icon: PenTool, color: 'text-purple-500', bg: 'bg-purple-50' },
    { name: 'Music', icon: Music, color: 'text-pink-500', bg: 'bg-pink-50' },
    { name: 'Photography', icon: Camera, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { name: 'Data Science', icon: Database, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <Layout>
      <Head>
        <title>SkillSpring | Master New Skills</title>
        <meta name="description" content="Learn from the best instructors around the world." />
      </Head>

      {/* Hero Section */}
      <section className="relative bg-white pt-16 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-50 text-violet-700 text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="flex h-2 w-2 rounded-full bg-violet-600 mr-2"></span>
              Over 5,000+ new courses added this month
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-8 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
              Unlock your potential with <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500">SkillSpring</span>
            </h1>
            <p className="text-xl text-slate-500 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700">
              Learn from industry experts and join a global community of learners.
              Master the skills that matter to you, at your own pace.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-700">
               <Link 
                 href="/student/courses"
                 className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-full font-bold text-lg shadow-xl shadow-violet-200 hover:shadow-2xl hover:shadow-violet-300 hover:-translate-y-1 transition-all"
               >
                 Browse All Courses
               </Link>
               <Link 
                 href="https://skill-spring-eight.vercel.app/signup"
                 className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold text-lg hover:border-violet-200 hover:bg-violet-50 transition-all flex items-center justify-center group"
               >
                 Start for Free
                 <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-fuchsia-100/50 blur-[100px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-violet-100/50 blur-[100px]" />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-slate-50/50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-4">Top Categories</h2>
              <p className="text-slate-500">Explore our most popular learning paths</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((cat, idx) => (
                <Link key={idx} href={`/student/courses?category=${cat.name}`} className="group">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-100 transition-all text-center h-full flex flex-col items-center justify-center">
                    <div className={`p-4 rounded-full ${cat.bg} ${cat.color} mb-4 group-hover:scale-110 transition-transform`}>
                      <cat.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
         </div>
      </section>

      {/* Trending Courses Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Trending Courses</h2>
              <p className="text-slate-500">Hand-picked by our editors for you</p>
            </div>
            <Link href="/student/courses" className="hidden sm:flex items-center font-bold text-violet-600 hover:text-violet-700 transition-colors">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {!trendingCourses || trendingCourses.length === 0 ? (
             <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl">
                {error ? 'Failed to load courses. Please try again later.' : 'No courses found.'}
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {trendingCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

           <div className="mt-12 text-center sm:hidden">
            <Link href="/student/courses" className="inline-flex items-center font-bold text-violet-600 hover:text-violet-700 transition-colors">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 to-fuchsia-900/50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl font-black text-white mb-8">Ready to start your journey?</h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of students and start learning today. Get unlimited access to all courses with our premium plan.
          </p>
          <Link 
            href="https://skill-spring-eight.vercel.app/signup" 
            className="inline-block px-10 py-5 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-violet-50 transition-colors shadow-xl"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  try {
    const trendingCourses = await courseApi.getTrendingCourses();
    return {
      props: {
        trendingCourses: trendingCourses || [],
      },
      revalidate: 60, // Revalidate every 60 seconds
    };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return {
      props: {
        trendingCourses: [],
        error: error.message,
      },
      revalidate: 60,
    };
  }
}
