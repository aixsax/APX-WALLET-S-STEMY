import React, { createContext, useContext, useState, useEffect } from 'react';
import type { PrivacyPolicy, TermsOfService, FAQItem, ContactInfo, SiteContent } from '@/types';

interface CMSContextType {
  // Privacy Policy
  privacyPolicy: PrivacyPolicy | null;
  updatePrivacyPolicy: (data: Partial<PrivacyPolicy>) => void;
  
  // Terms of Service
  termsOfService: TermsOfService | null;
  updateTermsOfService: (data: Partial<TermsOfService>) => void;
  
  // FAQ
  faqItems: FAQItem[];
  addFAQItem: (item: Omit<FAQItem, 'id'>) => void;
  updateFAQItem: (id: number, data: Partial<FAQItem>) => void;
  deleteFAQItem: (id: number) => void;
  reorderFAQItems: (items: FAQItem[]) => void;
  
  // Contact Info
  contactInfo: ContactInfo | null;
  updateContactInfo: (data: Partial<ContactInfo>) => void;
  
  // Site Content
  siteContent: SiteContent | null;
  updateSiteContent: (data: Partial<SiteContent>) => void;
  updateHowItWorksStep: (index: number, data: { title?: string; description?: string; icon?: string }) => void;
  updateStat: (index: number, data: { label?: string; value?: string }) => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

const DEFAULT_PRIVACY_POLICY: PrivacyPolicy = {
  id: 1,
  title: 'Gizlilik Politikası',
  content: `<h2 class="text-xl font-bold mb-4">1. Giriş</h2>
<p class="mb-4">GörevYap olarak, kullanıcılarımızın gizliliğini ciddiye alıyoruz. Bu Gizlilik Politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.</p>

<h2 class="text-xl font-bold mb-4">2. Toplanan Bilgiler</h2>
<p class="mb-4">Aşağıdaki kişisel bilgileri toplayabiliriz:</p>
<ul class="list-disc pl-6 mb-4">
  <li>Ad ve soyad</li>
  <li>E-posta adresi</li>
  <li>Telefon numarası</li>
  <li>Ödeme bilgileri</li>
  <li>Kullanıcı adı ve AX-ID</li>
</ul>

<h2 class="text-xl font-bold mb-4">3. Bilgilerin Kullanımı</h2>
<p class="mb-4">Topladığımız bilgileri şu amaçlarla kullanırız:</p>
<ul class="list-disc pl-6 mb-4">
  <li>Hizmetlerimizi sağlamak</li>
  <li>Ödemeleri işlemek</li>
  <li>Müşteri desteği sunmak</li>
  <li>Güvenliği sağlamak</li>
</ul>

<h2 class="text-xl font-bold mb-4">4. Bilgi Paylaşımı</h2>
<p class="mb-4">Kişisel bilgilerinizi üçüncü taraflarla paylaşmayız, ancak yasal zorunluluk durumunda yetkili mercilerle paylaşabiliriz.</p>

<h2 class="text-xl font-bold mb-4">5. Veri Güvenliği</h2>
<p class="mb-4">Verilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz.</p>

<h2 class="text-xl font-bold mb-4">6. Haklarınız</h2>
<p class="mb-4">Kişisel verilerinize erişim, düzeltme ve silme haklarına sahipsiniz.</p>`,
  lastUpdated: new Date().toISOString(),
  isActive: true,
};

const DEFAULT_TERMS: TermsOfService = {
  id: 1,
  title: 'Kullanım Koşulları',
  content: `<h2 class="text-xl font-bold mb-4">1. Kabul</h2>
<p class="mb-4">GörevYap platformunu kullanarak bu koşulları kabul etmiş olursunuz.</p>

<h2 class="text-xl font-bold mb-4">2. Hesap Oluşturma</h2>
<p class="mb-4">Doğru ve güncel bilgilerle hesap oluşturmalısınız. Hesap güvenliğinizden siz sorumlusunuz.</p>

<h2 class="text-xl font-bold mb-4">3. Görev Kuralları</h2>
<p class="mb-4">Görevleri dürüstçe tamamlamalısınız. Sahte kanıtlar hesabınızın askıya alınmasına yol açar.</p>

<h2 class="text-xl font-bold mb-4">4. Ödeme Koşulları</h2>
<p class="mb-4">Minimum çekim tutarı 50 TL'dir. Ödemeler 1-3 iş günü içinde işleme alınır.</p>

<h2 class="text-xl font-bold mb-4">5. Yasaklı Faaliyetler</h2>
<ul class="list-disc pl-6 mb-4">
  <li>Sahte hesap oluşturma</li>
  <li>Dolandırıcılık</li>
  <li>Sistem manipülasyonu</li>
  <li>Diğer kullanıcıları taciz etme</li>
</ul>

<h2 class="text-xl font-bold mb-4">6. Hesap Sonlandırma</h2>
<p class="mb-4">Kuralları ihlal eden hesaplar uyarısız kapatılabilir.</p>`,
  lastUpdated: new Date().toISOString(),
  isActive: true,
};

const DEFAULT_FAQ_ITEMS: FAQItem[] = [
  {
    id: 1,
    question: 'GörevYap nedir?',
    answer: 'GörevYap, çeşitli görevleri tamamlayarak para kazanabileceğiniz bir platformdur. Sosyal medya görevleri, anketler, video izleme ve daha fazlası ile gelir elde edebilirsiniz.',
    category: 'Genel',
    order: 1,
    isActive: true,
  },
  {
    id: 2,
    question: 'Nasıl para çekebilirim?',
    answer: 'Minimum 50 TL bakiyeniz olduğunda, cüzdan sayfanızdan IBAN veya kripto cüzdanınıza para çekebilirsiniz. Ödemeler 1-3 iş günü içinde işleme alınır.',
    category: 'Ödeme',
    order: 2,
    isActive: true,
  },
  {
    id: 3,
    question: 'AX-ID nedir?',
    answer: 'AX-ID, para transferleri için kullanılan benzersiz kimlik numaranızdır. AX ile başlar ve 24 rakam içerir. Türkiye IBAN uzunluğunda (26 karakter) olup güvenli transfer sağlar.',
    category: 'Genel',
    order: 3,
    isActive: true,
  },
  {
    id: 4,
    question: 'Görev kanıtı nasıl gönderilir?',
    answer: 'Görev detay sayfasında "Kanıt Gönder" butonuna tıklayarak fotoğraf yükleyebilir ve açıklama yazabilirsiniz. Admin onayından sonra bakiyenize ödeme yapılır.',
    category: 'Görevler',
    order: 4,
    isActive: true,
  },
  {
    id: 5,
    question: 'Başka kullanıcıya transfer yapabilir miyim?',
    answer: 'Evet! Cüzdan sayfanızdan "Transfer Yap" seçeneği ile AX-ID veya kullanıcı adı ile başka üyelere bakiye transfer edebilirsiniz.',
    category: 'Ödeme',
    order: 5,
    isActive: true,
  },
  {
    id: 6,
    question: 'Faiz kazancı nedir?',
    answer: 'Bakiyeniz belirli bir tutarın üzerindeyse günlük faiz kazancı elde edebilirsiniz. Faiz oranları ve vergi kesintisi admin panelinden ayarlanır.',
    category: 'Kazanç',
    order: 6,
    isActive: true,
  },
];

const DEFAULT_CONTACT_INFO: ContactInfo = {
  id: 1,
  email: 'destek@gorevyap.com',
  phone: '0850 123 45 67',
  address: 'İstanbul, Türkiye',
  workingHours: 'Pazartesi - Cuma: 09:00 - 18:00',
  whatsapp: '905551234567',
  telegram: '@gorevyapdestek',
  instagram: '@gorevyap',
  facebook: 'gorevyap',
  twitter: '@gorevyap',
};

const DEFAULT_SITE_CONTENT: SiteContent = {
  id: 1,
  heroTitle: 'Görev Yap, Para Kazan!',
  heroSubtitle: 'Kolay Görevler, Gerçek Kazanç',
  heroDescription: 'GörevYap ile sosyal medya görevleri, anketler, video izleme ve daha fazlasını yaparak para kazanın. Hemen üye olun, kazanmaya başlayın!',
  heroButtonText: 'Hemen Başla',
  heroImage: '',
  aboutTitle: 'GörevYap Nedir?',
  aboutContent: 'GörevYap, Türkiye\'nin önde gelen görev ve kazanç platformudur. 2024 yılından bu yana binlerce kullanıcıya güvenilir bir gelir kaynağı sunuyoruz. Görevleri tamamlayın, kanıtlarınızı yükleyin ve kazancınızı anında çekin.',
  aboutImage: '',
  featuresTitle: 'Neden GörevYap?',
  featuresSubtitle: 'Size sunduğumuz avantajlarla kazancınızı maksimize edin',
  howItWorksTitle: 'Nasıl Çalışır?',
  howItWorksSteps: [
    { title: 'Üye Olun', description: 'Hemen ücretsiz hesap oluşturun', icon: 'UserPlus' },
    { title: 'Görev Seçin', description: 'Size uygun görevleri seçin', icon: 'ListTodo' },
    { title: 'Görevi Tamamlayın', description: 'Görevi eksiksiz tamamlayın', icon: 'CheckCircle' },
    { title: 'Kazancınızı Çekin', description: 'Bakiyenizi istediğiniz zaman çekin', icon: 'Wallet' },
  ],
  statsTitle: 'Rakamlarla GörevYap',
  stats: [
    { label: 'Aktif Kullanıcı', value: '50,000+' },
    { label: 'Tamamlanan Görev', value: '1M+' },
    { label: 'Ödenen Tutar', value: '₺5M+' },
    { label: 'Günlük Görev', value: '500+' },
  ],
  footerAbout: 'GörevYap, görev tamamlayarak para kazanabileceğiniz Türkiye\'nin en güvenilir platformudur.',
  footerCopyright: '© 2024 GörevYap. Tüm hakları saklıdır.',
  metaTitle: 'GörevYap - Görev Yap, Para Kazan',
  metaDescription: 'GörevYap ile sosyal medya görevleri, anketler ve video izleme ile para kazanın. Hemen üye olun!',
  metaKeywords: 'görev yap para kazan, internetten para kazan, anket doldur para kazan, sosyal medya görevleri',
};

export function CMSProvider({ children }: { children: React.ReactNode }) {
  const [privacyPolicy, setPrivacyPolicy] = useState<PrivacyPolicy | null>(null);
  const [termsOfService, setTermsOfService] = useState<TermsOfService | null>(null);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    // Initialize CMS data
    const storedPrivacy = localStorage.getItem('gorevyap_privacy_policy');
    const storedTerms = localStorage.getItem('gorevyap_terms');
    const storedFAQ = localStorage.getItem('gorevyap_faq');
    const storedContact = localStorage.getItem('gorevyap_contact');
    const storedSiteContent = localStorage.getItem('gorevyap_site_content');

    if (storedPrivacy) {
      setPrivacyPolicy(JSON.parse(storedPrivacy));
    } else {
      setPrivacyPolicy(DEFAULT_PRIVACY_POLICY);
      localStorage.setItem('gorevyap_privacy_policy', JSON.stringify(DEFAULT_PRIVACY_POLICY));
    }

    if (storedTerms) {
      setTermsOfService(JSON.parse(storedTerms));
    } else {
      setTermsOfService(DEFAULT_TERMS);
      localStorage.setItem('gorevyap_terms', JSON.stringify(DEFAULT_TERMS));
    }

    if (storedFAQ) {
      setFaqItems(JSON.parse(storedFAQ));
    } else {
      setFaqItems(DEFAULT_FAQ_ITEMS);
      localStorage.setItem('gorevyap_faq', JSON.stringify(DEFAULT_FAQ_ITEMS));
    }

    if (storedContact) {
      setContactInfo(JSON.parse(storedContact));
    } else {
      setContactInfo(DEFAULT_CONTACT_INFO);
      localStorage.setItem('gorevyap_contact', JSON.stringify(DEFAULT_CONTACT_INFO));
    }

    if (storedSiteContent) {
      setSiteContent(JSON.parse(storedSiteContent));
    } else {
      setSiteContent(DEFAULT_SITE_CONTENT);
      localStorage.setItem('gorevyap_site_content', JSON.stringify(DEFAULT_SITE_CONTENT));
    }
  }, []);

  const updatePrivacyPolicy = (data: Partial<PrivacyPolicy>) => {
    if (privacyPolicy) {
      const updated = { ...privacyPolicy, ...data, lastUpdated: new Date().toISOString() };
      setPrivacyPolicy(updated);
      localStorage.setItem('gorevyap_privacy_policy', JSON.stringify(updated));
    }
  };

  const updateTermsOfService = (data: Partial<TermsOfService>) => {
    if (termsOfService) {
      const updated = { ...termsOfService, ...data, lastUpdated: new Date().toISOString() };
      setTermsOfService(updated);
      localStorage.setItem('gorevyap_terms', JSON.stringify(updated));
    }
  };

  const addFAQItem = (item: Omit<FAQItem, 'id'>) => {
    const newItem: FAQItem = { ...item, id: Date.now() };
    const updated = [...faqItems, newItem];
    setFaqItems(updated);
    localStorage.setItem('gorevyap_faq', JSON.stringify(updated));
  };

  const updateFAQItem = (id: number, data: Partial<FAQItem>) => {
    const updated = faqItems.map(item => item.id === id ? { ...item, ...data } : item);
    setFaqItems(updated);
    localStorage.setItem('gorevyap_faq', JSON.stringify(updated));
  };

  const deleteFAQItem = (id: number) => {
    const updated = faqItems.filter(item => item.id !== id);
    setFaqItems(updated);
    localStorage.setItem('gorevyap_faq', JSON.stringify(updated));
  };

  const reorderFAQItems = (items: FAQItem[]) => {
    setFaqItems(items);
    localStorage.setItem('gorevyap_faq', JSON.stringify(items));
  };

  const updateContactInfo = (data: Partial<ContactInfo>) => {
    if (contactInfo) {
      const updated = { ...contactInfo, ...data };
      setContactInfo(updated);
      localStorage.setItem('gorevyap_contact', JSON.stringify(updated));
    }
  };

  const updateSiteContent = (data: Partial<SiteContent>) => {
    if (siteContent) {
      const updated = { ...siteContent, ...data };
      setSiteContent(updated);
      localStorage.setItem('gorevyap_site_content', JSON.stringify(updated));
    }
  };

  const updateHowItWorksStep = (index: number, data: { title?: string; description?: string; icon?: string }) => {
    if (siteContent) {
      const steps = [...siteContent.howItWorksSteps];
      steps[index] = { ...steps[index], ...data };
      updateSiteContent({ howItWorksSteps: steps });
    }
  };

  const updateStat = (index: number, data: { label?: string; value?: string }) => {
    if (siteContent) {
      const stats = [...siteContent.stats];
      stats[index] = { ...stats[index], ...data };
      updateSiteContent({ stats });
    }
  };

  return (
    <CMSContext.Provider value={{
      privacyPolicy,
      updatePrivacyPolicy,
      termsOfService,
      updateTermsOfService,
      faqItems,
      addFAQItem,
      updateFAQItem,
      deleteFAQItem,
      reorderFAQItems,
      contactInfo,
      updateContactInfo,
      siteContent,
      updateSiteContent,
      updateHowItWorksStep,
      updateStat,
    }}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
}
