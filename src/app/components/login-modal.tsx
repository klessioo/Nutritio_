import { useState } from 'react';
import { X, User, Lock, Apple, UserPlus, Loader2 } from 'lucide-react';
import { AvatarCreator, AvatarConfig } from './avatar-creator';
import { DEFAULT_AVATAR } from '../lib/pixel-avatar';
import { useSession } from '../lib/session-context';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function LoginModal({ onClose, onLoginSuccess }: LoginModalProps) {
  const { login, register, updateAvatar } = useSession();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupStep, setSignupStep] = useState<'info' | 'avatar'>('info');
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (username.trim().length < 3) {
      setError('Nome de usuário deve ter pelo menos 3 caracteres');
      return;
    }

    if (password.length < 4) {
      setError('Senha deve ter pelo menos 4 caracteres');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(username.trim(), password);
      setSignupStep('avatar');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar sua conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupComplete = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await updateAvatar(avatarConfig);
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar seu avatar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar modo de cadastro - etapa de informações
  if (mode === 'signup' && signupStep === 'info') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-3">
                <UserPlus className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-white">Criar Conta</h2>
              <p className="text-purple-100 text-sm mt-1">Junte-se ao Nutritio!</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignupInfo} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Username Field */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Nome de Usuário
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:outline-none transition-all disabled:opacity-60"
                  placeholder="Escolha seu nome"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:outline-none transition-all disabled:opacity-60"
                  placeholder="Crie uma senha"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Mínimo de 4 caracteres</p>
            </div>

            {/* Next Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-2xl hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Próximo: Criar Avatar 🎨'
              )}
            </button>

            {/* Switch to Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
              >
                Já tem uma conta? Faça login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Renderizar modo de cadastro - etapa de avatar
  if (mode === 'signup' && signupStep === 'avatar') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold text-white">Crie Seu Avatar! 🎨</h2>
              <p className="text-purple-100 text-sm mt-1">Personalize seu avatar em pixel art</p>
            </div>
          </div>

          {/* Avatar Creator */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-red-700 text-sm mb-6">
                {error}
              </div>
            )}
            <AvatarCreator config={avatarConfig} onChange={setAvatarConfig} size={180} />
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 flex gap-3 border-t border-gray-200">
            <button
              onClick={() => setSignupStep('info')}
              disabled={isSubmitting}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-2xl transition-all disabled:opacity-60"
            >
              ← Voltar
            </button>
            <button
              onClick={handleSignupComplete}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-2xl hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Finalizar Cadastro! 🎉'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar modo de login (padrão)
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-400 to-green-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-3">
              <Apple className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-white">Entrar no Nutritio</h2>
            <p className="text-green-100 text-sm mt-1">Faça login para jogar!</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Username Field */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Nome de Usuário
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all disabled:opacity-60"
                placeholder="Digite seu nome"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Senha
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all disabled:opacity-60"
                placeholder="Digite sua senha"
              />
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
            <p className="text-sm text-blue-700">
              <strong>📝 Para professores:</strong> Use suas credenciais fornecidas pela equipe do projeto.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold py-4 rounded-2xl hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar e Jogar! 🎮'
            )}
          </button>

          {/* Switch to Signup */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setSignupStep('info');
                setError('');
              }}
              className="text-green-600 hover:text-green-700 font-semibold text-sm"
            >
              Não tem uma conta? Cadastre-se
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Projeto de pesquisa - Dados protegidos conforme LGPD
          </p>
        </div>
      </div>
    </div>
  );
}
