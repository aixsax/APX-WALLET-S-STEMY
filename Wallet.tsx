import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { 
  Layout, 
  FileText, 
  Shield, 
  HelpCircle, 
  Phone, 
  Save, 
  Plus, 
  Trash2, 
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AdminCMS() {
  const { 
    privacyPolicy, 
    updatePrivacyPolicy,
    termsOfService,
    updateTermsOfService,
    faqItems,
    addFAQItem,
    updateFAQItem,
    deleteFAQItem,
    contactInfo,
    updateContactInfo,
    siteContent,
    updateSiteContent,
    updateHowItWorksStep,
    updateStat
  } = useCMS();

  const [activeTab, setActiveTab] = useState('site');
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '', category: 'Genel' });
  const [editingFAQ, setEditingFAQ] = useState<number | null>(null);

  // Site Content Handlers
  const handleSaveSiteContent = () => {
    toast.success('Site içeriği kaydedildi!');
  };

  // Privacy Policy Handlers
  const handleSavePrivacy = () => {
    toast.success('Gizlilik politikası güncellendi!');
  };

  // Terms Handlers
  const handleSaveTerms = () => {
    toast.success('Kullanım koşulları güncellendi!');
  };

  // FAQ Handlers
  const handleAddFAQ = () => {
    if (newFAQ.question && newFAQ.answer) {
      addFAQItem({
        ...newFAQ,
        order: faqItems.length + 1,
        isActive: true
      });
      setNewFAQ({ question: '', answer: '', category: 'Genel' });
      toast.success('SSS eklendi!');
    }
  };

  const handleUpdateFAQ = (id: number, data: Partial<typeof newFAQ>) => {
    updateFAQItem(id, data);
    toast.success('SSS güncellendi!');
  };

  const handleDeleteFAQ = (id: number) => {
    if (confirm('Bu SSS\'yi silmek istediğinize emin misiniz?')) {
      deleteFAQItem(id);
      toast.success('SSS silindi!');
    }
  };

  // Contact Handlers
  const handleSaveContact = () => {
    toast.success('İletişim bilgileri kaydedildi!');
  };

  if (!siteContent || !privacyPolicy || !termsOfService || !contactInfo) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">İçerik yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Site İçerik Yönetimi</h1>
          <p className="text-gray-600 mt-2">
            Sitenin tüm içeriklerini buradan yönetebilirsiniz.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="site" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              <span className="hidden sm:inline">Site İçeriği</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Gizlilik</span>
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Koşullar</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">SSS</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">İletişim</span>
            </TabsTrigger>
          </TabsList>

          {/* Site Content Tab */}
          <TabsContent value="site">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hero Bölümü</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Başlık</Label>
                    <Input 
                      value={siteContent.heroTitle}
                      onChange={(e) => updateSiteContent({ heroTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Alt Başlık</Label>
                    <Input 
                      value={siteContent.heroSubtitle}
                      onChange={(e) => updateSiteContent({ heroSubtitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Açıklama</Label>
                    <Textarea 
                      value={siteContent.heroDescription}
                      onChange={(e) => updateSiteContent({ heroDescription: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Buton Metni</Label>
                    <Input 
                      value={siteContent.heroButtonText}
                      onChange={(e) => updateSiteContent({ heroButtonText: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hakkımızda Bölümü</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Başlık</Label>
                    <Input 
                      value={siteContent.aboutTitle}
                      onChange={(e) => updateSiteContent({ aboutTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>İçerik</Label>
                    <Textarea 
                      value={siteContent.aboutContent}
                      onChange={(e) => updateSiteContent({ aboutContent: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Özellikler Bölümü</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Başlık</Label>
                    <Input 
                      value={siteContent.featuresTitle}
                      onChange={(e) => updateSiteContent({ featuresTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Alt Başlık</Label>
                    <Input 
                      value={siteContent.featuresSubtitle}
                      onChange={(e) => updateSiteContent({ featuresSubtitle: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Nasıl Çalışır Adımları</h3>
                <div className="space-y-4">
                  {siteContent.howItWorksSteps.map((step, index) => (
                    <div key={index} className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        <Label>Adım {index + 1} Başlık</Label>
                        <Input 
                          value={step.title}
                          onChange={(e) => updateHowItWorksStep(index, { title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Açıklama</Label>
                        <Input 
                          value={step.description}
                          onChange={(e) => updateHowItWorksStep(index, { description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>İkon</Label>
                        <Input 
                          value={step.icon}
                          onChange={(e) => updateHowItWorksStep(index, { icon: e.target.value })}
                          placeholder="Lucide icon adı"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {siteContent.stats.map((stat, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        <Label>Etiket</Label>
                        <Input 
                          value={stat.label}
                          onChange={(e) => updateStat(index, { label: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Değer</Label>
                        <Input 
                          value={stat.value}
                          onChange={(e) => updateStat(index, { value: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Footer</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Hakkımızda Metni</Label>
                    <Textarea 
                      value={siteContent.footerAbout}
                      onChange={(e) => updateSiteContent({ footerAbout: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Copyright Metni</Label>
                    <Input 
                      value={siteContent.footerCopyright}
                      onChange={(e) => updateSiteContent({ footerCopyright: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meta Başlık</Label>
                    <Input 
                      value={siteContent.metaTitle}
                      onChange={(e) => updateSiteContent({ metaTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Meta Anahtar Kelimeler</Label>
                    <Input 
                      value={siteContent.metaKeywords}
                      onChange={(e) => updateSiteContent({ metaKeywords: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Meta Açıklama</Label>
                    <Textarea 
                      value={siteContent.metaDescription}
                      onChange={(e) => updateSiteContent({ metaDescription: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSiteContent} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Privacy Policy Tab */}
          <TabsContent value="privacy">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div className="space-y-2">
                <Label>Başlık</Label>
                <Input 
                  value={privacyPolicy.title}
                  onChange={(e) => updatePrivacyPolicy({ title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>İçerik (HTML destekler)</Label>
                <Textarea 
                  value={privacyPolicy.content}
                  onChange={(e) => updatePrivacyPolicy({ content: e.target.value })}
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="privacyActive"
                  checked={privacyPolicy.isActive}
                  onChange={(e) => updatePrivacyPolicy({ isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="privacyActive" className="mb-0">Aktif</Label>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSavePrivacy} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Terms Tab */}
          <TabsContent value="terms">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div className="space-y-2">
                <Label>Başlık</Label>
                <Input 
                  value={termsOfService.title}
                  onChange={(e) => updateTermsOfService({ title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>İçerik (HTML destekler)</Label>
                <Textarea 
                  value={termsOfService.content}
                  onChange={(e) => updateTermsOfService({ content: e.target.value })}
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="termsActive"
                  checked={termsOfService.isActive}
                  onChange={(e) => updateTermsOfService({ isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="termsActive" className="mb-0">Aktif</Label>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveTerms} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <div className="space-y-6">
              {/* Add New FAQ */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yeni SSS Ekle</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Soru</Label>
                    <Input 
                      value={newFAQ.question}
                      onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                      placeholder="Soruyu yazın..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cevap</Label>
                    <Textarea 
                      value={newFAQ.answer}
                      onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                      placeholder="Cevabı yazın..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Input 
                      value={newFAQ.category}
                      onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
                      placeholder="Örn: Genel, Ödeme, Görevler"
                    />
                  </div>
                  <Button onClick={handleAddFAQ} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Ekle
                  </Button>
                </div>
              </div>

              {/* FAQ List */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mevcut SSS'ler</h3>
                <div className="space-y-4">
                  {faqItems.filter(item => item.isActive).sort((a, b) => a.order - b.order).map((faq) => (
                    <div key={faq.id} className="border rounded-lg p-4">
                      {editingFAQ === faq.id ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Soru</Label>
                            <Input 
                              value={faq.question}
                              onChange={(e) => handleUpdateFAQ(faq.id, { question: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Cevap</Label>
                            <Textarea 
                              value={faq.answer}
                              onChange={(e) => handleUpdateFAQ(faq.id, { answer: e.target.value })}
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Kategori</Label>
                            <Input 
                              value={faq.category}
                              onChange={(e) => handleUpdateFAQ(faq.id, { category: e.target.value })}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => setEditingFAQ(null)} size="sm" className="bg-green-600 hover:bg-green-700">
                              <Check className="w-4 h-4 mr-1" />
                              Tamam
                            </Button>
                            <Button onClick={() => setEditingFAQ(null)} size="sm" variant="outline">
                              <X className="w-4 h-4 mr-1" />
                              İptal
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {faq.category}
                              </span>
                              <span className="text-xs text-gray-400">Sıra: {faq.order}</span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{faq.question}</h4>
                            <p className="text-gray-600 text-sm">{faq.answer}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button onClick={() => setEditingFAQ(faq.id)} size="sm" variant="outline">
                              Düzenle
                            </Button>
                            <Button onClick={() => handleDeleteFAQ(faq.id)} size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>E-posta</Label>
                  <Input 
                    value={contactInfo.email}
                    onChange={(e) => updateContactInfo({ email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input 
                    value={contactInfo.phone || ''}
                    onChange={(e) => updateContactInfo({ phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adres</Label>
                  <Input 
                    value={contactInfo.address || ''}
                    onChange={(e) => updateContactInfo({ address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Çalışma Saatleri</Label>
                  <Input 
                    value={contactInfo.workingHours || ''}
                    onChange={(e) => updateContactInfo({ workingHours: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input 
                    value={contactInfo.whatsapp || ''}
                    onChange={(e) => updateContactInfo({ whatsapp: e.target.value })}
                    placeholder="905551234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telegram</Label>
                  <Input 
                    value={contactInfo.telegram || ''}
                    onChange={(e) => updateContactInfo({ telegram: e.target.value })}
                    placeholder="@kullaniciadi"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input 
                    value={contactInfo.instagram || ''}
                    onChange={(e) => updateContactInfo({ instagram: e.target.value })}
                    placeholder="@kullaniciadi"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input 
                    value={contactInfo.facebook || ''}
                    onChange={(e) => updateContactInfo({ facebook: e.target.value })}
                    placeholder="sayfaadi"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter</Label>
                  <Input 
                    value={contactInfo.twitter || ''}
                    onChange={(e) => updateContactInfo({ twitter: e.target.value })}
                    placeholder="@kullaniciadi"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveContact} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
