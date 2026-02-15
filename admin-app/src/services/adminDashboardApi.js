import { createClient } from '../lib/supabaseClient';

const supabase = createClient();

export const adminDashboardApi = {

  async getDashboardMetrics() {
    try {

      const [
        { count: studentCount, error: studentError },
        { count: courseCount, error: courseError },
        { count: enrollmentCount, error: enrollmentError },
        { data: payments, error: revenueError }
      ] = await Promise.all([
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student'),

        supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved'),

        supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true }),

        supabase
          .from('payments')
          .select('amount')
          .eq('payment_status', 'success')
      ]);

      if (studentError) console.error("Student count error:", studentError);
      if (courseError) console.error("Course count error:", courseError);
      if (enrollmentError) console.error("Enrollment count error:", enrollmentError);
      if (revenueError) console.error("Revenue error:", revenueError);

      const totalRevenue =
        payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      return {
        totalStudents: studentCount ?? 0,
        activeCourses: courseCount ?? 0,
        totalEnrollments: enrollmentCount ?? 0,
        totalRevenue
      };

    } catch (error) {
      console.error('Error in getDashboardMetrics:', error);
      return {
        totalStudents: 0,
        activeCourses: 0,
        totalEnrollments: 0,
        totalRevenue: 0
      };
    }
  },

  async getPendingCourses(limit = 5) {

    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        created_at,
        category_id,
        instructor_id
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Pending courses error:", error);
      throw error;
    }

    return data || [];
  },

  async approveCourse(courseId, adminId) {

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('courses')
      .update({
        status: 'approved',
        approved_by: adminId,
        approved_at: now
      })
      .eq('id', courseId);

    if (updateError) throw updateError;

    await supabase.from('course_approval_logs').insert({
      course_id: courseId,
      admin_id: adminId,
      status_after: 'approved',
      reason: 'Approved by Admin'
    });

    return true;
  },

  async rejectCourse(courseId, adminId, reason = 'Rejected by Admin') {

    const { error: updateError } = await supabase
      .from('courses')
      .update({ status: 'rejected' })
      .eq('id', courseId);

    if (updateError) throw updateError;

    await supabase.from('course_approval_logs').insert({
      course_id: courseId,
      admin_id: adminId,
      status_after: 'rejected',
      reason
    });

    return true;
  }
};
