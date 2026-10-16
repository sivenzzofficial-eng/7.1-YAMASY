import React from 'react';
import {
  FileEdit,
  ShieldAlert,
  ArrowLeft,
  LogOut,
  Users,
  Activity,
  Radio,
  CheckCircle2,
  Clock,
  Terminal
} from 'lucide-react';
import type { ClassData, TrackedIP, SecurityLog } from '../types/index.ts';

interface AdminDashboardProps {
  classData: ClassData;
  adminIp: string;
  trackedIps: TrackedIP[];
  securityLogs: SecurityLog[];
  onOpenContentEditor: () => void;
  onOpenSecurityCenter: () => void;
  onBackToPublic: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  classData,
  adminIp,
  trackedIps,
  securityLogs,
  onOpenContentEditor,
  onOpenSecurityCenter,
  onBackToPublic,
  onLogout,
}) => {
  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const bannedCount = trackedIps.filter((i) => i.isBanned).length;
  const suspiciousCount = securityLogs.filter(
    (l) => l.severity === 'danger' || l.severity === 'warning'
  ).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono flex flex-col">
      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPublic}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 transition-colors cursor-pointer"
              title="Kembali ke Halaman Web Utama"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Web</span>
            </button>
            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
            <span className="text-xs text-zinc-400 hidden sm:inline-block">
              Panel Kontrol Administrator
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-[11px] text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>IP Anda:</span>
              <span className="font-bold text-zinc-200">{adminIp}</span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-8">
        {/* Disapa Section (Greeting as requested) */}
        <section className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sesi Terautentikasi</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
                Halo Admin Yamasy!
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Selamat datang di Dasbor Admin Kelas 7.1. Anda memiliki kendali penuh untuk mengelola
                seluruh konten web, memantau alamat IP pengunjung secara nyata, serta meninjau log aktivitas mencurigakan.
              </p>
            </div>

            <div className="flex sm:flex-col items-end gap-2 text-right text-xs text-zinc-400 shrink-0">
              <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Waktu Server: {currentTime}</span>
              </div>
              <span className="text-[11px] text-zinc-400">Kelas 7.1 · SMPN 1 Teladan</span>
            </div>
          </div>
        </section>

        {/* The 2 Big Square Buttons (2 tombol kotak) requested by user */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
              // Menu Utama Administrator
            </h2>
            <span className="text-[11px] text-zinc-400">Pilih salah satu modul di bawah ini</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tombol Kotak 1: Edit & Hapus Konten */}
            <button
              onClick={onOpenContentEditor}
              className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-xl border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-900 hover:border-zinc-600 transition-all text-left shadow-lg cursor-pointer min-h-[220px]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 group-hover:bg-zinc-700 group-hover:text-white transition-colors">
                    <FileEdit className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 font-mono">
                    MODUL 01
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-zinc-100 group-hover:text-white transition-colors mb-2">
                  Edit, Tambah & Hapus Konten
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                  Kelola seluruh teks dan informasi website kelas: Jadwal Pelajaran harian, Jadwal Piket Kebersihan,
                  Struktur Organisasi Kelas, Papan Pengumuman & PR, serta Daftar Siswa.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-zinc-300 group-hover:text-white">
                <span className="flex items-center gap-1.5">
                  <span>Buka Editor Konten</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
                <span className="text-[11px] text-zinc-400 font-normal">
                  {classData.announcements.length} pengumuman aktif
                </span>
              </div>
            </button>

            {/* Tombol Kotak 2: Ban IP & Cek IP + Log Aktivitas Real-time */}
            <button
              onClick={onOpenSecurityCenter}
              className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-xl border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-900 hover:border-zinc-600 transition-all text-left shadow-lg cursor-pointer min-h-[220px]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/60 text-red-400 group-hover:bg-red-900/40 transition-colors">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-red-400 px-2 py-0.5 rounded bg-red-950/60 border border-red-900/60 font-mono">
                    MODUL 02
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-zinc-100 group-hover:text-white transition-colors mb-2">
                  Cek IP, Ban IP & Log Real-time
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                  Sistem keamanan live: baca alamat IP nyata orang yang mengunjungi web, blokir IP yang tidak diinginkan,
                  serta pantau log aktivitas mencurigakan dan upaya pembobolan sandi secara real-time.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-red-400 group-hover:text-red-300">
                <span className="flex items-center gap-1.5">
                  <span>Buka Sistem IP Guardian & Log</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
                <span className="text-[11px] text-zinc-400 font-normal">
                  {trackedIps.length} IP terpantau · {bannedCount} terblokir
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* Quick Summary Strip */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30">
            <div className="text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span>Total Siswa</span>
            </div>
            <div className="text-xl font-bold text-zinc-100">{classData.students.length} Siswa</div>
          </div>

          <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30">
            <div className="text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-zinc-400" />
              <span>IP Terpantau</span>
            </div>
            <div className="text-xl font-bold text-zinc-100">{trackedIps.length} Alamat IP</div>
          </div>

          <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30">
            <div className="text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>IP Terblokir (Ban)</span>
            </div>
            <div className="text-xl font-bold text-red-400">{bannedCount} IP Terblokir</div>
          </div>

          <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30">
            <div className="text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Log Mencurigakan</span>
            </div>
            <div className="text-xl font-bold text-amber-400">{suspiciousCount} Insiden</div>
          </div>
        </section>

        {/* Live Recent Log Preview */}
        <section className="border border-zinc-800 bg-zinc-900/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-200 uppercase">
                Aktivitas Sistem Terkini (Preview)
              </span>
            </div>
            <button
              onClick={onOpenSecurityCenter}
              className="text-xs text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
            >
              Lihat Semua Log →
            </button>
          </div>

          <div className="space-y-1.5">
            {securityLogs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className="text-xs p-2.5 rounded bg-zinc-950/60 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      log.severity === 'danger'
                        ? 'bg-red-500'
                        : log.severity === 'warning'
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span className="font-mono text-zinc-400 text-[11px]">{log.timestamp}</span>
                  <span className="font-semibold text-zinc-200">[{log.ip}]</span>
                  <span className="text-zinc-300 truncate max-w-md">{log.details}</span>
                </div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono">
                  {log.type.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
