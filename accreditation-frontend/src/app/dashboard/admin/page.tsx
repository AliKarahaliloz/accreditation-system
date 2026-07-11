'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { UserPlus, Save, Trash2, Shield, Pencil, X, Lock } from 'lucide-react';

interface Role { id: string; name: string; }
interface Faculty { id: string; name: string; }
interface Department { id: string; name: string; facultyId: string; }
interface User {
  id: string; fullName: string; email: string; title: string;
  role: string; roleId: string;
  departmentId?: string; departmentName?: string; facultyId?: string;
}

interface EditState {
  userId: string; fullName: string; email: string; title: string;
  facultyId: string; departmentId: string; newPassword: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form  
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', title: '',
    roleId: '', facultyId: '', departmentId: '',
  });
  const [creating, setCreating] = useState(false);
  // departments filtered by selected faculty in create form
  const [createDepts, setCreateDepts] = useState<Department[]>([]);

  // Edit modal
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  // departments filtered by selected faculty in edit modal
  const [editDepts, setEditDepts] = useState<Department[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, facRes, deptRes] = await Promise.all([
        api.get('/api/v1/admin/users'),
        api.get('/api/v1/admin/roles'),
        api.get('/api/v1/admin/faculties'),
        api.get('/api/v1/admin/departments'),
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
      setFaculties(Array.isArray(facRes.data) ? facRes.data : []);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
    } catch {
      toast.error('Veriler yüklenemedi. Yetkiniz olmayabilir.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Cascade: when create-form faculty changes → filter departments
  useEffect(() => {
    if (form.facultyId) {
      setCreateDepts(departments.filter(d => d.facultyId === form.facultyId));
    } else {
      setCreateDepts([]);
    }
    setForm(prev => ({ ...prev, departmentId: '' }));
  }, [form.facultyId, departments]);

  // Cascade: when edit modal faculty changes → filter departments
  useEffect(() => {
    if (editState?.facultyId) {
      setEditDepts(departments.filter(d => d.facultyId === editState.facultyId));
    } else {
      setEditDepts([]);
    }
    // reset dept only when faculty actually changes (not on first open)
  }, [editState?.facultyId, departments]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // --- Create User ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/api/v1/admin/users', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        title: form.title || null,
        roleId: form.roleId || null,
        facultyId: form.facultyId || null,
        departmentId: form.departmentId || null,
        organizationUnitId: null,
      });
      toast.success('Kullanıcı başarıyla oluşturuldu.');
      setForm({ fullName: '', email: '', password: '', title: '', roleId: '', facultyId: '', departmentId: '' });
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Kullanıcı oluşturulurken hata oluştu';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setCreating(false);
    }
  };

  // --- Edit Modal ---
  const openEditModal = (user: User) => {
    const dept = departments.find(d => d.id === user.departmentId);
    const facultyId = user.facultyId || dept?.facultyId || '';
    setEditState({
      userId: user.id, fullName: user.fullName, email: user.email,
      title: user.title || '', facultyId, departmentId: user.departmentId || '',
      newPassword: '',
    });
    if (facultyId) {
      setEditDepts(departments.filter(d => d.facultyId === facultyId));
    } else {
      setEditDepts(departments);
    }
  };

  const closeEditModal = () => setEditState(null);

  const handleSave = async () => {
    if (!editState) return;
    setSaving(true);
    try {
      // 1. Update profile (name, email, title)
      await api.put(`/api/v1/admin/users/${editState.userId}/profile`, {
        fullName: editState.fullName,
        email: editState.email,
        title: editState.title,
      });

      // 2. Update department
      await api.put(`/api/v1/admin/users/${editState.userId}/unit`, {
        departmentId: editState.departmentId || null,
      });

      // 3. Optional password reset
      if (editState.newPassword) {
        if (editState.newPassword.length < 6) {
          toast.error('Şifre en az 6 karakter olmalıdır. Şifre güncellenmedi.');
        } else {
          await api.put(`/api/v1/admin/users/${editState.userId}/password`, {
            newPassword: editState.newPassword,
          });
          toast.success('Şifre başarıyla sıfırlandı.');
        }
      }

      toast.success('Kullanıcı başarıyla güncellendi.');
      closeEditModal();
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Güncelleme sırasında hata oluştu';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  // --- Role change (inline) ---
  const handleRoleChange = async (userId: string, newRoleId: string) => {
    if (!newRoleId) return;
    try {
      await api.put(`/api/v1/admin/users/${userId}/role`, { roleId: newRoleId });
      toast.success('Rol başarıyla güncellendi.');
      fetchData();
    } catch {
      toast.error('Rol güncellenirken hata oluştu.');
    }
  };

  // --- Delete ---
  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`"${userName}" isimli kullanıcıyı silmek istediğinize emin misiniz?`)) return;
    try {
      await api.delete(`/api/v1/admin/users/${userId}`);
      toast.success('Kullanıcı silindi.');
      fetchData();
    } catch {
      toast.error('Kullanıcı silinirken hata oluştu.');
    }
  };

  const formatRole = (role: string) => role?.replace('ROLE_', '').replace(/_/g, ' ') ?? '';

  if (loading) return (
    <div className="flex justify-center mt-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <Shield className="text-indigo-600" /> Sistem Yönetimi
      </h1>

      {/* ── Create User ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <UserPlus size={18} /> Yeni Kullanıcı Ekle
          </h2>
        </div>
        <form onSubmit={handleCreateUser} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ad Soyad */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Ad Soyad *</label>
              <input required name="fullName" value={form.fullName} onChange={handleFormChange}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            {/* E-posta */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">E-posta *</label>
              <input required type="email" name="email" value={form.email} onChange={handleFormChange}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            {/* Şifre */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Şifre *</label>
              <input required type="password" name="password" value={form.password} onChange={handleFormChange}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            {/* Ünvan */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Ünvan</label>
              <input name="title" value={form.title} onChange={handleFormChange}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Dr., Prof., vb." />
            </div>
            {/* Rol */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Rol *</label>
              <select required name="roleId" value={form.roleId} onChange={handleFormChange}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Seçiniz</option>
                {roles.map(r => <option key={r.id} value={r.id}>{formatRole(r.name)}</option>)}
              </select>
            </div>
            {/* Fakülte */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Fakülte</label>
              <select name="facultyId" value={form.facultyId} onChange={handleFormChange}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Seçiniz</option>
                {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            {/* Bölüm */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Bölüm</label>
              <select name="departmentId" value={form.departmentId} onChange={handleFormChange}
                disabled={!form.facultyId}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50">
                <option value="">{form.facultyId ? 'Seçiniz' : 'Önce fakülte seçin'}</option>
                {createDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            {/* Ekle button */}
            <div className="flex items-end">
              <button disabled={creating} type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                <Save size={16} /> {creating ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── User List ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-semibold text-slate-800">Kullanıcı Listesi ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Ad Soyad', 'E-posta', 'Fakülte', 'Bölüm', 'Rol', 'İşlem'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map(user => {
                const faculty = faculties.find(f => f.id === user.facultyId)?.name || user.facultyId ? (faculties.find(f => f.id === user.facultyId)?.name ?? '—') : '—';
                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{user.fullName}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{user.email}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{faculty}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{user.departmentName || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select value={user.roleId || ''} onChange={e => handleRoleChange(user.id, e.target.value)}
                        className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">Seçiniz</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{formatRole(r.name)}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(user)}
                          className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-md transition-colors" title="Düzenle">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(user.id, user.fullName)}
                          className="text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors" title="Sil">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Kullanıcı bulunamadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editState && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Pencil size={18} className="text-indigo-600" /> Kullanıcı Düzenle
              </h3>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Profil */}
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profil Bilgileri</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ad Soyad</label>
                  <input type="text" value={editState.fullName}
                    onChange={e => setEditState(p => p && { ...p, fullName: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">E-posta (Kullanıcı Adı)</label>
                  <input type="email" value={editState.email}
                    onChange={e => setEditState(p => p && { ...p, email: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ünvan</label>
                  <input type="text" value={editState.title}
                    onChange={e => setEditState(p => p && { ...p, title: e.target.value })}
                    placeholder="Dr., Prof., Öğr. Gör."
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              {/* Fakülte & Bölüm */}
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pt-2 border-t border-slate-100">Fakülte / Bölüm</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Fakülte</label>
                  <select value={editState.facultyId}
                    onChange={e => {
                      const fid = e.target.value;
                      setEditState(p => p && { ...p, facultyId: fid, departmentId: '' });
                    }}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Seçiniz</option>
                    {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Bölüm</label>
                  <select value={editState.departmentId}
                    onChange={e => setEditState(p => p && { ...p, departmentId: e.target.value })}
                    disabled={!editState.facultyId}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50">
                    <option value="">{editState.facultyId ? 'Yok / Seçiniz' : 'Önce fakülte seçin'}</option>
                    {editDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Şifre */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Lock size={12} /> Şifre Sıfırla (İsteğe Bağlı)
                </p>
                <input type="password" value={editState.newPassword}
                  onChange={e => setEditState(p => p && { ...p, newPassword: e.target.value })}
                  placeholder="Boş bırakılırsa şifre değişmez (min. 6 karakter)"
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <p className="text-xs text-slate-400 mt-1">Eski şifreye gerek yok. Boş bırakırsanız şifre değişmez.</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={closeEditModal}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-sm font-medium">
                İptal
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                <Save size={15} /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
