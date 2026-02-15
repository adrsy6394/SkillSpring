import InstructorLayout from '@/components/InstructorLayout';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@/lib/supabaseClient';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus
} from 'lucide-react';

export default function InstructorDashboard() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    avgRating: 0,
    coursesByStatus: { draft: 0, pending: 0, approved: 0, rejected: 0 }
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    if (!loading && (!user || role !== 'instructor')) {
      router.push('/login');
    } else if (user) {
      fetchMetrics();
    }
  }, [user, role, loading, router]);

  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', user.id)
        .eq('is_deleted', false);

      const totalCourses = courses?.length || 0;
      const coursesByStatus = {
        draft: courses?.filter(c => c.status === 'draft').length || 0,
        pending: courses?.filter(c => c.status === 'pending').length || 0,
        approved: courses?.filter(c => c.status === 'approved').length || 0,
        rejected: courses?.filter(c => c.status === 'rejected').length || 0,
      };

      // Get total students (unique enrollments)
      const courseIds = courses?.map(c => c.id) || [];
      console.log('[Dashboard] Fetching enrollments for course IDs:', courseIds);
      
      let totalStudents = 0;
      if (courseIds.length > 0) {
        const { count: studentCount, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .in('course_id', courseIds);

        if (enrollmentError) {
          console.error('[Dashboard] Enrollment count error:', enrollmentError);
        } else {
          console.log('[Dashboard] Enrollment count:', studentCount);
          totalStudents = studentCount || 0;
        }
      }

      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .in('course_id', courseIds)
        .eq('payment_status', 'success');

      const totalRevenue = payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .in('course_id', courseIds);

      const avgRating = reviews?.length 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

      console.log('[Dashboard] Final metrics:', { totalCourses, totalStudents, totalRevenue, avgRating });
      setMetrics({ totalCourses, totalStudents, totalRevenue, avgRating, coursesByStatus });
    } catch (err) {
      console.error('Error fetching metrics:', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  if (loading || !user) {
    return null;
  }

  const stats = [
    { 
      label: 'Total Courses', 
      value: loadingMetrics ? '...' : metrics.totalCourses.toString(), 
      icon: BookOpen, 
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600'
    },
    { 
      label: 'Total Students', 
      value: loadingMetrics ? '...' : metrics.totalStudents.toString(), 
      icon: Users, 
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    { 
      label: 'Total Revenue', 
      value: loadingMetrics ? '...' : `₹${metrics.totalRevenue.toFixed(0)}`, 
      icon: DollarSign, 
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600'
    },
    { 
      label: 'Avg Rating', 
      value: loadingMetrics ? '...' : metrics.avgRating.toString(), 
      icon: TrendingUp, 
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
  ];

  const courseStats = [
    { label: 'Draft', count: metrics.coursesByStatus.draft, icon: Clock, color: 'text-slate-500', bg: 'bg-slate-50' },
    { label: 'Pending', count: metrics.coursesByStatus.pending, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Approved', count: metrics.coursesByStatus.approved, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Rejected', count: metrics.coursesByStatus.rejected, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <InstructorLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Welcome Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">
              Welcome back, Instructor! 👋
            </h1>
            <p className="text-slate-400 font-medium text-sm mt-2">
              Manage your courses, track student progress, and grow your teaching impact.
            </p>
          </div>
          
          <button 
            onClick={() => router.push('/instructor/courses/create')}
            className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white font-black rounded-2xl shadow-2xl shadow-violet-200 hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest min-w-max"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Course</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-slate-900/5 border border-gray-100 hover:-translate-y-2 transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`h-14 w-14 rounded-2xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-7 w-7 ${stat.textColor}`} />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">{stat.value}</h3>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Course Status Overview */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/5 border border-gray-100">
          <h2 className="text-2xl font-black text-slate-900 mb-6 font-outfit">Course Status</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {courseStats.map((stat, idx) => (
              <div key={idx} className={`${stat.bg} rounded-3xl p-6 text-center hover:scale-105 transition-transform`}>
                <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-3`} />
                <p className="text-3xl font-black text-slate-900 mb-1">{stat.count}</p>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div onClick={() => router.push('/instructor/courses/create')} className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group cursor-pointer hover:-translate-y-2 transition-all shadow-2xl shadow-violet-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <BookOpen className="h-12 w-12 mb-4 opacity-90" />
              <h3 className="text-2xl font-black mb-2">Start Teaching</h3>
              <p className="text-violet-100 font-medium text-sm">Create your first course and share your expertise with students worldwide.</p>
            </div>
          </div>

          <div onClick={() => router.push('/instructor/earnings')} className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group cursor-pointer hover:-translate-y-2 transition-all shadow-2xl shadow-emerald-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <Users className="h-12 w-12 mb-4 opacity-90" />
              <h3 className="text-2xl font-black mb-2">Grow Your Audience</h3>
              <p className="text-emerald-100 font-medium text-sm">Monitor your revenue and view detailed payment analytics.</p>
            </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}
