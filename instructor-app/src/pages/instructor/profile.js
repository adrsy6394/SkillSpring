import InstructorLayout from '@/components/InstructorLayout';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@/lib/supabaseClient';
import { User, Mail, Save } from 'lucide-react';

export default function Profile() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    avatar_url: ''
  });
  const [saving, setSaving] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    if (!loading && (!user || role !== 'instructor')) {
      router.push('/login');
    } else if (user) {
      loadProfile();
    }
  }, [user, role, loading, router]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfileData({
        full_name: data.full_name || '',
        email: data.email || '',
        avatar_url: data.avatar_url || ''
      });
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <InstructorLayout>
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">Profile Settings</h1>
          <p className="text-slate-400 font-medium text-sm mt-2">
            Update your instructor profile information.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/5 border border-gray-100">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-violet-50 p-3 rounded-2xl">
              <User className="h-6 w-6 text-violet-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-outfit">Personal Information</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input
                type="text"
                value={profileData.full_name}
                onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                placeholder="Your full name"
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-violet-100 outline-none transition-all font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-5 py-4 pl-12 bg-slate-100 border-none rounded-2xl text-slate-500 font-medium cursor-not-allowed"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-400 mt-2 ml-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Avatar URL</label>
              <input
                type="url"
                value={profileData.avatar_url}
                onChange={(e) => setProfileData({...profileData, avatar_url: e.target.value})}
                placeholder="https://..."
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-violet-100 outline-none transition-all font-medium text-slate-900"
              />
            </div>

            <div className="pt-6 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white font-black rounded-2xl shadow-2xl shadow-violet-200 hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest w-full md:w-auto"
              >
                <Save className="h-5 w-5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
          <h3 className="font-black text-slate-900 mb-4">Account Type</h3>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Role</span>
            <span className="px-4 py-2 bg-violet-600 text-white font-black rounded-full text-xs uppercase tracking-widest">
              {role}
            </span>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}
