import React, { useState } from 'react';
import { ShieldAlert, Lock, X, AlertTriangle, ArrowRight } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
  clientIp?: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientIp = '127.0.0.1'
}) => {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = password.trim();
    if (!cleanInput) {
      setErrorMsg('Masukkan kata sandi administrator.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    // Instant & reliable validation (supports both yamasy-7.1 and Yamasy-7.1 from mobile keyboards)
    const isCorrect = cleanInput.toLowerCase() === 'yamasy-7.1';

    if (isCorrect) {
      const token = `adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Notify backend if running in fullstack mode (fire and forget)
      fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: cleanInput })
      }).catch(() => {});

      setPassword('');
      setErrorMsg('');
      setIsLoading(false);
      onSuccess(token);
      return;
    }

    // If incorrect
    const nextAttempts = attemptCount + 1;
    setAttemptCount(nextAttempts);
    setErrorMsg('Sandi salah! Peringatan: Hanya admin kelas 7.1 yang memiliki hak akses.');
    setPassword('');
    setIsLoading(false);

    // Notify backend of suspicious failed attempt
    fetch('/api/report-suspicious', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity: 'Percobaan login admin gagal dengan sandi salah' })
    }).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl font-mono">
        {/* Header with Close */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-100">
            <Lock className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold tracking-tight">AUTENTIKASI MODE ADMIN</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Banner requested by user */}
        <div className="my-4 p-3 rounded border border-red-900/50 bg-red-950/20 text-red-300 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="block text-red-200 uppercase font-semibold text-[11px] mb-0.5">
              Peringatan Keamanan
            </strong>
            Hanya admin kelas yang memiliki akses. Jika masuk tanpa izin akan terkena blokir otomatis.
          </div>
        </div>

        {/* IP Tracking Notice */}
        <div className="mb-4 text-[11px] text-zinc-400 flex items-center justify-between px-2 py-1.5 rounded bg-zinc-900 border border-zinc-800">
          <span>IP Perangkat Terdeteksi:</span>
          <span className="font-bold text-zinc-200">{clientIp}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              Kata Sandi Admin:
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full px-3 py-2 text-sm bg-zinc-900 text-zinc-100 border border-zinc-800 rounded focus:outline-none focus:border-zinc-500 font-mono transition-colors"
              autoFocus
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded bg-amber-950/30 border border-amber-900/50 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {attemptCount > 0 && (
            <div className="text-[10px] text-zinc-400 text-right">
              Percobaan gagal dicatat: <span className="text-red-400">{attemptCount}/5</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded border border-transparent hover:border-zinc-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-xs font-bold text-zinc-950 bg-zinc-100 hover:bg-white rounded transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Memeriksa...' : 'Verifikasi Akses'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
