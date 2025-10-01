// server.js (or api/index.js if you deploy this exact file to Vercel)
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const chatbotRoutes = require('./routes/chatbotRoutes');
const alertRoutes = require('./routes/alertRoutes');
const whatsappWebhook = require('./routes/whatsappWebhook');

const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health
app.get('/', (_req, res) => {
  res.json({
    message:
      'واجهة الإرشاد الزراعي اللبناني جاهزة. استخدم مسار /api/chat لإرسال أسئلتك.'
  });
});

// Routes
app.use('/webhooks/whatsapp', whatsappWebhook);
app.use('/api/chat', chatbotRoutes);
app.use('/api/alerts', alertRoutes);

// Error handler
app.use((err, _req, res, _next) => {
  console.error('خطأ غير متوقع أثناء معالجة الطلب:', err);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'حدث خطأ غير متوقع أثناء معالجة الطلب. حاول مرة أخرى لاحقًا.' });
});

const PORT = process.env.PORT || 3000;

/**
 * === Dual mode ===
 * - Local run: `node server.js` -> starts HTTP listener
 * - Vercel: file is imported; we export a handler Vercel will invoke
 */

// 1) Export a handler for Vercel
const handler = (req, res) => app(req, res);
module.exports = handler;        // Vercel uses this
module.exports.app = app;        // Optional: so tests/other files can import the app

// 2) Start server only when run directly (local/dev)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Agriculture advisory server listening on http://localhost:${PORT}`);
  });
}
