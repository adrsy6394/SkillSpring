'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Clock,
  ExternalLink,
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { adminDashboardApi } from '../../../services/adminDashboardApi';
import MetricCard from '../../../components/admin/MetricCard';
import StatusBadge from '../../../components/admin/StatusBadge';
import ConfirmModal from '../../../components/admin/ConfirmModal';

export default function AdminDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  // State
  const [metrics, setMetrics] = useState({ 
    totalStudents: 0, activeCourses: 0, totalEnrollments: 0, totalRevenue: 0 
  });
  const [pendingCourses, setPendingCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, courseId: null });

  // Security Check
  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      router.push('/login');
    }
  }, [user, role, authLoading, router]);

  // Data Fetching
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [metricsData, pendingData] = await Promise.all([
        adminDashboardApi.getDashboardMetrics(),
        adminDashboardApi.getPendingCourses()
      ]);
      setMetrics(metricsData);
      setPendingCourses(pendingData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === 'admin') {
      fetchData();
    }
  }, [role, fetchData]);

  // Handlers
  const handleAction = async () => {
    const { type, courseId } = modalConfig;
    if (!courseId || !user) return;

    setActionLoading(true);
    try {
      if (type === 'approve') {
        await adminDashboardApi.approveCourse(courseId, user.id);
      } else if (type === 'reject') {
        await adminDashboardApi.rejectCourse(courseId, user.id);
      }
      // Refresh data
      await fetchData();
      setModalConfig({ isOpen: false, type: null, courseId: null });
    } catch (error) {
      alert(`Action failed: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const metricItems = useMemo(() => [
    { name: 'Total Students', value: metrics.totalStudents.toLocaleString(), icon: Users, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
    { name: 'Active Courses', value: metrics.activeCourses.toLocaleString(), icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-50' },
    { name: 'Total Enrollments', value: metrics.totalEnrollments.toLocaleString(), icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
    { name: 'Platform Revenue', value: `$${metrics.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-100' },
  ], [metrics]);

  if (authLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-violet-600">Verifying credentials...</div>;
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-2xl shadow-violet-100 border border-gray-100 max-w-md">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Aap admin nhi h</h2>
          <p className="text-slate-500 font-medium mb-8">This portal is reserved for platform administrators only.</p>
          <button 
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-black rounded-2xl shadow-xl shadow-violet-200 hover:brightness-110 active:scale-95 transition-all text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <LayoutDashboard className="mr-2 h-6 w-6 text-violet-600" />
            Admin Overview
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Real-time platform metrics and pending approvals.</p>
        </div>
        <button 
          onClick={fetchData}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricItems.map((item) => (
          <MetricCard key={item.name} {...item} isLoading={isLoading} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Courses Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
             <h2 className="text-lg font-bold text-gray-900 flex items-center">
               <Clock className="mr-2 h-5 w-5 text-amber-500" />
               Quick Approvals
             </h2>
             <button 
               onClick={() => router.push('/admin/courses')}
               className="text-sm text-violet-600 font-semibold hover:text-violet-500 flex items-center"
             >
               View All <ExternalLink className="ml-1 h-3 w-3" />
             </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
                  <th className="px-6 py-4">Course Info</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                   [1,2,3].map(i => <tr key={i} className="animate-pulse h-20 bg-gray-50/5" />)
                ) : pendingCourses.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-400 italic">
                      No pending courses found.
                    </td>
                  </tr>
                ) : (
                  pendingCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{course.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">by {course.instructor?.full_name}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-600">
                        {course.category?.name || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => setModalConfig({ isOpen: true, type: 'approve', courseId: course.id })}
                          className="px-3 py-1.5 bg-violet-50 text-violet-600 rounded-lg text-xs font-bold hover:bg-violet-100 transition-colors"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => setModalConfig({ isOpen: true, type: 'reject', courseId: course.id })}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar / Quick Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 bg-gradient-to-br from-white to-violet-50/30">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider text-violet-900/60">System Links</h2>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/admin/categories')}
                className="w-full py-3 px-4 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-violet-500 hover:text-violet-600 shadow-sm transition-all text-left flex items-center group"
              >
                <span className="flex-1">Manage Categories</span>
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transform translate-x-1 transition-all" />
              </button>
              <button 
                onClick={() => router.push('/admin/users')}
                className="w-full py-3 px-4 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-violet-500 hover:text-violet-600 shadow-sm transition-all text-left flex items-center group"
              >
                <span className="flex-1">User Management</span>
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transform translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={handleAction}
        title={modalConfig.type === 'approve' ? 'Approve Course' : 'Reject Course'}
        message={modalConfig.type === 'approve' 
          ? 'Are you sure you want to approve this course? It will be visible to students immediately.' 
          : 'Are you sure you want to reject this course? The instructor will be notified to make changes.'}
        confirmText={actionLoading ? 'Processing...' : modalConfig.type === 'approve' ? 'Approve Now' : 'Reject Now'}
        confirmVariant={modalConfig.type === 'approve' ? 'violet' : 'red'}
      />
    </div>
  );
}

