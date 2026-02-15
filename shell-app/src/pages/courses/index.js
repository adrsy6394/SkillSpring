import { useEffect, useState } from 'react';
import { Search, Filter, ChevronDown, SlidersHorizontal, Star, X } from 'lucide-react';
import CourseCard from '@/components/CourseCard';
import { useRouter } from 'next/router';
import { createSupabaseClient } from '@/lib/supabaseClient';

export default function CourseMarketplace() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          users:instructor_id(full_name),
          categories:category_id(name),
          sections:course_sections(
            lessons:course_lessons(id)
          )
        `)
        .eq('status', 'approved');

      if (error) throw error;

      // Transform data to match CourseCard expectations
      const transformedCourses = data.map(course => ({
        id: course.id,
        title: course.title,
        instructor: course.users?.full_name || 'Unknown Instructor',
        price: course.price,
        rating: 4.8, // Mocking these for now as they require complex aggregation
        reviewsCount: 120, // Mocking
        lessonsCount: course.sections?.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) || 0,
        level: course.level,
        category: course.categories?.name || 'General',
        thumbnail: course.thumbnail_url || "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&q=80&w=800"
      }));

      setCourses(transformedCourses);
    } catch (err) {
      console.error('Error fetching courses:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady && router.query.q) {
      setSearchQuery(router.query.q);
    }
  }, [router.isReady, router.query.q]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-12 font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Area */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500">Marketplace</span></h1>
          <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px] bg-violet-50 inline-block px-3 py-1 rounded-full text-violet-600">Find the perfect course to advance your career.</p>
        </div>

        {/* Search & Mobile Filter Toggle */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-grow group flex items-center bg-white border border-gray-100 rounded-3xl p-1.5 focus-within:ring-4 focus-within:ring-violet-100 transition-all shadow-sm">
            <div className="pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Search courses, instructors, or skills..."
              className="w-full pl-4 pr-4 py-3 bg-transparent border-none outline-none font-bold text-slate-900 placeholder-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-violet-100">
              Search
            </button>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden flex items-center justify-center space-x-2 px-8 py-4 bg-white border border-gray-100 text-slate-900 rounded-[2rem] font-black shadow-sm"
          >
            <SlidersHorizontal className="h-5 w-5 text-violet-600" />
            <span className="uppercase tracking-widest text-xs">Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Categories</h3>
              <div className="space-y-2">
                {['All', 'Development', 'Design', 'Data Science', 'Marketing', 'Business'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`block w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      selectedCategory === cat ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-200' : 'text-slate-600 hover:bg-white hover:text-violet-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Course Level</h3>
              <div className="space-y-2">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                  <button 
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`block w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      selectedLevel === lvl ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-200' : 'text-slate-600 hover:bg-white hover:text-violet-600'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* <div className="bg-indigo-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Offer</p>
                 <h4 className="text-xl font-black mb-4">Upgrade Your Skills</h4>
                 <p className="text-xs text-indigo-200 font-medium mb-6">Get 50% off on all Advanced level courses today.</p>
                 <button className="w-full py-3 bg-white text-indigo-900 rounded-xl font-black text-xs hover:bg-indigo-50 transition-colors uppercase tracking-widest">Enroll Now</button>
               </div>
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
            </div> */}
          </aside>

          {/* Course Grid */}
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                Showing <span className="text-slate-900">{filteredCourses.length}</span> Results
              </p>
              
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching excellence...</p>
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No Courses Found</h3>
                <p className="text-slate-500 font-medium">Try adjusting your search or filters to find what you're looking for.</p>
                <button 
                  onClick={() => {setSearchQuery(''); setSelectedCategory('All'); setSelectedLevel('All');}}
                  className="mt-8 px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-violet-100"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900">Filters</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-50 rounded-xl">
                  <X className="h-6 w-6 text-slate-600" />
                </button>
              </div>

              <div className="space-y-10">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Categories</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {['All', 'Development', 'Design', 'Data Science', 'Marketing', 'Business'].map(cat => (
                      <button 
                        key={cat}
                        onClick={() => {setSelectedCategory(cat); setIsSidebarOpen(false);}}
                        className={`text-left px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                          selectedCategory === cat ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-200' : 'bg-slate-50 text-slate-600 hover:bg-white border border-transparent hover:border-violet-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                   <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Level</h4>
                   <div className="grid grid-cols-1 gap-2">
                    {['All', 'Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                      <button 
                        key={lvl}
                        onClick={() => {setSelectedLevel(lvl); setIsSidebarOpen(false);}}
                        className={`text-left px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                          selectedLevel === lvl ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-200' : 'bg-slate-50 text-slate-600 hover:bg-white border border-transparent hover:border-violet-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12">
                 <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-100 uppercase tracking-widest"
                 >
                   Apply Results
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
