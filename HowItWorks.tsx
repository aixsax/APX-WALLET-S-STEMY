import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Wallet, 
  Percent, 
  Calculator,
  Clock,
  History,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { SiteSettings, InterestEarning } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface InterestProps {
  navigate: (page: string) => void;
}

export default function InterestPage({ navigate: _navigate }: InterestProps) {
  const { user, updateBalance } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [earnings, setEarnings] = useState<InterestEarning[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState('');

  useEffect(() => {
    const savedSettings = localStorage.getItem('gorevyap_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const allEarnings = JSON.parse(localStorage.getItem('gorevyap_interests') || '[]');
    setEarnings(allEarnings.filter((e: InterestEarning) => e.userId === user?.id));

    // Check last claim date
    const lastClaim = localStorage.getItem(`gorevyap_last_claim_${user?.id}`);
    setLastClaimDate(lastClaim);

    // Check if can claim (24 hours passed)
    if (lastClaim) {
      const lastDate = new Date(lastClaim);
      const now = new Date();
      const diff = now.getTime() - lastDate.getTime();
      const hoursPassed = diff / (1000 * 60 * 60);
      setCanClaim(hoursPassed >= 24);

      // Calculate time until next claim
      if (hoursPassed < 24) {
        const remainingMs = (24 * 60 * 60 * 1000) - diff;
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        setTimeUntilNextClaim(`${hours}s ${minutes}d`);
      }
    } else {
      setCanClaim(true);
    }
  }, [user]);

  const calculateDailyInterest = () => {
    if (!settings || !user) return { gross: 0, tax: 0, net: 0 };
    
    const grossInterest = user.balance * (settings.interestRate / 100);
    const tax = grossInterest * (settings.interestTaxRate / 100);
    const netInterest = grossInterest - tax;
    
    return {
      gross: grossInterest,
      tax,
      net: netInterest
    };
  };

  const handleClaimInterest = () => {
    if (!canClaim || !settings || !user) return;
    
    const { gross, tax, net } = calculateDailyInterest();
    
    if (net <= 0) return;

    // Create interest earning record
    const newEarning: InterestEarning = {
      id: Date.now(),
      userId: user.id,
      amount: gross,
      rate: settings.interestRate,
      tax,
      netAmount: net,
      date: new Date().toISOString(),
    };

    const allEarnings = JSON.parse(localStorage.getItem('gorevyap_interests') || '[]');
    localStorage.setItem('gorevyap_interests', JSON.stringify([newEarning, ...allEarnings]));

    // Update last claim date
    localStorage.setItem(`gorevyap_last_claim_${user.id}`, new Date().toISOString());

    // Add balance
    updateBalance(net);

    // Add transaction
    const transactions = JSON.parse(localStorage.getItem('gorevyap_transactions') || '[]');
    const newTransaction = {
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      type: 'interest',
      amount: net,
      status: 'approved',
      method: 'Günlük Faiz',
      accountInfo: `Oran: %${settings.interestRate}`,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('gorevyap_transactions', JSON.stringify([newTransaction, ...transactions]));

    setEarnedAmount(net);
    setShowSuccessDialog(true);
    setCanClaim(false);
    setLastClaimDate(new Date().toISOString());
    setEarnings([newEarning, ...earnings]);
  };

  const interest = calculateDailyInterest();
  const meetsMinBalance = (user?.balance || 0) >= (settings?.minInterestBalance || 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Faiz Kazancı</h1>
          <p className="text-gray-600">Bakiyenizden günlük faiz kazanın</p>
        </div>

        {!meetsMinBalance && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              Faiz kazanmak için minimum ₺{settings?.minInterestBalance} bakiyeniz olmalıdır.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Balance Card */}
        <Card className="mb-6 bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 mb-1">Mevcut Bakiye</p>
                <h2 className="text-4xl font-bold">₺{user?.balance.toFixed(2)}</h2>
                {meetsMinBalance && (
                  <p className="text-white/60 text-sm mt-2">
                    Günlük kazanç: ₺{interest.net.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Wallet className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interest Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Percent className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Günlük Faiz Oranı</p>
                  <p className="text-2xl font-bold text-gray-900">%{settings?.interestRate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vergi Kesintisi</p>
                  <p className="text-2xl font-bold text-gray-900">%{settings?.interestTaxRate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Net Günlük Kazanç</p>
                  <p className="text-2xl font-bold text-green-600">₺{interest.net.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claim Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Günlük Faiz Al
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-gray-600">
                  Her 24 saatte bir faiz kazancınızı alabilirsiniz.
                </p>
                {lastClaimDate && !canClaim && (
                  <p className="text-sm text-gray-500 mt-1">
                    Sonraki alım için: <span className="font-medium text-violet-600">{timeUntilNextClaim}</span>
                  </p>
                )}
              </div>
              <Button
                className="bg-violet-600 hover:bg-violet-700"
                disabled={!canClaim || !meetsMinBalance}
                onClick={handleClaimInterest}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {canClaim ? 'Faiz Al' : 'Bekleniyor'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calculation Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Hesaplama Detayları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Brüt Faiz (%{settings?.interestRate})</span>
                <span className="font-medium">₺{interest.gross.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Vergi Kesintisi (%{settings?.interestTaxRate})</span>
                <span className="font-medium text-red-600">-₺{interest.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-900 font-medium">Net Kazanç</span>
                <span className="font-bold text-green-600">₺{interest.net.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Kazanç Geçmişi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {earnings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Henüz faiz kazancı bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {earnings.map((earning) => (
                  <div
                    key={earning.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-900">Günlük Faiz</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Oran: %{earning.rate} | Vergi: ₺{earning.tax.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(earning.date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-green-600">
                        +₺{earning.netAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogTitle className="text-center">Faiz Kazancı Alındı!</DialogTitle>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600">
                <strong>₺{earnedAmount.toFixed(2)}</strong> faiz kazancınız bakiyenize eklendi!
              </p>
              <Button 
                className="mt-4 bg-violet-600"
                onClick={() => setShowSuccessDialog(false)}
              >
                Tamam
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
