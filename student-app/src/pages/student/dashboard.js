import Head from 'next/head';
import Layout from '../../components/Layout';
import { enrollmentApi } from '@/services/enrollmentApi';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, PlayCircle, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const fetchMyCourses = async () => {
        setLoading(true);
        try {
          const data = await enrollmentApi.getMyCourses(user.id);
          setCourses(data);
          setFilteredCourses(data);
        } catch (error) {
          console.error("Failed to fetch my courses:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchMyCourses();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredCourses(courses);
    } else if (filter === 'active') {
      setFilteredCourses(courses.filter(c => c.progress > 0 && c.progress < 100));
    } else if (filter === 'completed') {
      setFilteredCourses(courses.filter(c => c.progress === 100));
    }
  }, [filter, courses]);

  const stats = {
    total: courses.length,
    active: courses.filter(c => c.progress > 0 && c.progress < 100).length,
    completed: courses.filter(c => c.progress === 100).length
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{`My Courses | SkillSpring Dashboard`}</title>
      </Head>

      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header & Stats */}
          <div className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 mb-8">My Learning</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Courses Enrolled', value: stats.total, color: 'bg-white', icon: BookOpen, iconColor: 'text-violet-600' },
                { label: 'In Progress', value: stats.active, color: 'bg-white', icon: Clock, iconColor: 'text-amber-500' },
                { label: 'Completed', value: stats.completed, color: 'bg-white', icon: CheckCircle, iconColor: 'text-emerald-500' }
              ].map((stat, i) => (
                <div key={i} className={`${stat.color} p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5`}>
                  <div className={`p-4 rounded-xl bg-slate-50 ${stat.iconColor}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters & Content Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-6">
            <h2 className="text-2xl font-black text-slate-900">My Courses</h2>
            
            <div className="flex bg-slate-200/50 p-1 rounded-xl">
              {['all', 'active', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    filter === f 
                      ? 'bg-white text-violet-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
               <BookOpen className="h-16 w-16 text-slate-200 mx-auto mb-4" />
               <h2 className="text-xl font-bold text-slate-900 mb-2">
                 {filter === 'all' ? 'No courses enrolled yet' : `No ${filter} courses found`}
               </h2>
               <p className="text-slate-500 mb-8 max-w-md mx-auto font-medium">
                 {filter === 'all' 
                    ? "Start your learning journey by browsing our catalog of premium courses." 
                    : `You don't have any courses marked as ${filter} at the moment.`}
               </p>
               <Link 
                 href="/student/courses" 
                 className="px-8 py-3 bg-violet-600 text-white font-bold rounded-full hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200"
               >
                 Browse Catalog
               </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map(course => (
                 <div key={course.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col group">
                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                       {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                             <PlayCircle className="h-12 w-12" />
                          </div>
                       )}
                       <div className="absolute inset-0 bg-violet-900/0 group-hover:bg-violet-900/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Link 
                            href={`/player/${course.id}`} 
                            className="bg-white text-violet-600 px-6 py-2.5 rounded-full font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all"
                          >
                             Resume Learning
                          </Link>
                       </div>
                       
                       {course.progress === 100 && (
                         <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                           Completed
                         </div>
                       )}
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                       <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors">
                          <Link href={`/player/${course.id}`}>
                            {course.title}
                          </Link>
                       </h3>
                       <p className="text-sm font-medium text-slate-500 mb-6 flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                            {course.instructor?.full_name?.[0]}
                          </div>
                          {course.instructor?.full_name}
                       </p>

                       <div className="mt-auto space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-end text-xs font-black uppercase tracking-wider text-slate-400">
                               <span className={course.progress > 0 ? "text-violet-600" : ""}>{course.progress}% Complete</span>
                               <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                               <div 
                                 className="bg-gradient-to-r from-violet-600 to-fuchsia-500 h-full rounded-full transition-all duration-700" 
                                 style={{ width: `${course.progress}%` }}
                               />
                            </div>
                          </div>
                          
                          <Link 
                            href={`/player/${course.id}`}
                            className="block w-full py-3 text-center border-2 border-slate-100 text-slate-700 font-bold rounded-xl hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-all text-sm"
                          >
                             {course.progress > 0 ? 'Continue Watching' : 'Start Learning'}
                          </Link>
                       </div>
                    </div>
                 </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
