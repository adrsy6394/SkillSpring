import { createClient } from '../lib/supabaseClient';

const supabase = createClient();

export const instructorApi = {
  /**
   * Fetches stats for the instructor dashboard.
   */
  async getInstructorStats(instructorId) {
    try {
      const { data: courses, error } = await supabase
        .from('courses')
        .select(`
          status,
          enrollments (id)
        `)
        .eq('instructor_id', instructorId);

      if (error) throw error;

      const totalCourses = courses?.length || 0;
      const totalStudents = courses?.reduce((acc, course) => acc + (course.enrollments?.length || 0), 0) || 0;
      const pendingApprovals = courses?.filter(c => c.status === 'pending').length || 0;

      return {
        totalCourses,
        totalStudents,
        pendingApprovals,
        activeCourses: courses?.filter(c => c.status === 'approved').length || 0
      };
    } catch (error) {
      console.error('Error fetching instructor stats:', error);
      throw error;
    }
  },

  /**
   * Fetches all courses created by the instructor.
   */
  async getInstructorCourses(instructorId) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        categories(name),
        sections:course_sections(
          id,
          title,
          lessons:course_lessons(id)
        )
      `)
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Fetches a single course with all sections and lessons.
   */
  async getCourseDetails(courseId) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        categories(name),
        sections:course_sections(
          *,
          lessons:course_lessons(*)
        )
      `)
      .eq('id', courseId)
      .order('order', { foreignTable: 'course_sections', ascending: true })
      .order('order', { foreignTable: 'course_sections.course_lessons', ascending: true })
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Creates a new course draft.
   */
  async createCourse(courseData) {
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Updates existing course details.
   */
  async updateCourse(courseId, updates) {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Deletes a course (soft delete recommended, but this PRD asks for delete/manage).
   */
  async deleteCourse(courseId) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;
    return true;
  },

  /**
   * Upserts a course section.
   */
  async upsertSection(sectionData) {
    const { data, error } = await supabase
      .from('course_sections')
      .upsert([sectionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Upserts a course lesson.
   */
  async upsertLesson(lessonData) {
    const { data, error } = await supabase
      .from('course_lessons')
      .upsert([lessonData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

