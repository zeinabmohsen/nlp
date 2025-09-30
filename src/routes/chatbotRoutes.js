const express = require('express');
const { getResponse } = require('../services/chatbotService');
const { getStats } = require('../services/analytics');
const { EXAMPLE_PROMPTS } = require('../config/chatbotConfig');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    message: 'أرسل طلب POST إلى /api/chat مع الحقل message لتحصل على رد زراعي لبناني مخصص.'
  });
});

router.post('/', async (req, res, next) => {
  try {
    const { message } = req.body || {};

    if (!message || (typeof message === 'string' && !message.trim())) {
      return res.status(400).json({
        error: 'يُرجى إرسال نص في الحقل message حتى أقدر أعطيك الإرشاد المناسب.'
      });
    }

    const response = await getResponse(message);
    return res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/stats', (_req, res) => {
  res.json({ intents: getStats() });
});

router.get('/examples', (_req, res) => {
  res.json({ examples: EXAMPLE_PROMPTS });
});

module.exports = router;
