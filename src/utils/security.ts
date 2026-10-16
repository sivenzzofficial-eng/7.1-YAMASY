import type { SecurityLog } from '../types/index.ts';

/**
 * Normalizes raw IP addresses from various headers and formats.
 */
export function cleanIp(rawIp: string | undefined | null): string {
  if (!rawIp) return '127.0.0.1';
  // If comma separated (e.g. from x-forwarded-for: client, proxy1, proxy2)
  let ip = rawIp.split(',')[0].trim();
  // Strip IPv6 prefix ::ffff:
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  // Convert IPv6 loopback to 127.0.0.1 for cleaner display if desired
  if (ip === '::1') {
    return '127.0.0.1';
  }
  return ip;
}

/**
 * Validates the admin secret password for Kelas 7.1.
 * Password requirement as per brief: yamasy-7.1
 */
export function validateAdminPassword(password: string): boolean {
  if (typeof password !== 'string') return false;
  return password.trim() === 'yamasy-7.1';
}

/**
 * Checks if a given IP address is present in the banned list.
 */
export function isIpBanned(ip: string, bannedList: string[]): boolean {
  if (!ip) return false;
  const normalized = cleanIp(ip);
  return bannedList.some((banned) => cleanIp(banned) === normalized);
}

/**
 * Determines log severity based on event type and consecutive failures.
 */
export function calculateSeverity(
  type: SecurityLog['type'],
  failedAttempts: number
): 'normal' | 'warning' | 'danger' {
  if (type === 'ip_ban') return 'danger';
  if (type === 'admin_login_fail' || type === 'suspicious') {
    return failedAttempts >= 3 ? 'danger' : 'warning';
  }
  return 'normal';
}

/**
 * Filter logs by search term or category.
 */
export function filterSecurityLogs(
  logs: SecurityLog[],
  categoryFilter: 'all' | 'suspicious' | 'auth' | 'ip',
  searchQuery = ''
): SecurityLog[] {
  const query = searchQuery.toLowerCase().trim();

  return logs.filter((log) => {
    // Category match
    let matchesCategory = true;
    if (categoryFilter === 'suspicious') {
      matchesCategory = log.severity === 'warning' || log.severity === 'danger' || log.type === 'suspicious';
    } else if (categoryFilter === 'auth') {
      matchesCategory = log.type === 'admin_login_fail' || log.type === 'admin_login_success';
    } else if (categoryFilter === 'ip') {
      matchesCategory = log.type === 'ip_ban' || log.type === 'ip_unban';
    }

    if (!matchesCategory) return false;

    if (!query) return true;

    return (
      log.ip.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query) ||
      log.type.toLowerCase().includes(query)
    );
  });
}
