'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabaseClient';
import { 
  Users, 
  Mail, 
  Shield, 
  UserCheck, 
  UserX,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  Plus,
  X as CloseIcon,
  UserPlus
} from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', userId: null, userName: '' });
  
  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState(null);
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (roleFilter !== 'all') {
      query = query.eq('role', roleFilter);
    }

    const { data, error } = await query;
    if (error) console.error(error);
    else {
      setUsers(data);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistering(true);
    setRegError(null);

    try {
      // 1. Create Auth User
      // Note: In production, use an Edge Function to avoid logging out the admin.
      // For this implementation, we use standard signUp which is acceptable for demo/proto.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regData.email,
        password: regData.password,
        options: {
          data: {
            full_name: regData.fullName,
            role: 'instructor'
          }
        }
      });

      if (authError) throw authError;

      // 2. Insert into users table (Trigger usually handles this, but we'll do it manually to be sure)
      const { error: dbError } = await supabase
        .from('users')
        .insert([{
           id: authData.user.id,
           full_name: regData.fullName,
           email: regData.email,
           role: 'instructor'
        }]);

      if (dbError && dbError.code !== '23505') throw dbError; // Ignore if already inserted by trigger

      // Success
      setIsModalOpen(false);
      setRegData({ fullName: '', email: '', password: '' });
      fetchUsers();
      alert('Instructor registered successfully! They can now log in at port 3002.');
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      fetchUsers();
      setActiveMenuId(null);
    } catch (err) {
      alert('Error updating role: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    const { userId } = confirmModal;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      setConfirmModal({ open: false, type: '', userId: null, userName: '' });
      fetchUsers();
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-10 animate-fade-in-up flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">User Management</h1>
          <p className="text-slate-400 font-medium text-sm mt-2 max-w-lg">
            Onboard, monitor, and manage the access levels of all platform participants from a central command center.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white font-black rounded-2xl shadow-2xl shadow-violet-200 hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest min-w-max"
        >
          <UserPlus className="h-5 w-5" />
          <span>Register Instructor</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <input 
            type="text"
            placeholder="Search name or instructor email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 pl-14 text-sm font-medium focus:ring-4 focus:ring-violet-100 outline-none transition-all placeholder:text-slate-300"
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none w-full bg-slate-50 border-none rounded-2xl px-6 py-4 pr-12 text-sm font-black text-slate-500 uppercase tracking-widest outline-none focus:ring-4 focus:ring-violet-100 transition-all cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="instructor">Instructors</option>
              <option value="admin">Admins</option>
            </select>
            <Filter className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
          </div>

          <button 
            onClick={fetchUsers}
            className="p-4 bg-slate-50 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-2xl transition-all shadow-sm"
            title="Refresh Users"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading && !filteredUsers.length ? (
          [1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm animate-pulse h-64" />
          ))
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
              <Users className="h-12 w-12 text-slate-200" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No platform participants found</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/5 border border-gray-100 group hover:-translate-y-2 transition-all relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500 opacity-50"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl transition-all group-hover:scale-110 ${
                    user.role === 'admin' ? 'bg-red-50 text-red-500 shadow-red-100' : 
                    user.role === 'instructor' ? 'bg-emerald-50 text-emerald-500 shadow-emerald-100' : 
                    'bg-violet-50 text-violet-500 shadow-violet-100'
                  }`}>
                    {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    user.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' : 
                    user.role === 'instructor' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                    'bg-violet-50 text-violet-600 border border-violet-100'
                  }`}>
                    {user.role}
                  </span>
                </div>

                <div className="space-y-1 mb-auto">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight line-clamp-1 group-hover:text-violet-600 transition-colors">{user.full_name || 'Anonymous User'}</h3>
                  <div className="flex items-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    <Mail className="h-3 w-3 mr-2" />
                    {user.email}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-8">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Access</span>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                      className={`p-3 rounded-2xl transition-all ${activeMenuId === user.id ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50'}`}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenuId === user.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-[45]" 
                          onClick={() => setActiveMenuId(null)}
                        />
                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 z-50 animate-fade-in-up">
                          <p className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-50 mb-2">Manage User</p>
                          
                          {['student', 'instructor', 'admin'].map((role) => (
                            user.role !== role && (
                              <button
                                key={role}
                                onClick={() => handleUpdateRole(user.id, role)}
                                className="w-full text-left px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-violet-600 transition-all capitalize"
                              >
                                Make {role}
                              </button>
                            )
                          ))}
                          
                          <div className="h-px bg-gray-50 my-2" />
                          
                          <button
                            onClick={() => setConfirmModal({ open: true, type: 'delete', userId: user.id, userName: user.full_name || user.email })}
                            className="w-full text-left px-5 py-3 text-xs font-bold text-red-500 hover:bg-red-50 transition-all"
                          >
                            Delete User
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-fade-in-up">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 font-outfit">Register Instructor</h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Onboard a new teaching professional</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all"
              >
                <CloseIcon className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-8 space-y-6">
              {regError && (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-red-600 text-xs font-bold uppercase tracking-widest text-center">
                  {regError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input 
                    required
                    type="text"
                    value={regData.fullName}
                    onChange={(e) => setRegData({...regData, fullName: e.target.value})}
                    placeholder="Enter full name"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-violet-100 outline-none transition-all font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Instructor Email</label>
                  <input 
                    required
                    type="email"
                    value={regData.email}
                    onChange={(e) => setRegData({...regData, email: e.target.value})}
                    placeholder="instructor@skillspring.com"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-violet-100 outline-none transition-all font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Temporary Password</label>
                  <input 
                    required
                    type="password"
                    value={regData.password}
                    onChange={(e) => setRegData({...regData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-violet-100 outline-none transition-all font-medium text-slate-900"
                  />
                </div>
              </div>

              <button 
                disabled={registering}
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-black rounded-2xl shadow-xl shadow-violet-200 hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest flex justify-center items-center space-x-2"
              >
                {registering ? 'Processing...' : 'Complete Onboarding'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirmModal({ ...confirmModal, open: false })} />
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 p-10 text-center animate-fade-in-up">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 font-outfit">Are you sure?</h3>
            <p className="text-slate-500 font-medium text-sm mb-8">
              You are about to delete <span className="font-bold text-slate-900">{confirmModal.userName}</span>. This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDeleteUser}
                className="w-full py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-100 hover:bg-red-700 active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                Yes, Delete User
              </button>
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, open: false })}
                className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

