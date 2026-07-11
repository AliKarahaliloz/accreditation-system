'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle, Send, Eye, X, FileText, ExternalLink, AlertTriangle, RotateCcw } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  criterionCode?: string;
  criterionTitle?: string;
  criterionId?: string;
  assignedToName?: string;
  assignedToUser?: { fullName: string };
}

interface PukoData {
  planText?: string;
  checkText?: string;
  actText?: string;
  doFileUrl?: string;
  uploadedByFullName?: string;
  updatedAt?: string;
}

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  PENDING: { label: 'Bekliyor', classes: 'bg-yellow-100 text-yellow-800' },
  IN_PROGRESS: { label: 'Devam Ediyor', classes: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Tamamlandı', classes: 'bg-green-100 text-green-800' },
  OVERDUE: { label: 'Gecikti', classes: 'bg-red-100 text-red-800' },
  PUBLISHED: { label: '✓ Yayında (Ana Dal)', classes: 'bg-indigo-100 text-indigo-800' },
};

export default function AssignedByMePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // Evaluation Modal State
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [evalData, setEvalData] = useState({ score: 5, feedback: '', isEdit: false });
  const [submitting, setSubmitting] = useState(false);

  // PUKÖ View Modal State
  const [isPukoModalOpen, setIsPukoModalOpen] = useState(false);
  const [pukoViewTask, setPukoViewTask] = useState<Task | null>(null);
  const [pukoData, setPukoData] = useState<PukoData | null>(null);
  const [pukoLoading, setPukoLoading] = useState(false);

  // Publish Confirm Modal State
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const [taskToPublish, setTaskToPublish] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/api/v1/tasks/assigned-by-me');
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

  // --- Evaluation Modal ---
  const openEvalModal = async (task: Task) => {
    setSelectedTask(task);
    setEvalData({ score: 5, feedback: '', isEdit: false });
    setIsEvalModalOpen(true);

    try {
      const res = await api.get(`/api/v1/evaluations/task/${task.id}`);
      if (res.data) {
        setEvalData({
          score: res.data.score || 5,
          feedback: res.data.feedback || '',
          isEdit: true
        });
      }
    } catch (err: any) {
      setEvalData({ score: 5, feedback: '', isEdit: false });
      if (err.response?.status !== 404) {
        console.error('Değerlendirme verisi çekilirken hata:', err);
      }
    }
  };

  const closeEvalModal = () => {
    setIsEvalModalOpen(false);
    setSelectedTask(null);
  };

  const handleEvalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        score: evalData.score,
        feedback: evalData.feedback,
        taskId: selectedTask.id,
      };
      if (selectedTask.criterionId) {
        payload.criterionId = selectedTask.criterionId;
      }

      await api.post('/api/v1/evaluations', payload);
      toast.success('Değerlendirme başarıyla kaydedildi!');
      closeEvalModal();
      fetchTasks();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Değerlendirme kaydedilirken hata oluştu';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // --- PUKÖ View Modal ---
  const openPukoModal = async (task: Task) => {
    setPukoViewTask(task);
    setPukoData(null);
    setIsPukoModalOpen(true);
    setPukoLoading(true);
    try {
      const res = await api.get(`/api/v1/puko/task/${task.id}`);
      setPukoData(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setPukoData(null);
        toast.error('Bu görev için henüz PUKÖ girişi yapılmamış.');
      } else {
        toast.error('PUKÖ verisi alınamadı.');
      }
    } finally {
      setPukoLoading(false);
    }
  };

  const closePukoModal = () => {
    setIsPukoModalOpen(false);
    setPukoViewTask(null);
    setPukoData(null);
  };

  // --- Publish ---
  const openPublishConfirm = (task: Task) => {
    setTaskToPublish(task);
    setIsPublishConfirmOpen(true);
  };

  const closePublishConfirm = () => {
    setIsPublishConfirmOpen(false);
    setTaskToPublish(null);
  };

  const handlePublish = async () => {
    if (!taskToPublish) return;
    setIsPublishConfirmOpen(false);
    setPublishingId(taskToPublish.id);
    try {
      await api.put(`/api/v1/tasks/${taskToPublish.id}/publish`);
      toast.success(`"${taskToPublish.title}" görevi ana dala yayınlandı!`);
      fetchTasks();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Yayınlama sırasında hata oluştu';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setPublishingId(null);
      setTaskToPublish(null);
    }
  };

  const handleUnpublish = async (task: Task) => {
    if (!window.confirm(`"${task.title}" görevini ana daldan geri almak istediğinize emin misiniz? Görev tekrar "Tamamlandı" durumuna dönecektir.`)) return;

    try {
      await api.put(`/api/v1/tasks/${task.id}/unpublish`);
      toast.success(`"${task.title}" görevi ana daldan geri alındı.`);
      fetchTasks();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Geri alma sırasında hata oluştu';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const handleFileDownload = async (fileUrl: string, fileName: string = 'kanit-dosyasi') => {
    try {
      const urlToFetch = fileUrl.startsWith('/api') || fileUrl.startsWith('http')
        ? fileUrl
        : `/api/v1/files/download/${fileUrl}`;
      const response = await api.get(urlToFetch, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));

      let finalFileName = fileName;
      const extMatch = fileUrl.match(/\.([a-zA-Z0-9]+)$/);
      if (extMatch && extMatch[1]) {
        if (!fileName.endsWith(`.${extMatch[1]}`)) {
          finalFileName = `${fileName}.${extMatch[1]}`;
        }
      }

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', finalFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Dosya indirilirken bir hata oluştu.');
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Benim Atadığım Görevler</h1>

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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Atanan Kişi</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Görev</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ölçüt</th>
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
                  tasks.map((task) => {
                    const statusInfo = STATUS_LABELS[task.status] || { label: task.status, classes: 'bg-slate-100 text-slate-700' };
                    return (
                      <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                          {task.assignedToName || task.assignedToUser?.fullName || 'Bilinmiyor'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{task.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                          {task.criterionCode ? (
                            <span title={task.criterionTitle}>{task.criterionCode}</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(task.deadline).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.classes}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {/* TAMAMLANAN görevler için: PUKÖ gör + Değerlendir + Yayınla */}
                            {task.status === 'COMPLETED' && (
                              <>
                                <button
                                  onClick={() => openPukoModal(task)}
                                  className="text-sky-600 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-md transition-colors text-xs font-semibold flex items-center gap-1 border border-sky-200"
                                  title="Kişinin PUKÖ yanıtlarını ve yüklediği dosyayı görüntüle"
                                >
                                  <Eye size={14} />
                                  PUKÖ&apos;yü İncele
                                </button>
                                <button
                                  onClick={() => openEvalModal(task)}
                                  className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors text-xs font-semibold flex items-center gap-1 border border-indigo-200"
                                >
                                  <CheckCircle size={14} />
                                  Değerlendir / Düzenle
                                </button>
                                <button
                                  onClick={() => openPublishConfirm(task)}
                                  disabled={publishingId === task.id}
                                  className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors text-xs font-semibold flex items-center gap-1 disabled:opacity-50 border border-emerald-200"
                                  title="Değerlendirme tamamlandıysa ana dala yayınla"
                                >
                                  <Send size={14} />
                                  {publishingId === task.id ? 'Yayınlanıyor...' : 'Ana Dala Yayınla'}
                                </button>
                              </>
                            )}
                            {/* YAYINDA olan görevler için: PUKÖ gör + yayında rozeti */}
                            {task.status === 'PUBLISHED' && (
                              <>
                                <button
                                  onClick={() => openPukoModal(task)}
                                  className="text-sky-600 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-md transition-colors text-xs font-semibold flex items-center gap-1 border border-sky-200"
                                >
                                  <Eye size={14} />
                                  PUKÖ&apos;yü İncele
                                </button>
                                <button
                                  onClick={() => openEvalModal(task)}
                                  className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors text-xs font-semibold flex items-center gap-1 border border-indigo-200"
                                >
                                  <CheckCircle size={14} />
                                  Değerlendirmeyi Gör
                                </button>
                                <span className="text-indigo-500 text-xs font-semibold flex items-center gap-1">
                                  <CheckCircle size={14} />
                                  Yayında
                                </span>
                                <button
                                  onClick={() => handleUnpublish(task)}
                                  className="text-amber-600 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-md transition-colors text-xs font-semibold flex items-center gap-1 border border-amber-200"
                                  title="Görevi ana daldan geri alarak tekrar değerlendirme aşamasına döndür"
                                >
                                  <RotateCcw size={14} />
                                  Geri Al
                                </button>
                              </>
                            )}
                            {/* BEKLEYEN / DEVAM EDEN görevler için: bilgi mesajı */}
                            {(task.status === 'PENDING' || task.status === 'IN_PROGRESS' || task.status === 'OVERDUE') && (
                              <span className="text-slate-400 text-xs italic">
                                Kişi PUKÖ&apos;yü tamamladığında incelenebilecek
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- PUKÖ View Modal ---- */}
      {isPukoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">PUKÖ Çalışması</h3>
                {pukoViewTask && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {pukoViewTask.assignedToName || 'Kişi'} — {pukoViewTask.title}
                  </p>
                )}
              </div>
              <button onClick={closePukoModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {pukoLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                </div>
              ) : pukoData ? (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black">P</span>
                      Planla
                    </h4>
                    <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap border border-slate-100">
                      {pukoData.planText || <span className="text-slate-400 italic">Girilmemiş</span>}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-black">U</span>
                      Uygula — Kanıt Dosyası
                    </h4>
                    {pukoData.doFileUrl ? (
                      <button
                        onClick={() => handleFileDownload(pukoData.doFileUrl || '', 'puko-kanit-dosyasi')}
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg border border-blue-200 transition-colors"
                      >
                        <FileText size={16} />
                        Dosyayı İndir / Görüntüle
                        <ExternalLink size={14} />
                      </button>
                    ) : (
                      <p className="text-sm text-slate-400 italic bg-slate-50 rounded-lg p-3 border border-slate-100">Dosya yüklenmemiş</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-xs font-black">K</span>
                      Kontrol Et
                    </h4>
                    <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap border border-slate-100">
                      {pukoData.checkText || <span className="text-slate-400 italic">Girilmemiş</span>}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-black">Ö</span>
                      Önlem Al
                    </h4>
                    <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap border border-slate-100">
                      {pukoData.actText || <span className="text-slate-400 italic">Girilmemiş</span>}
                    </p>
                  </div>

                  {pukoData.updatedAt && (
                    <p className="text-xs text-slate-400 text-right">
                      Son güncelleme: {new Date(pukoData.updatedAt).toLocaleString('tr-TR')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <FileText size={40} className="mx-auto mb-3 text-slate-300" />
                  <p>Bu görev için henüz PUKÖ çalışması gönderilmemiş.</p>
                </div>
              )}

              <div className="mt-6 flex justify-between items-center pt-4 border-t">
                {pukoData && pukoViewTask && (
                  <button
                    onClick={() => {
                      closePukoModal();
                      openEvalModal(pukoViewTask);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Değerlendirmeye Geç
                  </button>
                )}
                <button
                  onClick={closePukoModal}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition-colors text-sm font-medium ml-auto"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- Evaluation Modal ---- */}
      {isEvalModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {evalData.isEdit ? 'Değerlendirmeyi Düzenle' : 'Görevi Değerlendir'}
                </h3>
                {selectedTask && (
                  <p className="text-xs text-slate-500 mt-0.5">{selectedTask.title}</p>
                )}
              </div>
              <button onClick={closeEvalModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEvalSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Olgunluk Puanı (1–5)</label>
                <select
                  required
                  value={evalData.score}
                  onChange={e => setEvalData({ ...evalData, score: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="5">5 — Çok İyi (Tam Olgun)</option>
                  <option value="4">4 — İyi</option>
                  <option value="3">3 — Orta</option>
                  <option value="2">2 — Geliştirilmeli</option>
                  <option value="1">1 — Yetersiz (Başlangıç)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Geri Bildirim</label>
                <textarea
                  rows={4}
                  value={evalData.feedback}
                  onChange={e => setEvalData({ ...evalData, feedback: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Görevin kalitesi ve olgunluk seviyesi hakkında detaylı geri bildiriminiz..."
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeEvalModal}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition-colors text-sm font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors text-sm font-medium disabled:bg-indigo-400 flex items-center gap-2"
                >
                  {submitting ? 'Kaydediliyor...' : (evalData.isEdit ? 'Güncellemeyi Kaydet' : 'Değerlendirmeyi Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Publish Confirm Modal ---- */}
      {isPublishConfirmOpen && taskToPublish && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-emerald-50">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Ana Dala Yayınla</h3>
                <p className="text-xs text-slate-500 mt-0.5">Bu işlem geri alınamaz</p>
              </div>
              <button onClick={closePublishConfirm} className="text-slate-400 hover:text-slate-600 ml-auto">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900">&quot;{taskToPublish.title}&quot;</span> görevi,
                {taskToPublish.criterionCode && (
                  <span className="font-semibold text-blue-600"> {taskToPublish.criterionCode} </span>
                )}
                ölçütü altında <span className="font-bold text-emerald-700">ana dala yayınlanacak</span> ve
                akreditasyon kanıtı olarak kayıt altına alınacaktır.
              </p>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700">
                  ⚠️ Yayınlama işlemi öncesinde görevin <strong>değerlendirilmiş</strong> olması gerekmektedir.
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={closePublishConfirm}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium"
              >
                İptal
              </button>
              <button
                onClick={handlePublish}
                className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors text-sm font-semibold flex items-center gap-2"
              >
                <Send size={15} />
                Evet, Yayınla
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
