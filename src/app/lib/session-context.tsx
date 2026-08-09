import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  type Profile,
  loginUser,
  registerUser,
  restoreSession,
  persistSession,
  clearSession,
  saveAvatar,
} from './auth';
import { getProgress, recordProgress, type ProgressMap } from './progress';
import type { AvatarConfig } from '../components/avatar-creator';

interface SessionContextValue {
  status: 'loading' | 'ready';
  profile: Profile | null;
  progress: ProgressMap;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  updateAvatar: (avatarConfig: AvatarConfig) => Promise<void>;
  logout: () => void;
  finishGame: (gameId: number, result: { stars: number; score: number; completed: boolean }) => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    let cancelled = false;
    restoreSession()
      .then(async (restored) => {
        if (cancelled) return;
        if (restored) {
          setProfile(restored);
          setProgress(await getProgress(restored.id));
        }
      })
      .finally(() => {
        if (!cancelled) setStatus('ready');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const loggedIn = await loginUser(username, password);
    persistSession(loggedIn.id);
    setProfile(loggedIn);
    setProgress(await getProgress(loggedIn.id));
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const created = await registerUser(username, password);
    persistSession(created.id);
    setProfile(created);
    setProgress({});
  }, []);

  const updateAvatar = useCallback(
    async (avatarConfig: AvatarConfig) => {
      if (!profile) return;
      await saveAvatar(profile.id, avatarConfig);
      setProfile({ ...profile, avatarConfig });
    },
    [profile]
  );

  const logout = useCallback(() => {
    clearSession();
    setProfile(null);
    setProgress({});
  }, []);

  const finishGame = useCallback(
    async (gameId: number, result: { stars: number; score: number; completed: boolean }) => {
      if (!profile) return;
      await recordProgress(profile.id, gameId, result);
      setProgress((prev) => {
        const existing = prev[gameId];
        return {
          ...prev,
          [gameId]: {
            gameId,
            stars: Math.max(existing?.stars ?? 0, result.stars) as 0 | 1 | 2 | 3,
            bestScore: Math.max(existing?.bestScore ?? 0, result.score),
            completed: (existing?.completed ?? false) || result.completed,
          },
        };
      });
    },
    [profile]
  );

  return (
    <SessionContext.Provider
      value={{ status, profile, progress, login, register, updateAvatar, logout, finishGame }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession precisa estar dentro de um SessionProvider');
  return ctx;
}
