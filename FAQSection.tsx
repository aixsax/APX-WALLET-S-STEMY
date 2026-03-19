import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import type { Transaction } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(transactions.filter(t => t.status === filter));
    }
  }, [filter, transactions]);

  const loadTransactions = () => {
    const allTransactions = JSON.parse(localStorage.getItem('gorevyap_transactions') || '[]');
    setTransactions(allTransactions);
    setFilteredTransactions(allTransactions);
  };

  const handleApprove = () => {
    if (!selectedTransaction) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const allTransactions = JSON.parse(localStorage.getItem('gorevyap_transactions') || '[]');
      const updated = allTransactions.map((t: Transaction) => 
        t.id === selectedTransaction.id 
          ? { ...t, status: 'approved', processedAt: new Date().toISOString() }
          : t
      );
      localStorage.setItem('gorevyap_transactions', JSON.stringify(updated));
      
      setIsProcessing(false);
      setIsDialogOpen(false);
      setSelectedTransaction(null);
      loadTransactions();
    }, 1000);
  };

  const handleReject = () => {
    if (!selectedTransaction) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const allTransactions = JSON.parse(localStorage.getItem('gorevyap_transactions') || '[]');
      const users = JSON.parse(localStorage.getItem('gorevyap_users') || '[]');
      
      const updated = allTransactions.map((t: Transaction) => 
        t.id === selectedTransaction.id 
          ? { ...t, status: 'rejected', processedAt: new Date().toISOString() }
          : t
      );
      localStorage.setItem('gorevyap_transactions', JSON.stringify(updated));

      const user = users.find((u: any) => u.id === selectedTransaction.userId);
      if (user) {
        const updatedUsers = users.map((u: any) => 
          u.id === selectedTransaction.userId 
            ? { ...u, balance: u.balance + selectedTransaction.amount }
            : u
        );
        localStorage.setItem('gorevyap_users', JSON.stringify(updatedUsers));
      }
      
      setIsProcessing(false);
      setIsDialogOpen(false);
      setSelectedTransaction(null);
      loadTransactions();
    }, 1000);
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

  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    approved: transactions.filter(t => t.status === 'approved').length,
    rejected: transactions.filter(t => t.status === 'rejected').length,
    totalAmount: transactions.filter(t => t.status === 'approved').reduce((sum, t) => sum + t.amount, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Para Çekim Talepleri</h1>
          <p className="text-gray-600">Kullanıcı para çekim taleplerini yönet</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Toplam</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Bekleyen</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Onaylanan</p>
              <p className="text-xl font-bold text-green-600">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Reddedilen</p>
              <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Toplam Ödeme</p>
              <p className="text-xl font-bold text-violet-600">₺{stats.totalAmount.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? 'bg-violet-600' : ''}
            >
              {f === 'all' && 'Tümü'}
              {f === 'pending' && 'Bekleyen'}
              {f === 'approved' && 'Onaylanan'}
              {f === 'rejected' && 'Reddedilen'}
            </Button>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Kullanıcı</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Yöntem</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Tutar</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Durum</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Tarih</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{transaction.userName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600">{transaction.method}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-violet-600">₺{transaction.amount.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {transaction.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setIsDialogOpen(true);
                            }}
                          >
                            İncele
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>İşlem bulunamadı.</p>
              </div>
            )}
          </CardContent>
        </Card>
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
