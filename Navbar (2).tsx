import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Copy, 
  CheckCircle,
  Edit2,
  Loader2,
  AtSign,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfileProps {
  navigate: (_page: string) => void;
}

export default function Profile({ navigate: _navigate }: ProfileProps) {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const referralCode = `GY${user?.id?.toString().padStart(6, '0')}`;
  const referralLink = `${window.location.origin}/#/?ref=${referralCode}`;

  const handleSave = async () => {
    setIsSaving(true);
    setSuccess('');

    setTimeout(() => {
      updateUser({ name, phone });
      setIsSaving(false);
      setIsEditing(false);
      setSuccess('Profil başarıyla güncellendi');
    }, 1000);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profilim</h1>
          <p className="text-gray-600">Hesap bilgilerini yönet</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <Badge variant="outline" className="mt-1">
                  {user?.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Kişisel Bilgiler</CardTitle>
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Düzenle
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Ad Soyad
              </Label>
              {isEditing ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              ) : (
                <p className="text-gray-900">{user?.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AtSign className="w-4 h-4" />
                Kullanıcı Adı
              </Label>
              <p className="text-gray-900">@{user?.username}</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                AX-ID (Transfer ID)
              </Label>
              <div className="flex items-center gap-2">
                <p className="text-gray-900 font-mono text-sm">{user?.axId}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(user?.axId || '');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Bu ID ile diğer kullanıcılara transfer yapabilirsiniz</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                E-posta
              </Label>
              <p className="text-gray-900">{user?.email}</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefon
              </Label>
              {isEditing ? (
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0555 123 4567"
                />
              ) : (
                <p className="text-gray-900">{user?.phone || 'Belirtilmemiş'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Kayıt Tarihi
              </Label>
              <p className="text-gray-900">
                {user?.createdAt && new Date(user.createdAt).toLocaleDateString('tr-TR')}
              </p>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsEditing(false);
                    setName(user?.name || '');
                    setPhone(user?.phone || '');
                  }}
                >
                  İptal
                </Button>
                <Button
                  className="flex-1 bg-violet-600"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    'Kaydet'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
          <CardHeader>
            <CardTitle>Referans Programı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/80">
              Arkadaşlarını davet et, her kayıt için <strong>₺10</strong> kazan!
            </p>

            <div className="space-y-2">
              <Label className="text-white/80">Referans Kodun</Label>
              <div className="flex gap-2">
                <Input
                  value={referralCode}
                  readOnly
                  className="bg-white/10 border-white/20 text-white"
                />
                <Button
                  variant="secondary"
                  onClick={copyReferralLink}
                  className="flex-shrink-0"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-white/10 rounded-lg">
              <p className="text-sm text-white/80">
                <strong>Toplam Davet:</strong> 0
              </p>
              <p className="text-sm text-white/80">
                <strong>Toplam Kazanç:</strong> ₺0
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
