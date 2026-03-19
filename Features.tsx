import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Wallet,
  Calendar,
  Loader2,
  CheckCircle
} from 'lucide-react';
import type { User } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('gorevyap_users') || '[]');
    setUsers(allUsers);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (user: User) => {
    setSelectedUser(user);
    setBalanceAmount('');
    setSuccess('');
    setIsDialogOpen(true);
  };

  const handleUpdateBalance = () => {
    if (!selectedUser || !balanceAmount) return;

    setIsSaving(true);

    setTimeout(() => {
      const amount = parseFloat(balanceAmount);
      const allUsers = JSON.parse(localStorage.getItem('gorevyap_users') || '[]');
      
      const updated = allUsers.map((u: User) => 
        u.id === selectedUser.id 
          ? { ...u, balance: u.balance + amount }
          : u
      );
      
      localStorage.setItem('gorevyap_users', JSON.stringify(updated));
      
      setIsSaving(false);
      setSuccess(`Bakiye başarıyla güncellendi. Yeni bakiye: ₺${(selectedUser.balance + amount).toFixed(2)}`);
      loadUsers();
    }, 1000);
  };

  const handleToggleRole = (user: User) => {
    const allUsers = JSON.parse(localStorage.getItem('gorevyap_users') || '[]');
    const updated = allUsers.map((u: User) => 
      u.id === user.id 
        ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' }
        : u
    );
    localStorage.setItem('gorevyap_users', JSON.stringify(updated));
    loadUsers();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
          <p className="text-gray-600">Kullanıcıları görüntüle ve yönet</p>
        </div>

        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Kullanıcı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Kullanıcı</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Rol</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Bakiye</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Kayıt Tarihi</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                            <span className="text-violet-600 font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          className={user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}
                        >
                          {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-green-600">₺{user.balance.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleRole(user)}
                          >
                            {user.role === 'admin' ? 'Kullanıcı Yap' : 'Admin Yap'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(user)}
                          >
                            <Wallet className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Kullanıcı bulunamadı.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kullanıcı Bakiyesi</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                  <span className="text-violet-600 font-bold text-lg">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedUser.name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="p-4 bg-violet-50 rounded-lg">
                <p className="text-sm text-gray-600">Mevcut Bakiye</p>
                <p className="text-2xl font-bold text-violet-600">₺{selectedUser.balance.toFixed(2)}</p>
              </div>

              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Bakiye Ekle/Çıkar</label>
                <Input
                  type="number"
                  placeholder="Tutar girin (negatif için -)"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Pozitif değer ekler, negatif değer çıkarır
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Kapat
                </Button>
                <Button
                  className="flex-1 bg-violet-600"
                  onClick={handleUpdateBalance}
                  disabled={isSaving || !balanceAmount}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Güncelle'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
