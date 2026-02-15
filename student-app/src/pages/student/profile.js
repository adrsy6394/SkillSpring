import Head from 'next/head';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';
import { User, Mail, Save, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

export default function StudentProfile() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error("fetchProfile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          bio: profile.bio || '',
          // avatar_url: profile.avatar_url // Handle upload separately if needed
        })
        .eq('id', profile.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><div className="p-10 text-center">Loading profile...</div></Layout>;
  if (!profile) return <Layout><div className="p-10 text-center text-red-500">Profile not found</div></Layout>;

  return (
    <Layout>
      <Head>
        <title>My Profile | SkillSpring</title>
      </Head>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-black text-slate-900 mb-8">My Profile</h1>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8">
             <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Avatar Placeholder */}
                <div className="flex items-center gap-6 mb-8">
                   <div className="h-24 w-24 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 text-2xl font-bold border-4 border-white shadow-lg">
                      {profile.full_name?.[0] || <User />}
                   </div>
                   <div>
                      <h3 className="font-bold text-lg text-slate-900">{profile.email}</h3>
                      <p className="text-slate-500 text-sm">Student</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                      <div className="relative">
                         <input 
                           type="text" 
                           value={profile.full_name || ''}
                           onChange={e => setProfile({...profile, full_name: e.target.value})}
                           className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                           required
                         />
                         <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                      </div>
                   </div>

                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                      <div className="relative">
                         <input 
                           type="email" 
                           value={profile.email || ''}
                           disabled
                           className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                         />
                         <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                      </div>
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Bio</label>
                   <textarea 
                     rows="4"
                     value={profile.bio || ''}
                     onChange={e => setProfile({...profile, bio: e.target.value})}
                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all resize-none"
                     placeholder="Tell us a bit about yourself..."
                   />
                </div>

                {message && (
                   <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {message.text}
                   </div>
                )}

                <div className="flex justify-end pt-4">
                   <button 
                     type="submit" 
                     disabled={saving}
                     className="flex items-center px-8 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200 disabled:opacity-70"
                   >
                     {saving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                     {saving ? 'Saving...' : 'Save Changes'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
