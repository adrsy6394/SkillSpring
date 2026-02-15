import InstructorLayout from '@/components/InstructorLayout';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@/lib/supabaseClient';
import { DollarSign, TrendingUp, BookOpen, Users, Calendar } from 'lucide-react';

export default function Earnings() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [earnings, setEarnings] = useState({ total: 0, byCourse: [], recent: [] });
  const [loadingData, setLoadingData] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    if (!loading && (!user || role !== 'instructor')) {
      router.push('/login');
    } else if (user) {
      fetchEarnings();
    }
  }, [user, role, loading, router]);

  const fetchEarnings = async () => {
    setLoadingData(true);
    try {
      // Get all payments for instructor's courses
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*, courses!inner(title, instructor_id)')
        .eq('courses.instructor_id', user.id)
        .eq('payment_status', 'success')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const total = payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
      
      // Group by course
      const byCourseMap = {};
      payments?.forEach(p => {
        const courseId = p.course_id;
        if (!byCourseMap[courseId]) {
          byCourseMap[courseId] = { 
            title: p.courses.title, 
            amount: 0, 
            count: 0 
          };
        }
        byCourseMap[courseId].amount += parseFloat(p.amount);
        byCourseMap[courseId].count += 1;
      });

      setEarnings({
        total,
        byCourse: Object.values(byCourseMap),
        recent: payments?.slice(0, 10) || []
      });
    } catch (err) {
      console.error('Error fetching earnings:', err);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <InstructorLayout>
      <div className="space-y-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">Earnings</h1>
          <p className="text-slate-400 font-medium text-sm mt-2">
            Track your revenue and payment history.
          </p>
        </div>

        {/* Total Earnings */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-[2.5rem] p-12 text-white shadow-2xl shadow-emerald-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-emerald-100 font-bold text-sm uppercase tracking-widest mb-2">Total Earnings</p>
              <h2 className="text-6xl font-black tracking-tighter">₹{loadingData ? '...' : earnings.total.toFixed(2)}</h2>
            </div>
            <div className="bg-white/10 p-6 rounded-3xl">
              <DollarSign className="h-16 w-16" />
            </div>
          </div>
        </div>

        {/* Earnings by Course */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/5 border border-gray-100">
          <h2 className="text-2xl font-black text-slate-900 mb-6 font-outfit">Earnings by Course</h2>
          
          {loadingData ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : earnings.byCourse.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold text-sm">No earnings yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {earnings.byCourse.map((course, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl hover:bg-slate-100 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="bg-violet-50 p-3 rounded-2xl">
                      <BookOpen className="h-6 w-6 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{course.title}</p>
                      <p className="text-sm text-slate-500 font-medium">{course.count} enrollment{course.count > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-emerald-600">₹{course.amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/5 border border-gray-100">
          <h2 className="text-2xl font-black text-slate-900 mb-6 font-outfit">Recent Transactions</h2>
          
          {loadingData ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : earnings.recent.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Course</th>
                    <th className="text-right py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="text-center py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.recent.map((payment, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-slate-50">
                      <td className="py-4 px-4 text-sm font-medium text-slate-600">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-slate-900">
                        {payment.courses?.title || 'Unknown Course'}
                      </td>
                      <td className="py-4 px-4 text-right text-sm font-black text-emerald-600">
                        ₹{parseFloat(payment.amount).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 font-black text-xs rounded-full uppercase">
                          {payment.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </InstructorLayout>
  );
}
