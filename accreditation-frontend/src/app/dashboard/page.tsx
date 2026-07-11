export default function DashboardHome() {
  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">MEDEK Yönetim Paneline Hoş Geldiniz</h1>
        <p className="text-slate-600 leading-relaxed mb-6">
          Kurumsal akreditasyon süreçlerinizi ve kurumsal alt hiyerarşinizi bu panel üzerinden yönetebilirsiniz. 
          Sol taraftaki menüyü kullanarak size atanan görevleri görüntüleyebilir, onlara dair kanıt sunabilir 
          veya yetkiniz dahilindeki kullanıcılara yeni görevler atayabilirsiniz.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Görevlerinizi Takip Edin</h3>
            <p className="text-blue-700 text-sm">
              "Bana Atanan Görevler" sekmesinden üzerinizdeki aktif beklentileri görüntüleyin 
              ve gerekli kanıt belgelerini sisteme yükleyin.
            </p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">Süreçleri Yönetin</h3>
            <p className="text-indigo-700 text-sm">
              Eğer yönetici konumundaysanız, alt birimlerinize görev atamalarını yapabilir 
              ve atadığınız görevlerin durumlarını takip edebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
