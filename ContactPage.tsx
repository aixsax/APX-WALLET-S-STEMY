import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Task, Transaction, SiteSettings } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, username?: string) => Promise<boolean>;
  logout: () => void;
  updateBalance: (amount: number) => void;
  updateUser: (userData: Partial<User>) => void;
  generateAxId: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate AX-ID: AX + 24 digits (Turkey IBAN length is 26 chars)
const generateAxId = () => {
  const prefix = 'AX';
  const digits = Array.from({ length: 24 }, () => Math.floor(Math.random() * 10)).join('');
  return prefix + digits;
};

const DEMO_USERS: User[] = [
  { 
    id: 1, 
    name: 'Ahmet Yılmaz', 
    email: 'ahmet@email.com', 
    password: '123456', 
    role: 'user', 
    balance: 1245.50,
    phone: '0555 123 4567',
    username: 'ahmetyilmaz',
    axId: 'AX123456789012345678901234',
    createdAt: '2024-01-15T10:00:00Z'
  },
  { 
    id: 2, 
    name: 'Admin', 
    email: 'admin@gorevyap.com', 
    password: 'admin123', 
    role: 'admin', 
    balance: 0,
    username: 'admin',
    axId: 'AX999999999999999999999999',
    createdAt: '2024-01-01T00:00:00Z'
  },
];

const DEMO_TASKS: Task[] = [
  {
    id: 1,
    title: 'Instagram Gönderisi Beğen',
    description: 'Belirtilen Instagram gönderisini beğen ve ekran görüntüsü gönder.',
    category: 'Sosyal Medya',
    reward: 5,
    difficulty: 'easy',
    status: 'active',
    taskType: 'standard',
    requiresProof: true,
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 2,
    title: 'YouTube Video İzle',
    description: '5 dakikalık YouTube videosunu tamamen izle ve kanala abone ol.',
    category: 'Video İzleme',
    reward: 10,
    difficulty: 'easy',
    status: 'active',
    taskType: 'video',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoDuration: 300,
    requiresProof: false,
    createdAt: '2024-01-20T11:00:00Z'
  },
  {
    id: 3,
    title: 'Anket Doldur',
    description: '5 dakikalık anket formunu doldur.',
    category: 'Anket',
    reward: 15,
    difficulty: 'medium',
    status: 'active',
    taskType: 'link',
    taskLink: 'https://forms.google.com/sample',
    requiresProof: true,
    createdAt: '2024-01-20T12:00:00Z'
  },
  {
    id: 4,
    title: 'Uygulama İndir',
    description: 'Mobil uygulamayı indir ve 10 dakika kullan.',
    category: 'Uygulama',
    reward: 25,
    difficulty: 'medium',
    status: 'active',
    taskType: 'link',
    taskLink: 'https://play.google.com/store/apps',
    requiresProof: true,
    createdAt: '2024-01-20T13:00:00Z'
  },
  {
    id: 5,
    title: 'Web Sitesi Kayıt',
    description: 'Belirtilen web sitesine kayıt ol ve profili tamamla.',
    category: 'Kayıt',
    reward: 20,
    difficulty: 'medium',
    status: 'active',
    taskType: 'link',
    taskLink: 'https://example.com/register',
    requiresProof: true,
    createdAt: '2024-01-20T14:00:00Z'
  },
  {
    id: 6,
    title: 'Link Tıklama - Kampanya',
    description: 'Reklam linkine tıkla ve 5 saniye bekle. Bakiye otomatik eklenecek.',
    category: 'Link Tıklama',
    reward: 2,
    difficulty: 'easy',
    status: 'active',
    taskType: 'link',
    taskLink: 'https://example.com/campaign',
    requiresProof: false,
    createdAt: '2024-01-20T15:00:00Z'
  },
];

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    userId: 1,
    userName: 'Ahmet Yılmaz',
    type: 'withdraw',
    amount: 100,
    status: 'pending',
    method: 'Banka Transferi',
    accountInfo: 'TR12 3456 7890 1234 5678 9012 34',
    createdAt: '2024-01-21T10:00:00Z'
  },
];

const DEFAULT_SETTINGS: SiteSettings = {
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
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('gorevyap_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }

    // Initialize demo data
    if (!localStorage.getItem('gorevyap_users')) {
      localStorage.setItem('gorevyap_users', JSON.stringify(DEMO_USERS));
    }
    if (!localStorage.getItem('gorevyap_tasks')) {
      localStorage.setItem('gorevyap_tasks', JSON.stringify(DEMO_TASKS));
    }
    if (!localStorage.getItem('gorevyap_transactions')) {
      localStorage.setItem('gorevyap_transactions', JSON.stringify(DEMO_TRANSACTIONS));
    }
    if (!localStorage.getItem('gorevyap_settings')) {
      localStorage.setItem('gorevyap_settings', JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem('gorevyap_proofs')) {
      localStorage.setItem('gorevyap_proofs', JSON.stringify([]));
    }
    if (!localStorage.getItem('gorevyap_transfers')) {
      localStorage.setItem('gorevyap_transfers', JSON.stringify([]));
    }
    if (!localStorage.getItem('gorevyap_interests')) {
      localStorage.setItem('gorevyap_interests', JSON.stringify([]));
    }
    if (!localStorage.getItem('gorevyap_crypto_wallets')) {
      localStorage.setItem('gorevyap_crypto_wallets', JSON.stringify([]));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('gorevyap_users') || '[]');
    const foundUser = users.find((u: User) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword as User);
      setIsAuthenticated(true);
      localStorage.setItem('gorevyap_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string, username?: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('gorevyap_users') || '[]');
    
    if (users.find((u: User) => u.email === email)) {
      return false;
    }
    
    if (username && users.find((u: User) => u.username === username)) {
      return false;
    }

    const newUser: User = {
      id: Date.now(),
      name,
      email,
      password,
      role: 'user',
      balance: 0,
      username: username || `user${Date.now()}`,
      axId: generateAxId(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('gorevyap_users', JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword as User);
    setIsAuthenticated(true);
    localStorage.setItem('gorevyap_user', JSON.stringify(userWithoutPassword));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('gorevyap_user');
  };

  const updateBalance = (amount: number) => {
    if (user) {
      const updatedUser = { ...user, balance: user.balance + amount };
      setUser(updatedUser);
      localStorage.setItem('gorevyap_user', JSON.stringify(updatedUser));

      const users = JSON.parse(localStorage.getItem('gorevyap_users') || '[]');
      const updatedUsers = users.map((u: User) => 
        u.id === user.id ? { ...u, balance: u.balance + amount } : u
      );
      localStorage.setItem('gorevyap_users', JSON.stringify(updatedUsers));
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('gorevyap_user', JSON.stringify(updatedUser));

      const users = JSON.parse(localStorage.getItem('gorevyap_users') || '[]');
      const updatedUsers = users.map((u: User) => 
        u.id === user.id ? { ...u, ...userData } : u
      );
      localStorage.setItem('gorevyap_users', JSON.stringify(updatedUsers));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateBalance,
      updateUser,
      generateAxId,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
