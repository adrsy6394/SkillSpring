'use client';

import { useState } from 'react';
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Edit2, 
  PlayCircle, 
  Check, 
  X,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';

export default function SectionBuilder({ sections = [], onSaveSection, onSaveLesson, onDeleteSection, onDeleteLesson, courseId }) {
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null); // { sectionId, lesson }

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return;
    await onSaveSection({ course_id: courseId, title: newSectionTitle, order: sections.length });
    setNewSectionTitle('');
    setIsAddingSection(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
           <h2 className="text-xl font-bold text-gray-900 flex items-center">
             <BookOpen className="h-5 w-5 mr-3 text-emerald-600" />
             Course Curriculum
           </h2>
           <p className="text-gray-500 text-sm mt-1 font-medium">Add sections and lessons to structure your course.</p>
        </div>
        {!isAddingSection && (
          <button 
            onClick={() => setIsAddingSection(true)}
            className="flex items-center px-6 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 transition-all text-xs"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </button>
        )}
      </div>

      {isAddingSection && (
        <div className="bg-emerald-50/50 p-6 rounded-3xl border-2 border-dashed border-emerald-200 animate-zoom-in">
           <input 
             autoFocus
             placeholder="Section Title (e.g. Getting Started)"
             value={newSectionTitle}
             onChange={(e) => setNewSectionTitle(e.target.value)}
             className="w-full px-6 py-4 bg-white border-none rounded-2xl text-base focus:ring-2 focus:ring-emerald-500 font-bold mb-4"
           />
           <div className="flex items-center space-x-3">
              <button 
                onClick={handleAddSection}
                className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs"
              >
                Save Section
              </button>
              <button 
                onClick={() => setIsAddingSection(false)}
                className="px-6 py-2 bg-white text-gray-500 rounded-xl font-bold text-xs border border-gray-100"
              >
                Cancel
              </button>
           </div>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={section.id || idx} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group">
             {/* Section Header */}
             <div className="px-6 py-5 flex items-center justify-between bg-gray-50/30 group-hover:bg-gray-50/60 transition-colors">
                <div className="flex items-center flex-1">
                   <GripVertical className="h-4 w-4 text-gray-300 mr-4 cursor-grab" />
                   <h3 className="font-bold text-gray-900">Section {idx + 1}: {section.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                   <button 
                      onClick={() => setActiveSectionId(activeSectionId === section.id ? null : section.id)}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                   >
                     {activeSectionId === section.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                   </button>
                   <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 className="h-4 w-4" />
                   </button>
                </div>
             </div>

             {/* Lessons List (Expandable) */}
             {activeSectionId === section.id && (
               <div className="px-6 pb-6 pt-2 space-y-3 animate-fade-in">
                  {section.lessons?.map((lesson, lIdx) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group/lesson hover:bg-white hover:shadow-sm border border-transparent hover:border-emerald-100 transition-all">
                       <div className="flex items-center">
                          <PlayCircle className="h-5 w-5 text-emerald-500 mr-4" />
                          <div>
                             <p className="text-sm font-bold text-gray-900 line-clamp-1">{lesson.title}</p>
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{lesson.is_free ? 'Free Preview' : 'Premium'}</p>
                          </div>
                       </div>
                       <div className="flex items-center space-x-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                          <button className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg">
                             <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg">
                             <Trash2 className="h-3.5 w-3.5" />
                          </button>
                       </div>
                    </div>
                  ))}
                  
                  {/* Add Lesson Action */}
                  <button 
                    onClick={() => setEditingLesson({ sectionId: section.id, lesson: { title: '', video_url: '', is_free: false, order: section.lessons?.length || 0 } })}
                    className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-100 rounded-2xl text-xs font-bold text-gray-400 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all group"
                  >
                     <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                     Add Lesson
                  </button>
               </div>
             )}
          </div>
        ))}
      </div>

      {/* Lesson Edit Modal (Simple Inline) */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-zoom-in">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-bold text-gray-900">Add Lesson</h3>
                 <button onClick={() => setEditingLesson(null)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="h-5 w-5 text-gray-400" />
                 </button>
              </div>
              <div className="space-y-6">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Lesson Title</label>
                    <input 
                       autoFocus
                       value={editingLesson.lesson.title}
                       onChange={(e) => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, title: e.target.value } })}
                       className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Video URL (YouTube/Vimeo)</label>
                    <input 
                       value={editingLesson.lesson.video_url}
                       onChange={(e) => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, video_url: e.target.value } })}
                       placeholder="e.g. https://youtube.com/watch?v=..."
                       className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                 </div>
                 <div className="flex items-center space-x-3">
                    <input 
                       type="checkbox"
                       id="is_free"
                       checked={editingLesson.lesson.is_free}
                       onChange={(e) => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, is_free: e.target.checked } })}
                       className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="is_free" className="text-sm font-bold text-gray-700">Allow Free Preview</label>
                 </div>
                 <div className="pt-4 flex items-center space-x-4">
                    <button 
                       onClick={async () => {
                          await onSaveLesson({ ...editingLesson.lesson, section_id: editingLesson.sectionId });
                          setEditingLesson(null);
                       }}
                       className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20"
                    >
                       Save Lesson
                    </button>
                    <button 
                       onClick={() => setEditingLesson(null)}
                       className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold"
                    >
                       Cancel
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

