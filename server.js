require('dotenv').config();
const db = require('./models');
const { ContactMessage } = db;

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Routes

// Serve Admin Page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Health Check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: err.message });
  }
});

// Create Contact Message
/*app.post('/contact', async (req, res) => {
  const { name, email, subject, message, category } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO contact_messages (name, email, subject, message, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, subject, message, category || 'general']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});*/

app.post('/contact', async (req, res) => {
  try {
    console.log('BODY:', req.body);

    const { name, email, category, subject, message } = req.body;

    const contact = await ContactMessage.create({
      name,
      email,
      category,
      subject,
      message,
      status: 'new',
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('CONTACT ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
});


// Get All Messages
app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Update Message Status
app.put('/messages/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
