import InstructorLayout from '@/components/InstructorLayout';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@/lib/supabaseClient';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

export default function MyCourses() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    if (!loading && (!user || role !== 'instructor')) {
      router.push('/login');
    }
  }, [user, role, loading, router]);

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user, statusFilter]);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      let query = supabase
        .from('courses')
        .select('*, categories(name)')
        .eq('instructor_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_deleted: true })
        .eq('id', courseId);

      if (error) throw error;
      fetchCourses();
    } catch (err) {
      alert('Error deleting course: ' + err.message);
    }
  };

  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const badges = {
      draft: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', icon: Clock },
      pending: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: AlertCircle },
      approved: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: CheckCircle },
      rejected: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', icon: XCircle },
    };
    return badges[status] || badges.draft;
  };

  if (loading || !user) {
    return null;
  }

  return (
    <InstructorLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">My Courses</h1>
            <p className="text-slate-400 font-medium text-sm mt-2">
              Manage and track all your published and draft courses.
            </p>
          </div>
          
          <button 
            onClick={() => router.push('/instructor/courses/create')}
            className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white font-black rounded-2xl shadow-2xl shadow-violet-200 hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest min-w-max"
          >
            <BookOpen className="h-5 w-5" />
            <span>New Course</span>
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <input 
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 pl-14 text-sm font-medium focus:ring-4 focus:ring-violet-100 outline-none transition-all placeholder:text-slate-300"
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-48">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none w-full bg-slate-50 border-none rounded-2xl px-6 py-4 pr-12 text-sm font-black text-slate-500 uppercase tracking-widest outline-none focus:ring-4 focus:ring-violet-100 transition-all cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <Filter className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
            </div>

            <button 
              onClick={fetchCourses}
              className="p-4 bg-slate-50 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-2xl transition-all shadow-sm"
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${loadingCourses ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {loadingCourses && !filteredCourses.length ? (
            [1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm animate-pulse h-80" />
            ))
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-full bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-sm flex flex-col items-center">
              <div className="bg-slate-50 p-6 rounded-full mb-6">
                <BookOpen className="h-12 w-12 text-slate-200" />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No courses found</p>
            </div>
          ) : (
            filteredCourses.map((course) => {
              const badge = getStatusBadge(course.status);
              return (
                <div key={course.id} className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/5 border border-gray-100 group hover:-translate-y-2 transition-all flex flex-col">
                  <div className="relative mb-6 h-56 rounded-2xl overflow-hidden bg-slate-100">
                    {course.promo_video_url ? (
                      <iframe
                        src={`${course.promo_video_url}${course.promo_video_url.includes('?') ? '&' : '?'}start=74`}
                        title={course.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <img 
                        src={`https://images.unsplash.com/photo-${['1434030216411-0b793f4b4173', '1522202176988-66273c2fd55f', '1516321318423-f06f85e504b3', '1501504905252-473c47e087f8', '1456513080510-7bf3a84b82f8', '1497633762265-9d179a990aa6', '1523240795612-9a054b0db644', '1491843384429-30494622eb90'][course.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 8]}?auto=format&fit=crop&q=80&w=800`}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${badge.bg} ${badge.text} border ${badge.border} flex items-center space-x-1.5 shadow-lg`}>
                      <badge.icon className="h-3 w-3" />
                      <span>{course.status}</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight line-clamp-2 mb-2">{course.title}</h3>
                    <p className="text-slate-400 text-sm font-medium line-clamp-2 mb-4">{course.description}</p>
                    
                    <div className="flex items-center justify-between text-xs mb-4">
                      <span className="text-slate-500 font-bold">{course.categories?.name || 'Uncategorized'}</span>
                      <span className="text-violet-600 font-black">₹{course.price || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-6 border-t border-gray-50">
                    {(course.status === 'draft' || course.status === 'rejected') && (
                      <button
                        onClick={() => router.push(`/instructor/courses/${course.id}/edit`)}
                        className="flex-1 px-4 py-3 bg-violet-50 text-violet-600 font-black rounded-2xl hover:bg-violet-100 transition-all text-xs uppercase tracking-widest flex items-center justify-center space-x-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/instructor/courses/${course.id}`)}
                      className="flex-1 px-4 py-3 bg-slate-50 text-slate-600 font-black rounded-2xl hover:bg-slate-100 transition-all text-xs uppercase tracking-widest flex items-center justify-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    {course.status === 'draft' && (
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="px-4 py-3 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </InstructorLayout>
  );
}
