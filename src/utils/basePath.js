/**
 * Base path สำหรับ deploy ใต้ subpath (เช่น /shopping)
 * - Production (ideatrade1.com): ใช้ /shopping
 * - Localhost: ใช้ '' เพื่อให้ path เริ่มจาก root
 */
const isProduction =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

export const basePath = isProduction ? '/shopping' : '';
