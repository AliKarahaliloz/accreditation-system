'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Subordinate {
  id: string;
  fullName: string;
  title?: string;
  roleName?: string;
}

interface Criterion {
  id: string;
  code: string;
  title: string;
}

export default function CreateTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Dropdown verileri
  const [subordinates, setSubordinates] = useState<Subordinate[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    assignedToUserId: '',
    criterionId: '',
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [subordinatesRes, criteriaRes] = await Promise.all([
          api.get('/api/v1/users/subordinates'),
          api.get('/api/v1/criteria/flat'),
        ]);
        setSubordinates(Array.isArray(subordinatesRes.data) ? subordinatesRes.data : []);
        setCriteria(Array.isArray(criteriaRes.data) ? criteriaRes.data : []);
      } catch (err) {
        toast.error('Veriler yüklenemedi');
      } finally {
        setLoadingData(false);
      }
    };
    fetchDropdownData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.deadline || !formData.assignedToUserId || !formData.criterionId) {
      toast.error('Lütfen zorunlu alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline + 'T23:59:59',
        assignedToId: formData.assignedToUserId,
        criterionId: formData.criterionId,
      };

      await api.post('/api/v1/tasks', payload);
      toast.success('Görev başarıyla atandı!');
      router.push('/dashboard/assigned-by-me');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Görev atanırken bir hata oluştu';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center mt-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Yeni Görev Ata</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="title">
              Görev Başlığı <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Örn: 2026 Müfredat Revizyonu"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="description">
              PUKÖ Döngüsü Görev Tanımı ve Notlar
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Görev detaylarını ve hedeflerini buraya yazın..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 resize-none"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="deadline">
                Son Teslim Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="criterionId">
                Akreditasyon Ölçütü <span className="text-red-500">*</span>
              </label>
              <select
                id="criterionId"
                name="criterionId"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 bg-white"
                value={formData.criterionId}
                onChange={handleChange}
              >
                <option value="">-- Ölçüt seçin --</option>
                {criteria.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
              {criteria.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">Sistemde tanımlı ölçüt bulunamadı.</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="assignedToUserId">
                Atanacak Kişi <span className="text-red-500">*</span>
              </label>
              <select
                id="assignedToUserId"
                name="assignedToUserId"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 bg-white"
                value={formData.assignedToUserId}
                onChange={handleChange}
              >
                <option value="">-- Kişi seçin --</option>
                {subordinates.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}{u.title ? ` (${u.title})` : ''}{u.roleName ? ` — ${u.roleName}` : ''}
                  </option>
                ))}
              </select>
              {subordinates.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  Yetkiniz dahilinde görev atayabileceğiniz personel bulunamadı.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg font-medium transition-colors mr-3"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || subordinates.length === 0 || criteria.length === 0}
              className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors shadow-sm disabled:bg-blue-400 flex items-center"
            >
              {loading ? 'Kaydediliyor...' : 'Görevi Ata'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
