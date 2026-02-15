import { supabase } from '@/lib/supabaseClient';

export const enrollmentApi = {
  // Check if user is enrolled
  async checkEnrollment(courseId, userId) {
    const { data, error } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  // Enroll user (Mock Payment)
  async enrollUser(courseId, userId, amount = 0) {
    
    // Check session again for RLS safety
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Authentication session missing. Please log in again.");

    console.log("enrollUser: Attempting enrollment for", { courseId, userId, amount, sessionUserId: session.user.id });

    // 1. Create enrollment record
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('enrollments')
      .insert({
        course_id: courseId,
        user_id: userId
      })
      .select();

    if (enrollmentError) {
        console.error("Enrollment database error:", enrollmentError);
        throw enrollmentError;
    }

    const enrollment = enrollmentData && enrollmentData.length > 0 ? enrollmentData[0] : null;

    // 2. Create payment record for instructor earnings
    const { error: paymentError } = await supabase
        .from('payments')
        .insert({
            course_id: courseId,
            user_id: userId,
            amount: amount, 
            payment_status: 'success'
        });
        
    if (paymentError) {
        console.error("Payment record error:", paymentError);
        // If payment fails, we might still want to proceed since enrollment was successful,
        // but for a strict app we might want to rollback. For MVP we'll log it.
    }

    return true;
  },

  // Get user's enrolled courses with progress
  async getMyCourses(userId) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        enrolled_at,
        course:courses(
          id, 
          title, 
          thumbnail:thumbnail_url, 
          instructor:users!instructor_id(full_name),
          course_sections(
            id,
            course_lessons(id)
          )
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    if (!data) return [];

    const results = [];
    
    for (const enrollment of data) {
        try {
            let course = enrollment.course;
            if (Array.isArray(course)) course = course[0];
            if (!course) continue;

            const instructor = Array.isArray(course.instructor) ? course.instructor[0] : course.instructor;

            const totalLessons = course.course_sections?.reduce((acc, section) => 
                acc + (section.course_lessons?.length || 0), 0) || 0;

            const { count } = await supabase
                .from('lesson_progress')
                .select('*', { count: 'exact', head: true })
                .eq('enrollment_id', enrollment.id)
                .eq('is_completed', true);
            
            const completedLessons = count || 0;
            const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

            results.push({
                ...course,
                instructor, // Now an object
                enrolled_at: enrollment.enrolled_at,
                progress,
                totalLessons,
                completedLessons
            });
        } catch (innerErr) {
            console.error("Error processing enrollment:", innerErr);
        }
    }

    return results;
  },

  // Mark lesson as complete
  async markLessonComplete(studentId, lessonId, courseId) {
    console.log("markLessonComplete: Starting", { studentId, lessonId, courseId });
    
    // 1. Get enrollment ID
    const { data: enrollmentData, error: enrollError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', studentId)
      .eq('course_id', courseId);

    if (enrollError) {
      console.error("markLessonComplete: Enrollment lookup failed", enrollError);
      throw enrollError;
    }

    if (!enrollmentData || enrollmentData.length === 0) {
      throw new Error("No enrollment found for this course.");
    }

    const enrollment = enrollmentData[0];

    console.log("markLessonComplete: Found enrollment", enrollment.id);

    // 2. Check if progress already exists
    const { data: existingProgress, error: fetchError } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('enrollment_id', enrollment.id)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (fetchError) {
      console.error("markLessonComplete: Progress fetch failed", fetchError);
      throw fetchError;
    }

    if (existingProgress) {
      console.log("markLessonComplete: Updating existing progress", existingProgress.id);
      const { error: updateError } = await supabase
        .from('lesson_progress')
        .update({ 
          is_completed: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', existingProgress.id);
      
      if (updateError) {
        console.error("markLessonComplete: Update failed", updateError);
        throw updateError;
      }
    } else {
      console.log("markLessonComplete: Inserting new progress");
      const { error: insertError } = await supabase
        .from('lesson_progress')
        .insert({
          enrollment_id: enrollment.id,
          lesson_id: lessonId,
          is_completed: true,
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("markLessonComplete: Insert failed", insertError);
        throw insertError;
      }
    }

    console.log("markLessonComplete: Successfully marked complete");
    return true;
  }
};
