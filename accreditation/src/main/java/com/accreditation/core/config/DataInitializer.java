package com.accreditation.core.config;

import com.accreditation.core.entity.Role;
import com.accreditation.core.entity.Tenant;
import com.accreditation.core.entity.User;
import com.accreditation.core.entity.OrganizationUnit;
import com.accreditation.core.entity.Department;
import com.accreditation.core.entity.Faculty;
import com.accreditation.core.repository.OrganizationUnitRepository;
import com.accreditation.core.repository.RoleRepository;
import com.accreditation.core.repository.TenantRepository;
import com.accreditation.core.repository.UserRepository;
import com.accreditation.core.entity.Criterion;
import com.accreditation.core.repository.CriterionRepository;
import com.accreditation.core.repository.DepartmentRepository;
import com.accreditation.core.repository.FacultyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

        private final RoleRepository roleRepository;
        private final UserRepository userRepository;
        private final TenantRepository tenantRepository;
        private final OrganizationUnitRepository organizationUnitRepository;
        private final DepartmentRepository departmentRepository;
        private final FacultyRepository facultyRepository;
        private final PasswordEncoder passwordEncoder;
        private final CriterionRepository criterionRepository;

        @Override
        public void run(String... args) throws Exception {
                if (userRepository.count() == 0) {
                        setupHierarchy();
                }
                if (criterionRepository.count() == 0) {
                        setupCriteria();
                }
        }

        @Transactional
        public void setupHierarchy() {
                // 1. Tenant
                Tenant tenant = new Tenant();
                tenant.setName("Karabük Üniversitesi");
                tenant.setSubdomain("karabuk");
                tenant = tenantRepository.save(tenant);

                // 2. Roles (Senin verdiğin tam hiyerarşi - İngilizce Standart)
                Role roleSysAdmin = createRole("ROLE_SYS_ADMIN", null);
                Role roleRector = createRole("ROLE_RECTOR", null);
                Role roleViceRector = createRole("ROLE_VICE_RECTOR", roleRector);

                // Yüksekokul Müdürü direkt Rektör'e (veya idari akışta Rektör Yrd'ya) bağlıdır
                Role roleDirector = createRole("ROLE_DIRECTOR", roleViceRector);

                // Bölüm Başkanı (Örn: Bilgisayar Teknolojileri Bölüm Başkanı) Müdüre bağlıdır
                Role roleHeadOfDept = createRole("ROLE_HEAD_OF_DEPARTMENT", roleDirector);

                // Program Sorumlusu (Örn: Web Tasarımı Programı Sorumlusu) Bölüm Başkanına
                // bağlıdır
                Role roleProgCoordinator = createRole("ROLE_PROGRAM_COORDINATOR", roleHeadOfDept);

                // Akademisyenler Program Sorumlusuna bağlıdır
                Role roleAcademician = createRole("ROLE_ACADEMICIAN", roleProgCoordinator);

                // 3. Organization Unit (Yüksekokul)
                OrganizationUnit orgMyo = new OrganizationUnit();
                orgMyo.setName("TOBB Teknik Bilimler Meslek Yüksekokulu");
                orgMyo = organizationUnitRepository.save(orgMyo);

                // 4. Faculty/School Entity (Yüksekokul bir fakülte dengidir)
                Faculty school = new Faculty();
                school.setName("TOBB Teknik Bilimler MYO");
                school.setTenant(tenant);
                school = facultyRepository.save(school);

                // 5. Department (Bölüm - Örn: Bilgisayar Teknolojileri)
                Department department = new Department();
                department.setName("Bilgisayar Teknolojileri Bölümü");
                department.setTenant(tenant);
                department.setFaculty(school);
                department = departmentRepository.save(department);

                // 6. Users (Hiyerarşiye uygun örnek data)
                createUser("Sistem Yöneticisi", "admin@karabuk.edu.tr", roleSysAdmin, tenant, null, null);
                createUser("Rektör Ahmet", "rektor@karabuk.edu.tr", roleRector, tenant, null, null);
                createUser("Rektör Yrd Ayşe", "rektoryrd@karabuk.edu.tr", roleViceRector, tenant, null, null);

                // Müdür
                createUser("Müdür Mustafa", "mudur@karabuk.edu.tr", roleDirector, tenant, orgMyo, null);

                // Bölüm Başkanı
                createUser("Bölüm Bşk Ali", "bolumbaskani@karabuk.edu.tr", roleHeadOfDept, tenant, orgMyo, department);

                // Program Sorumlusu (Örn: Arka Yüz Yazılım Programı Sorumlusu)
                createUser("Prog. Sorumlusu Can", "programsorumlusu@karabuk.edu.tr", roleProgCoordinator, tenant,
                                orgMyo,
                                department);

                // Akademisyen
                createUser("Akademisyen Fatma", "akademisyen@karabuk.edu.tr", roleAcademician, tenant, orgMyo,
                                department);

                System.out.println("MYO Hiyerarşisi başarıyla kuruldu!");
        }

        private Role createRole(String name, Role parent) {
                Role role = new Role();
                role.setName(name);
                role.setParentRole(parent);
                return roleRepository.save(role);
        }

        private void createUser(String fullName, String email, Role role, Tenant tenant, OrganizationUnit unit,
                        Department department) {
                User user = new User();
                user.setFullName(fullName);
                user.setEmail(email);
                user.setPasswordHash(passwordEncoder.encode("1234"));
                user.setRole(role);
                user.setTenant(tenant);
                user.setOrganizationUnit(unit);
                user.setDepartment(department);
                userRepository.save(user);
        }

        @Transactional
        public void setupCriteria() {
                Criterion c1 = createCriterion(null, "1", "Öğrenciler", "Ölçüt 1. Öğrenciler");
                createCriterion(c1, "1.1", "Öğrenci Yeterliliği",
                                "Programa yerleştirilen öğrenciler, program çıktılarını (bilgi, beceri ve yeterlilikler) normal öğrenim süresinde kazanabilecek akademik yeterlilik düzeyine sahip olmalıdır.");
                createCriterion(c1, "1.2", "Öğrenci Kabul Göstergeleri",
                                "Öğrenci kabulünde göz önüne alınan göstergeler (YKS puanı, kontenjan doluluk oranı, taban-tavan puanlar, özel koşullar vb.) düzenli olarak izlenmeli...");
                createCriterion(c1, "1.3", "Yazılı Prosedürler",
                                "Öğrenci kabul süreçlerine ilişkin (özel yetenek sınavı, yatay geçiş ve uluslararası öğrenci kabulü vb.) yazılı prosedürler bulunmalı ve uygulanmalıdır.");
                createCriterion(c1, "1.4", "Önceki Öğrenim",
                                "Önceki öğrenimlerin kredilendirilmesi tanımlanmış ve uygulanıyor olmalıdır.");
                createCriterion(c1, "1.5", "Öğrenci Merkezli Öğretim",
                                "Öğretim süreçleri, öğrencinin aktif katılımını, farklı öğrenme stillerini ve bireysel gelişim ihtiyaçlarını dikkate alan öğrenci merkezli bir yaklaşım üzerine kurulmuş olmalıdır.");
                createCriterion(c1, "1.6", "İş Birlikleri",
                                "Kurum ve/veya programın diğer kurum veya kuruluşlarla gerçekleştirdiği iş birlikleri ve/veya protokoller işletiliyor olmalıdır.");
                createCriterion(c1, "1.7", "Öğrenci Hareketliliği",
                                "Öğrenci hareketliliğini ve değişim programlarını teşvik eden prosedür ve düzenlemeler bulunmalıdır.");
                createCriterion(c1, "1.8", "Öğrenci Merkezli Yöntemler",
                                "Hedeflenen mezun yeterliliklerine ulaşmak için öğrenci merkezli öğretim, ölçme ve değerlendirme yöntemleri sistematik olarak uygulanıyor olmalıdır.");
                createCriterion(c1, "1.9", "Danışmanlık - Kariyer",
                                "Öğrencilerin akademik gelişimi ve kariyer planlamasına yönelik danışmanlık hizmetleri işletiyor olmalıdır.");
                createCriterion(c1, "1.10", "Danışmanlık - Başarı",
                                "Öğrencilerin derslerdeki başarı durumunu izleyen ve ders planlaması konularında rehberlik eden danışmanlık hizmetleri işletiyor olmalıdır.");
                createCriterion(c1, "1.11", "Öğrenci Geri Bildirimleri",
                                "Öğrenci geri bildirimlerinin alınmasına yönelik mekanizmalar bulunmalı, uygulanmalı ve sürekli iyileştirme çalışmalarında değerlendirilmelidir.");
                createCriterion(c1, "1.12", "Ders Değerlendirme",
                                "Tüm derslerde öğrenci ders başarısı şeffaf, adil, tutarlı ve önceden ilan edilmiş yöntemlerle ölçülmeli ve değerlendirilmelidir.");
                createCriterion(c1, "1.13", "Mezuniyet Kontrolü",
                                "Öğrenci mezuniyetine karar verebilmek için, tüm akademik gerekliliklerin karşılandığını doğrulayan sistematik kontrol mekanizmaları bulunmalı ve uygulanıyor olmalıdır.");

                Criterion c2 = createCriterion(null, "2", "Program Eğitim Amaçları",
                                "Ölçüt 2. Program Eğitim Amaçları");
                createCriterion(c2, "2.1", "Amaçların Tanımlanması",
                                "Program, eğitim amaç ve hedeflerini tanımlamış ve kamuoyuyla paylaşmış olmalıdır.");
                createCriterion(c2, "2.2", "Performans Göstergeleri",
                                "Program, eğitim amaç ve hedeflerine ulaşma düzeyini ölçmek ve belgelemek için anahtar performans göstergelerine sahip olmalıdır.");
                createCriterion(c2, "2.3", "Misyon Uyumu",
                                "Program eğitim amaçları; MEDEK, kurum ve meslek yüksekokulunun misyon ve vizyonu ile uyumlu olmalıdır.");
                createCriterion(c2, "2.4", "Değerlendirme Sistemi",
                                "Program eğitim amaçlarına nasıl ulaşılacağı tanımlı olmalı ve bunun için uygun bir ölçme değerlendirme sistemi bulunmalıdır.");
                createCriterion(c2, "2.5", "Sistematik İzleme",
                                "Program eğitim amaçlarına ulaşılma düzeyi sistematik bir şekilde izlenmelidir.");
                createCriterion(c2, "2.6", "Misyonun Paylaşılması",
                                "Programın tanımlanmış misyon ve vizyonu olmalı ve bunları kamuoyuyla paylaşmış olmalıdır.");
                createCriterion(c2, "2.7", "Paydaş Katılımı",
                                "İç ve dış paydaşların eğitim- öğretim süreçlerine katılımını sağlayacak mekanizmalar oluşturulmuş ve işletiliyor olmalıdır.");

                Criterion c3 = createCriterion(null, "3", "Program Çıktıları", "Ölçüt 3. Program Çıktıları");

                createCriterion(c3, "3.1", "Çıktıların Tanımlanması",
                                "Programın eğitim amaçlarına ulaşmayı sağlayacak bilgi, beceri ve yetkinlikleri içeren program çıktıları ve bu çıktılarla ilişkilendirilmiş ders öğrenme çıktıları tanımlanmış olmalıdır. Program çıktıları, MEDEK program çıktılarının tümünü karşılamalıdır.");

                createCriterion(c3, "3.2", "Ölçme Değerlendirme Süreci",
                                "Program çıktılarının sağlanma düzeyini dönemsel olarak belirlemek ve belgelemek için kullanılan bir ölçme ve değerlendirme süreci oluşturulmuş ve işletiliyor olmalıdır.");

                Criterion c4 = createCriterion(null, "4", "Sürekli İyileştirme", "Ölçüt 4. Sürekli İyileştirme");
                createCriterion(c4, "4.1", "Sistematik İzleme",
                                "Ders öğrenme çıktıları ve program çıktılarının izlenmesi için mekanizmalar kurulmuş olmalı ve belgelenmelidir.");
                createCriterion(c4, "4.2", "Geri Bildirim Kullanımı",
                                "Program iç ve dış paydaş geri bildirimlerini sürekli iyileştirme amacıyla kullanmalıdır.");
                createCriterion(c4, "4.3", "Mezun İzleme Sistemi",
                                "Mezun izleme sistemi aracılığıyla elde edilen verileri analiz ederek sürekli iyileştirme çalışmalarına yansıtmalıdır.");

                Criterion c5 = createCriterion(null, "5", "Öğretim Planı", "Ölçüt 5. Öğretim Planı");
                createCriterion(c5, "5.1", "Mesleki Dersler",
                                "Programa/alana özgü mesleki dersler en az 60 AKTS olmalıdır.");
                createCriterion(c5, "5.2", "Paydaş Önerileri",
                                "En az 5 AKTS, dış paydaş önerilerini dikkate alan derslerden oluşmalıdır.");
                createCriterion(c5, "5.3", "Uygulamalı Dersler",
                                "En az 15 AKTS iş yeri mesleki eğitim, staj vb. oluşmalıdır.");
                createCriterion(c5, "5.4", "Programa Özgü Ölçütler",
                                "Öğretim planı ilgili programa özgü ölçütleri içermelidir.");
                createCriterion(c5, "5.5", "İş Yükü Hesaplamaları",
                                "AKTS iş yükü hesaplamalarına dayalı plan kamuoyuyla paylaşılmalıdır.");
                createCriterion(c5, "5.6", "Yönetim Sistemleri",
                                "Öğretim planının iyileştirilmesini sağlayan kurumsal sistemler işletilmelidir.");

                Criterion c6 = createCriterion(null, "6", "Öğretim Kadrosu", "Ölçüt 6. Öğretim Kadrosu");
                createCriterion(c6, "6.1", "Kadro Yeterliliği",
                                "Öğretim elemanı kadrosu, öğretim gereksinimlerini karşılayacak nicelik ve nitelikte olmalıdır.");
                createCriterion(c6, "6.2", "Teşvik Mekanizmaları",
                                "Öğretim elemanlarına yönelik adil ve şeffaf teşvik sistemleri olmalıdır.");
                createCriterion(c6, "6.3", "İşe Alım Sistemi",
                                "Öğretim elemanı alımında tanımlı bir sistem uygulanmalıdır.");
                createCriterion(c6, "6.4", "Ders Dağılımı",
                                "Öğretim elemanlarının niteliklerine göre adil ders dağılım dengesi kurulmalıdır.");

                Criterion c7 = createCriterion(null, "7", "Altyapı", "Ölçüt 7. Altyapı");
                createCriterion(c7, "7.1", "Öğrenme Ortamları", "Eğitimi destekleyen öğrenme alanları sağlanmalıdır.");
                createCriterion(c7, "7.2", "Ders Dışı Etkinlikler",
                                "Ders dışı etkinlikler yapmaya olanak veren altyapı sağlanmalıdır.");
                createCriterion(c7, "7.3", "Güvenlik ve İSG",
                                "Çalışma alanlarında güvenlik ve İSG önlemleri alınmalıdır.");
                createCriterion(c7, "7.4", "Bilgiye Erişim",
                                "Bilgiye erişim olanakları yeterli düzeyde sağlanmalıdır.");
                createCriterion(c7, "7.5", "Özel Gereksinimler",
                                "Özel gereksinimli öğrenciler için altyapı düzenlemesi yapılmalıdır.");
                createCriterion(c7, "7.6", "BİT Altyapısı",
                                "Bilgi ve iletişim teknolojileri altyapısı yeterli olmalıdır.");

                Criterion c8 = createCriterion(null, "8", "Yönetim ve İdari Yapı",
                                "Ölçüt 8. Yönetim ve İdari Birimlerin Yapısı");
                createCriterion(c8, "8.1", "Yönetim Modeli", "Misyon ile uyumlu yönetim modeli bulunmalıdır.");
                createCriterion(c8, "8.2", "İnsan Kaynakları",
                                "İnsan kaynaklarının etkin kullanımını sağlayan süreçler bulunmalıdır.");
                createCriterion(c8, "8.3", "Hizmet İçi Eğitim",
                                "Akademik ve idari personele yönelik hizmet içi eğitimler sunulmalıdır.");
                createCriterion(c8, "8.4", "Hesap Verebilirlik",
                                "Program kamuoyunu bilgilendirmeyi ilke benimsemeli ve uygulamalıdır.");

                Criterion c9 = createCriterion(null, "9", "Programa Özgü Ölçütler", "Ölçüt 9. Programa Özgü Ölçütler");
                createCriterion(c9, "9.1", "Derslerin Uyumu",
                                "Öğretim planındaki dersler, ölçme değerlendirme ile programa özgü ölçütleri sağlamalıdır.");

                System.out.println("MEDEK Ölçütleri başarıyla veri tabanına eklendi!");
        }

        private Criterion createCriterion(Criterion parent, String code, String title, String description) {
                Criterion c = new Criterion();
                c.setCode(code);
                c.setTitle(title);
                c.setDescription(description);
                c.setParentCriterion(parent);
                return criterionRepository.save(c);
        }
}
