"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StandardHeader() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Form elemanlarını tutacağımız state
    const [formData, setFormData] = useState({
        code: '',
        title: '',
        description: ''
    });

    // Backend'e veri gönderme fonksiyonu
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // DİKKAT: Swagger'da kullandığın kendi Tenant ID'ni buraya yapıştır!
        const tenantId = "83be0617-72bc-4b62-b952-63584cc522aa";

        try {
            const response = await fetch('http://localhost:8080/api/v1/medek-standards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tenantId: tenantId
                })
            });

            if (response.ok) {
                setIsModalOpen(false); // Modalı kapat
                setFormData({ code: '', title: '', description: '' }); // Formu temizle
                router.refresh(); // Sayfayı yenile ki yeni eklenen standart ağaçta görünsün!
            } else {
                alert("Bir hata oluştu, lütfen konsolu kontrol edin.");
            }
        } catch (error) {
            console.error("Bağlantı hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Modern Başlık ve Buton */}
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Değerlendirme Ölçütleri
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">Kurumun güncel akreditasyon standartları ve alt kırılımları.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                    + Yeni Standart
                </button>
            </header>

            {/* Şık Modal (Pop-up) Ekranı */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800">Yeni Standart Ekle</h3>
                            <p className="text-xs text-slate-500 mt-1">Sisteme yeni bir ana başlık ölçütü tanımlayın.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Standart Kodu (Örn: 2.)</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Başlık</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Açıklama (Opsiyonel)</label>
                                <textarea
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}