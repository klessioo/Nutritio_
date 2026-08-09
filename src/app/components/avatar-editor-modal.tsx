import { useState } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AvatarCreator, AvatarConfig } from './avatar-creator';
import { DEFAULT_AVATAR } from '../lib/pixel-avatar';
import { useSession } from '../lib/session-context';

interface AvatarEditorModalProps {
  onClose: () => void;
}

const FALLBACK_AVATAR: AvatarConfig = DEFAULT_AVATAR;

export function AvatarEditorModal({ onClose }: AvatarEditorModalProps) {
  const { profile, updateAvatar } = useSession();
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(profile?.avatarConfig ?? FALLBACK_AVATAR);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedPulse, setSavedPulse] = useState(false);

  const handleSave = async () => {
    setError('');
    setIsSaving(true);
    try {
      await updateAvatar(avatarConfig);
      setSavedPulse(true);
      setTimeout(() => setSavedPulse(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar seu avatar.');
    } finally {
      setIsSaving(false);
    }
  };

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
            <h2 className="text-2xl font-bold text-white">Editar Avatar 🎨</h2>
            <p className="text-purple-100 text-sm mt-1">Mude sua aparência quando quiser</p>
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
        <div className="bg-gray-50 px-8 py-6 flex items-center gap-3 border-t border-gray-200">
          <AnimatePresence>
            {savedPulse && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-green-700 font-semibold text-sm"
              >
                <Check className="w-5 h-5" />
                Avatar salvo!
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex-1" />
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-2xl transition-all disabled:opacity-60"
          >
            Fechar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-2xl hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Avatar ✨'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
