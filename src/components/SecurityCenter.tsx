import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Radio,
  Search,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Copy,
  Terminal,
  Activity,
  Globe,
  SlidersHorizontal
} from 'lucide-react';
import type { TrackedIP, SecurityLog } from '../types/index.ts';
import { filterSecurityLogs } from '../utils/security.ts';

interface SecurityCenterProps {
  adminToken: string;
  adminIp: string;
  trackedIps: TrackedIP[];
  securityLogs: SecurityLog[];
  onBanIp: (targetIp: string, reason: string) => Promise<boolean>;
  onUnbanIp: (targetIp: string) => Promise<boolean>;
  onRefreshData: () => Promise<void>;
  onClearLogs: () => Promise<boolean>;
  onBackToDashboard: () => void;
}

export const SecurityCenter: React.FC<SecurityCenterProps> = ({
  adminIp,
  trackedIps,
  securityLogs,
  onBanIp,
  onUnbanIp,
  onRefreshData,
  onClearLogs,
  onBackToDashboard,
}) => {
  const [manualIpToBan, setManualIpToBan] = useState('');
  const [banReason, setBanReason] = useState('Aktivitas mencurigakan');
  const [isSubmittingBan, setIsSubmittingBan] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filter & Search states
  const [logFilter, setLogFilter] = useState<'all' | 'suspicious' | 'auth' | 'ip'>('all');
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-time log polling every 3 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      onRefreshData();
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, onRefreshData]);

  const handleManualBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIpToBan.trim()) return;

    setIsSubmittingBan(true);
    setActionNotice(null);
    try {
      const ok = await onBanIp(manualIpToBan.trim(), banReason.trim());
      if (ok) {
        setActionNotice(`Alamat IP ${manualIpToBan.trim()} berhasil diblokir!`);
        setManualIpToBan('');
        setBanReason('Aktivitas mencurigakan');
      } else {
        setActionNotice('Gagal memblokir IP.');
      }
    } catch {
      setActionNotice('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmittingBan(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleUnban = async (ip: string) => {
    const ok = await onUnbanIp(ip);
    if (ok) {
      setActionNotice(`Blokir untuk IP ${ip} telah dicabut.`);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleQuickBan = (ip: string) => {
    setManualIpToBan(ip);
    setBanReason('Pelanggaran keamanan terdeteksi');
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshData();
    setIsRefreshing(false);
  };

  const filteredLogs = filterSecurityLogs(securityLogs, logFilter, searchLogQuery);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono flex flex-col">
      {/* Top Bar with Back Button */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold text-zinc-200 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Dasbor</span>
            </button>
            <div className="h-4 w-px bg-zinc-800" />
            <span className="text-xs font-bold text-red-400 hidden sm:inline-block">
              MODUL 02: CEK IP, BAN SYSTEM & LOG REAL-TIME
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto refresh status */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded border transition-colors cursor-pointer ${
                autoRefresh
                  ? 'border-emerald-800 bg-emerald-950/40 text-emerald-400'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400'
              }`}
              title="Toggle Pembaruan Log Otomatis"
            >
              <Radio className={`w-3 h-3 ${autoRefresh ? 'animate-pulse text-emerald-400' : ''}`} />
              <span>{autoRefresh ? 'Live Polling: Aktif' : 'Live: Dijeda'}</span>
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
              title="Muat Ulang Data Sekarang"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-8">
        {actionNotice && (
          <div className="p-3 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Section 1: Cek IP Pribadi & Ban IP Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card: Status IP Pengguna Terdeteksi */}
          <div className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>CEK IP PENGUNJUNG</span>
              </span>
              <span className="text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-900">
                TERHUBUNG
              </span>
            </div>

            <div className="p-3 rounded bg-black/60 border border-zinc-800 space-y-2 text-xs">
              <div>
                <span className="text-zinc-400 text-[11px] block">IP Anda Saat Ini:</span>
                <span className="text-base font-bold text-zinc-100 font-mono">{adminIp}</span>
              </div>
              <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                <span>Status Izin: </span>
                <span className="text-emerald-400 font-semibold">Administrator Terverifikasi</span>
              </div>
              <div className="text-[11px] text-zinc-400">
                <span>Sensor IP: </span>
                <span className="text-zinc-300">Aktif membaca header & socket</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Sistem backend membaca IP nyata setiap pengunjung web melalui header jaringan
              (x-forwarded-for & remote address).
            </p>
          </div>

          {/* Card: Formulir Blokir IP (Ban IP) */}
          <div className="lg:col-span-2 border border-zinc-800 bg-zinc-900/40 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-red-400">
              <span className="flex items-center gap-1.5">
                <Ban className="w-4 h-4" />
                <span>EKSEKUSI BLOKIR IP (BAN SYSTEM)</span>
              </span>
              <span className="text-[11px] text-zinc-400 font-normal">
                Memblokir akses ke seluruh web secara permanen
              </span>
            </div>

            <form onSubmit={handleManualBan} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Alamat IP Target:</label>
                  <input
                    type="text"
                    placeholder="Contoh: 182.253.160.88"
                    value={manualIpToBan}
                    onChange={(e) => setManualIpToBan(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100 font-mono focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Alasan Pemblokiran:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Upaya spam atau pembobolan"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100 font-mono focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-400">
                  IP yang diblokir akan langsung menerima layar peringatan 403 Forbidden.
                </span>
                <button
                  type="submit"
                  disabled={isSubmittingBan || !manualIpToBan.trim()}
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{isSubmittingBan ? 'Memblokir...' : 'Blokir IP Sekarang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Section 2: Tabel Cek IP & Daftar Pengunjung Terpantau */}
        <section className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Daftar IP Pengunjung Terpantau ({trackedIps.length} Alamat IP)</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Daftar semua alamat IP perangkat yang pernah membuka situs ini.
              </p>
            </div>
            <div className="text-xs text-zinc-400">
              Total Terblokir:{' '}
              <span className="text-red-400 font-bold">
                {trackedIps.filter((i) => i.isBanned).length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="py-2.5 px-3 font-semibold">Alamat IP</th>
                  <th className="py-2.5 px-3 font-semibold">Total Kunjungan</th>
                  <th className="py-2.5 px-3 font-semibold">Terakhir Aktif</th>
                  <th className="py-2.5 px-3 font-semibold">Gagal Login</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Aksi Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {trackedIps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-zinc-500">
                      Belum ada data IP tersimpan.
                    </td>
                  </tr>
                ) : (
                  trackedIps.map((record) => {
                    const isSelf = record.ip === adminIp;
                    return (
                      <tr
                        key={record.ip}
                        className={`hover:bg-zinc-900/80 transition-colors ${
                          record.isBanned ? 'bg-red-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-semibold text-zinc-100 flex items-center gap-2">
                          <span>{record.ip}</span>
                          {isSelf && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                              Anda
                            </span>
                          )}
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(record.ip);
                              setActionNotice(`IP ${record.ip} disalin ke clipboard.`);
                              setTimeout(() => setActionNotice(null), 2500);
                            }}
                            className="text-zinc-500 hover:text-zinc-300 p-0.5"
                            title="Salin Alamat IP"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </td>

                        <td className="py-3 px-3 text-zinc-300">{record.visitCount} kali</td>

                        <td className="py-3 px-3 text-zinc-400">{record.lastSeen}</td>

                        <td className="py-3 px-3">
                          {record.failedLoginAttempts > 0 ? (
                            <span className="text-red-400 font-bold">
                              {record.failedLoginAttempts} kali
                            </span>
                          ) : (
                            <span className="text-zinc-500">0</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {record.isBanned ? (
                            <span className="px-2 py-0.5 rounded bg-red-950 border border-red-900 text-red-300 text-[10px] font-bold">
                              TERBLOKIR (BANNED)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-900 text-emerald-300 text-[10px]">
                              NORMAL
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          {record.isBanned ? (
                            <button
                              onClick={() => handleUnban(record.ip)}
                              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 font-semibold cursor-pointer text-xs"
                            >
                              Cabut Blokir
                            </button>
                          ) : (
                            <button
                              onClick={() => handleQuickBan(record.ip)}
                              className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 font-semibold cursor-pointer text-xs"
                            >
                              Blokir IP
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Sistem Log Aktivitas Real-time */}
        <section className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Sistem Log Aktivitas Real-time</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Memantau secara langsung seluruh aktivitas kunjungan, percobaan login, dan tindakan mencurigakan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClearLogs}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                title="Bersihkan Semua Log"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            {/* Filter categories */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setLogFilter('all')}
                className={`px-3 py-1 rounded border cursor-pointer ${
                  logFilter === 'all'
                    ? 'bg-zinc-200 text-zinc-950 font-bold border-zinc-200'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                Semua Log ({securityLogs.length})
              </button>
              <button
                onClick={() => setLogFilter('suspicious')}
                className={`px-3 py-1 rounded border cursor-pointer ${
                  logFilter === 'suspicious'
                    ? 'bg-red-500 text-white font-bold border-red-500'
                    : 'bg-zinc-900 text-red-400 border-zinc-800 hover:text-red-300'
                }`}
              >
                Mencurigakan Saja
              </button>
              <button
                onClick={() => setLogFilter('auth')}
                className={`px-3 py-1 rounded border cursor-pointer ${
                  logFilter === 'auth'
                    ? 'bg-zinc-200 text-zinc-950 font-bold border-zinc-200'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                Otentikasi Sandi
              </button>
              <button
                onClick={() => setLogFilter('ip')}
                className={`px-3 py-1 rounded border cursor-pointer ${
                  logFilter === 'ip'
                    ? 'bg-zinc-200 text-zinc-950 font-bold border-zinc-200'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                Tindakan Ban
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari IP atau kata kunci..."
                value={searchLogQuery}
                onChange={(e) => setSearchLogQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 font-mono w-full sm:w-60 focus:border-zinc-500"
              />
            </div>
          </div>

          {/* Logs Terminal-like Display */}
          <div className="border border-zinc-800/80 rounded bg-black/60 p-3 max-h-96 overflow-y-auto space-y-2 font-mono text-xs">
            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-zinc-500">Tidak ada log yang sesuai dengan filter.</div>
            ) : (
              filteredLogs.map((log) => {
                const isDanger = log.severity === 'danger';
                const isWarn = log.severity === 'warning';
                return (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded border transition-colors ${
                      isDanger
                        ? 'border-red-900/60 bg-red-950/20 text-red-200'
                        : isWarn
                        ? 'border-amber-900/60 bg-amber-950/20 text-amber-200'
                        : 'border-zinc-800/60 bg-zinc-900/30 text-zinc-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isDanger ? 'bg-red-500' : isWarn ? 'bg-amber-400' : 'bg-emerald-500'
                          }`}
                        />
                        <span className="text-zinc-400 font-mono">{log.timestamp}</span>
                        <span className="font-bold text-zinc-100">[{log.ip}]</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isDanger
                            ? 'text-red-400'
                            : isWarn
                            ? 'text-amber-400'
                            : 'text-zinc-500'
                        }`}
                      >
                        {log.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="pl-4 text-xs font-mono leading-relaxed">{log.details}</div>

                    {log.userAgent && (
                      <div className="pl-4 text-[10px] text-zinc-400 truncate mt-1">
                        UA: {log.userAgent}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
