import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Star, 
  Users, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Play, 
  ChevronRight, 
  Globe, 
  Award, 
  MessageSquare,
  BarChart,
  ShieldCheck,
  Zap,
  ArrowRight,
  Link as LinkIcon,
  Smartphone
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { createSupabaseClient } from '@/lib/supabaseClient';

export default function CourseDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [user, setUser] = useState(null);
  const supabase = createSupabaseClient();

  // Fetch Course Data
  const fetchCourseData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // 1. Fetch Course with Instructor and Category
      const { data: courseDataRaw, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          users:instructor_id(full_name, avatar_url),
          categories:category_id(name)
        `)
        .eq('id', id)
        .maybeSingle();
      
      const courseData = courseDataRaw;

      if (courseError) throw courseError;

      // 2. Fetch Sections and Lessons
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('course_sections')
        .select(`
          *,
          lessons:course_lessons(*)
        `)
        .eq('course_id', id)
        .order('order', { ascending: true });

      if (sectionsError) throw sectionsError;

      // 3. Fetch Reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          users:user_id(full_name, avatar_url)
        `)
        .eq('course_id', id);

      if (reviewsError) throw reviewsError;

      // Transform data
      const transformedCourse = {
        ...courseData,
        subtitle: courseData.description || "Master the core concepts and advanced patterns of this subject.",
        instructor: {
          name: courseData.users?.full_name || 'Expert Instructor',
          avatar: courseData.users?.avatar_url || 'https://i.pravatar.cc/150?u=sarah',
          title: "Senior Instructor",
          bio: "Expert in this field with years of industry experience.",
          rating: 4.9,
          students: 12500,
          courses: 8
        },
        category_name: courseData.categories?.name || 'Development',
        curriculum: sectionsData.map(section => ({
          ...section,
          lessons: section.lessons.sort((a, b) => a.order - b.order)
        })),
        reviews: reviewsData.map(review => ({
          ...review,
          user: review.users?.full_name || 'Anonymous User',
          avatar: review.users?.avatar_url || `https://i.pravatar.cc/150?u=${review.id}`,
          date: new Date(review.created_at).toLocaleDateString()
        })),
        whatYoullLearn: [
          "Master core principles and best practices",
          "Build real-world projects from scratch",
          "Implement advanced optimization techniques",
          "Learn professional workflow and debugging",
          "Deploy your applications to production",
          "Understand architectural patterns"
        ],
        rating: 4.8,
        reviewsCount: reviewsData.length || 120,
        studentsCount: 4500,
        lastUpdated: new Date(courseData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        language: "English",
        duration: "12 Hours",
        oldPrice: (courseData.price * 1.5).toFixed(2)
      };

      setCourse(transformedCourse);
      
      // Set initial lesson
      if (transformedCourse.curriculum.length > 0 && transformedCourse.curriculum[0].lessons.length > 0) {
        setCurrentLesson(transformedCourse.curriculum[0].lessons[0].id);
      }
    } catch (err) {
      console.error('Error fetching course:', err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseData();
    
    // Check Auth and Enrollment/Progress
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user && id) {
        // Fetch Enrollment
        const { data: enrollDataRaw } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', id)
          .maybeSingle();
        
        const enrollData = enrollDataRaw;
        
        if (enrollData) {
          setIsEnrolled(true);
          // Fetch Progress
          const { data: progressData } = await supabase
            .from('lesson_progress')
            .select('lesson_id')
            .eq('enrollment_id', enrollData.id)
            .eq('is_completed', true);
          
          if (progressData) {
            setCompletedLessons(progressData.map(p => p.lesson_id));
          }
        }
      }
    };
    checkStatus();
  }, [fetchCourseData, id]);

  const [isEnrolled, setIsEnrolled] = useState(false);

  const handleEnroll = async () => {
    if (!user) {
      window.location.href = 'https://skill-spring-eight.vercel.app/login';
      return;
    }
    
    try {
      const { data: enrollmentData, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: id,
          status: 'active'
        })
        .select()
        .maybeSingle();
      
      if (error) throw error;
      setIsEnrolled(true);
    } catch (err) {
      alert('Error enrolling: ' + err.message);
    }
  };

  const toggleLesson = async (lessonId) => {
    if (!isEnrolled) return;

    const isCompleted = completedLessons.includes(lessonId);
    setCompletedLessons(prev => 
      isCompleted ? prev.filter(id => id !== lessonId) : [...prev, lessonId]
    );

    try {
      // Get enrollment ID
      const { data: enrollData } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', id)
        .eq('user_id', user.id)
        .single();

      if (enrollData) {
        const { error } = await supabase
          .from('lesson_progress')
          .upsert({
            enrollment_id: enrollData.id,
            lesson_id: lessonId,
            is_completed: !isCompleted,
            updated_at: new Date().toISOString()
          }, { onConflict: 'enrollment_id,lesson_id' });
        
        if (error) throw error;
      }
    } catch (err) {
      console.error('Error updating progress:', err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Loading course excellence...</p>
        </div>
      </div>
    );
  }

  if (!course) return <div className="p-20 text-center font-black">Course not found.</div>;

  const totalLessonsCount = course.curriculum?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
  const progressPercent = totalLessonsCount > 0 ? Math.round((completedLessons.length / totalLessonsCount) * 100) : 0;

  return (
    <div className="bg-slate-50 min-h-screen font-inter pb-20">
      {/* Dynamic Header / Hero Area */}
      <section className="bg-slate-900 text-white py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-violet-600/10 skew-x-12 translate-x-1/4"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
               {/* Breadcrumbs */}
               <nav className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-violet-400 mb-8">
                  <Link href="/courses">Courses</Link>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-white">Development</span>
               </nav>

               <h1 className="text-3xl sm:text-5xl font-black mb-6 leading-tight tracking-tight">
                 {course.title}
               </h1>
               <p className="text-lg text-slate-300 mb-8 max-w-2xl font-medium leading-relaxed">
                 {course.subtitle}
               </p>

               <div className="flex flex-wrap items-center gap-6 mb-8 text-sm">
                  <div className="flex items-center bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-1 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-violet-900/50">
                    <Star className="h-3.5 w-3.5 mr-1.5 fill-current" />
                    {course.rating} ({course.reviewsCount} Reviews)
                  </div>
                  <div className="flex items-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">
                     <Users className="h-4 w-4 mr-2 text-violet-400" />
                     {course.studentsCount.toLocaleString()} Students
                  </div>
                  <div className="flex items-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">
                     <ShieldCheck className="h-4 w-4 mr-2 text-violet-400" />
                     Last updated {course.lastUpdated}
                  </div>
                  <div className="flex items-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">
                     <Globe className="h-4 w-4 mr-2 text-violet-400" />
                     {course.language}
                  </div>
               </div>

               <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-violet-500 shadow-xl">
                    <img src={course.instructor.avatar} alt={course.instructor.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-violet-400 uppercase tracking-widest text-[10px] mb-0.5">Created by</p>
                    <p className="font-black text-white">{course.instructor.name}</p>
                  </div>
               </div>
            </div>

            {/* Sidebar Sticky Card (Mobile & Tablet) */}
            <div className="lg:hidden">
               <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                  <div className="relative h-56">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group cursor-pointer transition-colors hover:bg-black/60">
                       <Play className="h-16 w-16 text-white bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-full p-5 shadow-2xl shadow-violet-500 transform transition group-hover:scale-110" />
                    </div>
                  </div>
                  <div className="p-8">
                     <div className="flex items-center justify-between mb-8">
                        <div>
                          <span className="text-3xl font-black text-slate-900">${course.price}</span>
                          <span className="ml-2 text-slate-400 line-through font-bold text-lg">${course.oldPrice}</span>
                        </div>
                        <span className="bg-green-100 text-green-700 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">45% OFF</span>
                     </div>
                      <button 
                         onClick={handleEnroll}
                         className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95 mb-4 ${
                           isEnrolled 
                             ? 'bg-green-100 text-green-700 border border-green-200' 
                             : 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-violet-200 hover:brightness-110'
                         }`}
                      >
                        {isEnrolled ? 'Successfully Enrolled' : 'Enroll Now'}
                      </button>
                     <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">30-Day Money-Back Guarantee</p>
                     <div className="space-y-4">
                        <div className="flex items-center text-sm font-bold text-slate-700">
                          <Clock className="h-4 w-4 mr-3 text-violet-600" /> {course.duration} on-demand video
                        </div>
                        <div className="flex items-center text-sm font-bold text-slate-700">
                          <Zap className="h-4 w-4 mr-3 text-violet-600" /> Full lifetime access
                        </div>
                        <div className="flex items-center text-sm font-bold text-slate-700">
                          <Award className="h-4 w-4 mr-3 text-violet-600" /> Certificate of completion
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-12">
             {/* Tabs Toggle */}
             <div className="flex space-x-8 border-b border-gray-200 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
                {['Overview', 'Curriculum', 'Instructor', 'Reviews'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${
                      activeTab === tab.toLowerCase() ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
             </div>

             {/* Overview TabContent */}
             {activeTab === 'overview' && (
               <div className="space-y-12">
                  <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-gray-100 shadow-xl shadow-slate-200/40">
                    <h3 className="text-2xl font-black text-slate-900 mb-8">What you'll learn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {course.whatYoullLearn.map((item, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-600 font-medium text-sm leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-900">Course Description</h3>
                    <div className="text-slate-600 font-medium leading-[1.8] space-y-4">
                      <p>This comprehensive course is designed for developers who want to stay at the cutting edge of modern web development. We don't just teach syntax; we teach architectural patterns and performance optimizations that separate the pros from the beginners.</p>
                      <p>Throughout the modules, you will build a real-world enterprise application from scratch, discovering how to manage complex state, implement secure authentication, and leverage the power of Next.js 16 to deliver lightning-fast user experiences.</p>
                    </div>
                  </div>
               </div>
             )}

            {/* Curriculum TabContent */}
            {activeTab === 'curriculum' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-2xl shadow-violet-200">
                   <div className="relative z-10">
                      <div className="flex justify-between items-end mb-4">
                         <div>
                            <p className="text-violet-100 text-xs font-black uppercase tracking-widest mb-1">Your Progress</p>
                            <h3 className="text-3xl font-black">{progressPercent}% Completed</h3>
                         </div>
                         <p className="text-sm font-bold text-violet-100">{completedLessons.length} of {totalLessonsCount} Lessons</p>
                      </div>
                      <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-white transition-all duration-1000 ease-out" 
                           style={{ width: `${progressPercent}%` }}
                         ></div>
                      </div>
                   </div>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                </div>

                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-2xl font-black text-slate-900">Course Content</h3>
                   <span className="text-xs font-black uppercase tracking-widest text-slate-400">{course.lessons} lessons • {course.duration}</span>
                </div>
                {course.curriculum.map((module, idx) => (
                   <div key={module.id} className="bg-white rounded-3xl border border-gray-100 mb-4 overflow-hidden shadow-sm">
                      <div className="p-6 bg-slate-50 border-b border-gray-100 flex justify-between items-center cursor-pointer group">
                         <h4 className="font-black text-slate-800 flex items-center">
                            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs mr-3">{idx + 1}</span>
                            {module.title}
                         </h4>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{module.lessons.length} sections</span>
                      </div>
                      <div className="divide-y divide-gray-50">
                         {module.lessons.map((lesson) => (
                            <div 
                              key={lesson.id} 
                              className={`p-5 flex justify-between items-center transition-all group ${
                                currentLesson === lesson.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                              }`}
                              onClick={() => setCurrentLesson(lesson.id)}
                            >
                               <div className="flex items-center space-x-4">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); toggleLesson(lesson.id); }}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                      completedLessons.includes(lesson.id) 
                                        ? 'bg-green-500 border-green-500 text-white' 
                                        : 'border-slate-200 hover:border-indigo-400'
                                    }`}
                                  >
                                    {completedLessons.includes(lesson.id) && <CheckCircle className="h-4 w-4 fill-current" />}
                                  </button>
                                  <div className="flex items-center space-x-3">
                                    {lesson.isPreview ? <Play className={`h-4 w-4 ${currentLesson === lesson.id ? 'text-indigo-600' : 'text-slate-400'}`} /> : <ShieldCheck className="h-4 w-4 text-slate-300" />}
                                    <span className={`text-sm font-bold ${
                                      currentLesson === lesson.id ? 'text-indigo-700' : 'text-slate-700 group-hover:text-slate-900'
                                    }`}>
                                      {lesson.title}
                                    </span>
                                  </div>
                               </div>
                               <div className="flex items-center space-x-6">
                                  {lesson.isPreview && <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 underline">Preview</span>}
                                  <span className="text-xs font-medium text-slate-400">{lesson.duration}</span>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                ))}
              </div>
            )}

            {/* Instructor TabContent */}
             {activeTab === 'instructor' && (
                <div className="bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-xl shadow-slate-200/40 animate-in fade-in duration-500">
                   <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                      <div className="h-32 w-32 rounded-3xl overflow-hidden border-4 border-indigo-50 shadow-2xl skew-y-3">
                        <img src={course.instructor.avatar} alt={course.instructor.name} className="w-full h-full object-cover -skew-y-3 scale-110" />
                      </div>
                       <div className="text-center md:text-left">
                        <h3 className="text-2xl font-black text-slate-900 mb-1">{course.instructor.name}</h3>
                        <p className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500 font-bold text-sm mb-4 uppercase tracking-widest">{course.instructor.title}</p>
                        <div className="flex items-center justify-center md:justify-start space-x-6 text-xs font-black uppercase tracking-widest text-slate-400">
                           <div className="flex items-center"><Star className="h-4 w-4 mr-1 text-amber-500 fill-current" /> {course.instructor.rating} Rating</div>
                           <div className="flex items-center"><Users className="h-4 w-4 mr-1 text-violet-400" /> {course.instructor.students.toLocaleString()} Students</div>
                           <div className="flex items-center"><BookOpen className="h-4 w-4 mr-1 text-violet-400" /> {course.instructor.courses} Courses</div>
                        </div>
                      </div>
                   </div>
                   <p className="text-slate-600 font-medium leading-relaxed italic border-l-4 border-violet-100 pl-6">"{course.instructor.bio}"</p>
                </div>
             )}

            {/* Reviews TabContent */}
             {activeTab === 'reviews' && (
                <div className="space-y-12 animate-in fade-in duration-500">
                   {/* Rating Breakdown */}
                   <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-gray-100 shadow-xl shadow-slate-200/40 divide-y divide-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-10">
                         <div className="text-center md:border-r border-gray-100">
                            <h4 className="text-6xl font-black text-slate-900 mb-2">{course.rating}</h4>
                            <div className="flex justify-center text-amber-500 mb-2">
                               {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 fill-current" />)}
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Course Rating</p>
                         </div>
                         <div className="md:col-span-2 space-y-3">
                            {[
                               { star: 5, weight: "85%" },
                               { star: 4, weight: "12%" },
                               { star: 3, weight: "2%" },
                               { star: 2, weight: "1%" },
                               { star: 1, weight: "0%" }
                            ].map(row => (
                               <div key={row.star} className="flex items-center text-sm">
                                  <div className="w-12 font-bold text-slate-600 flex items-center">{row.star} <Star className="h-3 w-3 ml-1 fill-current" /></div>
                                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden mx-4">
                                     <div className="h-full bg-amber-400" style={{ width: row.weight }}></div>
                                  </div>
                                  <div className="w-10 font-black text-slate-400 text-xs">{row.weight}</div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Individual Reviews */}
                   <div className="space-y-8">
                      {course.reviews.map(review => (
                        <div key={review.id} className="bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center space-x-4">
                                 <img src={review.avatar} alt={review.user} className="w-14 h-14 rounded-2xl object-cover" />
                                 <div>
                                    <h5 className="font-black text-slate-900">{review.user}</h5>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{review.date}</p>
                                 </div>
                              </div>
                              <div className="flex text-amber-500">
                                 {Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                              </div>
                           </div>
                           <p className="text-slate-600 font-medium leading-relaxed italic border-l-4 border-indigo-100 pl-6">
                             "{review.comment}"
                           </p>
                        </div>
                      ))}
                   </div>
                </div>
             )}
          </div>

          {/* Sticky Sidebar - Desktop */}
          <div className="hidden lg:block relative">
             <div className="sticky top-28">
                <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-900/10 border border-gray-100 transform transition-transform hover:scale-[1.02] duration-500">
                  <div className="relative h-64 group cursor-pointer">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                       <Play className="h-16 w-16 text-white bg-indigo-600 rounded-full p-5 shadow-2xl shadow-indigo-500 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <div className="p-10">
                     <div className="flex items-center justify-between mb-8">
                        <div>
                          <span className="text-4xl font-black text-slate-900">${course.price}</span>
                          <span className="ml-2 text-slate-400 line-through font-bold text-lg">${course.oldPrice}</span>
                        </div>
                        <span className="bg-indigo-100 text-indigo-700 font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-widest border border-indigo-200 italic">-45%</span>
                     </div>
                      <button 
                        onClick={handleEnroll}
                        className={`w-full py-5 rounded-2xl font-black text-xl shadow-2xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center mb-6 ${
                          isEnrolled 
                            ? 'bg-slate-100 text-slate-500 cursor-default' 
                            : 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-violet-200 hover:brightness-110'
                        }`}
                      >
                        {isEnrolled ? (
                          <>Enrolled <CheckCircle className="ml-3 h-6 w-6" /></>
                        ) : (
                          <>Enroll Now <ArrowRight className="ml-3 h-6 w-6" /></>
                        )}
                      </button>
                     <p className="text-center text-xs text-slate-400 font-black uppercase tracking-widest mb-10">Instant Access Available</p>
                     
                     <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Included in this course:</h4>
                     <div className="space-y-5">
                        <div className="flex items-center text-sm font-bold text-slate-600">
                          <Clock className="h-4 w-4 mr-4 text-indigo-600" /> 
                          <span>{course.duration} on-demand video</span>
                        </div>
                        <div className="flex items-center text-sm font-bold text-slate-600">
                          <BarChart className="h-4 w-4 mr-4 text-indigo-600" /> 
                          <span>{course.level} Specialization</span>
                        </div>
                        <div className="flex items-center text-sm font-bold text-slate-600">
                          <Smartphone className="h-4 w-4 mr-4 text-indigo-600" /> 
                          <span>Access on mobile and TV</span>
                        </div>
                        <div className="flex items-center text-sm font-bold text-slate-600">
                          <MessageSquare className="h-4 w-4 mr-4 text-indigo-600" /> 
                          <span>Q&A with Instructor</span>
                        </div>
                        <div className="flex items-center text-sm font-bold text-slate-600">
                          <Award className="h-4 w-4 mr-4 text-indigo-600" /> 
                          <span>Certificate of completion</span>
                        </div>
                     </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
