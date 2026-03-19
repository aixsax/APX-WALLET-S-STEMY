import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Wallet, LogOut, LayoutDashboard, ListTodo, TrendingUp, User, Percent, Layout } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  navigate: (page: string) => void;
}

export default function Navbar({ navigate }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('');
  };

  const userMenuItems = [
    { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
    { id: 'tasks', label: 'Görevler', icon: ListTodo },
    { id: 'wallet', label: 'Cüzdan', icon: Wallet },
    { id: 'interest', label: 'Faiz', icon: TrendingUp },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  const adminMenuItems = [
    { id: 'admin', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-tasks', label: 'Görevler', icon: ListTodo },
    { id: 'admin-users', label: 'Kullanıcılar', icon: User },
    { id: 'admin-transactions', label: 'İşlemler', icon: Wallet },
    { id: 'admin-settings', label: 'Ayarlar', icon: Percent },
    { id: 'admin-cms', label: 'Site İçeriği', icon: Layout },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={() => navigate(isAuthenticated ? (isAdmin ? 'admin' : 'dashboard') : '')}
            className="flex items-center gap-2"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isScrolled ? 'bg-gradient-to-br from-violet-500 to-indigo-600' : 'bg-white'
            }`}>
              <span className={`text-lg font-bold ${isScrolled ? 'text-white' : 'text-violet-600'}`}>G</span>
            </div>
            <span className={`text-xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>GörevYap</span>
          </button>

          <div className="hidden md:flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <button 
                  onClick={() => navigate('login')}
                  className={`font-medium px-4 py-2 ${isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}
                >
                  Giriş Yap
                </button>
                <Button 
                  onClick={() => navigate('register')}
                  className={isScrolled ? 'bg-violet-600 hover:bg-violet-700' : 'bg-white text-violet-600 hover:bg-gray-100'}
                >
                  Kayıt Ol
                </Button>
              </>
            ) : (
              <>
                {isAdmin ? (
                  <>
                    {adminMenuItems.map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(item.id)}
                        className={isScrolled ? 'text-gray-600' : 'text-white'}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    ))}
                  </>
                ) : (
                  <>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                      isScrolled ? 'bg-violet-50' : 'bg-white/10'
                    }`}>
                      <Wallet className={`w-4 h-4 ${isScrolled ? 'text-violet-600' : 'text-white'}`} />
                      <span className={`font-medium ${isScrolled ? 'text-violet-600' : 'text-white'}`}>
                        ₺{user?.balance.toFixed(2)}
                      </span>
                    </div>
                    {userMenuItems.slice(0, 3).map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(item.id)}
                        className={isScrolled ? 'text-gray-600' : 'text-white'}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    ))}
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className={isScrolled ? 'text-gray-600' : 'text-white'}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış
                </Button>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
          >
            {isMobileMenuOpen ? (
              <X className={isScrolled ? 'text-gray-900' : 'text-white'} />
            ) : (
              <Menu className={isScrolled ? 'text-gray-900' : 'text-white'} />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white rounded-xl shadow-lg mt-2 p-4">
            {!isAuthenticated ? (
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => { navigate('login'); setIsMobileMenuOpen(false); }}
                >
                  Giriş Yap
                </Button>
                <Button 
                  className="w-full bg-violet-600"
                  onClick={() => { navigate('register'); setIsMobileMenuOpen(false); }}
                >
                  Kayıt Ol
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {!isAdmin && (
                  <div className="flex items-center justify-between px-3 py-2 bg-violet-50 rounded-lg">
                    <span className="text-gray-600">Bakiye</span>
                    <span className="font-bold text-violet-600">₺{user?.balance.toFixed(2)}</span>
                  </div>
                )}
                {isAdmin && user?.axId && (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500">AX-ID</span>
                    <p className="text-sm font-mono">{user.axId}</p>
                  </div>
                )}
                {menuItems.map((item) => (
                  <Button 
                    key={item.id}
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => { navigate(item.id); setIsMobileMenuOpen(false); }}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full text-red-600"
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış Yap
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
