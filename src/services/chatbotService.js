const BASE_SUGGESTIONS = [
  'اسأل عن مواعيد زراعة محصول محدد مثل القمح أو الطماطم.',
  'اطلب روابط أو مصادر عربية موثوقة حول موضوع زراعي.',
  'استفسر عن أفضل ممارسات الري أو تسميد التربة.'
];

const cropKnowledgeBase = [
  {
    name: 'القمح',
    keywords: ['قمح'],
    schedule: 'يزرع القمح في المناخات المعتدلة بدايةً من شهر نوفمبر وحتى ديسمبر في معظم مناطق الوطن العربي.',
    tips: 'تأكد من توفر رطوبة كافية خلال مرحلة الإنبات وقلل الري بعد التفريع لمنع الإصابة بالأمراض الفطرية.'
  },
  {
    name: 'الطماطم',
    keywords: ['طماطم', 'بندوره', 'بندورة'],
    schedule: 'يمكن زراعة الطماطم في عروات متعددة، ويُعد مارس-أبريل أفضل فترة للعروة الصيفية، بينما تبدأ العروة الخريفية في أغسطس.',
    tips: 'اختر صنفاً مقاوماً للأمراض ورتب النباتات على مسافات 40-50 سم مع دعم جيد للسيقان.'
  },
  {
    name: 'الزيتون',
    keywords: ['زيتون'],
    schedule: 'تُغرس شتلات الزيتون خلال فترتي الربيع أو الخريف مع مراعاة اعتدال الحرارة وتوفر الرطوبة في التربة.',
    tips: 'احرص على التقليم السنوي الخفيف والتسميد العضوي لتحسين التهوية وإنتاجية الأشجار.'
  }
];

const resourceLibrary = [
  {
    title: 'دليل الري بالتنقيط من منظمة الأغذية والزراعة',
    url: 'https://www.fao.org/3/i1684a/i1684a.pdf'
  },
  {
    title: 'بوابة الإرشاد الزراعي المصرية',
    url: 'https://www.agr-egypt.gov.eg/'
  },
  {
    title: 'منصة المعرفة الزراعية السعودية (مكين)',
    url: 'https://mekin.mewa.gov.sa/'
  }
];

const irrigationAdvice = 'لتحسين كفاءة الري بالتنقيط، تأكد من اختبار جودة المياه، استخدم منظمات الضغط، وجدول الري بناءً على احتياجات المحصول ومرحلة نموه. قم بالصيانة الدورية للخطوط والمرشحات لتجنب الانسداد.';

const pestAdvice = 'للمكافحة المتكاملة للآفات، راقب الحقل بانتظام، استخدم المصائد الفيرمونية عند الحاجة، وفضل المبيدات الحيوية أو العضوية قبل اللجوء للمواد الكيميائية. حافظ على التنوع الحيوي والزراعة المصاحبة لتقليل انتشار الحشرات.';

const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

function normalizeInput(text = '') {
  if (typeof text !== 'string') {
    return '';
  }

  let normalized = text.trim();

  if (!normalized) {
    return '';
  }

  normalized = normalized
    .replace(ARABIC_DIACRITICS, '')
    .replace(/\u0640/g, '') // تطويل
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');

  normalized = normalized
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}

function findCrop(normalizedText) {
  return cropKnowledgeBase.find((crop) =>
    crop.keywords.some((keyword) => normalizedText.includes(keyword))
  );
}

function buildResponse({ intent, reply, confidence }) {
  return {
    intent,
    reply,
    confidence,
    suggestions: BASE_SUGGESTIONS
  };
}

function handlePlantingSchedule(normalizedText) {
  const crop = findCrop(normalizedText);

  if (crop) {
    const reply = `أفضل موعد لزراعة ${crop.name} هو: ${crop.schedule}\nنصيحة إضافية: ${crop.tips}`;
    return buildResponse({ intent: 'planting_schedule', reply, confidence: 0.92 });
  }

  const reply = 'لم أتعرف على اسم المحصول، لكن القاعدة العامة أن تتم الزراعة في مواسم معتدلة مع مراعاة احتياجات التربة والري لكل محصول.';
  return buildResponse({ intent: 'planting_schedule', reply, confidence: 0.65 });
}

function handleResources() {
  const links = resourceLibrary
    .map((entry, index) => `${index + 1}. ${entry.title}: ${entry.url}`)
    .join('\n');

  const reply = `إليك بعض المصادر العربية الموثوقة:\n${links}`;
  return buildResponse({ intent: 'resources', reply, confidence: 0.9 });
}

function handleIrrigationAdvice() {
  return buildResponse({ intent: 'irrigation_best_practices', reply: irrigationAdvice, confidence: 0.85 });
}

function handlePestManagement() {
  return buildResponse({ intent: 'pest_management', reply: pestAdvice, confidence: 0.8 });
}

function getFallbackResponse(messageProvided) {
  const reply = messageProvided
    ? 'لم أفهم سؤالك تمامًا. يمكنك مثلاً أن تسأل عن مواعيد زراعة محصول محدد أو أن تطلب روابط إرشادية حول موضوع زراعي.'
    : 'مرحبًا! الرجاء كتابة سؤالك باللغة العربية حول موضوع زراعي لمساعدتك.';

  return buildResponse({ intent: 'fallback', reply, confidence: 0.25 });
}

function detectIntent(normalizedText) {
  if (!normalizedText) {
    return { handler: () => getFallbackResponse(false) };
  }

  const containsPlanting = /(زراعه|زراعة|غرس|بذر|موعد|مواعيد|متى)/.test(normalizedText);
  if (containsPlanting) {
    return { handler: () => handlePlantingSchedule(normalizedText) };
  }

  const containsResourceKeywords = /(مصادر|رابط|روابط|دليل|مرجع|pdf|ملف|كتيب)/.test(normalizedText);
  if (containsResourceKeywords) {
    return { handler: handleResources };
  }

  const containsIrrigation = /(افضل طرق الري|الري بالتنقيط|(?:^|\s)(?:ري|الري|سقي|تنقيط)(?:\s|$))/.test(normalizedText);
  if (containsIrrigation) {
    return { handler: handleIrrigationAdvice };
  }

  const containsPest = /(آفات|افات|حشرات|مكافحة|مبيد|حشره)/.test(normalizedText);
  if (containsPest) {
    return { handler: handlePestManagement };
  }

  const containsGreeting = /(مرحبا|اهلا|السلام عليكم|صباح الخير|مساء الخير)/.test(normalizedText);
  if (containsGreeting) {
    const reply = 'أهلاً بك! كيف يمكنني مساعدتك في استفسارات الزراعة اليوم؟';
    return { handler: () => buildResponse({ intent: 'greeting', reply, confidence: 0.7 }) };
  }

  return { handler: () => getFallbackResponse(true) };
}

function getResponse(message) {
  const normalizedText = normalizeInput(message);
  const { handler } = detectIntent(normalizedText);
  return handler();
}

module.exports = {
  getResponse,
  normalizeInput,
  detectIntent
};
