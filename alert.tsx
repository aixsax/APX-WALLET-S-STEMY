import { Bell, Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
  navigate: (page: string) => void;
}

const notifications = [
  { id: 1, text: 'Yeni görev onaylandı: +₺25', time: '2 dk önce', type: 'success' },
  { id: 2, text: 'Para çekme talebiniz onaylandı', time: '1 saat önce', type: 'info' },
  { id: 3, text: 'Yeni görevler eklendi!', time: '3 saat önce', type: 'new' },
];

export function Header({ onMenuClick, sidebarCollapsed, navigate }: HeaderProps) {
  return (
    <header 
      className={`fixed top-0 right-0 h-16 bg-slate-900/95 backdrop-blur-lg border-b border-white/5 z-40 transition-all duration-300 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="h-full flex items-center justify-between px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Görev ara..."
              className="w-64 pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Balance */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
            <span className="text-sm text-slate-400">Bakiye:</span>
            <span className="text-lg font-bold text-green-400">₺1,245.50</span>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-slate-900 border-white/10">
              <DropdownMenuLabel className="text-white">Bildirimler</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              {notifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className="flex flex-col items-start py-3 px-4 cursor-pointer hover:bg-white/5"
                >
                  <span className="text-sm text-slate-200">{notif.text}</span>
                  <span className="text-xs text-slate-500 mt-1">{notif.time}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="justify-center text-green-400 cursor-pointer">
                Tümünü Gör
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:bg-white/5 rounded-xl p-2 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                  AY
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">Ahmet Yılmaz</p>
                  <p className="text-xs text-slate-400">Premium Üye</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-white/10">
              <DropdownMenuLabel className="text-white">Hesabım</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                onClick={() => navigate('profile')}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                Profilim
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('wallet')}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                Bakiyem
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                onClick={() => navigate('landing')}
                className="text-red-400 hover:text-red-300 cursor-pointer"
              >
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
