const {
  PLANTING_KEYWORDS,
  RESOURCE_KEYWORDS,
  WATERING_KEYWORDS,
  IRRIGATION_KEYWORDS,
  PEST_KEYWORDS,
  GREETING_KEYWORDS,
  GRATITUDE_KEYWORDS,
  GOODBYE_KEYWORDS
} = require('../config/chatbotConfig');
const {
  handleResources,
  handleIrrigationAdvice,
  handleWateringGuidance,
  handlePestManagement,
  handlePlantingSchedule,
  buildGreetingResponse,
  handleGratitude,
  handleGoodbye,
  handleGratitudeGoodbye,
  getFallbackResponse,
  findCrop
} = require('./handlers');

function textContainsAny(text, keywords) {
  if (!text) {
    return false;
  }

  const tokens = new Set(text.split(/\s+/));

  return keywords.some((keyword) => {
    const trimmed = keyword.trim();

    if (!trimmed) {
      return false;
    }

    if (trimmed.includes(' ')) {
      return text.includes(trimmed);
    }

    return tokens.has(trimmed);
  });
}

function detectIntent(normalizedText) {
  if (!normalizedText) {
    return { handler: () => getFallbackResponse(false) };
  }

  if (textContainsAny(normalizedText, RESOURCE_KEYWORDS)) {
    return { handler: handleResources };
  }

  const hasWatering = textContainsAny(normalizedText, WATERING_KEYWORDS);
  const hasIrrigation = textContainsAny(normalizedText, IRRIGATION_KEYWORDS);

  if (hasIrrigation) {
    return { handler: handleIrrigationAdvice };
  }

  if (hasWatering) {
    return { handler: handleWateringGuidance };
  }

  if (textContainsAny(normalizedText, PEST_KEYWORDS)) {
    return { handler: handlePestManagement };
  }

  if (textContainsAny(normalizedText, PLANTING_KEYWORDS) || findCrop(normalizedText)) {
    return { handler: () => handlePlantingSchedule(normalizedText) };
  }

  const hasGratitude = textContainsAny(normalizedText, GRATITUDE_KEYWORDS);
  const hasGoodbye = textContainsAny(normalizedText, GOODBYE_KEYWORDS);

  if (hasGratitude && hasGoodbye) {
    return { handler: handleGratitudeGoodbye };
  }

  if (textContainsAny(normalizedText, GREETING_KEYWORDS)) {
    return { handler: buildGreetingResponse };
  }

  if (hasGratitude) {
    return { handler: handleGratitude };
  }

  if (hasGoodbye) {
    return { handler: handleGoodbye };
  }

  return { handler: () => getFallbackResponse(true) };
}

function mapRasaIntent(intentName, normalizedText) {
  switch (intentName) {
    case 'planting_schedule':
    case 'planting':
    case 'crop_schedule':
      return handlePlantingSchedule(normalizedText);
    case 'watering_guidance':
    case 'watering':
    case 'watering_plan':
      return handleWateringGuidance();
    case 'irrigation_best_practices':
    case 'irrigation':
      return handleIrrigationAdvice();
    case 'resources':
    case 'provide_resources':
      return handleResources();
    case 'pest_management':
    case 'pests':
      return handlePestManagement();
    case 'greeting':
    case 'greet':
      return buildGreetingResponse();
    case 'gratitude':
    case 'thanks':
      return handleGratitude();
    case 'goodbye':
    case 'farewell':
      return handleGoodbye();
    case 'gratitude_goodbye':
    case 'thanks_goodbye':
      return handleGratitudeGoodbye();
    default:
      return null;
  }
}

module.exports = {
  detectIntent,
  mapRasaIntent,
  textContainsAny
};
