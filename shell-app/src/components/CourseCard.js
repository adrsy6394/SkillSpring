import { Star, BookOpen, Users, Clock } from 'lucide-react';
import { useRouter } from 'next/router';
import { createSupabaseClient } from '@/lib/supabaseClient';

export default function CourseCard({ course }) {
  const {
    id = "1",
    title = "Premium Course Title",
    instructor = "Expert Instructor",
    price = 49.99,
    rating = 4.8,
    reviewsCount = 1240,
    lessonsCount = 24,
    level = "Intermediate",
    thumbnail = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
    category = "Development"
  } = course;

  const router = useRouter();
  const supabase = createSupabaseClient();

  const handleCardClick = async (e) => {
    e.preventDefault();
    
    // Check session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      alert("Please login to view course details.");
      window.location.href = `http://localhost:3001/signup?redirect=${encodeURIComponent(window.location.href)}`;
      return;
    }
    
    // If authenticated, navigate to course
    router.push(`/courses/${id}`);
  };

  return (
    <div onClick={handleCardClick} className="cursor-pointer group h-full">
      <div className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-500 h-full flex flex-col transform hover:-translate-y-1">
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <img 
            src={thumbnail || course.thumbnail_url || `https://images.unsplash.com/photo-${['1434030216411-0b793f4b4173', '1522202176988-66273c2fd55f', '1516321318423-f06f85e504b3', '1501504905252-473c47e087f8', '1456513080510-7bf3a84b82f8', '1497633762265-9d179a990aa6', '1523240795612-9a054b0db644', '1491843384429-30494622eb90'][id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 8]}?auto=format&fit=crop&q=80&w=800`} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-violet-600 shadow-sm">
              {category}
            </span>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center space-x-1 mb-3">
             <div className="flex items-center text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="ml-1 text-sm font-black text-slate-900">{rating}</span>
             </div>
             <span className="text-xs text-gray-400 font-medium">({reviewsCount.toLocaleString()})</span>
          </div>

          <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 group-hover:text-violet-600 transition-colors line-clamp-2">
            {title}
          </h3>
          
          <p className="text-sm text-gray-500 font-medium mb-4">
            by <span className="text-slate-900">{instructor}</span>
          </p>

          <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
            <div className="flex items-center space-x-4">
               <div className="flex items-center text-xs text-gray-400 font-bold">
                  <BookOpen className="h-4 w-4 mr-1.5 text-violet-400" />
                  {lessonsCount}
               </div>
               <div className="flex items-center text-xs text-gray-400 font-bold">
                  <Users className="h-4 w-4 mr-1.5 text-violet-400" />
                  {level}
               </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-violet-600">${price}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
