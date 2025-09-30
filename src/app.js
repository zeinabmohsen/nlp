const express = require('express');
const cors = require('cors');
const chatbotRoutes = require('./routes/chatbotRoutes');
const whatsappWebhook = require('./routes/whatsappWebhook');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.json({
    message: 'واجهة الإرشاد الزراعي اللبناني جاهزة. استخدم مسار /api/chat لإرسال أسئلتك.'
  });
});

app.use('/webhooks/whatsapp', whatsappWebhook);

app.use('/api/chat', chatbotRoutes);

app.use((err, _req, res, _next) => {
  console.error('خطأ غير متوقع أثناء معالجة الطلب:', err);
  res.status(500).json({ error: 'حدث خطأ غير متوقع أثناء معالجة الطلب. حاول مرة أخرى لاحقًا.' });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Agriculture advisory server listening on port ${PORT}`);
  });
}

module.exports = app;
