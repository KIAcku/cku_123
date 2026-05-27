/**
 * 중앙 API 설정 — 모든 페이지에서 이 파일의 API_BASE와 헬퍼 함수를 사용
 * localhost 하드코딩 대신 환경변수(NEXT_PUBLIC_API_URL) 사용
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/** 인증 토큰 헤더 반환 */
export const authHeaders = (contentType = true): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (contentType) headers['Content-Type'] = 'application/json';
  return headers;
};

/** 토큰만 헤더 반환 (Content-Type 없이) */
export const tokenHeaders = (): Record<string, string> => authHeaders(false);

/** 현재 로그인 유저 정보 */
export const getCurrentUser = (): any | null => {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};

/** 현재 로그인 유저 ID */
export const getCurrentUserId = (): string => getCurrentUser()?.id || '';

/** API fetch 래퍼 — 에러 처리 포함 */
export const apiFetch = async (
  path: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, options);
  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return res;
};
