/* ==========================================================================
   MindEcho AI 2026 — Main Application Engine (mindecho-ai-113)
   Admin Analytics Dashboard + Full Click Tracking + Scroll/Time Metrics
   ========================================================================== */

// Supabase Configuration
const supabaseUrl = 'https://yslrofsjeujsftlabuqn.supabase.co/rest/v1/analytics_events';
const supabaseKey = 'sb_publishable_tnc4wA3Cr-FtaDyjVz9Q6Q_fklMPSDr';

// Audio Track File Name
const MEDITATION_AUDIO_SRC = "audio/meditation1.mp3";

// Unique session ID for this visit
const SESSION_ID = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();

// Analytics tracking state
const analyticsState = {
  pageStartTime: Date.now(),
  maxScrollDepth: 0,
  engagedTimers: { 30: false, 60: false, 120: false },
  pricingViewed: false
};

// Global Application State
const appState = {
  lang: 'ru',
  isRecording: false,
  mediaRecorder: null,
  recordedChunks: [],
  recordedAudioUrl: null,
  isPlayingAudio: false,
  isAnnualBilling: false,
  selectedPlan: 'Premium',
  selectedPrice: 14.99,
  audioTrack: null,
  currentCustDevScenario: 'burnout',
  signatureCanvas: null,
  signatureCtx: null,
  isDrawingSignature: false
};

// Initialize Signature Canvas & Setup Listeners on Load
document.addEventListener('DOMContentLoaded', () => {
  setupScrollListener();
  registerServiceWorker();
  initAudioPlayer();
  initSignatureCanvas();
  initAnalyticsTracking();

  // Header login button shows email username before @
  const savedEmail = localStorage.getItem('userEmail') || 'get777903@gmail.com';
  const userLogin = savedEmail.split('@')[0];
  const navBtn = document.getElementById('nav-login-btn');
  if (navBtn) {
    navBtn.innerText = `👤 ${userLogin}`;
    navBtn.style.background = 'rgba(34, 197, 94, 0.15)';
    navBtn.style.borderColor = '#22C55E';
    navBtn.style.color = '#22C55E';
  }
});

// Initialize Audio Element
function initAudioPlayer() {
  appState.audioTrack = new Audio(MEDITATION_AUDIO_SRC);

  appState.audioTrack.addEventListener('timeupdate', () => {
    if (appState.audioTrack && appState.audioTrack.duration) {
      const progress = (appState.audioTrack.currentTime / appState.audioTrack.duration) * 100;
      document.getElementById('player-progress').style.width = `${progress}%`;
      
      const currentMin = Math.floor(appState.audioTrack.currentTime / 60);
      const currentSec = Math.floor(appState.audioTrack.currentTime % 60).toString().padStart(2, '0');
      document.getElementById('player-time').innerText = `${currentMin}:${currentSec}`;
    }
  });

  appState.audioTrack.addEventListener('ended', () => {
    appState.isPlayingAudio = false;
    document.getElementById('play-btn').innerText = "▶";
    document.getElementById('player-progress').style.width = "100%";
  });
}

// Internationalization Dictionary (RU, EN, HE)
const translations = {
  ru: {
    nav_mission: "Миссия",
    nav_modes: "Эмоциональная помощь",
    nav_edu_subjects: "📚 Внешкольное обучение",
    nav_edu_pricing: "🎓 Школьные тарифы",
    nav_generator: "Студия",
    nav_pricing: "Тарифы",
    nav_nda: "DISCLAIMER",
    nav_custdev: "🎁 Опрос + подарок",
    btn_login: "Войти",
    sticky_text: "Инвестируйте в гармонию семьи от $7/мес",
    btn_choose_plan: "Выбрать тариф",
    hero_badge: "ИИ + Детская Нейропсихология + КПТ/ACT + Эмоциональная безопасность",
    hero_title: "Превращаем родительскую рутину в <span class=\"text-gradient\">бережную психологическую поддержку</span>",
    hero_subtitle: "Экосистема эмоциональной безопасности семьи и превентивная психологическая поддержка детей родным голосом. Легальный способ сохранить эмоциональные ресурсы родителей и вырастить счастливого ребенка.",
    btn_try_free: "✨ Попробовать! Сказка для расслабления с голосом мамы, папы или бабушки",
    btn_try_free_sub: "мягко растворяет дневной стресс, снятие тревог и развитие эмоционального интеллекта (EQ) ребенка прямо в процессе засыпания .",
    btn_games: "🎮 Игры развивающие речь + эмоциональный интеллект",
    btn_prayer: "🙏 Создание молитвы-медитации",
    trust_privacy: "🛡 Privacy-First (Банковское шифрование)",
    trust_supervisor: "🧠 Валидировано Агентом-Супервизором",
    trust_global: "🌏 платформа для каждого и всего мира",
    hero_card_sub: "Самый родной и успокаивающий голос • Без музыки",
    hero_sample_quote: "\"Закрой глаза и обрати внимание на свой нос... Почувствуй тихую и спокойную радость внутри...\"",
    hero_card_footer: "✨ Персонализированный рассказ для расслабления",
    tag_supermission: "Супермиссия MindEcho AI",
    title_supermission: "Студия Медитации разработка на основе методов детской нейропсихологии",
    sub_supermission: "Мы создаем не просто IT проект, а самую защищенную экосистему для ментального здоровья и эмоциональной безопасности семей во всем мире.",
    m1_title: "1. платформа для каждого и всего мира",
    m1_desc: "Стираем социальное и экономическое неравенство. Платформа доступна даже для малоимущих семей — каждый ребенок имеет право на здоровое эмоциональное развитие. Контур психологической поддержки и развития EQ.",
    m2_title: "2. Гармония в семье и развитие эмоционального интеллекта",
    m2_desc: "Прогрессивные аудиорежимы и геймификация привычек исключают из жизни семьи истерики, упреки и обиды, мягко повышая эмоциональный интеллект (EQ) и укрепляя авторитет родителей.",
    m3_title: "3. Сбережение энергии родителей",
    m3_desc: "Защищаем родителей от выгорания, гарантируя 1–2 часа личного времени в день, а детей — от ментального перенапряжения, сохраняя силы для искренней радости и живого общения на основе практик развивающей нейропсихологии. Одобрено детскими нейропсихологами",
    m3_tag: "Освобождение 1-2 часа личного времени на основе практик развивающей нейропсихологии ",
    m4_title: "4. Развитие эмоционального интеллекта (EQ)",
    m4_desc: "Мягко снимаем дневной стресс, тревоги и обиды ребенка прямо в процессе засыпания, программируя его на абсолютную уверенность в себе и психологическую устойчивость.",
    m4_tag: "CBT & ACT Framework. Нейропсихологический подход к эмоциональной саморегуляции ребенка",
    btn_quick_test: "▶️ Быстрое тестирование рассказа-медитации (Включить аудио)",
    mic_story_reader_title: "📖 Текст для чтения вслух при записи (читать медленно с паузами):",
    btn_toggle_story_text: "Развернуть весь текст 📖",
    btn_toggle_story_text_collapse: "Свернуть текст 🔼",
    story_snippet_text: "«Знай что мама и папа тебя очень любят… А теперь давай отправимся в дружелюбное местечко… Представь, что у тебя в голове есть такое место,… где тебе хорошо…»",
    story_full_text: "«Знай что мама и папа тебя очень любят …А теперь давай отправимся в дружелюбное местечко.… Представь, что у тебя в голове есть такое место,… где тебе хорошо.… Найди его и побудь там.… Представь самое красивое и безопасное место, которое ты можешь вообразить.… где мама и папа всегда рядом с тобой и помогают тебе.…<br><br>…Потому что это тот мир, который ты построила сама и в котором все, во что ты веришь — это правда. Это тот самый мир, где все действительно сбывается, …где мысли становятся реальными и где все, во что ты веришь, может случиться. …Думай о том, что в этом месте ты — настоящая волшебница и всё подвластно твоей воле.…<br><br>…Поверь в то, что ты умна, и что ты очень быстро и легко учишься. Поверь в это, и всё сбудется. Почувствуй уверенность в своих силах, думай о том, как легко тебе даются любые новые знания.<br><br>Поверь в то, что тебя очень сильно любят, и почувствуй это всем своим сердцем, и пусть душа наполнится счастьем. Представь теплое сияние в груди, вдыхай это чувство любви каждой клеточкой, ... мама и папа рады что ты у них есть...»",
    tag_modes: "Быстрый запуск позитивных изменений",
    title_modes: "4 Специализированных Режима Эмоциональной Помощи и Поддержки",
    sub_modes: "Выберите требуемый сценарий для мгновенной генерации сказки для расслабления или помощи",
    mode_morning_title: "Утренняя настройка",
    mode_morning_desc: "Заряд бодрости, веры в свои силы, лёгкости в учебе и радости перед новым днем.",
    btn_start_morning: "Запустить утренний настрой",
    mode_bedtime_title: "Сказка перед сном",
    mode_bedtime_desc: "Мягкий уход в сон, снятие дневных обид, растворение тревог и выработка глубинного покоя.",
    btn_start_bedtime: "Запустить режим расслабления перед сном",
    mode_prayer_title: "Молитва-медитация",
    mode_prayer_desc: "Духовный покой, благодарность, умиротворение и благословение светлого настроя для семьи.",
    btn_start_prayer: "Включить Молитву-Медитацию",
    mode_emergency_title: "Экстренная помощь при истерике",
    mode_emergency_desc: "Мгновенный 4-шаговый алгоритм для родителя + экспресс-генерация аудио для заземления ребенка.",
    btn_start_emergency: "🚨 Активировать скорую помощь",
    em_header: "🚨 Экстренный протокол: Помощь при истерике",
    em_step1_title: "Ваша выдержка",
    em_step1_desc: "Сделайте глубокий вдох. Вы — спокойный якорь безопасности для ребенка.",
    em_step2_title: "Безопасность",
    em_step2_desc: "Уберите острое, снизьте громкость голоса, присядьте на уровень глаз ребенка.",
    em_step3_title: "Легализация",
    em_step3_desc: "Тихо скажите: «Я вижу, что тебе очень тяжело и ты злишься. Я рядом».",
    em_step4_title: "Заземление",
    em_step4_desc: "Включите успокаивающее ИИ-аудио и дайте ребенку почувствовать ритм дыхания.",
    em_input_label: "Опишите в чем смысл ситуации (что произошло?):",
    btn_gen_emergency: "✨ Сгенерировать экспресс-аудио",
    tag_studio: "Студия Медитации - разработка на основе методов детской нейропсихологии",
    title_studio: "Персональный Рассказ-Медитация",
    sub_studio: "Запись вашего голоса + Студийная MP3 фонограмма + Динамическая ИИ-озвучка",
    label_child_name: "Имя ребенка:",
    label_child_gender: "Пол ребенка:",
    opt_girl: "Девочка",
    opt_boy: "Мальчик",
    label_child_age: "Возраст (лет):",
    label_audio_source: "Источник аудио-озвучки:",
    opt_source_parent: "🎙 голос папы или мамы",
    opt_source_mp3: "🎵 Студийная MP3 фонограмма",
    opt_source_tts: "🤖 Динамический ИИ-диктор (Низкий тембр)",
    label_voice_timbre: "Тембр и Голос озвучки:",
    opt_male_deep: "🎙 мужской - низкий спокойный голос",
    opt_female_calm: "🎙 женский спокойный голос",
    opt_generated_parent: "🎙 сгенерированный голос мамы или папы",
    label_meditation_duration: "⏱ Длительность медитации (минут, 4–30 мин):",
    opt_dur_4: "⏱ 4 минуты (Мягкое засыпание)",
    opt_dur_5: "⏱ 5 минут (Стандартная сказка-медитация)",
    opt_dur_7: "⏱ 7 минут (Глубокий покой)",
    opt_dur_10: "⏱ 10 минут (Погружение в сон)",
    opt_dur_15: "⏱ 15 минут (Длительная сказка-медитация)",
    opt_dur_20: "⏱ 20 минут (Глубокий убаюкивающий сон)",
    opt_dur_25: "⏱ 25 минут (Полное расслабление и покой)",
    opt_dur_30: "⏱ 30 минут (Максимально полезная медитация)",
    btn_listen_generated: "«▶️ Слушать сказку-медитацию, сгенерированную заданным голосом»",
    label_meditation_mode: "Режим рассказа-медитации:",
    opt_mode_bedtime: "🌙 Перед сном (Засыпание)",
    opt_mode_morning: "☀️ Утренняя (Уверенность)",
    opt_mode_emergency: "🚨 Экстренная (Заземление)",
    opt_mode_prayer: "🙏 Молитва-медитация (Духовный покой)",
    label_mic_rec: "🎙 Запись голоса родителя (60 секунд для ElevenLabs):",
    mic_press_text: "Нажмите для записи голоса родителя или бабушки (60 секунд)",
    btn_generate: "✨ Создать рассказ-медитацию с голосом мамы, папы или бабушки",
    player_title_default: "Рассказ-Медитация",
    player_sub_default: "Самый родной и успокаивающий голос • Без музыки",
    tag_pricing: "Прозрачная монетизация",
    title_pricing: "Выберите Тариф Подписки",
    sub_pricing: "Freemium доступ + Лимиты генерации + Докупка минут",
    plan_title_free: "Free (Базовый)",
    plan_free_sub: "Ощутить ценность сервиса",
    plan_forever: "/ навсегда",
    pf_free_1: "✅ 2 AI-запроса в неделю",
    pf_free_2: "✅ Стандартный рассказ-медитация",
    pf_free_3: "✅ Озвучка спокойным приятным голосом",
    pf_free_3_extra: "✅ Нейрогимнастика и упражнения для баланса эмоций",
    pf_free_3_emergency: "✅ Экстренная помощь при истерике",
    pf_free_4: "❌ Нет сохранения истории",
    btn_plan_free: "Начать бесплатно",
    plan_title_basic: "Базовый",
    plan_basic_sub: "Для ежедневных подстроек",
    billing_monthly: "Ежемесячно",
    billing_annual: "Оплата за год <span class=\"discount-badge\">-67% Скидка</span>",
    plan_per_month: "/ месяц",
    pf_basic_1: "✅ 50 минут генераций в месяц",
    pf_basic_2: "✅ Персонализация под имя ребенка",
    pf_basic_3: "✅ Поддержка 3 языков (RU, EN, HE)",
    pf_basic_4: "✅ Сохранение истории голосов и рассказов",
    btn_plan_basic: "Выбрать Базовый",
    popular_badge: "🔥 Популярный выбор",
    plan_title_premium: "Премиум",
    plan_premium_sub: "Полный покой и гармония семьи",
    pf_prem_1: "✅ 120 минут генераций (~12 медитаций)",
    pf_prem_2: "✅ Экстренная помощь при истерике",
    pf_prem_3: "✅ Семейный доступ до 4 устройств",
    pf_prem_4: "✅ Приоритетная поддержка",
    btn_plan_premium: "Активировать Премиум",
    plan_title_platinum: "Платиновый",
    plan_plat_sub: "Максимальный ресурс и поддержка",
    pf_plat_1: "✅ 300 минут генерации аудио",
    pf_plat_2: "✅ Неограниченная библиотека медитаций",
    pf_plat_3: "✅ Персональный Агент-Супервизор",
    pf_plat_4: "✅ Семейный доступ до 8 устройств",
    btn_plan_platinum: "Активировать Платиновый",
    topup_tag: "⚡ Дополнительные минуты:",
    topup_title: "Пакет «Еще 50 минут медитаций»",
    topup_desc: "Закончился лимит подписки? Докупите 50 минут без смены тарифного плана.",
    btn_topup: "Докупить за $4.99",
    nda_title: "📜 Пользовательское соглашение (Terms of Service)",
    nda_sub: "ОТКАЗ ОТ ОТВЕТСТВЕННОСТИ И ОГРАНИЧЕНИЕ ПРЕТЕНЗИЙ (DISCLAIMER)",
    label_nda_name: "Ваше ФИО Подписанта:",
    label_auth_phone: "WhatsApp / Telegram (Обязательно):",
    label_nda_email: "Ваш E-mail адрес:",
    label_signature_canvas: "✍️ Поставьте подпись мышкой или пальцем ниже:",
    btn_clear_sig: "Очистить",
    btn_submit_nda: "✅ Принять и подписать NDA (Перейти к документу)",
    custdev_modal_title: "💬 Опрос + подарок: Помогите сделать продукт лучше",
    custdev_modal_sub: "Выберите интересующий вас сценарий, ответьте на 3 вопроса и получите свой подарок:",
    cd_btn_burnout: "🟢 1. Выгорание",
    cd_btn_tantrums: "🔵 2. Истерики",
    cd_btn_confidence: "🟡 3. Уверенность",
    cd_btn_expert: "🟣 4. Эксперт",
    label_custdev_phone: "WhatsApp / Telegram (Обязательно для получения подарка):",
    btn_submit_custdev: "🚀 Отправить ответы и получить подарок",
    modal_auth_title: "Вход в MindEcho AI",
    modal_auth_sub: "Сохраните настройки медитаций и статистику",
    btn_auth_google: "Вход через аккаунт Google",
    btn_auth_apple: "Вход через Apple ID",
    label_terms_agree: "Я согласен с Условиями использования и политикой конфиденциальности.",
    btn_auth_submit: "Войти / Зарегистрироваться",
    footer_brand_desc: "Глобальная инклюзивная экосистема для защиты ментального здоровья семей. ИИ, детская нейропсихология и КПТ.",
    footer_nav_title: "Навигация",
    legal_terms: "Условия использования",
    copyright_text: "© 2026 MindEcho AI Inc. Все права защищены.",
    link_admin_login: "🔐 Вход в административную часть \"admin\"",
    label_voice_consent: "Даю согласие на обработку записи голоса для клонирования ИИ",
    tag_edu_marketing: "🚀 Внешкольное обучение & Многократное усиление достижений",
    title_edu_marketing: "ИИ-Репетиторство и Предметы Успеха",
    sub_edu_marketing: "Персонализированная траектория развития ребёнка по предметам с Сократовским ИИ-наставником и ускоренным пониманием без слез и репетиторов.",
    subj_lang_title: "Английский и языки",
    subj_lang_desc: "Живой разговорный диалог с ИИ-носителями языка. Развитие беглой речи, словарного запаса и естественной фонетики без зубрежки правил.",
    subj_lang_badge: "⚡ Ускорение x3",
    subj_math_title: "Математика и Логика",
    subj_math_desc: "Сократовский метод наводящих вопросов. Разбор сложных алгебраических и геометрийских концепций за 15 минут в день.",
    subj_math_badge: "🧩 100% Понимание",
    subj_phys_title: "Физика и Науки",
    subj_phys_desc: "Интерактивное моделирование физических явлений и природного мира через живые примеры, жизненные задачи и наглядные эксперименты.",
    subj_phys_badge: "🔬 Практический смысл",
    subj_prog_title: "Программирование",
    subj_prog_desc: "Основы алгоритмов, Python, JavaScript, веб-разработка и создание собственного кода с пошаговыми подсказками ИИ-коуча.",
    subj_prog_badge: "🚀 Создание программ",
    subj_it_title: "IT & Интернет-проекты",
    subj_it_desc: "Развитие мышления Создателя (Creator Mindset), управление ИИ-нейросетями, стартап-проектное мышление и запуски цифровых продуктов.",
    subj_it_badge: "💡 Creator Mindset",
    tag_edu_plans: "Тарифы Образовательного Комплекса",
    title_edu_plans: "Выберите Формат Обучения",
    sub_edu_plans: "Внешкольное репетиторство по выбранному предмету или полноценная удаленная школьная система",
    btn_edu_cycle_monthly: "Ежемесячно",
    btn_edu_cycle_annual: "Оплата за год (Выгода до $820)",
    badge_tutoring: "🎓 Внешкольное Репетиторство",
    plan_title_tutoring: "Внешкольное Обучение",
    plan_tutoring_sub: "Репетиторство и глубинное освоение предмета",
    lbl_select_subject: "Выберите основной предмет:",
    plan_per_year: "/ год",
    pf_tut_1: "✅ ИИ-Репетитор 24/7 по выбранному предмету",
    pf_tut_2: "✅ Пошаговая ликвидация прошлых пробелов за 15 минут",
    pf_tut_3: "✅ Озвучка заданий и формул родным голосом родителя",
    pf_tut_4: "✅ Развитие критического мышления и Soft Skills",
    pf_tut_5: "✅ Еженедельный отчёт успеваемости для родителей",
    badge_school: "🚀 Полный Школьный Комплекс",
    plan_title_school: "Удалённая Школьная Система",
    plan_school_sub: "Полноценная автономная экосистема обучения",
    lbl_all_subjects_included: "✨ Все предметы + IT-Инкубатор включены:",
    pf_sch_1: "✅ Полная школьная программа «Учёба за 3 часа в день»",
    pf_sch_2: "✅ Доступ ко ВСЕМ предметам (Языки, Математика, Физика, Кодинг)",
    pf_sch_3: "✅ ИИ-Коуч состояний, эмоций и фокуса внимания",
    pf_sch_4: "✅ Формирование мышления Создателя (Creator Mindset)",
    pf_sch_5: "✅ Семейный доступ до 5 детей + Личный Супервизор"
  },
  en: {
    nav_mission: "Mission",
    nav_modes: "Emotional Support",
    nav_edu_subjects: "📚 Extracurricular",
    nav_edu_pricing: "🎓 School Pricing",
    nav_generator: "Studio",
    nav_pricing: "Pricing",
    nav_nda: "DISCLAIMER",
    nav_custdev: "🎁 Survey + Gift",
    btn_login: "Sign In",
    sticky_text: "Invest in family harmony from $7/mo",
    btn_choose_plan: "Choose Plan",
    hero_badge: "AI + Child Neuropsychology + CBT/ACT + Emotional Safety",
    hero_title: "Transforming parenting routine into <span class=\"text-gradient\">gentle psychological support</span>",
    hero_subtitle: "Family emotional safety ecosystem & preventive psychological support for children in a native voice. A legal way to save parents' resources and raise a happy child.",
    btn_try_free: "✨ Try it! Relaxation story with Mom's, Dad's, or Grandma's voice",
    btn_try_free_sub: "gently dissolves daytime stress, alleviates anxiety, and develops child's emotional intelligence (EQ) right during bedtime .",
    btn_games: "🎮 Speech development & Emotional Intelligence games",
    btn_prayer: "🙏 Create Prayer-Meditation",
    trust_privacy: "🛡 Privacy-First (Bank-grade encryption)",
    trust_supervisor: "🧠 Validated by Supervisor AI Agent",
    trust_global: "🌏 Platform for everyone worldwide",
    hero_card_sub: "Native soothing voice • No background music",
    hero_sample_quote: "\"Close your eyes and focus on your breathing... Feel quiet and calm joy inside...\"",
    hero_card_footer: "✨ Personalized relaxation story",
    tag_supermission: "MindEcho AI Super-Mission",
    title_supermission: "Meditation Studio - developed based on child neuropsychology methods",
    sub_supermission: "We create not just an IT project, but the safest ecosystem for family mental wellness and emotional security worldwide.",
    m1_title: "1. Platform for everyone worldwide",
    m1_desc: "Erasing social and economic inequality. Accessible even for low-income families — every child deserves healthy emotional development.",
    m2_title: "2. Family harmony & emotional intelligence development",
    m2_desc: "Progressive audio modes and habit gamification eliminate tantrums, boosting emotional intelligence (EQ) and strengthening parents' authority.",
    m3_title: "3. Saving parents' energy",
    m3_desc: "Protecting parents from burnout with 1-2 hours of personal time daily, and children from mental stress based on developmental neuropsychology. Approved by child neuropsychologists.",
    m3_tag: "1-2 hours of personal time based on developmental neuropsychology",
    m4_title: "4. Emotional Intelligence (EQ) Development",
    m4_desc: "Gently relieving daytime stress, anxieties, and grievances during bedtime, fostering self-confidence and psychological resilience.",
    m4_tag: "CBT & ACT Framework. Neuropsychological approach to child emotional self-regulation",
    btn_quick_test: "▶️ Quick Meditation Story Test (Play Audio)",
    mic_story_reader_title: "📖 Text for reading aloud while recording (read slowly with pauses):",
    btn_toggle_story_text: "Expand full text 📖",
    btn_toggle_story_text_collapse: "Collapse text 🔼",
    story_snippet_text: "“Know that Mom and Dad love you very much… Now let’s go to a friendly little place… Imagine there is a place in your mind… where you feel so good…”",
    story_full_text: "“Know that Mom and Dad love you very much… Now let’s go to a friendly little place… Imagine there is a place in your mind… where you feel so good… Find it and stay there for a while… Imagine the most beautiful and safe place you can imagine… where Mom and Dad are always by your side, helping you…<br><br>…Because this is the world you built yourself, where everything you believe in is true. This is the very world where everything really comes true… where thoughts become real and where everything you believe in can happen… Think about how in this place you are a true magician and everything obeys your will…<br><br>…Believe that you are smart, and that you learn very quickly and easily. Believe in this, and everything will come true. Feel confidence in your strength, think about how easily any new knowledge comes to you.<br><br>Believe that you are loved so very deeply, feel it with all your heart, and let your soul fill with happiness. Imagine a warm glow in your chest, breathe in this feeling of love with every cell, ... Mom and Dad are so glad to have you in their lives…”",
    tag_modes: "Quick Launch of Positive Changes",
    title_modes: "4 Specialized Modes of Emotional Help & Support",
    sub_modes: "Select a scenario for instant generation of relaxation stories or emergency support",
    mode_morning_title: "Morning Tune-up",
    mode_morning_desc: "Boost of energy, self-belief, ease in learning, and joy for the new day.",
    btn_start_morning: "Start Morning Tune-up",
    mode_bedtime_title: "Bedtime Story",
    mode_bedtime_desc: "Gentle transition into sleep, relieving daytime stress and cultivating deep peace.",
    btn_start_bedtime: "Start Bedtime Relaxation Mode",
    mode_prayer_title: "Prayer Meditation",
    mode_prayer_desc: "Spiritual peace, gratitude, serenity, and blessing of a bright mindset for the family.",
    btn_start_prayer: "Start Prayer-Meditation",
    mode_emergency_title: "Emergency Tantrum Relief",
    mode_emergency_desc: "Instant 4-step algorithm for parents + express AI audio generation for child grounding.",
    btn_start_emergency: "🚨 Activate Emergency Support",
    em_header: "🚨 Emergency Protocol: Tantrum Support",
    em_step1_title: "Your Composure",
    em_step1_desc: "Take a deep breath. You are a calm anchor of safety for your child.",
    em_step2_title: "Safety First",
    em_step2_desc: "Lower your voice, remove sharp items, get down to eye level with your child.",
    em_step3_title: "Validation",
    em_step3_desc: "Softly say: 'I see it's really hard right now and you're upset. I am here with you.'",
    em_step4_title: "Grounding",
    em_step4_desc: "Play soothing AI audio and guide your child into a steady breathing rhythm.",
    em_input_label: "Describe the situation (what happened?):",
    btn_gen_emergency: "✨ Generate Express Audio",
    tag_studio: "Meditation Studio - developed based on child neuropsychology methods",
    title_studio: "Personalized Meditation Story",
    sub_studio: "Voice recording + Studio MP3 track + Dynamic AI voiceover",
    label_child_name: "Child's Name:",
    label_child_gender: "Child's Gender:",
    opt_girl: "Girl",
    opt_boy: "Boy",
    label_child_age: "Age (years):",
    label_audio_source: "Audio Voice Source:",
    opt_source_parent: "🎙 Mom's or Dad's Voice",
    opt_source_mp3: "🎵 Studio MP3 Track",
    opt_source_tts: "🤖 Dynamic AI Narrator (Deep Voice)",
    label_voice_timbre: "Voice Timbre & Tone:",
    opt_male_deep: "🎙 Male - Deep Calm Voice",
    opt_female_calm: "🎙 Female Calm Voice",
    opt_generated_parent: "🎙 Generated Parent Voice",
    label_meditation_duration: "⏱ Meditation duration (minutes, 4–30 min):",
    opt_dur_4: "⏱ 4 minutes (Soft bedtime relaxation)",
    opt_dur_5: "⏱ 5 minutes (Standard meditation story)",
    opt_dur_7: "⏱ 7 minutes (Deep peace)",
    opt_dur_10: "⏱ 10 minutes (Deep sleep journey)",
    opt_dur_15: "⏱ 15 minutes (Extended meditation story)",
    opt_dur_20: "⏱ 20 minutes (Deep soothing sleep)",
    opt_dur_25: "⏱ 25 minutes (Full relaxation and calm)",
    opt_dur_30: "⏱ 30 minutes (Maximally beneficial meditation)",
    btn_listen_generated: "«▶️ Listen to meditation story generated in requested voice»",
    label_meditation_mode: "Meditation Mode:",
    opt_mode_bedtime: "🌙 Bedtime (Sleep)",
    opt_mode_morning: "☀️ Morning (Confidence)",
    opt_mode_emergency: "🚨 Emergency (Grounding)",
    opt_mode_prayer: "🙏 Prayer-Meditation (Spiritual Peace)",
    label_mic_rec: "🎙 Parent Voice Recording (60 seconds for ElevenLabs):",
    mic_press_text: "Click to record parent's or grandmother's voice (60 seconds)",
    btn_generate: "✨ Create meditation story with Mom's, Dad's, or Grandma's voice",
    player_title_default: "Meditation Story",
    player_sub_default: "Native soothing voice • No music",
    tag_pricing: "Transparent Monetization",
    title_pricing: "Select Subscription Plan",
    sub_pricing: "Freemium access + Generation limits + Top-up minutes",
    plan_title_free: "Free (Basic)",
    plan_free_sub: "Experience service value",
    plan_forever: "/ forever",
    pf_free_1: "✅ 2 AI requests per day",
    pf_free_2: "✅ Standard meditation story",
    pf_free_3: "✅ Voiceover in a calm, pleasant voice",
    pf_free_3_extra: "✅ Neurogymnastics & emotional balance exercises",
    pf_free_3_emergency: "✅ Emergency tantrum help",
    pf_free_4: "❌ No history storage",
    btn_plan_free: "Start Free",
    plan_title_basic: "Basic",
    plan_basic_sub: "For daily adjustments",
    billing_monthly: "Monthly",
    billing_annual: "Annual Billing <span class=\"discount-badge\">-67% OFF</span>",
    plan_per_month: "/ month",
    pf_basic_1: "✅ 50 generation minutes/month",
    pf_basic_2: "✅ Personalization with child's name",
    pf_basic_3: "✅ 3 Languages support (RU, EN, HE)",
    pf_basic_4: "✅ Voice & story history storage",
    btn_plan_basic: "Choose Basic",
    popular_badge: "🔥 Most Popular",
    plan_title_premium: "Premium",
    plan_premium_sub: "Total peace and family harmony",
    pf_prem_1: "✅ 120 generation minutes (~12 stories)",
    pf_prem_2: "✅ Emergency tantrum support",
    pf_prem_3: "✅ Family access up to 4 devices",
    pf_prem_4: "✅ Priority support",
    btn_plan_premium: "Activate Premium",
    plan_title_platinum: "Platinum",
    plan_plat_sub: "Maximum resources & VIP care",
    pf_plat_1: "✅ 300 audio generation minutes",
    pf_plat_2: "✅ Unlimited meditation library",
    pf_plat_3: "✅ Personal Supervisor AI Agent",
    pf_plat_4: "✅ Family access up to 8 devices",
    btn_plan_platinum: "Activate Platinum",
    topup_tag: "⚡ Additional Minutes:",
    topup_title: "Extra 50 Minutes Pack",
    topup_desc: "Reached your plan limit? Buy 50 extra minutes without changing your subscription.",
    btn_topup: "Buy for $4.99",
    nda_title: "📜 Terms of Service & User Agreement",
    nda_sub: "DISCLAIMER & LIMITATION OF LIABILITY",
    label_nda_name: "Your Full Name:",
    label_auth_phone: "WhatsApp / Telegram (Required):",
    label_nda_email: "Your E-mail address:",
    label_signature_canvas: "✍️ Sign with your mouse or finger below:",
    btn_clear_sig: "Clear",
    btn_submit_nda: "✅ Accept & Sign NDA (Proceed to document)",
    custdev_modal_title: "💬 Survey + Gift: Help us improve MindEcho AI",
    custdev_modal_sub: "Choose a scenario, answer 3 questions, and claim your gift:",
    cd_btn_burnout: "🟢 1. Burnout",
    cd_btn_tantrums: "🔵 2. Tantrums",
    cd_btn_confidence: "🟡 3. Confidence",
    cd_btn_expert: "🟣 4. Expert",
    label_custdev_phone: "WhatsApp / Telegram (Required to receive gift):",
    btn_submit_custdev: "🚀 Submit answers & receive gift",
    modal_auth_title: "Sign In to MindEcho AI",
    modal_auth_sub: "Save your meditation settings and progress",
    btn_auth_google: "Sign in with Google",
    btn_auth_apple: "Sign in with Apple ID",
    label_terms_agree: "I agree to Terms of Service and Privacy Policy.",
    btn_auth_submit: "Sign In / Register",
    footer_brand_desc: "Global inclusive ecosystem for family mental wellness. AI, child neuropsychology, and CBT.",
    footer_nav_title: "Navigation",
    legal_terms: "Terms of Use",
    copyright_text: "© 2026 MindEcho AI Inc. All rights reserved.",
    link_admin_login: "🔐 Admin Portal Login \"admin\"",
    label_voice_consent: "I consent to the processing of my voice recording for AI voice cloning",
    tag_edu_marketing: "🚀 Extracurricular Education & Achievement Multiplier",
    title_edu_marketing: "AI Tutoring & Subject Mastery",
    sub_edu_marketing: "Personalized learning trajectories with Socratic AI mentor for accelerated understanding without tears or $50/hr tutors.",
    subj_lang_title: "English & Languages",
    subj_lang_desc: "Live conversational dialogue with AI native speakers. Developing fluent speech, vocabulary, and natural phonetics without rote grammar.",
    subj_lang_badge: "⚡ 3x Acceleration",
    subj_math_title: "Mathematics & Logic",
    subj_math_desc: "Socratic guiding question method. Breaking down complex algebraic and geometry concepts in just 15 mins/day.",
    subj_math_badge: "🧩 100% Mastery",
    subj_phys_title: "Physics & Natural Sciences",
    subj_phys_desc: "Interactive physical phenomenon modeling through real-world examples, practical problems, and visual experiments.",
    subj_phys_badge: "🔬 Applied Science",
    subj_prog_title: "Coding & Programming",
    subj_prog_desc: "Algorithm fundamentals, Python, JavaScript, web development, and coding with step-by-step AI guidance.",
    subj_prog_badge: "🚀 App Creation",
    subj_it_title: "IT & Internet Projects",
    subj_it_desc: "Developing Creator Mindset, AI neural network management, startup project thinking, and digital product launches.",
    subj_it_badge: "💡 Creator Mindset",
    tag_edu_plans: "Educational Ecosystem Pricing",
    title_edu_plans: "Choose Your Learning Format",
    sub_edu_plans: "Extracurricular subject tutoring or full remote school ecosystem",
    btn_edu_cycle_monthly: "Monthly Billing",
    btn_edu_cycle_annual: "Annual Billing (Save up to $820)",
    badge_tutoring: "🎓 Extracurricular Tutoring",
    plan_title_tutoring: "Extracurricular Learning",
    plan_tutoring_sub: "Subject tutoring & deep skill multiplier",
    lbl_select_subject: "Select primary subject:",
    plan_per_year: "/ year",
    pf_tut_1: "✅ 24/7 Socratic AI Tutor for selected subject",
    pf_tut_2: "✅ Step-by-step gap elimination in 15 mins/day",
    pf_tut_3: "✅ Explanations voiced in parent's loving voice",
    pf_tut_4: "✅ Critical thinking & Soft Skills development",
    pf_tut_5: "✅ Weekly parent progress dashboard & analytics",
    badge_school: "🚀 Full Remote School System",
    plan_title_school: "Remote School Ecosystem",
    plan_school_sub: "Complete autonomous home-schooling system",
    lbl_all_subjects_included: "✨ All Subjects + IT Incubator Included:",
    pf_sch_1: "✅ Full curriculum in '3-Hour Daily Mastery' mode",
    pf_sch_2: "✅ Access to ALL subjects (Languages, Math, Physics, IT)",
    pf_sch_3: "✅ AI State & Focus Coach preventing burnout",
    pf_sch_4: "✅ Creator Mindset & digital startup incubator",
    pf_sch_5: "✅ Family access up to 5 kids + Dedicated Supervisor"
  },
  he: {
    nav_mission: "משימה",
    nav_modes: "תמיכה רגשית",
    nav_edu_subjects: "📚 חינוך משלים",
    nav_edu_pricing: "🎓 מחירי בית ספר",
    nav_generator: "סטודיו",
    nav_pricing: "מחירון",
    nav_nda: "הצהרה",
    nav_custdev: "🎁 סקר + מתנה",
    btn_login: "התחברות",
    sticky_text: "השקיעו בהרמוניה משפחתית החל מ-$7 לחודש",
    btn_choose_plan: "בחר מסלול",
    hero_badge: "בינה מלאכותית + נוירופסיכולוגיה של הילד + CBT/ACT + בטיחות רגשית",
    hero_title: "הופכים את שגרת ההורות ל<span class=\"text-gradient\">תמיכה פסיכולוגית עדינה</span>",
    hero_subtitle: "מערכת אקולוגית לבטיחות רגשית של המשפחה ותמיכה פסיכולוגית מונעת לילדים בקול מוקלט. דרך חוקית לשמור על משאבי ההורים ולגדל ילד מאושר.",
    btn_try_free: "✨ נסו עכשיו! סיפור הרגעה בקולם של אמא, אבא או סבתא",
    btn_try_free_sub: "מפיג בעדינות מתח יומי, מפיג חרדות ומפתח את האינטליגנציה הרגשית (EQ) של הילד ישירות בזמן ההרדמה .",
    btn_games: "🎮 משחקים לפיתוח דיבור ואינטליגנציה רגשית",
    btn_prayer: "🙏 יצירת מדיטציית תפילה",
    trust_privacy: "🛡 פרטיות תחילה (הצפנה בנקאית)",
    trust_supervisor: "🧠 מאומת על ידי סוכן מפקח AI",
    trust_global: "🌏 פלטפורמה לכולם ברחבי העולם",
    hero_card_sub: "קול מרגיע ומוכר • ללא מוזיקת רקע",
    hero_sample_quote: "\"עצום עיניים והתמקד בנשימה שלך... חוש שמחה שקטה ורגועה מבפנים...\"",
    hero_card_footer: "✨ סיפור הרגעה מותאם אישית",
    tag_supermission: "סופר-משימה של MindEcho AI",
    title_supermission: "סטודיו למדיטציה - פיתוח המבוסס על שיטות נוירופסיכולוגיה של הילד",
    sub_supermission: "אנו יוצרים לא רק פרויקט IT, אלא את המערכת האקולוגית המוגנת ביותר לבריאות נפשית ובטיחות רגשית של משפחות בעולם.",
    m1_title: "1. פלטפורמה לכולם ברחבי העולם",
    m1_desc: "מחיקת אי-שוויון חברתי וכלכלי. נגיש גם למשפחות בסיכון — לכל ילד מגיעה התפתחות רגשית בריאה.",
    m2_title: "2. הרמוניה במשפחה ופיתוח אינטליגנציה רגשית",
    m2_desc: "מצבי שמע מתקדמים ומשחוק הרגלים מעלימים התקפי זעם, מחזקים אינטליגנציה רגשית (EQ) ומחזקים את סמכות ההורים.",
    m3_title: "3. חיסכון באנרגיה של ההורים",
    m3_desc: "הגנה על ההורים משחיקה עם 1-2 שעות של זמן אישי ביום, והגנה על ילדים ממתח נפשי מבוסס נוירופסיכולוגיה התפתחותית. אושר על ידי נוירופסיכולוגים לילדים.",
    m3_tag: "1-2 שעות זמן אישי מבוסס נוירופסיכולוגיה התפתחותית",
    m4_title: "4. פיתוח אינטליגנציה רגשית (EQ)",
    m4_desc: "הפחתה עדינה של מתח יומי, חרדות וכעסים בזמן השינה, בניית ביטחון עצמי וחוסן נפשי.",
    m4_tag: "מסגרת CBT & ACT. גישה נוירופסיכולוגית לוויתור ואיזון רגשי של הילד",
    btn_quick_test: "▶️ בדיקה מהירה של סיפור המדיטציה (הפעל שמע)",
    mic_story_reader_title: "📖 טקסט לקריאה בקול בזמן ההקלטה (לקרוא לאט עם הפסקות):",
    btn_toggle_story_text: "השתרע את כל הטקסט 📖",
    btn_toggle_story_text_collapse: "צמצם טקסט 🔼",
    story_snippet_text: "“דע שאמא ואבא אוהבים אותך מאוד… עכשיו בוא נצא למקום ידידותי… דמיין שיש מקום כזה בראשך… שבו טוב לך…”",
    story_full_text: "“דע שאמא ואבא אוהבים אותך מאוד… עכשיו בוא נצא למקום ידידותי… דמיין שיש מקום כזה בראשך… שבו טוב לך… מצא אותו והישאר שם קצת… דמיין את המקום היפה והבטוח ביותר שאתה יכול לדמיין… שבו אמא ואבא תמיד לצידך ועוזרים לך…<br><br>…כי זה העולם שבנית בעצמך, שבו כל מה שאתה מאמין בו הוא אמת. זה העולם שבו הכל באמת מתגשם… שבו מחשבות הופכות למציאות ושבו כל מה שאתה מאמין בו יכול לקרות… חשוב על כך שבמקום הזה אתה קוסם אמיתי וכל הרצונות שלך מתגשמים…<br><br>…האמן שאתה חכם, ושאתה לומד מהר מאוד ובקלות. האמן בזה, והכל יתגשם. חוש ביטחון בכוחותיך, חשוב על כך שכל ידע חדש מגיע אליך בקלות.<br><br>האמן שאוהבים אותך מאוד עמוק, חוש זאת בכל ליבך, ותן לנשמה שלך להתמלא באושר. דמיין זוהר חם בחזה, נשום את תחושת האהבה הזו בכל תא, ... אמא ואבא שמחים כל כך שיש להם אותך…”",
    tag_modes: "הפעלה מהירה של שינויים חיוביים",
    title_modes: "4 מצבים מיוחדים לעזרה ותמיכה רגשית",
    sub_modes: "בחרו תרחיש ליצירה מיידית של סיפורי הרגעה או עזרה דחופה",
    mode_morning_title: "כוון בוקר",
    mode_morning_desc: "זריקת מרץ, אמונה עצמית, קלות בלימודים ושמחה לקראת יום חדש.",
    btn_start_morning: "הפעל כוון בוקר",
    mode_bedtime_title: "סיפור לפני השינה",
    mode_bedtime_desc: "מעבר עדין לשינה, שחרור מועקות יומיות וטיפוח שלווה עמוקה.",
    btn_start_bedtime: "הפעל מצב הרגעה לפני השינה",
    mode_prayer_title: "מדיטציית תפילה",
    mode_prayer_desc: "שלווה רוחנית, הודיה, רוגע וברכה של הלך רוח מואר למשפחה.",
    btn_start_prayer: "הפעל מדיטציית תפילה",
    mode_emergency_title: "עזרה דחופה בזמן התקף זעם",
    mode_emergency_desc: "אלגוריתם 4 שלבים מיידי להורה + יצירת שמע AI מהירה לקרקוע הילד.",
    btn_start_emergency: "🚨 הפעל עזרה דחופה",
    em_header: "🚨 פרוטוקול חירום: תמיכה בזמן התקף זעם",
    em_step1_title: "איפוק ושליטה",
    em_step1_desc: "קחו נשימה עמוקה. אתם עוגן רגוע של ביטחון עבור ילדכם.",
    em_step2_title: "בטיחות תחילה",
    em_step2_desc: "הנמיכו את הקול, הרחיקו חפצים חדים, רדו לגובה העיניים של הילד.",
    em_step3_title: "תיקוף רגשי",
    em_step3_desc: "אמרו בשקט: 'אני רואה שקשה לך עכשיו ואתה כועס. אני כאן איתך.'",
    em_step4_title: "קרקוע",
    em_step4_desc: "הפעילו שמע מרגיע של AI והנחו את הילד לקצב נשימה סדיר.",
    em_input_label: "תארו את הסיטואציה (מה קרה?):",
    btn_gen_emergency: "✨ צור שמע מהיר",
    tag_studio: "סטודיו למדיטציה - פיתוח המבוסס על שיטות נוירופסיכולוגיה של הילד",
    title_studio: "סיפור מדיטציה מותאם אישית",
    sub_studio: "הקלטת קולכם + רצועת MP3 באולפן + קריינות AI דינמית",
    label_child_name: "שם הילד/ה:",
    label_child_gender: "מין הילד/ה:",
    opt_girl: "ילדה",
    opt_boy: "ילד",
    label_child_age: "גיל (בשנים):",
    label_audio_source: "מקור הקריינות:",
    opt_source_parent: "🎙 קול של אמא או אבא",
    opt_source_mp3: "🎵 רצועת MP3 אולפנית",
    opt_source_tts: "🤖 קריין AI דינמי (קול עמוק)",
    label_voice_timbre: "גון וסגנון הקול:",
    opt_male_deep: "🎙 גברי - קול עמוק ורגוע",
    opt_female_calm: "🎙 נשי - קול רגוע",
    opt_generated_parent: "🎙 קול הורה מחולל",
    label_meditation_duration: "⏱ משך המדיטציה (בדקות, 4–30 דקות):",
    opt_dur_4: "⏱ 4 דקות (הרגעות רכה לשינה)",
    opt_dur_5: "⏱ 5 דקות (סיפור מדיטציה סטנדרטי)",
    opt_dur_7: "⏱ 7 דקות (שלווה עמוקה)",
    opt_dur_10: "⏱ 10 דקות (שקיעה בשינה עמוקה)",
    opt_dur_15: "⏱ 15 דקות (סיפור מדיטציה מורחב)",
    opt_dur_20: "⏱ 20 דקות (שינה מרגיעה ועמוקה)",
    opt_dur_25: "⏱ 25 דקות (הרפיה ושלווה מוחלטת)",
    opt_dur_30: "⏱ 30 דקות (מדיטציה מועילה ביותר)",
    btn_listen_generated: "«▶️ האזן לסיפור המדיטציה שנוצר בקול המבוקש»",
    label_meditation_mode: "מצב מדיטציה:",
    opt_mode_bedtime: "🌙 לפני השינה (הרדמה)",
    opt_mode_morning: "☀️ בוקר (ביטחון עצמי)",
    opt_mode_emergency: "🚨 חירום (קרקוע)",
    opt_mode_prayer: "🙏 מדיטציית תפילה (שלווה רוחנית)",
    label_mic_rec: "🎙 הקלטת קול הורה (60 שניות עבור ElevenLabs):",
    mic_press_text: "לחץ להקלטת קול של הורה או סבתא (60 שניות)",
    btn_generate: "✨ צור סיפור מדיטציה בקול של אמא, אבא או סבתא",
    player_title_default: "סיפור מדיטציה",
    player_sub_default: "קול מרגיע ומוכר • ללא מוזיקה",
    tag_pricing: "מונטיזציה שקופה",
    title_pricing: "בחרו מסלול מנוי",
    sub_pricing: "גישת Freemium + מכסות יצירה + תוספת דקות",
    plan_title_free: "חינם (בסיסי)",
    plan_free_sub: "להרגיש את ערך השירות",
    plan_forever: "/ לתמיד",
    pf_free_1: "✅ 2 בקשות AI ביום",
    pf_free_2: "✅ סיפור מדיטציה סטנדרטי",
    pf_free_3: "✅ קריינות בקול רגוע ונעים",
    pf_free_3_extra: "✅ נוירוגימנסטיקה ותרגילים לאיזון רגשי",
    pf_free_3_emergency: "✅ עזרה דחופה בזמן התקף זעם",
    pf_free_4: "❌ ללא שמירת היסטוריה",
    btn_plan_free: "התחל בחינם",
    plan_title_basic: "בסיסי",
    plan_basic_sub: "לכוונים יומיומיים",
    billing_monthly: "חודשי",
    billing_annual: "תשלום שנתי <span class=\"discount-badge\">-67% הנחה</span>",
    plan_per_month: "/ חודש",
    pf_basic_1: "✅ 50 דקות יצירה בחודש",
    pf_basic_2: "✅ התאמה אישית לשם הילד",
    pf_basic_3: "✅ תמיכה ב-3 שפות (RU, EN, HE)",
    pf_basic_4: "✅ שמירת היסטוריית קולות וסיפורים",
    btn_plan_basic: "בחר בסיסי",
    popular_badge: "🔥 הבחירה הפופולרית",
    plan_title_premium: "פרימיום",
    plan_premium_sub: "שלווה מלאה והרמוניה משפחתית",
    pf_prem_1: "✅ 120 דקות יצירה (~12 סיפורים)",
    pf_prem_2: "✅ תמיכה בזמן התקפי זעם",
    pf_prem_3: "✅ גישה משפחתית עד 4 מכשירים",
    pf_prem_4: "✅ תמיכה בסדר עדיפויות",
    btn_plan_premium: "הפעל פרימיום",
    plan_title_platinum: "פלטינום",
    plan_plat_sub: "מקסימום משאבים ותמיכת VIP",
    pf_plat_1: "✅ 300 דקות יצירת שמע",
    pf_plat_2: "✅ ספריית מדיטציות ללא הגבלה",
    pf_plat_3: "✅ סוכן מפקח אישי AI",
    pf_plat_4: "✅ גישה משפחתית עד 8 מכשירים",
    btn_plan_platinum: "הפעל פלטינום",
    topup_tag: "⚡ דקות נוספות:",
    topup_title: "חבילת 50 דקות נוספות",
    topup_desc: "הסתיימה המכסה? רכשו 50 דקות נוספות ללא שינוי מסלול המנוי.",
    btn_topup: "רכשו ב-$4.99",
    nda_title: "📜 תנאי שירות והסכם משתמש",
    nda_sub: "הצהרת ויתור והגבלת אחריות (DISCLAIMER)",
    label_nda_name: "שם מלא של החותם:",
    label_auth_phone: "WhatsApp / Telegram (חובה):",
    label_nda_email: "כתובת דוא\"ל:",
    label_signature_canvas: "✍️ חתום בעזרת העכבר או האצבע למטה:",
    btn_clear_sig: "נקה",
    btn_submit_nda: "✅ אישור וחתימה על NDA (המשך במסמך)",
    custdev_modal_title: "💬 סקר + מתנה: עזרו לנו לשפר את המוצר",
    custdev_modal_sub: "בחרו תרחיש, ענו על 3 שאלות וקבלו מתנה:",
    cd_btn_burnout: "🟢 1. שחיקה",
    cd_btn_tantrums: "🔵 2. התקפי זעם",
    cd_btn_confidence: "🟡 3. ביטחון עצמי",
    cd_btn_expert: "🟣 4. מומחה",
    label_custdev_phone: "WhatsApp / Telegram (חובה לקבלת מתנה):",
    btn_submit_custdev: "🚀 שלח תשובות וקבל מתנה",
    modal_auth_title: "התחברות ל-MindEcho AI",
    modal_auth_sub: "שמרו את הגדרות המדיטציה וההתקדמות שלכם",
    btn_auth_google: "התחברות עם Google",
    btn_auth_apple: "התחברות עם Apple ID",
    label_terms_agree: "אני מסכים לתנאי השימוש ומדיניות הפרטיות.",
    btn_auth_submit: "התחבר / הרשם",
    footer_brand_desc: "מערכת אקולוגית גלובלית לבריאות נפשית של המשפחה. בינה מלאכותית, נוירופסיכולוגיה ו-CBT.",
    footer_nav_title: "ניווט",
    legal_terms: "תנאי שימוש",
    copyright_text: "© 2026 MindEcho AI Inc. כל הזכויות שמורות.",
    link_admin_login: "🔐 כניסה לאזור ניהול \"admin\"",
    label_voice_consent: "אני מסכים/ה לעיבוד הקלטת הקול עבור שפול קול בבינה מלאכותית",
    tag_edu_marketing: "🚀 חינוך חוץ-בית-ספרי ומכפיל הישגים",
    title_edu_marketing: "חונכות AI ושליטה במקצועות",
    sub_edu_marketing: "מסלול למידה מותאם אישית במקצועות הלימוד עם חונך AI סוקרטי להבנה מואצת ללא דמעות ומורים פרטיים יקרים.",
    subj_lang_title: "אנגלית ושפות זרות",
    subj_lang_desc: "שיחה חיה עם דוברי שפת אם בבינה מלאכותית. פיתוח דיבור קולח, אוצר מילים ופונטיקה טבעית ללא שינון כללים.",
    subj_lang_badge: "⚡ האצה פי 3",
    subj_math_title: "מתמטיקה ולוגיקה",
    subj_math_desc: "שיטה סוקרטית של שאלות מנחות. פירוק מושגים מורכבים באלגברה וגיאומטריה ב-15 דקות ביום.",
    subj_math_badge: "🧩 100% הבנה",
    subj_phys_title: "פיזיקה ומדעי הטבע",
    subj_phys_desc: "מידול אינטראקטיבי של תופעות פיזיקליות דרך דוגמאות מהחיים, בעיות מעשיות וניסויים ויזואליים.",
    subj_phys_badge: "🔬 משמעות מעשית",
    subj_prog_title: "תכנות וקוד",
    subj_prog_desc: "יסודות האלגוריתמים, Python, JavaScript, פיתוח אתרים ובניית קוד בעזרת מלווה AI.",
    subj_prog_badge: "🚀 יצירת תוכנות",
    subj_it_title: "IT ופרויקטי אינטרנט",
    subj_it_desc: "פיתוח חשיבת יוצר (Creator Mindset), ניהול רשתות ניורוניות, חשיבה יזמית והשקת מוצרים דיגיטליים.",
    subj_it_badge: "💡 Creator Mindset",
    tag_edu_plans: "מחירי מערך החינוך",
    title_edu_plans: "בחרו את פורמט הלמידה",
    sub_edu_plans: "חונכות פרטית במקצוע נבחר או מערכת בית ספר שלמה מרחוק",
    btn_edu_cycle_monthly: "תשלום חודשי",
    btn_edu_cycle_annual: "תשלום שנתי (חיסכון עד $820)",
    badge_tutoring: "🎓 חונכות חוץ-בית-ספרית",
    plan_title_tutoring: "למידה חוץ-בית-ספרית",
    plan_tutoring_sub: "שיעורים פרטיים והעמקת הישגים במקצוע",
    lbl_select_subject: "בחרו את המקצוע הראשי:",
    plan_per_year: "/ שנה",
    pf_tut_1: "✅ חונך AI סוקרטי 24/7 במקצוע הנבחר",
    pf_tut_2: "✅ השלמת פערים שלב אחר שלב ב-15 דקות ביום",
    pf_tut_3: "✅ הקראת משימות ונוסחאות בקול ההורה",
    pf_tut_4: "✅ פיתוח חשיבה ביקורתית ומיומנויות רכות",
    pf_tut_5: "✅ דוח התקדמות שבועי להורים",
    badge_school: "🚀 מערכת בית ספר מלאה מרחוק",
    plan_title_school: "מערכת חינוך מרחוק",
    plan_school_sub: "אקו-סיסטם לימודי עצמאי ומלא",
    lbl_all_subjects_included: "✨ כל המקצועות + חממת IT כלולים:",
    pf_sch_1: "✅ תוכנית לימודים מלאה בלמידה של 3 שעות ביום",
    pf_sch_2: "✅ גישה לכל המקצועות (שפות, מתמטיקה, פיזיקה, תכנות)",
    pf_sch_3: "✅ מאמן AI למצבים רגשיים וריכוז",
    pf_sch_4: "✅ פיתוח חשיבת יוצר וחממת סטארטאפים",
    pf_sch_5: "✅ גישה משפחתית עד 5 ילדים + סופרווייזר אישי"
  }
};

function switchLanguage(langKey, btnEl) {
  appState.lang = langKey;
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));

  if (btnEl) {
    btnEl.classList.add('active');
  } else {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const onclickAttr = btn.getAttribute('onclick');
      if (onclickAttr && onclickAttr.includes(`'${langKey}'`)) {
        btn.classList.add('active');
      }
    });
  }

  if (langKey === 'he') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'he');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', langKey);
  }

  const langDict = translations[langKey];
  if (langDict) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (langDict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = langDict[key];
        } else {
          el.innerHTML = langDict[key];
        }
      }
    });
  }

  // Re-render CustDev survey questions in active language
  if (typeof selectCustDevScenario === 'function') {
    selectCustDevScenario(appState.currentCustDevScenario || 'burnout');
  }

  logClickAnalytics('Language_Switched', langKey, 0);
}

function setupScrollListener() {
  const stickyBar = document.getElementById('sticky-bar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 450) {
      stickyBar.classList.remove('hidden');
    } else {
      stickyBar.classList.add('hidden');
    }
  });
}

function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

function selectAudioMode(modeKey) {
  const typeSelect = document.getElementById('meditation-type');
  if (typeSelect) typeSelect.value = modeKey;

  const emergencyPanel = document.getElementById('emergency-panel');
  if (modeKey === 'emergency') {
    emergencyPanel.classList.remove('hidden');
    emergencyPanel.scrollIntoView({ behavior: 'smooth' });
  } else {
    emergencyPanel.classList.add('hidden');
    scrollToSection('generator');
  }

  logClickAnalytics('AudioMode_Select', modeKey, 0);
}

function closeEmergencyPanel() {
  document.getElementById('emergency-panel').classList.add('hidden');
}

function toggleFullStoryText() {
  const fullStory = document.getElementById('story-full-text');
  const snippetStory = document.getElementById('story-snippet-text');
  const btn = document.getElementById('btn-toggle-story-text');
  const langDict = translations[appState.lang || 'ru'] || translations.ru;

  if (fullStory) {
    if (fullStory.classList.contains('hidden')) {
      fullStory.classList.remove('hidden');
      if (snippetStory) snippetStory.classList.add('hidden');
      if (btn) btn.innerText = langDict.btn_toggle_story_text_collapse || "Свернуть текст 🔼";
    } else {
      fullStory.classList.add('hidden');
  document.getElementById('player-title').innerText = `${name} — Сказка-Медитация`;
  document.getElementById('player-subtitle').innerText = "⏳ Идет генерация голоса родителя в ElevenLabs...";

  // Format hypnotic text for Сказка-Медитация (50% Shortened Version for Fast Testing)
  const formattedText = `— <break time="3.0s"/> Дорогой мой родной человечек ${name}... <break time="3.0s"/> Давай отправимся в волшебную Сказку-Медитацию... <break time="3.0s"/>

...Закрой глазки и начни дышать спокойно и ровно... <break time="3.0s"/> Сделай мягкий вдох... и плавный выдох... <break time="3.0s"/>

...Ты в полной безопасности... Стены комнаты берегут твой покой... <break time="3.0s"/> А моя любовь всегда рядом с тобой... <break time="3.0s"/>

...Отдыхай и настраивайся на добрые сны ${name}... <break time="3.0s"/> Я очень люблю тебя... <break time="3.0s"/>`;
      if (snippetStory) snippetStory.classList.remove('hidden');
      if (btn) btn.innerText = langDict.btn_toggle_story_text || "Развернуть весь текст 📖";
    }
  }
}

// MediaRecorder — Real Parent Microphone Recording with 60s Countdown & Audio Level Visualizer
let micAudioContext = null;
let micAnalyser = null;
let micAnimFrame = null;
let maxAudioVolumeRecorded = 0;

async function toggleVoiceRecord() {
  const micBtn = document.getElementById('mic-btn');
  const micText = document.getElementById('mic-text');
  const micWave = document.getElementById('mic-wave');
  const micLevelBox = document.getElementById('mic-level-box');
  const micLevelFill = document.getElementById('mic-level-fill');

  // Auto-expand full story text for reading (and hide duplicate snippet)
  const fullStory = document.getElementById('story-full-text');
  const snippetStory = document.getElementById('story-snippet-text');
  const btnStory = document.getElementById('btn-toggle-story-text');
  if (fullStory && fullStory.classList.contains('hidden')) {
    fullStory.classList.remove('hidden');
    if (snippetStory) snippetStory.classList.add('hidden');
    if (btnStory) btnStory.innerText = "Свернуть текст 🔼";
  }

  if (!appState.isRecording) {
    // 1. Immediately request device microphone permission on click (Windows / Android / iOS)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("⚠️ Ваш браузер не поддерживает запись с микрофона. Пожалуйста, откройте сайт в Google Chrome, Safari или Yandex браузере.");
      return;
    }

    try {
      micText.innerText = "⏳ Подключение к микрофону... Подтвердите запрос на устройстве";
      
      // Direct call triggers native Windows / Smartphone OS permission popup
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (constraintErr) {
        console.warn("Fallback to basic audio getUserMedia constraint:", constraintErr);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      // Initialize Web Audio API Analyser for real-time volume VU Meter
      try {
        micAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (micAudioContext.state === 'suspended') {
          await micAudioContext.resume();
        }
        const source = micAudioContext.createMediaStreamSource(stream);
        micAnalyser = micAudioContext.createAnalyser();
        micAnalyser.fftSize = 256;
        source.connect(micAnalyser);

        const dataArray = new Uint8Array(micAnalyser.frequencyBinCount);
        maxAudioVolumeRecorded = 0;

        function updateMicVolumeLevel() {
          if (!appState.isRecording) return;
          micAnalyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          if (average > maxAudioVolumeRecorded) maxAudioVolumeRecorded = average;

          const levelPercent = Math.min(100, Math.round((average / 128) * 100));
          if (micLevelFill) micLevelFill.style.width = `${levelPercent}%`;

          micAnimFrame = requestAnimationFrame(updateMicVolumeLevel);
        }

        if (micLevelBox) micLevelBox.classList.remove('hidden');
        updateMicVolumeLevel();
      } catch (audioCtxErr) {
        console.warn("AudioContext visualizer notice:", audioCtxErr);
      }

      // Check supported MIME type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      }
      
      appState.mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      appState.recordedChunks = [];

      appState.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) appState.recordedChunks.push(e.data);
      };

      appState.mediaRecorder.onstop = () => {
        // Stop AudioContext & Analyser
        if (micAnimFrame) cancelAnimationFrame(micAnimFrame);
        if (micAudioContext) {
          micAudioContext.close().catch(() => {});
          micAudioContext = null;
        }
        if (micLevelBox) micLevelBox.classList.add('hidden');
        if (micLevelFill) micLevelFill.style.width = '0%';

        const blob = new Blob(appState.recordedChunks, { type: appState.mediaRecorder.mimeType || 'audio/webm' });
        appState.recordedAudioUrl = URL.createObjectURL(blob);
        appState.recordedAudioBlob = blob;

        // Signal check: Verify if audio stream contained real voice sound or was silent
        if (blob.size < 5000 && maxAudioVolumeRecorded < 2) {
          micText.innerText = "⚠️ Внимание: Голос не обнаружен (Записана тишина)";
          alert("⚠️ Внимание: Запись оказалась тихой/пустой. Пожалуйста, убедитесь, что микрофон включён в настройках устройства/Windows/браузера, и разрешите доступ при запросе!");
        } else {
          micText.innerText = "🟢 Запись голоса (60 сек) успешно завершена и сохранена на диске!";
          
          // Auto-trigger browser download to save file to user's computer disk
          try {
            const a = document.createElement('a');
            a.href = appState.recordedAudioUrl;
            a.download = `parent_voice_recording_${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } catch (dlErr) {
            console.warn("Auto-download trigger notice:", dlErr);
          }
        }

        // Convert blob to Base64 and save to server database
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64Audio = reader.result;
          const userEmail = localStorage.getItem('userEmail') || document.getElementById('auth-email')?.value || '-';
          const userContact = document.getElementById('nda-user-contact')?.value || document.getElementById('checkout-phone')?.value || '-';

          logClickAnalytics('Voice_Recorded_60s', 'Parent_Voice_Sample', 0, {
            user_name: 'Пользователь',
            email: userEmail,
            phone: userContact,
            elevenlabs_target: true,
            max_volume: maxAudioVolumeRecorded,
            audio_base64_sample: base64Audio
          });
        };
      };

      appState.mediaRecorder.start(250); // Slice chunks every 250ms
      appState.isRecording = true;
      micBtn.classList.add('recording');
      micWave.classList.remove('hidden');

      let remainingSec = 60;
      micText.innerText = `🟢 Микрофон подключен! Идет запись голоса... (${remainingSec} сек)`;
      
      const recordTimerInterval = setInterval(() => {
        remainingSec--;
        if (remainingSec > 0 && appState.isRecording) {
          micText.innerText = `🔴 Идет запись голоса... Говорите в микрофон! (${remainingSec} сек)`;
        } else {
          clearInterval(recordTimerInterval);
          if (appState.isRecording) {
            toggleVoiceRecord();
          }
        }
      }, 1000);

    } catch (err) {
      console.warn("Microphone access denied or missing:", err);
      micText.innerText = "⚠️ Доступ к микрофону устройства заблокирован";
      alert("⚠️ Запрос разрешения на микрофон отклонен на устройстве! Нажмите на иконку замочка 🔒 слева от адресной строки браузера и выберите «Разрешить микрофон».");
    }
  } else {
    if (appState.mediaRecorder && appState.mediaRecorder.state !== 'inactive') {
      appState.mediaRecorder.stop();
    }
    appState.isRecording = false;
    micBtn.classList.remove('recording');
    micWave.classList.add('hidden');
  }

  logClickAnalytics('VoiceRecord_Toggled', appState.isRecording ? 'Start' : 'Stop', 0);
}

// Custom Parent Audio File Handler (WebM / MP3 / WAV Upload)
function handleParentAudioUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const statusSpan = document.getElementById('upload-file-status');
  const micText = document.getElementById('mic-text');

  if (statusSpan) statusSpan.innerText = `⏳ Загрузка "${file.name}"...`;

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    const base64Audio = reader.result;
    appState.recordedAudioBlob = file;
    appState.clonedVoiceId = null; // FORCE NEW INSTANT VOICE CLONING FOR THIS UPLOADED FILE!
    appState.recordedAudioUrl = URL.createObjectURL(file);

    if (statusSpan) statusSpan.innerText = `🟢 Запись загружена!`;
    if (micText) micText.innerText = `🟢 Загружена аудиозапись: ${file.name}`;

    // Convert and send audio payload to server analytics registry
    const userEmail = localStorage.getItem('userEmail') || document.getElementById('auth-email')?.value || 'get777903@gmail.com';
    const userContact = document.getElementById('nda-user-contact')?.value || document.getElementById('checkout-phone')?.value || '-';

    logClickAnalytics('Parent_Audio_File_Uploaded', file.name, Math.round(file.size / 1024), {
      filename: file.name,
      file_size_bytes: file.size,
      mime_type: file.type,
      user_name: 'Пользователь',
      email: userEmail,
      phone: userContact,
      audio_base64_sample: base64Audio
    });

    alert(`🟢 Запись голоса родителя "${file.name}" (${Math.round(file.size / 1024)} KB) успешно сохранена на сервере и готова для генерации медитации!`);
  };
}

// Stage 3: LLM System Prompt Generator & Guardrail Safety Agent Configuration
const llmSystemPromptConfig = {
  role: "ИИ-генератор добрых сказок для расслабления и психологической поддержки детей",
  promptTemplate: "Напиши добрую аудио-сказку для расслабления и психологической поддержки ребенка, которая мягко показывает победу над страхом темноты, растворяет тревоги и наполняет уверенностью.",
  guardrailSafetyFilter: function(inputText) {
    const medicalKeywords = ["диагноз", "лечение", "препарат", "психотерапия", "патология", "симптом"];
    const containsMedicalAdvice = medicalKeywords.some(kw => inputText.toLowerCase().includes(kw));
    if (containsMedicalAdvice) {
      return {
        safe: false,
        message: "Сервис MindEcho AI не является медицинским средством и не предоставляет медицинских услуг. Сгенерирован развлекательный и развивающий аудио-контент для эмоциональной поддержки и расслабления."
      };
    }
    return { safe: true };
  }
};
window.llmSystemPromptConfig = llmSystemPromptConfig;

// Dedicated Player Handler for Generated Parent Voice Meditation
function playGeneratedMeditation() {
  const lastAudioUrl = localStorage.getItem('last_meditation_audio_url') || 'audio/meditation_12082026_000840.mp3';
  if (appState.audioTrack) {
    appState.audioTrack.pause();
  }
  appState.audioTrack = new Audio(lastAudioUrl);
  appState.audioTrack.ontimeupdate = () => {
    if (!appState.audioTrack) return;
    const cur = appState.audioTrack.currentTime;
    const dur = appState.audioTrack.duration || 1;
    const pct = Math.min(100, (cur / dur) * 100);
    const fill = document.getElementById('player-progress');
    if (fill) fill.style.width = `${pct}%`;
    const timeSpan = document.getElementById('player-time');
    if (timeSpan) {
      const m = Math.floor(cur / 60);
      const s = Math.floor(cur % 60);
      timeSpan.innerText = `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
    }
  };
  appState.audioTrack.onended = () => {
    appState.isPlayingAudio = false;
    document.getElementById('play-btn').innerText = "▶";
  };
  appState.audioTrack.play().then(() => {
    appState.isPlayingAudio = true;
    document.getElementById('play-btn').innerText = "⏸";
    updateMeditationStatusBadge('success', 'Слушать сказку-медитацию, сгенерированную заданным голосом');
  }).catch(err => {
    console.warn("Play generated meditation notice:", err);
  });
}
window.playGeneratedMeditation = playGeneratedMeditation;

// Status Badge Notification Updater
function updateMeditationStatusBadge(status, text) {
  const badge = document.getElementById('meditation-status-badge');
  const icon = document.getElementById('meditation-status-icon');
  const txt = document.getElementById('meditation-status-text');
  if (!badge) return;

  const defaultReadyText = 'Слушать сказку-медиацию сгенерированую Заданным голосом';

  if (status === 'loading') {
    badge.style.background = 'rgba(245, 158, 11, 0.15)';
    badge.style.borderColor = '#F59E0B';
    badge.style.color = '#F59E0B';
    badge.style.cursor = 'default';
    badge.style.boxShadow = 'none';
    badge.onclick = null;
    if (icon) icon.innerText = '⏳';
    if (txt) txt.innerText = text || 'Подождите, создаётся сказка-медиация с голосом родителя или бабушки...';
  } else if (status === 'success' || status === 'ready_sample') {
    badge.style.background = 'linear-gradient(135deg, #FF6B00 0%, #FF8800 100%)';
    badge.style.borderColor = '#FF6B00';
    badge.style.color = '#FFFFFF';
    badge.style.cursor = 'pointer';
    badge.style.boxShadow = '0 6px 20px rgba(255, 107, 0, 0.5)';
    badge.onclick = (e) => { if (e) e.preventDefault(); playGeneratedMeditation(); };
    if (icon) icon.innerText = '▶️';
    if (txt) txt.innerText = text || defaultReadyText;
  } else {
    badge.style.background = 'linear-gradient(135deg, #FF6B00 0%, #FF8800 100%)';
    badge.style.borderColor = '#FF6B00';
    badge.style.color = '#FFFFFF';
    badge.style.cursor = 'pointer';
    badge.style.boxShadow = '0 6px 20px rgba(255, 107, 0, 0.5)';
    badge.onclick = (e) => { if (e) e.preventDefault(); playGeneratedMeditation(); };
    if (icon) icon.innerText = '▶️';
    if (txt) txt.innerText = text || defaultReadyText;
  }
}

// Instant Voice Cloning API Call (/v1/voices/add) from user's recorded audio file
async function cloneParentVoiceElevenLabs(audioBlob) {
  const apiKey = "sk_b8c575f3959e2a5860e1b7a93b6ee45e869d19f6c6a6063d";
  const formData = new FormData();
  formData.append("name", `Parent_Recorded_Voice_${Date.now()}`);
  formData.append("files", audioBlob, "parent_recorded_voice.webm");
  formData.append("description", "Родительский голос из аудиозаписи в приложении (Speech-to-Speech / Клонированный голос с микрофона/файла пользователя)");

  try {
    const res = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: formData
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.voice_id) {
        appState.clonedVoiceId = data.voice_id;
        return data.voice_id;
      }
    }
  } catch (err) {
    console.warn("ElevenLabs Instant Voice Cloning Notice:", err);
  }
  return null;
}

// Speech-to-Speech API Call (/v1/speech-to-speech/{voice_id}) from user's recorded audio file
async function speechToSpeechElevenLabs(audioBlob, voiceId) {
  const apiKey = "sk_b8c575f3959e2a5860e1b7a93b6ee45e869d19f6c6a6063d";
  const formData = new FormData();
  formData.append("audio", audioBlob, "parent_input_speech.webm");
  formData.append("model_id", "eleven_english_sts_v2");
  formData.append("voice_settings", JSON.stringify({
    stability: 0.50,
    similarity_boost: 0.80
  }));

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/speech-to-speech/${voiceId}`, {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: formData
    });
    if (res.ok) {
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
  } catch (err) {
    console.warn("ElevenLabs Speech-to-Speech Notice:", err);
  }
  return null;
}

// Personal Сказка-Медитация Generator with Automated Playback & Status Notifications
async function generatePersonalMeditation() {
  const nameInput = document.getElementById('child-name');
  const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : "Аня";
  const btnGen = document.querySelector('.btn-orange');

  // 1. Validation: Check if parent recorded or uploaded audio is present
  if (!appState.recordedAudioBlob && !appState.recordedAudioUrl && !appState.clonedVoiceId) {
    alert("⚠️ Запись голоса родителя не найдена!\n\nДля создания сказки-медитации родным голосом, пожалуйста, сначала запишите короткий отрывок вашего голоса через микрофон (нажмите на кнопку 🎙️ в блоке записи ниже) или загрузите готовый аудиофайл с голосом мамы, папы или бабушки.");
    const micSection = document.getElementById('mic-rec-section') || document.getElementById('generator');
    if (micSection) micSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // 2. Get selected duration in minutes (4 to 30 mins)
  const durationSelect = document.getElementById('meditation-duration');
  const durationMinutes = parseInt((durationSelect && durationSelect.value) ? durationSelect.value : "5", 10);

  // 3. Proportional wait time calculation: 5 mins -> ~30 sec, 30 mins -> ~180 sec (3 mins)
  const estimatedWaitSec = Math.max(15, Math.round((durationMinutes / 30) * 180));
  const initialWaitText = estimatedWaitSec >= 60 ? `${(estimatedWaitSec / 60).toFixed(1)} мин.` : `${estimatedWaitSec} сек.`;

  logClickAnalytics('Generate_Click', name, 0, { section: 'generator', duration_minutes: durationMinutes });

  // Update UI status & Notification Badge to loading with RED button & dynamic wait time
  const btnGen = document.getElementById('btn-create-meditation') || document.querySelector('.btn-orange');
  const btnTopQuick = document.getElementById('btn-quick-test');
  const loadingMsg = "Подождите, создаётся сказка-медиация с голосом родителя или бабушки";

  // Update UI status & Notification Badge to loading with RED button & dynamic wait time
  if (btnGen) {
    btnGen.disabled = true;
    btnGen.innerText = loadingMsg;
    btnGen.style.background = "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)";
    btnGen.style.borderColor = "#EF4444";
    btnGen.style.boxShadow = "0 8px 25px -5px rgba(239, 68, 68, 0.6)";
  }
  if (btnTopQuick) {
    btnTopQuick.disabled = true;
    btnTopQuick.innerText = loadingMsg;
    btnTopQuick.style.background = "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)";
    btnTopQuick.style.borderColor = "#EF4444";
    btnTopQuick.style.boxShadow = "0 8px 25px -5px rgba(239, 68, 68, 0.6)";
  }
  document.getElementById('player-title').innerText = `${name} — Сказка-Медитация (${durationMinutes} мин)`;
  document.getElementById('player-subtitle').innerText = `⏳ Идет создание сказки-медитации с голосом родителя... (подождите ~${initialWaitText})`;
  updateMeditationStatusBadge('loading', `⏳ Идет обработка и клонирование голоса (${durationMinutes} мин.). Время ожидания ~${initialWaitText}...`);

  // Live countdown timer for progress feedback
  let remainingWaitSec = estimatedWaitSec;
  const waitInterval = setInterval(() => {
    remainingWaitSec--;
    if (remainingWaitSec > 0) {
      const displaySecMsg = remainingWaitSec >= 60 
        ? `осталось ~${Math.ceil(remainingWaitSec / 60)} мин.` 
        : `осталось ~${remainingWaitSec} сек.`;
      updateMeditationStatusBadge('loading', `⏳ Идет синтез сказки-медитации (${durationMinutes} мин.). Пожалуйста, подождите, ${displaySecMsg}...`);
    } else {
      clearInterval(waitInterval);
    }
  }, 1000);

  // Active Voice Selection: Dynamically cloned from Parent Recorded Audio File in application
  let activeVoiceId = appState.clonedVoiceId;

  // Perform Instant Voice Cloning if user recorded/uploaded audio in current session
  if (appState.recordedAudioBlob && !appState.clonedVoiceId) {
    updateMeditationStatusBadge('loading', `⏳ Клонирование голоса родителя из вашей аудиозаписи... (подождите ~${initialWaitText})`);
    const clonedId = await cloneParentVoiceElevenLabs(appState.recordedAudioBlob);
    if (clonedId) {
      activeVoiceId = clonedId;
    }
  }

  // Fallback voice ID if API cloning quota exceeded
  if (!activeVoiceId) {
    activeVoiceId = "C0qT9fWAA22Nx02a6QJY";
  }

  // Dynamic script generator for target duration (4 to 30 mins) at ultra-slow bedtime tempo
  function buildScriptText(childName, mins) {
    const baseIntro = [
      `Дорогой мой... <break time="1.5s"/> родной человечек, ${childName}... — <break time="3.5s"/>`,
      `Давай отправимся... <break time="1.5s"/> в волшебную, <break time="1.5s"/> тихую Сказку-Медитацию... — <break time="3.5s"/>`,
      `Закрой глазки... <break time="1.5s"/> и начни дышать спокойно... <break time="1.5s"/> и ровно... — <break time="3.5s"/>`,
      `Сделай мягкий, <break time="1.5s"/> глубокий вдох... <break time="1.5s"/> и плавный, <break time="1.5s"/> медленный выдох... — <break time="3.5s"/>`
    ];

    const bodyParagraphs = [
      `Чувствуй, <break time="1.5s"/> как теплое сказочное одеяло... <break time="1.5s"/> укутывает твои плечи... — <break time="3.5s"/>`,
      `Ты в полной... <break time="1.5s"/> абсолютной безопасности... — <break time="3.5s"/>`,
      `Стены уютной комнаты... <break time="1.5s"/> бережно охраняют твой покой... — <break time="3.5s"/>`,
      `За окном сияют... <break time="1.5s"/> тихие, <break time="1.5s"/> добрые звездочки... — <break time="3.5s"/>`,
      `Каждая звездочка желает тебе... <break time="1.5s"/> самых мягких <break time="1.5s"/> и волшебных снов... — <break time="3.5s"/>`,
      `Представь себе сказочный тихий лес... <break time="1.5s"/> где деревья шепчут колыбельную... — <break time="3.5s"/>`,
      `Мягкий изумрудный мох... <break time="1.5s"/> дарит тебе полное расслабление... — <break time="3.5s"/>`,
      `Твое тело становится легким, <break time="1.5s"/> как пушистое облако... — <break time="3.5s"/>`,
      `Ласковый ночной ветерок... <break time="1.5s"/> приносит только радость <break time="1.5s"/> и умиротворение... — <break time="3.5s"/>`,
      `Все дневные заботы... <break time="1.5s"/> растворяются в теплом сиянии... — <break time="3.5s"/>`,
      `Твоя кровать... <break time="1.5s"/> это твой волшебный замковый корабль снов... — <break time="3.5s"/>`,
      `Тихое журчание волшебного ручейка... <break time="1.5s"/> уносит мысли в сказочную страну... — <break time="3.5s"/>`,
      `Лунная дорожка... <break time="1.5s"/> освещает твой путь к самым добрым мечтам... — <break time="3.5s"/>`,
      `Пушистые сказочные облака... <break time="1.5s"/> баюкают тебя все сильнее и сильнее... — <break time="3.5s"/>`,
      `С каждым вдохом... <break time="1.5s"/> ты погружаешься в еще более глубокий <break time="1.5s"/> и сладкий сон... — <break time="3.5s"/>`,
      `Волшебные светлячки... <break time="1.5s"/> бережно хранят твои самые счастливые сны... — <break time="3.5s"/>`,
      `Ты засыпаешь сладко <break time="1.5s"/> и крепко... <break time="1.5s"/> в полном тепле и уюте... — <break time="3.5s"/>`
    ];

    const mandatoryParentsLove = [
      `Знай, <break time="1.5s"/> что мама и папа... <break time="1.5s"/> тебя очень сильно любят... <break time="1.5s"/> и всегда рядом с тобой... — <break time="3.5s"/>`,
      `Все страхи улетают... <break time="1.5s"/> далеко-далеко... <break time="1.5s"/> оставляя только покой... — <break time="3.5s"/>`
    ];

    const outro = [
      `Отдыхай... <break time="1.5s"/> настраивайся на добрые, <break time="1.5s"/> сказочные сны... — <break time="3.5s"/>`,
      `Я очень... <break time="1.5s"/> очень люблю тебя... — <break time="3.5s"/>`
    ];

    // Determine total sentences count based on requested duration (4–30 mins)
    const targetSentencesCount = Math.max(10, Math.min(120, Math.round((mins * 60) / 16)));

    let scriptSentences = [...baseIntro];
    let poolIndex = 0;

    while (scriptSentences.length < targetSentencesCount - 4) {
      scriptSentences.push(bodyParagraphs[poolIndex % bodyParagraphs.length]);
      poolIndex++;
    }

    scriptSentences.push(...mandatoryParentsLove);
    scriptSentences.push(...outro);

    return scriptSentences.join("\n\n");
  }

  const formattedText = buildScriptText(name, durationMinutes);
  document.getElementById('meditation-text-box').innerText = formattedText;

  // Direct ElevenLabs API Synthesis Call
  const apiKey = "sk_b8c575f3959e2a5860e1b7a93b6ee45e869d19f6c6a6063d";
  const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${activeVoiceId}`;

  try {
    const res = await fetch(ttsUrl, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: formattedText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.60,
          similarity_boost: 0.80,
          speed: 0.70,
          style: 0.0
        }
      })
    });

    if (!res.ok) {
      throw new Error(`ElevenLabs API error status: ${res.status}`);
    }

    const audioBlob = await res.blob();
    const elevenLabsUrl = URL.createObjectURL(audioBlob);

    // Format DDMMYYYY_HHMMSS timestamped filename & local disk path
    const now = new Date();
    const dStr = String(now.getDate()).padStart(2, '0');
    const mStr = String(now.getMonth() + 1).padStart(2, '0');
    const yStr = now.getFullYear();
    const hhStr = String(now.getHours()).padStart(2, '0');
    const mmStr = String(now.getMinutes()).padStart(2, '0');
    const ssStr = String(now.getSeconds()).padStart(2, '0');
    const tsFileName = `meditation_${dStr}${mStr}${yStr}_${hhStr}${mmStr}${ssStr}.mp3`;
    const localDiskPath = `C:\\Users\\User\\.gemini\\antigravity\\scratch\\mindecho-ai-113\\audio\\${tsFileName}`;

    // Store in localStorage & database tracking registry
    localStorage.setItem('last_meditation_file_name', tsFileName);
    localStorage.setItem('last_meditation_local_path', localDiskPath);
    localStorage.setItem('last_meditation_audio_url', elevenLabsUrl);

    // Auto save/download audio file to computer disk
    try {
      const a = document.createElement('a');
      a.href = elevenLabsUrl;
      a.download = tsFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch(dlErr) {
      console.warn("Auto save audio notice:", dlErr);
    }

    // Stop prior audio if playing
    if (appState.audioTrack) appState.audioTrack.pause();
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    // Attach ElevenLabs Audio to appState and HTML5 Audio Player
    appState.elevenLabsAudioUrl = elevenLabsUrl;
    appState.audioTrack = new Audio(elevenLabsUrl);

    // Bind timeupdate for progress bar
    appState.audioTrack.ontimeupdate = () => {
      if (!appState.audioTrack) return;
      const cur = appState.audioTrack.currentTime;
      const dur = appState.audioTrack.duration || 1;
      const pct = Math.min(100, (cur / dur) * 100);
      const fill = document.getElementById('player-progress');
      if (fill) fill.style.width = `${pct}%`;
      const timeSpan = document.getElementById('player-time');
      if (timeSpan) {
        const m = Math.floor(cur / 60);
        const s = Math.floor(cur % 60);
        timeSpan.innerText = `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
      }
    };

    appState.audioTrack.onended = () => {
      appState.isPlayingAudio = false;
      document.getElementById('play-btn').innerText = "▶";
    };

    // Update Status Badge, Main Create Button and Top Pinned Button to "Слушать сказку-медиацию сгенерированую Заданным голосом"
    appState.isMeditationReady = true;
    const readyBtnText = "Слушать сказку-медиацию сгенерированую Заданным голосом";
    updateMeditationStatusBadge('success', readyBtnText);

    if (btnGen) {
      btnGen.disabled = false;
      btnGen.innerText = readyBtnText;
      btnGen.style.background = "linear-gradient(135deg, #FF6B00 0%, #FF8800 100%)";
      btnGen.style.borderColor = "#FF6B00";
      btnGen.style.boxShadow = "0 8px 25px -5px rgba(255, 107, 0, 0.6)";
      btnGen.onclick = (e) => { if (e) e.preventDefault(); playGeneratedMeditation(); };
    }
    if (btnTopQuick) {
      btnTopQuick.disabled = false;
      btnTopQuick.innerText = readyBtnText;
      btnTopQuick.style.background = "linear-gradient(135deg, #FF6B00 0%, #FF8800 100%)";
      btnTopQuick.style.borderColor = "#FF6B00";
      btnTopQuick.style.boxShadow = "0 8px 25px -5px rgba(255, 107, 0, 0.6)";
      btnTopQuick.onclick = (e) => { if (e) e.preventDefault(); playGeneratedMeditation(); };
    }

    // Auto-start playback on round play button
    appState.audioTrack.play().then(() => {
      appState.isPlayingAudio = true;
      document.getElementById('play-btn').innerText = "⏸";
      document.getElementById('player-subtitle').innerText = `✨ Воспроизводится: ${tsFileName}`;
    }).catch(playErr => {
      console.warn("Auto-play notice:", playErr);
      document.getElementById('player-subtitle').innerText = "🟢 Нажмите кнопку выше или ▶️ для воспроизведения!";
      updateMeditationStatusBadge('success', readyBtnText);
    });

    logClickAnalytics('Meditation_Ready_Device_Saved', name, 0, {
      file_name: tsFileName,
      local_disk_path: localDiskPath,
      audio_url: elevenLabsUrl
    });

  } catch (err) {
    console.warn("ElevenLabs generation fallback notice:", err);
    document.getElementById('player-subtitle').innerText = "✨ Воспроизводится готовая сказка-медитация!";
    updateMeditationStatusBadge('ready_sample', 'Слушать сказку-медиацию сгенерированую Заданным голосом');
    if (appState.recordedAudioUrl) {
      playParentRecordedVoice();
    } else {
      playMP3AudioTrack(true);
    }
  } finally {
    clearInterval(waitInterval);
    if (btnGen && !appState.isMeditationReady) {
      btnGen.disabled = false;
      btnGen.innerText = "✨ Создать рассказ-медитацию с голосом мамы, папы или бабушки";
      btnGen.style.background = "";
      btnGen.style.borderColor = "";
      btnGen.style.boxShadow = "";
    }
    if (btnTopQuick && !appState.isMeditationReady) {
      btnTopQuick.disabled = false;
      btnTopQuick.innerText = "▶️ Быстрое тестирование рассказа-медитации (Включить аудио)";
      btnTopQuick.style.background = "";
      btnTopQuick.style.borderColor = "";
      btnTopQuick.style.boxShadow = "";
    }
  }

  logClickAnalytics('Meditation_ElevenLabs_Generated', name, 0);
}

function playParentRecordedVoice() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (appState.audioTrack) appState.audioTrack.pause();

  if (appState.recordedAudioUrl) {
    const parentAudio = new Audio(appState.recordedAudioUrl);
    appState.isPlayingAudio = true;
    document.getElementById('play-btn').innerText = "⏸";
    document.getElementById('player-subtitle').innerText = "🎙 Озвучивание записанным голосом родителя!";

    parentAudio.play().catch(err => {
      console.warn("Parent recorded audio play error:", err);
      playMP3AudioTrack(true);
    });

    parentAudio.onended = () => {
      appState.isPlayingAudio = false;
      document.getElementById('play-btn').innerText = "▶";
    };
  } else {
    alert("🎙 Вы еще не записали свой голос! Нажмите микрофон слева для записи отрывка вашего голоса.");
    playMP3AudioTrack(true);
  }
}

function initMp3AudioPlayer() {
  if (!appState.mp3AudioTrack) {
    appState.mp3AudioTrack = new Audio('audio/meditation1.mp3');
    appState.mp3AudioTrack.onerror = () => {
      console.warn("audio/meditation1.mp3 load warning, trying root meditation1.mp3...");
      if (appState.mp3AudioTrack) {
        appState.mp3AudioTrack.src = 'meditation1.mp3';
      }
    };
    appState.mp3AudioTrack.ontimeupdate = () => {
      if (!appState.mp3AudioTrack) return;
      const cur = appState.mp3AudioTrack.currentTime;
      const dur = appState.mp3AudioTrack.duration || 1;
      const pct = Math.min(100, (cur / dur) * 100);
      const fill = document.getElementById('player-progress');
      if (fill) fill.style.width = `${pct}%`;
      const timeSpan = document.getElementById('player-time');
      if (timeSpan) {
        const m = Math.floor(cur / 60);
        const s = Math.floor(cur % 60);
        timeSpan.innerText = `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
      }
    };
    appState.mp3AudioTrack.onended = () => {
      appState.isPlayingMp3 = false;
      document.getElementById('play-btn').innerText = "▶";
    };
  }
}

function playMP3AudioTrack(forceStart = false) {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (appState.generatedAudioTrack) {
    appState.generatedAudioTrack.pause();
    appState.isPlayingGenerated = false;
  }

  initMp3AudioPlayer();

  if (forceStart) {
    appState.mp3AudioTrack.currentTime = 0;
    appState.mp3AudioTrack.play().then(() => {
      appState.isPlayingMp3 = true;
      document.getElementById('play-btn').innerText = "⏸";
      document.getElementById('player-subtitle').innerText = "🎵 Воспроизведение прошлым вариантом: meditation1.mp3";
    }).catch(err => {
      console.warn("MP3 playback fallback to speech synth:", err);
      const text = document.getElementById('meditation-text-box').innerText;
      speakTextTTS(text);
    });
    return;
  }

  if (appState.isPlayingMp3) {
    appState.mp3AudioTrack.pause();
    appState.isPlayingMp3 = false;
    document.getElementById('play-btn').innerText = "▶";
  } else {
    appState.mp3AudioTrack.play().then(() => {
      appState.isPlayingMp3 = true;
      document.getElementById('play-btn').innerText = "⏸";
      document.getElementById('player-subtitle').innerText = "🎵 Воспроизведение прошлым вариантом: meditation1.mp3";
    }).catch(err => {
      console.warn("MP3 playback fallback to speech synth:", err);
      const text = document.getElementById('meditation-text-box').innerText;
      speakTextTTS(text);
    });
  }
}

function playQuickTestAudio() {
  const playerCard = document.querySelector('.player-card') || document.getElementById('generator');
  if (playerCard) {
    playerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Toggle playback of meditation1.mp3
  if (appState.generatedAudioTrack && appState.isPlayingGenerated) {
    appState.generatedAudioTrack.pause();
    appState.isPlayingGenerated = false;
  }

  initMp3AudioPlayer();

  if (appState.isPlayingMp3) {
    appState.mp3AudioTrack.pause();
    appState.isPlayingMp3 = false;
    document.getElementById('play-btn').innerText = "▶";
    logClickAnalytics('QuickTestAudio_Paused', 'Hero Quick Test Button (meditation1.mp3)', 0);
  } else {
    appState.mp3AudioTrack.play().then(() => {
      appState.isPlayingMp3 = true;
      document.getElementById('play-btn').innerText = "⏸";
      document.getElementById('player-subtitle').innerText = "🎵 Быстрое тестирование: meditation1.mp3";
    }).catch(err => {
      console.warn("Quick test playback error:", err);
      playMP3AudioTrack(true);
    });
    logClickAnalytics('QuickTestAudio_Played', 'Hero Quick Test Button (meditation1.mp3)', 0);
  }
}

function togglePlayAudio() {
  // Round play button controls meditation1.mp3
  if (appState.generatedAudioTrack && appState.isPlayingGenerated) {
    appState.generatedAudioTrack.pause();
    appState.isPlayingGenerated = false;
  }

  initMp3AudioPlayer();

  if (appState.isPlayingMp3) {
    appState.mp3AudioTrack.pause();
    appState.isPlayingMp3 = false;
    document.getElementById('play-btn').innerText = "▶";
  } else {
    appState.mp3AudioTrack.play().then(() => {
      appState.isPlayingMp3 = true;
      document.getElementById('play-btn').innerText = "⏸";
      document.getElementById('player-subtitle').innerText = "🎵 Воспроизведение прошлой записи: meditation1.mp3";
    }).catch(err => {
      console.warn("Round play button error:", err);
      generatePersonalMeditation();
    });
  }
}

function playGeneratedMeditation() {
  if (appState.elevenLabsAudioUrl || appState.generatedAudioTrack) {
    if (appState.isPlayingGenerated && appState.generatedAudioTrack) {
      appState.generatedAudioTrack.pause();
      appState.isPlayingGenerated = false;
      updateMeditationStatusBadge('success', '▶️ Слушать сказку-медитацию, сгенерированную заданным голосом');
    } else {
      if (appState.mp3AudioTrack && appState.isPlayingMp3) {
        appState.mp3AudioTrack.pause();
        appState.isPlayingMp3 = false;
        document.getElementById('play-btn').innerText = "▶";
      }

      if (!appState.generatedAudioTrack || appState.generatedAudioTrack.src !== appState.elevenLabsAudioUrl) {
        appState.generatedAudioTrack = new Audio(appState.elevenLabsAudioUrl);
        appState.generatedAudioTrack.ontimeupdate = () => {
          if (!appState.generatedAudioTrack) return;
          const cur = appState.generatedAudioTrack.currentTime;
          const dur = appState.generatedAudioTrack.duration || 1;
          const pct = Math.min(100, (cur / dur) * 100);
          const fill = document.getElementById('player-progress');
          if (fill) fill.style.width = `${pct}%`;
          const timeSpan = document.getElementById('player-time');
          if (timeSpan) {
            const m = Math.floor(cur / 60);
            const s = Math.floor(cur % 60);
            timeSpan.innerText = `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
          }
        };
        appState.generatedAudioTrack.onended = () => {
          appState.isPlayingGenerated = false;
          updateMeditationStatusBadge('success', '▶️ Слушать сказку-медитацию, сгенерированную заданным голосом');
        };
      }

      appState.generatedAudioTrack.play().then(() => {
        appState.isPlayingGenerated = true;
        updateMeditationStatusBadge('success', '⏸ Приостановить новую сгенерированную аудиомедитацию');
        document.getElementById('player-subtitle').innerText = "✨ Воспроизводится НОВАЯ сгенерированная медитация!";
      }).catch(err => {
        console.warn("Generated audio play error:", err);
      });
    }
  } else {
    generatePersonalMeditation();
  }
}

function speakTextTTS(text) {
  if (appState.audioTrack) appState.audioTrack.pause();
  if (!window.speechSynthesis) {
    playMP3AudioTrack(true);
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.6;
  utterance.pitch = 0.75;
  utterance.lang = appState.lang === 'he' ? 'he-IL' : 'ru-RU';

  utterance.onstart = () => {
    appState.isPlayingAudio = true;
    document.getElementById('play-btn').innerText = "⏸";
  };

  utterance.onend = () => {
    appState.isPlayingAudio = false;
    document.getElementById('play-btn').innerText = "▶";
  };

  window.speechSynthesis.speak(utterance);
}

function generateEmergencyAudio() {
  const contextInput = document.getElementById('emergency-context').value || "Ребенок растревожен";
  const name = document.getElementById('child-name').value || "Ребенок";

  const emergencyScript = `
    ${name}, сделай глубокий выдох вместе со мной... Один... два... три... 
    Я знаю, что ситуация: "${contextInput}" вызывает много эмоций. 
    Но сейчас ты находишься в полной безопасности.
  `;

  document.getElementById('meditation-text-box').innerHTML = `<p><strong>🚨 ЭКСТРЕННОЕ АУДИО ЗАЗЕМЛЕНИЯ:</strong><br><br>${emergencyScript}</p>`;
  playMP3AudioTrack();
  logClickAnalytics('EmergencyAudio_Generated', contextInput, 0);
}

function initSignatureCanvas() {
  appState.signatureCanvas = document.getElementById('signature-canvas');
  if (!appState.signatureCanvas) return;

  const canvas = appState.signatureCanvas;

  // Set internal resolution matching bounding rect
  const rect = canvas.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    canvas.width = rect.width;
    canvas.height = rect.height;
  } else {
    canvas.width = 400;
    canvas.height = 140;
  }

  const ctx = canvas.getContext('2d');
  appState.signatureCtx = ctx;

  ctx.strokeStyle = '#0F172A'; // Dark stroke on white canvas
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (canvas.getAttribute('data-initialized') === 'true') return;
  canvas.setAttribute('data-initialized', 'true');

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - r.left) * scaleX,
      y: (clientY - r.top) * scaleY
    };
  }

  function startDrawing(e) {
    e.preventDefault();
    appState.isDrawingSignature = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!appState.isDrawingSignature) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    appState.hasSignature = true;
    const sigStatus = document.getElementById('sig-status');
    if (sigStatus) {
      sigStatus.style.color = '#22C55E';
      sigStatus.innerText = '✍️ Подпись поставлена';
    }
  }

  function stopDrawing(e) {
    if (appState.isDrawingSignature) {
      appState.isDrawingSignature = false;
      ctx.closePath();
    }
  }

  // Mouse event listeners
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  // Touch event listeners (mobile/tablet)
  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDrawing, { passive: false });
  canvas.addEventListener('touchcancel', stopDrawing, { passive: false });
}

function clearSignatureCanvas() {
  if (appState.signatureCtx && appState.signatureCanvas) {
    appState.signatureCtx.clearRect(0, 0, appState.signatureCanvas.width, appState.signatureCanvas.height);
    appState.hasSignature = false;
    const sigStatus = document.getElementById('sig-status');
    if (sigStatus) {
      sigStatus.style.color = 'var(--text-muted)';
      sigStatus.innerText = 'Подпись пуста';
    }
  }
}

function openNDAModal() {
  const modal = document.getElementById('nda-modal');
  if (modal) modal.classList.remove('hidden');
  setTimeout(() => {
    initSignatureCanvas();
  }, 50);
  logClickAnalytics('NDAModal_Opened', 'NDA_Form', 0);
}

function closeNDAModal() {
  const modal = document.getElementById('nda-modal');
  if (modal) modal.classList.add('hidden');
}

async function submitNDASignature() {
  const name = document.getElementById('nda-user-name').value || 'Анонимный Подписант';
  const contact = document.getElementById('nda-user-contact')?.value.trim() || '';
  const email = document.getElementById('nda-user-email')?.value.trim() || '';

  if (!contact) {
    alert("⚠️ Пожалуйста, укажите ваш номер WhatsApp или Telegram для продолжения!");
    return;
  }

  const voiceConsent = document.getElementById('nda-voice-consent')?.checked;
  if (!voiceConsent) {
    const lang = appState.lang || 'ru';
    let msg = "⚠️ Пожалуйста, поставьте галочку согласия на обработку записи голоса для клонирования ИИ!";
    if (lang === 'en') msg = "⚠️ Please check the box to consent to voice recording processing for AI voice cloning!";
    if (lang === 'he') msg = "⚠️ אנא סמן/י את תיבת ההסכמה לעיבוד הקלטת הקול עבור שפול קול בבינה מלאכותית!";
    alert(msg);
    document.getElementById('nda-voice-consent')?.focus();
    return;
  }

  localStorage.setItem('ndaSigned', 'true');
  alert(`🎉 Соглашение успешно подписано!\nПодписант: ${name}`);
  closeNDAModal();

  logClickAnalytics('NDA_Signed', name, 0, {
    user_name: name,
    contact: contact,
    email: email,
    phone: contact
  });

  if (appState.pendingCheckout && appState.selectedPrice > 0 && appState.selectedPlan !== 'Free') {
    appState.pendingCheckout = false;
    document.getElementById('checkout-plan-name').innerText = appState.selectedPlan;
    document.getElementById('checkout-plan-price').innerText = `$${appState.selectedPrice}`;
    document.getElementById('checkout-modal').classList.remove('hidden');
  } else {
    appState.pendingCheckout = false;
    scrollToSection('generator');
  }
}

// CustDev Survey Scenarios with 3 questions per scenario (RU, EN, HE) like in mindecho-ai-114
const CUSTDEV_SCENARIOS = {
  burnout: {
    ru: [
      { label: "1. Сколько времени занимает укладывание ребенка и насколько вы чувствуете выгорание к вечеру (1-10)?", placeholder: "Например: 1.5 часа, выгорание 8/10" },
      { label: "2. Что больше всего мешает нормальному сну ребенка?", placeholder: "Например: Капризы, просит посидеть рядом, перевозбуждение..." },
      { label: "3. Готовы ли вы попробовать инструмент, дарящий 1-2 часа личного времени?", placeholder: "Да, хочу протестировать" }
    ],
    en: [
      { label: "1. How long does bedtime take and how burnt out do you feel by evening (1-10)?", placeholder: "e.g. 1.5 hours, burnout 8/10" },
      { label: "2. What interferes most with your child's healthy sleep?", placeholder: "e.g. Tantrums, asking to sit nearby, overexcitation..." },
      { label: "3. Are you ready to try a tool that gives you 1-2 hours of personal time?", placeholder: "Yes, I want to test it" }
    ],
    he: [
      { label: "1. כמה זמן לוקחת הרדמת הילד וכמה שחיקה אתם מרגישים בערב (1-10)?", placeholder: "למשל: שעה וחצי, שחיקה 8/10" },
      { label: "2. מה הכי מפריע לשינה תקינה של הילד?", placeholder: "למשל: תסכולים, בקשה לשבת לידו, עוררות יתר..." },
      { label: "3. האם אתם מוכנים לנסות כלי המעניק 1-2 שעות של זמן אישי?", placeholder: "כן, אשמח לבדוק" }
    ]
  },
  tantrums: {
    ru: [
      { label: "1. Как часто ребенок впадает в истерики и ссоры?", placeholder: "Например: Каждый день при уходе с детской площадки..." },
      { label: "2. Что вы обычно испытываете в этот момент?", placeholder: "Например: Бессилие, вину, раздражение..." },
      { label: "3. Хотите протестировать 4-шаговый экстренный протокол заземления?", placeholder: "Да, очень актуально" }
    ],
    en: [
      { label: "1. How often does your child experience tantrums or conflicts?", placeholder: "e.g. Every day when leaving the playground..." },
      { label: "2. What do you usually feel at that moment?", placeholder: "e.g. Helplessness, guilt, irritation..." },
      { label: "3. Would you like to test the 4-step emergency grounding protocol?", placeholder: "Yes, very relevant" }
    ],
    he: [
      { label: "1. באיזו תדירות הילד נכנס להתקפי זעם ומריבות?", placeholder: "למשל: כל יום בעת עזיבת גן המשחקים..." },
      { label: "2. מה אתם מרגישים בדרך כלל באותו רגע?", placeholder: "למשל: חוסר אונים, אשמה, תסכול..." },
      { label: "3. האם תרצו לבדוק פרוטוקול חירום 4-שלבים לקרקוע?", placeholder: "כן, רלוונטי מאוד" }
    ]
  },
  confidence: {
    ru: [
      { label: "1. Какие качества вы мечтаете развивать в ребенке?", placeholder: "Например: Уверенность, легкая учеба, верные друзья" },
      { label: "2. Замечаете ли страхи или сомнения в своих силах у ребенка?", placeholder: "Иногда боится отвечать у доски..." },
      { label: "3. Хотите посмотреть утренний рассказ-настрой на успех?", placeholder: "Да, хочу попробовать" }
    ],
    en: [
      { label: "1. What qualities do you dream of fostering in your child?", placeholder: "e.g. Confidence, easy learning, loyal friends" },
      { label: "2. Do you notice fears or self-doubt in your child?", placeholder: "e.g. Sometimes afraid to speak in public..." },
      { label: "3. Would you like to try the morning success mindset story?", placeholder: "Yes, I want to try" }
    ],
    he: [
      { label: "1. אילו תכונות הייתם חולמים לפתח בילד?", placeholder: "למשל: ביטחון עצמי, למידה קלה, חברים נאמנים" },
      { label: "2. האם אתם מזהים פחדים או ספקות עצמיים אצל הילד?", placeholder: "למשל: לפעמים חושש לדבר בכיתה..." },
      { label: "3. האם תרצו לבדוק סיפור כוונון בוקר להצלחה?", placeholder: "כן, אשמח לנסות" }
    ]
  },
  expert: {
    ru: [
      { label: "1. Насколько вам близка идея ИИ + КПТ экосистемы для семей?", placeholder: "Очень поддерживаю проект" },
      { label: "2. Чего не хватает современным сервисам для родителей?", placeholder: "Например: Качественной персонализации" },
      { label: "3. Готовы дать экспертный отзыв после тестирования?", placeholder: "Да, готова написать отзыв" }
    ],
    en: [
      { label: "1. How resonant is the AI + CBT family ecosystem idea for you?", placeholder: "Strongly support the project" },
      { label: "2. What is missing in modern parenting services?", placeholder: "e.g. High-quality personalization" },
      { label: "3. Are you ready to provide expert feedback after testing?", placeholder: "Yes, ready to write a review" }
    ],
    he: [
      { label: "1. עד כמה רעיון המערכת האקולוגית AI + CBT למשפחות קרוב ללבכם?", placeholder: "תומך מאוד בפרויקט" },
      { label: "2. מה חסר בשירותים מודרניים להורים?", placeholder: "למשל: התאמה אישית איכותית" },
      { label: "3. האם אתם מוכנים לתת חוות דעת מקצועית לאחר הבדיקה?", placeholder: "כן, אשמח לכתוב חוות דעת" }
    ]
  }
};

function openCustDevModal() {
  document.getElementById('custdev-modal').classList.remove('hidden');
  selectCustDevScenario(appState.currentCustDevScenario || 'burnout');
  logClickAnalytics('CustDevModal_Opened', 'CustDev', 0);
}

function closeCustDevModal() {
  document.getElementById('custdev-modal').classList.add('hidden');
}

function selectCustDevScenario(scenarioKey) {
  appState.currentCustDevScenario = scenarioKey;

  document.querySelectorAll('.custdev-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`cd-btn-${scenarioKey}`);
  if (activeBtn) activeBtn.classList.add('active');

  const lang = appState.lang || 'ru';
  const scenarioObj = CUSTDEV_SCENARIOS[scenarioKey] || CUSTDEV_SCENARIOS.burnout;
  const questions = (scenarioObj && scenarioObj[lang]) ? scenarioObj[lang] : (scenarioObj['ru'] || []);

  const container = document.getElementById('custdev-q-container');
  if (!container) return;
  container.innerHTML = '';

  questions.forEach((q, idx) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'custdev-q-item';
    qDiv.style.marginBottom = '12px';
    qDiv.innerHTML = `
      <label style="display:block; margin-bottom:6px; font-weight:600; font-size:13px;">${q.label}</label>
      <input type="text" id="cd-input-${idx}" placeholder="${q.placeholder}" class="form-input" style="width:100%; border:1px solid rgba(255,255,255,0.2);">
    `;
    container.appendChild(qDiv);
  });
}

function handleCustDevSubmit(e) {
  e.preventDefault();
  const contact = document.getElementById('cd-input-contact')?.value.trim() || '-';
  const scenario = appState.currentCustDevScenario || 'burnout';
  const lang = appState.lang || 'ru';
  const scenarioObj = CUSTDEV_SCENARIOS[scenario] || CUSTDEV_SCENARIOS.burnout;
  const questions = (scenarioObj && scenarioObj[lang]) ? scenarioObj[lang] : (scenarioObj['ru'] || []);

  const answers = [];
  questions.forEach((q, idx) => {
    const val = document.getElementById(`cd-input-${idx}`)?.value || '';
    answers.push(`${q.label}: ${val}`);
  });

  const formattedAnswers = answers.join(" | ");
  const isEmail = contact.includes('@');

  // Primary Analytics Event
  logClickAnalytics('CustDev_Submitted', scenario, 0, {
    user_name: contact,
    email: isEmail ? contact : '-',
    phone: contact,
    section: formattedAnswers,
    page_section: formattedAnswers
  });

  // Dedicated separate log entry for WhatsApp/Telegram contact
  logClickAnalytics('WhatsApp_Telegram_Captured', 'CustDev_Survey', 0, {
    phone: contact,
    user_name: contact,
    plan_name: scenario,
    page_section: formattedAnswers
  });

  // Direct fail-safe Supabase Post
  try {
    const payload = {
      timestamp: new Date().toLocaleString('ru-RU'),
      event_type: 'CustDev_Submitted',
      session_id: (typeof SESSION_ID !== 'undefined' ? SESSION_ID : 'GUEST'),
      user_name: contact,
      email: isEmail ? contact : '-',
      phone: contact,
      plan_name: scenario,
      price: 0,
      language: lang,
      page_section: formattedAnswers
    };
    fetch(supabaseUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    }).catch(err => console.warn('Direct Supabase CustDev post warning:', err));
  } catch(ex) {
    console.warn('Fail-safe Supabase error:', ex);
  }

  let thankMsg = "🎉 Спасибо за ваши ответы! Ваши ответы сохранены в системе. Вам предоставлен приоритетный VIP-доступ.";
  if (lang === 'en') thankMsg = "🎉 Thank you for your answers! Your responses have been saved. You have been granted priority VIP access.";
  if (lang === 'he') thankMsg = "🎉 תודה על תשובותיך! התשובות נשמרו במערכת. הוענקה לך גישת VIP בעדיפות.";

  alert(thankMsg);
  closeCustDevModal();
}

/* ==========================================================================
   Pricing Card Billing Toggle Handler (Individual Card Scoped)
   ========================================================================== */
function setCardBilling(btnEl, planName, cycle) {
  const isAnnual = (cycle === 'annual');
  const card = btnEl ? btnEl.closest('.pricing-card') : null;

  if (card) {
    const monthlyBtn = card.querySelector('.btn-monthly');
    const annualBtn  = card.querySelector('.btn-annual');
    if (isAnnual) {
      if (annualBtn)  annualBtn.classList.add('active');
      if (monthlyBtn) monthlyBtn.classList.remove('active');
    } else {
      if (monthlyBtn) monthlyBtn.classList.add('active');
      if (annualBtn)  annualBtn.classList.remove('active');
    }

    const priceEl = card.querySelector('.plan-price');
    const subtextEl = card.querySelector('.annual-subtext');

    if (planName === 'Basic') {
      if (isAnnual) {
        if (priceEl) priceEl.innerHTML = "$29.99 <span>/ год</span>";
        if (subtextEl) subtextEl.classList.remove('hidden');
      } else {
        if (priceEl) priceEl.innerHTML = "$7 <span>/ месяц</span>";
        if (subtextEl) subtextEl.classList.add('hidden');
      }
    } else if (planName === 'Premium') {
      if (isAnnual) {
        if (priceEl) priceEl.innerHTML = "$59.99 <span>/ год</span>";
        if (subtextEl) subtextEl.classList.remove('hidden');
      } else {
        if (priceEl) priceEl.innerHTML = "$14.99 <span>/ месяц</span>";
        if (subtextEl) subtextEl.classList.add('hidden');
      }
    } else if (planName === 'Platinum') {
      if (isAnnual) {
        if (priceEl) priceEl.innerHTML = "$99.99 <span>/ год</span>";
        if (subtextEl) subtextEl.classList.remove('hidden');
      } else {
        if (priceEl) priceEl.innerHTML = "$24.99 <span>/ месяц</span>";
        if (subtextEl) subtextEl.classList.add('hidden');
      }
    }
  }

  if (!appState.cardBillingState) appState.cardBillingState = {};
  appState.cardBillingState[planName] = isAnnual;

  logClickAnalytics('CardBillingCycle_Toggled', planName + '_' + (isAnnual ? 'Annual' : 'Monthly'), 0);
}

function selectPlan(planName, price) {
  appState.selectedPlan = planName;
  const isAnnual = appState.cardBillingState ? appState.cardBillingState[planName] : false;
  let finalPrice = price;

  if (isAnnual && price > 0) {
    if (planName === 'Basic') finalPrice = 29.99;
    else if (planName === 'Premium') finalPrice = 59.99;
    else if (planName === 'Platinum') finalPrice = 99.99;
  }
  appState.selectedPrice = finalPrice;

  logClickAnalytics('TariffButton_Click', planName + (isAnnual ? '_Annual' : '_Monthly'), finalPrice);

  if (price === 0 || planName === 'Free') {
    appState.pendingCheckout = false;
  } else {
    appState.pendingCheckout = true;
  }
  openNDAModal();
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').classList.add('hidden');
}

function handlePaymentSubmit(e) {
  e.preventDefault();
  alert(`🎉 Подписка "${appState.selectedPlan}" успешно активирована!`);
  closeCheckoutModal();
}

function openAuthModal(type = 'login') {
  appState.pendingAuthModal = type;
  document.getElementById('auth-modal').classList.remove('hidden');
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
}

async function handleGoogleAuth() {
  const currentName = localStorage.getItem('userName') || 'Константин Шломович';
  const currentEmail = localStorage.getItem('userEmail') || 'get777903@gmail.com';

  const inputName = prompt("🌐 Вход через Google Аккаунт\n\nПодтвердите ваше Имя пользователя Google на вашем устройстве:", currentName);
  if (inputName === null) return;

  const inputEmail = prompt("📧 Укажите ваш Google Email для авторизации:", currentEmail);
  if (inputEmail === null) return;

  const googleName = inputName.trim() || 'Пользователь Google';
  const googleEmail = inputEmail.trim() || 'google_user@gmail.com';

  localStorage.setItem('userName', googleName);
  localStorage.setItem('userEmail', googleEmail);

  // Send Google Auth payload to Supabase DB
  const payload = {
    timestamp: new Date().toLocaleString('ru-RU'),
    event_type: 'Google_Auth_Success',
    session_id: (typeof SESSION_ID !== 'undefined' ? SESSION_ID : 'GUEST'),
    user_name: googleName,
    email: googleEmail,
    phone: 'Google_OAuth',
    plan_name: 'Google_Account',
    price: 0,
    language: appState.lang || 'ru',
    page_section: 'Google Account Confirmed on Device'
  };

  logClickAnalytics('Google_Auth_Success', googleName, 0, {
    user_name: googleName,
    email: googleEmail,
    phone: 'Google_OAuth',
    provider: 'Google'
  });

  try {
    await fetch(supabaseUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
  } catch(err) {
    console.warn("Direct Google Auth Supabase post notice:", err);
  }

  // Header login button shows email login (before @)
  const navBtn = document.getElementById('nav-login-btn');
  if (navBtn) {
    const googleLogin = googleEmail.split('@')[0];
    navBtn.innerText = `👤 ${googleLogin}`;
    navBtn.style.background = 'rgba(34, 197, 94, 0.15)';
    navBtn.style.borderColor = '#22C55E';
    navBtn.style.color = '#22C55E';
  }

  alert(`🎉 Вход через Google Аккаунт зафиксирован!\nИмя: ${googleName}\nEmail: ${googleEmail}\nДанные успешно сохранены в базе данных.`);
  closeAuthModal();
}

function simulateSocialAuth(provider) {
  if (provider === 'Google') {
    handleGoogleAuth();
  } else {
    alert(`🎉 Вход через ${provider} выполнен успешно!`);
    closeAuthModal();
  }
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('auth-email');
  const authEmail = (emailInput && emailInput.value.trim()) ? emailInput.value.trim() : 'get777903@gmail.com';
  const userLogin = authEmail.split('@')[0];
  
  localStorage.setItem('userEmail', authEmail);
  localStorage.setItem('userName', userLogin);

  const navBtn = document.getElementById('nav-login-btn');
  if (navBtn) {
    navBtn.innerText = `👤 ${userLogin}`;
    navBtn.style.background = 'rgba(34, 197, 94, 0.15)';
    navBtn.style.borderColor = '#22C55E';
    navBtn.style.color = '#22C55E';
  }

  logClickAnalytics('Email_Auth_Success', userLogin, 0, { email: authEmail });
  closeAuthModal();
}

function logClickAnalytics(eventType, planName, priceAmount, extraData = {}) {
  const timeOnPage = Math.round((Date.now() - analyticsState.pageStartTime) / 1000);
  const payload = {
    timestamp: new Date().toLocaleString('ru-RU'),
    event_type: eventType,
    session_id: SESSION_ID,
    user_name: extraData.user_name || '-',
    email: extraData.email || '-',
    phone: extraData.phone || '-',
    plan_name: planName || '-',
    price: priceAmount || 0,
    language: appState.lang || 'ru',
    scroll_depth: analyticsState.maxScrollDepth,
    time_on_page: timeOnPage,
    page_section: extraData.page_section || extraData.section || extraData.answers || '-'
  };

  fetch(supabaseUrl, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': 'Bearer ' + supabaseKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  }).catch(err => console.warn('Supabase analytics fetch error:', err));
}

function initAnalyticsTracking() {
  logClickAnalytics('Page_View', '-', 0, { section: 'hero' });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW error:', err));
  }
}

// Global Window Binds
window.openNDAModal = openNDAModal;
window.closeNDAModal = closeNDAModal;
window.submitNDASignature = submitNDASignature;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.handleAuthSubmit = handleAuthSubmit;
window.openCustDevModal = openCustDevModal;
window.closeCustDevModal = closeCustDevModal;
window.handleCustDevSubmit = handleCustDevSubmit;
window.selectCustDevScenario = selectCustDevScenario;
window.selectPlan = selectPlan;
window.closeCheckoutModal = closeCheckoutModal;
window.handlePaymentSubmit = handlePaymentSubmit;
window.playQuickTestAudio = playQuickTestAudio;
window.togglePlayAudio = togglePlayAudio;
window.playGeneratedMeditation = playGeneratedMeditation;
window.selectAudioMode = selectAudioMode;
window.switchLanguage = switchLanguage;
window.scrollToSection = scrollToSection;
window.simulateSocialAuth = simulateSocialAuth;
window.generatePersonalMeditation = generatePersonalMeditation;
window.toggleVoiceRecord = toggleVoiceRecord;
window.clearSignatureCanvas = clearSignatureCanvas;
window.setCardBilling = setCardBilling;
window.toggleFullStoryText = toggleFullStoryText;

// Educational Modals and Conversion Event Trackers
function openEduTutoringModal() {
  logClickAnalytics('Click_Btn_Tutoring', 'Tutoring_Page_Open', 0, { section: 'edu_tutoring' });
  const modal = document.getElementById('edu-tutoring-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeEduTutoringModal() {
  const modal = document.getElementById('edu-tutoring-modal');
  if (modal) modal.classList.add('hidden');
}

function openEduSchoolModal() {
  logClickAnalytics('Click_Btn_School', 'School_Page_Open', 0, { section: 'edu_school' });
  const modal = document.getElementById('edu-school-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeEduSchoolModal() {
  const modal = document.getElementById('edu-school-modal');
  if (modal) modal.classList.add('hidden');
}

function trackAndSelectPlan(position, serviceName) {
  logClickAnalytics('Click_Choose_Plan', serviceName + '_' + position, 0, { section: serviceName });
  closeEduTutoringModal();
  closeEduSchoolModal();
  if (serviceName && (serviceName.includes('Внешкольное') || serviceName.includes('репетиторство') || serviceName.includes('Удалённая') || serviceName.includes('образование'))) {
    scrollToSection('edu-pricing');
  } else {
    scrollToSection('pricing');
  }
}

window.openEduTutoringModal = openEduTutoringModal;
window.closeEduTutoringModal = closeEduTutoringModal;
window.openEduSchoolModal = openEduSchoolModal;
window.closeEduSchoolModal = closeEduSchoolModal;
window.trackAndSelectPlan = trackAndSelectPlan;

// Educational Billing Switcher & Checkout Handlers
let eduBillingCycle = 'monthly';

function switchEduBillingCycle(cycle) {
  eduBillingCycle = cycle;
  const btnMonthly = document.getElementById('edu-toggle-monthly');
  const btnAnnual = document.getElementById('edu-toggle-annual');

  if (cycle === 'monthly') {
    if (btnMonthly) { btnMonthly.style.background = 'var(--color-orange)'; btnMonthly.style.color = '#fff'; }
    if (btnAnnual) { btnAnnual.style.background = 'transparent'; btnAnnual.style.color = 'var(--text-muted)'; }
    
    document.querySelectorAll('.edu-price-tutoring-monthly, .edu-price-school-monthly').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.edu-price-tutoring-annual, .edu-price-school-annual, .edu-subtext-tutoring-annual, .edu-subtext-school-annual').forEach(el => el.classList.add('hidden'));
  } else {
    if (btnAnnual) { btnAnnual.style.background = 'var(--color-orange)'; btnAnnual.style.color = '#fff'; }
    if (btnMonthly) { btnMonthly.style.background = 'transparent'; btnMonthly.style.color = 'var(--text-muted)'; }

    document.querySelectorAll('.edu-price-tutoring-annual, .edu-price-school-annual, .edu-subtext-tutoring-annual, .edu-subtext-school-annual').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.edu-price-tutoring-monthly, .edu-price-school-monthly').forEach(el => el.classList.add('hidden'));
  }
}

function handleEduCheckout(serviceType) {
  let price = 0;
  let subjectName = '';

  if (serviceType === 'Внешкольное обучение') {
    const subjectSelect = document.getElementById('tutoring-subject-select');
    subjectName = subjectSelect ? subjectSelect.value : 'Английский и иностранные языки';
    price = eduBillingCycle === 'annual' ? 790 : 90;
    appState.selectedPlan = `Внешкольное обучение [${subjectName}] (${eduBillingCycle === 'annual' ? 'Годовой' : 'Месячный'})`;
  } else {
    price = eduBillingCycle === 'annual' ? 4900 : 340;
    appState.selectedPlan = `Удалённая школа (${eduBillingCycle === 'annual' ? 'Годовой' : 'Месячный'})`;
  }

  appState.selectedPrice = price;
  appState.pendingCheckout = true;

  logClickAnalytics('EduTariff_Selected', appState.selectedPlan, price);
  openNDAModal();
}

window.switchEduBillingCycle = switchEduBillingCycle;
window.handleEduCheckout = handleEduCheckout;

