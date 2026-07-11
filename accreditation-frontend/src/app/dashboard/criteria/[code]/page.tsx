"use client";
import { use } from "react";
import React, { useEffect, useState } from 'react';
import api from '../../../../lib/api';
import { CriterionResponse } from '../../../../types/criterion';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FileText, UploadCloud, Calendar, User,
  CheckSquare, ChevronDown, ChevronUp, Star, Award, Info,
  GitBranch, Shield, Download
} from 'lucide-react';
import clsx from 'clsx';

export default function CriterionDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const code = resolvedParams.code;

  const [criterion, setCriterion] = useState<CriterionResponse | null>(null);
  const [publishedTasks, setPublishedTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  useEffect(() => {
    if (!code) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [criterionRes, tasksRes] = await Promise.all([
          api.get(`/api/v1/criteria/code/${code}`),
          api.get(`/api/v1/tasks/criterion/${code}/published`)
        ]);
        setCriterion(criterionRes.data);
        setPublishedTasks(tasksRes.data);
      } catch (err: unknown) {
        console.error("Veriler yüklenirken hata:", err);
        setError("Ölçüt bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code]);

  const handleFileDownload = async (fileUrl: string, fileName: string = 'kanit-dosyasi') => {
    const toastId = toast.loading('Dosya indiriliyor...');
    try {
      // Ensure fileUrl starts with the API prefix to avoid fetching from root
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
      toast.success('Dosya başarıyla indirildi.', { id: toastId });
    } catch (error) {
      toast.error('Dosya indirilirken bir hata oluştu.', { id: toastId });
    }
  };

  // --- SKELETON LOADING ---
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-pulse">
        <div className="h-40 bg-slate-200 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-8 bg-slate-200 rounded-lg w-1/3 mb-4"></div>
            {[1, 2].map((i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-2xl w-full"></div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-slate-100 rounded-2xl w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !criterion) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl flex items-center justify-center font-medium shadow-sm"
      >
        {error || "Ölçüt bulunamadı."}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto space-y-6 pb-20"
    >
      {/* ÜST BAŞLIK */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Award size={200} />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm text-3xl font-black text-blue-300 shrink-0 shadow-inner">
            {criterion.code}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {criterion.title}
              </h1>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] px-3 py-1 rounded-full border border-blue-500/30 font-bold uppercase tracking-wider">
                GÜNCEL
              </span>
              {publishedTasks.length > 0 && (
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-3 py-1 rounded-full border border-emerald-500/30 font-bold uppercase tracking-wider flex items-center gap-1">
                  <GitBranch size={10} />
                  {publishedTasks.length} KANIT
                </span>
              )}
            </div>

            <div className="relative">
              <p className={clsx(
                "text-slate-300 text-sm sm:text-base leading-relaxed transition-all duration-300",
                !isDescExpanded && "line-clamp-2"
              )}>
                {criterion.description || "Bu ölçüt için henüz detaylı bir açıklama girilmemiş."}
              </p>
              {criterion.description && criterion.description.length > 150 && (
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="mt-3 text-blue-400 hover:text-blue-300 text-xs font-bold flex items-center gap-1 transition-colors bg-white/5 px-3 py-1.5 rounded-lg"
                >
                  {isDescExpanded ? 'Daha az göster' : 'Tümünü oku'}
                  {isDescExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SOL KOLON: ANA DAL KANITLARI */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <GitBranch className="text-emerald-500" size={22} />
              Ana Dal — Onaylanmış Kanıtlar
            </h2>
            <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
              {publishedTasks.length} Kayıt
            </span>
          </div>

          {publishedTasks.length === 0 ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-12 border border-dashed border-slate-300 text-center shadow-sm"
            >
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-inner">
                <GitBranch size={32} />
              </div>
              <h3 className="text-slate-900 font-bold text-lg mb-1">Ana Dalda Kanıt Bulunmuyor</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Bu ölçüt için henüz yayınlanmış ve onaylanmış bir çalışma bulunmamaktadır.
                Yeni eklenen kanıtlar yönetici tarafından onaylandıktan sonra burada görünecektir.
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: {}
              }}
            >
              {publishedTasks.map((task) => (
                <TaskCard key={task.id} task={task} criterionCode={criterion.code} onDownload={handleFileDownload} />
              ))}
            </motion.div>
          )}
        </div>

        {/* SAĞ KOLON */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Info className="text-blue-500" size={20} />
              Ölçüt Bilgisi
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Mevcut Durum</span>
                <span className={clsx(
                  "text-sm font-bold px-3 py-1 rounded-lg",
                  publishedTasks.length > 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>
                  {publishedTasks.length > 0 ? 'Kanıtlar Mevcut' : 'Kanıt Bekleniyor'}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Toplam Kanıt</span>
                <span className="text-sm font-bold text-slate-700">{publishedTasks.length}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Son Güncelleme</span>
                <span className="text-sm font-bold text-slate-700">
                  {publishedTasks.length > 0 && publishedTasks[0].completedAt
                    ? new Date(Math.max(...publishedTasks.map(t => new Date(t.completedAt || 0).getTime()))).toLocaleDateString('tr-TR')
                    : '—'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Star size={18} className="text-amber-500 fill-amber-500" /> Kanıt Yönergesi
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Bu ölçüt için sunulan tüm kanıtlar, ilgili birim yöneticisi tarafından onaylandıktan sonra bu listede yer alır.
              Sunulan kanıtların doğruluğu ve güncelliği akreditasyon süreci için kritiktir.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- TaskCard Bileşeni ---
function TaskCard({ task, criterionCode, onDownload }: {
  task: any;
  criterionCode: string;
  onDownload: (url: string, name: string) => void;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 group"
    >
      {/* Kart Başlığı */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                <GitBranch size={10} />
                Ana Dal
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-3">
              {task.title}
            </h3>

            {/* Görev yapan & Yayınlayan */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg border border-blue-100">
                <User size={13} />
                <span className="font-semibold">Yapan:</span> {task.assignedToName || '—'}
              </span>
              <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2.5 py-1.5 rounded-lg border border-purple-100">
                <Shield size={13} />
                <span className="font-semibold">Yayınlayan:</span> {task.assignedByName || '—'}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                <Calendar size={13} className="text-slate-400" />
                {task.completedAt
                  ? new Date(task.completedAt).toLocaleDateString('tr-TR')
                  : 'Tarih Yok'}
              </span>
            </div>
          </div>

          {task.documentUrl && (
            <button
              onClick={() => onDownload(task.documentUrl, `${criterionCode}-kanit`)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white rounded-xl text-sm font-bold border border-emerald-100 transition-all w-full sm:w-auto shrink-0"
            >
              <Download size={16} />
              Kanıtı İndir
            </button>
          )}
        </div>

        <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
          {task.description}
        </p>
      </div>

      {/* PUKÖ Özeti */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50">
        <div className="space-y-2">
          <span className="inline-block text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Planlama (P)</span>
          <p className="text-xs text-slate-600 leading-relaxed">{task.planText || 'Belirtilmedi'}</p>
        </div>
        <div className="space-y-2">
          <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Uygulama (U)</span>
          <p className="text-xs text-slate-600 leading-relaxed flex items-center gap-1">
            <CheckSquare size={14} className="text-emerald-500" />
            {task.documentUrl ? 'Kanıt dosyası sisteme eklendi.' : 'Dosya eklenmedi.'}
          </p>
        </div>
        <div className="space-y-2">
          <span className="inline-block text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-0.5 rounded">Kontrol / Önlem (KÖ)</span>
          <div className="text-xs text-slate-600 leading-relaxed space-y-1">
            {task.checkText && <p><strong className="text-slate-800">K:</strong> {task.checkText}</p>}
            {task.actText && <p><strong className="text-slate-800">Ö:</strong> {task.actText}</p>}
            {!task.checkText && !task.actText && <p>Belirtilmedi</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}