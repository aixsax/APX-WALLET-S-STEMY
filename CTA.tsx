import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CheckCircle, 
  Wallet, 
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import type { User, Transaction } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AdminDashboardProps {
  navigate: (page: string) => void;
}

export default function AdminDashboard({ navigate }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    totalPaid: 0,
  });
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const users = JSON.parse(localStorage.getItem('gorevyap_users') || '[]');
    const tasks = JSON.parse(localStorage.getItem('gorevyap_tasks') || '[]');
    const transactions = JSON.parse(localStorage.getItem('gorevyap_transactions') || '[]');

    const pending = transactions.filter((t: Transaction) => t.status === 'pending');
    const approved = transactions.filter((t: Transaction) => t.status === 'approved');

    setStats({
      totalUsers: users.length,
      totalTasks: tasks.length,
      totalWithdrawals: transactions.length,
      pendingWithdrawals: pending.length,
      totalPaid: approved.reduce((sum: number, t: Transaction) => sum + t.amount, 0),
    });

    setPendingTransactions(pending.slice(0, 5));
    setRecentUsers(users.slice(-5).reverse());
  };

  const handleApprove = () => {
    if (!selectedTransaction) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const transactions = JSON.parse(localStorage.getItem('gorevyap_transactions') || '[]');
      const updated = transactions.map((t: Transaction) => 
        t.id === selectedTransaction.id 
          ? { ...t, status: 'approved', processedAt: new Date().toISOString() }
          : t
      );
      localStorage.setItem('gorevyap_transactions', JSON.stringify(updated));
      
      setIsProcessing(false);
      setIsDialogOpen(false);
      setSelectedTransaction(null);
      loadData();
    }, 1000);
  };

  const handleReject = () => {
    if (!selectedTransaction) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const transactions = JSON.parse(localStorage.getItem('gorevyap_transactions') || '[]');
      const users = JSON.parse(localStorage.getItem('gorevyap_users') || '[]');
      
      const updated = transactions.map((t: Transaction) => 
        t.id === selectedTransaction.id 
          ? { ...t, status: 'rejected', processedAt: new Date().toISOString() }
          : t
      );
      localStorage.setItem('gorevyap_transactions', JSON.stringify(updated));

      const user = users.find((u: User) => u.id === selectedTransaction.userId);
      if (user) {
        const updatedUsers = users.map((u: User) => 
          u.id === selectedTransaction.userId 
            ? { ...u, balance: u.balance + selectedTransaction.amount }
            : u
        );
        localStorage.setItem('gorevyap_users', JSON.stringify(updatedUsers));
      }
      
      setIsProcessing(false);
      setIsDialogOpen(false);
      setSelectedTransaction(null);
      loadData();
    }, 1000);
  };

  const statCards = [
    { 
      icon: Users, 
      label: 'Toplam Kullanıcı', 
      value: stats.totalUsers.toString(),
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      icon: CheckCircle, 
      label: 'Toplam Görev', 
      value: stats.totalTasks.toString(),
      color: 'bg-green-100 text-green-600'
    },
    { 
      icon: Wallet, 
      label: 'Bekleyen Çekim', 
      value: stats.pendingWithdrawals.toString(),
      color: 'bg-yellow-100 text-yellow-600'
    },
    { 
      icon: TrendingUp, 
      label: 'Toplam Ödeme', 
      value: `₺${stats.totalPaid.toFixed(2)}`,
      color: 'bg-violet-100 text-violet-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Platform istatistikleri ve yönetimi</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Bekleyen Çekim Talepleri</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('admin-transactions')}
              >
                Tümünü Gör
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {pendingTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Bekleyen çekim talebi yok.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setIsDialogOpen(true);
                      }}
                      className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl cursor-pointer hover:bg-yellow-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{transaction.userName}</p>
                        <p className="text-sm text-gray-600">{transaction.method}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-yellow-600">₺{transaction.amount.toFixed(2)}</span>
                        <Badge variant="outline" className="ml-2">Beklemede</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Son Kayıt Olanlar</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('admin-users')}
              >
                Tümünü Gör
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Henüz kullanıcı yok.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                          <span className="text-violet-600 font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Button 
            className="h-auto py-6 bg-violet-600 hover:bg-violet-700"
            onClick={() => navigate('admin-tasks')}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Görev Yönetimi
          </Button>
          <Button 
            className="h-auto py-6 bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('admin-users')}
          >
            <Users className="w-5 h-5 mr-2" />
            Kullanıcı Yönetimi
          </Button>
          <Button 
            className="h-auto py-6 bg-green-600 hover:bg-green-700"
            onClick={() => navigate('admin-settings')}
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Site Ayarları
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Çekim Talebi Detayı</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Kullanıcı</p>
                  <p className="font-medium">{selectedTransaction.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tutar</p>
                  <p className="font-medium text-lg text-violet-600">₺{selectedTransaction.amount.toFixed(2)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Yöntem</p>
                <p className="font-medium">{selectedTransaction.method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hesap Bilgileri</p>
                <p className="font-medium">{selectedTransaction.accountInfo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Talep Tarihi</p>
                <p className="font-medium">
                  {new Date(selectedTransaction.createdAt).toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleReject}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Reddet
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Onayla
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
