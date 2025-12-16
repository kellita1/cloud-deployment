require('dotenv').config();
const db = require('./models');
const { ContactMessage } = db;

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Sync DB when starting the server
db.sequelize.sync()
  .then(() => {
    console.log('Database synced');
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Sync error:', err);
    process.exit(1);
  });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes

// Serve Admin Page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Health Check
app.get('/health', async (req, res) => {
  try {
    await db.sequelize.authenticate();
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
    const messages = await ContactMessage.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(messages);
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
    const message = await ContactMessage.findByPk(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    await message.update({ status });
    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});