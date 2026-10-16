export interface ClassInfo {
  className: string;
  schoolName: string;
  academicYear: string;
  tagline: string;
  motto: string;
  waliKelas: string;
  waliKontak: string;
  ketuaKelas: string;
  yamasyPhoto: string;
  yamasyBio: string;
}

export interface LessonItem {
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

export interface DaySchedule {
  id: string;
  day: string;
  lessons: LessonItem[];
}

export interface CleaningDay {
  id: string;
  day: string;
  leader: string;
  members: string[];
}

export interface OrganizationMember {
  id: string;
  position: string;
  name: string;
  role: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  category: 'Tugas' | 'Pengumuman' | 'Ujian' | 'Kegiatan';
  date: string;
  dueDate?: string;
  content: string;
  isUrgent: boolean;
}

export interface StudentItem {
  id: string;
  absentNo: number;
  fullName: string;
  nickname: string;
  gender: 'L' | 'P';
}

export interface ClassData {
  info: ClassInfo;
  schedule: DaySchedule[];
  cleaningRoster: CleaningDay[];
  structure: OrganizationMember[];
  announcements: AnnouncementItem[];
  students: StudentItem[];
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  ip: string;
  type: 'visit' | 'admin_login_success' | 'admin_login_fail' | 'suspicious' | 'ip_ban' | 'ip_unban' | 'content_update';
  severity: 'normal' | 'warning' | 'danger';
  details: string;
  userAgent?: string;
}

export interface TrackedIP {
  ip: string;
  firstSeen: string;
  lastSeen: string;
  visitCount: number;
  isBanned: boolean;
  banReason?: string;
  bannedAt?: string;
  failedLoginAttempts: number;
  userAgent?: string;
}
