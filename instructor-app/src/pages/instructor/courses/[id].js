import InstructorLayout from '@/components/InstructorLayout';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@/lib/supabaseClient';
import { 
  BookOpen, 
  Clock, 
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Users,
  DollarSign,
  BarChart3,
  Play
} from 'lucide-react';

export default function CourseDetail() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [stats, setStats] = useState({ enrollments: 0, revenue: 0, avgRating: 0 });
  
  const supabase = createClient();

  useEffect(() => {
    if (!loading && (!user || role !== 'instructor')) {
      router.push('/login');
    }
  }, [user, role, loading, router]);

  useEffect(() => {
    if (id && user) {
      fetchCourseDetails();
    }
  }, [id, user]);

  const fetchCourseDetails = async () => {
    setLoadingCourse(true);
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*, categories(name)')
        .eq('id', id)
        .eq('instructor_id', user.id)
        .single();

      if (courseError) {
        console.error('[Course Detail] Course fetch error:', courseError);
        throw courseError;
      }
      setCourse(courseData);

      // Fetch sections and lessons
      console.log('[Course Detail] Fetching sections for course:', id);
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('course_sections')
        .select('*, course_lessons(*)')
        .eq('course_id', id)
        .order('order', { ascending: true });

      if (sectionsError) {
        console.error('[Course Detail] Sections fetch error:', sectionsError);
        // Don't throw - just set empty sections
        setSections([]);
      } else {
        console.log('[Course Detail] Sections data:', sectionsData);
        console.log('[Course Detail] Number of sections:', sectionsData?.length || 0);
        setSections(sectionsData || []);
      }

      // Fetch course stats
      const { count: enrollmentCount, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', id);

      if (enrollmentError) {
        console.error('[Course Detail] Enrollment count error:', enrollmentError);
      }

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('course_id', id)
        .eq('payment_status', 'success');

      if (paymentsError) {
        console.error('[Course Detail] Payments fetch error:', paymentsError);
      }

      const totalRevenue = payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('course_id', id);

      if (reviewsError) {
        console.error('[Course Detail] Reviews fetch error:', reviewsError);
      }

      const avgRating = reviews?.length 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

      setStats({ enrollments: enrollmentCount || 0, revenue: totalRevenue, avgRating });
    } catch (err) {
      console.error('[Course Detail] Fatal error:', err);
      // Don't show alert - the UI will show "Course not found" message
    } finally {
      setLoadingCourse(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { bg: 'bg-slate-50', text: 'text-slate-600', icon: Clock, label: 'Draft' },
      pending: { bg: 'bg-amber-50', text: 'text-amber-600', icon: AlertCircle, label: 'Pending Review' },
      approved: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle, label: 'Approved' },
      rejected: { bg: 'bg-red-50', text: 'text-red-600', icon: XCircle, label: 'Rejected' },
    };
    return badges[status] || badges.draft;
  };

  if (loading || !user || loadingCourse) {
    return null;
  }

  if (!course) {
    return (
      <InstructorLayout>
        <div className="text-center py-20">
          <p className="text-slate-400 font-bold">Course not found</p>
        </div>
      </InstructorLayout>
    );
  }

  const badge = getStatusBadge(course.status);
  const totalLessons = sections.reduce((sum, section) => sum + (section.course_lessons?.length || 0), 0);

  return (
    <InstructorLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/instructor/courses')}
            className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">{course.title}</h1>
            <p className="text-slate-400 font-medium text-sm mt-2">{course.categories?.name || 'Uncategorized'} • {totalLessons} Lessons • {sections.length} Sections</p>
          </div>
          <div className={`px-6 py-3 rounded-2xl ${badge.bg} ${badge.text} flex items-center space-x-2 font-black text-sm shadow-sm`}>
            <badge.icon className="h-5 w-5" />
            <span>{badge.label}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-900/5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-50 p-3 rounded-2xl">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-3xl font-black text-slate-900">{stats.enrollments}</span>
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Enrolled Students</p>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-900/5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-violet-50 p-3 rounded-2xl">
                <DollarSign className="h-6 w-6 text-violet-600" />
              </div>
              <span className="text-3xl font-black text-slate-900">₹{stats.revenue.toFixed(0)}</span>
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Total Revenue</p>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-900/5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-50 p-3 rounded-2xl">
                <BarChart3 className="h-6 w-6 text-amber-600" />
              </div>
              <span className="text-3xl font-black text-slate-900">{stats.avgRating}</span>
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Average Rating</p>
          </div>
        </div>

        {/* Course Info */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-900/5 border border-gray-100">
          <h2 className="text-2xl font-black text-slate-900 mb-4">Course Details</h2>
          <div className="space-y-4">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Description</p>
              <p className="text-slate-600 font-medium">{course.description}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Level</p>
                <p className="text-slate-900 font-black">{course.level || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Price</p>
                <p className="text-slate-900 font-black">₹{course.price || 0}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Duration</p>
                <p className="text-slate-900 font-black">{course.duration || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-900/5 border border-gray-100">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Course Curriculum</h2>
          <div className="space-y-4">
            {sections.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No curriculum added yet</p>
            ) : (
              sections.map((section, idx) => (
                <div key={section.id} className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="text-lg font-black text-slate-900 mb-4">
                    Section {idx + 1}: {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.course_lessons?.map((lesson, lessonIdx) => (
                      <div key={lesson.id} className="flex items-center justify-between bg-white rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <Play className="h-4 w-4 text-violet-600" />
                          <span className="text-slate-900 font-bold text-sm">{lesson.title}</span>
                          {lesson.is_free && <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg font-black">FREE</span>}
                        </div>
                        <span className="text-slate-400 text-xs font-bold">{lesson.duration || 'N/A'}</span>
                      </div>
                    )) || <p className="text-slate-400 text-sm">No lessons added</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}
