import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Save, 
  Loader2, 
  CheckCircle,
  Image,
  CreditCard,
  Wrench,
  Percent,
  TrendingUp,
  Bitcoin,
  ArrowLeftRight
} from 'lucide-react';
import type { SiteSettings } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'GörevYap',
    siteLogo: '',
    minWithdrawal: 50,
    referralBonus: 10,
    taskApprovalRequired: false,
    maintenanceMode: false,
    transactionFee: 2,
    interestRate: 0.5,
    interestTaxRate: 15,
    minInterestBalance: 100,
    cryptoWithdrawalEnabled: true,
    cryptoMinWithdrawal: 100,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const savedSettings = localStorage.getItem('gorevyap_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSuccess('');

    setTimeout(() => {
      localStorage.setItem('gorevyap_settings', JSON.stringify(settings));
      setIsSaving(false);
      setSuccess('Ayarlar başarıyla kaydedildi');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Site Ayarları</h1>
          <p className="text-gray-600">Platform ayarlarını yapılandır</p>
        </div>

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">
              <Wrench className="w-4 h-4 mr-2" />
              Genel
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="w-4 h-4 mr-2" />
              Ödeme
            </TabsTrigger>
            <TabsTrigger value="transfer">
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Transfer
            </TabsTrigger>
            <TabsTrigger value="interest">
              <TrendingUp className="w-4 h-4 mr-2" />
              Faiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Marka Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Adı</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    placeholder="GörevYap"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteLogo">Logo URL (Opsiyonel)</Label>
                  <Input
                    id="siteLogo"
                    value={settings.siteLogo}
                    onChange={(e) => setSettings({ ...settings, siteLogo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Sistem Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="referralBonus">Referans Bonusu (₺)</Label>
                  <Input
                    id="referralBonus"
                    type="number"
                    value={settings.referralBonus}
                    onChange={(e) => setSettings({ ...settings, referralBonus: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="taskApproval" className="font-medium">Görev Onayı Gereksin</Label>
                    <p className="text-sm text-gray-500">Kullanıcı görevleri admin onayından geçsin</p>
                  </div>
                  <Switch
                    id="taskApproval"
                    checked={settings.taskApprovalRequired}
                    onCheckedChange={(checked) => setSettings({ ...settings, taskApprovalRequired: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance" className="font-medium">Bakım Modu</Label>
                    <p className="text-sm text-gray-500">Siteyi bakım moduna al</p>
                  </div>
                  <Switch
                    id="maintenance"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Banka/Papara Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="minWithdrawal">Minimum Çekim Tutarı (₺)</Label>
                  <Input
                    id="minWithdrawal"
                    type="number"
                    value={settings.minWithdrawal}
                    onChange={(e) => setSettings({ ...settings, minWithdrawal: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bitcoin className="w-5 h-5" />
                  Kripto Para Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cryptoEnabled" className="font-medium">Kripto Çekim Aktif</Label>
                    <p className="text-sm text-gray-500">Kullanıcılar kripto para çekebilsin</p>
                  </div>
                  <Switch
                    id="cryptoEnabled"
                    checked={settings.cryptoWithdrawalEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, cryptoWithdrawalEnabled: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cryptoMinWithdrawal">Kripto Minimum Çekim (₺)</Label>
                  <Input
                    id="cryptoMinWithdrawal"
                    type="number"
                    value={settings.cryptoMinWithdrawal}
                    onChange={(e) => setSettings({ ...settings, cryptoMinWithdrawal: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transfer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5" />
                  Transfer Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionFee">İşlem Ücreti (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="transactionFee"
                      type="number"
                      value={settings.transactionFee}
                      onChange={(e) => setSettings({ ...settings, transactionFee: parseFloat(e.target.value) || 0 })}
                    />
                    <Percent className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Kullanıcılar arası transferlerden kesilecek ücret oranı
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interest" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Faiz Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Günlük Faiz Oranı (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.01"
                      value={settings.interestRate}
                      onChange={(e) => setSettings({ ...settings, interestRate: parseFloat(e.target.value) || 0 })}
                    />
                    <Percent className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Bakiyeye uygulanacak günlük faiz oranı
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestTaxRate">Vergi Kesintisi (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="interestTaxRate"
                      type="number"
                      value={settings.interestTaxRate}
                      onChange={(e) => setSettings({ ...settings, interestTaxRate: parseFloat(e.target.value) || 0 })}
                    />
                    <Percent className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Faiz gelirinden kesilecek vergi oranı
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minInterestBalance">Minimum Faiz Bakiyesi (₺)</Label>
                  <Input
                    id="minInterestBalance"
                    type="number"
                    value={settings.minInterestBalance}
                    onChange={(e) => setSettings({ ...settings, minInterestBalance: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-sm text-gray-500">
                    Faiz kazanmak için gereken minimum bakiye
                  </p>
                </div>

                <div className="p-4 bg-violet-50 rounded-lg mt-4">
                  <p className="text-sm font-medium text-violet-800">Örnek Hesaplama:</p>
                  <p className="text-sm text-violet-600 mt-1">
                    1000₺ bakiye için günlük kazanç:<br />
                    Faiz: ₺{(1000 * (settings.interestRate / 100)).toFixed(2)}<br />
                    Vergi (%{settings.interestTaxRate}): ₺{(1000 * (settings.interestRate / 100) * (settings.interestTaxRate / 100)).toFixed(2)}<br />
                    Net Kazanç: ₺{(1000 * (settings.interestRate / 100) * (1 - settings.interestTaxRate / 100)).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button
          className="w-full bg-violet-600 hover:bg-violet-700"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Ayarları Kaydet
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
