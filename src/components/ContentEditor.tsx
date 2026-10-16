import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Calendar,
  Sparkles,
  Users,
  Bell,
  UserCheck,
  Info,
  AlertCircle
} from 'lucide-react';
import type {
  ClassData,
  ClassInfo,
  DaySchedule,
  LessonItem,
  CleaningDay,
  OrganizationMember,
  AnnouncementItem,
  StudentItem
} from '../types/index.ts';

interface ContentEditorProps {
  data: ClassData;
  adminToken: string;
  onSave: (updatedData: ClassData) => Promise<boolean>;
  onBackToDashboard: () => void;
}

type TabType = 'info' | 'schedule' | 'piket' | 'structure' | 'announcements' | 'students';

export const ContentEditor: React.FC<ContentEditorProps> = ({
  data,
  onSave,
  onBackToDashboard
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [formData, setFormData] = useState<ClassData>(JSON.parse(JSON.stringify(data)));
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Selected day for schedule and piket tabs
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<string>('senin');
  const [selectedPiketDay, setSelectedPiketDay] = useState<string>('piket-senin');

  // New item modal or temporary state
  const [newAnnouncement, setNewAnnouncement] = useState<Partial<AnnouncementItem>>({
    title: '',
    category: 'Tugas',
    content: '',
    isUrgent: false,
    date: new Date().toISOString().substring(0, 10)
  });

  const [newLesson, setNewLesson] = useState<LessonItem>({
    time: '07.00 - 08.20',
    subject: '',
    teacher: '',
    room: 'Ruang 7.1'
  });

  const [newStudent, setNewStudent] = useState<Partial<StudentItem>>({
    absentNo: formData.students.length + 1,
    fullName: '',
    nickname: '',
    gender: 'L'
  });

  const [newOrgMember, setNewOrgMember] = useState<Partial<OrganizationMember>>({
    position: '',
    name: '',
    role: ''
  });

  const [newPiketMemberName, setNewPiketMemberName] = useState('');

  // Handle general info update
  const handleInfoChange = (field: keyof ClassInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      info: { ...prev.info, [field]: value }
    }));
  };

  // Save all changes
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const ok = await onSave(formData);
      if (ok) {
        setSaveStatus('Perubahan berhasil disimpan ke server!');
        setTimeout(() => setSaveStatus(null), 3500);
      } else {
        setSaveStatus('Gagal menyimpan perubahan.');
      }
    } catch {
      setSaveStatus('Terjadi kesalahan jaringan.');
    } finally {
      setIsSaving(false);
    }
  };

  // Schedule operations
  const handleAddLesson = () => {
    if (!newLesson.subject.trim()) return;
    setFormData((prev) => {
      const updatedSchedule = prev.schedule.map((day) => {
        if (day.id === selectedScheduleDay) {
          return {
            ...day,
            lessons: [...day.lessons, { ...newLesson }]
          };
        }
        return day;
      });
      return { ...prev, schedule: updatedSchedule };
    });
    setNewLesson({ time: '07.00 - 08.20', subject: '', teacher: '', room: 'Ruang 7.1' });
  };

  const handleDeleteLesson = (dayId: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((day) => {
        if (day.id === dayId) {
          return {
            ...day,
            lessons: day.lessons.filter((_, i) => i !== index)
          };
        }
        return day;
      })
    }));
  };

  // Piket operations
  const handleAddPiketMember = () => {
    if (!newPiketMemberName.trim()) return;
    setFormData((prev) => ({
      ...prev,
      cleaningRoster: prev.cleaningRoster.map((item) => {
        if (item.id === selectedPiketDay) {
          return {
            ...item,
            members: [...item.members, newPiketMemberName.trim()]
          };
        }
        return item;
      })
    }));
    setNewPiketMemberName('');
  };

  const handleDeletePiketMember = (dayId: string, memberIdx: number) => {
    setFormData((prev) => ({
      ...prev,
      cleaningRoster: prev.cleaningRoster.map((item) => {
        if (item.id === dayId) {
          return {
            ...item,
            members: item.members.filter((_, i) => i !== memberIdx)
          };
        }
        return item;
      })
    }));
  };

  // Announcement operations
  const handleAddAnnouncement = () => {
    if (!newAnnouncement.title?.trim() || !newAnnouncement.content?.trim()) return;
    const item: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      title: newAnnouncement.title.trim(),
      category: (newAnnouncement.category as any) || 'Pengumuman',
      date: newAnnouncement.date || new Date().toISOString().substring(0, 10),
      dueDate: newAnnouncement.dueDate || undefined,
      content: newAnnouncement.content.trim(),
      isUrgent: !!newAnnouncement.isUrgent
    };
    setFormData((prev) => ({
      ...prev,
      announcements: [item, ...prev.announcements]
    }));
    setNewAnnouncement({
      title: '',
      category: 'Tugas',
      content: '',
      isUrgent: false,
      date: new Date().toISOString().substring(0, 10)
    });
  };

  const handleDeleteAnnouncement = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((a) => a.id !== id)
    }));
  };

  // Student operations
  const handleAddStudent = () => {
    if (!newStudent.fullName?.trim()) return;
    const item: StudentItem = {
      id: `st-${Date.now()}`,
      absentNo: newStudent.absentNo || formData.students.length + 1,
      fullName: newStudent.fullName.trim(),
      nickname: newStudent.nickname?.trim() || newStudent.fullName.split(' ')[0],
      gender: newStudent.gender || 'L'
    };
    setFormData((prev) => ({
      ...prev,
      students: [...prev.students, item]
    }));
    setNewStudent({
      absentNo: formData.students.length + 2,
      fullName: '',
      nickname: '',
      gender: 'L'
    });
  };

  const handleDeleteStudent = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id)
    }));
  };

  // Organization operations
  const handleAddOrgMember = () => {
    if (!newOrgMember.position?.trim() || !newOrgMember.name?.trim()) return;
    const item: OrganizationMember = {
      id: `org-${Date.now()}`,
      position: newOrgMember.position.trim(),
      name: newOrgMember.name.trim(),
      role: newOrgMember.role?.trim() || '-'
    };
    setFormData((prev) => ({
      ...prev,
      structure: [...prev.structure, item]
    }));
    setNewOrgMember({ position: '', name: '', role: '' });
  };

  const handleDeleteOrgMember = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      structure: prev.structure.filter((m) => m.id !== id)
    }));
  };

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
            <span className="text-xs font-bold text-zinc-200 hidden sm:inline-block">
              MODUL 01: MANAJEMEN KONTEN
            </span>
          </div>

          <div className="flex items-center gap-3">
            {saveStatus && (
              <span className="text-xs text-emerald-400 font-medium animate-pulse hidden sm:inline">
                {saveStatus}
              </span>
            )}
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold text-zinc-950 bg-zinc-100 hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Editor Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-2 rounded border transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'info'
                ? 'bg-zinc-100 text-zinc-950 font-bold border-zinc-100'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Informasi Umum</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-2 rounded border transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'schedule'
                ? 'bg-zinc-100 text-zinc-950 font-bold border-zinc-100'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Jadwal Pelajaran</span>
          </button>
          <button
            onClick={() => setActiveTab('piket')}
            className={`px-3 py-2 rounded border transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'piket'
                ? 'bg-zinc-100 text-zinc-950 font-bold border-zinc-100'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Jadwal Piket</span>
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`px-3 py-2 rounded border transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'structure'
                ? 'bg-zinc-100 text-zinc-950 font-bold border-zinc-100'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Struktur Organisasi</span>
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3 py-2 rounded border transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'announcements'
                ? 'bg-zinc-100 text-zinc-950 font-bold border-zinc-100'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Pengumuman & Tugas</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 py-2 rounded border transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'students'
                ? 'bg-zinc-100 text-zinc-950 font-bold border-zinc-100'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Daftar Siswa</span>
          </button>
        </div>

        {/* Tab 1: Info Umum */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase text-zinc-200 border-b border-zinc-800 pb-2">
                Informasi Identitas Kelas 7.1
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1">Nama Kelas:</label>
                  <input
                    type="text"
                    value={formData.info.className}
                    onChange={(e) => handleInfoChange('className', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded focus:border-zinc-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Nama Sekolah:</label>
                  <input
                    type="text"
                    value={formData.info.schoolName}
                    onChange={(e) => handleInfoChange('schoolName', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded focus:border-zinc-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Tahun Ajaran:</label>
                  <input
                    type="text"
                    value={formData.info.academicYear}
                    onChange={(e) => handleInfoChange('academicYear', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded focus:border-zinc-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Wali Kelas:</label>
                  <input
                    type="text"
                    value={formData.info.waliKelas}
                    onChange={(e) => handleInfoChange('waliKelas', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded focus:border-zinc-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Kontak Wali Kelas:</label>
                  <input
                    type="text"
                    value={formData.info.waliKontak}
                    onChange={(e) => handleInfoChange('waliKontak', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded focus:border-zinc-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Ketua Kelas:</label>
                  <input
                    type="text"
                    value={formData.info.ketuaKelas}
                    onChange={(e) => handleInfoChange('ketuaKelas', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded focus:border-zinc-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs mb-1">Tagline Kelas:</label>
                <input
                  type="text"
                  value={formData.info.tagline}
                  onChange={(e) => handleInfoChange('tagline', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded focus:border-zinc-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs mb-1">Motto Kelas:</label>
                <textarea
                  rows={2}
                  value={formData.info.motto}
                  onChange={(e) => handleInfoChange('motto', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded focus:border-zinc-500 text-xs font-mono"
                />
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-300 mb-2">Profil & Foto Yamasy (Pojok Kanan Atas)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1">URL / Path Foto Yamasy:</label>
                    <input
                      type="text"
                      value={formData.info.yamasyPhoto}
                      onChange={(e) => handleInfoChange('yamasyPhoto', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded focus:border-zinc-500 font-mono"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Bisa diisi URL foto baru jika kamu ingin mengganti foto Yamasy.
                    </p>
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Bio Singkat Yamasy:</label>
                    <input
                      type="text"
                      value={formData.info.yamasyBio}
                      onChange={(e) => handleInfoChange('yamasyBio', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded focus:border-zinc-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Jadwal Pelajaran */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {formData.schedule.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setSelectedScheduleDay(day.id)}
                  className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer border transition-colors ${
                    selectedScheduleDay === day.id
                      ? 'bg-zinc-200 text-zinc-950 border-zinc-200 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {day.day}
                </button>
              ))}
            </div>

            {/* List Lessons */}
            {formData.schedule
              .filter((d) => d.id === selectedScheduleDay)
              .map((day) => (
                <div key={day.id} className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h4 className="text-sm font-bold text-zinc-200">
                      Jadwal Hari {day.day} ({day.lessons.length} Mata Pelajaran)
                    </h4>
                  </div>

                  <div className="divide-y divide-zinc-800/80">
                    {day.lessons.map((lesson, idx) => (
                      <div
                        key={idx}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-zinc-400 w-24 shrink-0 font-mono">
                            {lesson.time}
                          </span>
                          <div>
                            <span className="font-semibold text-zinc-100">{lesson.subject}</span>
                            <span className="text-zinc-400 mx-2">·</span>
                            <span className="text-zinc-400">{lesson.teacher}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300">
                            {lesson.room}
                          </span>
                          <button
                            onClick={() => handleDeleteLesson(day.id, idx)}
                            className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Hapus Pelajaran"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Lesson Form */}
                  <div className="pt-4 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Waktu (e.g. 07.30 - 08.50)"
                      value={newLesson.time}
                      onChange={(e) => setNewLesson({ ...newLesson, time: e.target.value })}
                      className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
                    />
                    <input
                      type="text"
                      placeholder="Mata Pelajaran"
                      value={newLesson.subject}
                      onChange={(e) => setNewLesson({ ...newLesson, subject: e.target.value })}
                      className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
                    />
                    <input
                      type="text"
                      placeholder="Nama Guru Pengampu"
                      value={newLesson.teacher}
                      onChange={(e) => setNewLesson({ ...newLesson, teacher: e.target.value })}
                      className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ruang"
                        value={newLesson.room}
                        onChange={(e) => setNewLesson({ ...newLesson, room: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
                      />
                      <button
                        onClick={handleAddLesson}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded font-bold cursor-pointer shrink-0"
                      >
                        + Tambah
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Tab 3: Jadwal Piket */}
        {activeTab === 'piket' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {formData.cleaningRoster.map((roster) => (
                <button
                  key={roster.id}
                  onClick={() => setSelectedPiketDay(roster.id)}
                  className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer border transition-colors ${
                    selectedPiketDay === roster.id
                      ? 'bg-zinc-200 text-zinc-950 border-zinc-200 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  Piket {roster.day}
                </button>
              ))}
            </div>

            {formData.cleaningRoster
              .filter((r) => r.id === selectedPiketDay)
              .map((roster) => (
                <div key={roster.id} className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-200">Piket Hari {roster.day}</h4>
                      <span className="text-xs text-zinc-400">
                        Koordinator: <span className="text-zinc-200 font-semibold">{roster.leader}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-zinc-400">Ganti Koordinator:</label>
                      <input
                        type="text"
                        value={roster.leader}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            cleaningRoster: prev.cleaningRoster.map((item) =>
                              item.id === roster.id ? { ...item, leader: val } : item
                            )
                          }));
                        }}
                        className="px-2 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-200 font-mono"
                      />
                    </div>
                  </div>

                  {/* Member Tags */}
                  <div>
                    <label className="block text-xs text-zinc-400 mb-2">
                      Daftar Anggota Petugas Piket ({roster.members.length} Orang):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {roster.members.map((member, mIdx) => (
                        <div
                          key={mIdx}
                          className="flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                        >
                          <span>{member}</span>
                          <button
                            onClick={() => handleDeletePiketMember(roster.id, mIdx)}
                            className="p-0.5 rounded text-zinc-500 hover:text-red-400 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Member input */}
                  <div className="pt-3 border-t border-zinc-800 flex items-center gap-2 max-w-md">
                    <input
                      type="text"
                      placeholder="Nama Siswa Petugas Baru"
                      value={newPiketMemberName}
                      onChange={(e) => setNewPiketMemberName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 font-mono"
                    />
                    <button
                      onClick={handleAddPiketMember}
                      className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      + Tambah
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Tab 4: Pengurus Organisasi */}
        {activeTab === 'structure' && (
          <div className="space-y-6">
            <div className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-5 space-y-4">
              <h4 className="text-sm font-bold text-zinc-200 border-b border-zinc-800 pb-2">
                Struktur Organisasi Kelas 7.1 ({formData.structure.length} Jabatan)
              </h4>

              <div className="divide-y divide-zinc-800">
                {formData.structure.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-zinc-200">{item.position}</div>
                      <div className="text-zinc-300 font-medium">{item.name}</div>
                      <div className="text-[11px] text-zinc-400">{item.role}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteOrgMember(item.id)}
                      className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-950/40 self-end sm:self-center cursor-pointer"
                      title="Hapus Jabatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Org Member Form */}
              <div className="pt-4 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Jabatan (e.g. Seksi Mading)"
                  value={newOrgMember.position}
                  onChange={(e) => setNewOrgMember({ ...newOrgMember, position: e.target.value })}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
                />
                <input
                  type="text"
                  placeholder="Nama Siswa"
                  value={newOrgMember.name}
                  onChange={(e) => setNewOrgMember({ ...newOrgMember, name: e.target.value })}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tugas / Peran"
                    value={newOrgMember.role}
                    onChange={(e) => setNewOrgMember({ ...newOrgMember, role: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
                  />
                  <button
                    onClick={handleAddOrgMember}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded font-bold cursor-pointer shrink-0"
                  >
                    + Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Pengumuman & Tugas */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-5 space-y-4">
              <h4 className="text-sm font-bold text-zinc-200 border-b border-zinc-800 pb-2">
                Daftar Pengumuman, Tugas & PR ({formData.announcements.length} Item)
              </h4>

              <div className="space-y-3">
                {formData.announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded border border-zinc-800 bg-zinc-900/60 flex flex-col sm:flex-row justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-100 text-sm">{ann.title}</span>
                        {ann.isUrgent && (
                          <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-900 text-[10px] font-bold">
                            PENTING
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                          {ann.category}
                        </span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{ann.content}</p>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-3 pt-1">
                        <span>Tanggal: {ann.date}</span>
                        {ann.dueDate && <span>Tenggat: {ann.dueDate}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-950/40 self-end sm:self-center cursor-pointer shrink-0"
                      title="Hapus Pengumuman"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Announcement Form */}
              <div className="pt-4 border-t border-zinc-800 space-y-3 text-xs">
                <h5 className="font-bold text-zinc-300 uppercase">// Tambah Pengumuman Baru</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Judul Pengumuman / Tugas"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
                  />
                  <select
                    value={newAnnouncement.category}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value as any })}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
                  >
                    <option value="Tugas">Tugas</option>
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Ujian">Ujian</option>
                    <option value="Kegiatan">Kegiatan</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Tenggat / Due Date (opsional)"
                    value={newAnnouncement.dueDate || ''}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, dueDate: e.target.value })}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
                  />
                </div>

                <textarea
                  rows={2}
                  placeholder="Isi rincian pengumuman atau tugas..."
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 font-mono"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 text-xs">
                    <input
                      type="checkbox"
                      checked={newAnnouncement.isUrgent}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, isUrgent: e.target.checked })}
                      className="rounded bg-zinc-900 border-zinc-800 text-red-500"
                    />
                    <span>Tandai sebagai Sangat Penting (Urgent)</span>
                  </label>

                  <button
                    onClick={handleAddAnnouncement}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded font-bold cursor-pointer"
                  >
                    + Publikasikan Pengumuman
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Siswa */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-5 space-y-4">
              <h4 className="text-sm font-bold text-zinc-200 border-b border-zinc-800 pb-2">
                Daftar Absensi Siswa Kelas 7.1 ({formData.students.length} Siswa)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {formData.students.map((st) => (
                  <div
                    key={st.id}
                    className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-zinc-400 font-bold text-[11px]">#{st.absentNo}</span>
                      <div>
                        <span className="text-zinc-200 font-semibold">{st.fullName}</span>
                        <div className="text-[10px] text-zinc-400">
                          Panggilan: {st.nickname} · {st.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteStudent(st.id)}
                      className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-950/40 cursor-pointer"
                      title="Hapus Siswa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Student */}
              <div className="pt-4 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <input
                  type="number"
                  placeholder="No. Absen"
                  value={newStudent.absentNo || ''}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, absentNo: parseInt(e.target.value, 10) || 0 })
                  }
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
                />
                <input
                  type="text"
                  placeholder="Nama Lengkap Siswa"
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
                />
                <input
                  type="text"
                  placeholder="Nama Panggilan"
                  value={newStudent.nickname}
                  onChange={(e) => setNewStudent({ ...newStudent, nickname: e.target.value })}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
                />
                <div className="flex gap-2">
                  <select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as any })}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200"
                  >
                    <option value="L">L</option>
                    <option value="P">P</option>
                  </select>
                  <button
                    onClick={handleAddStudent}
                    className="w-full px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded font-bold cursor-pointer shrink-0"
                  >
                    + Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
