# Sistem Değerlendirme ve Kullanım Senaryoları (Use Cases) Raporu

## 1. Sistemin Temel Amacı ve Özellikleri (Features)

*   **Çoklu Kiracı (Multi-Tenancy) Mimarisi:** 
    *   Sistem aynı anda birden fazla bağımsız kuruluşu/üniversiteyi (Tenant) barındırabilir.
    *   Her kurumun kendi Fakülte ve Bölümleri izole bir şekilde yönetilir.
    *   Uygulama istenirse kurumların yerel sunucusunda, istenirse bir ana sunucudan tüm kurumlara hizmet verebilecek şekilde kullanılabilir.
*   **Hiyerarşik Görev Yönetimi:** Yöneticilerin, alt kademedeki kullanıcılara akreditasyon kriterleri bazında veri toplama görevleri atamasına olanak tanır.
*   **PUKÖ Yaşam Döngüsü:** Sisteme yüklenen kayıtlar PUKÖ metodolojisiyle (Planlama, Uygulama, Kontrol Etme, Önlem Alma) sisteme girilir.
*   **Kanıt ve Dosya Arşivi:** Uygulamalara kaynaklık eden kanıt dokümanları (Excel, PDF vb.) formlarla birlikte yüklenerek kriterlerin altında kanıt deposunda toparlanır.
*   **Değerlendirme ve "Ana Akışa" Alma:** Taslak halinde toplanan raporlar, yöneticiler tarafından puanlanıp onaylandıktan sonra yayına alınır (*Publish to Main Branch*).

---

## 2. Kullanıcı Rolleri

Projede yetkilendirme olarak üç ana rol bulunur:

1.  **Sistem Yöneticisi (SysAdmin / Admin):** Alt birim (Fakülte/Bölüm) ve sıfırdan kullanıcı oluşturma yapan, şifre sıfırlama, rol değiştirme gibi kurumsal Tenant operasyonlarını yöneten sistem sahibidir.
2.  **Görev Atayan (Assigner):** Akreditasyon sürecini alt personellere dağıtan, oluşturulan PUKÖ formlarını değerlendiren ve bu formları doğrulayarak resmi kanıt havuzuna dahil eden kişidir. (Müdür, rektör ve rektör yardımcısı rolleri).
3.  **Akademisyen (Subordinate / Assignee):** Kendisine atanan kalite/kriter görevleri doğrultusunda sistemi kullanarak rapor formatlarını ve dosyalarını dolduran görevli kişidir.

---

## 3. Kullanım Senaryoları (Use Cases)

Sistemin sunduğu modüllere göre kullanıcı senaryoları şunlardır:

### A. Kurumsal Yönetim ve Admin Senaryoları (Admin Panel)
*   **Kullanıcı Profili Oluşturma ve Yönetme:** Admin, yeni kullanıcı hesabını sisteme ekler, sistemdeki kullanıcının isim, e-posta, unvan bilgilerini düzenleyebilir, gerekiyorsa hesabı silebilir.
*   **Kurumsal Hiyerarşi Ataması:** Admin, sistemde dinamik olarak çekilen liste yardımıyla personelleri doğru Fakülte (*Faculty*) ve Bölüme (*Department*) tanımlar.
*   **Rol Yönetimi:** İlgili personelin yetki seviyesinin sistem yöneticisi üzerinden belirlenmesi ve güncellenmesi sağlanır.

### B. Görev ve İletişim Senaryoları (Task Management)
*   **Akreditasyon Görevi Oluşturma:** Yönetici, "Create Task" ekranından sistemde var olan spesifik bir kriteri seçerek, hiyerarşide altındaki bir personele süreli olarak görev tanımlar.
*   **Atanan Görevlerin Takibi (Assigned By Me):** Yönetici, atama yaptığı tüm personelinin tamamlanma durumlarını ve süreçlerini tek bir yönetici panelinden (*Assigned by Me Dashboard*) takip eder.
*   **Şahsi İş Yükünü Görme (My Tasks):** Sisteme giriş yapan personel, yalnızca kendi üstüne atanan kalite akreditasyon görevlerini liste halinde ve teslim tarihi detayıyla görüntüler.

### C. PUKÖ ve Dosya Yönetimi Senaryoları (PUKÖ Workflow)
*   **PUKÖ Verisi Girmek:** Kendisine görev atanmış personel, panel üzerinden görevi açar; Plan, Uygula, Kontrol ve Önlem aşamalarının metin içeriklerini forma doldurur.
*   **Kanıt Dosyası / Belgesi Eklemek:** PUKÖ çalışmalarını desteklemek amacıyla toplantı tutanakları, anket dosyaları vb. kanıt dokümanları sisteme (`multipart/form-data` yapısıyla) upload edilir.
*   **Formu ve Dosyayı Esnek Güncellemek:** Personel, sistem üzerinde yönetici değerlendirmesine geçmeden evvel kendi girmiş olduğu formları ve dosyaları revize edebilir/silebilir.

### D. Değerlendirme ve Yayına Alma Senaryoları (Evaluation & Publishing)
*   **Olgunluk (Maturity) Puanlaması:** Yönetici, kendi personeli tarafından teslim edilen PUKÖ çalışmasını okur. İçeriğe bir değerlendirme skoru (*Evaluation Score*) atar. Daha sonra gerekirse atadığı skoru düzeltebilir.
*   **Resmi Kanıt Olarak Yayınlamak (Publish to Main Branch):** Eğer sunulan PUKÖ dokümantasyonu başarılı bulunursa yönetici aksiyon alarak bunu "Ana Akış" dediğimiz nihai havuza alır. Bu durum bir taslağın resmi akreditasyon kanıtı haline gelmesi anlamına gelir.
*   **Yayından Geri Çekmek (Unpublish):** Yanlış bir onay durumunda veya daha iyi bir kanıt geliştirilmesi istendiğinde halihazırda yayınlanan metin ana akıştan geri taslak durumuna çekilebilir.

### E. Akreditasyon İzleme ve Çıktı Alma Senaryoları (Criteria Feed & Evidence Tree)
*   **Kriter Hiyerarşisini İncelemek:** "*Criteria Dashboard*" ile kurumdaki ilgili çalışanlar, kurumun tüm sahip olması gereken akreditasyon yapısını dinamik bir ağaç üstünde bir tıkla inceleyebilirler.
*   **Kanıt Havuzunu Sorgulamak:** Yayına alınmış (Publish edilmiş) olan PUKÖ verileri statik bir görünüm olmaktan çıkarak, bu kriter tablosunda herkes tarafından geçmişe dönük kanıt geçmişi feed'i olarak izlenebilir.
*   **Arşivden Kanıt Dosyalarını İndirmek:** İlgili kişiler/denetçiler akreditasyon havuzundaki dokümanların URL'leri üzerinden dosyaları güvenli bir yetkilendirmeyle orijinal halleriyle (PDF/Excel) bilgisayarlarına indirebilirler (Dosya İndirme Akışı).
