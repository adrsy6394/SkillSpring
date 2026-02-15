'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabaseClient';
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  MoreVertical, 
  BookOpen,
  Filter,
  RefreshCw
} from 'lucide-react';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const supabase = createClient();

  useEffect(() => {
    fetchCourses();
  }, [filter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('courses')
        .select(`
          *,
          categories:category_id(name),
          users:instructor_id(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Course Fetch Error Object:', error);
        console.error('Course Fetch Error Message:', error.message);
      } else {
        setCourses(data || []);
      }
    } catch (err) {
      console.error('Unexpected error in fetchCourses:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (courseId, status) => {
    const { error } = await supabase
      .from('courses')
      .update({ status })
      .eq('id', courseId);

    if (error) alert(error.message);
    else fetchCourses();
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">Review and manage courses submitted by instructors.</p>
        </div>
        <div className="flex items-center space-x-2">
           <div className="relative">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              >
                <option value="all">All Courses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
           </div>
           <button 
             onClick={fetchCourses}
             className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
           >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-8 py-5">Course Info</th>
                <th className="px-8 py-5">Instructor</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5 text-center">Price</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && !courses.length ? (
                 [1,2,3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-8 py-6 h-20 bg-gray-50/20" />
                    </tr>
                 ))
              ) : courses.length === 0 ? (
                <tr>
                   <td colSpan="6" className="px-8 py-20 text-center">
                      <BookOpen className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-medium">No courses found matching your criteria.</p>
                   </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                           {course.thumbnail_url ? (
                             <img src={course.thumbnail_url} className="h-full w-full object-cover" alt="" />
                           ) : (
                             <img 
                               src={`https://images.unsplash.com/photo-${['1434030216411-0b793f4b4173', '1522202176988-66273c2fd55f', '1516321318423-f06f85e504b3', '1501504905252-473c47e087f8', '1456513080510-7bf3a84b82f8', '1497633762265-9d179a990aa6', '1523240795612-9a054b0db644', '1491843384429-30494622eb90'][course.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 8]}?auto=format&fit=crop&q=80&w=200`}
                               className="h-full w-full object-cover" 
                               alt="" 
                             />
                           )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug max-w-xs ">{course.title}</p>
                          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight">{course.level}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-gray-700">{course.users?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{course.users?.email || 'N/A'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">
                        {course.categories?.name}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className="text-sm font-bold text-gray-900">${course.price}</span>
                    </td>
                    <td className="px-8 py-6">
                      {course.status === 'pending' && <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold ring-1 ring-amber-500/20">Pending</span>}
                      {course.status === 'approved' && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold ring-1 ring-emerald-500/20">Approved</span>}
                      {course.status === 'rejected' && <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold ring-1 ring-red-500/20">Rejected</span>}
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {course.status !== 'approved' && (
                            <button 
                              onClick={() => updateStatus(course.id, 'approved')}
                              className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                              title="Approve"
                            >
                               <CheckCircle className="h-5 w-5" />
                            </button>
                          )}
                          {course.status !== 'rejected' && (
                            <button 
                              onClick={() => updateStatus(course.id, 'rejected')}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              title="Reject"
                            >
                               <XCircle className="h-5 w-5" />
                            </button>
                          )}
                          <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all">
                             <ExternalLink className="h-5 w-5" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

