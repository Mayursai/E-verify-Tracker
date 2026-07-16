const express = require('express');
const db = require('../db/postgres');
const { requireAuth, requireRole } = require('./middleware');

const router = express.Router();

function toRequestJson(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    startDate: row.start_date instanceof Date
      ? row.start_date.toISOString().split('T')[0]
      : row.start_date,
    status: row.request_status,
    comment: row.comment,
    completedDate: row.completed_date,
    createdAt: row.created_at,
    customFields: row.custom_fields || undefined,
  };
}

// List requests: employees see their own, employer/HR see all
router.get('/', requireAuth, async (req, res) => {
  try {
    const { role, id } = req.session.user;
    const baseQuery = `
      SELECT r.*,
        COALESCE(
          (SELECT jsonb_object_agg(v.field_id, v.value)
           FROM request_field_values v WHERE v.request_id = r.id),
          '{}'::jsonb
        ) AS custom_fields
      FROM requests r
    `;
    const result = role === 'employee'
      ? await db.query(`${baseQuery} WHERE r.user_id = $1 ORDER BY r.created_at DESC`, [id])
      : await db.query(`${baseQuery} ORDER BY r.created_at DESC`);
    res.json({ requests: result.rows.map(toRequestJson) });
  } catch (error) {
    console.error('List requests error:', error);
    res.status(500).json({ error: 'Failed to load requests' });
  }
});

// Get single request
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM requests WHERE id = $1', [req.params.id]);
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ error: 'Request not found' });
    }
    const { role, id } = req.session.user;
    if (role === 'employee' && row.user_id !== id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json({ request: toRequestJson(row) });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Failed to load request' });
  }
});

// Create request (employee only)
router.post('/', requireRole('employee'), async (req, res) => {
  const { name, email, startDate, customFields } = req.body || {};
  if (!name || !email || !startDate) {
    return res.status(400).json({ error: 'Name, email and start date are required' });
  }

  try {
    // Enforce required custom fields
    const fieldsResult = await db.query('SELECT id, name, required FROM custom_fields');
    for (const field of fieldsResult.rows) {
      const value = customFields ? customFields[field.id] : undefined;
      if (field.required && (value === undefined || String(value).trim() === '')) {
        return res.status(400).json({ error: `Field "${field.name}" is required` });
      }
    }

    const insert = await db.query(
      `INSERT INTO requests (user_id, name, email, start_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.session.user.id, name, email, startDate]
    );
    const request = insert.rows[0];

    if (customFields && typeof customFields === 'object') {
      for (const field of fieldsResult.rows) {
        const value = customFields[field.id];
        if (value !== undefined && String(value).trim() !== '') {
          await db.query(
            `INSERT INTO request_field_values (request_id, field_id, value) VALUES ($1, $2, $3)`,
            [request.id, field.id, String(value)]
          );
        }
      }
    }

    res.status(201).json({ request: toRequestJson(request) });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Update status/comment (employer approves/denies, HR can set any status)
router.put('/:id', requireRole('employer', 'hr'), async (req, res) => {
  const { status, comment } = req.body || {};
  const allowed = req.session.user.role === 'employer'
    ? ['approved', 'denied']
    : ['pending', 'approved', 'denied', 'completed'];

  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
  }

  try {
    const result = await db.query(
      `UPDATE requests
       SET request_status = $1,
           comment = COALESCE(NULLIF($2, ''), comment),
           completed_date = CASE WHEN $1 = 'completed' THEN CURRENT_DATE ELSE NULL END
       WHERE id = $3
       RETURNING *`,
      [status, comment || '', req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ request: toRequestJson(result.rows[0]) });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Delete request (HR only)
router.delete('/:id', requireRole('hr'), async (req, res) => {
  try {
    const result = await db.query('DELETE FROM requests WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ message: 'Request deleted' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

module.exports = router;
