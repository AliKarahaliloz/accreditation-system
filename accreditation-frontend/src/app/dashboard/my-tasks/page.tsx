'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { UploadCloud, X } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  assignedByName?: string;
  criterionId?: string;
  criterionCode?: string;
  criterionTitle?: string;
  criterionDescription?: string;
  hasEvaluation?: boolean;
  completedAt?: string;
  planText?: string;
  checkText?: string;
  actText?: string;
}

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  PENDING: { label: 'Bekliyor', classes: 'bg-yellow-100 text-yellow-800' },
  IN_PROGRESS: { label: 'Devam Ediyor', classes: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Tamamlandı', classes: 'bg-green-100 text-green-800' },
  OVERDUE: { label: 'Gecikti', classes: 'bg-red-100 text-red-800' },
  PUBLISHED: { label: '✓ Yayında (Ana Dal)', classes: 'bg-indigo-100 text-indigo-800' },
};

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pukoData, setPukoData] = useState({
    planText: '',
    checkText: '',
    actText: ''
  });

  // Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [taskDetails, setTaskDetails] = useState<Task | null>(null);

  // Eval View State
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [evalResult, setEvalResult] = useState<{ score: number, feedback: string } | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/api/v1/tasks/my-tasks');
      // Adjust the response access based on standard Spring Boot structure (could be res.data.content or res.data)
      setTasks(Array.isArray(res.data) ? res.data : (res.data.content || []));
    } catch (err) {
      toast.error('Görevler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openPukoModal = (task: Task) => {
    setSelectedTask(task);
    setFile(null);
    setPukoData({
      planText: task.planText || '',
      checkText: task.checkText || '',
      actText: task.actText || ''
    });
    setIsModalOpen(true);
  };

  const closePukoModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setFile(null);
  };

  const viewTaskDetails = (task: Task) => {
    setTaskDetails(task);
    setDetailsModalOpen(true);
  };

  const viewEvaluation = async (task: Task) => {
    setEvalModalOpen(true);
    setEvalLoading(true);
    setEvalResult(null);
    try {
      const res = await api.get(`/api/v1/evaluations/task/${task.id}`);
      setEvalResult(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setEvalResult(null); // Not evaluated yet
      } else {
        toast.error('Değerlendirme sonucu alınamadı.');
      }
    } finally {
      setEvalLoading(false);
    }
  };

  const handlePukoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setUploading(true);
    let uploadedFileUrl = '';

    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const fileRes = await api.post('/api/v1/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedFileUrl = fileRes.data;
      }

      const payload: any = {
        criterionId: selectedTask.criterionId,
        taskId: selectedTask.id,
        planText: pukoData.planText,
        checkText: pukoData.checkText,
        actText: pukoData.actText,
      };

      if (uploadedFileUrl) {
        payload.doFileUrl = uploadedFileUrl;
      }

      await api.post('/api/v1/puko', payload);

      toast.success('Göreviniz (PUKÖ) başarıyla tamamlandı!');
      closePukoModal();
      fetchTasks();
    } catch (err) {
      toast.error('PUKÖ verisi gönderilirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Bana Atanan Görevler</h1>

      {loading ? (
        <div className="flex justify-center mt-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Görev Adı</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Atayan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Açıklama</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Son Tarih</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">İşlem</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Gösterilecek görev bulunmuyor.</td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        <button
                          onClick={() => viewTaskDetails(task)}
                          className="text-blue-600 hover:underline hover:text-blue-800 text-left font-semibold"
                        >
                          {task.title}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-semibold">{task.assignedByName || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={task.description}>
                        {task.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(task.deadline).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const s = STATUS_LABELS[task.status] || { label: task.status, classes: 'bg-slate-100 text-slate-700' };
                          return (
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${s.classes}`}>
                              {s.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openPukoModal(task)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
                            title="PUKÖ Formunu doldur veya düzenle"
                          >
                            <UploadCloud size={16} />
                            {task.status === 'PUBLISHED' || task.status === 'COMPLETED' ? 'PUKÖ Düzenle' : 'PUKÖ Tamamla'}
                          </button>

                          {task.hasEvaluation && (
                            <button
                              onClick={() => viewEvaluation(task)}
                              className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
                              title="Amirinizin değerlendirme notunu ve geri bildirimini görün"
                            >
                              Sonucu Gör
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">PUKÖ Formu</h3>
                {selectedTask && selectedTask.completedAt && (
                  <p className="text-xs text-slate-500 mt-1">Son Güncelleme: {new Date(selectedTask.completedAt).toLocaleString('tr-TR')}</p>
                )}
              </div>
              <button onClick={closePukoModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePukoSubmit} className="p-6 space-y-4">

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Planla (P)</label>
                <textarea
                  required
                  rows={2}
                  value={pukoData.planText}
                  onChange={e => { const v = e.target.value; setPukoData(prev => ({ ...prev, planText: v })); }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Planlama aşamasında neler yapıldı?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Uygula (U) - Kanıt Dosyası</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kontrol Et (K)</label>
                <textarea
                  required
                  rows={2}
                  value={pukoData.checkText}
                  onChange={e => { const v = e.target.value; setPukoData(prev => ({ ...prev, checkText: v })); }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Uygulama sonuçları nasıl değerlendirildi?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Önlem Al (Ö)</label>
                <textarea
                  required
                  rows={2}
                  value={pukoData.actText}
                  onChange={e => { const v = e.target.value; setPukoData(prev => ({ ...prev, actText: v })); }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="İyileştirme veya önlem faaliyetleri nelerdir?"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closePukoModal}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition-colors text-sm font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors text-sm font-medium disabled:bg-blue-400 flex items-center"
                >
                  {uploading ? 'Kaydediliyor...' : 'Gönder ve Tamamla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evaluation Result Modal */}
      {evalModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Değerlendirme Sonucu</h3>
              <button onClick={() => setEvalModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {evalLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
                </div>
              ) : evalResult ? (
                <div className="space-y-4">
                  <div>
                    <span className="block text-sm font-semibold text-slate-500 mb-1">Puan</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg key={star} className={`w-6 h-6 ${star <= evalResult.score ? 'text-yellow-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                      <span className="ml-2 text-slate-700 font-bold">{evalResult.score} / 5</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-500 mb-1">Geri Bildirim</span>
                    <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-md whitespace-pre-wrap">
                      {evalResult.feedback || "Geri bildirim girilmemiş."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500">
                  <p>Bu görev henüz değerlendirilmemiş.</p>
                </div>
              )}

              <div className="mt-6 flex justify-end pt-4 border-t">
                <button
                  onClick={() => setEvalModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition-colors text-sm font-medium"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {detailsModalOpen && taskDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Görev Detayları</h3>
              <button onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="block text-sm font-semibold text-slate-500 mb-1">Görev Adı</span>
                <p className="text-sm font-medium text-slate-900">{taskDetails.title}</p>
              </div>
              <div>
                <span className="block text-sm font-semibold text-slate-500 mb-1">Açıklama</span>
                <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-md whitespace-pre-wrap border border-slate-100">
                  {taskDetails.description}
                </p>
              </div>
              {taskDetails.criterionCode && (
                <div>
                  <span className="block text-sm font-semibold text-slate-500 mb-1">Bağlı Ölçüt: {taskDetails.criterionCode}</span>
                  <p className="text-sm text-slate-800 bg-blue-50 p-3 rounded-md whitespace-pre-wrap border border-blue-100">
                    <span className="font-semibold block mb-1">Beklentiler (Ne Yapılmalı?):</span>
                    {taskDetails.criterionDescription || <span className="text-slate-400 italic">Ölçüt açıklaması bulunmuyor.</span>}
                  </p>
                </div>
              )}
              <div className="mt-6 flex justify-end pt-4 border-t">
                <button
                  onClick={() => setDetailsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition-colors text-sm font-medium"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
