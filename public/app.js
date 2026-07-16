const API_BASE = '/api';

const DASHBOARD_BY_ROLE = {
  employee: '/employee-dashboard.html',
  employer: '/employer-dashboard.html',
  hr: '/hr-dashboard.html',
};

async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

async function requireAuth(allowedRoles) {
  try {
    const data = await apiFetch('/auth/me');
    const user = data.user;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      window.location.href = DASHBOARD_BY_ROLE[user.role] || '/login.html';
      return null;
    }
    return user;
  } catch (err) {
    window.location.href = '/login.html';
    return null;
  }
}

async function logout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch (err) {
    // ignore - redirect regardless
  }
  window.location.href = '/login.html';
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

function statusLabel(status) {
  const s = status || 'pending';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function statusBadge(status) {
  const s = status || 'pending';
  return `<span class="badge badge-${escapeHtml(s)}">${escapeHtml(statusLabel(s))}</span>`;
}

function showAlert(container, message, type = 'error') {
  if (!container) return;
  container.textContent = message;
  container.className = `alert alert-${type}`;
  container.style.display = 'block';
}

function clearAlert(container) {
  if (!container) return;
  container.textContent = '';
  container.style.display = 'none';
}
