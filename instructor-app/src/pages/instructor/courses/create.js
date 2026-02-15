import InstructorLayout from '@/components/InstructorLayout';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@/lib/supabaseClient';
import { 
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  BookOpen,
  List,
  Send,
  Image as ImageIcon
} from 'lucide-react';

const STEPS = ['Basic Info', 'Curriculum', 'Review & Submit'];

export default function CreateCourse() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const supabase = createClient();

  // Form data
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category_id: '',
    level: 'Beginner',
    price: 0,
    thumbnail_url: '',
  });

  const [sections, setSections] = useState([
    { title: '', lessons: [{ title: '', video_url: '', duration: '', is_free: false }] }
  ]);

  useEffect(() => {
    if (!loading && (!user || role !== 'instructor')) {
      router.push('/login');
    } else if (user) {
      fetchCategories();
    }
  }, [user, role, loading, router]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    setCategories(data || []);
  };

  const handleAddSection = () => {
    setSections([...sections, { title: '', lessons: [{ title: '', video_url: '', duration: '', is_free: false }] }]);
  };

  const handleRemoveSection = (sectionIdx) => {
    setSections(sections.filter((_, idx) => idx !== sectionIdx));
  };

  const handleAddLesson = (sectionIdx) => {
    const newSections = [...sections];
    newSections[sectionIdx].lessons.push({ title: '', video_url: '', duration: '', is_free: false });
    setSections(newSections);
  };

  const handleRemoveLesson = (sectionIdx, lessonIdx) => {
    const newSections = [...sections];
    newSections[sectionIdx].lessons = newSections[sectionIdx].lessons.filter((_, idx) => idx !== lessonIdx);
    setSections(newSections);
  };

  const handleSectionChange = (sectionIdx, field, value) => {
    const newSections = [...sections];
    newSections[sectionIdx][field] = value;
    setSections(newSections);
  };

  const handleLessonChange = (sectionIdx, lessonIdx, field, value) => {
    const newSections = [...sections];
    newSections[sectionIdx].lessons[lessonIdx][field] = value;
    setSections(newSections);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 1. Create course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert([{
          ...courseData,
          instructor_id: user.id,
          status: 'pending'
        }])
        .select()
        .single();

      if (courseError) throw courseError;

      // 2. Create sections and lessons
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const { data: sectionData, error: sectionError } = await supabase
          .from('course_sections')
          .insert([{
            course_id: course.id,
            title: section.title,
            order: i + 1
          }])
          .select()
          .single();

        if (sectionError) throw sectionError;

        for (let j = 0; j < section.lessons.length; j++) {
          const lesson = section.lessons[j];
          const { error: lessonError } = await supabase
            .from('course_lessons')
            .insert([{
              section_id: sectionData.id,
              ...lesson,
              order: j + 1
            }]);

          if (lessonError) throw lessonError;
        }
      }

      alert('Course submitted for approval!');
      router.push('/instructor/courses');
    } catch (err) {
      alert('Error creating course: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <InstructorLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">Create New Course</h1>
          <p className="text-slate-400 font-medium text-sm mt-2">
            Build your course curriculum and submit for review.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => (
              <div key={idx} className="flex items-center flex-1">
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${
                    idx <= currentStep 
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg' 
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`font-bold text-sm ${idx <= currentStep ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${idx < currentStep ? 'bg-violet-600' : 'bg-slate-100'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/5 border border-gray-100">
          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-violet-50 p-3 rounded-2xl">
                  <BookOpen className="h-6 w-6 text-violet-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 font-outfit">Course Basics</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Course Title</label>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                    placeholder="e.g., Complete Web Development Bootcamp"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-violet-100 outline-none transition-all font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                  <textarea
                    value={courseData.description}
                    onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                    placeholder="Describe what students will learn..."
                    rows={4}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-violet-100 outline-none transition-all font-medium text-slate-900 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                    <select
                      value={courseData.category_id}
                      onChange={(e) => setCourseData({...courseData, category_id: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-violet-100 outline-none transition-all font-medium text-slate-900 cursor-pointer"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Level</label>
                    <select
                      value={courseData.level}
                      onChange={(e) => setCourseData({...courseData, level: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-violet-100 outline-none transition-all font-medium text-slate-900 cursor-pointer"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={courseData.price}
                      onChange={(e) => setCourseData({...courseData, price: parseFloat(e.target.value)})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-violet-100 outline-none transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Thumbnail URL</label>
                    <input
                      type="url"
                      value={courseData.thumbnail_url}
                      onChange={(e) => setCourseData({...courseData, thumbnail_url: e.target.value})}
                      placeholder="https://..."
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-violet-100 outline-none transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Curriculum */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-violet-50 p-3 rounded-2xl">
                    <List className="h-6 w-6 text-violet-600" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 font-outfit">Build Curriculum</h2>
                </div>
                
                <button
                  onClick={handleAddSection}
                  className="flex items-center space-x-2 px-6 py-3 bg-violet-600 text-white font-black rounded-2xl hover:brightness-110 transition-all text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Section</span>
                </button>
              </div>

              <div className="space-y-8">
                {sections.map((section, sectionIdx) => (
                  <div key={sectionIdx} className="bg-slate-50 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleSectionChange(sectionIdx, 'title', e.target.value)}
                        placeholder={`Section ${sectionIdx + 1} Title`}
                        className="flex-1 px-5 py-3 bg-white text-black border-none rounded-2xl focus:ring-4 focus:ring-violet-100 outline-none transition-all font-bold text-slate-500"
                      />
                      <button
                        onClick={() => handleRemoveSection(sectionIdx)}
                        className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-3 ml-6">
                      {section.lessons.map((lesson, lessonIdx) => (
                        <div key={lessonIdx} className="bg-white rounded-2xl p-4 flex items-center gap-4">
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) => handleLessonChange(sectionIdx, lessonIdx, 'title', e.target.value)}
                              placeholder="Lesson title"
                              className="px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-violet-100 outline-none text-sm font-medium text-black"
                            />
                            <input
                              type="url"
                              value={lesson.video_url}
                              onChange={(e) => handleLessonChange(sectionIdx, lessonIdx, 'video_url', e.target.value)}
                              placeholder="Video URL"
                              className="px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-violet-100 outline-none text-sm font-medium text-black"
                            />
                            <input
                              type="text"
                              value={lesson.duration}
                              onChange={(e) => handleLessonChange(sectionIdx, lessonIdx, 'duration', e.target.value)}
                              placeholder="Duration (e.g., 10:30)"
                              className="px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-violet-100 outline-none text-sm font-medium text-black"
                            />
                          </div>
                          
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={lesson.is_free}
                              onChange={(e) => handleLessonChange(sectionIdx, lessonIdx, 'is_free', e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-xs font-bold text-slate-500">Free</span>
                          </label>

                          <button
                            onClick={() => handleRemoveLesson(sectionIdx, lessonIdx)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => handleAddLesson(sectionIdx)}
                        className="w-full px-4 py-3 bg-white border-2 border-dashed border-violet-200 text-violet-600 font-bold rounded-2xl hover:border-violet-400 hover:bg-violet-50 transition-all text-sm flex items-center justify-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Lesson</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-violet-50 p-3 rounded-2xl">
                  <Send className="h-6 w-6 text-violet-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 font-outfit">Review & Submit</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 rounded-3xl p-6">
                  <h3 className="font-black text-lg text-slate-900 mb-4">Course Details</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-slate-500 font-bold text-sm">Title:</dt>
                      <dd className="text-slate-900 font-bold">{courseData.title}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500 font-bold text-sm">Level:</dt>
                      <dd className="text-slate-900 font-bold">{courseData.level}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500 font-bold text-sm">Price:</dt>
                      <dd className="text-slate-900 font-bold">₹{courseData.price}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500 font-bold text-sm">Sections:</dt>
                      <dd className="text-slate-900 font-bold">{sections.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500 font-bold text-sm">Total Lessons:</dt>
                      <dd className="text-slate-900 font-bold">{sections.reduce((acc, s) => acc + s.lessons.length, 0)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
                  <p className="text-amber-900 font-bold text-sm">
                    Your course will be submitted for admin review. You'll be notified once it's approved or if changes are needed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100">
            {currentStep > 0 ? (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center space-x-2 px-6 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all text-sm"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
            ) : <div />}

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-black rounded-2xl shadow-2xl shadow-violet-200 hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                <span>Continue</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black rounded-2xl shadow-2xl shadow-emerald-200 hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                <Send className="h-5 w-5" />
                <span>{submitting ? 'Submitting...' : 'Submit for Approval'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}
