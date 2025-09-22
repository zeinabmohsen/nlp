const express = require('express');
const cors = require('cors');
const { getResponse } = require('./services/chatbotService');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.json({
    message: 'مرحبا بك في واجهة الدردشة الزراعية العربية. استخدم POST /api/chat مع حقل message لطرح سؤالك.'
  });
});

app.post('/api/chat', (req, res) => {
  const { message } = req.body || {};

  if (!message || (typeof message === 'string' && !message.trim())) {
    return res.status(400).json({
      error: 'الرجاء إرسال رسالة نصية باللغة العربية في الحقل message.'
    });
  }

  const response = getResponse(message);
  return res.json(response);
});

app.use((err, _req, res, _next) => {
  console.error('حدث خطأ غير متوقع:', err);
  res.status(500).json({ error: 'حدث خطأ غير متوقع. حاول مرة أخرى لاحقًا.' });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚜  خادم الدردشة يعمل على المنفذ ${PORT}`);
  });
}

module.exports = app;
