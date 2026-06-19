export const DEMO_MODE_STORAGE_KEY = 'grabdesk_demo_mode';

export const DEMO_CREDENTIALS = {
  email: 'demo@grabdesk.io',
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
  localStorage.removeItem('grabdesk_demo_logged_in');
}
