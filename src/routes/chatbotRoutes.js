const express = require('express');
const { getResponse } = require('../services/chatbotService');
const { getStats } = require('../services/analytics');
const { EXAMPLE_PROMPTS } = require('../config/chatbotConfig');
const { sendTemplateMessage } = require('../services/whatsappService');

const router = express.Router();

const WHATSAPP_TEMPLATE_RECIPIENT = '96176002723';
const DEFAULT_TEMPLATE_LANGUAGE = 'en_US';
const DEFAULT_TEMPLATE_NAME = 'hello_world';

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

router.post('/send-template', async (req, res) => {
  try {
    const { templateName, languageCode, components } = req.body || {};
    const inputName = typeof templateName === 'string' ? templateName.trim() : '';
    const normalizedName = inputName || DEFAULT_TEMPLATE_NAME;

    if (!normalizedName) {
      return res.status(500).json({
        error: 'Default WhatsApp template name is not configured on the server.'
      });
    }

    const normalizedLanguage =
      typeof languageCode === 'string' && languageCode.trim()
        ? languageCode.trim()
        : DEFAULT_TEMPLATE_LANGUAGE;

    const preparedComponents = Array.isArray(components) ? components : undefined;

    const apiResponse = await sendTemplateMessage({
      to: WHATSAPP_TEMPLATE_RECIPIENT,
      templateName: normalizedName,
      languageCode: normalizedLanguage,
      components: preparedComponents
    });

    const messageId = apiResponse?.messages?.[0]?.id || null;

    return res.json({
      sent: true,
      messageId,
      response: apiResponse
    });
  } catch (error) {
    console.error('Failed to send template message:', error);
    const message =
      (error && error.message) || 'Unknown error while sending template message.';
    const status = message.startsWith('Missing ') ? 500 : 502;

    const body = {
      error:
        status === 500 ? message : 'Failed to send template message via WhatsApp API.'
    };

    if (status !== 500) {
      body.details = message;
    }

    return res.status(status).json(body);
  }
});

router.get('/stats', (_req, res) => {
  res.json({ intents: getStats() });
});

router.get('/examples', (_req, res) => {
  res.json({ examples: EXAMPLE_PROMPTS });
});

module.exports = router;
