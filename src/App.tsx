import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { PublicView } from './components/PublicView.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { ContentEditor } from './components/ContentEditor.tsx';
import { SecurityCenter } from './components/SecurityCenter.tsx';
import { BannedScreen } from './components/BannedScreen.tsx';
import { initialClassData } from './data/initialData.ts';
import type { ClassData, TrackedIP, SecurityLog } from './types/index.ts';

type ViewMode = 'public' | 'dashboard' | 'content_editor' | 'security_center';

export default function App() {
  const [classData, setClassData] = useState<ClassData>(initialClassData);
  const [viewMode, setViewMode] = useState<ViewMode>('public');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState<string>('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Client IP & ban detection
  const [clientIp, setClientIp] = useState<string>('127.0.0.1');
  const [isBanned, setIsBanned] = useState<boolean>(false);
  const [banReason, setBanReason] = useState<string | undefined>(undefined);
  const [bannedAt, setBannedAt] = useState<string | undefined>(undefined);

  // Admin security datasets
  const [trackedIps, setTrackedIps] = useState<TrackedIP[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);

  // 1. Check IP status and ban on load
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setClientIp(data.ip || '127.0.0.1');
        setIsBanned(!!data.isBanned);
        setBanReason(data.banReason);
        setBannedAt(data.bannedAt);
      }
    } catch {
      // Fallback
    }
  }, []);

  // 2. Load class content
  const loadContent = useCallback(async () => {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const data = await res.json();
        if (data && data.info) {
          setClassData(data);
        }
      }
    } catch {
      // Keep initial
    }
  }, []);

  // 3. Load admin data (IPs and Logs)
  const loadAdminData = useCallback(async (token: string) => {
    if (!token) return;
    try {
      const [ipsRes, logsRes] = await Promise.all([
        fetch('/api/admin/ips', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/admin/logs', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (ipsRes.ok) {
        const ips = await ipsRes.json();
        setTrackedIps(ips);
      }
      if (logsRes.ok) {
        const logs = await logsRes.json();
        setSecurityLogs(logs);
      }
    } catch {
      // Error handling
    }
  }, []);

  useEffect(() => {
    checkStatus();
    loadContent();

    // Check stored admin session
    const savedToken = localStorage.getItem('yamasy_admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
      setIsAdmin(true);
      loadAdminData(savedToken);
    }
  }, [checkStatus, loadContent, loadAdminData]);

  // Handle successful login
  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
    setIsAdmin(true);
    localStorage.setItem('yamasy_admin_token', token);
    setIsLoginModalOpen(false);
    setViewMode('dashboard');
    loadAdminData(token);
  };

  // Handle logout
  const handleLogout = () => {
    setAdminToken('');
    setIsAdmin(false);
    localStorage.removeItem('yamasy_admin_token');
    setViewMode('public');
  };

  // Save content
  const handleSaveContent = async (updated: ClassData): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setClassData(updated);
        await loadAdminData(adminToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Ban IP
  const handleBanIp = async (targetIp: string, reason: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/ban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ targetIp, reason })
      });
      if (res.ok) {
        await loadAdminData(adminToken);
        await checkStatus();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Unban IP
  const handleUnbanIp = async (targetIp: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/unban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ targetIp })
      });
      if (res.ok) {
        await loadAdminData(adminToken);
        await checkStatus();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Clear Logs
  const handleClearLogs = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/logs', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      if (res.ok) {
        await loadAdminData(adminToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Refresh admin data
  const handleRefreshAdminData = async () => {
    if (adminToken) {
      await loadAdminData(adminToken);
    }
    await checkStatus();
  };

  // If visitor is currently banned
  if (isBanned && !isAdmin) {
    return (
      <BannedScreen
        ip={clientIp}
        reason={banReason}
        bannedAt={bannedAt}
        onRefresh={checkStatus}
      />
    );
  }

  // Render view depending on viewMode
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-mono selection:bg-zinc-800 selection:text-white">
      {/* 1. Content Editor Screen */}
      {viewMode === 'content_editor' && (
        <ContentEditor
          data={classData}
          adminToken={adminToken}
          onSave={handleSaveContent}
          onBackToDashboard={() => setViewMode('dashboard')}
        />
      )}

      {/* 2. Security Center Screen (Cek IP, Ban IP, Real-time Logs) */}
      {viewMode === 'security_center' && (
        <SecurityCenter
          adminToken={adminToken}
          adminIp={clientIp}
          trackedIps={trackedIps}
          securityLogs={securityLogs}
          onBanIp={handleBanIp}
          onUnbanIp={handleUnbanIp}
          onRefreshData={handleRefreshAdminData}
          onClearLogs={handleClearLogs}
          onBackToDashboard={() => setViewMode('dashboard')}
        />
      )}

      {/* 3. Admin Dashboard Screen */}
      {viewMode === 'dashboard' && (
        <AdminDashboard
          classData={classData}
          adminIp={clientIp}
          trackedIps={trackedIps}
          securityLogs={securityLogs}
          onOpenContentEditor={() => setViewMode('content_editor')}
          onOpenSecurityCenter={() => setViewMode('security_center')}
          onBackToPublic={() => setViewMode('public')}
          onLogout={handleLogout}
        />
      )}

      {/* 4. Public Web View Screen */}
      {viewMode === 'public' && (
        <>
          <Navbar
            info={classData.info}
            isAdmin={isAdmin}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onEnterDashboard={() => setViewMode('dashboard')}
            onLogout={handleLogout}
          />
          <PublicView data={classData} clientIp={clientIp} />
        </>
      )}

      {/* Secret Password Modal triggered from Yamasy's photo */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        clientIp={clientIp}
      />
    </div>
  );
}
