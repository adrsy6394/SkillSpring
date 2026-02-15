import { supabase } from '../lib/supabaseClient';

export const courseApi = {
  // Fetch trending/popular courses (for Home page)
  async getTrendingCourses(limit = 4) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        thumbnail:thumbnail_url,
        instructor:users!instructor_id(full_name, avatar_url),
        categories:categories(name),
        enrollments(count)
      `)
      .eq('status', 'approved')
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Search courses with filters
  async searchCourses({ query, category, level, price, limit = 12 }) {
    let queryBuilder = supabase
      .from('courses')
      .select(`
        *,
        thumbnail:thumbnail_url,
        instructor:users!instructor_id(full_name, avatar_url),
        categories:categories(name),
        enrollments(count)
      `)
      .eq('status', 'approved');

    if (query) {
      queryBuilder = queryBuilder.ilike('title', `%${query}%`);
    }

    if (category) {
      queryBuilder = queryBuilder.eq('category_id', category); // Assuming category is ID. If name, join categories table.
    }

    if (level) {
      queryBuilder = queryBuilder.eq('level', level);
    }

    if (price === 'free') {
      queryBuilder = queryBuilder.eq('price', 0);
    } else if (price === 'paid') {
      queryBuilder = queryBuilder.gt('price', 0);
    }

    const { data, error } = await queryBuilder.limit(limit);
    if (error) throw error;
    return data;
  },

  // Get single course details
  async getCourseById(id) {
    if (!supabase.supabaseUrl || !supabase.supabaseKey) {
      console.error("Supabase client not initialized properly. URL or Key missing.");
      throw new Error("Database configuration error.");
    }

    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        thumbnail:thumbnail_url,
        instructor:users!instructor_id(full_name, avatar_url, bio),
        enrollments(count),
        course_sections(
            *,
            course_lessons(*)
        )
      `)
      .eq('id', id);

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }
    return data && data.length > 0 ? data[0] : null;
  },

  // Get all categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) throw error;
    return data;
  }
};
