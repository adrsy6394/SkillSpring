import { supabase } from '../lib/supabaseClient';

export const reviewApi = {
  // Add a review
  async addReview(courseId, userId, rating, comment) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        course_id: courseId,
        user_id: userId,
        rating,
        comment
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Check if user has already reviewed
  async hasReviewed(courseId, userId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  }
};
