"use client";

import React, { useState, useEffect } from 'react';
import { PlusCircle, X, Calendar, User, FileText } from 'lucide-react';

interface MedekStandard {
    id: string;
    code: string;
    title: string;
    description: string;
    subStandards: MedekStandard[];
}

interface AppUser {
    id: string;
    firstName: string;
    lastName: string;
    title?: string;
}

// 1. RECURSIVE ALT BİLEŞEN
const StandardNode = ({
    standard,
    onOpenTaskModal
}: {
    standard: MedekStandard,
    onOpenTaskModal: (std: MedekStandard) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = standard.subStandards && standard.subStandards.length > 0;

    return (
        <div className="mt-3">
            <div
                className={`group flex items-center p-4 bg-white border border-slate-200 rounded-xl transition-all duration-200 ${hasChildren ? 'cursor-pointer hover:border-blue-400 hover:shadow-md' : 'hover:border-slate-300'}`}
                onClick={() => hasChildren && setIsOpen(!isOpen)}
            >
                <div className="w-8 flex justify-center items-center">
                    {hasChildren ? (
                        <span className={`transform transition-transform duration-300 text-blue-600 ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                    ) : (
                        <span className="text-slate-300 text-xs">●</span>
                    )}
                </div>

                <div className="ml-2 flex-1">
                    <span className="font-extrabold text-blue-900 bg-blue-50 px-2 py-1 rounded-md text-sm mr-3 border border-blue-100">
                        {standard.code}
                    </span>
                    <span className="font-semibold text-slate-800">{standard.title}</span>
                </div>

                {/* SADECE ALT MADDELERDE GÖRÜNEN GÖREV BUTONU */}
                {!hasChildren && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenTaskModal(standard); // Tıklanan standardı ana bileşene gönderiyoruz
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg border border-blue-100"
                    >
                        <PlusCircle size={14} />
                        Görev Ata
                    </button>
                )}
            </div>

            {isOpen && hasChildren && (
                <div className="ml-8 border-l-2 border-slate-100 pl-6 mt-2">
                    {standard.subStandards.map((child) => (
                        <StandardNode key={child.id} standard={child} onOpenTaskModal={onOpenTaskModal} />
                    ))}
                </div>
            )}
        </div>
    );
};

// 2. ANA BİLEŞEN (Ağacı ve Modalı Tutar)
export default function StandardTree({ data }: { data: MedekStandard[] }) {
    const [selectedStandard, setSelectedStandard] = useState<MedekStandard | null>(null);
    const [loading, setLoading] = useState(false);

    // 🚀 Backend'den çekilecek kullanıcıları tutan state
    const [users, setUsers] = useState<AppUser[]>([]);

    // Form verilerini tutacağımız state
    const [taskData, setTaskData] = useState({
        assigneeId: '',
        deadline: '',
        description: ''
    });

    const tenantId = "83be0617-72bc-4b62-b952-63584cc522aa"; // Kendi Tenant ID'n

    // Modal açıldığında Kullanıcıları Backend'den Çek
    useEffect(() => {
        if (selectedStandard) {
            const fetchUsers = async () => {
                try {
                    // DİKKAT: Spring Boot User Controller adresini kendi backend'ine göre kontrol et!
                    const response = await fetch(`http://localhost:8080/api/v1/users/tenant/${tenantId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setUsers(data);
                    } else {
                        console.error("Kullanıcılar getirilemedi. Durum:", response.status);
                    }
                } catch (error) {
                    console.error("Kullanıcı listesi çekilirken bağlantı hatası:", error);
                }
            };
            fetchUsers();
        }
    }, [selectedStandard]);

    // ERÇEK BACKEND GÖREV ATAMA BAĞLANTISI
    const handleAssignTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Spring Boot'a göndereceğimiz JSON paketi
        const payload = {
            standardId: selectedStandard?.id,
            assigneeId: taskData.assigneeId,
            deadline: `${taskData.deadline}T00:00:00`, // Backend Orchestrator will set time to end of day
            description: taskData.description,
            tenantId: tenantId
        };

        try {
            // DİKKAT: Spring Boot Task Controller adresinin doğru olduğundan emin ol
            const response = await fetch('http://localhost:8080/api/v1/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Görev başarıyla atandı! 🎉");
                setSelectedStandard(null); // Modalı kapat
                setTaskData({ assigneeId: '', deadline: '', description: '' }); // Formu temizle
            } else {
                alert("Görev atanırken bir hata oluştu. Lütfen Spring Boot konsolunu kontrol et.");
            }
        } catch (error) {
            console.error("Bağlantı hatası:", error);
            alert("Sunucuya ulaşılamadı! Backend çalışıyor mu?");
        } finally {
            setLoading(false);
        }
    };

    if (!data || data.length === 0) return <div className="p-8 text-center text-slate-500">Standart bulunamadı.</div>;

    return (
        <div className="w-full relative">
            {/* Ağaç Çizimi */}
            {data.map((item) => (
                <StandardNode key={item.id} standard={item} onOpenTaskModal={setSelectedStandard} />
            ))}

            {/* GÖREV ATAMA MODALI (Pop-up) */}
            {selectedStandard && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">

                        {/* Modal Başlığı */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <FileText className="text-blue-600" size={24} />
                                    Yeni Görev Ata
                                </h3>
                                <p className="text-sm font-semibold text-blue-600 mt-1">
                                    Hedef: {selectedStandard.code} - {selectedStandard.title}
                                </p>
                            </div>
                            <button onClick={() => setSelectedStandard(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Formu */}
                        <form onSubmit={handleAssignTask} className="p-6 space-y-5">

                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                                    <User size={16} className="text-slate-400" /> Sorumlu Kişi (Assignee)
                                </label>
                                <select
                                    required
                                    value={taskData.assigneeId}
                                    onChange={(e) => setTaskData({ ...taskData, assigneeId: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="">Lütfen listeden seçin...</option>

                                    {/* Backend'den Gelen Kullanıcıları Dinamik Listele */}
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.title ? `${user.title} ` : ''}{user.firstName} {user.lastName}
                                        </option>
                                    ))}

                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                                    <Calendar size={16} className="text-slate-400" /> Son Teslim Tarihi (Deadline)
                                </label>
                                <input
                                    required
                                    type="date"
                                    value={taskData.deadline}
                                    onChange={(e) => setTaskData({ ...taskData, deadline: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">Görev Açıklaması / İstenen Kanıtlar</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={taskData.description}
                                    onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                                    placeholder="Bu standart için hangi belgelerin sisteme yüklenmesi gerektiğini detaylıca yazın..."
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setSelectedStandard(null)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Kaydediliyor...' : 'Görevi Oluştur'}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
}