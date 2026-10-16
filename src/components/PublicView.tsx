import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Users,
  Bell,
  Clock,
  MapPin,
  Phone,
  Shield,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { ClassData } from '../types/index.ts';

interface PublicViewProps {
  data: ClassData;
  clientIp?: string;
}

export const PublicView: React.FC<PublicViewProps> = ({ data, clientIp = '127.0.0.1' }) => {
  const [selectedDayId, setSelectedDayId] = useState<string>('senin');

  // Today indicator
  const daysMap: Record<number, string> = {
    1: 'senin',
    2: 'selasa',
    3: 'rabu',
    4: 'kamis',
    5: 'jumat'
  };
  const currentDayOfWeek = new Date().getDay();
  const currentDayKey = daysMap[currentDayOfWeek] || 'senin';

  return (
    <div className="w-full text-zinc-100 font-mono">
      {/* Hero Section */}
      <section className="border-b border-zinc-800 bg-zinc-950/40 relative">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                  {data.info.academicYear}
                </span>
                <span>·</span>
                <span>{data.info.schoolName}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
                {data.info.className}
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
                {data.info.tagline}
              </p>
            </div>

            {/* Quick Class Bio Card */}
            <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/60 max-w-sm w-full space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800 text-zinc-400">
                <span className="font-semibold text-zinc-200">IDENTITAS KELAS</span>
                <span className="font-mono text-[10px]">VERIFIED</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500">Wali Kelas:</span>
                <span className="font-semibold text-right">{data.info.waliKelas}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500">Ketua Kelas:</span>
                <span className="font-semibold">{data.info.ketuaKelas}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500">Total Siswa:</span>
                <span>{data.students.length} Siswa</span>
              </div>
            </div>
          </div>

          {/* Motto Box */}
          <div className="p-3.5 rounded bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5">
            <span className="text-zinc-500 font-bold select-none">&gt;&gt;</span>
            <span className="italic leading-relaxed font-mono">
              "{data.info.motto}"
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-16">
        {/* Section 1: Jadwal Pelajaran */}
        <section id="jadwal" className="space-y-4 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white uppercase flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span>Jadwal Pelajaran Kelas 7.1</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Alokasi jam belajar mengajar kurikulum nasional semester ganjil.
              </p>
            </div>

            {/* Day Switcher Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {data.schedule.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDayId(day.id)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer border transition-colors ${
                    selectedDayId === day.id
                      ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-100'
                  }`}
                >
                  {day.day}
                  {day.id === currentDayKey && (
                    <span className="ml-1 text-[9px] text-emerald-600 font-bold">●</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Table */}
          {data.schedule
            .filter((d) => d.id === selectedDayId)
            .map((day) => (
              <div
                key={day.id}
                className="border border-zinc-800 rounded-lg bg-zinc-900/30 overflow-hidden shadow-sm"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/70 text-zinc-400">
                        <th className="py-2.5 px-4 font-semibold w-36">Waktu</th>
                        <th className="py-2.5 px-4 font-semibold">Mata Pelajaran</th>
                        <th className="py-2.5 px-4 font-semibold">Guru Pengampu</th>
                        <th className="py-2.5 px-4 font-semibold">Ruangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono">
                      {day.lessons.map((lesson, idx) => (
                        <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-zinc-400">{lesson.time}</td>
                          <td className="py-3 px-4 font-semibold text-zinc-100">{lesson.subject}</td>
                          <td className="py-3 px-4 text-zinc-400">{lesson.teacher}</td>
                          <td className="py-3 px-4 text-zinc-400">
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px]">
                              {lesson.room}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </section>

        {/* Section 2: Jadwal Piket Kebersihan */}
        <section id="piket" className="space-y-4 scroll-mt-20">
          <div className="border-b border-zinc-800 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-zinc-400" />
              <span>Jadwal Piket Kebersihan Kelas</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Petugas piket bertanggung jawab menjaga kebersihan, kerapian papan tulis, dan tempat sampah sebelum serta sesudah KBM.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {data.cleaningRoster.map((roster) => {
              const isToday = roster.day.toLowerCase() === currentDayKey;
              return (
                <div
                  key={roster.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isToday
                      ? 'border-zinc-500 bg-zinc-900/80 shadow-md ring-1 ring-zinc-500/30'
                      : 'border-zinc-800 bg-zinc-900/30'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-3">
                    <span className="font-bold text-zinc-100 text-xs uppercase tracking-wide">
                      {roster.day}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">
                        Hari Ini
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="text-[11px] text-zinc-400">
                      Koordinator:{' '}
                      <span className="text-zinc-200 font-semibold block">{roster.leader}</span>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/60">
                      <span className="text-[10px] text-zinc-400 block mb-1">Anggota Petugas:</span>
                      <ul className="space-y-1">
                        {roster.members.map((member, mIdx) => (
                          <li key={mIdx} className="text-zinc-300 text-xs truncate">
                            · {member}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Papan Pengumuman & Tugas */}
        <section id="pengumuman" className="space-y-4 scroll-mt-20">
          <div className="border-b border-zinc-800 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase flex items-center gap-2">
              <Bell className="w-4 h-4 text-zinc-400" />
              <span>Papan Pengumuman & Tugas / PR</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Informasi terkini mengenai pekerjaan rumah, perlengkapan kelas, dan jadwal ujian.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-4 rounded-lg border text-xs space-y-2 transition-all ${
                  ann.isUrgent
                    ? 'border-red-900/60 bg-red-950/10'
                    : 'border-zinc-800 bg-zinc-900/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-zinc-100 text-sm leading-snug">{ann.title}</span>
                  {ann.isUrgent && (
                    <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-900 text-[10px] font-bold shrink-0">
                      PENTING
                    </span>
                  )}
                </div>

                <p className="text-zinc-300 leading-relaxed font-mono">{ann.content}</p>

                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300">
                    {ann.category}
                  </span>
                  <div className="flex items-center gap-3">
                    <span>{ann.date}</span>
                    {ann.dueDate && (
                      <span className="text-amber-400 font-semibold">Tenggat: {ann.dueDate}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Struktur Organisasi Kelas */}
        <section id="organisasi" className="space-y-4 scroll-mt-20">
          <div className="border-b border-zinc-800 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-400" />
              <span>Struktur Organisasi Kelas 7.1</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Susunan pengurus dan penanggung jawab kelancaran kegiatan belajar kelas 7.1.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
            {data.structure.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-colors"
              >
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 font-bold">
                  {item.position}
                </div>
                <div className="font-bold text-zinc-100 text-sm">{item.name}</div>
                <div className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{item.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Daftar Siswa */}
        <section id="siswa" className="space-y-4 scroll-mt-20">
          <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-400" />
                <span>Daftar Siswa Kelas 7.1</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Daftar absensi resmi siswa Kelas 7.1 Tahun Ajaran {data.info.academicYear}.
              </p>
            </div>
            <span className="text-xs font-bold text-zinc-400 px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
              {data.students.length} Siswa
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
            {data.students.map((st) => (
              <div
                key={st.id}
                className="p-2.5 rounded bg-zinc-900/40 border border-zinc-800/80 flex items-center gap-2.5"
              >
                <span className="w-6 text-zinc-400 font-bold text-[11px] shrink-0 font-mono">
                  {String(st.absentNo).padStart(2, '0')}
                </span>
                <div className="truncate">
                  <div className="text-zinc-200 font-semibold truncate">{st.fullName}</div>
                  <div className="text-[10px] text-zinc-400">
                    "{st.nickname}" · {st.gender === 'L' ? 'L' : 'P'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Handcrafted Programmer Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8 text-xs text-zinc-400 font-mono">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-200">[ Kelas 7.1 ]</span>
            <span>·</span>
            <span>{data.info.schoolName}</span>
          </div>
          <div className="text-[11px] text-zinc-400">
            Dikelola oleh Tim Pengurus Kelas 7.1 · Sistem Mandiri
          </div>
        </div>
      </footer>
    </div>
  );
};
