import React from 'react';
import { ShieldX, AlertOctagon, RefreshCw } from 'lucide-react';

interface BannedScreenProps {
  ip: string;
  reason?: string;
  bannedAt?: string;
  onRefresh: () => void;
}

export const BannedScreen: React.FC<BannedScreenProps> = ({
  ip,
  reason = 'Alamat IP Anda telah diblokir oleh Admin Kelas 7.1.',
  bannedAt,
  onRefresh,
}) => {
  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 font-mono selection:bg-red-900 selection:text-white">
      <div className="max-w-lg w-full border border-red-900/60 bg-zinc-900/90 rounded-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top warning line */}
        <div className="flex items-center gap-2 text-red-400 mb-6 pb-4 border-b border-red-900/40">
          <ShieldX className="w-6 h-6 shrink-0" />
          <div className="text-base font-bold tracking-tight uppercase">
            Akses Ditolak // IP Terblokir
          </div>
        </div>

        <div className="space-y-4 text-xs text-zinc-300">
          <p className="leading-relaxed">
            Perangkat Anda tidak dapat mengakses portal Kelas 7.1. Alamat IP Anda telah dimasukkan ke
            dalam daftar blokir keamanan oleh sistem atau Administrator Kelas.
          </p>

          <div className="bg-black/50 border border-zinc-800 rounded p-4 space-y-2">
            <div className="flex justify-between items-center text-zinc-400">
              <span>Alamat IP:</span>
              <span className="font-bold text-red-400 font-mono">{ip}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span>Alasan Blokir:</span>
              <span className="text-zinc-200 text-right max-w-[240px] truncate">{reason}</span>
            </div>
            {bannedAt && (
              <div className="flex justify-between items-center text-zinc-400">
                <span>Waktu Tindakan:</span>
                <span className="text-zinc-300">{bannedAt}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-zinc-400">
              <span>Status Keamanan:</span>
              <span className="text-red-400 font-bold uppercase">Restricted (403)</span>
            </div>
          </div>

          <div className="p-3 bg-red-950/20 border border-red-900/30 rounded text-[11px] text-zinc-400 flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>
              Jika Anda merasa pemblokiran ini merupakan kekeliruan, silakan hubungi Ketua Kelas
              (Yamasy) atau Wali Kelas secara langsung di sekolah.
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Periksa Ulang Status IP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
