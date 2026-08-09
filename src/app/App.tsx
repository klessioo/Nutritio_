import { useState } from 'react';
import { AboutSection } from './components/about-section';
import { GamesDashboard } from './components/games-dashboard';
import { LoginModal } from './components/login-modal';
import { AvatarDisplay } from './components/avatar-creator';
import { SessionProvider, useSession } from './lib/session-context';
import { DEFAULT_AVATAR } from './lib/pixel-avatar';
import { Apple, Gamepad2, LogOut } from 'lucide-react';

function AppShell() {
  const { status, profile, logout } = useSession();
  const [activeTab, setActiveTab] = useState<'about' | 'games'>('about');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isLoggedIn = !!profile;

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setActiveTab('games');
  };

  const handleLogout = () => {
    logout();
    setActiveTab('about');
  };

  const handleGamesTabClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      setActiveTab('games');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🍎</div>
          <p className="text-gray-600 font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <Apple className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-2xl text-green-700">Nutritio</h1>
                <p className="text-xs text-gray-600">Educação Alimentar</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('about')}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  activeTab === 'about'
                    ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sobre o Projeto
              </button>
              <button
                onClick={handleGamesTabClick}
                className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'games'
                    ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Gamepad2 className="w-5 h-5" />
                Jogos
              </button>
            </nav>

            {/* User Info */}
            {isLoggedIn && profile && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-purple-300">
                  <AvatarDisplay config={profile.avatarConfig ?? DEFAULT_AVATAR} size={48} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">Olá, {profile.username}!</p>
                  <p className="text-xs text-gray-500">Caxias-MA</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-all"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'about' || !profile ? <AboutSection /> : <GamesDashboard />}
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} onLoginSuccess={handleLoginSuccess} />
      )}

      {/* Footer */}
      <footer className="bg-white mt-16 py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-sm">
            Projeto de Educação Alimentar e Nutricional - Caxias-MA, 2026
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <AppShell />
    </SessionProvider>
  );
}
