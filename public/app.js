const API_BASE = '/api';

// ---------- Theme (dark / light) ----------
// The initial theme is applied by an inline script in each page's <head>
// (before first paint) to avoid a flash of the wrong theme.

function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem('theme', next);
  } catch (err) {
    // storage unavailable (private mode) - theme still applies for this page
  }
  applyTheme(next);
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(currentTheme());
  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    btn.addEventListener('click', toggleTheme);
  });
});

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
    const message = (data && data.error) || 'Something went wrong. Please try again.';
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

// Human-friendly status text shown everywhere in the UI.
// (Internal values stay pending/approved/denied/completed.)
const STATUS_LABELS = {
  pending: 'Applied',
  approved: 'Approved',
  denied: 'Rejected',
  completed: 'Completed',
};

function statusLabel(status) {
  const s = status || 'pending';
  return STATUS_LABELS[s] || (s.charAt(0).toUpperCase() + s.slice(1));
}

function statusBadge(status) {
  const s = status || 'pending';
  return `<span class="badge badge-${escapeHtml(s)}">${escapeHtml(statusLabel(s))}</span>`;
}

// ---------- Shared "Edit Request" modal ----------
// Used by all three dashboards. Injected into the page on first use.

let editModalOnSaved = null;
let editRequestId = null;

function ensureEditModal() {
  if (document.getElementById('edit-modal')) return;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'edit-modal';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Edit Request</h3>
        <button class="modal-close" id="edit-close-btn" type="button">&times;</button>
      </div>
      <div id="edit-alert" class="alert" style="display:none;"></div>
      <form id="edit-form">
        <div class="form-field">
          <label for="edit-name">Full Name</label>
          <input type="text" id="edit-name" required>
        </div>
        <div class="form-field">
          <label for="edit-email">Email</label>
          <input type="email" id="edit-email" required>
        </div>
        <div class="form-field">
          <label for="edit-start-date">Start Date</label>
          <input type="date" id="edit-start-date" required>
        </div>
        <div id="edit-custom-fields"></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="edit-cancel-btn">Cancel</button>
          <button type="submit" class="btn" id="edit-save-btn">Save Changes</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => {
    overlay.classList.remove('open');
    editRequestId = null;
  };
  document.getElementById('edit-close-btn').addEventListener('click', close);
  document.getElementById('edit-cancel-btn').addEventListener('click', close);

  document.getElementById('edit-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!editRequestId) return;
    const alertBox = document.getElementById('edit-alert');
    const saveBtn = document.getElementById('edit-save-btn');
    clearAlert(alertBox);
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const customFieldValues = {};
    overlay.querySelectorAll('[data-field-id]').forEach((el) => {
      customFieldValues[el.dataset.fieldId] = el.value;
    });

    try {
      await apiFetch(`/requests/${editRequestId}/details`, {
        method: 'PUT',
        body: JSON.stringify({
          name: document.getElementById('edit-name').value.trim(),
          email: document.getElementById('edit-email').value.trim(),
          startDate: document.getElementById('edit-start-date').value,
          customFields: customFieldValues,
        }),
      });
      close();
      if (editModalOnSaved) await editModalOnSaved();
    } catch (err) {
      showAlert(alertBox, err.message || 'Failed to save changes');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
    }
  });
}

function openEditModal(request, customFields, onSaved) {
  ensureEditModal();
  editRequestId = request.id;
  editModalOnSaved = onSaved;

  clearAlert(document.getElementById('edit-alert'));
  document.getElementById('edit-name').value = request.name || '';
  document.getElementById('edit-email').value = request.email || '';
  document.getElementById('edit-start-date').value = request.startDate || '';

  const values = request.customFields || {};
  const container = document.getElementById('edit-custom-fields');
  container.innerHTML = (customFields || []).map((field) => {
    const value = escapeHtml(values[field.id] ?? '');
    const requiredAttr = field.required ? 'required' : '';
    const id = `edit-custom-${field.id}`;
    let input;
    if (field.type === 'textarea') {
      input = `<textarea id="${id}" data-field-id="${field.id}" ${requiredAttr}>${value}</textarea>`;
    } else if (field.type === 'select') {
      const options = (field.options || []).map((opt) => {
        const selected = String(opt) === String(values[field.id] ?? '') ? 'selected' : '';
        return `<option value="${escapeHtml(opt)}" ${selected}>${escapeHtml(opt)}</option>`;
      }).join('');
      input = `<select id="${id}" data-field-id="${field.id}" ${requiredAttr}><option value="">Select...</option>${options}</select>`;
    } else {
      input = `<input type="text" id="${id}" data-field-id="${field.id}" value="${value}" ${requiredAttr}>`;
    }
    return `<div class="form-field"><label for="${id}">${escapeHtml(field.name)}${field.required ? ' *' : ''}</label>${input}</div>`;
  }).join('');

  document.getElementById('edit-modal').classList.add('open');
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
