const BASE_SUGGESTIONS = [
  'اسأل عن مواعيد زراعة محصول محدد مثل القمح أو الطماطم.',
  'اطلب روابط أو مصادر عربية موثوقة حول موضوع زراعي.',
  'استفسر عن أفضل ممارسات الري أو تسميد التربة.'
];

const cropKnowledgeBase = [
  {
    name: 'القمح',
    keywords: ['قمح', 'القمح'],
    schedule: 'يفضل زرع القمح في شهري نوفمبر وديسمبر في المناطق المعتدلة، وفي يناير بالمناطق الدافئة لضمان درجات حرارة مناسبة للإنبات.',
    tips: 'احرص على خدمة التربة جيدًا قبل الزراعة، واستخدم بذورًا معتمدة، وراقب مواعيد الري الأولى بعد ظهور البادرات بنحو عشرة أيام.'
  },
  {
    name: 'الطماطم',
    keywords: ['طماطم', 'الطماطم', 'بندوره', 'البندوره'],
    schedule: 'يمكن زراعة الطماطم من فبراير إلى أبريل في الحقول المكشوفة، بينما تمتد الزراعة المحمية من أغسطس حتى أكتوبر لتجنب درجات الحرارة المرتفعة.',
    tips: 'استخدم شتلات قوية، وراعِ التدرج في تعريضها للشمس قبل النقل للحقل، وراقب الرطوبة لتجنب تعفن الجذور.'
  },
  {
    name: 'الذرة',
    keywords: ['ذره', 'الذره', 'ذرة', 'الذرة'],
    schedule: 'أفضل وقت لزراعة الذرة هو من منتصف أبريل حتى نهاية مايو، ويمكن التبكير في المناطق الحارة أو التأخير قليلًا في المناطق الأبرد.',
    tips: 'اهتم بتوفير ري منتظم في مرحلة التزهير وتكوين الحبوب، وتحكم في الحشائش مبكرًا لضمان نموٍ جيد للنبات.'
  }
];

const resourceLibrary = [
  {
    title: 'دليل وزارة الزراعة المصرية لخدمة المحاصيل الحقلية',
    url: 'https://www.agr-egypt.gov.eg/'
  },
  {
    title: 'منصة الفاو للمعرفة الزراعية باللغة العربية',
    url: 'https://www.fao.org/ar/home'
  },
  {
    title: 'بوابة المعرفة الزراعية السعودية (مكن)',
    url: 'https://mekin.mewa.gov.sa/'
  }
];

const irrigationAdvice = 'لري النباتات بفعالية، افحص رطوبة التربة قبل الري وتجنب الإغراق. اسقِ في الصباح الباكر أو المساء لتقليل الفاقد بالتبخر، ووزع المياه قرب منطقة الجذور. استخدم الري بالتنقيط أو الرش الخفيف للمحاصيل الحساسة، وقلل فترات الري في الشتاء مع إبقاء التربة رطبة دون تشبع.';

const pestAdvice = 'لإدارة الآفات، ابدأ بالمراقبة الدورية للنباتات وحدد نوع الإصابة مبكرًا. حافظ على نظافة الحقل وتخلص من بقايا النباتات المصابة، واستخدم المصائد أو المكافحة الحيوية حيثما أمكن. عند الحاجة إلى المبيدات، اختر النوع الموصى به والتزم بالجرعات وفترات الأمان المدونة على الملصق.';

const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

const PLANTING_KEYWORDS = ['زراعه', 'ميعاد الزراعة', 'مواعيد الزراعة', 'موعد الزراعة', 'غرس', 'شتل'];
const RESOURCE_KEYWORDS = ['مصادر', 'روابط', 'دليل', 'ارشادات', 'pdf', 'مراجع', 'المصادر'];
const IRRIGATION_KEYWORDS = ['سقي', 'اسقي', 'ارو', 'الري', 'سقايه', 'سقاية', 'ارواء', 'مياه النباتات', 'تروي', 'ري'];
const PEST_KEYWORDS = ['افات', 'افات النباتات', 'مكافحه', 'مكافحة', 'حشرات', 'مرض النباتات', 'امراض', 'حشرة'];
const GREETING_KEYWORDS = ['مرحبا', 'السلام عليكم', 'اهلا', 'صباح الخير', 'مساء الخير', 'تحية'];

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
    .replace(/\u0640/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .toLowerCase()
    .replace(/[^\u0621-\u064a0-9\s]/g, ' ')
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
    const reply = `بالنسبة لمحصول ${crop.name}: ${crop.schedule}\nنصيحة إضافية: ${crop.tips}`;
    return buildResponse({ intent: 'planting_schedule', reply, confidence: 0.92 });
  }

  const reply = 'يمكنك تحديد اسم المحصول الذي ترغب في معرفة مواعيد زراعته للحصول على تفاصيل أدق، مثل القمح أو الطماطم.';
  return buildResponse({ intent: 'planting_schedule', reply, confidence: 0.6 });
}

function handleResources() {
  const links = resourceLibrary
    .map((entry, index) => `${index + 1}. ${entry.title}: ${entry.url}`)
    .join('\n');

  const reply = `إليك بعض المصادر العربية الموثوقة:\n${links}`;
  return buildResponse({ intent: 'resources', reply, confidence: 0.9 });
}

function handleIrrigationAdvice() {
  return buildResponse({ intent: 'irrigation_best_practices', reply: irrigationAdvice, confidence: 0.88 });
}

function handlePestManagement() {
  return buildResponse({ intent: 'pest_management', reply: pestAdvice, confidence: 0.82 });
}

function getFallbackResponse(messageProvided) {
  const reply = messageProvided
    ? 'لم أفهم سؤالك تمامًا. يمكنك مثلاً أن تسأل عن مواعيد زراعة محصول محدد أو أن تطلب روابط إرشادية حول موضوع زراعي.'
    : 'أهلًا بك! شاركني سؤالك الزراعي لأساعدك بالإجابات المناسبة.';

  return buildResponse({ intent: 'fallback', reply, confidence: 0.25 });
}

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

  if (textContainsAny(normalizedText, IRRIGATION_KEYWORDS)) {
    return { handler: handleIrrigationAdvice };
  }

  if (textContainsAny(normalizedText, PEST_KEYWORDS)) {
    return { handler: handlePestManagement };
  }

  if (textContainsAny(normalizedText, PLANTING_KEYWORDS) || findCrop(normalizedText)) {
    return { handler: () => handlePlantingSchedule(normalizedText) };
  }

  if (textContainsAny(normalizedText, GREETING_KEYWORDS)) {
    const reply = 'أهلًا وسهلًا! كيف يمكنني مساعدتك في سؤالك الزراعي اليوم؟';
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
