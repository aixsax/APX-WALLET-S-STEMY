import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Bitcoin,
  Send,
  User as UserIcon,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Transaction, SiteSettings, User } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WalletProps {
  navigate: (page: string) => void;
}

const withdrawMethods = [
  { id: 'bank', name: 'Banka Transferi', min: 50 },
  { id: 'papara', name: 'Papara', min: 25 },
  { id: 'paypal', name: 'PayPal', min: 10 },
];

const cryptoMethods = [
  { id: 'bitcoin', name: 'Bitcoin (BTC)', min: 100 },
  { id: 'ethereum', name: 'Ethereum (ETH)', min: 100 },
  { id: 'usdt', name: 'USDT (TRC20)', min: 50 },
];

export default function WalletPage({ navigate: _navigate }: WalletProps) {
  const { user, updateBalance } = useAuth();
  const [activeTab, setActiveTab] = useState<'withdraw' | 'history' | 'transfer'>('withdraw');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [accountInfo, setAccountInfo] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  
  // Transfer states
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientAxId, setRecipientAxId] = useState('');
  const [recipientUsername, setRecipientUsername] = useState('');
  const [transferMessage, setTransferMessage] = useState('');
  const [transferError, setTransferError] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [recipientUser, setRecipientUser] = useState<User | null>(null);
  
  // Crypto states
  const [cryptoTab, setCryptoTab] = useState<'fiat' | 'crypto'>('fiat');
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [cryptoAddress, setCryptoAddress] = useState('');

  useEffect(() => {
    const allTransactions = JSON.parse(localStorage.getItem('gorevyap_transactions') || '[]');
    setTransactions(allTransactions.filter((t: Transaction) => t.userId === user?.id));
    
    const savedSettings = localStorage.getItem('gorevyap_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [user]);

  const handleWithdraw = async () => {
    setError('');

    const amount = parseFloat(withdrawAmount);
    const isCrypto = cryptoTab === 'crypto';
    const method = isCrypto 
      ? cryptoMethods.find(m => m.id === selectedCrypto)
      : withdrawMethods.find(m => m.id === selectedMethod);

    if (!amount || amount <= 0) {
      setError('Geçerli bir tutar girin');
      return;
    }

    if (amount > (user?.balance || 0)) {
      setError('Yetersiz bakiye');
      return;
    }

    if (isCrypto && settings?.cryptoWithdrawalEnabled === false) {
      setError('Kripto para çekimi şu anda devre dışı');
      return;
    }

    const minAmount = isCrypto ? settings?.cryptoMinWithdrawal || method?.min : method?.min;
    if (minAmount && amount < minAmount) {
      setError(`Minimum çekim tutarı ₺${minAmount}`);
      return;
    }

    if (!accountInfo.trim() && !isCrypto) {
      setError('Hesap bilgilerini girin');
      return;
    }
    
    if (!cryptoAddress.trim() && isCrypto) {
      setError('Cüzdan adresini girin');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newTransaction: Transaction = {
        id: Date.now(),
        userId: user?.id || 0,
        userName: user?.name || '',
        type: 'withdraw',
        amount,
        status: 'pending',
        method: isCrypto 
          ? `${method?.name} - ${cryptoAddress}` 
          : method?.name || '',
        accountInfo: isCrypto ? cryptoAddress : accountInfo,
        createdAt: new Date().toISOString(),
      };

      const allTransactions = JSON.parse(localStorage.getItem('gorevyap_transactions') || '[]');
      localStorage.setItem('gorevyap_transactions', JSON.stringify([newTransaction, ...allTransactions]));

      updateBalance(-amount);
      setTransactions([newTransaction, ...transactions]);
      
      setIsSubmitting(false);
      setSuccessMessage(isCrypto ? 'Kripto çekim talebiniz alındı!' : 'Para çekme talebiniz alındı!');
      setShowSuccessDialog(true);
      setWithdrawAmount('');
      setAccountInfo('');
      setCryptoAddress('');
    }, 1500);
  };

  const findRecipient = () => {
    setTransferError('');
    
    if (!recipientAxId && !recipientUsername) {
      setTransferError('AX-ID veya kullanıcı adı girin');
      return;
    }

    const users = JSON.parse(localStorage.getItem('gorevyap_users') || '[]');
    const found = users.find((u: User) => 
      (recipientAxId && u.axId === recipientAxId) || 
      (recipientUsername && u.username === recipientUsername)
    );

    if (!found) {
      setTransferError('Kullanıcı bulunamadı');
      return;
    }

    if (found.id === user?.id) {
      setTransferError('Kendinize transfer yapamazsınız');
      return;
    }

    setRecipientUser(found);
    setShowTransferConfirm(true);
  };

  const handleTransfer = async () => {
    if (!recipientUser) return;

    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0) {
      setTransferError('Geçerli bir tutar girin');
      return;
    }

    if (amount > (user?.balance || 0)) {
      setTransferError('Yetersiz bakiye');
      return;
    }

    setIsTransferring(true);

    setTimeout(() => {
      const feePercent = settings?.transactionFee || 2;
      const fee = (amount * feePercent) / 100;
      const netAmount = amount - fee;

      // Create transfer record
      const transfer = {
        id: Date.now(),
        fromUserId: user?.id,
        fromUserName: user?.name,
        toUserId: recipientUser.id,
        toUserName: recipientUser.name,
        toAxId: recipientUser.axId,
        amount,
        fee,
        message: transferMessage,
        createdAt: new Date().toISOString(),
      };

      const transfers = JSON.parse(localStorage.getItem('gorevyap_transfers') || '[]');
      localStorage.setItem('gorevyap_transfers', JSON.stringify([transfer, ...transfers]));

      // Create transaction for sender
      const senderTransaction: Transaction = {
        id: Date.now(),
        userId: user?.id || 0,
        userName: user?.name || '',
        type: 'transfer_sent',
        amount,
        status: 'approved',
        method: 'Transfer',
        accountInfo: `${recipientUser.name} (${recipientUser.axId})`,
        createdAt: new Date().toISOString(),
        toUserId: recipientUser.id,
        toUserName: recipientUser.name,
        fee,
      };

      // Create transaction for recipient
      const recipientTransaction: Transaction = {
        id: Date.now() + 1,
        userId: recipientUser.id,
        userName: recipientUser.name,
        type: 'transfer_received',
        amount: netAmount,
        status: 'approved',
        method: 'Transfer',
        accountInfo: `${user?.name} (${user?.axId})`,
        createdAt: new Date().toISOString(),
        toUserId: recipientUser.id,
        toUserName: recipientUser.name,
      };

      const allTransactions = JSON.parse(localStorage.getItem('gorevyap_transactions') || '[]');
      localStorage.setItem('gorevyap_transactions', JSON.stringify([
        senderTransaction, 
        recipientTransaction, 
        ...allTransactions
      ]));

      // Update balances
      updateBalance(-amount);
      
      // Update recipient balance
      const users = JSON.parse(localStorage.getItem('gorevyap_users') || '[]');
      const updatedUsers = users.map((u: User) => 
        u.id === recipientUser.id ? { ...u, balance: u.balance + netAmount } : u
      );
      localStorage.setItem('gorevyap_users', JSON.stringify(updatedUsers));

      setIsTransferring(false);
      setShowTransferConfirm(false);
      setSuccessMessage(`₺${amount.toFixed(2)} başarıyla ${recipientUser.name} kullanıcısına transfer edildi!`);
      setShowSuccessDialog(true);
      setTransferAmount('');
      setRecipientAxId('');
      setRecipientUsername('');
      setTransferMessage('');
      setRecipientUser(null);
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" /> Beklemede</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Onaylandı</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" /> Reddedildi</Badge>;
      default:
        return null;
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'withdraw': return 'Para Çekme';
      case 'deposit': return 'Para Yatırma';
      case 'transfer_sent': return 'Gönderilen Transfer';
      case 'transfer_received': return 'Alınan Transfer';
      case 'interest': return 'Faiz Kazancı';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Cüzdan</h1>
          <p className="text-gray-600">Bakiyeni yönet, para çek ve transfer yap</p>
        </div>

        <Card className="mb-6 bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 mb-1">Mevcut Bakiye</p>
                <h2 className="text-4xl font-bold">₺{user?.balance.toFixed(2)}</h2>
                {user?.axId && (
                  <p className="text-white/60 text-sm mt-2">AX-ID: {user.axId}</p>
                )}
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Wallet className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="withdraw">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Para Çek
            </TabsTrigger>
            <TabsTrigger value="transfer">
              <Send className="w-4 h-4 mr-2" />
              Transfer
            </TabsTrigger>
            <TabsTrigger value="history">
              <ArrowDownLeft className="w-4 h-4 mr-2" />
              Geçmiş
            </TabsTrigger>
          </TabsList>

          <TabsContent value="withdraw">
            <Card>
              <CardHeader>
                <CardTitle>Para Çekme Talebi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Tabs value={cryptoTab} onValueChange={(v) => setCryptoTab(v as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fiat">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Banka/Kart
                    </TabsTrigger>
                    <TabsTrigger value="crypto">
                      <Bitcoin className="w-4 h-4 mr-2" />
                      Kripto Para
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="fiat" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Çekim Yöntemi</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {withdrawMethods.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                              selectedMethod === method.id
                                ? 'border-violet-600 bg-violet-50 text-violet-600'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {method.name}
                            <span className="block text-xs text-gray-500 mt-1">
                              Min: ₺{method.min}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Tutar</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account">Hesap Bilgileri</Label>
                      <Input
                        id="account"
                        placeholder={selectedMethod === 'bank' ? 'IBAN' : selectedMethod === 'papara' ? 'Papara No' : 'PayPal E-posta'}
                        value={accountInfo}
                        onChange={(e) => setAccountInfo(e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="crypto" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Kripto Para Birimi</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {cryptoMethods.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setSelectedCrypto(method.id)}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                              selectedCrypto === method.id
                                ? 'border-violet-600 bg-violet-50 text-violet-600'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {method.name}
                            <span className="block text-xs text-gray-500 mt-1">
                              Min: ₺{method.min}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cryptoAmount">Tutar (₺)</Label>
                      <Input
                        id="cryptoAmount"
                        type="number"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="walletAddress">Cüzdan Adresi</Label>
                      <Input
                        id="walletAddress"
                        placeholder={`${selectedCrypto.toUpperCase()} adresinizi girin`}
                        value={cryptoAddress}
                        onChange={(e) => setCryptoAddress(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  className="w-full bg-violet-600 hover:bg-violet-700"
                  onClick={handleWithdraw}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      İşleniyor...
                    </>
                  ) : (
                    'Para Çekme Talebi Gönder'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transfer">
            <Card>
              <CardHeader>
                <CardTitle>Bakiye Transferi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {transferError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{transferError}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientAxId">Alıcı AX-ID</Label>
                    <Input
                      id="recipientAxId"
                      placeholder="AX123456..."
                      value={recipientAxId}
                      onChange={(e) => setRecipientAxId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientUsername">veya Kullanıcı Adı</Label>
                    <Input
                      id="recipientUsername"
                      placeholder="kullaniciadi"
                      value={recipientUsername}
                      onChange={(e) => setRecipientUsername(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={findRecipient}
                  className="w-full"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Kullanıcı Bul
                </Button>

                {recipientUser && (
                  <div className="p-4 bg-violet-50 rounded-lg">
                    <p className="text-sm text-gray-600">Alıcı:</p>
                    <p className="font-medium">{recipientUser.name}</p>
                    <p className="text-sm text-gray-500">@{recipientUser.username}</p>
                    <p className="text-xs text-gray-400">{recipientUser.axId}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="transferAmount">Tutar</Label>
                  <Input
                    id="transferAmount"
                    type="number"
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                  />
                  {settings && settings.transactionFee > 0 && transferAmount && (
                    <p className="text-xs text-gray-500">
                      İşlem ücreti (%{settings.transactionFee}): ₺{((parseFloat(transferAmount) * settings.transactionFee) / 100).toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transferMessage">Mesaj (Opsiyonel)</Label>
                  <Input
                    id="transferMessage"
                    placeholder="Transfer notu..."
                    value={transferMessage}
                    onChange={(e) => setTransferMessage(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full bg-violet-600 hover:bg-violet-700"
                  onClick={() => setShowTransferConfirm(true)}
                  disabled={!recipientUser || !transferAmount || isTransferring}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Transfer Gönder
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>İşlem Geçmişi</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Henüz işlem bulunmuyor.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {getTransactionTypeText(transaction.type)}
                            </span>
                            {getStatusBadge(transaction.status)}
                          </div>
                          <p className="text-sm text-gray-600">{transaction.method}</p>
                          {transaction.toUserName && (
                            <p className="text-xs text-gray-500">
                              {transaction.type === 'transfer_sent' ? 'Alıcı: ' : 'Gönderen: '}
                              {transaction.toUserName}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold ${
                            transaction.type === 'withdraw' || transaction.type === 'transfer_sent' 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {transaction.type === 'withdraw' || transaction.type === 'transfer_sent' ? '-' : '+'}
                            ₺{transaction.amount.toFixed(2)}
                          </span>
                          {transaction.fee && transaction.fee > 0 && (
                            <p className="text-xs text-gray-500">Ücret: ₺{transaction.fee.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogTitle className="text-center">İşlem Başarılı!</DialogTitle>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600">{successMessage}</p>
              <Button 
                className="mt-4 bg-violet-600"
                onClick={() => setShowSuccessDialog(false)}
              >
                Tamam
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showTransferConfirm} onOpenChange={setShowTransferConfirm}>
          <DialogContent>
            <DialogTitle className="text-center">Transfer Onayı</DialogTitle>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-violet-600" />
              </div>
              <p className="text-gray-600 mb-4">
                <strong>₺{parseFloat(transferAmount || '0').toFixed(2)}</strong> tutarını
                <br />
                <strong>{recipientUser?.name}</strong> kullanıcısına transfer etmek istiyor musunuz?
              </p>
              {settings && settings.transactionFee > 0 && (
                <p className="text-sm text-gray-500 mb-4">
                  İşlem ücreti (%{settings.transactionFee}): ₺{((parseFloat(transferAmount || '0') * settings.transactionFee) / 100).toFixed(2)}
                  <br />
                  Alıcıya geçecek: ₺{(parseFloat(transferAmount || '0') - (parseFloat(transferAmount || '0') * settings.transactionFee) / 100).toFixed(2)}
                </p>
              )}
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowTransferConfirm(false)}
                >
                  İptal
                </Button>
                <Button 
                  className="flex-1 bg-violet-600"
                  onClick={handleTransfer}
                  disabled={isTransferring}
                >
                  {isTransferring ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Onayla'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
