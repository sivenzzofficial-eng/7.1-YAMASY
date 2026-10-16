import React, { useState, useRef, useEffect } from 'react';
import { Shield, Key, LogOut, ChevronDown, User, Sparkles } from 'lucide-react';
import type { ClassInfo } from '../types/index.ts';

interface NavbarProps {
  info: ClassInfo;
  isAdmin: boolean;
  onOpenLoginModal: () => void;
  onEnterDashboard: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  info,
  isAdmin,
  onOpenLoginModal,
  onEnterDashboard,
  onLogout,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2 group">
            <span className="px-2 py-0.5 text-xs font-bold text-zinc-900 bg-zinc-100 rounded-sm">
              7.1
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-zinc-100 group-hover:text-zinc-300 transition-colors">
                {info.className}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider">
                {info.schoolName}
              </span>
            </div>
          </a>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400 font-mono">
          <a href="#jadwal" className="hover:text-zinc-100 transition-colors">
            // Jadwal
          </a>
          <a href="#piket" className="hover:text-zinc-100 transition-colors">
            // Piket
          </a>
          <a href="#organisasi" className="hover:text-zinc-100 transition-colors">
            // Pengurus
          </a>
          <a href="#pengumuman" className="hover:text-zinc-100 transition-colors">
            // Pengumuman
          </a>
          <a href="#siswa" className="hover:text-zinc-100 transition-colors">
            // Siswa
          </a>
        </nav>

        {/* Hidden Admin Entry via Yamasy Photo (Top Right) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-md border border-zinc-800 hover:border-zinc-700 bg-zinc-900/80 transition-all cursor-pointer group"
            title="Profil Pengurus Kelas"
            aria-label="Profil Pengurus Kelas & Akses Admin"
            aria-expanded={dropdownOpen}
          >
            <div className="relative w-8 h-8 rounded border border-zinc-700 overflow-hidden bg-zinc-800 shrink-0">
              <img
                src={info.yamasyPhoto}
                alt="Foto Yamasy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onError={(e) => {
                  // Fallback if image path fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-zinc-400 bg-zinc-800 -z-10">
                YM
              </div>
            </div>

            <div className="hidden sm:flex flex-col text-left pr-1">
              <span className="text-xs font-semibold text-zinc-200 leading-none">
                {info.ketuaKelas.split(' ')[0]}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {isAdmin ? 'Admin Aktif' : 'Ketua Kelas'}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
          </button>

          {/* Secret / Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-lg border border-zinc-800 bg-zinc-950 p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 font-mono text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                <img
                  src={info.yamasyPhoto}
                  alt="Yamasy"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded object-cover border border-zinc-700"
                />
                <div>
                  <div className="font-bold text-zinc-100">{info.ketuaKelas}</div>
                  <div className="text-[11px] text-zinc-400">Pengurus & Administrator Kelas</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Sesi: Terverifikasi</div>
                </div>
              </div>

              <div className="py-2.5 text-zinc-300 text-[11px] leading-relaxed border-b border-zinc-800">
                "{info.yamasyBio}"
              </div>

              <div className="pt-2.5 space-y-2">
                {!isAdmin ? (
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenLoginModal();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium transition-colors cursor-pointer text-xs"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mode Admin</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onEnterDashboard();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold transition-colors cursor-pointer text-xs"
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Buka Dasbor Admin</span>
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded hover:bg-zinc-900 text-red-400 font-normal transition-colors cursor-pointer text-[11px]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar dari Admin</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
