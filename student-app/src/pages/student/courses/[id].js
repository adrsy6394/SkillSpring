import Head from 'next/head';
import Layout from '../../../components/Layout';
import { courseApi } from '@/services/courseApi';
import { enrollmentApi } from '@/services/enrollmentApi';
import { reviewApi } from '@/services/reviewApi';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Star, Clock, User, CheckCircle, PlayCircle, Lock, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

const ReviewForm = ({ courseId, onReviewAdded }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkReview = async () => {
       if (user) {
          const reviewed = await reviewApi.hasReviewed(courseId, user.id);
          setHasReviewed(reviewed);
       }
    };
    checkReview();
  }, [courseId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!user) return;
      
      await reviewApi.addReview(courseId, user.id, rating, comment);
      setHasReviewed(true);
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (hasReviewed) {
    return <div className="text-sm text-emerald-600 font-bold bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex items-center"><CheckCircle className="h-4 w-4 mr-2"/> Thanks for your review!</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
       <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-slate-700">Rating:</span>
          <div className="flex space-x-1">
             {[1,2,3,4,5].map(star => (
                <button 
                  key={star} 
                  type="button"
                  onClick={() => setRating(star)}
                  className={`focus:outline-none transition-transform hover:scale-110 ${star <= rating ? 'text-amber-400' : 'text-slate-300'}`}
                >
                   <Star className={`h-5 w-5 ${star <= rating ? 'fill-current' : ''}`} />
                </button>
             ))}
          </div>
       </div>
       <textarea
         value={comment}
         onChange={(e) => setComment(e.target.value)}
         placeholder="Share your experience..."
         className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 outline-none resize-none h-20"
         required
       />
       <button 
         type="submit" 
         disabled={submitting}
         className="px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-colors flex items-center"
       >
         {submitting ? 'Sending...' : <><Send className="h-3 w-3 mr-2" /> Submit Review</>}
       </button>
    </form>
  );
};

export default function CourseDetail({ course, error }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (user && course) {
        const enrolled = await enrollmentApi.checkEnrollment(course.id, user.id);
        setIsEnrolled(enrolled);
      }
    };
    if (!authLoading) {
      checkEnrollment();
    }
  }, [user, authLoading, course]);

  const handleEnroll = async () => {
    setLoading(true);

    if (!user) {
      router.push(`/login?redirect=/student/courses/${course.id}`);
      return;
    }

    try {
      // Defensive check: is user already enrolled?
      const enrolled = await enrollmentApi.checkEnrollment(course.id, user.id);
      if (enrolled) {
        setIsEnrolled(true);
        router.push(`/player/${course.id}`);
        return;
      }

      // Redirect to the new Mock Checkout page
      router.push(`/student/checkout/${course.id}`);
    } catch (err) {
      console.error("Enrollment check failed:", err);
      alert(`An error occurred. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (router.isFallback) return <Layout><div className="p-10 text-center">Loading...</div></Layout>;
  
  if (error) {
    return (
      <Layout>
        <div className="p-20 text-center">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-red-700 font-bold text-xl mb-2">Error Loading Course</h2>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="p-20 text-center">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-slate-700 font-bold text-xl mb-2">Course Not Found</h2>
            <p className="text-slate-500">The course you are looking for does not exist or has been removed.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{`${course.title} | SkillSpring`}</title>
      </Head>

      {/* Header / Hero */}
      <div className="bg-slate-900 text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="inline-flex items-center px-3 py-1 rounded-md bg-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-wider mb-6 border border-violet-500/30">
                {course.level}
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                {course.title}
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="flex text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current opacity-50" />
                  </span>
                  <span className="text-white font-bold">{course.rating || 'New'}</span>
                  <span>({course.reviews?.length || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Created by <span className="text-white hover:underline cursor-pointer">{course.instructor?.full_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Last updated {mounted ? new Date(course.updated_at || course.created_at).toLocaleDateString() : '...'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Desktop Card Placeholder (Actual card is sticky below on desktop, but usually put here in design) */}
             <div className="hidden lg:block relative">
                {/* Visual placeholder, functionality is handled by the sticky card in main content area or we can put it here */}
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
               {/* Tabs */}
               <div className="flex items-center gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
                  {['overview', 'curriculum', 'instructor', 'reviews'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                        activeTab === tab 
                          ? 'border-violet-600 text-violet-600' 
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
               </div>

               {/* Tab Content */}
               <div className="min-h-[400px]">
                  {activeTab === 'overview' && (
                    <div className="animate-in fade-in duration-300">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Course Description</h3>
                      <div className="prose prose-slate max-w-none text-slate-600">
                        {/* We might render HTML here if description is rich text */}
                        <p>{course.description}</p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'curriculum' && (
                    <div className="animate-in fade-in duration-300 space-y-4">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Course Content</h3>
                        <span className="text-sm text-slate-500">
                          {course.course_sections?.length} sections • {course.course_sections?.reduce((acc, s) => acc + s.course_lessons.length, 0)} lessons
                        </span>
                      </div>
                      
                      {course.course_sections?.map((section, idx) => (
                        <div key={section.id} className="border border-slate-200 rounded-lg overflow-hidden">
                          <div className="bg-slate-50 px-6 py-4 flex justify-between items-center">
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                              {idx + 1}. {section.title}
                            </h4>
                            <span className="text-xs font-bold text-slate-400 uppercase">{section.course_lessons?.length} Lessons</span>
                          </div>
                          <div className="divide-y divide-slate-100">
                             {section.course_lessons?.map(lesson => (
                               <div key={lesson.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                 <div className="flex items-center gap-3">
                                   <PlayCircle className="h-4 w-4 text-slate-400 group-hover:text-violet-600" />
                                   <span className="text-slate-600 group-hover:text-slate-900 text-sm font-medium">{lesson.title}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   {lesson.is_preview ? (
                                      <span className="text-xs text-violet-600 font-bold bg-violet-50 px-2 py-1 rounded">Preview</span>
                                   ) : (
                                      <Lock className="h-3 w-3 text-slate-300" />
                                   )}
                                   <span className="text-xs text-slate-400">10:00</span>
                                 </div>
                               </div>
                             ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'instructor' && (
                    <div className="animate-in fade-in duration-300">
                       <div className="flex items-start gap-6">
                          <div className="w-20 h-20 bg-slate-200 rounded-full flex-shrink-0 overflow-hidden relative">
                              {course.instructor?.avatar_url ? (
                                <Image src={course.instructor.avatar_url} fill alt={course.instructor.full_name} className="object-cover" />
                              ) : (
                                <User className="w-full h-full p-4 text-slate-400" />
                              )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">{course.instructor?.full_name}</h3>
                            <p className="text-violet-600 font-medium mb-4">Instructor</p>
                            <div className="text-slate-600 text-sm leading-relaxed">
                              {course.instructor?.bio || "No bio available."}
                            </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="animate-in fade-in duration-300">
                       <h3 className="text-xl font-bold text-slate-900 mb-6">Student Reviews</h3>
                       
                       {/* Review Stats */}
                       <div className="flex items-center gap-4 mb-8">
                          <div className="flex flex-col items-center justify-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                             <span className="text-4xl font-black text-slate-900">{course.rating || '0.0'}</span>
                             <div className="flex text-amber-400 my-2">
                                {[1,2,3,4,5].map(star => (
                                   <Star key={star} className={`h-4 w-4 ${star <= Math.round(course.rating || 0) ? 'fill-current' : 'text-slate-300'}`} />
                                ))}
                             </div>
                             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{course.reviews?.length || 0} Ratings</span>
                          </div>
                          
                          {/* Add Review Form (Only if enrolled) */}
                          {isEnrolled ? (
                             <div className="flex-1 bg-violet-50 p-6 rounded-2xl border border-violet-100">
                                <h4 className="font-bold text-slate-900 mb-2">Write a Review</h4>
                                <ReviewForm courseId={course.id} onReviewAdded={() => router.reload()} />
                             </div>
                          ) : (
                             <div className="flex-1 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-500 italic">
                                Enroll in this course to leave a review.
                             </div>
                          )}
                       </div>

                       {/* Reviews List */}
                       <div className="space-y-6">
                          {course.reviews && course.reviews.length > 0 ? (
                             course.reviews.map(review => (
                                <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0">
                                   <div className="flex items-center gap-3 mb-2">
                                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                                         <User className="h-5 w-5 text-slate-400" />
                                      </div>
                                      <div>
                                         <h5 className="font-bold text-slate-900 text-sm">Student</h5>
                                         <div className="flex text-amber-400">
                                            {[1,2,3,4,5].map(star => (
                                               <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'fill-current' : 'text-slate-300'}`} />
                                            ))}
                                         </div>
                                      </div>
                                      <span className="ml-auto text-xs text-slate-400 font-medium">
                                         {new Date(review.created_at).toLocaleDateString()}
                                      </span>
                                   </div>
                                   <p className="text-slate-600 text-sm leading-relaxed pl-13">
                                      {review.comment}
                                   </p>
                                </div>
                             ))
                          ) : (
                             <p className="text-slate-500 italic">No reviews yet. Be the first to review!</p>
                          )}
                       </div>
                    </div>
                  )}
               </div>
            </div>

            {/* Sidebar / Checkout Card (Sticky) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl h-fit lg:-mt-32 relative z-10 sticky top-24">
               <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden mb-6 relative group cursor-pointer">
                  {course.thumbnail ? (
                     <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center bg-slate-200">
                        <PlayCircle className="h-12 w-12 text-slate-400 group-hover:scale-110 transition-transform" />
                     </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                     <PlayCircle className="h-16 w-16 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
                  </div>
               </div>

               <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="text-4xl font-black text-slate-900">
                        {course.price > 0 ? `$${course.price}` : 'Free'}
                     </span>
                     {course.price > 0 && <span className="text-lg text-slate-400 line-through decoration-2">$99.99</span>}
                  </div>
                  {course.price > 0 && (
                     <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded uppercase">80% Off</span>
                  )}
               </div>

               <div className="space-y-4 mb-8">
                 <button 
                   onClick={isEnrolled ? () => router.push(`/player/${course.id}`) : handleEnroll}
                   disabled={loading}
                   className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                   {loading ? 'Processing...' : (isEnrolled ? 'Go to Course' : 'Enroll Now')}
                 </button>
                 {/* {!isEnrolled && (
                    <button className="w-full py-4 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                       Add to Cart
                    </button>
                 )} */}
               </div>

               <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm">This course includes:</h4>
                  <ul className="space-y-3">
                     {[
                        `${course.course_sections?.reduce((a,c) => a + c.course_lessons.length, 0)} on-demand video lessons`,
                        'Full lifetime access',
                        'Access on mobile and TV',
                        'Certificate of completion'
                     ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                           <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                           <span>{item}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </div>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
    return {
        paths: [], // Generate no paths at build time, fetch all on-demand
        fallback: 'blocking' // Server-side render on first request, then cache
    };
}

export async function getStaticProps({ params }) {
  try {
    const { id } = params;
    console.log(`Fetching course with ID: ${id}`);
    
    const course = await courseApi.getCourseById(id);
    if (!course) {
      return { notFound: true };
    }

    return {
      props: {
        course,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Critical GetStaticProps Error:", error);
    return {
      props: {
        error: `${error.message}${error.stack ? ' | ' + error.stack.substring(0, 50) + '...' : ''}`
      },
      revalidate: 60,
    };
  }
}
