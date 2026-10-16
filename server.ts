import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initialClassData } from './src/data/initialData.ts';
import { cleanIp, validateAdminPassword } from './src/utils/security.ts';
import type { ClassData, SecurityLog, TrackedIP } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// In-memory persistent state (with local file fallback if available)
const DATA_FILE = path.join(__dirname, 'class_data_storage.json');
let classData: ClassData = initialClassData;
let trackedIPs: Map<string, TrackedIP> = new Map();
let securityLogs: SecurityLog[] = [];
let adminTokens = new Set<string>();

// Pre-seed some realistic historical activity logs for authentic look
const now = new Date();
const timeStr = (offsetMinutes: number) => {
  const d = new Date(now.getTime() - offsetMinutes * 60000);
  return d.toISOString().replace('T', ' ').substring(0, 19);
};

securityLogs.push(
  {
    id: 'log-seed-1',
    timestamp: timeStr(120),
    ip: '127.0.0.1',
    type: 'visit',
    severity: 'normal',
    details: 'Pengunjung terhubung ke Portal Kelas 7.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  },
  {
    id: 'log-seed-2',
    timestamp: timeStr(85),
    ip: '114.122.34.12',
    type: 'visit',
    severity: 'normal',
    details: 'Siswa memeriksa jadwal pelajaran dan pengumuman',
    userAgent: 'Mozilla/5.0 (Android 14; Mobile)'
  },
  {
    id: 'log-seed-3',
    timestamp: timeStr(45),
    ip: '182.253.160.88',
    type: 'visit',
    severity: 'normal',
    details: 'Pengunjung memeriksa jadwal piket kelas',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)'
  }
);

// Load persisted data if file exists
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.classData) classData = parsed.classData;
    if (Array.isArray(parsed.trackedIPs)) {
      parsed.trackedIPs.forEach((item: TrackedIP) => trackedIPs.set(item.ip, item));
    }
    if (Array.isArray(parsed.securityLogs)) {
      securityLogs = parsed.securityLogs;
    }
  }
} catch {
  // Use memory fallback
}

function persistData() {
  try {
    const payload = {
      classData,
      trackedIPs: Array.from(trackedIPs.values()),
      securityLogs: securityLogs.slice(-300) // keep last 300 logs
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

function getClientIp(req: Request): string {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (typeof xForwardedFor === 'string') {
    return cleanIp(xForwardedFor);
  } else if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
    return cleanIp(xForwardedFor[0]);
  }
  const xRealIp = req.headers['x-real-ip'];
  if (typeof xRealIp === 'string') {
    return cleanIp(xRealIp);
  }
  return cleanIp(req.socket.remoteAddress || '127.0.0.1');
}

function logSecurityEvent(
  ip: string,
  type: SecurityLog['type'],
  severity: SecurityLog['severity'],
  details: string,
  userAgent?: string
) {
  const newLog: SecurityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    ip,
    type,
    severity,
    details,
    userAgent
  };
  securityLogs.unshift(newLog);
  if (securityLogs.length > 500) {
    securityLogs.pop();
  }
  persistData();
  return newLog;
}

function trackIpVisitor(ip: string, userAgent?: string): TrackedIP {
  const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
  let record = trackedIPs.get(ip);
  if (!record) {
    record = {
      ip,
      firstSeen: nowIso,
      lastSeen: nowIso,
      visitCount: 1,
      isBanned: false,
      failedLoginAttempts: 0,
      userAgent
    };
    trackedIPs.set(ip, record);
    logSecurityEvent(ip, 'visit', 'normal', `Pengunjung baru terdeteksi: ${ip}`, userAgent);
  } else {
    record.lastSeen = nowIso;
    record.visitCount += 1;
    if (userAgent) record.userAgent = userAgent;
  }
  persistData();
  return record;
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // Global visitor tracker & IP ban checker
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Only check IP for API endpoints and root
    if (req.path.startsWith('/api/') || req.path === '/' || req.path.endsWith('.html')) {
      const ip = getClientIp(req);
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const record = trackIpVisitor(ip, userAgent);

      // If banned and calling API (except public status check)
      if (record.isBanned && !req.path.includes('/api/status')) {
        return res.status(403).json({
          banned: true,
          ip,
          reason: record.banReason || 'Alamat IP Anda telah diblokir oleh Admin Kelas 7.1',
          bannedAt: record.bannedAt
        });
      }
    }
    next();
  });

  // --- Public APIs ---

  // Check current client IP & ban status
  app.get('/api/status', (req: Request, res: Response) => {
    const ip = getClientIp(req);
    const userAgent = (req.headers['user-agent'] as string) || 'Unknown';
    const record = trackedIPs.get(ip);

    res.json({
      ip,
      userAgent,
      isBanned: record ? record.isBanned : false,
      banReason: record?.banReason,
      bannedAt: record?.bannedAt,
      timestamp: new Date().toISOString()
    });
  });

  // Get current class content
  app.get('/api/content', (_req: Request, res: Response) => {
    res.json(classData);
  });

  // Admin login endpoint
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const ip = getClientIp(req);
    const { password } = req.body;
    const userAgent = (req.headers['user-agent'] as string) || 'Unknown';

    if (validateAdminPassword(password)) {
      // Success
      const token = `adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      adminTokens.add(token);

      const record = trackedIPs.get(ip);
      if (record) {
        record.failedLoginAttempts = 0;
      }

      logSecurityEvent(
        ip,
        'admin_login_success',
        'normal',
        'Otentikasi Admin Yamasy BERHASIL. Sesi kontrol diaktifkan.',
        userAgent
      );

      return res.json({
        success: true,
        token,
        message: 'Akses diterima! Selamat datang Admin Yamasy.'
      });
    }

    // Failed password
    const record = trackedIPs.get(ip);
    const failures = (record?.failedLoginAttempts || 0) + 1;
    if (record) {
      record.failedLoginAttempts = failures;
    }

    const severity = failures >= 3 ? 'danger' : 'warning';
    logSecurityEvent(
      ip,
      'admin_login_fail',
      severity,
      `PERINGATAN KEAMANAN: Percobaan login admin GAGAL dengan sandi salah. Percobaan ke-${failures}.`,
      userAgent
    );

    // Auto-ban if >= 5 failed attempts
    if (failures >= 5 && record) {
      record.isBanned = true;
      record.banReason = 'Otomatis diblokir: Lebih dari 5 kali percobaan pembobolan sandi admin.';
      record.bannedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      logSecurityEvent(
        ip,
        'ip_ban',
        'danger',
        `BLOKIR OTOMATIS: IP ${ip} diblokir permanen karena upaya akses ilegal berulang.`,
        userAgent
      );
    }

    return res.status(401).json({
      success: false,
      message: 'Sandi salah! Peringatan: Hanya admin kelas 7.1 yang memiliki hak akses.',
      remainingAttempts: Math.max(0, 5 - failures)
    });
  });

  // --- Admin Protected APIs Middleware ---
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    if (!token || !adminTokens.has(token)) {
      const ip = getClientIp(req);
      logSecurityEvent(
        ip,
        'suspicious',
        'danger',
        `Upaya akses endpoint terproteksi (${req.path}) tanpa token admin valid.`,
        req.headers['user-agent'] as string
      );
      return res.status(401).json({ error: 'Sesi admin tidak valid atau telah kedaluwarsa.' });
    }
    next();
  };

  // Verify active session
  app.get('/api/admin/verify', requireAdmin, (_req: Request, res: Response) => {
    res.json({ valid: true });
  });

  // Update class content
  app.post('/api/admin/content', requireAdmin, (req: Request, res: Response) => {
    const ip = getClientIp(req);
    const updated = req.body;
    if (!updated || !updated.info || !updated.schedule) {
      return res.status(400).json({ error: 'Format data konten tidak valid.' });
    }

    classData = updated;
    persistData();

    logSecurityEvent(
      ip,
      'content_update',
      'normal',
      'Admin Yamasy memperbarui data konten website kelas (jadwal/pengumuman/struktur).',
      req.headers['user-agent'] as string
    );

    res.json({ success: true, message: 'Konten kelas berhasil diperbarui dan disimpan.' });
  });

  // Get tracked IPs
  app.get('/api/admin/ips', requireAdmin, (_req: Request, res: Response) => {
    const list = Array.from(trackedIPs.values()).sort(
      (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
    );
    res.json(list);
  });

  // Ban IP address
  app.post('/api/admin/ban', requireAdmin, (req: Request, res: Response) => {
    const adminIp = getClientIp(req);
    const { targetIp, reason } = req.body;

    if (!targetIp) {
      return res.status(400).json({ error: 'Alamat IP target wajib diisi.' });
    }

    const normalized = cleanIp(targetIp);
    let record = trackedIPs.get(normalized);
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (!record) {
      record = {
        ip: normalized,
        firstSeen: nowIso,
        lastSeen: nowIso,
        visitCount: 0,
        isBanned: true,
        banReason: reason || 'Diblokir oleh Admin Kelas 7.1',
        bannedAt: nowIso,
        failedLoginAttempts: 0
      };
      trackedIPs.set(normalized, record);
    } else {
      record.isBanned = true;
      record.banReason = reason || 'Diblokir oleh Admin Kelas 7.1';
      record.bannedAt = nowIso;
    }

    persistData();

    logSecurityEvent(
      adminIp,
      'ip_ban',
      'danger',
      `TINDAKAN ADMIN: IP ${normalized} berhasil DIBLOKIR. Alasan: "${record.banReason}".`,
      req.headers['user-agent'] as string
    );

    res.json({ success: true, message: `IP ${normalized} berhasil diblokir.`, record });
  });

  // Unban IP address
  app.post('/api/admin/unban', requireAdmin, (req: Request, res: Response) => {
    const adminIp = getClientIp(req);
    const { targetIp } = req.body;

    if (!targetIp) {
      return res.status(400).json({ error: 'Alamat IP target wajib diisi.' });
    }

    const normalized = cleanIp(targetIp);
    const record = trackedIPs.get(normalized);

    if (record) {
      record.isBanned = false;
      record.banReason = undefined;
      record.bannedAt = undefined;
      record.failedLoginAttempts = 0;
    }

    persistData();

    logSecurityEvent(
      adminIp,
      'ip_unban',
      'normal',
      `TINDAKAN ADMIN: Pemblokiran untuk IP ${normalized} telah DICABUT.`,
      req.headers['user-agent'] as string
    );

    res.json({ success: true, message: `IP ${normalized} berhasil dibuka kembali.` });
  });

  // Real-time security logs
  app.get('/api/admin/logs', requireAdmin, (_req: Request, res: Response) => {
    res.json(securityLogs);
  });

  // Clear logs
  app.delete('/api/admin/logs', requireAdmin, (req: Request, res: Response) => {
    const adminIp = getClientIp(req);
    securityLogs = [];
    logSecurityEvent(adminIp, 'visit', 'normal', 'Admin mengosongkan arsip log keamanan.');
    persistData();
    res.json({ success: true, message: 'Log berhasil dibersihkan.' });
  });

  // Report suspicious activity from client
  app.post('/api/report-suspicious', (req: Request, res: Response) => {
    const ip = getClientIp(req);
    const { activity } = req.body;
    logSecurityEvent(
      ip,
      'suspicious',
      'warning',
      `Aktivitas mencurigakan di sisi klien: ${activity || 'Pola interaksi mencurigakan'}`,
      req.headers['user-agent'] as string
    );
    res.json({ recorded: true });
  });

  // --- Vite / Static Assets Handling ---
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Kelas 7.1 Server] Running on http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
