import Link from 'next/link';
import { Star, Clock, BookOpen, User } from 'lucide-react';
import Image from 'next/image';

export default function CourseCard({ course }) {
  return (
    <Link href={`/student/courses/${course.id}`} className="group block h-full">
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Thumbnail */}
        {/* Thumbnail or Video */}
        <div className="relative aspect-video overflow-hidden bg-slate-100 group">
           {course.promo_video_url ? (
             <div className="w-full h-full relative">
                <iframe 
                  src={`${course.promo_video_url}${course.promo_video_url.includes('?') ? '&' : '?'}autoplay=1&mute=1&controls=0&showinfo=0&loop=1`} 
                  title={course.title}
                  className="w-full h-full object-cover pointer-events-none" 
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                {/* Overlay to prevent interaction with iframe and allow clicking the card */}
                <div className="absolute inset-0 bg-transparent" />
             </div>
           ) : (course.thumbnail || course.thumbnail_url) ? (
             <img 
               src={course.thumbnail || course.thumbnail_url} 
               alt={course.title}
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
             />
           ) : (
             <img 
               src={`https://images.unsplash.com/photo-${['1434030216411-0b793f4b4173', '1522202176988-66273c2fd55f', '1516321318423-f06f85e504b3', '1501504905252-473c47e087f8', '1456513080510-7bf3a84b82f8', '1497633762265-9d179a990aa6', '1523240795612-9a054b0db644', '1491843384429-30494622eb90'][course.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 8]}?auto=format&fit=crop&q=80&w=800`}
               alt={course.title}
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
             />
           )}
           <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur rounded-md text-xs font-bold text-slate-700 shadow-sm z-10">
             {course.level}
           </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-violet-600 transition-colors line-clamp-2">
              {course.title}
            </h3>
          </div>
          
          <div className="flex items-center space-x-2 mb-4 text-sm text-slate-500">
             <div className="flex items-center space-x-1">
               <User className="h-3.5 w-3.5" />
               <span className="truncate">{course.instructor?.full_name || 'Instructor'}</span>
             </div>
             <span className="text-slate-300">•</span>
             <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-slate-600">
               {course.categories?.name || 'General'}
             </span>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-1 text-amber-400">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-bold text-slate-700">{course.rating || 'New'}</span>
              <span className="text-xs text-slate-400">({course.reviews?.length || 0})</span>
            </div>
            <div className="text-lg font-black text-slate-900">
              {course.price > 0 ? `$${course.price}` : 'Free'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
