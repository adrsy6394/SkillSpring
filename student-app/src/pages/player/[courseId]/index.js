import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { courseApi } from '@/services/courseApi';
import { enrollmentApi } from '@/services/enrollmentApi';
import { useAuth } from '@/context/AuthContext';
import { 
  PlayCircle, CheckCircle, ChevronLeft, ChevronRight, 
  Menu, X, Lock, BookOpen 
} from 'lucide-react';
import Link from 'next/link';

export default function CoursePlayer() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { courseId, lesson: lessonParam } = router.query;
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 


  useEffect(() => {
    if (!router.isReady || authLoading || !user) return;

    const initPlayer = async () => {
      try {
        // 1. Get enrollment
        const { data: enrollmentData, error: enrollError } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId);

        const enrollment = enrollmentData && enrollmentData.length > 0 ? enrollmentData[0] : null;

        if (enrollError || !enrollment) {
          router.push(`/student/courses/${courseId}`);
          return;
        }

        // 2. Fetch course data
        const courseData = await courseApi.getCourseById(courseId);
        setCourse(courseData);

        // 3. Fetch progress using the enrollment ID
        const { data: progressData } = await supabase
            .from('lesson_progress')
            .select('lesson_id')
            .eq('enrollment_id', enrollment.id)
            .eq('is_completed', true);
        
        let completedSet = new Set();
        if (progressData) {
            completedSet = new Set(progressData.map(p => p.lesson_id));
            setCompletedLessons(completedSet);
        }

        // 4. Set current lesson
        if (courseData.course_sections?.length > 0) {
           const allLessons = courseData.course_sections.flatMap(s => s.course_lessons);
           const firstLesson = allLessons[0];
           
           if (lessonParam) {
             const found = allLessons.find(l => l.id === lessonParam);
             setCurrentLesson(found || firstLesson);
           } else {
             const firstUncompleted = allLessons.find(l => !completedSet.has(l.id));
             setCurrentLesson(firstUncompleted || firstLesson);
           }
        }

      } catch (error) {
        console.error("Player error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initPlayer();
  }, [router.isReady, authLoading, user, courseId, lessonParam]); // Re-run if courseId or lessonParam changes

  const handleLessonChange = (lesson) => {
     setCurrentLesson(lesson);
     // Update URL without reload
     router.push({
        pathname: `/player/${courseId}`,
        query: { lesson: lesson.id }
     }, undefined, { shallow: true });
     
     // On mobile, close sidebar after selection
     if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const markComplete = async () => {
    if (!currentLesson) {
        console.warn("markComplete: No current lesson selected");
        return;
    }
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log("markComplete: Triggered", { 
            userId: user?.id, 
            lessonId: currentLesson.id, 
            courseId: courseId 
        });
        
        await enrollmentApi.markLessonComplete(user.id, currentLesson.id, courseId);
        
        // Update local state
        const newCompleted = new Set(completedLessons);
        newCompleted.add(currentLesson.id);
        setCompletedLessons(newCompleted);
        alert("Lesson marked as complete!");
        
    } catch (error) {
        console.error("Failed to mark complete:", error);
        alert("Failed to mark complete: " + (error.message || "Unknown error"));
    }
  };

  const findNextLesson = () => {
     if (!course || !currentLesson) return null;
     const allLessons = course.course_sections.flatMap(s => s.course_lessons);
     const idx = allLessons.findIndex(l => l.id === currentLesson.id);
     return allLessons[idx + 1] || null;
  };

  const findPrevLesson = () => {
    if (!course || !currentLesson) return null;
    const allLessons = course.course_sections.flatMap(s => s.course_lessons);
    const idx = allLessons.findIndex(l => l.id === currentLesson.id);
    return allLessons[idx - 1] || null;
 };

  if (isLoading) return <div className="h-screen bg-black flex items-center justify-center text-white">Loading Player...</div>;
  if (!course) return <div className="text-center p-10">Course not found</div>;

  const nextLesson = findNextLesson();
  const prevLesson = findPrevLesson();

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden font-sans">
      <Head>
        <title>{currentLesson?.title || 'Course Player'} | {course.title}</title>
      </Head>

      {/* Sidebar (Curriculum) */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-80 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
        ${!isSidebarOpen && 'md:hidden'} 
      `}>
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900">
             <Link href="/student/dashboard" className="flex items-center text-slate-400 hover:text-white transition-colors">
                <ChevronLeft className="h-5 w-5 mr-1" />
                <span className="font-bold text-sm">Back to Dashboard</span>
             </Link>
             <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
                <X className="h-6 w-6 text-slate-400" />
             </button>
          </div>

          {/* Curriculum List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
             <div className="p-4">
                <h2 className="font-bold text-lg mb-1 line-clamp-2">{course.title}</h2>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 mb-6">
                    <div 
                        className="bg-violet-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${(completedLessons.size / course.course_sections.reduce((a,s)=>a+s.course_lessons.length,0)) * 100}%` }} 
                    />
                </div>
             </div>

             <div className="space-y-1">
                {course.course_sections.map((section, sIdx) => (
                    <div key={section.id}>
                       <div className="px-4 py-3 bg-slate-800/50 text-xs font-bold uppercase text-slate-400 tracking-wider">
                          Section {sIdx + 1}: {section.title}
                       </div>
                       <div>
                          {section.course_lessons.map((lesson, lIdx) => (
                             <button
                               key={lesson.id}
                               onClick={() => handleLessonChange(lesson)}
                               className={`w-full flex items-start px-4 py-3 text-left hover:bg-slate-800 transition-colors border-l-2
                                 ${currentLesson?.id === lesson.id ? 'border-violet-500 bg-slate-800' : 'border-transparent'}
                               `}
                             >
                                <div className="mt-0.5 mr-3 flex-shrink-0">
                                   {completedLessons.has(lesson.id) ? (
                                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                                   ) : (
                                      lesson.is_preview ? <PlayCircle className="h-4 w-4 text-slate-500" /> : <Lock className="h-4 w-4 text-slate-600" />
                                   )}
                                </div>
                                <div>
                                   <div className={`text-sm font-medium ${currentLesson?.id === lesson.id ? 'text-white' : 'text-slate-400'}`}>
                                      {lIdx + 1}. {lesson.title}
                                   </div>
                                   <div className="text-xs text-slate-600 mt-1">10 min</div>
                                </div>
                             </button>
                          ))}
                       </div>
                    </div>
                ))}
             </div>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Top Bar (Mobile Toggle) */}
          <div className="md:hidden h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4">
             <button onClick={() => setIsSidebarOpen(true)} className="mr-4">
                <Menu className="h-6 w-6 text-white" />
             </button>
             <span className="font-bold truncate">{currentLesson?.title}</span>
          </div>

          {/* Video Player Container */}
          <div className="flex-1 bg-black flex items-center justify-center relative group">
              {currentLesson ? (
                 currentLesson.video_url ? (
                     <div className="w-full h-full"> 
                        {/* Placeholder for real video player (e.g. Vimeo/YouTube iframe) */}
                        {/* For MVP, we can treat it as a video tag if direct link, or iframe if embed */}
                         <iframe 
                           src={currentLesson.video_url.includes('youtube') ? currentLesson.video_url.replace('watch?v=', 'embed/') : currentLesson.video_url} 
                           className="w-full h-full border-none"
                           allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                           allowFullScreen
                         />
                     </div>
                 ) : (
                    <div className="text-center px-4">
                       <PlayCircle className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                       <h3 className="text-xl font-bold text-slate-400">Video not available</h3>
                       <p className="text-slate-600 max-w-sm mx-auto mt-2">
                          The instructor hasn't uploaded a video for this lesson yet.
                       </p>
                    </div>
                 )
              ) : (
                 <div className="text-slate-500">Select a lesson to start watching</div>
              )}
          </div>

          {/* Bottom Bar (Controls) */}
          <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-6 sm:px-10">
              <button 
                 onClick={() => prevLesson && handleLessonChange(prevLesson)}
                 disabled={!prevLesson}
                 className="flex items-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors font-bold"
              >
                 <ChevronLeft className="h-5 w-5 mr-2" />
                 Previous
              </button>

              <button 
                 onClick={markComplete}
                 disabled={completedLessons.has(currentLesson?.id)}
                 className={`
                    px-6 py-2.5 rounded-full font-bold transition-all transform active:scale-95
                    ${completedLessons.has(currentLesson?.id) 
                       ? 'bg-emerald-500/10 text-emerald-500 cursor-default' 
                       : 'bg-violet-600 text-white hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-900/20'
                    }
                 `}
              >
                 {completedLessons.has(currentLesson?.id) ? (
                    <span className="flex items-center">
                       <CheckCircle className="h-4 w-4 mr-2" /> Completed
                    </span>
                 ) : (
                    "Mark as Complete"
                 )}
              </button>

              <button 
                 onClick={() => nextLesson && handleLessonChange(nextLesson)}
                 disabled={!nextLesson}
                 className="flex items-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors font-bold"
              >
                 Next
                 <ChevronRight className="h-5 w-5 ml-2" />
              </button>
          </div>
      </div>
    </div>
  );
}
