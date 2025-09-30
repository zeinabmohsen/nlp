const {
  BASE_SUGGESTIONS,
  resourceLibrary,
  irrigationAdvice,
  wateringAdvice,
  pestAdvice
} = require('../config/chatbotConfig');
const { cropKnowledgeBase } = require('../data/crops');

function buildResponse({ intent, reply, confidence, suggestions = BASE_SUGGESTIONS }) {
  return {
    intent,
    reply,
    confidence,
    suggestions
  };
}

function findCrop(normalizedText) {
  return cropKnowledgeBase.find((crop) =>
    crop.keywords.some((keyword) => normalizedText.includes(keyword))
  );
}

function handlePlantingSchedule(normalizedText) {
  const crop = findCrop(normalizedText);

  if (crop) {
    const reply = [
      `التوجيه الرسمي لمحصول ${crop.name}: ${crop.schedule}`,
      `نصيحة لبنانية من أهل الخبرة: ${crop.tips}`,
      'وإذا حابب جدول ري أو تسميد مفصل لمنطقتك، بس قول لي.'
    ].join('\n');
    return buildResponse({ intent: 'planting_schedule', reply, confidence: 0.92 });
  }

  const reply = 'سمّيلي المحصول وحدد المنطقة (مثل البقاع الغربي، عكار، صيدا) لزوّدك بمواعيد الزراعة والشتل الرسمية ومع خبرة المزارعين بلبنان.';
  return buildResponse({ intent: 'planting_schedule', reply, confidence: 0.6 });
}

function handleResources() {
  const links = resourceLibrary
    .map((entry, index) => `${index + 1}. ${entry.title}: ${entry.url}`)
    .join('\n');

  const reply = `إليك مصادر لبنانية وإقليمية موثوقة:\n${links}`;
  return buildResponse({ intent: 'resources', reply, confidence: 0.9 });
}

function handleIrrigationAdvice() {
  return buildResponse({ intent: 'irrigation_best_practices', reply: irrigationAdvice, confidence: 0.9 });
}

function handleWateringGuidance() {
  return buildResponse({ intent: 'watering_guidance', reply: wateringAdvice, confidence: 0.88 });
}

function handlePestManagement() {
  return buildResponse({ intent: 'pest_management', reply: pestAdvice, confidence: 0.82 });
}

function handleGratitude() {
  const reply = 'ولا يهمك! واجبي إسندك بالزراعة بلبنان، وإذا احتجت شي تاني بس ناديني.';
  return buildResponse({ intent: 'gratitude_ack', reply, confidence: 0.75 });
}

function handleGoodbye() {
  const reply = 'الله معك! إذا خطر عبالك أي سؤال عن الزراعة بلبنان، رجّع مرق لعندي بوقت بتحبّه.';
  return buildResponse({ intent: 'goodbye', reply, confidence: 0.7 });
}

function handleGratitudeGoodbye() {
  const reply = 'شكرا إلك وإلى اللقاء! إن شاء الله موسمك يكون موفّق، وأنا موجود إذا احتجت أي مساعدة إضافية.';
  return buildResponse({ intent: 'gratitude_goodbye', reply, confidence: 0.75 });
}

function buildGreetingResponse() {
  const reply = 'أهلًا وسهلًا! تشرفنا فيك، جاهز قدّم لك إرشادات الزراعة بلبنان . شو سؤالك؟';
  return buildResponse({ intent: 'greeting', reply, confidence: 0.7 });
}

function getFallbackResponse(messageProvided) {
  const reply = messageProvided
    ? 'بعدني ما استوعبت السؤال. جرب تقلّي شو المحصول أو الخدمة الزراعية يلي عم تدور عليها بلبنان، متل مواعيد الزراعة، الري، أو روابط إرشادية.'
    : 'أهلا وسهلا! بس تبعتلي سؤالك الزراعي بلبنان بخبرك بالتفصيل، من الرسمي للخبرة اليومية.';

  return buildResponse({ intent: 'fallback', reply, confidence: 0.25 });
}

module.exports = {
  buildResponse,
  findCrop,
  handlePlantingSchedule,
  handleResources,
  handleIrrigationAdvice,
  handleWateringGuidance,
  handlePestManagement,
  handleGratitude,
  handleGoodbye,
  handleGratitudeGoodbye,
  buildGreetingResponse,
  getFallbackResponse
};
