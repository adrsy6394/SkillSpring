import Head from 'next/head';
import Layout from '../../../components/Layout';
import CourseCard from '../../../components/CourseCard';
import { courseApi } from '../../../services/courseApi';
import { Filter, X, ChevronDown, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Courses({ initialCourses, categories, initialFilters }) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || '');

  // Update local state when URL changes
  useEffect(() => {
    setFilters(router.query);
    setSearchQuery(router.query.q || '');
  }, [router.query]);

  // Update courses when filters change (client-side refetch or just rely on SSR navigation)
  // For this implementation, we'll rely on router.push to trigger SSR/getServerSideProps or client-side fetch.
  // Actually, to make it snappy, let's fetch client-side after initial load.
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseApi.searchCourses({
          query: filters.q,
          category: filters.category,
          level: filters.level,
          price: filters.price
        });
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      }
    };
    
    // Only fetch if not initial load (handled by SSR) - checks if router is ready
    if (router.isReady) {
        fetchCourses();
    }
  }, [filters, router.isReady]);


  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    if (!value) delete newFilters[key]; // Remove if empty
    setFilters(newFilters);
    
    router.push({
      pathname: '/student/courses',
      query: newFilters,
    }, undefined, { shallow: true }); // Shallow to prevent full reload, we handle data fetch in useEffect
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter('q', searchQuery);
  };

  return (
    <Layout>
      <Head>
        <title>Explore Courses | SkillSpring</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden flex justify-between items-center mb-4">
             <h1 className="text-2xl font-black text-slate-900">All Courses</h1>
             <button 
               onClick={() => setIsMobileFiltersOpen(true)}
               className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700"
             >
               <Filter className="h-4 w-4" />
               <span>Filters</span>
             </button>
          </div>

          {/* Sidebar / Filters */}
          <div className={`
            fixed inset-0 z-40 bg-white p-6 transform transition-transform duration-300 ease-in-out md:relative md:transform-none md:bg-transparent md:p-0 md:w-64 md:block
            ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
             <div className="flex justify-between items-center mb-8 md:hidden">
               <h2 className="text-xl font-bold">Filters</h2>
               <button onClick={() => setIsMobileFiltersOpen(false)}>
                 <X className="h-6 w-6 text-slate-400" />
               </button>
             </div>

             <div className="space-y-8">
                {/* Search (Mobile/Sidebar) */}
                <div>
                   <form onSubmit={handleSearch} className="relative">
                      <input 
                        type="text" 
                        placeholder="Search keyword..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                   </form>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center justify-between">
                    Category
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="category" 
                        checked={!filters.category}
                        onChange={() => updateFilter('category', null)}
                        className="text-violet-600 focus:ring-violet-500 border-gray-300"
                      />
                      <span className="text-sm text-slate-600">All Categories</span>
                    </label>
                    {categories.map(cat => (
                      <label key={cat.id} className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="category" 
                          checked={filters.category === cat.id}
                          onChange={() => updateFilter('category', cat.id)}
                          className="text-violet-600 focus:ring-violet-500 border-gray-300"
                        />
                        <span className="text-sm text-slate-600">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Level */}
                <div>
                   <h3 className="font-bold text-slate-900 mb-4">Level</h3>
                   <div className="space-y-2">
                      {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                        <label key={level} className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={filters.level === level}
                             onChange={(e) => updateFilter('level', e.target.checked ? level : null)}
                            className="rounded text-violet-600 focus:ring-violet-500 border-gray-300"
                          />
                          <span className="text-sm text-slate-600">{level}</span>
                        </label>
                      ))}
                   </div>
                </div>

                {/* Price */}
                <div>
                   <h3 className="font-bold text-slate-900 mb-4">Price</h3>
                   <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="price" 
                          checked={!filters.price}
                          onChange={() => updateFilter('price', null)}
                          className="text-violet-600 focus:ring-violet-500 border-gray-300"
                        />
                        <span className="text-sm text-slate-600">All Prices</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="price"
                          checked={filters.price === 'free'}
                          onChange={() => updateFilter('price', 'free')}
                          className="text-violet-600 focus:ring-violet-500 border-gray-300"
                        />
                        <span className="text-sm text-slate-600">Free</span>
                      </label>
                       <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="price"
                          checked={filters.price === 'paid'}
                          onChange={() => updateFilter('price', 'paid')}
                          className="text-violet-600 focus:ring-violet-500 border-gray-300"
                        />
                        <span className="text-sm text-slate-600">Paid</span>
                      </label>
                   </div>
                </div>
             </div>
          </div>

          {/* Overlay for mobile sidebar */}
          {isMobileFiltersOpen && (
            <div 
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="flex-1">
             <div className="hidden md:flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-slate-900 flex items-center">
                  Explore Courses
                  <span className="ml-4 px-3 py-1 bg-violet-100 text-violet-700 text-sm rounded-full">
                    {courses.length} results
                  </span>
                </h1>
                
                {/* Sort - simplified for now */}
                {/* <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <span>Sort by:</span>
                  <select className="bg-transparent font-bold text-slate-900 border-none focus:ring-0 cursor-pointer">
                    <option>Most Popular</option>
                    <option>Newest</option>
                  </select>
                </div> */}
             </div>

             {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                   <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                     <Search className="h-8 w-8 text-slate-400" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 mb-2">No courses found</h3>
                   <p className="text-slate-500 text-center max-w-md">
                     Try adjusting your filters or search terms to find what you're looking for.
                   </p>
                   <button 
                     onClick={() => {
                        setFilters({}); 
                        router.push('/student/courses', undefined, { shallow: true });
                     }}
                     className="mt-6 px-6 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-full hover:bg-slate-50 transition-colors"
                   >
                     Clear all filters
                   </button>
                </div>
             ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                  {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
             )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { query } = context;
  const filters = {
    q: query.q || null,
    category: query.category || null,
    level: query.level || null,
    price: query.price || null,
  };

  try {
    const [courses, categories] = await Promise.all([
      courseApi.searchCourses(filters),
      courseApi.getCategories()
    ]);

    return {
      props: {
        initialCourses: courses || [],
        categories: categories || [],
        initialFilters: query,
      },
    };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return {
      props: {
        initialCourses: [],
        categories: [],
        initialFilters: query,
        error: error.message
      },
    };
  }
}
