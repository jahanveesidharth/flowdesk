export const DEMO_MODE_STORAGE_KEY = 'flowdesk_demo_mode';

export const DEMO_CREDENTIALS = {
  email: 'demo@deskflow.io',
  password: 'demo1234',
};

export function isDemoMode() {
  return typeof window !== 'undefined' && localStorage.getItem(DEMO_MODE_STORAGE_KEY) === 'true';
}

export function enterDemoMode() {
  localStorage.setItem(DEMO_MODE_STORAGE_KEY, 'true');
}

export function exitDemoMode() {
  localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
  localStorage.removeItem('flowdesk_demo_logged_in');
}
