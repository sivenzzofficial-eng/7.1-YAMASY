import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanIp,
  validateAdminPassword,
  isIpBanned,
  calculateSeverity,
  filterSecurityLogs
} from './security.ts';
import type { SecurityLog } from '../types/index.ts';

test('cleanIp normalizes diverse IP formats', () => {
  assert.equal(cleanIp('192.168.1.10'), '192.168.1.10');
  assert.equal(cleanIp('::ffff:192.168.1.10'), '192.168.1.10');
  assert.equal(cleanIp('::1'), '127.0.0.1');
  assert.equal(cleanIp('203.0.113.195, 10.0.0.1'), '203.0.113.195');
  assert.equal(cleanIp(undefined), '127.0.0.1');
});

test('validateAdminPassword checks correct secret yamasy-7.1', () => {
  assert.equal(validateAdminPassword('yamasy-7.1'), true);
  assert.equal(validateAdminPassword(' yamasy-7.1 '), true);
  assert.equal(validateAdminPassword('admin'), false);
  assert.equal(validateAdminPassword('yamasy71'), false);
  assert.equal(validateAdminPassword(''), false);
});

test('isIpBanned accurately matches banned IP list', () => {
  const banned = ['192.168.1.50', '203.0.113.5'];
  assert.equal(isIpBanned('192.168.1.50', banned), true);
  assert.equal(isIpBanned('::ffff:192.168.1.50', banned), true);
  assert.equal(isIpBanned('192.168.1.51', banned), false);
  assert.equal(isIpBanned('127.0.0.1', banned), false);
});

test('calculateSeverity elevates warning to danger upon multiple failures', () => {
  assert.equal(calculateSeverity('visit', 0), 'normal');
  assert.equal(calculateSeverity('admin_login_fail', 1), 'warning');
  assert.equal(calculateSeverity('admin_login_fail', 3), 'danger');
  assert.equal(calculateSeverity('ip_ban', 0), 'danger');
});

test('filterSecurityLogs filters by category and search term', () => {
  const sampleLogs: SecurityLog[] = [
    {
      id: '1',
      timestamp: '2026-10-16 10:00:00',
      ip: '192.168.1.1',
      type: 'visit',
      severity: 'normal',
      details: 'Pengunjung membuka halaman beranda'
    },
    {
      id: '2',
      timestamp: '2026-10-16 10:05:00',
      ip: '10.0.0.5',
      type: 'admin_login_fail',
      severity: 'warning',
      details: 'Percobaan login admin gagal dengan sandi salah'
    },
    {
      id: '3',
      timestamp: '2026-10-16 10:06:00',
      ip: '10.0.0.5',
      type: 'ip_ban',
      severity: 'danger',
      details: 'IP 10.0.0.5 diblokir otomatis karena aktivitas mencurigakan'
    }
  ];

  const suspicious = filterSecurityLogs(sampleLogs, 'suspicious');
  assert.equal(suspicious.length, 2);

  const authOnly = filterSecurityLogs(sampleLogs, 'auth');
  assert.equal(authOnly.length, 1);
  assert.equal(authOnly[0].id, '2');

  const searchIp = filterSecurityLogs(sampleLogs, 'all', '10.0.0.5');
  assert.equal(searchIp.length, 2);
});
