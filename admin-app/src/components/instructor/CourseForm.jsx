'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';

export default function CourseForm({ initialData, onSubmit, isLoading, categories }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    level: 'beginner',
    price: 0,
    thumbnail_url: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category_id: initialData.category_id || '',
        level: initialData.level || 'beginner',
        price: initialData.price || 0,
        thumbnail_url: initialData.thumbnail_url || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Title */}
        <div className="md:col-span-2 space-y-2">
           <label className="text-sm font-bold text-gray-700 ml-1">Course Title</label>
           <input 
             name="title"
             value={formData.title}
             onChange={handleChange}
             required
             placeholder="e.g. Master Next.js for Beginners"
             className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-base focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
           />
        </div>

        {/* Description */}
        <div className="md:col-span-2 space-y-2">
           <label className="text-sm font-bold text-gray-700 ml-1">Description</label>
           <textarea 
             name="description"
             value={formData.description}
             onChange={handleChange}
             rows="4"
             placeholder="Describe what students will learn..."
             className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-base focus:ring-2 focus:ring-emerald-500 transition-all font-medium resize-none"
           />
        </div>

        {/* Category */}
        <div className="space-y-2">
           <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
           <select 
             name="category_id"
             value={formData.category_id}
             onChange={handleChange}
             required
             className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-base focus:ring-2 focus:ring-emerald-500 transition-all font-medium appearance-none"
           >
             <option value="">Select a Category</option>
             {categories.map(cat => (
               <option key={cat.id} value={cat.id}>{cat.name}</option>
             ))}
           </select>
        </div>

        {/* Level */}
        <div className="space-y-2">
           <label className="text-sm font-bold text-gray-700 ml-1">Level</label>
           <select 
             name="level"
             value={formData.level}
             onChange={handleChange}
             className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-base focus:ring-2 focus:ring-emerald-500 transition-all font-medium appearance-none"
           >
             <option value="beginner">Beginner</option>
             <option value="intermediate">Intermediate</option>
             <option value="expert">Expert</option>
           </select>
        </div>

        {/* Price */}
        <div className="space-y-2">
           <label className="text-sm font-bold text-gray-700 ml-1">Price (USD)</label>
           <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
              <input 
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className="w-full pl-10 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-base focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              />
           </div>
        </div>

        {/* Thumbnail Placeholder */}
        <div className="space-y-2">
           <label className="text-sm font-bold text-gray-700 ml-1">Thumbnail URL</label>
           <input 
             name="thumbnail_url"
             value={formData.thumbnail_url}
             onChange={handleChange}
             placeholder="https://example.com/image.jpg"
             className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-base focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
           />
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-10">
         <div className="flex items-center text-amber-600 bg-amber-50 px-4 py-2 rounded-xl text-xs font-bold">
            <AlertCircle className="h-4 w-4 mr-2" />
            Once submitted, the course will be pending admin approval.
         </div>
         <button 
           type="submit"
           disabled={isLoading}
           className="flex items-center px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50"
         >
           {isLoading ? 'Saving...' : (
             <>
               <Save className="mr-2 h-5 w-5" />
               Save Course Info
             </>
           )}
         </button>
      </div>
    </form>
  );
}

