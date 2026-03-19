import { 
  LayoutDashboard, 
  ListTodo, 
  Users, 
  Wallet, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';

const menuItems = [
  { path: 'admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { path: 'admin-tasks', icon: <ListTodo className="w-5 h-5" />, label: 'Görev Yönetimi' },
  { path: 'admin-users', icon: <Users className="w-5 h-5" />, label: 'Kullanıcılar' },
  { path: 'admin-transactions', icon: <Wallet className="w-5 h-5" />, label: 'Bakiye İşlemleri' },
  { path: 'admin-settings', icon: <Settings className="w-5 h-5" />, label: 'Site Ayarları' },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  navigate: (page: string) => void;
  currentPage: string;
}

export function AdminSidebar({ isCollapsed, setIsCollapsed, navigate, currentPage }: AdminSidebarProps) {
  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-slate-900 border-r border-white/5 z-50 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        <button onClick={() => navigate('admin')} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                Admin
              </span>
              <p className="text-xs text-slate-500">Panel</p>
            </div>
          )}
        </button>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentPage === item.path
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            {item.icon}
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
        <button
          onClick={() => navigate('landing')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Çıkış Yap</span>}
        </button>
      </div>
    </aside>
  );
}
