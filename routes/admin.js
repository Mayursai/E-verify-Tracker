const express = require('express');
const db = require('../db/postgres');
const { requireAuth, requireRole } = require('./middleware');

const router = express.Router();

function toFieldJson(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    required: row.required,
    options: row.options || undefined,
  };
}

// All authenticated users can read fields (employees need them to render the form)
router.get('/fields', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM custom_fields ORDER BY id');
    res.json({ fields: result.rows.map(toFieldJson) });
  } catch (error) {
    console.error('List fields error:', error);
    res.status(500).json({ error: 'Failed to load fields' });
  }
});

router.post('/fields', requireRole('hr'), async (req, res) => {
  const { name, type, required, options } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Field name is required' });
  }
  const fieldType = ['text', 'textarea', 'select'].includes(type) ? type : 'text';
  if (fieldType === 'select' && (!Array.isArray(options) || options.length === 0)) {
    return res.status(400).json({ error: 'Select fields require at least one option' });
  }

  try {
    const result = await db.query(
      `INSERT INTO custom_fields (name, type, required, options)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [String(name).trim(), fieldType, Boolean(required), fieldType === 'select' ? JSON.stringify(options) : null]
    );
    res.status(201).json({ field: toFieldJson(result.rows[0]) });
  } catch (error) {
    console.error('Create field error:', error);
    res.status(500).json({ error: 'Failed to create field' });
  }
});

router.delete('/fields/:id', requireRole('hr'), async (req, res) => {
  const fieldId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(fieldId) || fieldId < 1) {
    return res.status(404).json({ error: 'Field not found' });
  }
  try {
    const result = await db.query('DELETE FROM custom_fields WHERE id = $1 RETURNING id', [fieldId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Field not found' });
    }
    res.json({ message: 'Field deleted' });
  } catch (error) {
    console.error('Delete field error:', error);
    res.status(500).json({ error: 'Failed to delete field' });
  }
});

router.get('/stats', requireRole('hr'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE request_status = 'pending')::int AS pending,
        COUNT(*) FILTER (WHERE request_status = 'inprogress')::int AS inprogress,
        COUNT(*) FILTER (WHERE request_status = 'approved')::int AS approved,
        COUNT(*) FILTER (WHERE request_status = 'denied')::int AS denied,
        COUNT(*) FILTER (WHERE request_status = 'completed')::int AS completed
      FROM requests
    `);
    res.json({ stats: result.rows[0] });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

module.exports = router;
