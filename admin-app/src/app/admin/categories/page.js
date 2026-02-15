'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabaseClient';
import { Plus, Trash2, Tag, Search, RefreshCw } from 'lucide-react';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState({ name: '', slug: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) setError(error.message);
    else setCategories(data);
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    const { error } = await supabase
      .from('categories')
      .insert([newCat]);

    if (error) {
      setError(error.message);
    } else {
      setNewCat({ name: '', slug: '' });
      fetchCategories();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) setError(error.message);
    else fetchCategories();
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Category Management</h1>
          <p className="text-gray-500 text-sm mt-1">Add or remove course categories for the marketplace.</p>
        </div>
        <button 
          onClick={fetchCategories}
          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-indigo-600" />
              New Category
            </h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graphic Design"
                  value={newCat.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                    setNewCat({ name, slug });
                  }}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  required
                  readOnly
                  value={newCat.slug}
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 transition-all"
              >
                {submitting ? 'Adding...' : 'Add Category'}
              </button>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 space-y-4">
           {loading && !categories.length ? (
             <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
             </div>
           ) : categories.length === 0 ? (
             <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 border-dashed">
                <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No categories found. Start by adding one!</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {categories.map((cat) => (
                 <div key={cat.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all group">
                    <div className="flex items-center space-x-4">
                       <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Tag className="h-5 w-5" />
                       </div>
                       <div>
                          <h3 className="font-bold text-gray-900">{cat.name}</h3>
                          <p className="text-xs text-gray-500">{cat.slug}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                       <Trash2 className="h-5 w-5" />
                    </button>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

