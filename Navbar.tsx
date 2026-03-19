import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CMSProvider } from '@/context/CMSContext';
import Navbar from '@/components/Navbar';
import Hero from '@/sections/Hero';
import HowItWorks from '@/sections/HowItWorks';
import TaskCategories from '@/sections/TaskCategories';
import Features from '@/sections/Features';
import Testimonials from '@/sections/Testimonials';
import CTA from '@/sections/CTA';
import FAQSection from '@/sections/FAQSection';
import ContactSection from '@/sections/ContactSection';
import Footer from '@/sections/Footer';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/user/Dashboard';
import Tasks from '@/pages/user/Tasks';
import Wallet from '@/pages/user/Wallet';
import Profile from '@/pages/user/Profile';
import Interest from '@/pages/user/Interest';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsPage from '@/pages/TermsPage';
import ContactPage from '@/pages/ContactPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminTasks from '@/pages/admin/AdminTasks';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminTransactions from '@/pages/admin/AdminTransactions';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminCMS from '@/pages/admin/AdminCMS';

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Login navigate={(page) => window.location.hash = `/${page}`} />;
  }
  
  if (requireAdmin && !isAdmin) {
    return <Dashboard navigate={(page) => window.location.hash = `/${page}`} />;
  }
  
  return <>{children}</>;
}

function LandingPage({ navigate }: { navigate: (page: string) => void }) {
  return (
    <>
      <Navbar navigate={navigate} />
      <Hero navigate={navigate} />
      <HowItWorks />
      <TaskCategories navigate={navigate} />
      <Features />
      <Testimonials />
      <FAQSection />
      <ContactSection />
      <CTA navigate={navigate} />
      <Footer navigate={navigate} />
    </>
  );
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState('');
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '') || '';
      setCurrentPage(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page: string) => {
    window.location.hash = page ? `/${page}` : '';
  };

  const renderPage = () => {
    switch (currentPage) {
      case '':
        return <LandingPage navigate={navigate} />;
      case 'login':
        return isAuthenticated 
          ? (isAdmin ? <AdminDashboard navigate={navigate} /> : <Dashboard navigate={navigate} />)
          : <Login navigate={navigate} />;
      case 'register':
        return isAuthenticated 
          ? (isAdmin ? <AdminDashboard navigate={navigate} /> : <Dashboard navigate={navigate} />)
          : <Register navigate={navigate} />;
      case 'dashboard':
        return (
          <ProtectedRoute>
            <Navbar navigate={navigate} />
            <Dashboard navigate={navigate} />
          </ProtectedRoute>
        );
      case 'tasks':
        return (
          <ProtectedRoute>
            <Navbar navigate={navigate} />
            <Tasks navigate={navigate} />
          </ProtectedRoute>
        );
      case 'wallet':
        return (
          <ProtectedRoute>
            <Navbar navigate={navigate} />
            <Wallet navigate={navigate} />
          </ProtectedRoute>
        );
      case 'profile':
        return (
          <ProtectedRoute>
            <Navbar navigate={navigate} />
            <Profile navigate={navigate} />
          </ProtectedRoute>
        );
      case 'interest':
        return (
          <ProtectedRoute>
            <Navbar navigate={navigate} />
            <Interest navigate={navigate} />
          </ProtectedRoute>
        );
      case 'admin':
        return (
          <ProtectedRoute requireAdmin>
            <Navbar navigate={navigate} />
            <AdminDashboard navigate={navigate} />
          </ProtectedRoute>
        );
      case 'admin-tasks':
        return (
          <ProtectedRoute requireAdmin>
            <Navbar navigate={navigate} />
            <AdminTasks />
          </ProtectedRoute>
        );
      case 'admin-users':
        return (
          <ProtectedRoute requireAdmin>
            <Navbar navigate={navigate} />
            <AdminUsers />
          </ProtectedRoute>
        );
      case 'admin-transactions':
        return (
          <ProtectedRoute requireAdmin>
            <Navbar navigate={navigate} />
            <AdminTransactions />
          </ProtectedRoute>
        );
      case 'admin-settings':
        return (
          <ProtectedRoute requireAdmin>
            <Navbar navigate={navigate} />
            <AdminSettings />
          </ProtectedRoute>
        );
      case 'admin-cms':
        return (
          <ProtectedRoute requireAdmin>
            <Navbar navigate={navigate} />
            <AdminCMS />
          </ProtectedRoute>
        );
      case 'privacy-policy':
        return (
          <>
            <Navbar navigate={navigate} />
            <PrivacyPolicyPage />
            <Footer navigate={navigate} />
          </>
        );
      case 'terms':
        return (
          <>
            <Navbar navigate={navigate} />
            <TermsPage />
            <Footer navigate={navigate} />
          </>
        );
      case 'contact':
        return (
          <>
            <Navbar navigate={navigate} />
            <ContactPage />
            <Footer navigate={navigate} />
          </>
        );
      default:
        return <LandingPage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CMSProvider>
        <AppContent />
      </CMSProvider>
    </AuthProvider>
  );
}

export default App;
