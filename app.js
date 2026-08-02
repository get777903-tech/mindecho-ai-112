/* ==========================================================================
   MindEcho AI 2026 â€” Main Application Engine (mindecho-ai-111)
   Admin Analytics Dashboard + Full Click Tracking + Scroll/Time Metrics
   ========================================================================== */

// Webhook URL for Google Sheets logging
const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbx_DEMO_MINDECHO_WEBHOOK/exec";

// Audio Track File Name
const MEDITATION_AUDIO_SRC = "meditation1.mp3";

// Unique session ID for this visit
const SESSION_ID = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();

// --- ADMIN DEVICE FILTERING ---
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('admin') === 'secret') {
  localStorage.setItem('isAdminDevice', 'true');
  alert('⚙️ Устройство помечено как АДМИНИСТРАТОР.\nВся аналитика для вас теперь отключена навсегда.');
}
const isAdminDevice = localStorage.getItem('isAdminDevice') === 'true';
// ------------------------------
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

// 100% Comprehensive Multilingual Dictionary (RU, EN, HE)
const i18n = {
  ru: {
    nav_mission: "ÐœÐ¸ÑÑÐ¸Ñ",
    nav_modes: "ÐÑƒÐ´Ð¸Ð¾Ñ€ÐµÐ¶Ð¸Ð¼Ñ‹",
    nav_generator: "Ð¡Ñ‚ÑƒÐ´Ð¸Ñ",
    nav_pricing: "Ð¢Ð°Ñ€Ð¸Ñ„Ñ‹",
    nav_nda: "NDA ÐŸÐ¾Ð´Ð¿Ð¸ÑÑŒ",
    nav_custdev: "ðŸŽ ÐžÐ¿Ñ€Ð¾Ñ + Ð¿Ð¾Ð´Ð°Ñ€Ð¾Ðº",
    btn_login: "Ð’Ð¾Ð¹Ñ‚Ð¸",
    hero_badge: "Ð˜Ð˜ + Ð”ÐµÑ‚ÑÐºÐ°Ñ ÐÐµÐ¹Ñ€Ð¾Ð¿ÑÐ¸Ñ…Ð¾Ð»Ð¾Ð³Ð¸Ñ + ÐšÐŸÐ¢/ACT + ÐŸÑÐ¸Ñ…Ð¾ÑÐ¾Ð¼Ð°Ñ‚Ð¸ÐºÐ°",
    hero_title: "ÐŸÑ€ÐµÐ²Ñ€Ð°Ñ‰Ð°ÐµÐ¼ Ñ€Ð¾Ð´Ð¸Ñ‚ÐµÐ»ÑŒÑÐºÑƒÑŽ Ñ€ÑƒÑ‚Ð¸Ð½Ñƒ Ð² <span class='text-gradient'>Ð±ÐµÑ€ÐµÐ¶Ð½ÑƒÑŽ Ñ‚ÐµÑ€Ð°Ð¿Ð¸ÑŽ</span>",
    hero_subtitle: "ÐœÑ‹ ÑÐ¾Ð·Ð´Ð°ÐµÐ¼ Ð³Ð»Ð¾Ð±Ð°Ð»ÑŒÐ½Ð¾Ðµ Ñ‚ÐµÑ…Ð½Ð¾Ð»Ð¾Ð³Ð¸Ñ‡ÐµÑÐºÐ¾Ðµ Ñ€ÐµÑˆÐµÐ½Ð¸Ðµ Ð´Ð»Ñ Ð·Ð°Ñ‰Ð¸Ñ‚Ñ‹ Ð¼ÐµÐ½Ñ‚Ð°Ð»ÑŒÐ½Ð¾Ð³Ð¾ Ð·Ð´Ð¾Ñ€Ð¾Ð²ÑŒÑ ÑÐµÐ¼ÐµÐ¹. Ð›ÐµÐ³Ð°Ð»ÑŒÐ½Ñ‹Ð¹ ÑÐ¿Ð¾ÑÐ¾Ð± ÑÐ¾Ñ…Ñ€Ð°Ð½Ð¸Ñ‚ÑŒ ÑÐ¼Ð¾Ñ†Ð¸Ð¾Ð½Ð°Ð»ÑŒÐ½Ñ‹Ðµ Ñ€ÐµÑÑƒÑ€ÑÑ‹ Ñ€Ð¾Ð´Ð¸Ñ‚ÐµÐ»ÐµÐ¹ Ð¸ Ð²Ñ‹Ñ€Ð°ÑÑ‚Ð¸Ñ‚ÑŒ ÑÑ‡Ð°ÑÑ‚Ð»Ð¸Ð²Ð¾Ð³Ð¾ Ñ€ÐµÐ±ÐµÐ½ÐºÐ°.",
    btn_try_free: "ðŸš€ ÐŸÐ¾Ð¿Ñ€Ð¾Ð±Ð¾Ð²Ð°Ñ‚ÑŒ Ð±ÐµÑÐ¿Ð»Ð°Ñ‚Ð½Ð¾ (2 Ð·Ð°Ð¿Ñ€Ð¾ÑÐ°/Ð´ÐµÐ½ÑŒ)",
    btn_support_project: "[ ÐŸÐ¾Ð´Ð´ÐµÑ€Ð¶Ð°Ñ‚ÑŒ Ð¿Ñ€Ð¾ÐµÐºÑ‚ / ÐŸÐ¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ ÑÑÑ‹Ð»ÐºÑƒ ]",
    trust_privacy: "ðŸ›¡ Privacy-First (Ð‘Ð°Ð½ÐºÐ¾Ð²ÑÐºÐ¾Ðµ ÑˆÐ¸Ñ„Ñ€Ð¾Ð²Ð°Ð½Ð¸Ðµ)",
    trust_supervisor: "ðŸ§  Ð’Ð°Ð»Ð¸Ð´Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¾ ÐÐ³ÐµÐ½Ñ‚Ð¾Ð¼-Ð¡ÑƒÐ¿ÐµÑ€Ð²Ð¸Ð·Ð¾Ñ€Ð¾Ð¼",
    trust_global: "ðŸŒ Ð¿Ð»Ð°Ñ‚Ñ„Ð¾Ñ€Ð¼Ð° Ð´Ð»Ñ ÐºÐ°Ð¶Ð´Ð¾Ð³Ð¾ Ð¸ Ð²ÑÐµÐ³Ð¾ Ð¼Ð¸Ñ€Ð°",
    hero_card_sub: "ÐœÐµÐ´Ð»ÐµÐ½Ð½Ñ‹Ð¹ ÑÐ¿Ð¾ÐºÐ¾Ð¹Ð½Ñ‹Ð¹ Ð³Ð¾Ð»Ð¾Ñ Ñ€Ð¾Ð´Ð¸Ñ‚ÐµÐ»Ñ â€¢ Ð‘ÐµÐ· Ð¼ÑƒÐ·Ñ‹ÐºÐ¸",
    hero_sample_quote: '"Ð—Ð°ÐºÑ€Ð¾Ð¹ Ð³Ð»Ð°Ð·Ð° Ð¸ Ð¾Ð±Ñ€Ð°Ñ‚Ð¸ Ð²Ð½Ð¸Ð¼Ð°Ð½Ð¸Ðµ Ð½Ð° ÑÐ²Ð¾Ð¹ Ð½Ð¾Ñ... ÐŸÐ¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹ Ñ‚Ð¸Ñ…ÑƒÑŽ Ð¸ ÑÐ¿Ð¾ÐºÐ¾Ð¹Ð½ÑƒÑŽ Ñ€Ð°Ð´Ð¾ÑÑ‚ÑŒ Ð²Ð½ÑƒÑ‚Ñ€Ð¸..."',
    hero_card_footer: "âœ¨ ÐŸÐµÑ€ÑÐ¾Ð½Ð°Ð»Ð¸Ð·Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ð¹ Ñ€Ð°ÑÑÐºÐ°Ð·-Ð¼ÐµÐ´Ð¸Ñ‚Ð°Ñ†Ð¸Ñ",
    tag_supermission: "Ð¡ÑƒÐ¿ÐµÑ€Ð¼Ð¸ÑÑÐ¸Ñ MindEcho AI",
    title_supermission: "4 Ð¡Ñ‚Ð¾Ð»Ð¿Ð° ÐžÐ±Ñ‰ÐµÑÑ‚Ð²ÐµÐ½Ð½Ð¾Ð³Ð¾ ÐŸÑ€Ð¾ÐµÐºÑ‚Ð°",
    sub_supermission: "ÐœÑ‹ ÑÐ¾Ð·Ð´Ð°ÐµÐ¼ Ð½Ðµ Ð¿Ñ€Ð¾ÑÑ‚Ð¾ ÐºÐ¾Ð¼Ð¼ÐµÑ€Ñ‡ÐµÑÐºÐ¸Ð¹ ÑÐ¾Ñ„Ñ‚, Ð° ÑÐ°Ð¼ÑƒÑŽ Ð·Ð°Ñ‰Ð¸Ñ‰ÐµÐ½Ð½ÑƒÑŽ Ð¸ Ð½Ð°ÑƒÑ‡Ð½Ð¾ Ð²Ñ‹Ð²ÐµÑ€ÐµÐ½Ð½ÑƒÑŽ ÑÐºÐ¾ÑÐ¸ÑÑ‚ÐµÐ¼Ñƒ Ð´Ð»Ñ Ð¼ÐµÐ½Ñ‚Ð°Ð»ÑŒÐ½Ð¾Ð³Ð¾ Ð·Ð´Ð¾Ñ€Ð¾Ð²ÑŒÑ ÑÐµÐ¼ÐµÐ¹ Ð²Ð¾ Ð²ÑÐµÐ¼ Ð¼Ð¸Ñ€Ðµ.",
    m1_title: "1. Ð¿Ð»Ð°Ñ‚Ñ„Ð¾Ñ€Ð¼Ð° Ð´Ð»Ñ ÐºÐ°Ð¶Ð´Ð¾Ð³Ð¾ Ð¸ Ð²ÑÐµÐ³Ð¾ Ð¼Ð¸Ñ€Ð°",
    m1_desc: "Ð¡Ñ‚Ð¸Ñ€Ð°ÐµÐ¼ ÑÐ¾Ñ†Ð¸Ð°Ð»ÑŒÐ½Ð¾Ðµ Ð¸ ÑÐºÐ¾Ð½Ð¾Ð¼Ð¸Ñ‡ÐµÑÐºÐ¾Ðµ Ð½ÐµÑ€Ð°Ð²ÐµÐ½ÑÑ‚Ð²Ð¾. ÐŸÐ»Ð°Ñ‚Ñ„Ð¾Ñ€Ð¼Ð° Ð´Ð¾ÑÑ‚ÑƒÐ¿Ð½Ð° Ð´Ð°Ð¶Ðµ Ð´Ð»Ñ Ð¼Ð°Ð»Ð¾Ð¸Ð¼ÑƒÑ‰Ð¸Ñ… ÑÐµÐ¼ÐµÐ¹ â€” ÐºÐ°Ð¶Ð´Ñ‹Ð¹ Ñ€ÐµÐ±ÐµÐ½Ð¾Ðº Ð¸Ð¼ÐµÐµÑ‚ Ð¿Ñ€Ð°Ð²Ð¾ Ð½Ð° Ð·Ð´Ð¾Ñ€Ð¾Ð²Ð¾Ðµ Ñ€Ð°Ð·Ð²Ð¸Ñ‚Ð¸Ðµ. Ð”Ð¸Ð°Ð»Ð¾Ð³ Ð¿Ð¾ ÐšÐŸÐ¢ Ð¸ ACT Ñ ÑÑƒÐ¿ÐµÑ€Ð²Ð¸Ð·Ð¾Ñ€Ð¾Ð¼.",
    m2_title: "2. Ð“Ð°Ñ€Ð¼Ð¾Ð½Ð¸Ñ Ð² Ð´Ð¾Ð¼Ðµ Ð±ÐµÐ· ÑÑÐ¾Ñ€",
    m2_desc: "ÐŸÑ€Ð¾Ð³Ñ€ÐµÑÑÐ¸Ð²Ð½Ñ‹Ðµ Ð°ÑƒÐ´Ð¸Ð¾Ñ€ÐµÐ¶Ð¸Ð¼Ñ‹ Ð¸ Ð³ÐµÐ¹Ð¼Ð¸Ñ„Ð¸ÐºÐ°Ñ†Ð¸Ñ Ð¿Ñ€Ð¸Ð²Ñ‹Ñ‡ÐµÐº Ð¸ÑÐºÐ»ÑŽÑ‡Ð°ÑŽÑ‚ Ð¸Ð· Ð¶Ð¸Ð·Ð½Ð¸ ÑÐµÐ¼ÑŒÐ¸ Ð¸ÑÑ‚ÐµÑ€Ð¸ÐºÐ¸, ÑƒÐ¿Ñ€ÐµÐºÐ¸ Ð¸ Ð¾Ð±Ð¸Ð´Ñ‹, Ð¼ÑÐ³ÐºÐ¾ Ð¿Ð¾Ð²Ñ‹ÑˆÐ°Ñ ÑÐ¼Ð¾Ñ†Ð¸Ð¾Ð½Ð°Ð»ÑŒÐ½Ñ‹Ð¹ Ð¸Ð½Ñ‚ÐµÐ»Ð»ÐµÐºÑ‚ (EQ).",
    m3_title: "3. Ð¡Ð±ÐµÑ€ÐµÐ¶ÐµÐ½Ð¸Ðµ ÑÐ½ÐµÑ€Ð³Ð¸Ð¸ Ñ€Ð¾Ð´Ð¸Ñ‚ÐµÐ»ÐµÐ¹",
    m3_desc: "Ð—Ð°Ñ‰Ð¸Ñ‰Ð°ÐµÐ¼ Ñ€Ð¾Ð´Ð¸Ñ‚ÐµÐ»ÐµÐ¹ Ð¾Ñ‚ Ð²Ñ‹Ð³Ð¾Ñ€Ð°Ð½Ð¸Ñ, Ð³Ð°Ñ€Ð°Ð½Ñ‚Ð¸Ñ€ÑƒÑ 1â€“2 Ñ‡Ð°ÑÐ° Ð»Ð¸Ñ‡Ð½Ð¾Ð³Ð¾ Ð²Ñ€ÐµÐ¼ÐµÐ½Ð¸ Ð² Ð´ÐµÐ½ÑŒ, Ð° Ð´ÐµÑ‚ÐµÐ¹ â€” Ð¾Ñ‚ Ð¼ÐµÐ½Ñ‚Ð°Ð»ÑŒÐ½Ð¾Ð³Ð¾ Ð¿ÐµÑ€ÐµÐ½Ð°Ð¿Ñ€ÑÐ¶ÐµÐ½Ð¸Ñ.",
    m3_tag: "ÐžÑÐ²Ð¾Ð±Ð¾Ð¶Ð´ÐµÐ½Ð¸Ðµ 1-2 Ñ‡Ð°ÑÐ° Ð»Ð¸Ñ‡Ð½Ð¾Ð³Ð¾ Ð²Ñ€ÐµÐ¼ÐµÐ½Ð¸",
    m4_title: "4. ÐŸÑÐ¸Ñ…Ð¾ÑÐ¾Ð¼Ð°Ñ‚Ð¸ÐºÐ° Ð¸ ÐÐ°ÑƒÑ‡Ð½Ñ‹Ð¹ ÐŸÐ¾Ð´Ñ…Ð¾Ð´",
    m4_desc: "Ð¡Ð½Ð¸Ð¶Ð°ÐµÐ¼ Ñ‡Ð°ÑÑ‚Ð¾Ñ‚Ñƒ Ð±Ð¾Ð»ÐµÐ·Ð½ÐµÐ¹ Ñ‡ÐµÑ€ÐµÐ· Ñ€ÐµÐ³ÑƒÐ»ÑÑ†Ð¸ÑŽ ÐÐ¡. Ð Ð¾Ð´Ð¸Ñ‚ÐµÐ»Ð¸ ÑÐ¿Ð¾ÐºÐ¾Ð¹Ð½Ñ‹, Ñ€ÐµÐ±Ñ‘Ð½Ð¾Ðº ÑƒÑÐ²Ð°Ð¸Ð²Ð°ÐµÑ‚ Ð¿Ð°Ñ‚Ñ‚ÐµÑ€Ð½Ñ‹ ÑÐ¼Ð¾Ñ†Ð¸Ð¾Ð½Ð°Ð»ÑŒÐ½Ð¾Ð¹ ÑÐ°Ð¼Ð¾Ñ€ÐµÐ³ÑƒÐ»ÑÑ†Ð¸Ð¸.",
    tag_modes: "Ð¢ÐµÑ€Ð°Ð¿ÐµÐ²Ñ‚Ð¸Ñ‡ÐµÑÐºÐ¸Ð¹ Ð¸Ð½ÑÑ‚Ñ€ÑƒÐ¼ÐµÐ½Ñ‚Ð°Ñ€Ð¸Ð¹",
    title_modes: "4 Ð¡Ð¿ÐµÑ†Ð¸Ð°Ð»Ð¸Ð·Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ñ… ÐÑƒÐ´Ð¸Ð¾Ñ€ÐµÐ¶Ð¸Ð¼Ð°",
    sub_modes: "Ð’Ñ‹Ð±ÐµÑ€Ð¸Ñ‚Ðµ Ð¿Ð¾Ð´Ñ…Ð¾Ð´ÑÑ‰ÑƒÑŽ Ð³Ð¸Ð¿Ð½Ð¾ÑÐºÐ°Ð·ÐºÑƒ Ð¸Ð»Ð¸ Ð½ÐµÐ¹Ñ€Ð¾-Ð¼ÐµÐ´Ð¸Ñ‚Ð°Ñ†Ð¸ÑŽ Ð´Ð»Ñ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ†Ð¸Ð¸ Ð¿Ð¾Ð²ÐµÐ´ÐµÐ½Ð¸Ñ Ð¸ Ð±Ñ‹ÑÑ‚Ñ€Ð¾Ð¹ Ñ€Ð°Ð·Ð³Ñ€ÑƒÐ·ÐºÐ¸ Ð½ÐµÑ€Ð²Ð½Ð¾Ð¹ ÑÐ¸ÑÑ‚ÐµÐ¼Ñ‹ Ñ€ÐµÐ±ÐµÐ½ÐºÐ°.",
    mode_bedtime_sub: "ÐœÑÐ³ÐºÐ¸Ð¹ Ð¿ÐµÑ€ÐµÑ…Ð¾Ð´ Ð² Ð³Ð»ÑƒÐ±Ð¾ÐºÐ¸Ð¹ ÑÐ¾Ð½ Ñ‡ÐµÑ€ÐµÐ· Ð²Ð¸Ð·ÑƒÐ°Ð»Ð¸Ð·Ð°Ñ†Ð¸Ð¸",
    mode_morning_sub: "ÐÐ°ÑÑ‚Ñ€Ð¾Ð¹ÐºÐ° Ð½Ð° ÑƒÑÐ¿ÐµÑ…Ð¸ Ð² ÑˆÐºÐ¾Ð»Ðµ Ð¸ Ð´ÐµÑ‚ÑÐºÐ¾Ð¼ ÑÐ°Ð´Ñƒ",
    mode_tantrums_sub: "Ð­ÐºÑÑ‚Ñ€ÐµÐ½Ð½Ð°Ñ Ð½ÐµÐ¹Ñ€Ð¾Ñ€ÐµÐ³ÑƒÐ»ÑÑ†Ð¸Ñ Ð·Ð° 5 Ð¼Ð¸Ð½ÑƒÑ‚",
    mode_psychosomatic_sub: "Ð¡Ð½ÑÑ‚Ð¸Ðµ Ð·Ð°Ð¶Ð¸Ð¼Ð¾Ð² Ð¸ Ð³Ð»ÑƒÐ±Ð¾ÐºÐ¾Ðµ Ñ„Ð¸Ð·Ð¸Ñ‡ÐµÑÐºÐ¾Ðµ Ñ€Ð°ÑÑÐ»Ð°Ð±Ð»ÐµÐ½Ð¸Ðµ",
    btn_select_mode: "Ð’Ñ‹Ð±Ñ€Ð°Ñ‚ÑŒ ÑÑ‚Ð¾Ñ‚ Ñ€ÐµÐ¶Ð¸Ð¼ â†’",
    tag_generator: "Ð˜Ð½Ñ‚ÐµÑ€Ð°ÐºÑ‚Ð¸Ð²Ð½Ð°Ñ Ð›Ð°Ð±Ð¾Ñ€Ð°Ñ‚Ð¾Ñ€Ð¸Ñ",
    title_generator: "Ð¡Ð³ÐµÐ½ÐµÑ€Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ Ð¼ÐµÐ´Ð¸Ñ‚Ð°Ñ†Ð¸ÑŽ Ð´Ð»Ñ Ñ€ÐµÐ±ÐµÐ½ÐºÐ°",
    sub_generator: "Ð£ÐºÐ°Ð¶Ð¸Ñ‚Ðµ Ð¸Ð¼Ñ Ñ€ÐµÐ±ÐµÐ½ÐºÐ°, Ð²Ñ‹Ð±ÐµÑ€Ð¸Ñ‚Ðµ Ñ€ÐµÐ¶Ð¸Ð¼ Ð¸ Ð³Ð¾Ð»Ð¾Ñ Ñ€Ð¾Ð´Ð¸Ñ‚ÐµÐ»Ñ Ð´Ð»Ñ Ð¼Ð³Ð½Ð¾Ð²ÐµÐ½Ð½Ð¾Ð³Ð¾ ÑÐ¾Ð·Ð´Ð°Ð½Ð¸Ñ Ð°Ð²Ñ‚Ð¾Ñ€ÑÐºÐ¾Ð¹ Ñ‚ÐµÑ€Ð°Ð¿Ð¸Ð¸.",
    label_child_name: "Ð˜Ð¼Ñ Ñ€ÐµÐ±ÐµÐ½ÐºÐ°:",
    placeholder_child_name: "ÐÐ°Ð¿Ñ€Ð¸Ð¼ÐµÑ€: Ð¡Ð¾Ñ„Ð¸Ñ, ÐÐ»ÐµÐºÑÐ°Ð½Ð´Ñ€, Ð”Ð°Ð½Ð¸Ð¸Ð»",
    label_audio_source: "Ð˜ÑÑ‚Ð¾Ñ‡Ð½Ð¸Ðº Ð¸ ÐœÐ¾Ð´ÐµÐ»ÑŒ ÐÑƒÐ´Ð¸Ð¾:",
    opt_source_parent: "âœ¨ ÐšÐ»Ð¾Ð½Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ð¹ Ð³Ð¾Ð»Ð¾Ñ Ñ€Ð¾Ð´Ð¸Ñ‚ÐµÐ»Ñ (ElevenLabs AI)",
    opt_source_mp3: "ðŸŽµ Ð¡Ñ‚ÑƒÐ´Ð¸Ð¹Ð½Ð°Ñ MP3 Ñ„Ð¾Ð½Ð¾Ð³Ñ€Ð°Ð¼Ð¼Ð°",
    opt_source_tts: "ðŸ¤– Ð”Ð¸Ð½Ð°Ð¼Ð¸Ñ‡ÐµÑÐºÐ¸Ð¹ Ð˜Ð˜-Ð´Ð¸ÐºÑ‚Ð¾Ñ€ (ÐÐ¸Ð·ÐºÐ¸Ð¹ Ñ‚ÐµÐ¼Ð±Ñ€)",
    label_voice_timbre: "Ð¢ÐµÐ¼Ð±Ñ€ Ð¸ Ð“Ð¾Ð»Ð¾Ñ Ð¾Ð·Ð²ÑƒÑ‡ÐºÐ¸:",
    opt_male_deep: "ðŸŽ¤ Ð¡Ð¿Ð¾ÐºÐ¾Ð¹Ð½Ñ‹Ð¹ Ð³Ð¾Ð»Ð¾Ñ Ñ€Ð¾Ð´Ð¸Ñ‚ÐµÐ»Ñ Ñ Ð¿Ñ€Ð¸ÑÑ‚Ð½Ñ‹Ð¼ Ñ‚ÐµÐ¼Ð±Ñ€Ð¾Ð¼",
    label_meditation_mode: "Ð ÐµÐ¶Ð¸Ð¼ Ñ€Ð°ÑÑÐºÐ°Ð·Ð°-Ð¼ÐµÐ´Ð¸Ñ‚Ð°Ñ†Ð¸Ð¸:",
    opt_mode_bedtime: "ðŸŒ™ ÐŸÐµÑ€ÐµÐ´ ÑÐ½Ð¾Ð¼ (Ð—Ð°ÑÑ‹Ð¿Ð°Ð½Ð¸Ðµ)",
    opt_mode_morning: "â˜€ï¸ Ð£Ñ‚Ñ€ÐµÐ½Ð½ÑÑ (Ð£Ð²ÐµÑ€ÐµÐ½Ð½Ð¾ÑÑ‚ÑŒ)",
    opt_mode_tantrums: "ðŸ›‘ Ð­ÐºÑ-ÐŸÐ¾Ð¼Ð¾Ñ‰ÑŒ Ð¿Ñ€Ð¸ Ð¸ÑÑ‚ÐµÑ€Ð¸ÐºÐµ",
    opt_mode_psychosomatic: "ðŸŒ¿ ÐŸÑÐ¸Ñ…Ð¾ÑÐ¾Ð¼Ð°Ñ‚Ð¸ÐºÐ° (Ð—Ð´Ð¾Ñ€Ð¾Ð²ÑŒÐµ)",
    btn_generate: "âœ¨ Ð¡Ð³ÐµÐ½ÐµÑ€Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ Ð¸ Ð¾Ð·Ð²ÑƒÑ‡Ð¸Ñ‚ÑŒ Ñ€Ð°ÑÑÐºÐ°Ð·-Ð¼ÐµÐ´Ð¸Ñ‚Ð°Ñ†Ð¸ÑŽ",
    player_title_default: "Ð Ð°ÑÑÐºÐ°Ð·-ÐœÐµÐ´Ð¸Ñ‚Ð°Ñ†Ð¸Ñ",
    player_sub_default: "ÐœÐµÐ´Ð»ÐµÐ½Ð½Ñ‹Ð¹ ÑÐ¿Ð¾ÐºÐ¾Ð¹Ð½Ñ‹Ð¹ Ð³Ð¾Ð»Ð¾Ñ Ñ€Ð¾Ð´Ð¸Ñ‚ÐµÐ»Ñ â€¢ Ð‘ÐµÐ· Ð¼ÑƒÐ·Ñ‹ÐºÐ¸",
    player_placeholder: 'Ð£ÐºÐ°Ð¶Ð¸Ñ‚Ðµ Ð¸Ð¼Ñ Ð¸ Ð½Ð°Ð¶Ð¼Ð¸Ñ‚Ðµ "Ð¡Ð³ÐµÐ½ÐµÑ€Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ"...',
    tag_pricing: "ÐŸÑ€Ð¾Ð·Ñ€Ð°Ñ‡Ð½Ð°Ñ Ð¼Ð¾Ð½ÐµÑ‚Ð¸Ð·Ð°Ñ†Ð¸Ñ",
    title_pricing: "Ð’Ñ‹Ð±ÐµÑ€Ð¸Ñ‚Ðµ Ð¢Ð°Ñ€Ð¸Ñ„ ÐŸÐ¾Ð´Ð¿Ð¸ÑÐºÐ¸",
    sub_pricing: "Freemium Ð¼Ð¾Ð´ÐµÐ»ÑŒ + Ð³Ð¸Ð±ÐºÐ°Ñ Ð¿Ð¾Ð´Ð¿Ð¸ÑÐºÐ° + Ñ€Ð°Ð·Ð¾Ð²Ñ‹Ðµ Ð´Ð¾ÐºÑƒÐ¿ÐºÐ¸ Ð¼Ð¸Ð½ÑƒÑ‚. ÐÐ¸ÐºÐ°ÐºÐ¸Ñ… ÑÐºÑ€Ñ‹Ñ‚Ñ‹Ñ… ÑÐ¿Ð¸ÑÐ°Ð½Ð¸Ð¹.",
    billing_monthly: "Ð•Ð¶ÐµÐ¼ÐµÑÑÑ‡Ð½Ð¾",
    billing_annual: "ÐžÐ¿Ð»Ð°Ñ‚Ð° Ð·Ð° Ð³Ð¾Ð´",
    plan_title_free: "Ð‘ÐµÑÐ¿Ð»Ð°Ñ‚Ð½Ñ‹Ð¹",
    plan_free_sub: "ÐžÑ‰ÑƒÑ‚Ð¸Ñ‚ÑŒ Ñ†ÐµÐ½Ð½Ð¾ÑÑ‚ÑŒ ÑÐµÑ€Ð²Ð¸ÑÐ°",
    plan_forever: "/ Ð½Ð°Ð²ÑÐµÐ³Ð´Ð°",
    pf_free_1: "âœ… 2 AI-Ð·Ð°Ð¿Ñ€Ð¾ÑÐ° Ð² Ð´ÐµÐ½ÑŒ",
    pf_free_2: "âœ… Ð¡Ñ‚Ð°Ð½Ð´Ð°Ñ€Ñ‚Ð½Ñ‹Ð¹ Ñ€Ð°ÑÑÐºÐ°Ð·-Ð¼ÐµÐ´Ð¸Ñ‚Ð°Ñ†Ð¸Ñ",
    pf_free_3: "âœ… ÐœÐµÐ´Ð»ÐµÐ½Ð½Ñ‹Ð¹ ÑÐ¿Ð¾ÐºÐ¾Ð¹Ð½Ñ‹Ð¹ Ð³Ð¾Ð»Ð¾Ñ Ñ€Ð¾Ð´Ð¸Ñ‚ÐµÐ»Ñ",
    pf_free_4: "âŒ ÐÐµÑ‚ ÑÐ¾Ñ…Ñ€Ð°Ð½ÐµÐ½Ð¸Ñ Ð¸ÑÑ‚Ð¾Ñ€Ð¸Ð¸",
    btn_plan_free: "ÐÐ°Ñ‡Ð°Ñ‚ÑŒ Ð±ÐµÑÐ¿Ð»Ð°Ñ‚Ð½Ð¾",
    plan_basic_sub: "Ð”Ð»Ñ ÐµÐ¶ÐµÐ´Ð½ÐµÐ²Ð½Ñ‹Ñ… Ð¿Ð¾Ð´ÑÑ‚Ñ€Ð¾ÐµÐº",
    plan_per_month: "/ Ð¼ÐµÑÑÑ†",
    pf_basic_1: "âœ… 50 Ð¼Ð¸Ð½ÑƒÑ‚ Ð³ÐµÐ½ÐµÑ€Ð°Ñ†Ð¸Ð¹ Ð² Ð¼ÐµÑÑÑ†",
    pf_basic_2: "âœ… ÐŸÐµÑ€ÑÐ¾Ð½Ð°Ð»Ð¸Ð·Ð°Ñ†Ð¸Ñ Ð¿Ð¾Ð´ Ð¸Ð¼Ñ Ñ€ÐµÐ±ÐµÐ½ÐºÐ°",
    pf_basic_3: "âœ… ÐŸÐ¾Ð´Ð´ÐµÑ€Ð¶ÐºÐ° 3 ÑÐ·Ñ‹ÐºÐ¾Ð² (RU, EN, HE)",
    pf_basic_4: "âœ… Ð¡Ð¾Ñ…Ñ€Ð°Ð½ÐµÐ½Ð¸Ðµ Ð¸ÑÑ‚Ð¾Ñ€Ð¸Ð¸ Ð³Ð¾Ð»Ð¾ÑÐ¾Ð² Ð¸ Ñ€Ð°ÑÑÐºÐ°Ð·Ð¾Ð²",
    btn_plan_basic: "Ð’Ñ‹Ð±Ñ€Ð°Ñ‚ÑŒ Ð‘Ð°Ð·Ð¾Ð²Ñ‹Ð¹",
    popular_badge: "ðŸ”¥ ÐŸÐ¾Ð¿ÑƒÐ»ÑÑ€Ð½Ñ‹Ð¹ Ð²Ñ‹Ð±Ð¾Ñ€",
    plan_premium_sub: "ÐŸÐ¾Ð»Ð½Ñ‹Ð¹ Ð¿Ð¾ÐºÐ¾Ð¹ Ð¸ Ð³Ð°Ñ€Ð¼Ð¾Ð½Ð¸Ñ ÑÐµÐ¼ÑŒÐ¸",
    pf_prem_1: "âœ… 120 Ð¼Ð¸Ð½ÑƒÑ‚ Ð³ÐµÐ½ÐµÑ€Ð°Ñ†Ð¸Ð¹ (~12 Ð¼ÐµÐ´Ð¸Ñ‚Ð°Ñ†Ð¸Ð¹)",
    pf_prem_2: "âœ… Ð­ÐºÑÑ‚Ñ€ÐµÐ½Ð½Ð°Ñ Ð¿Ð¾Ð¼Ð¾Ñ‰ÑŒ Ð¿Ñ€Ð¸ Ð¸ÑÑ‚ÐµÑ€Ð¸ÐºÐµ",
    pf_prem_3: "âœ… Ð¡ÐµÐ¼ÐµÐ¹Ð½Ñ‹Ð¹ Ð´Ð¾ÑÑ‚ÑƒÐ¿ Ð´Ð¾ 4 ÑƒÑÑ‚Ñ€Ð¾Ð¹ÑÑ‚Ð²",
    pf_prem_4: "âœ… ÐŸÑ€Ð¸Ð¾Ñ€Ð¸Ñ‚ÐµÑ‚Ð½Ð°Ñ Ð¿Ð¾Ð´Ð´ÐµÑ€Ð¶ÐºÐ°",
    btn_plan_premium: "ÐÐºÑ‚Ð¸Ð²Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ ÐŸÑ€ÐµÐ¼Ð¸ÑƒÐ¼",
    plan_plat_sub: "ÐœÐ°ÐºÑÐ¸Ð¼Ð°Ð»ÑŒÐ½Ñ‹Ð¹ Ñ€ÐµÑÑƒÑ€Ñ Ð¸ Ð¿Ð¾Ð´Ð´ÐµÑ€Ð¶ÐºÐ°",
    pf_plat_1: "âœ… 300 Ð¼Ð¸Ð½ÑƒÑ‚ Ð³ÐµÐ½ÐµÑ€Ð°Ñ†Ð¸Ð¸ Ð°ÑƒÐ´Ð¸Ð¾",
    pf_plat_2: "âœ… ÐÐµÐ¾Ð³Ñ€Ð°Ð½Ð¸Ñ‡ÐµÐ½Ð½Ð°Ñ Ð±Ð¸Ð±Ð»Ð¸Ð¾Ñ‚ÐµÐºÐ° Ð¼ÐµÐ´Ð¸Ñ‚Ð°Ñ†Ð¸Ð¹",
    pf_plat_3: "âœ… ÐŸÐµÑ€ÑÐ¾Ð½Ð°Ð»ÑŒÐ½Ñ‹Ð¹ ÐÐ³ÐµÐ½Ñ‚-Ð¡ÑƒÐ¿ÐµÑ€Ð²Ð¸Ð·Ð¾Ñ€",
    pf_plat_4: "âœ… Ð¡ÐµÐ¼ÐµÐ¹Ð½Ñ‹Ð¹ Ð´Ð¾ÑÑ‚ÑƒÐ¿ Ð´Ð¾ 8 ÑƒÑÑ‚Ñ€Ð¾Ð¹ÑÑ‚Ð²",
    btn_plan_platinum: "Ð’Ñ‹Ð±Ñ€Ð°Ñ‚ÑŒ ÐŸÐ»Ð°Ñ‚Ð¸Ð½Ð¾Ð²Ñ‹Ð¹",
    topup_tag: "âš¡ Ð”Ð¾Ð¿Ð¾Ð»Ð½Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ñ‹Ðµ Ð¼Ð¸Ð½ÑƒÑ‚Ñ‹:",
    topup_title: "ÐŸÐ°ÐºÐµÑ‚ Â«Ð•Ñ‰Ðµ 50 Ð¼Ð¸Ð½ÑƒÑ‚ Ð¼ÐµÐ´Ð¸Ñ‚Ð°Ñ†Ð¸Ð¹Â»",
    topup_desc: "Ð—Ð°ÐºÐ¾Ð½Ñ‡Ð¸Ð»ÑÑ Ð»Ð¸Ð¼Ð¸Ñ‚ Ð¿Ð¾Ð´Ð¿Ð¸ÑÐºÐ¸? Ð”Ð¾ÐºÑƒÐ¿Ð¸Ñ‚Ðµ 50 Ð¼Ð¸Ð½ÑƒÑ‚ Ð±ÐµÐ· ÑÐ¼ÐµÐ½Ñ‹ Ñ‚Ð°Ñ€Ð¸Ñ„Ð½Ð¾Ð³Ð¾ Ð¿Ð»Ð°Ð½Ð°.",
    btn_topup: "Ð”Ð¾ÐºÑƒÐ¿Ð¸Ñ‚ÑŒ Ð·Ð° $4.99",
    footer_brand_desc: "Ð“Ð»Ð¾Ð±Ð°Ð»ÑŒÐ½Ð°Ñ Ð¸Ð½ÐºÐ»ÑŽÐ·Ð¸Ð²Ð½Ð°Ñ ÑÐºÐ¾ÑÐ¸ÑÑ‚ÐµÐ¼Ð° Ð´Ð»Ñ Ð·Ð°Ñ‰Ð¸Ñ‚Ñ‹ Ð¼ÐµÐ½Ñ‚Ð°Ð»ÑŒÐ½Ð¾Ð³Ð¾ Ð·Ð´Ð¾Ñ€Ð¾Ð²ÑŒÑ ÑÐµÐ¼ÐµÐ¹. Ð˜Ð˜, Ð´ÐµÑ‚ÑÐºÐ°Ñ Ð½ÐµÐ¹Ñ€Ð¾Ð¿ÑÐ¸Ñ…Ð¾Ð»Ð¾Ð³Ð¸Ñ Ð¸ ÐšÐŸÐ¢.",
    copyright_text: "Â© 2026 MindEcho AI Inc. Ð’ÑÐµ Ð¿Ñ€Ð°Ð²Ð° Ð·Ð°Ñ‰Ð¸Ñ‰ÐµÐ½Ñ‹.",
    footer_nav_title: "ÐÐ°Ð²Ð¸Ð³Ð°Ñ†Ð¸Ñ",
    footer_legal_title: "ÐšÐ¾Ð½Ñ„Ð¸Ð´ÐµÐ½Ñ†Ð¸Ð°Ð»ÑŒÐ½Ð¾ÑÑ‚ÑŒ",
    legal_terms: "Ð£ÑÐ»Ð¾Ð²Ð¸Ñ Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ð½Ð¸Ñ",
    legal_privacy: "ÐŸÐ¾Ð»Ð¸Ñ‚Ð¸ÐºÐ° Ð±ÐµÐ·Ð¾Ð¿Ð°ÑÐ½Ð¾ÑÑ‚Ð¸",
    legal_privacy_guarantee: "Privacy-First Ð“Ð°Ñ€Ð°Ð½Ñ‚Ð¸Ñ",
    modal_auth_title: "Ð’Ñ…Ð¾Ð´ Ð² MindEcho AI",
    modal_auth_sub: "Ð¡Ð¾Ñ…Ñ€Ð°Ð½Ð¸Ñ‚Ðµ Ð½Ð°ÑÑ‚Ñ€Ð¾Ð¹ÐºÐ¸ Ð¼ÐµÐ´Ð¸Ñ‚Ð°Ñ†Ð¸Ð¹ Ð¸ ÑÑ‚Ð°Ñ‚Ð¸ÑÑ‚Ð¸ÐºÑƒ",
    btn_auth_google: "Ð’Ñ…Ð¾Ð´ Ñ‡ÐµÑ€ÐµÐ· Google Account",
    btn_auth_apple: "Ð’Ñ…Ð¾Ð´ Ñ‡ÐµÑ€ÐµÐ· Apple Store ID",
    divider_or: "Ð¸Ð»Ð¸ Ð¿Ð¾ Email Ð¸ Ð¢ÐµÐ»ÐµÑ„Ð¾Ð½Ñƒ",
    label_auth_name: "Ð’Ð°ÑˆÐµ Ð˜Ð¼Ñ Ð¸ Ð¤Ð°Ð¼Ð¸Ð»Ð¸Ñ:",
    label_auth_email: "Ð’Ð°Ñˆ Email:",
    label_auth_phone: "ÐÐ¾Ð¼ÐµÑ€ Ñ‚ÐµÐ»ÐµÑ„Ð¾Ð½Ð°:",
    label_auth_address: "email address",
    label_terms_agree: "Ð¯ ÑÐ¾Ð³Ð»Ð°ÑÐµÐ½ Ñ Ð£ÑÐ»Ð¾Ð²Ð¸ÑÐ¼Ð¸ Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ð½Ð¸Ñ Ð¸ Ð¿Ð¾Ð»Ð¸Ñ‚Ð¸ÐºÐ¾Ð¹ ÐºÐ¾Ð½Ñ„Ð¸Ð´ÐµÐ½Ñ†Ð¸Ð°Ð»ÑŒÐ½Ð¾ÑÑ‚Ð¸.",
    btn_auth_submit: "Ð’Ð¾Ð¹Ñ‚Ð¸ / Ð—Ð°Ñ€ÐµÐ³Ð¸ÑÑ‚Ñ€Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒÑÑ",
    checkout_title: "ÐžÑ„Ð¾Ñ€Ð¼Ð»ÐµÐ½Ð¸Ðµ Ð¿Ð¾Ð´Ð¿Ð¸ÑÐºÐ¸",
    checkout_amount: "Ð¡ÑƒÐ¼Ð¼Ð° Ðº Ð¾Ð¿Ð»Ð°Ñ‚Ðµ:",
    label_card_name: "Ð˜Ð¼Ñ Ð½Ð° ÐºÐ°Ñ€Ñ‚Ðµ:",
    label_card_num: "ÐÐ¾Ð¼ÐµÑ€ Ð±Ð°Ð½ÐºÐ¾Ð²ÑÐºÐ¾Ð¹ ÐºÐ°Ñ€Ñ‚Ñ‹:",
    label_card_exp: "Ð¡Ñ€Ð¾Ðº (ÐœÐœ/Ð“Ð“):",
    label_card_cvc: "CVC / CVV:",
    btn_pay_submit: "ÐžÐ¿Ð»Ð°Ñ‚Ð¸Ñ‚ÑŒ Ð¸ Ð·Ð°Ð¿ÑƒÑÑ‚Ð¸Ñ‚ÑŒ Ð´Ð¾ÑÑ‚ÑƒÐ¿",
    nda_title: "ðŸ“œ ÐŸÐ¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÑŒÑÐºÐ¾Ðµ ÑÐ¾Ð³Ð»Ð°ÑˆÐµÐ½Ð¸Ðµ (Terms of Service)",
    nda_sub: "ÐžÐ¢ÐšÐÐ— ÐžÐ¢ ÐžÐ¢Ð’Ð•Ð¢Ð¡Ð¢Ð’Ð•ÐÐÐžÐ¡Ð¢Ð˜ Ð˜ ÐžÐ“Ð ÐÐÐ˜Ð§Ð•ÐÐ˜Ð• ÐŸÐ Ð•Ð¢Ð•ÐÐ—Ð˜Ð™ (DISCLAIMER)",
    label_nda_name: "Ð’Ð°ÑˆÐµ Ð¤Ð˜Ðž ÐŸÐ¾Ð´Ð¿Ð¸ÑÐ°Ð½Ñ‚Ð°:",
    label_signature_canvas: "âœï¸ ÐŸÐ¾ÑÑ‚Ð°Ð²ÑŒÑ‚Ðµ Ð¿Ð¾Ð´Ð¿Ð¸ÑÑŒ Ð¼Ñ‹ÑˆÐºÐ¾Ð¹ Ð¸Ð»Ð¸ Ð¿Ð°Ð»ÑŒÑ†ÐµÐ¼ Ð½Ð¸Ð¶Ðµ:",
    btn_clear_sig: "ÐžÑ‡Ð¸ÑÑ‚Ð¸Ñ‚ÑŒ",
    btn_submit_nda: "âœ… ÐŸÑ€Ð¸Ð½ÑÑ‚ÑŒ Ð¸ Ð¿Ð¾Ð´Ð¿Ð¸ÑÐ°Ñ‚ÑŒ NDA (ÐŸÐµÑ€ÐµÐ¹Ñ‚Ð¸ Ðº Ð´Ð¾ÐºÑƒÐ¼ÐµÐ½Ñ‚Ñƒ)",
    custdev_modal_title: "ðŸ’¬ ÐžÐ¿Ñ€Ð¾Ñ CustDev: ÐŸÐ¾Ð¼Ð¾Ð³Ð¸Ñ‚Ðµ ÑÐ´ÐµÐ»Ð°Ñ‚ÑŒ Ð¿Ñ€Ð¾Ð´ÑƒÐºÑ‚ Ð»ÑƒÑ‡ÑˆÐµ",
    custdev_modal_sub: "Ð’Ñ‹Ð±ÐµÑ€Ð¸Ñ‚Ðµ Ð¸Ð½Ñ‚ÐµÑ€ÐµÑÑƒÑŽÑ‰Ð¸Ð¹ Ð²Ð°Ñ ÑÑ†ÐµÐ½Ð°Ñ€Ð¸Ð¹ Ð¸ Ð¾Ñ‚Ð²ÐµÑ‚ÑŒÑ‚Ðµ Ð½Ð° 3 ÐºÐ¾Ñ€Ð¾Ñ‚ÐºÐ¸Ñ… Ð²Ð¾Ð¿Ñ€Ð¾ÑÐ°:",
    btn_submit_custdev: "ðŸš€ ÐžÑ‚Ð¿Ñ€Ð°Ð²Ð¸Ñ‚ÑŒ Ð¾Ñ‚Ð²ÐµÑ‚Ñ‹ Ð¸ Ð¿Ð¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ VIP-Ð´Ð¾ÑÑ‚ÑƒÐ¿",
    sticky_text: "Ð˜Ð½Ð²ÐµÑÑ‚Ð¸Ñ€ÑƒÐ¹Ñ‚Ðµ Ð² Ð³Ð°Ñ€Ð¼Ð¾Ð½Ð¸ÑŽ ÑÐµÐ¼ÑŒÐ¸ Ð¾Ñ‚ $7/Ð¼ÐµÑ",
    btn_choose_plan: "Ð’Ñ‹Ð±Ñ€Ð°Ñ‚ÑŒ Ñ‚Ð°Ñ€Ð¸Ñ„"
  },
  en: {
    nav_mission: "Mission",
    nav_modes: "Audio Modes",
    nav_generator: "Studio",
    nav_pricing: "Pricing",
    nav_nda: "NDA Signature",
    nav_custdev: "CustDev Survey",
    btn_login: "Log In",
    hero_badge: "AI + Child Neuropsychology + CBT/ACT + Psychosomatics",
    hero_title: "Transforming parenting routine into <span class='text-gradient'>gentle therapy</span>",
    hero_subtitle: "We build a global tech ecosystem for family mental health. A legal way to save parents' emotional resources and raise happy children.",
    btn_try_free: "ðŸš€ Try Free (2 requests/day)",
    btn_support_project: "[ Support Project / Get Link ]",
    trust_privacy: "ðŸ›¡ Privacy-First (Bank-grade Encryption)",
    trust_supervisor: "ðŸ§  Validated by Supervisor AI Agent",
    trust_global: "ðŸŒ Global Inclusivity",
    hero_card_sub: "Very Slow Deep Male Voice â€¢ Pure Speech Without Music",
    hero_sample_quote: '"Close your eyes and pay attention to your nose... Feel calm and peaceful joy inside..."',
    hero_card_footer: "âœ¨ Personalized Narrative Meditation",
    tag_supermission: "MindEcho AI Super-Mission",
    title_supermission: "4 Pillars of Public Impact",
    sub_supermission: "Creating a scientifically validated and secure ecosystem for family mental health worldwide.",
    m1_title: "1. Global Inclusivity",
    m1_desc: "Erasing social inequality. Platform remains accessible even for low-income families â€” every child deserves healthy mental growth.",
    m2_title: "2. Family Harmony Without Fights",
    m2_desc: "Progressive audio modes eliminate tantrums and resentment, gently boosting emotional intelligence (EQ).",
    m3_title: "3. Saving Parents' Energy",
    m3_desc: "Protecting parents from burnout, guaranteeing 1â€“2 hours of personal daily time.",
    m3_tag: "Freeing up 1-2 hours of personal time",
    m4_title: "4. Preventing Child Trauma",
    m4_desc: "Gently healing daytime stress and fears right during sleep transition, programming confidence.",
    m4_tag: "Scientifically proven psychotherapeutic protocols",
    tag_modes: "Quick Launch",
    title_modes: "3 Core Audio Therapy Modes",
    sub_modes: "Select a scenario for instant personalized narrative meditation or emergency relief",
    mode_morning_title: "Morning Meditation",
    mode_morning_desc: "Boost of energy, self-belief, learning ease, and joy for the new day.",
    btn_start_morning: "Start Morning Vibe",
    mode_bedtime_title: "Bedtime Meditation",
    mode_bedtime_desc: "Gentle sleep transition, dissolving daytime fears, and cultivating deep peace.",
    btn_start_bedtime: "Start Sleep Therapy",
    mode_emergency_title: "Emergency Tantrum Relief",
    mode_emergency_desc: "Instant 4-step algorithm for parents + express audio for child grounding.",
    btn_start_emergency: "ðŸš¨ Activate Emergency Relief",
    em_header: "ðŸš¨ Emergency Protocol: Tantrum Relief",
    em_step1_title: "Your Composure",
    em_step1_desc: "Take a deep breath. You are the calm safety anchor for your child.",
    em_step2_title: "Safety First",
    em_step2_desc: "Remove sharp objects, lower your voice tone, crouch to child's eye level.",
    em_step3_title: "Legalization",
    em_step3_desc: 'Quietly say: "I see that you are upset and angry. I am right here with you."',
    em_step4_title: "Grounding",
    em_step4_desc: "Play soothing AI audio and let the child feel rhythm of breathing.",
    em_input_label: "Describe the situation (what happened?):",
    btn_gen_emergency: "âœ¨ Generate Express Audio",
    tag_studio: "Meditation Studio",
    title_studio: "Personal Narrative Meditation",
    sub_studio: "Parent Voice Recording + Studio MP3 + Dynamic AI Speech",
    label_mic_rec: "ðŸŽ™ Record Your Voice / Questions:",
    mic_press_text: "Click microphone to record voice",
    label_child_name: "Child's Name:",
    label_child_gender: "Gender:",
    opt_girl: "Girl",
    opt_boy: "Boy",
    label_child_age: "Age (years):",
    label_audio_source: "Audio Source:",
    opt_source_mp3: "ðŸŽµ Studio MP3 Track",
    opt_source_tts: "ðŸ¤– Dynamic AI Voice (Deep Tone)",
    label_voice_timbre: "Voice Timbre:",
    opt_male_deep: "ðŸŽ™ Male â€” Very slow, calm deep voice",
    label_meditation_mode: "Meditation Mode:",
    opt_mode_bedtime: "ðŸŒ™ Bedtime (Sleep)",
    opt_mode_morning: "â˜€ï¸ Morning (Confidence)",
    opt_mode_emergency: "ðŸš¨ Emergency (Grounding)",
    btn_generate: "âœ¨ Generate & Play Narrative Meditation",
    player_title_default: "Narrative Meditation",
    player_sub_default: "Very Slow Deep Male Voice â€¢ Pure Speech",
    player_placeholder: 'Enter name and click "Generate"...',
    tag_pricing: "Transparent Pricing",
    title_pricing: "Select Subscription Plan",
    sub_pricing: "Freemium access + Generation credits + Top-up minutes",
    billing_monthly: "Monthly",
    billing_annual: "Annual Payment -67% Discount",
    plan_title_free: "Free (Basic)",
    plan_title_basic: "Basic",
    plan_title_premium: "Premium",
    plan_title_platinum: "Platinum",
    plan_free_sub: "Feel the service value",
    plan_forever: "/ forever",
    pf_free_1: "âœ… 2 AI requests per day",
    pf_free_2: "âœ… Standard narrative meditation",
    pf_free_3: "âœ… Slow male voice narration",
    pf_free_4: "âŒ No history saving",
    btn_plan_free: "Start Free",
    plan_basic_sub: "For daily tune-ups",
    plan_per_month: "/ month",
    pf_basic_1: "âœ… 50 minutes generations / month",
    pf_basic_2: "âœ… Personalization with child name",
    pf_basic_3: "âœ… 3 Languages support (RU, EN, HE)",
    pf_basic_4: "âœ… Google Sheets logging",
    btn_plan_basic: "Choose Basic",
    popular_badge: "ðŸ”¥ Popular Choice",
    plan_premium_sub: "Full peace and family harmony",
    pf_prem_1: "âœ… 120 minutes generations (~12 meditations)",
    pf_prem_2: "âœ… Emergency tantrum relief",
    pf_prem_3: "âœ… Family access up to 4 devices",
    pf_prem_4: "âœ… Priority support",
    btn_plan_premium: "Activate Premium",
    plan_plat_sub: "Maximum resource and support",
    pf_plat_1: "âœ… 300 minutes audio generation",
    pf_plat_2: "âœ… Unlimited meditation library",
    pf_plat_3: "âœ… Personal Supervisor AI Agent",
    pf_plat_4: "âœ… Family access up to 8 devices",
    btn_plan_platinum: "Choose Platinum",
    topup_tag: "âš¡ Extra Minutes:",
    topup_title: "Pack 'Extra 50 Minutes Meditations'",
    topup_desc: "Out of subscription credits? Top up 50 minutes without plan change.",
    btn_topup: "Top up for $4.99",
    footer_brand_desc: "Global inclusive ecosystem for family mental health protection. AI, child neuropsychology and CBT.",
    copyright_text: "Â© 2026 MindEcho AI Inc. All rights reserved.",
    footer_nav_title: "Navigation",
    footer_legal_title: "Privacy & Legal",
    legal_terms: "Terms of Use",
    legal_privacy: "Security Policy",
    legal_privacy_guarantee: "Privacy-First Guarantee",
    modal_auth_title: "Sign in to MindEcho AI",
    modal_auth_sub: "Save your meditation settings and analytics",
    btn_auth_google: "Sign in with Google Account",
    btn_auth_apple: "Sign in with Apple Store ID",
    divider_or: "or via Email and Phone",
    label_auth_name: "Full Name:",
    label_auth_email: "Email Address:",
    label_auth_phone: "Phone Number:",
    label_auth_address: "City / Residence Address:",
    label_terms_agree: "I agree with Terms of Use and Privacy Policy.",
    btn_auth_submit: "Sign In / Register",
    checkout_title: "Subscription Checkout",
    checkout_amount: "Total Amount:",
    label_card_name: "Name on Card:",
    label_card_num: "Card Number:",
    label_card_exp: "Expiry (MM/YY):",
    label_card_cvc: "CVC / CVV:",
    btn_pay_submit: "Pay & Activate Access",
    nda_title: "ðŸ“œ Terms of Service",
    nda_sub: "DISCLAIMER AND LIMITATION OF CLAIMS",
    label_nda_name: "Signer Full Name:",
    label_signature_canvas: "âœï¸ Sign with mouse or finger below:",
    btn_clear_sig: "Clear",
    btn_submit_nda: "âœ… Accept & Sign NDA (Proceed to Document)",
    custdev_modal_title: "ðŸ’¬ CustDev Survey: Help Us Improve MindEcho AI",
    custdev_modal_sub: "Select your preferred scenario and answer 3 quick questions:",
    btn_submit_custdev: "ðŸš€ Submit Answers & Get VIP Access",
    sticky_text: "Invest in family harmony from $7/mo",
    btn_choose_plan: "Choose Plan"
  },
  he: {
    nav_mission: "×ž×©×™×ž×”",
    nav_modes: "×ž×¦×‘×™ ×©×ž×¢",
    nav_generator: "×¡×˜×•×“×™×•",
    nav_pricing: "×ª×¢×¨×™×¤×™×",
    nav_nda: "×—×ª×™×ž×ª NDA",
    nav_custdev: "×¡×§×¨ CustDev",
    btn_login: "×”×ª×—×‘×¨",
    hero_badge: "×‘×™× ×” ×ž×œ××›×•×ª×™×ª + × ×•×™×¨×•×¤×¡×™×›×•×œ×•×’×™×” + CBT/ACT",
    hero_title: "×”×•×¤×›×™× ××ª ×©×’×¨×ª ×”×”×•×¨×•×ª ×œ<span class='text-gradient'>×ª×¨×¤×™×” ×¢×“×™× ×”</span>",
    hero_subtitle: "×¤×ª×¨×•×Ÿ ×˜×›× ×•×œ×•×’×™ ×’×œ×•×‘×œ×™ ×œ×‘×¨×™××•×ª ×”× ×¤×© ×©×œ ×”×ž×©×¤×—×”. ×œ×©×ž×•×¨ ×¢×œ ×”×ž×©××‘×™× ×”×¨×’×©×™×™× ×©×œ ×”×”×•×¨×™× ×•×œ×’×“×œ ×™×œ×“×™× ×ž××•×©×¨×™×.",
    btn_try_free: "ðŸš€ × ×¡×” ×‘×—×™× × (2 ×‘×§×©×•×ª ×‘×™×•×)",
    btn_support_project: "[ ×ª×ž×•×š ×‘×¤×¨×•×™×§×˜ / ×§×‘×œ ×§×™×©×•×¨ ]",
    trust_privacy: "ðŸ›¡ Privacy-First (×”×¦×¤× ×” ×‘× ×§××™×ª)",
    trust_supervisor: "ðŸ§  ×ž××•×ž×ª ×¢\"×™ ×¡×•×›×Ÿ AI ×ž×¤×§×—",
    trust_global: "ðŸŒ ×”×›×œ×” ×’×œ×•×‘×œ×™×ª",
    hero_card_sub: "×§×•×œ ×’×‘×¨×™ × ×ž×•×š ×•××™×˜×™ ×ž××•×“ â€¢ ×œ×œ× ×ž×•×–×™×§×”",
    hero_sample_quote: '"×¢×¦×ž×™ ×¢×™× ×™×™× ×•×”×ª×ž×§×“×™ ×‘××£ ×©×œ×š... ×—×•×©×™ ×©×œ×•×•×” ×•×©×ž×—×” ×©×§×˜×” ×‘×¤× ×™×..."',
    hero_card_footer: "âœ¨ ×¡×™×¤×•×¨-×ž×“×™×˜×¦×™×” ×ž×•×ª×× ××™×©×™×ª",
    tag_supermission: "×¡×•×¤×¨-×ž×©×™×ž×” ×©×œ MindEcho AI",
    title_supermission: "4 ×¢×ž×•×“×™ ×”×ª×•×•×š ×©×œ ×”×¤×¨×•×™×§×˜",
    sub_supermission: "×ž×¢×¨×›×ª ××§×•×œ×•×’×™×ª ×‘×˜×•×—×” ×•×ž×•×›×—×ª ×ž×“×¢×™×ª ×œ×‘×¨×™××•×ª ×”× ×¤×© ×©×œ ×ž×©×¤×—×•×ª ×‘×¨×—×‘×™ ×”×¢×•×œ×.",
    m1_title: "1. ×”×›×œ×” ×’×œ×•×‘×œ×™×ª",
    m1_desc: "×ž×—×™×§×ª ××™-×©×•×•×™×•×Ÿ ×—×‘×¨×ª×™. ×”×¤×œ×˜×¤×•×¨×ž×” × ×’×™×©×” ×œ×›×œ ×”×ž×©×¤×—×•×ª â€” ×œ×›×œ ×™×œ×“ ×ž×’×™×¢×” ×¦×ž×™×—×” × ×¤×©×™×ª ×‘×¨×™××”.",
    m2_title: "2. ×”×¨×ž×•× ×™×” ×‘×‘×™×ª ×œ×œ× ×ž×¨×™×‘×•×ª",
    m2_desc: "×ž×¦×‘×™ ×©×ž×¢ ×ž×ª×§×“×ž×™× ×ž×•× ×¢×™× ×”×ª×§×¤×™ ×–×¢× ×•×ž×¢×œ×™× ×‘×¢×“×™× ×•×ª ××ª ×”××™× ×˜×œ×™×’× ×¦×™×” ×”×¨×’×©×™×ª (EQ).",
    m3_title: "3. ×—×™×¡×›×•×Ÿ ×‘×× ×¨×’×™×” ×©×œ ×”×”×•×¨×™×",
    m3_desc: "×”×’× ×” ×¢×œ ×”×”×•×¨×™× ×ž×¤× ×™ ×©×—×™×§×”, ×¢× ×”×‘×˜×—×” ×œ-1â€“2 ×©×¢×•×ª ×–×ž×Ÿ ××™×©×™ ×‘×™×•×.",
    m3_tag: "1-2 ×©×¢×•×ª ×©×œ ×–×ž×Ÿ ××™×©×™",
    m4_title: "4. ×ž× ×™×¢×ª ×˜×¨××•×ž×•×ª ×™×œ×“×•×ª",
    m4_desc: "×¨×™×¤×•×™ ×¢×“×™×Ÿ ×©×œ ×¤×—×“×™× ×•×ž×ª×—×™× ×™×©×™×¨×•×ª ×‘×ª×”×œ×™×š ×”×”×¨×“×ž×”, ×ª×•×š ×ª×›× ×•×ª ×‘×™×˜×—×•×Ÿ ×¢×¦×ž×™.",
    m4_tag: "×¤×¨×•×˜×•×§×•×œ×™× ×¤×¡×™×›×•×ª×¨×¤×™×™× ×ž×•×›×—×™× ×ž×“×¢×™×ª",
    tag_modes: "×”×¤×¢×œ×” ×ž×”×™×¨×”",
    title_modes: "3 ×ž×¦×‘×™ ×˜×™×¤×•×œ ×‘×©×ž×¢",
    sub_modes: "×‘×—×¨ ×ª×¨×—×™×© ×œ×™×¦×™×¨×” ×ž×™×™×“×™×ª ×©×œ ×ž×“×™×˜×¦×™×” ××• ×¢×–×¨×” ×“×—×•×¤×”",
    mode_morning_title: "×ž×“×™×˜×¦×™×™×ª ×‘×•×§×¨",
    mode_morning_desc: "×—×™×–×•×§ ×”×‘×™×˜×—×•×Ÿ, ×”×§×œ×” ×‘×œ×™×ž×•×“×™× ×•×©×ž×—×” ×œ×™×•× ×”×—×“×©.",
    btn_start_morning: "×”×ª×—×œ ×ž×“×™×˜×¦×™×™×ª ×‘×•×§×¨",
    mode_bedtime_title: "×ž×“×™×˜×¦×™×” ×œ×¤× ×™ ×”×©×™× ×”",
    mode_bedtime_desc: "×ž×¢×‘×¨ ×¢×“×™×Ÿ ×œ×©×™× ×”, ×”×¤×’×ª ×¤×—×“×™× ×•×˜×™×¤×•×— ×©×œ×•×•×” ×¢×ž×•×§×”.",
    btn_start_bedtime: "×”×ª×—×œ ×ª×¨×¤×™×™×ª ×©×™× ×”",
    mode_emergency_title: "×¢×–×¨×” ×“×—×•×¤×” ×‘×–×ž×Ÿ ×”×ª×§×£ ×–×¢×",
    mode_emergency_desc: "××œ×’×•×¨×™×ª× ×ž×™×™×“×™ ×©×œ 4 ×©×œ×‘×™× ×œ×”×•×¨×” + ×©×ž×¢ ×ž×”×™×¨ ×œ×§×¨×§×•×¢ ×”×™×œ×“.",
    btn_start_emergency: "ðŸš¨ ×”×¤×¢×œ ×¢×–×¨×” ×“×—×•×¤×”",
    em_header: "ðŸš¨ ×¤×¨×•×˜×•×§×•×œ ×—×™×¨×•×: ×¢×–×¨×” ×‘×–×ž×Ÿ ×”×ª×§×£ ×–×¢×",
    em_step1_title: "×”××™×¤×•×§ ×©×œ×š",
    em_step1_desc: "×§×— × ×©×™×ž×” ×¢×ž×•×§×”. ××ª×” ×¢×•×’×Ÿ ×”×‘×˜×™×—×•×ª ×”×©×§×˜ ×©×œ ×”×™×œ×“.",
    em_step2_title: "×‘×˜×™×—×•×ª ×ª×—×™×œ×”",
    em_step2_desc: "×”×¨×—×§ ×—×¤×¦×™× ×—×“×™×, ×”× ×ž×š ××ª ×§×•×œ×š ×•×”×ª×›×•×¤×£ ×œ×’×•×‘×” ×”×¢×™× ×™×™× ×©×œ ×”×™×œ×“.",
    em_step3_title: "×œ×’×™×˜×™×ž×¦×™×”",
    em_step3_desc: '××ž×•×¨ ×‘×©×§×˜: "×× ×™ ×¨×•××” ×©×§×©×” ×œ×š ×•××ª×” ×›×•×¢×¡. ×× ×™ ×›××Ÿ ××™×ª×š."',
    em_step4_title: "×§×¨×§×•×¢",
    em_step4_desc: "×”×¤×¢×œ ×©×ž×¢ ×ž×¨×’×™×¢ ×©×œ ×‘×™× ×” ×ž×œ××›×•×ª×™×ª ×•×ª×Ÿ ×œ×™×œ×“ ×œ×”×¨×’×™×© ××ª ×§×¦×‘ ×”× ×©×™×ž×”.",
    em_input_label: "×ª××¨ ××ª ×”×¡×™×˜×•××¦×™×” (×ž×” ×§×¨×”?):",
    btn_gen_emergency: "âœ¨ ×¦×•×¨ ×©×ž×¢ ×ž×”×™×¨",
    tag_studio: "×¡×˜×•×“×™×• ×ž×“×™×˜×¦×™×”",
    title_studio: "×¡×™×¤×•×¨-×ž×“×™×˜×¦×™×” ××™×©×™",
    sub_studio: "×”×§×œ×˜×ª ×§×•×œ ×”×•×¨×” + ×”×§×œ×˜×ª ××•×œ×¤×Ÿ MP3 + ×“×™×‘×•×¨ AI ×“×™× ×ž×™",
    label_mic_rec: "ðŸŽ™ ×”×§×œ×˜×ª ×”×§×•×œ ×©×œ×š / ×©××œ×•×ª:",
    mic_press_text: "×œ×—×¥ ×¢×œ ×”×ž×™×§×¨×•×¤×•×Ÿ ×œ×”×§×œ×˜×”",
    label_child_name: "×©× ×”×™×œ×“/×”:",
    label_child_gender: "×ž×™×Ÿ ×”×™×œ×“/×”:",
    opt_girl: "×™×œ×“×”",
    opt_boy: "×™×œ×“",
    label_child_age: "×’×™×œ (×‘×©× ×™×):",
    label_audio_source: "×ž×§×•×¨ ×”×©×ž×¢:",
    opt_source_mp3: "ðŸŽµ ×”×§×œ×˜×ª ××•×œ×¤×Ÿ MP3",
    opt_source_tts: "ðŸ¤– ×§×¨×™×™×Ÿ AI ×“×™× ×ž×™ (×§×•×œ × ×ž×•×š)",
    label_voice_timbre: "×’×•×Ÿ ×”×§×•×œ:",
    opt_male_deep: "ðŸŽ™ ×’×‘×¨×™ â€” ×§×•×œ × ×ž×•×š ×•××™×˜×™ ×ž××•×“",
    label_meditation_mode: "×ž×¦×‘ ×ž×“×™×˜×¦×™×”:",
    opt_mode_bedtime: "ðŸŒ™ ×œ×¤× ×™ ×”×©×™× ×”",
    opt_mode_morning: "â˜€ï¸ ×‘×•×§×¨ (×‘×™×˜×—×•×Ÿ)",
    opt_mode_emergency: "ðŸš¨ ×—×™×¨×•× (×§×¨×§×•×¢)",
    btn_generate: "âœ¨ ×¦×•×¨ ×•×”×§×¨× ×¡×™×¤×•×¨-×ž×“×™×˜×¦×™×”",
    player_title_default: "×¡×™×¤×•×¨-×ž×“×™×˜×¦×™×”",
    player_sub_default: "×§×•×œ ×’×‘×¨×™ × ×ž×•×š ×•××™×˜×™ ×ž××•×“ â€¢ ×œ×œ× ×ž×•×–×™×§×”",
    player_placeholder: '×”×›× ×¡ ×©× ×•×œ×—×¥ "×¦×•×¨"...',
    tag_pricing: "×ª×ž×—×•×¨ ×©×§×•×£",
    title_pricing: "×‘×—×¨ ×ª×•×›× ×™×ª ×ž× ×•×™",
    sub_pricing: "×’×™×©×ª Freemium + ×§×¨×“×™×˜×™× ×œ×™×¦×™×¨×”",
    billing_monthly: "×—×•×“×©×™",
    billing_annual: "×ª×©×œ×•× ×©× ×ª×™ -67% ×”× ×—×”",
    plan_title_free: "×—×™× × (×‘×¡×™×¡×™)",
    plan_title_basic: "×‘×¡×™×¡×™",
    plan_title_premium: "×¤×¨×™×ž×™×•×",
    plan_title_platinum: "×¤×œ×˜×™× ×•×",
    plan_free_sub: "×œ×”×¨×’×™×© ××ª ×¢×¨×š ×”×©×™×¨×•×ª",
    plan_forever: "/ ×œ×ª×ž×™×“",
    pf_free_1: "âœ… 2 ×‘×§×©×•×ª AI ×‘×™×•×",
    pf_free_2: "âœ… ×¡×™×¤×•×¨-×ž×“×™×˜×¦×™×” ×¡×˜× ×“×¨×˜×™",
    pf_free_3: "âœ… ×”×§×¨××” ×‘×§×•×œ ×’×‘×¨×™ ××™×˜×™",
    pf_free_4: "âŒ ×œ×œ× ×©×ž×™×¨×ª ×”×™×¡×˜×•×¨×™×”",
    btn_plan_free: "×”×ª×—×œ ×‘×—×™× ×",
    plan_basic_sub: "×œ×”×ª××ž×•×ª ×™×•×ž×™×•×ž×™×•×ª",
    plan_per_month: "/ ×—×•×“×©",
    pf_basic_1: "âœ… 50 ×“×§×•×ª ×™×¦×™×¨×” ×‘×—×•×“×©",
    pf_basic_2: "âœ… ×”×ª××ž×” ××™×©×™×ª ×œ×©× ×”×™×œ×“",
    pf_basic_3: "âœ… ×ª×ž×™×›×” ×‘-3 ×©×¤×•×ª (RU, EN, HE)",
    pf_basic_4: "âœ… ×ª×™×¢×•×“ ×‘-Google Sheets",
    btn_plan_basic: "×‘×—×¨ ×‘×¡×™×¡×™",
    popular_badge: "ðŸ”¥ ×‘×—×™×¨×” ×¤×•×¤×•×œ×¨×™×ª",
    plan_premium_sub: "×©×œ×•×•×” ×ž×œ××” ×•×”×¨×ž×•× ×™×” ×ž×©×¤×—×ª×™×ª",
    pf_prem_1: "âœ… 120 ×“×§×•×ª ×™×¦×™×¨×” (~12 ×ž×“×™×˜×¦×™×•×ª)",
    pf_prem_2: "âœ… ×¢×–×¨×” ×“×—×•×¤×” ×‘×–×ž×Ÿ ×”×ª×§×£ ×–×¢×",
    pf_prem_3: "âœ… ×’×™×©×” ×ž×©×¤×—×ª×™×ª ×œ×¢×“ 4 ×ž×›×©×™×¨×™×",
    pf_prem_4: "âœ… ×ª×ž×™×›×” ×‘×¢×“×™×¤×•×ª",
    btn_plan_premium: "×”×¤×¢×œ ×¤×¨×™×ž×™×•×",
    plan_plat_sub: "×ž×©××‘×™× ×•×ª×ž×™×›×” ×ž×§×¡×™×ž×œ×™×™×",
    pf_plat_1: "âœ… 300 ×“×§×•×ª ×™×¦×™×¨×ª ×©×ž×¢",
    pf_plat_2: "âœ… ×¡×¤×¨×™×ª ×ž×“×™×˜×¦×™×•×ª ×œ×œ× ×”×’×‘×œ×”",
    pf_plat_3: "âœ… ×¡×•×›×Ÿ AI ×ž×¤×§×— ××™×©×™",
    pf_plat_4: "âœ… ×’×™×©×” ×ž×©×¤×—×ª×™×ª ×œ×¢×“ 8 ×ž×›×©×™×¨×™×",
    btn_plan_platinum: "×‘×—×¨ ×¤×œ×˜×™× ×•×",
    topup_tag: "âš¡ ×“×§×•×ª × ×•×¡×¤×•×ª:",
    topup_title: "×—×‘×™×œ×ª '×¢×•×“ 50 ×“×§×•×ª ×ž×“×™×˜×¦×™×”'",
    topup_desc: "× ×’×ž×¨×• ×”×§×¨×“×™×˜×™× ×‘×ž× ×•×™? ×”×•×¡×£ 50 ×“×§×•×ª ×œ×œ× ×©×™× ×•×™ ×ª×•×›× ×™×ª.",
    btn_topup: "×¨×›×•×© ×‘-$4.99",
    footer_brand_desc: "×ž×¢×¨×›×ª ××§×•×œ×•×’×™×ª ×ž×›×™×œ×” ×œ×‘×¨×™××•×ª ×”× ×¤×© ×©×œ ×”×ž×©×¤×—×”. AI, × ×•×™×¨×•×¤×¡×™×›×•×œ×•×’×™×” ×•-CBT.",
    copyright_text: "Â© 2026 MindEcho AI Inc. ×›×œ ×”×–×›×•×™×•×ª ×©×ž×•×¨×•×ª.",
    footer_nav_title: "× ×™×•×•×˜",
    footer_legal_title: "×¤×¨×˜×™×•×ª ×•×ª× ××™×",
    legal_terms: "×ª× ××™ ×©×™×ž×•×©",
    legal_privacy: "×ž×“×™× ×™×•×ª ××‘×˜×—×”",
    legal_privacy_guarantee: "××—×¨×™×•×ª Privacy-First",
    modal_auth_title: "×”×ª×—×‘×¨×•×ª ×œ-MindEcho AI",
    modal_auth_sub: "×©×ž×•×¨ ×”×’×“×¨×•×ª ×ž×“×™×˜×¦×™×” ×•×¡×˜×˜×™×¡×˜×™×§×”",
    btn_auth_google: "×”×ª×—×‘×¨ ×¢× Google Account",
    btn_auth_apple: "×”×ª×—×‘×¨ ×¢× Apple Store ID",
    divider_or: "××• ×‘××ž×¦×¢×•×ª ××™×ž×™×™×œ ×•×˜×œ×¤×•×Ÿ",
    label_auth_name: "×©× ×ž×œ×:",
    label_auth_email: "×›×ª×•×‘×ª ××™×ž×™×™×œ:",
    label_auth_phone: "×ž×¡×¤×¨ ×˜×œ×¤×•×Ÿ:",
    label_auth_address: "×¢×™×¨ / ×›×ª×•×‘×ª ×ž×’×•×¨×™×:",
    label_terms_agree: "×× ×™ ×ž×¡×›×™× ×œ×ª× ××™ ×”×©×™×ž×•×© ×•×ž×“×™× ×™×•×ª ×”×¤×¨×˜×™×•×ª.",
    btn_auth_submit: "×”×ª×—×‘×¨ / ×”×¨×©×",
    checkout_title: "×”×¨×©×ž×” ×œ×ž× ×•×™",
    checkout_amount: "×¡×›×•× ×œ×ª×©×œ×•×:",
    label_card_name: "×©× ×¢×œ ×”×›×¨×˜×™×¡:",
    label_card_num: "×ž×¡×¤×¨ ×›×¨×˜×™×¡ ××©×¨××™:",
    label_card_exp: "×ª×•×§×£ (MM/YY):",
    label_card_cvc: "CVC / CVV:",
    btn_pay_submit: "×©×œ× ×•×”×¤×¢×œ ×’×™×©×”",
    nda_title: "ðŸ“œ ×ª× ××™ ×©×™×¨×•×ª (Terms of Service)",
    nda_sub: "×›×ª×‘ ×•×™×ª×•×¨ ×•×”×’×‘×œ×ª ×ª×‘×™×¢×•×ª (DISCLAIMER)",
    label_nda_name: "×©× ×”×—×•×ª× ×”×ž×œ×:",
    label_signature_canvas: "âœï¸ ×—×ª×•× ×¢× ×”×¢×›×‘×¨ ××• ×”××¦×‘×¢ ×œ×ž×˜×”:",
    btn_clear_sig: "× ×§×”",
    btn_submit_nda: "âœ… ××¤×©×¨ ×•×—×ª×•× NDA (×¢×‘×•×¨ ×œ×ž×¡×ž×š)",
    custdev_modal_title: "ðŸ’¬ ×¡×§×¨ CustDev: ×¢×–×•×¨ ×œ× ×• ×œ×©×¤×¨ ××ª ×”×ž×•×¦×¨",
    custdev_modal_sub: "×‘×—×¨ ×ª×¨×—×™×© ×•×¢× ×” ×¢×œ 3 ×©××œ×•×ª ×§×¦×¨×•×ª:",
    btn_submit_custdev: "ðŸš€ ×©×œ×— ×ª×©×•×‘×•×ª ×•×§×‘×œ ×’×™×©×ª VIP",
    sticky_text: "×”×©×§×¢ ×‘×”×¨×ž×•× ×™×” ×ž×©×¤×—×ª×™×ª ×”×—×œ ×ž-$7 ×œ×—×•×“×©",
    btn_choose_plan: "×‘×—×¨ ×ª×•×›× ×™×ª"
  }
};

// Russian Meditation Template Text
const BASE_MEDITATION_TEMPLATE_RU = `
{NAME}, Ñ Ñ…Ð¾Ñ‡Ñƒ Ð²Ð·ÑÑ‚ÑŒ Ñ‚ÐµÐ±Ñ Ñ ÑÐ¾Ð±Ð¾Ð¹ Ð² Ð½ÐµÐ±Ð¾Ð»ÑŒÑˆÐ¾Ðµ Ð¿ÑƒÑ‚ÐµÑˆÐµÑÑ‚Ð²Ð¸Ðµ Ð² Ð²Ð¾Ð»ÑˆÐµÐ±Ð½Ð¾Ðµ Ð¼ÐµÑÑ‚Ð¾, Ð³Ð´Ðµ Ð¼Ñ‹ÑÐ»Ð¸ ÑÑ‚Ð°Ð½Ð¾Ð²ÑÑ‚ÑÑ Ñ€ÐµÐ°Ð»ÑŒÐ½Ð¾ÑÑ‚ÑŒÑŽ... Ð˜ Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð¼Ñ‹ ÑÐ¼Ð¾Ð³Ð»Ð¸ Ñ‚ÑƒÐ´Ð° Ð¿Ð¾Ð¿Ð°ÑÑ‚ÑŒ, Ð½Ð°Ð¼ Ð½ÑƒÐ¶Ð½Ð¾ Ð±ÑƒÐ´ÐµÑ‚ Ñ€Ð°ÑÐºÑ€Ñ‹Ñ‚ÑŒ ÑÐ²Ð¾ÑŽ Ð´ÑƒÑˆÑƒ. Ð¢Ð°Ðº Ñ‡Ñ‚Ð¾ ÑÐ»ÑƒÑˆÐ°Ð¹ Ð¼ÐµÐ½Ñ Ð²Ð½Ð¸Ð¼Ð°Ñ‚ÐµÐ»ÑŒÐ½Ð¾ Ð¸ Ð´Ð°Ð²Ð°Ð¹ Ð¾Ñ‚Ð¿Ñ€Ð°Ð²Ð¸Ð¼ÑÑ Ð² ÑÑ‚Ð¾ Ð²ÐµÑÑ‘Ð»Ð¾Ðµ Ð¿ÑƒÑ‚ÐµÑˆÐµÑÑ‚Ð²Ð¸Ðµ.

Ð—Ð°ÐºÑ€Ð¾Ð¹ Ð³Ð»Ð°Ð·Ð° Ð¸ Ð½Ð°Ñ‡Ð½Ð¸ Ð´Ñ‹ÑˆÐ°Ñ‚ÑŒ ÑÐ¿Ð¾ÐºÐ¾Ð¹Ð½Ð¾ Ð¸ Ñ€Ð¾Ð²Ð½Ð¾. Ð£ÑÐ¿Ð¾ÐºÐ¾Ð¹ÑÑ Ð¸ Ñ€Ð°ÑÑÐ»Ð°Ð±ÑŒÑÑ, Ñ€Ð°ÑÑÐ»Ð°Ð±ÑŒÑÑ... ÐžÐ±Ñ€Ð°Ñ‚Ð¸ Ð²Ð½Ð¸Ð¼Ð°Ð½Ð¸Ðµ Ð½Ð° ÑÐ²Ð¾Ð¹ Ð½Ð¾Ñ. ÐÐ°Ð¹Ð´Ð¸ ÐµÐ³Ð¾, Ð½Ðµ Ð¾Ñ‚ÐºÑ€Ñ‹Ð²Ð°Ñ Ð³Ð»Ð°Ð·. ÐŸÐ¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹ ÐµÐ³Ð¾ Ð¼Ñ‹ÑÐ»ÐµÐ½Ð½Ð¾. Ð”Ñ‹ÑˆÐ¸ ÑÐ¿Ð¾ÐºÐ¾Ð¹Ð½Ð¾ Ð¸ Ñ€Ð¾Ð²Ð½Ð¾, ÑÐ¾ÑÑ€ÐµÐ´Ð¾Ñ‚Ð¾Ñ‡ÑŒÑÑ Ð½Ð° Ð¾Ñ‰ÑƒÑ‰ÐµÐ½Ð¸Ð¸ Ð²Ð¾Ð·Ð´ÑƒÑ…Ð° Ñƒ Ð½Ð¾Ð·Ð´Ñ€ÐµÐ¹.

Ð Ñ‚ÐµÐ¿ÐµÑ€ÑŒ Ð¾Ð±Ñ€Ð°Ñ‚Ð¸ Ð²Ð½Ð¸Ð¼Ð°Ð½Ð¸Ðµ Ð½Ð° ÑÐ²Ð¾Ð¸ ÑƒÑˆÐ¸. ÐÐ°Ð¹Ð´Ð¸ Ð¸Ñ…, Ð¼Ñ‹ÑÐ»ÐµÐ½Ð½Ð¾ Ð¸Ñ… Ð¾Ñ‰ÑƒÑ‚Ð¸. ÐŸÐ¾Ð±ÑƒÐ´ÑŒ Ñ Ð½Ð¸Ð¼Ð¸. ÐŸÐ¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹ Ð¸Ñ… Ñ‚ÐµÐ¿Ð»Ð¾ Ð¸ Ð¼Ñ‹ÑÐ»ÐµÐ½Ð½Ð¾ Ð¿Ñ€ÐµÐ´ÑÑ‚Ð°Ð²ÑŒ Ð¸Ñ… Ñ„Ð¾Ñ€Ð¼Ñƒ.

Ð Ñ‚ÐµÐ¿ÐµÑ€ÑŒ Ð¾Ð±Ñ€Ð°Ñ‚Ð¸ Ð²Ð½Ð¸Ð¼Ð°Ð½Ð¸Ðµ Ð½Ð° Ð¿Ñ€Ð¾ÑÑ‚Ñ€Ð°Ð½ÑÑ‚Ð²Ð¾ Ð¼ÐµÐ¶Ð´Ñƒ ÑÐ²Ð¾Ð¸Ð¼Ð¸ ÑƒÑˆÐ°Ð¼Ð¸ Ð²Ð½ÑƒÑ‚Ñ€Ð¸ ÑÐ²Ð¾ÐµÐ¹ Ð³Ð¾Ð»Ð¾Ð²Ñ‹, Ð²Ð¾Ñ‚ Ð½Ð° ÑÑ‚Ð¾ Ð¿Ñ€Ð¾ÑÑ‚Ñ€Ð°Ð½ÑÑ‚Ð²Ð¾. ÐŸÐ¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹ ÐµÐ³Ð¾, Ð¿Ð¾Ð½Ð°Ð±Ð»ÑŽÐ´Ð°Ð¹ Ð·Ð° Ð½Ð¸Ð¼. 

Ð Ñ‚ÐµÐ¿ÐµÑ€ÑŒ Ð¾Ð±Ñ€Ð°Ñ‚Ð¸ Ð²Ð½Ð¸Ð¼Ð°Ð½Ð¸Ðµ Ð½Ð° Ð¿Ñ€Ð¾ÑÑ‚Ñ€Ð°Ð½ÑÑ‚Ð²Ð¾ Ð²Ð¾ÐºÑ€ÑƒÐ³ ÑÐ²Ð¾Ð¸Ñ… ÑƒÑˆÐµÐ¹ Ð¸ Ð·Ð° Ð¸Ñ… Ð¿Ñ€ÐµÐ´ÐµÐ»Ð°Ð¼Ð¸. ÐŸÐ¾Ð½Ð°Ð±Ð»ÑŽÐ´Ð°Ð¹ Ð·Ð° Ð½Ð¸Ð¼. Ð˜ Ð¾Ð±Ñ€Ð°Ñ‚Ð¸ Ð²Ð½Ð¸Ð¼Ð°Ð½Ð¸Ðµ Ð½Ð° Ð¿Ñ€Ð¾ÑÑ‚Ñ€Ð°Ð½ÑÑ‚Ð²Ð¾ Ð²Ð¾ÐºÑ€ÑƒÐ³ Ð²ÑÐµÐ¹ ÑÐ²Ð¾ÐµÐ¹ Ð³Ð¾Ð»Ð¾Ð²Ñ‹, Ð²Ð¾Ñ‚ Ð½Ð° ÑÑ‚Ð¾ Ð¿Ñ€Ð¾ÑÑ‚Ñ€Ð°Ð½ÑÑ‚Ð²Ð¾. ÐžÑ‰ÑƒÑ‚Ð¸ ÐµÐ³Ð¾ Ð¼Ñ‹ÑÐ»ÑÐ¼Ð¸, Ð¿Ð¾Ð½Ð°Ð±Ð»ÑŽÐ´Ð°Ð¹ Ð·Ð° Ð½Ð¸Ð¼, Ð¼Ñ‹ÑÐ»ÐµÐ½Ð½Ð¾ Ð¿Ð¾Ð±ÑƒÐ´ÑŒ Ð² Ð½ÐµÐ¼. Ð§ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹, ÐºÐ°Ðº Ñ‚Ð²Ð¾Ðµ Ð²Ð½Ð¸Ð¼Ð°Ð½Ð¸Ðµ Ñ€Ð°ÑÑˆÐ¸Ñ€ÑÐµÑ‚ÑÑ, ÑÐ»Ð¾Ð²Ð½Ð¾ Ð½ÐµÐ²Ð¸Ð´Ð¸Ð¼Ð¾Ðµ Ð¾Ð±Ð»Ð°ÐºÐ¾ Ð²Ð¾ÐºÑ€ÑƒÐ³ Ð³Ð¾Ð»Ð¾Ð²Ñ‹.

Ð ÑÐµÐ¹Ñ‡Ð°Ñ Ð¾Ð±Ñ€Ð°Ñ‚Ð¸ Ð²Ð½Ð¸Ð¼Ð°Ð½Ð¸Ðµ Ð½Ð° Ð¿Ñ€Ð¾ÑÑ‚Ñ€Ð°Ð½ÑÑ‚Ð²Ð¾ Ð¼ÐµÐ¶Ð´Ñƒ ÑÐ²Ð¾Ð¸Ð¼Ð¸ ÑƒÑˆÐ°Ð¼Ð¸ Ð¸ ÑÑ‚ÐµÐ½Ð°Ð¼Ð¸ ÐºÐ¾Ð¼Ð½Ð°Ñ‚Ñ‹, Ð³Ð´Ðµ Ñ‚Ñ‹ ÑÐµÐ¹Ñ‡Ð°Ñ Ð½Ð°Ñ…Ð¾Ð´Ð¸ÑˆÑŒÑÑ, Ð²Ð¾Ñ‚ Ð½Ð° ÑÑ‚Ð¾ Ð¿Ñ€Ð¾ÑÑ‚Ñ€Ð°Ð½ÑÑ‚Ð²Ð¾. ÐžÑ‰ÑƒÑ‚Ð¸ ÐµÐ³Ð¾, Ð¼Ñ‹ÑÐ»ÐµÐ½Ð½Ð¾ Ð¿Ð¾Ð±ÑƒÐ´ÑŒ Ð² Ð½ÐµÐ¼. ÐžÑ‚ÐºÑ€Ð¾Ð¹ ÑÐ²Ð¾Ð¹ Ñ€Ð°Ð·ÑƒÐ¼ Ñ‚Ð¾Ð¼Ñƒ, Ð½Ð°ÑÐºÐ¾Ð»ÑŒÐºÐ¾ Ð¾Ð½Ð¾ Ð²ÐµÐ»Ð¸ÐºÐ¾ â€” Ð¾Ð½Ð¾ Ð¿Ð¾Ð²ÑÑŽÐ´Ñƒ Ð²Ð¾ÐºÑ€ÑƒÐ³ Ñ‚ÐµÐ±Ñ. Ð”ÑƒÐ¼Ð°Ð¹ Ð¾ Ñ‚Ð¾Ð¼, ÐºÐ°Ðº Ð¼Ð½Ð¾Ð³Ð¾ ÑÐ²Ð¾Ð±Ð¾Ð´Ð½Ð¾Ð³Ð¾ Ð¼ÐµÑÑ‚Ð° Ð² ÐºÐ¾Ð¼Ð½Ð°Ñ‚Ðµ, Ð´Ñ‹ÑˆÐ¸ Ð»ÐµÐ³ÐºÐ¾ Ð¸ ÑÐ²Ð¾Ð±Ð¾Ð´Ð½Ð¾.

Ð Ñ‚ÐµÐ¿ÐµÑ€ÑŒ Ð´Ð°Ð²Ð°Ð¹ Ð¾Ñ‚Ð¿Ñ€Ð°Ð²Ð¸Ð¼ÑÑ Ð² Ð´Ñ€ÑƒÐ¶ÐµÐ»ÑŽÐ±Ð½Ð¾Ðµ Ð¼ÐµÑÑ‚ÐµÑ‡ÐºÐ¾. ÐŸÑ€ÐµÐ´ÑÑ‚Ð°Ð²ÑŒ, Ñ‡Ñ‚Ð¾ Ñƒ Ñ‚ÐµÐ±Ñ Ð² Ð³Ð¾Ð»Ð¾Ð²Ðµ ÐµÑÑ‚ÑŒ Ñ‚Ð°ÐºÐ¾Ðµ Ð¼ÐµÑÑ‚Ð¾, Ð³Ð´Ðµ Ñ‚ÐµÐ±Ðµ Ñ…Ð¾Ñ€Ð¾ÑˆÐ¾. ÐÐ°Ð¹Ð´Ð¸ ÐµÐ³Ð¾ Ð¸ Ð¿Ð¾Ð±ÑƒÐ´ÑŒ Ñ‚Ð°Ð¼. ÐŸÑ€ÐµÐ´ÑÑ‚Ð°Ð²ÑŒ ÑÐ°Ð¼Ð¾Ðµ ÐºÑ€Ð°ÑÐ¸Ð²Ð¾Ðµ Ð¸ Ð±ÐµÐ·Ð¾Ð¿Ð°ÑÐ½Ð¾Ðµ Ð¼ÐµÑÑ‚Ð¾, ÐºÐ¾Ñ‚Ð¾Ñ€Ð¾Ðµ Ñ‚Ñ‹ Ð¼Ð¾Ð¶ÐµÑˆÑŒ Ð²Ð¾Ð¾Ð±Ñ€Ð°Ð·Ð¸Ñ‚ÑŒ, Ð³Ð´Ðµ Ð¼Ð°Ð¼Ð° Ð¸ Ð¿Ð°Ð¿Ð° Ð²ÑÐµÐ³Ð´Ð° Ñ€ÑÐ´Ð¾Ð¼ Ñ Ñ‚Ð¾Ð±Ð¾Ð¹ Ð¸ Ð¿Ð¾Ð¼Ð¾Ð³Ð°ÑŽÑ‚ Ñ‚ÐµÐ±Ðµ.

ÐŸÐ¾Ñ‚Ð¾Ð¼Ñƒ Ñ‡Ñ‚Ð¾ ÑÑ‚Ð¾ Ñ‚Ð¾Ñ‚ Ð¼Ð¸Ñ€, ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ð¹ Ñ‚Ñ‹ Ð¿Ð¾ÑÑ‚Ñ€Ð¾Ð¸Ð»{GENDER_END} ÑÐ°Ð¼{GENDER_END} Ð¸ Ð² ÐºÐ¾Ñ‚Ð¾Ñ€Ð¾Ð¼ Ð²ÑÑ‘, Ð²Ð¾ Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ Ð²ÐµÑ€Ð¸ÑˆÑŒ â€” ÑÑ‚Ð¾ Ð¿Ñ€Ð°Ð²Ð´Ð°. Ð­Ñ‚Ð¾ Ñ‚Ð¾Ñ‚ ÑÐ°Ð¼Ñ‹Ð¹ Ð¼Ð¸Ñ€, Ð³Ð´Ðµ Ð²ÑÑ‘ Ð´ÐµÐ¹ÑÑ‚Ð²Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ð¾ ÑÐ±Ñ‹Ð²Ð°ÐµÑ‚ÑÑ, Ð³Ð´Ðµ Ð¼Ñ‹ÑÐ»Ð¸ ÑÑ‚Ð°Ð½Ð¾Ð²ÑÑ‚ÑÑ Ñ€ÐµÐ°Ð»ÑŒÐ½Ñ‹Ð¼Ð¸ Ð¸ Ð³Ð´Ðµ Ð²ÑÑ‘, Ð²Ð¾ Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ Ð²ÐµÑ€Ð¸ÑˆÑŒ, Ð¼Ð¾Ð¶ÐµÑ‚ ÑÐ»ÑƒÑ‡Ð¸Ñ‚ÑÑ. Ð”ÑƒÐ¼Ð°Ð¹ Ð¾ Ñ‚Ð¾Ð¼, Ñ‡Ñ‚Ð¾ Ð² ÑÑ‚Ð¾Ð¼ Ð¼ÐµÑÑ‚Ðµ Ñ‚Ñ‹ â€” Ð½Ð°ÑÑ‚Ð¾ÑÑ‰{GENDER_ADJ} Ð²Ð¾Ð»ÑˆÐµÐ±Ð½Ð¸{GENDER_WIZARD} Ð¸ Ð²ÑÑ‘ Ð¿Ð¾Ð´Ð²Ð»Ð°ÑÑ‚Ð½Ð¾ Ñ‚Ð²Ð¾ÐµÐ¹ Ð²Ð¾Ð»Ðµ.

ÐŸÐ¾Ð²ÐµÑ€ÑŒ Ð² Ñ‚Ð¾, Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ ÑƒÐ¼Ð½{GENDER_ADJ}, Ð¸ Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ Ð¾Ñ‡ÐµÐ½ÑŒ Ð±Ñ‹ÑÑ‚Ñ€Ð¾ Ð¸ Ð»ÐµÐ³ÐºÐ¾ ÑƒÑ‡Ð¸ÑˆÑŒÑÑ. ÐŸÐ¾Ð²ÐµÑ€ÑŒ Ð² ÑÑ‚Ð¾, Ð¸ Ð²ÑÑ‘ ÑÐ±ÑƒÐ´ÐµÑ‚ÑÑ. ÐŸÐ¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹ ÑƒÐ²ÐµÑ€ÐµÐ½Ð½Ð¾ÑÑ‚ÑŒ Ð² ÑÐ²Ð¾Ð¸Ñ… ÑÐ¸Ð»Ð°Ñ…, Ð´ÑƒÐ¼Ð°Ð¹ Ð¾ Ñ‚Ð¾Ð¼, ÐºÐ°Ðº Ð»ÐµÐ³ÐºÐ¾ Ñ‚ÐµÐ±Ðµ Ð´Ð°ÑŽÑ‚ÑÑ Ð»ÑŽÐ±Ñ‹Ðµ Ð½Ð¾Ð²Ñ‹Ðµ Ð·Ð½Ð°Ð½Ð¸Ñ.

ÐŸÐ¾Ð²ÐµÑ€ÑŒ Ð² Ñ‚Ð¾, Ñ‡Ñ‚Ð¾ Ñ‚ÐµÐ±Ñ Ð¾Ñ‡ÐµÐ½ÑŒ ÑÐ¸Ð»ÑŒÐ½Ð¾ Ð»ÑŽÐ±ÑÑ‚, Ð¸ Ð¿Ð¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹ ÑÑ‚Ð¾ Ð²ÑÐµÐ¼ ÑÐ²Ð¾Ð¸Ð¼ ÑÐµÑ€Ð´Ñ†ÐµÐ¼, Ð¸ Ð¿ÑƒÑÑ‚ÑŒ Ð´ÑƒÑˆÐ° Ð½Ð°Ð¿Ð¾Ð»Ð½Ð¸Ñ‚ÑÑ ÑÑ‡Ð°ÑÑ‚ÑŒÐµÐ¼. ÐŸÑ€ÐµÐ´ÑÑ‚Ð°Ð²ÑŒ Ñ‚ÐµÐ¿Ð»Ð¾Ðµ ÑÐ¸ÑÐ½Ð¸Ðµ Ð² Ð³Ñ€ÑƒÐ´Ð¸, Ð²Ð´Ñ‹Ñ…Ð°Ð¹ ÑÑ‚Ð¾ Ñ‡ÑƒÐ²ÑÑ‚Ð²Ð¾ Ð»ÑŽÐ±Ð²Ð¸ ÐºÐ°Ð¶Ð´Ð¾Ð¹ ÐºÐ»ÐµÑ‚Ð¾Ñ‡ÐºÐ¾Ð¹. Ð—Ð½Ð°Ð¹, Ñ‡Ñ‚Ð¾ Ð¼Ð°Ð¼Ð° Ð¸ Ð¿Ð°Ð¿Ð° Ñ‚ÐµÐ±Ñ Ð¾Ñ‡ÐµÐ½ÑŒ Ð»ÑŽÐ±ÑÑ‚, Ð¼Ð°Ð¼Ð° Ð¸ Ð¿Ð°Ð¿Ð° Ñ€Ð°Ð´Ñ‹, Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ Ñƒ Ð½Ð¸Ñ… ÐµÑÑ‚ÑŒ.

ÐŸÐ¾Ð²ÐµÑ€ÑŒ Ð² Ñ‚Ð¾, Ñ‡Ñ‚Ð¾ Ñ‚ÐµÐ±Ñ Ð»ÑŽÐ±ÑÑ‚ Ð¸ Ð¿Ð¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹ ÑÑ‚Ð¾ Ð²ÑÐµÐ¼ ÑÐ²Ð¾Ð¸Ð¼ ÑÐµÑ€Ð´Ñ†ÐµÐ¼, Ð¸ Ð¿ÑƒÑÑ‚ÑŒ Ð´ÑƒÑˆÐ° Ð½Ð°Ð¿Ð¾Ð»Ð½Ð¸Ñ‚ÑÑ ÑÑ‡Ð°ÑÑ‚ÑŒÐµÐ¼. Ð­Ñ‚Ð¾ Ð¼ÐµÑÑ‚Ð¾, Ð³Ð´Ðµ Ñƒ Ñ‚ÐµÐ±Ñ Ð²ÐµÑ€Ð½Ñ‹Ðµ Ð´Ñ€ÑƒÐ·ÑŒÑ Ð¸ Ð¾Ñ‚Ð»Ð¸Ñ‡Ð½Ñ‹Ðµ Ñ€Ð¾Ð´ÑÑ‚Ð²ÐµÐ½Ð½Ð¸ÐºÐ¸.

ÐŸÐ¾Ð²ÐµÑ€ÑŒ Ð² ÑÐ²Ð¾Ð¸Ñ… Ð´Ñ€ÑƒÐ·ÐµÐ¹ Ð¸ Ñ€Ð¾Ð´ÑÑ‚Ð²ÐµÐ½Ð½Ð¸ÐºÐ¾Ð² Ð¸ Ð±ÑƒÐ´ÑŒ ÑÐ°Ð¼{GENDER_END} Ð²ÐµÑ€Ð½{GENDER_ADJ} Ð´Ñ€ÑƒÐ³{GENDER_FRIEND}. ÐžÐ±Ñ€Ð°Ñ‰Ð°Ð¹ÑÑ Ñ Ð»ÑŽÐ´ÑŒÐ¼Ð¸ Ñ‚Ð°Ðº, ÐºÐ°Ðº Ñ‚Ñ‹ Ñ…Ð¾Ñ‡ÐµÑˆÑŒ, Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð¾Ð±Ñ€Ð°Ñ‰Ð°Ð»Ð¸ÑÑŒ Ñ Ñ‚Ð¾Ð±Ð¾Ð¹, Ð¸ Ð¾Ð½Ð¸ ÑÑ‚Ð°Ð½ÑƒÑ‚ Ñ‚Ð²Ð¾Ð¸Ð¼Ð¸ Ð´Ñ€ÑƒÐ·ÑŒÑÐ¼Ð¸. ÐŸÐ¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹ ÑÑ‚Ð¾ Ð¸ Ð±ÑƒÐ´ÑŒ Ð´Ð¾Ð±Ñ€{GENDER_END} Ðº Ð½Ð¸Ð¼. Ð”ÑƒÐ¼Ð°Ð¹ Ð¾ ÑÐ²Ð¾Ð¸Ñ… Ð±Ð»Ð¸Ð·ÐºÐ¸Ñ… Ñ Ð½ÐµÐ¶Ð½Ð¾ÑÑ‚ÑŒÑŽ Ð¸ Ð´Ð¾Ð±Ñ€Ð¾Ñ‚Ð¾Ð¹.

ÐŸÐ¾Ð²ÐµÑ€ÑŒ Ð² Ñ‚Ð¾, Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ Ð²ÑÐµÐ³Ð´Ð° Ð¼Ð¾Ð¶ÐµÑˆÑŒ Ð±Ñ‹Ñ‚ÑŒ Ð·Ð´Ð¾Ñ€Ð¾Ð²{GENDER_ADJ}, Ð¸ ÐºÐ°ÐºÐ¾Ðµ ÑÐ¸Ð»ÑŒÐ½Ð¾Ðµ Ñƒ Ñ‚ÐµÐ±Ñ Ñ‚ÐµÐ»Ð¾. ÐžÑ‰ÑƒÑ‚Ð¸ ÑÑ‚Ð¾ Ð¸ Ð±ÑƒÐ´ÑŒ Ñ‚Ð°Ð¼ Ð·Ð´Ð¾Ñ€Ð¾Ð²{GENDER_ADJ}. ÐŸÐ¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹ Ð¿Ñ€Ð¸Ð»Ð¸Ð² ÑÐ½ÐµÑ€Ð³Ð¸Ð¸ Ð¸ ÑÐ¸Ð»Ñ‹ Ð² Ñ‚ÐµÐ»Ðµ, Ð´Ñ‹ÑˆÐ¸ Ð³Ð»ÑƒÐ±Ð¾ÐºÐ¾ Ð¸ ÑƒÐ²ÐµÑ€ÐµÐ½Ð½Ð¾.

ÐŸÐ¾Ð²ÐµÑ€ÑŒ Ð² Ñ‚Ð¾, Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ ÑÑ‡Ð°ÑÑ‚Ð»Ð¸Ð²Ñ‹Ð¹ Ñ‡ÐµÐ»Ð¾Ð²ÐµÐº, Ð¸ Ñ‚Ñ‹ Ð±ÑƒÐ´ÐµÑˆÑŒ ÑÑ‡Ð°ÑÑ‚Ð»Ð¸Ð²Ð° Ð² Ð¶Ð¸Ð·Ð½Ð¸. Ð‘ÑƒÐ´ÑŒ Ð¶Ðµ ÑÑ‡Ð°ÑÑ‚Ð»Ð¸Ð²Ð° Ð² ÑÑ‚Ð¾Ð¼ Ð¼ÐµÑÑ‚Ðµ Ð¸ Ð²ÐµÑ€ÑŒ Ð² ÑÑ‚Ð¾. Ð£Ð»Ñ‹Ð±Ð½Ð¸ÑÑŒ Ð¼Ñ‹ÑÐ»ÐµÐ½Ð½Ð¾, Ð¿Ð¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹, ÐºÐ°Ðº Ð²Ð½ÑƒÑ‚Ñ€Ð¸ Ñ‚ÐµÐ±Ñ Ñ€Ð¾Ð¶Ð´Ð°ÐµÑ‚ÑÑ Ñ‚Ð¸Ñ…Ð°Ñ Ñ€Ð°Ð´Ð¾ÑÑ‚ÑŒ.

ÐŸÐ¾Ð²ÐµÑ€ÑŒ Ð² Ñ‚Ð¾, Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ Ð¼Ð¾Ð¶ÐµÑˆÑŒ ÑÐ»ÑƒÑˆÐ°Ñ‚ÑŒ Ð¸ Ð²ÑÑ‘ Ð¿Ð¾Ð½Ð¸Ð¼Ð°Ñ‚ÑŒ Ð¸ Ñ…Ð¾Ñ€Ð¾ÑˆÐ¾ Ð²Ñ‹Ð¿Ð¾Ð»Ð½ÑÑ‚ÑŒ Ñ‚Ð¾, Ð¾ Ñ‡ÐµÐ¼ Ñ‚ÐµÐ±Ñ Ð¿Ñ€Ð¾ÑÑÑ‚. ÐžÑ‰ÑƒÑ‚Ð¸, Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ ÑÑ‚Ð¾ Ð¼Ð¾Ð¶ÐµÑˆÑŒ, Ð¸ Ñ‚Ð°Ðº Ð²ÑÑ‘ Ð¸ Ð±ÑƒÐ´ÐµÑ‚. Ð”ÑƒÐ¼Ð°Ð¹ Ð¾ ÑÐ²Ð¾ÐµÐ¹ ÑÐ¿Ð¾ÑÐ¾Ð±Ð½Ð¾ÑÑ‚Ð¸ Ð±Ñ‹Ñ‚ÑŒ Ð²Ð½Ð¸Ð¼Ð°Ñ‚ÐµÐ»ÑŒÐ½{GENDER_ADJ} Ð¸ Ð·Ð°Ð±Ð¾Ñ‚Ð»Ð¸Ð²Ð¾Ð¹.

ÐŸÐ¾Ð²ÐµÑ€ÑŒ, Ñ‡Ñ‚Ð¾ Ð²ÑÐµ Ð½ÐµÐ¿Ñ€Ð¸ÑÑ‚Ð½Ð¾ÑÑ‚Ð¸, ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ðµ Ñ‚ÐµÐ±Ñ Ð±ÐµÑÐ¿Ð¾ÐºÐ¾ÑÑ‚, Ð¼Ð¾Ð³ÑƒÑ‚ Ð¸ÑÑ‡ÐµÐ·Ð½ÑƒÑ‚ÑŒ. ÐŸÑƒÑÑ‚ÑŒ Ð±ÐµÐ´Ñ‹ Ñ€Ð°ÑÑ‚Ð°ÑŽÑ‚, ÐºÐ°Ðº ÑÐ½ÐµÐ³ Ð¿Ð¾Ð´ Ð¶Ð°Ñ€ÐºÐ¸Ð¼Ð¸ Ð»ÑƒÑ‡Ð°Ð¼Ð¸ ÑÐ¾Ð»Ð½Ñ†Ð°. ÐŸÐ¾Ð²ÐµÑ€ÑŒ, Ñ‚Ð°Ðº Ð¸ Ð±ÑƒÐ´ÐµÑ‚. ÐÐ° Ð´Ð»Ð¸Ð½Ð½Ð¾Ð¼ Ð²Ñ‹Ð´Ð¾Ñ…Ðµ Ð¿Ñ€ÐµÐ´ÑÑ‚Ð°Ð²Ð»ÑÐ¹, ÐºÐ°Ðº Ð²ÑÐµ Ñ‚Ð²Ð¾Ð¸ ÑÑ‚Ñ€Ð°Ñ…Ð¸ Ð¸ Ñ‚Ñ€ÐµÐ²Ð¾Ð³Ð¸ Ð¿Ñ€Ð¾ÑÑ‚Ð¾ Ð¸ÑÐ¿Ð°Ñ€ÑÑŽÑ‚ÑÑ.

ÐŸÐ¾Ð²ÐµÑ€ÑŒ Ð² ÑÐ°Ð¼Ñƒ ÑÐµÐ±Ñ. ÐŸÐ¾Ð²ÐµÑ€ÑŒ, Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ Ð¼Ð¾Ð¶ÐµÑˆÑŒ ÑƒÑÐµÑ€Ð´Ð½Ð¾ Ñ‚Ñ€ÑƒÐ´Ð¸Ñ‚ÑŒÑÑ Ð¸ Ð½Ð°ÑÐ»Ð°Ð¶Ð´Ð°Ð¹ÑÑ, ÐºÐ¾Ð³Ð´Ð° Ð¿Ñ€Ð¸Ñ…Ð¾Ð´Ð¸Ñ‚ÑÑ ÑƒÑÐµÑ€Ð´Ð½Ð¾ Ñ‚Ñ€ÑƒÐ´Ð¸Ñ‚ÑŒÑÑ, Ð¸ Ñ‚Ñ‹ Ð½Ð°ÑÐ»Ð°Ð´Ð¸ÑˆÑŒÑÑ, ÐºÐ¾Ð³Ð´Ð° Ð¿Ð¾Ð»ÑƒÑ‡Ð¸ÑˆÑŒ, Ñ‡Ñ‚Ð¾ Ñ…Ð¾Ñ‚ÐµÐ»Ð°. ÐŸÑ€Ð¾ÑÑ‚Ð¾ Ð¿Ð¾Ð²ÐµÑ€ÑŒ, Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ ÑÐ¿Ð¾ÑÐ¾Ð±Ð½Ð° Ñ€Ð°Ð´Ð¸ Ñ‡ÐµÐ³Ð¾-Ñ‚Ð¾ Ð¿Ð¾ÑÑ‚Ð°Ñ€Ð°Ñ‚ÑŒÑÑ, Ð¸ ÐºÐ¾Ð³Ð´Ð° Ñ‚Ñ‹ Ð¿Ð¾ÑÑ‚Ð°Ñ€Ð°ÐµÑˆÑŒÑÑ â€” Ñ‚Ñ‹ ÑÑ‚Ð¾ Ð¿Ð¾Ð»ÑƒÑ‡Ð¸ÑˆÑŒ. Ð”ÑƒÐ¼Ð°Ð¹ Ð¾ Ñ‚Ð¾Ð¼, ÐºÐ°Ðº Ð¿Ñ€Ð¸ÑÑ‚Ð½Ð¾ Ð´Ð¾ÑÑ‚Ð¸Ð³Ð°Ñ‚ÑŒ Ñ†ÐµÐ»ÐµÐ¹ ÑÐ²Ð¾Ð¸Ð¼ Ñ‚Ñ€ÑƒÐ´Ð¾Ð¼ Ð¸ ÑÑ‚Ð°Ñ€Ð°Ð½Ð¸ÐµÐ¼ Ð¸ ÐºÐ°Ðº Ñ€Ð°Ð´Ð¾ÑÑ‚Ð½Ð¾ Ð¿Ð¾Ð¼Ð¾Ð³Ð°Ñ‚ÑŒ Ð»ÑŽÐ´ÑÐ¼ Ð²Ð¾ÐºÑ€ÑƒÐ³.

ÐŸÐ¾Ð²ÐµÑ€ÑŒ Ð² ÑÐµÐ±Ñ, Ð¸ Ñ‚Ñ‹ ÑÑ‚Ð°Ð½ÐµÑˆÑŒ Ñ‚Ð°ÐºÐ¸Ð¼ Ñ‡ÐµÐ»Ð¾Ð²ÐµÐºÐ¾Ð¼, ÐºÐµÐ¼ Ð·Ð°Ñ…Ð¾Ñ‡ÐµÑˆÑŒ. ÐŸÐ¾Ð²ÐµÑ€ÑŒ Ð¶Ðµ, Ñ‡Ñ‚Ð¾ Ð¼Ð¾Ð¶ÐµÑˆÑŒ Ð±Ñ‹Ñ‚ÑŒ ÐºÐµÐ¼ Ð·Ð°Ñ…Ð¾Ñ‡ÐµÑˆÑŒ, Ð¸ Ñ‚Ñ‹ ÑÑ‚Ð°Ð½ÐµÑˆÑŒ Ñ‚Ð°ÐºÐ¸Ð¼ Ñ‡ÐµÐ»Ð¾Ð²ÐµÐºÐ¾Ð¼. ÐŸÐ¾Ð´ÑƒÐ¼Ð°Ð¹ Ð¾Ð± ÑÑ‚Ð¾Ð¼. ÐŸÑ€ÐµÐ´ÑÑ‚Ð°Ð²ÑŒ ÑÐµÐ±Ñ Ð² Ð±ÑƒÐ´ÑƒÑ‰ÐµÐ¼, ÐºÐ°Ðº Ð²Ñ‹Ð³Ð»ÑÐ´Ð¸ÑˆÑŒ, ÐºÐ°Ðº Ñ‚Ñ‹ ÑÑ‡Ð°ÑÑ‚Ð»Ð¸Ð²Ð°.

Ð‘ÑƒÐ´ÑŒ ÑƒÐ²ÐµÑ€ÐµÐ½Ð° â€” ÑÑ‚Ð¾ Ð¼ÐµÑÑ‚Ð¾, Ð³Ð´Ðµ Ð¼ÐµÑ‡Ñ‚Ñ‹ ÑÑ‚Ð°Ð½Ð¾Ð²ÑÑ‚ÑÑ Ñ€ÐµÐ°Ð»ÑŒÐ½Ð¾ÑÑ‚ÑŒÑŽ. ÐŸÐ¾Ð²ÐµÑ€ÑŒ, Ñ‡Ñ‚Ð¾ ÐµÐ´Ð°, ÐºÐ¾Ñ‚Ð¾Ñ€Ð°Ñ Ñ‚ÐµÐ±Ðµ Ð¿Ð¾Ð»ÐµÐ·Ð½Ð°, ÑÑ‚Ð°Ð½Ð¾Ð²Ð¸Ñ‚ÑÑ Ð¾Ñ‡ÐµÐ½ÑŒ Ð²ÐºÑƒÑÐ½Ð¾Ð¹, Ð¸ Ð¾Ð½Ð° Ð±ÑƒÐ´ÐµÑ‚ Ð¾Ñ‡ÐµÐ½ÑŒ Ð²ÐºÑƒÑÐ½Ð¾Ð¹. ÐŸÐ¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹ Ð²ÐºÑƒÑ Ð¸ Ð¿Ð¾Ð»ÑŒÐ·Ñƒ Ð·Ð´Ð¾Ñ€Ð¾Ð²Ð¾Ð¹ Ð¿Ð¸Ñ‰Ð¸.

ÐŸÐ¾Ð²ÐµÑ€ÑŒ, Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ Ð½ÐµÐ¿Ð¾Ð²Ñ‚Ð¾Ñ€Ð¸Ð¼Ð° Ð¸ Ñ‚Ð°Ð»Ð°Ð½Ñ‚Ð»Ð¸Ð²Ð°, Ð¸ Ñƒ Ñ‚ÐµÐ±Ñ ÐµÑÑ‚ÑŒ Ð¼Ð½Ð¾Ð¶ÐµÑÑ‚Ð²Ð¾ Ð¾Ñ‚Ð»Ð¸Ñ‡Ð½Ñ‹Ñ… Ð¸Ð´ÐµÐ¹, Ð¸ Ñƒ Ñ‚ÐµÐ±Ñ Ñ…Ð²Ð°Ñ‚Ð¸Ñ‚ ÑÐ¼ÐµÐ»Ð¾ÑÑ‚Ð¸, Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð¸Ñ… Ð²Ð¾Ð¿Ð»Ð¾Ñ‚Ð¸Ñ‚ÑŒ. Ð¢Ñ‹ ÑÑ‚Ð°Ð½ÐµÑˆÑŒ Ð²Ð¾Ð»ÑˆÐµÐ±Ð½Ð¸Ñ†ÐµÐ¹, Ð¿Ð¾Ð»Ð½Ð¾Ð¹ Ð¾Ñ‚Ð»Ð¸Ñ‡Ð½Ñ‹Ñ… Ð¸Ð´ÐµÐ¹. ÐžÑ‰ÑƒÑ‚Ð¸ ÑÐ²Ð¾ÑŽ ÑƒÐ½Ð¸ÐºÐ°Ð»ÑŒÐ½Ð¾ÑÑ‚ÑŒ, Ð´ÑƒÐ¼Ð°Ð¹ Ð¾ ÑÐ²Ð¾Ð¸Ñ… ÑÐ¿Ð¾ÑÐ¾Ð±Ð½Ð¾ÑÑ‚ÑÑ… ÐºÐ°Ðº Ð¾ ÑÐ¾ÐºÑ€Ð¾Ð²Ð¸Ñ‰Ð°Ñ…. Ð’ÑÐ¿Ð¾Ð¼Ð½Ð¸, Ñ‡Ñ‚Ð¾ Ð¼Ð°Ð¼Ð° Ð¸ Ð¿Ð°Ð¿Ð° Ð¾Ñ‡ÐµÐ½ÑŒ Ñ€Ð°Ð´Ñ‹, Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ Ñƒ Ð½Ð¸Ñ… ÐµÑÑ‚ÑŒ.

Ð¡Ñ‚Ð°Ð½ÑŒ Ð¶Ðµ Ð¼Ñ‹ÑÐ»ÐµÐ½Ð½Ð¾ Ñ‚Ð°ÐºÐ¸Ð¼ Ñ‡ÐµÐ»Ð¾Ð²ÐµÐºÐ¾Ð¼ Ð¿Ñ€Ð¾ÑÑ‚Ð¾ Ñ€Ð°Ð´Ð¸ Ð²ÐµÑÐµÐ»ÑŒÑ Ð¸ Ð¾Ñ‚ Ð²ÑÐµÐ¹ Ð´ÑƒÑˆÐ¸ Ð¿Ð¾Ð»ÑŽÐ±Ð¸ Ñ‡ÐµÐ»Ð¾Ð²ÐµÐºÐ°, ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ð¹ Ð¿Ñ€ÐµÐ´ÑÑ‚Ð°Ð» â€” ÑÑ‚Ð¾ Ð¶Ðµ Ñ‚Ñ‹. ÐšÐ°ÐºÐ¾Ð¹ Ñ‚Ñ‹ Ñ…Ð¾Ñ‡ÐµÑˆÑŒ ÑÑ‚Ð°Ñ‚ÑŒ? Ð¡Ñ‡Ð°ÑÑ‚Ð»Ð¸Ð²Ð¾Ð¹, Ð·Ð´Ð¾Ñ€Ð¾Ð²Ð¾Ð¹, Ð²Ð»ÑŽÐ±Ð»ÐµÐ½Ð½Ð¾Ð¹ Ð² Ð¶Ð¸Ð·Ð½ÑŒ, ÑÐ²Ð¾Ð±Ð¾Ð´Ð½Ð¾Ð¹. ÐŸÐ¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹ Ð¾Ð³Ñ€Ð¾Ð¼Ð½ÑƒÑŽ Ð½ÐµÐ¶Ð½Ð¾ÑÑ‚ÑŒ Ð¸ Ð»ÑŽÐ±Ð¾Ð²ÑŒ Ðº ÑÐ°Ð¼Ð¾Ð¹ ÑÐµÐ±Ðµ, Ð´Ñ‹ÑˆÐ¸ Ð¿Ð¾Ð»Ð½Ð¾Ð¹ Ð³Ñ€ÑƒÐ´ÑŒÑŽ. 

Ð¢Ñ‹ Ð²ÑÐµÐ³Ð´Ð° Ð¿Ð¾Ð´ Ð·Ð°Ñ‰Ð¸Ñ‚Ð¾Ð¹ Ð½ÐµÐ²Ð¸Ð´Ð¸Ð¼Ð¾Ð¹ ÑÐ¸Ð»Ñ‹. ÐžÐ½Ð° Ð²ÑÐµÐ³Ð´Ð° Ð»ÑŽÐ±Ð¸Ñ‚ Ñ‚ÐµÐ±Ñ Ð¸ Ð½Ð°Ð±Ð»ÑŽÐ´Ð°ÐµÑ‚ Ð·Ð° Ñ‚Ð¾Ð±Ð¾Ð¹. ÐžÐ½Ð° Ð¶Ð¸Ð²ÐµÑ‚ Ð²Ð½ÑƒÑ‚Ñ€Ð¸ Ñ‚ÐµÐ±Ñ, Ð¿Ð¾Ð¼Ð¾Ð³Ð°ÐµÑ‚ Ñ‚Ð²Ð¾ÐµÐ¼Ñƒ ÑÐµÑ€Ð´Ñ†Ñƒ Ð±Ð¸Ñ‚ÑŒÑÑ, Ð´Ð°ÐµÑ‚ Ñ‚ÐµÐ±Ðµ Ð¶Ð¸Ð·Ð½ÑŒ Ð¸ ÑÐ¾Ð·Ð´Ð°ÐµÑ‚ Ð² ÑÑ‚Ð¾Ð¹ Ð¶Ð¸Ð·Ð½Ð¸ Ð½Ð¾Ð²Ñ‹Ðµ Ð¿ÑƒÑ‚Ð¸. ÐŸÐ¾Ð²ÐµÑ€ÑŒ Ð² ÑÑ‚Ñƒ Ð½ÐµÐ²Ð¸Ð´Ð¸Ð¼ÑƒÑŽ ÑÐ¸Ð»Ñƒ, Ð²ÐµÐ´ÑŒ Ð¾Ð½Ð° Ð²ÐµÑ€Ð¸Ñ‚ Ð² Ñ‚ÐµÐ±Ñ. ÐŸÑ€Ð¸Ð»Ð¾Ð¶Ð¸ Ñ€ÑƒÐºÑƒ Ðº ÑÐµÑ€Ð´Ñ†Ñƒ, Ð¿Ð¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹ ÐµÐ³Ð¾ Ñ€Ð¸Ñ‚Ð¼, Ð´ÑƒÐ¼Ð°Ð¹ Ð¾ Ñ‚Ð¾Ð¼, Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ Ð½Ð¸ÐºÐ¾Ð³Ð´Ð° Ð½Ðµ Ð±Ñ‹Ð²Ð°ÐµÑˆÑŒ Ð¾Ð´Ð½Ð°. 

Ð¢Ñ‹ Ð¸ ÐµÑÑ‚ÑŒ Ð²Ð¾Ð»ÑˆÐµÐ±ÑÑ‚Ð²Ð¾ ÑÐ²Ð¾ÐµÐ¹ Ð¶Ð¸Ð·Ð½Ð¸. Ð’ÐµÑ€ÑŒ Ð² Ð²Ð¾Ð»ÑˆÐµÐ±ÑÑ‚Ð²Ð¾, Ð²ÐµÑ€ÑŒ Ð² Ñ€ÐµÐ°Ð»ÑŒÐ½Ð¾ÑÑ‚ÑŒ Ð²ÐµÑ‰ÐµÐ¹ Ð¸ Ð²ÐµÑ€ÑŒ Ð² Ð²Ð¾Ð·Ð¼Ð¾Ð¶Ð½Ð¾ÑÑ‚Ð¸. Ð•ÑÐ»Ð¸ Ñ‚Ñ‹ Ð²ÐµÑ€Ð¸ÑˆÑŒ Ð² Ð²Ð¾Ð·Ð¼Ð¾Ð¶Ð½Ð¾ÑÑ‚Ð¸ â€” Ñ‚Ñ‹ Ð²ÐµÑ€Ð¸ÑˆÑŒ Ð² ÑÐµÐ±Ñ. Ð”Ð¾Ð²ÐµÑ€ÑÐ¹ Ð¶Ðµ ÑÐµÐ±Ðµ Ð² ÑÑ‚Ð¾Ð¼ Ð¼Ð¸Ñ€Ðµ. ÐŸÐ¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹ ÑÐ²Ð¾ÑŽ Ð²Ð½ÑƒÑ‚Ñ€ÐµÐ½Ð½ÑŽÑŽ ÑÐ¸Ð»Ñƒ, Ð´ÑƒÐ¼Ð°Ð¹ Ð¿Ñ€Ð¾ ÑÐµÐ±Ñ Ñ‚Ð°Ðº: Â«Ð¯ Ð²ÑÑ‘ Ð¼Ð¾Ð³ÑƒÂ».

Ð’ÐµÑ€ÑŒ, Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ Ð²Ð°Ð¶Ð½Ð°, Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ Ð»ÑŽÐ±Ð¸Ð¼Ð°, Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ Ð¾ÑÐ¾Ð±ÐµÐ½Ð½Ð°Ñ, Ñ‚Ñ‹ Ð¼Ð¾Ð¶ÐµÑˆÑŒ Ð¸Ð·Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð²ÐµÑÑŒ Ð½Ð°Ñˆ Ð¼Ð¸Ñ€ Ð¸ Ð² Ñ‚ÐµÐ±Ðµ ÐµÑÑ‚ÑŒ Ð²ÐµÐ»Ð¸Ñ‡Ð¸Ðµ. ÐŸÐ¾Ð²ÐµÑ€ÑŒ Ð² Ñ‚Ð¾, Ñ‡Ñ‚Ð¾ Ñ‚Ñ‹ ÑÐ¿Ð¾ÑÐ¾Ð±Ð½Ð° ÑÐ´ÐµÐ»Ð°Ñ‚ÑŒ Ñ‡Ñ‚Ð¾ ÑƒÐ³Ð¾Ð´Ð½Ð¾. ÐžÑ‰ÑƒÑ‚Ð¸ ÑÐ²Ð¾ÑŽ Ð·Ð½Ð°Ñ‡Ð¸Ð¼Ð¾ÑÑ‚ÑŒ, Ð¿Ñ€ÐµÐ´ÑÑ‚Ð°Ð²ÑŒ, ÐºÐ°Ðº Ñ‚Ñ‹ Ð¿Ñ€Ð¸Ð½Ð¾ÑÐ¸ÑˆÑŒ Ð´Ð¾Ð±Ñ€Ð¾ Ð² ÑÑ‚Ð¾Ñ‚ Ð¼Ð¸Ñ€.

ÐŸÐ¾Ð»ÑŽÐ±Ð¸ Ð¶Ðµ ÑÐµÐ±Ñ Ð¿Ñ€ÑÐ¼Ð¾ ÑÐµÐ¹Ñ‡Ð°Ñ, Ð¿Ð¾Ð»ÑŽÐ±Ð¸ ÑÐ²Ð¾ÑŽ Ð¶Ð¸Ð·Ð½ÑŒ Ð¿Ñ€ÑÐ¼Ð¾ ÑÐµÐ¹Ñ‡Ð°Ñ, Ð¿Ð¾Ð»ÑŽÐ±Ð¸ Ð»ÑŽÐ´ÐµÐ¹ Ð² ÑÐ²Ð¾ÐµÐ¹ Ð¶Ð¸Ð·Ð½Ð¸ Ð¿Ñ€ÑÐ¼Ð¾ ÑÐµÐ¹Ñ‡Ð°Ñ Ð¸ Ð¿Ñ€Ð¾ÑÑ‚Ð¸ Ñ‚ÐµÑ…, ÐºÐ¾Ð³Ð¾ Ñ‚Ñ‹ Ð½Ðµ Ð»ÑŽÐ±Ð¸ÑˆÑŒ, Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð¾ÑÐ²Ð¾Ð±Ð¾Ð´Ð¸Ñ‚ÑŒ Ð±Ð¾Ð»ÑŒÑˆÐµ Ð¼ÐµÑÑ‚Ð° Ð´Ð»Ñ Ð»ÑŽÐ±Ð²Ð¸. ÐœÑ‹ÑÐ»ÐµÐ½Ð½Ð¾ Ð¾Ñ‚Ð¿ÑƒÑÑ‚Ð¸ Ð²ÑÐµ ÑÑ‚Ð°Ñ€Ñ‹Ðµ Ð¾Ð±Ð¸Ð´Ñ‹, Ð¿Ð¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹, ÐºÐ°Ðº Ð½Ð° ÑÐµÑ€Ð´Ñ†Ðµ ÑÑ‚Ð°Ð½Ð¾Ð²Ð¸Ñ‚ÑÑ Ð»ÐµÐ³ÐºÐ¾ Ð¸ Ñ‡Ð¸ÑÑ‚Ð¾.

Ð—Ð½Ð°Ð¹, Ñ‡Ñ‚Ð¾ Ð¼Ð°Ð¼Ð° Ð¸ Ð¿Ð°Ð¿Ð° Ñ‚ÐµÐ±Ñ Ð¾Ñ‡ÐµÐ½ÑŒ Ð»ÑŽÐ±ÑÑ‚.

Ð¢ÐµÐ¿ÐµÑ€ÑŒ Ð´Ð°Ð²Ð°Ð¹ Ð½Ð°ÑƒÑ‡Ð¸Ð¼ Ñ‚Ð²Ð¾Ðµ Ñ‚ÐµÐ»Ð¾ Ð½Ð¾Ð²Ñ‹Ð¼, Ñ‡ÑƒÐ´ÐµÑÐ½Ñ‹Ð¼ Ñ‡ÑƒÐ²ÑÑ‚Ð²Ð°Ð¼. Ð§Ñ‚Ð¾ Ñ‚Ð°ÐºÐ¾Ðµ Ñ…Ñ€Ð°Ð±Ñ€Ð¾ÑÑ‚ÑŒ? ÐŸÐ¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹ Ð¿Ñ€ÑÐ¼Ð¾ ÑÐµÐ¹Ñ‡Ð°Ñ, ÐºÐ°ÐºÐ¾Ð²Ð¾ ÑÑ‚Ð¾ â€” Ð±Ñ‹Ñ‚ÑŒ ÑÐ¾Ð²ÐµÑ€ÑˆÐµÐ½Ð½Ð¾ Ð±ÐµÑÑÑ‚Ñ€Ð°ÑˆÐ½Ð¾Ð¹. 
Ð§Ñ‚Ð¾ Ñ‚Ð°ÐºÐ¾Ðµ ÑÐ²Ð¾Ð±Ð¾Ð´Ð°? ÐŸÐ¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹, ÐºÐ°ÐºÐ¾Ð²Ð¾ ÑÑ‚Ð¾ â€” Ð±Ñ‹Ñ‚ÑŒ Ð°Ð±ÑÐ¾Ð»ÑŽÑ‚Ð½Ð¾ ÑÐ²Ð¾Ð±Ð¾Ð´Ð½Ð¾Ð¹ Ð¸ ÑÑ‡Ð°ÑÑ‚Ð»Ð¸Ð²Ð¾Ð¹. 
Ð§Ñ‚Ð¾ Ñ‚Ð°ÐºÐ¾Ðµ Ð¸Ð·Ð¾Ð±Ð¸Ð»Ð¸Ðµ? ÐŸÐ¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹, Ñ‡Ñ‚Ð¾ Ñƒ Ñ‚ÐµÐ±Ñ ÑƒÐ¶Ðµ ÐµÑÑ‚ÑŒ Ð²ÑÑ‘, Ñ‡Ñ‚Ð¾ Ñ‚ÐµÐ±Ðµ Ð½ÑƒÐ¶Ð½Ð¾ Ð´Ð»Ñ ÑÑ‡Ð°ÑÑ‚ÑŒÑ.
Ð§Ñ‚Ð¾ Ñ‚Ð°ÐºÐ¾Ðµ Ð²Ð´Ð¾Ñ…Ð½Ð¾Ð²ÐµÐ½Ð¸Ðµ? ÐŸÑ€ÐµÐ´ÑÑ‚Ð°Ð²ÑŒ, Ñ‡Ñ‚Ð¾ Ñƒ Ñ‚ÐµÐ±Ñ Ð¿Ð¾ÑÐ²Ð¸Ð»Ð°ÑÑŒ Ð¾Ñ‚Ð»Ð¸Ñ‡Ð½Ð°Ñ Ð¸Ð´ÐµÑ Ð¸ Ñ‚Ñ‹ Ñ‚Ð¾Ñ‡Ð½Ð¾ Ð·Ð½Ð°ÐµÑˆÑŒ, ÐºÐ°Ðº ÐµÑ‘ Ð¸ÑÐ¿Ð¾Ð»Ð½Ð¸Ñ‚ÑŒ.
Ð§Ñ‚Ð¾ Ñ‚Ð°ÐºÐ¾Ðµ Ð¶Ð¸Ð·Ð½ÐµÐ½Ð½Ð°Ñ ÑÐ¸Ð»Ð°? ÐŸÐ¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹, Ñ‡Ñ‚Ð¾ Ð² Ñ‚ÐµÐ±Ðµ Ð¶Ð¸Ð²ÐµÑ‚ Ð½ÐµÐ¾Ð³Ñ€Ð°Ð½Ð¸Ñ‡ÐµÐ½Ð½Ð°Ñ ÑÐ½ÐµÑ€Ð³Ð¸Ñ.Ð§Ñ‚Ð¾ Ñ‚Ð°ÐºÐ¾Ðµ ÑÑ‚Ñ€Ð°ÑÑ‚ÑŒ? ÐŸÐ¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹, ÐºÐ°Ðº ÑÐ¸Ð»ÑŒÐ½Ð¾ Ñ‚Ñ‹ Ð²Ð»ÑŽÐ±Ð»ÐµÐ½Ð° Ð² ÑÐ²Ð¾ÑŽ Ð¶Ð¸Ð·Ð½ÑŒ.

ÐŸÐ¾Ð»Ð¾Ð¶Ð¸ Ð»ÐµÐ²ÑƒÑŽ Ñ€ÑƒÐºÑƒ Ð½Ð° ÑÐµÑ€Ð´Ñ†Ðµ Ð¸ Ð±Ð»Ð°Ð³Ð¾ÑÐ»Ð¾Ð²Ð¸ ÑÐ²Ð¾Ðµ Ñ‚ÐµÐ»Ð¾ Ð½Ð° Ð½Ð¾Ð²Ñ‹Ð¹, ÑÐ²ÐµÑ‚Ð»Ñ‹Ð¹ Ñ€Ð°Ð·ÑƒÐ¼. Ð‘Ð»Ð°Ð³Ð¾ÑÐ»Ð¾Ð²Ð¸ ÑÐ²Ð¾ÑŽ Ð¶Ð¸Ð·Ð½ÑŒ, ÐºÐ¾Ñ‚Ð¾Ñ€Ð°Ñ Ð¿Ð¾Ð»Ð½Ð° Ð¿Ñ€Ð¸ÐºÐ»ÑŽÑ‡ÐµÐ½Ð¸Ð¹, Ð¸ ÑÐ²Ð¾ÑŽ Ð´ÑƒÑˆÑƒ, ÐºÐ¾Ñ‚Ð¾Ñ€Ð°Ñ Ð²ÑÐµÐ³Ð´Ð° Ð¿Ð¾Ð´ÑÐºÐ°Ð·Ñ‹Ð²Ð°ÐµÑ‚ Ñ‚ÐµÐ±Ðµ Ð²ÐµÑ€Ð½Ñ‹Ð¹ Ð¿ÑƒÑ‚ÑŒ.

ÐžÑ‚ÐºÑ€Ð¾Ð¹ ÑÐ²Ð¾Ðµ ÑÐµÑ€Ð´Ñ†Ðµ Ð¸ Ð²Ñ‹Ñ€Ð°Ð·Ð¸ Ð±Ð»Ð°Ð³Ð¾Ð´Ð°Ñ€Ð½Ð¾ÑÑ‚ÑŒ Ð·Ð° ÑÐ²Ð¾ÑŽ Ð½Ð¾Ð²ÑƒÑŽ, Ñ‡ÑƒÐ´ÐµÑÐ½ÑƒÑŽ Ð¶Ð¸Ð·Ð½ÑŒ ÐµÑ‰Ñ‘ Ð´Ð¾ Ñ‚Ð¾Ð³Ð¾, ÐºÐ°Ðº Ð¾Ð½Ð° ÑÐ»ÑƒÑ‡Ð¸Ð»Ð°ÑÑŒ. Ð‘Ð»Ð°Ð³Ð¾Ð´Ð°Ñ€Ð½Ð¾ÑÑ‚ÑŒ â€” ÑÑ‚Ð¾ Ð·Ð½Ð°Ðº Ñ‚Ð¾Ð³Ð¾, Ñ‡Ñ‚Ð¾ Ð²ÑÑ‘ Ð¿Ñ€ÐµÐºÑ€Ð°ÑÐ½Ð¾Ðµ ÑƒÐ¶Ðµ Ð¿Ñ€Ð¾Ð¸Ð·Ð¾ÑˆÐ»Ð¾ Ð² Ñ‚Ð²Ð¾ÐµÐ¼ Ð¼Ð¸Ñ€Ðµ.

Ð§Ñ‚Ð¾ Ð±Ñ‹ Ð½Ð¸ ÑÐ»ÑƒÑ‡Ð¸Ð»Ð¾ÑÑŒ, Ð¼Ð°Ð¼Ð° Ð¸ Ð¿Ð°Ð¿Ð° Ð±ÑƒÐ´ÑƒÑ‚ Ñ‚ÐµÐ±Ñ Ð»ÑŽÐ±Ð¸Ñ‚ÑŒ Ñ‚Ð°Ðº Ð¶Ðµ ÑÐ¸Ð»ÑŒÐ½Ð¾.

ÐŸÑ€Ð¸ÑˆÐ»Ð¾ Ð²Ñ€ÐµÐ¼Ñ Ð¿Ð¾ÐºÐ¸Ð½ÑƒÑ‚ÑŒ ÑÑ‚Ð¾ Ð¼ÐµÑÑ‚Ð¾, Ð½Ð¾ Ð·Ð°Ð¿Ð¾Ð¼Ð½Ð¸: ÐºÐ¾Ð³Ð´Ð° Ñ‚Ñ‹ Ð²ÐµÑ€Ð¸ÑˆÑŒ, Ð²ÑÑ‘, Ñ‡Ñ‚Ð¾ Ð¿Ñ€Ð¾Ð¸ÑÑ…Ð¾Ð´Ð¸Ñ‚ Ð² ÑÑ‚Ð¾Ð¼ Ð¼Ð¸Ñ€Ðµ, Ð¿Ñ€Ð¾Ð¸ÑÑ…Ð¾Ð´Ð¸Ñ‚ Ð¸ Ð² Ñ‚Ð²Ð¾ÐµÐ¹ Ð¶Ð¸Ð·Ð½Ð¸. Ð¡Ð¾Ñ…Ñ€Ð°Ð½Ð¸ ÑÑ‚Ð¾ ÑÐ¾ÑÑ‚Ð¾ÑÐ½Ð¸Ðµ ÑƒÐ²ÐµÑ€ÐµÐ½Ð½Ð¾ÑÑ‚Ð¸ Ð¸ Ð²Ð½ÑƒÑ‚Ñ€ÐµÐ½Ð½ÐµÐ³Ð¾ Ð¿Ð¾ÐºÐ¾Ñ.

Ð¥Ð¾Ñ€Ð¾ÑˆÐµÐ½ÑŒÐºÐ¾ Ð¿Ð¾Ñ‚ÑÐ½Ð¸ÑÑŒ Ð¸ Ð²ÑÐ¿Ð¾Ð¼Ð½Ð¸, Ñ‡Ñ‚Ð¾ Ð¿Ð¾Ñ€Ð° Ð²Ð¾Ð·Ð²Ñ€Ð°Ñ‰Ð°Ñ‚ÑŒÑÑ Ðº Ñ‚Ð¾Ð¹ Ð¶Ð¸Ð·Ð½Ð¸, ÐºÐ¾Ñ‚Ð¾Ñ€Ð¾Ð¹ Ñ‚Ñ‹ Ð¶Ð¸Ð²ÐµÑˆÑŒ, ÐµÑ‰Ðµ Ð±Ð¾Ð»ÐµÐµ Ð±Ð¾Ð´Ñ€Ð¾Ð¹ Ð¸ Ð²Ð½Ð¸Ð¼Ð°Ñ‚ÐµÐ»ÑŒÐ½Ð¾Ð¹. Ð—Ð½Ð°Ð¹: ÑÐµÐ³Ð¾Ð´Ð½Ñ Ñ Ñ‚Ð¾Ð±Ð¾Ð¹ Ð¼Ð¾Ð³ÑƒÑ‚ Ð¿Ñ€Ð¾Ð¸Ð·Ð¾Ð¹Ñ‚Ð¸ Ð·Ð°Ð¼ÐµÑ‡Ð°Ñ‚ÐµÐ»ÑŒÐ½Ñ‹Ðµ Ð²ÐµÑ‰Ð¸. Ð¡Ð´ÐµÐ»Ð°Ð¹ Ð³Ð»ÑƒÐ±Ð¾ÐºÐ¸Ð¹ Ð²Ð´Ð¾Ñ…, Ð¿Ð¾Ñ‚ÑÐ½Ð¸ÑÑŒ Ð²ÑÐµÐ¼ Ñ‚ÐµÐ»Ð¾Ð¼, Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÑ Ð¿Ñ€Ð¸Ð»Ð¸Ð² Ð±Ð¾Ð´Ñ€Ð¾ÑÑ‚Ð¸ Ð¸ ÑÐ¸Ð».

ÐžÑ‚ÐºÑ€Ð¾Ð¹ Ð³Ð»Ð°Ð·Ð° Ð¸ ÑƒÐ»Ñ‹Ð±Ð½Ð¸ÑÑŒ Ð¶Ð¸Ð·Ð½Ð¸, Ð¸ Ñ‚Ð¾Ð³Ð´Ð° Ð¾Ð½Ð° ÑƒÐ»Ñ‹Ð±Ð½ÐµÑ‚ÑÑ Ñ‚ÐµÐ±Ðµ Ð² Ð¾Ñ‚Ð²ÐµÑ‚. ÐžÑ‚ÐºÑ€Ñ‹Ð²Ð°Ð¹ Ð³Ð»Ð°Ð·Ð° Ñ ÑˆÐ¸Ñ€Ð¾ÐºÐ¾Ð¹ ÑƒÐ»Ñ‹Ð±ÐºÐ¾Ð¹, Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÑ Ð³Ð¾Ñ‚Ð¾Ð²Ð½Ð¾ÑÑ‚ÑŒ Ðº Ð¿Ñ€ÐµÐºÑ€Ð°ÑÐ½Ð¾Ð¼Ñƒ Ð¸ ÑÑ‡Ð°ÑÑ‚Ð»Ð¸Ð²Ð¾Ð¼Ñƒ Ð´Ð½ÑŽ.
`;

// Hebrew Meditation Template Text
const BASE_MEDITATION_TEMPLATE_HE = `
{NAME}, ×× ×™ ×¨×•×¦×” ×œ×§×—×ª ××•×ª×š ××™×ª×™ ×œ×ž×¡×¢ ×§×˜×Ÿ ×œ×ž×§×•× ×§×¡×•× ×©×‘×• ×ž×—×©×‘×•×ª ×”×•×¤×›×•×ª ×œ×ž×¦×™××•×ª, ×•×›×“×™ ×©× ×•×›×œ ×œ×”×’×™×¢ ×œ×©× × ×¦×˜×¨×š ×œ×¤×ª×•×— ××ª ×”× ×©×ž×” ×©×œ× ×•. ××– ×”×§×©×™×‘×™ ×œ×™ ×‘×–×”×™×¨×•×ª ×•×‘×•××™ × ×¦× ×œ×ž×¡×¢ ×”×ž×”× ×” ×”×–×”.

×¢×¦×ž×™ ××ª ×”×¢×™× ×™×™× ×•×”×ª×—×™×œ×™ ×œ× ×©×•× ×‘×¨×•×’×¢ ×•×‘×§×¦×‘ ××—×™×“. ×ª×™×¨×’×¢×™ ×•×ª×ª×¨×¤×™... ×©×™×ž×™ ×œ×‘ ×œ××£ ×©×œ×š. ×ž×¦××™ ××•×ª×• ×ž×‘×œ×™ ×œ×¤×ª×•×— ××ª ×”×¢×™× ×™×™×. ×—×•×©×™ ××•×ª×• ×‘×ž×—×©×‘×”. × ×©×ž×™ ×‘×¨×•×’×¢ ×•×‘×§×¦×‘ ××—×™×“, ×”×ª×ž×§×“×™ ×‘×ª×—×•×©×ª ×”××•×•×™×¨ ×‘× ×—×™×¨×™×™×.

×•×¢×›×©×™×• ×©×™×ž×™ ×œ×‘ ×œ××•×–× ×™×™× ×©×œ×š. ×ž×¦××™ ××•×ª×Ÿ, ×—×•×©×™ ××•×ª×Ÿ ×‘×ž×—×©×‘×”. ×”×™×™×” ××™×ª×Ÿ ×¨×’×¢. ×—×•×©×™ ××ª ×”×—×•× ×©×œ×”×Ÿ ×•×“×ž×™×™× ×™ ××ª ×”×¦×•×¨×” ×©×œ×”×Ÿ.

×•×¢×›×©×™×• ×©×™×ž×™ ×œ×‘ ×œ×ž×¨×—×‘ ×©×‘×™×Ÿ ×”××•×–× ×™×™× ×©×œ×š ×‘×ª×•×š ×”×¨××© ×©×œ×š, ×ž×ž×© ×œ×ž×¨×—×‘ ×”×–×”. ×—×•×©×™ ××•×ª×•, ×”×ª×‘×•× × ×™ ×‘×•.

×•×¢×›×©×™×• ×©×™×ž×™ ×œ×‘ ×œ×ž×¨×—×‘ ×©×¡×‘×™×‘ ×”××•×–× ×™×™× ×©×œ×š ×•×ž×¢×‘×¨ ×œ×”×Ÿ. ×”×ª×‘×•× × ×™ ×‘×•. ×•×©×™×ž×™ ×œ×‘ ×œ×ž×¨×—×‘ ×©×¡×‘×™×‘ ×›×œ ×”×¨××© ×©×œ×š, ×ž×ž×© ×œ×ž×¨×—×‘ ×”×–×”. ×—×•×©×™ ××•×ª×• ×‘×ž×—×©×‘×•×ª, ×”×ª×‘×•× × ×™ ×‘×•, ×”×™×™×” ×‘×• ×‘×ž×—×©×‘×”. ×—×•×©×™ ××™×š ×ª×©×•×ž×ª ×”×œ×‘ ×©×œ×š ×ž×ª×¨×—×‘×ª, ×›×ž×• ×¢× ×Ÿ ×‘×œ×ª×™ × ×¨××” ×¡×‘×™×‘ ×”×¨××©.

×•×¢×›×©×™×• ×©×™×ž×™ ×œ×‘ ×œ×ž×¨×—×‘ ×©×‘×™×Ÿ ×”××•×–× ×™×™× ×©×œ×š ×œ×‘×™×Ÿ ×§×™×¨×•×ª ×”×—×“×¨ ×©×‘×• ××ª × ×ž×¦××ª ×¢×›×©×™×•. ×—×•×©×™ ××•×ª×•, ×”×™×™×” ×‘×• ×‘×ž×—×©×‘×”. ×¤×ª×—×™ ××ª ×”×ª×•×“×¢×” ×©×œ×š ×œ×›×ž×” ×©×”×•× ×’×“×•×œ â€” ×”×•× × ×ž×¦× ×‘×›×œ ×ž×§×•× ×¡×‘×™×‘×š. ×—×©×‘×™ ×¢×œ ×›×ž×” ×ž×§×•× ×—×•×¤×©×™ ×™×© ×‘×—×“×¨, × ×©×ž×™ ×‘×§×œ×•×ª ×•×‘×—×•×¤×©×™×•×ª.

×•×¢×›×©×™×• ×‘×•××™ × ×¦× ×œ×ž×§×•× ×™×“×™×“×•×ª×™. ×“×ž×™×™× ×™ ×©×™×© ×œ×š ×‘×¨××© ×ž×§×•× ×›×–×” ×©× ×¢×™× ×œ×š ×‘×•. ×ž×¦××™ ××•×ª×• ×•×”×™×™×” ×©×. ×“×ž×™×™× ×™ ××ª ×”×ž×§×•× ×”×›×™ ×™×¤×” ×•×‘×˜×•×— ×©××ª ×™×›×•×œ×” ×œ×“×ž×™×™×Ÿ, ×©×‘×• ××ž× ×•××‘× ×ª×ž×™×“ ×œ×™×“×š ×•×¢×•×–×¨×™× ×œ×š.

×›×™ ×–×” ×”×¢×•×œ× ×©×‘× ×™×ª ×‘×¢×¦×ž×š ×•×©×‘×• ×›×œ ×ž×” ×©××ª ×ž××ž×™× ×” ×‘×• â€” ×–×• ×”××ž×ª. ×–×” ××•×ª×• ×¢×•×œ× ×©×‘×• ×”×›×œ ×‘××ž×ª ×ž×ª×’×©×, ×©×‘×• ×ž×—×©×‘×•×ª ×”×•×¤×›×•×ª ×œ×ž×¦×™××•×ª ×•×©×‘×• ×›×œ ×ž×” ×©××ª ×ž××ž×™× ×” ×‘×• ×™×›×•×œ ×œ×§×¨×•×ª. ×—×©×‘×™ ×¢×œ ×›×š ×©×‘×ž×§×•× ×”×–×” ××ª ×§×•×¡×ž×ª ××ž×™×ª×™×ª ×•×”×›×œ ×›×¤×•×£ ×œ×¨×¦×•× ×š.

×”××ž×™× ×™ ×‘×›×š ×©××ª ×—×›×ž×”, ×•×©××ª ×œ×•×ž×“×ª ×ž××•×“ ×ž×”×¨ ×•×‘×§×œ×•×ª. ×”××ž×™× ×™ ×‘×›×š, ×•×”×›×œ ×™×ª×’×©×. ×—×•×©×™ ×‘×™×˜×—×•×Ÿ ×‘×›×•×—×•×ª ×©×œ×š, ×—×©×‘×™ ×¢×œ ×›×ž×” ×§×œ ×œ×š ×œ×¨×›×•×© ×›×œ ×™×“×¢ ×—×“×©.

×”××ž×™× ×™ ×‘×›×š ×©××•×”×‘×™× ××•×ª×š ×ž××•×“ ×ž××•×“, ×•×—×•×©×™ ×–××ª ×‘×›×œ ×œ×™×‘×š, ×•×ª× ×™ ×œ× ×©×ž×” ×œ×”×ª×ž×œ× ×‘××•×©×¨. ×“×ž×™×™× ×™ ×–×•×”×¨ ×—× ×‘×—×–×”, ×©××¤×™ ××ª ×ª×—×•×©×ª ×”××”×‘×” ×”×–×• ×‘×›×œ ×ª× ×‘×’×•×£. ×“×¢×™ ×©××ž× ×•××‘× ××•×”×‘×™× ××•×ª×š ×ž××•×“, ××ž× ×•××‘× ×©×ž×—×™× ×©××ª ××¦×œ×.

×”××ž×™× ×™ ×‘×›×š ×©××•×”×‘×™× ××•×ª×š ×•×—×•×©×™ ×–××ª ×‘×›×œ ×œ×™×‘×š ×•×ª× ×™ ×œ× ×©×ž×” ×œ×”×ª×ž×œ× ×‘××•×©×¨, ×–×” ×ž×§×•× ×©×‘×• ×™×© ×œ×š ×—×‘×¨×™× × ××ž× ×™× ×•×§×¨×•×‘×™× × ×¤×œ××™×.

×”××ž×™× ×™ ×‘×—×‘×¨×™× ×•×‘×§×¨×•×‘×™× ×©×œ×š ×•×”×™×™ ×‘×¢×¦×ž×š ×—×‘×¨×” × ××ž× ×”. ×”×ª×™×™×—×¡×™ ×œ×× ×©×™× ×›×¤×™ ×©××ª ×¨×•×¦×” ×©×™×ª×™×™×—×¡×• ××œ×™×™×š, ×•×”× ×™×”×¤×›×• ×œ×—×‘×¨×™× ×©×œ×š. ×—×•×©×™ ×–××ª ×•×”×™×™ ×˜×•×‘×” ××œ×™×”×. ×—×©×‘×™ ×¢×œ ×”×§×¨×•×‘×™× ×©×œ×š ×‘×¨×•×š ×•×‘×˜×•×‘ ×œ×‘.

×”××ž×™× ×™ ×‘×›×š ×©××ª ×ª×ž×™×“ ×™×›×•×œ×” ×œ×”×™×•×ª ×‘×¨×™××”, ×•×›×ž×” ×’×•×£ ×—×–×§ ×™×© ×œ×š. ×—×•×©×™ ×–××ª ×•×”×™×™ ×‘×¨×™××” ×©×. ×—×•×©×™ ×’×œ ×©×œ ×× ×¨×’×™×” ×•×›×•×— ×‘×’×•×£, × ×©×ž×™ ×¢×ž×•×§ ×•×‘×‘×™×˜×—×•×Ÿ.

×”××ž×™× ×™ ×‘×›×š ×©××ª ××“× ×ž××•×©×¨, ×•××ª ×ª×”×™×™ ×ž××•×©×¨×ª ×‘×—×™×™×. ×”×™×™ ×ž××•×©×¨×ª ×‘×ž×§×•× ×”×–×” ×•×”××ž×™× ×™ ×‘×›×š. ×—×™×™×›×™ ×‘×ž×—×©×‘×”, ×—×•×©×™ ××™×š ×‘×ª×•×›×š × ×•×œ×“×ª ×©×ž×—×” ×©×§×˜×”.

×”××ž×™× ×™ ×‘×›×š ×©××ª ×™×›×•×œ×” ×œ×”×§×©×™×‘ ×•×œ×”×‘×™×Ÿ ×”×›×œ ×•×œ×‘×¦×¢ ×”×™×˜×‘ ××ª ×ž×” ×©×ž×‘×§×©×™× ×ž×ž×š. ×—×•×©×™ ×©××ª ×™×›×•×œ×” ×œ×¢×©×•×ª ×–××ª, ×•×›×š ×”×›×œ ×™×”×™×”. ×—×©×‘×™ ×¢×œ ×”×™×›×•×œ×ª ×©×œ×š ×œ×”×™×•×ª ×§×©×•×‘×” ×•××›×¤×ª×™×ª.

×”××ž×™× ×™ ×©×›×œ ×”×¦×¨×•×ª ×©×ž×˜×¨×™×“×•×ª ××•×ª×š ×™×›×•×œ×•×ª ×œ×”×™×¢×œ×. ×ª× ×™ ×œ×¦×¨×•×ª ×œ× ×©×•×¨ ×›×ž×• ×©×œ×’ ×ª×—×ª ×§×¨× ×™ ×©×ž×© ×—×ž×•×ª. ×”××ž×™× ×™, ×›×š ×™×”×™×”. ×‘× ×©×™×¤×” ××¨×•×›×” ×“×ž×™×™× ×™ ××™×š ×›×œ ×”×¤×—×“×™× ×•×”×“××’×•×ª ×©×œ×š ×¤×©×•×˜ ×ž×ª××“×™×.

×”××ž×™× ×™ ×‘×¢×¦×ž×š. ×”××ž×™× ×™ ×©××ª ×™×›×•×œ×” ×œ×¢×‘×•×“ ×‘×¢×‘×•×“×” ×§×©×” ×•×ª×”× ×™ ×›×©×¦×¨×™×š ×œ×¢×‘×•×“ ×§×©×”, ×•×ª×”× ×™ ×©×ª×§×‘×œ×™ ××ª ×ž×” ×©×¨×¦×™×ª. ×¤×©×•×˜ ×”××ž×™× ×™ ×©××ª ×ž×¡×•×’×œ×ª ×œ×”×ª××ž×¥ ×œ×ž×¢×Ÿ ×ž×©×”×•, ×•×›×©×ª×ª××ž×¦×™ â€” ×ª×§×‘×œ×™ ××ª ×–×”. ×—×©×‘×™ ×¢×œ ×›×ž×” × ×¢×™× ×œ×”×©×™×’ ×ž×˜×¨×•×ª ×‘×¢×‘×•×“×” ×§×©×” ×•×‘×ž××ž×¥ ×•×›×ž×” ×ž×©×ž×— ×œ×¢×–×•×¨ ×œ×× ×©×™× ×ž×¡×‘×™×‘.

×”××ž×™× ×™ ×‘×¢×¦×ž×š, ×•×ª×”×¤×›×™ ×œ××“× ×›×–×” ×©×ª×¨×¦×™ ×œ×”×™×•×ª. ×”××ž×™× ×™ ×©××ª ×™×›×•×œ×” ×œ×”×™×•×ª ×ž×™ ×©×ª×¨×¦×™, ×•×ª×”×¤×›×™ ×œ××“× ×›×–×”. ×—×©×‘×™ ×¢×œ ×–×”. ×“×ž×™×™× ×™ ××ª ×¢×¦×ž×š ×‘×¢×ª×™×“, ××™×š ××ª × ×¨××™×ª, ×›×ž×” ××ª ×ž××•×©×¨×ª.

×”×™×™ ×‘×˜×•×—×” â€” ×–×” ×ž×§×•× ×©×‘×• ×—×œ×•×ž×•×ª ×”×•×¤×›×™× ×œ×ž×¦×™××•×ª. ×”××ž×™× ×™ ×©×”××•×›×œ ×©×˜×•×‘ ×œ×š ×”×•×¤×š ×œ×˜×¢×™× ×ž××•×“, ×•×”×•× ×™×”×™×” ×˜×¢×™× ×ž××•×“. ×—×•×©×™ ××ª ×”×˜×¢× ×•×”×ª×•×¢×œ×ª ×©×œ ××•×›×œ ×‘×¨×™×.

×”××ž×™× ×™ ×©××ª ×™×™×—×•×“×™×ª ×•×ž×•×›×©×¨×ª, ×•×™×© ×œ×š ×”×ž×•×Ÿ ×¨×¢×™×•× ×•×ª ×ž×¦×•×™× ×™×, ×•×™×”×™×” ×œ×š ×ž×¡×¤×™×§ ××•×ž×¥ ×›×“×™ ×œ×”×’×©×™× ××•×ª×. ×ª×”×¤×›×™ ×œ×§×•×¡×ž×ª ×ž×œ××ª ×¨×¢×™×•× ×•×ª ×ž×¦×•×™× ×™×. ×—×•×©×™ ××ª ×”×™×™×—×•×“×™×•×ª ×©×œ×š, ×—×©×‘×™ ×¢×œ ×”×™×›×•×œ×•×ª ×©×œ×š ×›×ž×• ×¢×œ ××•×¦×¨×•×ª. ×”×™×–×›×¨×™ ×©××ž× ×•××‘× ×ž××•×“ ×©×ž×—×™× ×©××ª ××¦×œ×.

×”×¤×›×™ ×‘×ž×—×©×‘×” ×œ××“× ×›×–×” ×¤×©×•×˜ ×œ×©× ×”×›×™×£ ×•×ž×›×œ ×”×œ×‘ ××”×‘×™ ××ª ×”××“× ×©×”×•×¤×™×¢ â€” ×–×• ××ª. ××™×–×• ××ª ×¨×•×¦×” ×œ×”×™×•×ª? ×ž××•×©×¨×ª, ×‘×¨×™××”, ×ž××•×”×‘×ª ×‘×—×™×™×, ×—×•×¤×©×™×™×”. ×—×•×©×™ ×¨×•×š ×¨×‘ ×•××”×‘×” ×›×œ×¤×™ ×¢×¦×ž×š, × ×©×ž×™ ×‘×ž×œ×•× ×”×—×–×”.

××ª ×ª×ž×™×“ ×ª×—×ª ×”×’× ×” ×©×œ ×›×•×— ×‘×œ×ª×™ × ×¨××”. ×”×•× ×ª×ž×™×“ ××•×”×‘ ××•×ª×š ×•×¦×•×¤×” ×‘×š. ×”×•× ×—×™ ×‘×ª×•×›×š, ×¢×•×–×¨ ×œ×œ×‘ ×©×œ×š ×œ×¤×¢×•×, ×ž×¢× ×™×§ ×œ×š ×—×™×™× ×•×™×•×¦×¨ ×‘×—×™×™× ×”××œ×” × ×ª×™×‘×™× ×—×“×©×™×. ×”××ž×™× ×™ ×‘×›×•×— ×”×‘×œ×ª×™ × ×¨××” ×”×–×”, ×›×™ ×”×•× ×ž××ž×™×Ÿ ×‘×š. ×”× ×™×—×™ ×™×“ ×¢×œ ×”×œ×‘, ×—×•×©×™ ××ª ×”×ž×§×¦×‘ ×©×œ×•, ×—×©×‘×™ ×¢×œ ×›×š ×©××ª ×œ×¢×•×œ× ×œ× ×œ×‘×“.

××ª ×”×™× ×”×§×¡× ×©×œ ×”×—×™×™× ×©×œ×š. ×”××ž×™× ×™ ×‘×§×¡×, ×”××ž×™× ×™ ×‘×ž×¦×™××•×ª ×©×œ ×”×“×‘×¨×™× ×•×”××ž×™× ×™ ×‘××¤×©×¨×•×™×•×ª. ×× ××ª ×ž××ž×™× ×” ×‘××¤×©×¨×•×™×•×ª â€” ××ª ×ž××ž×™× ×” ×‘×¢×¦×ž×š. ×¡×ž×›×™ ×¢×œ ×¢×¦×ž×š ×‘×¢×•×œ× ×”×–×”. ×—×•×©×™ ××ª ×”×›×•×— ×”×¤× ×™×ž×™ ×©×œ×š, ×—×©×‘×™ ×œ×¢×¦×ž×š ×›×š: "×× ×™ ×™×›×•×œ×” ×”×›×œ".

×”××ž×™× ×™ ×©××ª ×—×©×•×‘×”, ×©××ª ××”×•×‘×”, ×©××ª ×ž×™×•×—×“×ª, ××ª ×™×›×•×œ×” ×œ×©× ×•×ª ××ª ×›×œ ×”×¢×•×œ× ×©×œ× ×• ×•×™×© ×‘×š ×’×“×•×œ×”. ×”××ž×™× ×™ ×‘×›×š ×©××ª ×ž×¡×•×’×œ×ª ×œ×¢×©×•×ª ×›×œ ×“×‘×¨. ×—×•×©×™ ××ª ×”×—×©×™×‘×•×ª ×©×œ×š, ×“×ž×™×™× ×™ ××™×š ××ª ×ž×‘×™××” ×˜×•×‘ ×œ×¢×•×œ× ×”×–×”.

××”×‘×™ ××ª ×¢×¦×ž×š ×ž×ž×© ×¢×›×©×™×•, ××”×‘×™ ××ª ×”×—×™×™× ×©×œ×š ×ž×ž×© ×¢×›×©×™×•, ××”×‘×™ ××ª ×”×× ×©×™× ×‘×—×™×™× ×©×œ×š ×ž×ž×© ×¢×›×©×™×• ×•×¡×œ×—×™ ×œ××œ×” ×©××ª ×œ× ××•×”×‘×ª, ×›×“×™ ×œ×¤× ×•×ª ×™×•×ª×¨ ×ž×§×•× ×œ××”×‘×”. ×‘×ž×—×©×‘×” ×©×—×¨×¨×™ ××ª ×›×œ ×”×˜×™× ×•×ª ×”×™×©× ×•×ª, ×—×•×©×™ ××™×š ×‘×œ×‘ × ×”×™×” ×§×œ ×•× ×§×™.

×“×¢×™ ×©××ž× ×•××‘× ××•×”×‘×™× ××•×ª×š ×ž××•×“.

×¢×›×©×™×• ×‘×•××™ × ×œ×ž×“ ××ª ×”×’×•×£ ×©×œ×š ×¨×’×©×•×ª ×—×“×©×™× ×•× ×¤×œ××™×. ×ž×” ×–×” ××•×ž×¥? ×—×•×©×™ ×ž×ž×© ×¢×›×©×™×• ××™×š ×–×” ×œ×”×™×•×ª ×œ×—×œ×•×˜×™×Ÿ ×œ×œ× ×¤×—×“.
×ž×” ×–×” ×—×•×¤×©? ×—×•×©×™ ××™×š ×–×” ×œ×”×™×•×ª ×—×•×¤×©×™×™×” ×•×ž××•×©×¨×ª ×œ×—×œ×•×˜×™×Ÿ.
×ž×” ×–×” ×©×¤×¢? ×—×•×©×™ ×©×›×‘×¨ ×™×© ×œ×š ×›×œ ×ž×” ×©××ª ×¦×¨×™×›×” ×‘×©×‘×™×œ ××•×©×¨.
×ž×” ×–×• ×”×©×¨××”? ×“×ž×™×™× ×™ ×©×¦×¥ ×œ×š ×¨×¢×™×•×Ÿ ×ž×¦×•×™×Ÿ ×•××ª ×™×•×“×¢×ª ×‘×“×™×•×§ ××™×š ×œ×‘×¦×¢ ××•×ª×•.
×ž×” ×–×” ×›×•×— ×—×™×™×? ×—×•×©×™ ×©×—×™ ×‘×š ×›×•×— ×‘×œ×ª×™ ×ž×•×’×‘×œ. ×ž×” ×–×• ×ª×©×•×§×”? ×—×•×©×™ ×›×ž×” ×—×–×§ ××ª ×ž××•×”×‘×ª ×‘×—×™×™× ×©×œ×š.

×”× ×™×—×™ ××ª ×™×“ ×©×ž××œ ×¢×œ ×”×œ×‘ ×•×‘×¨×›×™ ××ª ×”×’×•×£ ×©×œ×š ×œ×ª×•×“×¢×” ×—×“×©×” ×•×‘×”×™×¨×”. ×‘×¨×›×™ ××ª ×”×—×™×™× ×©×œ×š ×©×œ×œ ×”×¨×¤×ª×§××•×ª, ×•××ª ×”× ×©×ž×” ×©×œ×š ×©×ª×ž×™×“ ×ž×¨××” ×œ×š ××ª ×”×“×¨×š ×”× ×›×•× ×”.

×¤×ª×—×™ ××ª ×”×œ×‘ ×©×œ×š ×•×”×‘×™×¢×™ ×ª×•×“×” ×¢×œ ×”×—×™×™× ×”×—×“×©×™× ×•×”× ×¤×œ××™× ×©×œ×š ×¢×•×“ ×œ×¤× ×™ ×©×–×” ×§×¨×”. ×ª×•×“×” ×”×™× ×¡×™×ž×Ÿ ×œ×›×š ×©×›×œ ×ž×” ×©×¤× ×˜×¡×˜×™ ×›×‘×¨ ×§×¨×” ×‘×¢×•×œ× ×©×œ×š.

×ž×” ×©×œ× ×™×§×¨×”, ××ž× ×•××‘× ×™××”×‘×• ××•×ª×š ×‘××•×ª×” ×¢×•×¦×ž×”.

×”×’×™×¢ ×”×–×ž×Ÿ ×œ×¢×–×•×‘ ××ª ×”×ž×§×•× ×”×–×”, ××‘×œ ×–×›×¨×™: ×›×©××ª ×ž××ž×™× ×”, ×›×œ ×ž×” ×©×§×•×¨×” ×‘×¢×•×œ× ×”×–×” ×§×•×¨×” ×’× ×‘×—×™×™× ×©×œ×š. ×©×ž×¨×™ ×¢×œ ×ž×¦×‘ ×”×‘×™×˜×—×•×Ÿ ×•×”×©×œ×•×•×” ×”×¤× ×™×ž×™×ª ×”×–×•.

×”×ª×ž×ª×—×™ ×”×™×˜×‘ ×•×”×™×–×›×¨×™ ×©×”×’×™×¢ ×”×–×ž×Ÿ ×œ×—×–×•×¨ ×œ×—×™×™× ×©××ª ×—×™×”, ×¢×¨× ×™×ª ×•×§×©×•×‘×” ×¢×•×“ ×™×•×ª×¨. ×“×¢×™: ×”×™×•× ×™×›×•×œ×™× ×œ×§×¨×•×ª ×œ×š ×“×‘×¨×™× × ×¤×œ××™×. ×§×—×™ × ×©×™×ž×” ×¢×ž×•×§×”, ×”×ª×ž×ª×—×™ ×‘×›×œ ×”×’×•×£, ×ª×•×š ×ª×—×•×©×ª ×¨×¢× × ×•×ª ×•×›×•×—.

×¤×§×—×™ ×¢×™× ×™×™× ×•×—×™×™×›×™ ×œ×—×™×™×, ×•××– ×”× ×™×—×™×™×›×• ××œ×™×™×š ×‘×—×–×¨×”. ×¤×§×—×™ ×¢×™× ×™×™× ×¢× ×—×™×•×š ×¨×—×‘, ×ª×•×š ×ª×—×•×©×ª ×ž×•×›× ×•×ª ×œ×™×•× × ×¤×œ× ×•×ž××•×©×¨.
`;

// Initialize Page Load & Canvas Pad
document.addEventListener('DOMContentLoaded', () => {
  setupScrollListener();
  registerServiceWorker();
  initAudioPlayer();
  initSignatureCanvas();
  initAnalyticsTracking(); // ðŸ“Š Full analytics: Page_View, scroll %, time, pricing view
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
    document.getElementById('play-btn').innerText = "â–¶";
    document.getElementById('player-progress').style.width = "100%";
  });
}

// 100% Multilingual Switcher (RU, EN, HE)
function switchLanguage(langKey) {
  appState.lang = langKey;
  
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  if (langKey === 'he') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'he');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', langKey);
  }

  const dictionary = i18n[langKey] || i18n.ru;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dictionary[key]) {
      el.innerHTML = dictionary[key];
    }
  });
}

// Scroll & Sticky Bar
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

// Select 3 Primary Audio Modes
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

// MediaRecorder â€” Real Parent Microphone Recording
async function toggleVoiceRecord() {
  const micBtn = document.getElementById('mic-btn');
  const micText = document.getElementById('mic-text');
  const micWave = document.getElementById('mic-wave');

  if (!appState.isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      appState.mediaRecorder = new MediaRecorder(stream);
      appState.recordedChunks = [];

      appState.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) appState.recordedChunks.push(e.data);
      };

      appState.mediaRecorder.onstop = () => {
        const blob = new Blob(appState.recordedChunks, { type: 'audio/webm' });
        appState.recordedAudioUrl = URL.createObjectURL(blob);
        micText.innerText = appState.lang === 'he' ? "×”×”×§×œ×˜×” ×”×•×©×œ×ž×”! (× ×™×ª×Ÿ ×œ×”×§×©×™×‘)" : "Ð—Ð°Ð¿Ð¸ÑÑŒ Ð³Ð¾Ð»Ð¾ÑÐ° Ð·Ð°Ð²ÐµÑ€ÑˆÐµÐ½Ð°! (Ð¡Ð¾Ñ…Ñ€Ð°Ð½ÐµÐ½Ð¾)";
      };

      appState.mediaRecorder.start();
      appState.isRecording = true;
      micBtn.classList.add('recording');
      micText.innerText = appState.lang === 'he' ? "×ž×§×œ×™×˜ ×§×•×œ... ×“×‘×¨ ×¢×›×©×™×•" : "Ð˜Ð´ÐµÑ‚ Ð·Ð°Ð¿Ð¸ÑÑŒ Ð²Ð°ÑˆÐµÐ³Ð¾ Ð³Ð¾Ð»Ð¾ÑÐ°... Ð“Ð¾Ð²Ð¾Ñ€Ð¸Ñ‚Ðµ";
      micWave.classList.remove('hidden');

      // Auto stop after 5 seconds
      setTimeout(() => {
        if (appState.isRecording) toggleVoiceRecord();
      }, 5000);

    } catch (err) {
      console.warn("Microphone access denied:", err);
      micText.innerText = "Ð“Ð¾Ð»Ð¾Ñ Ð¿Ñ€Ð¾Ð°Ð½Ð°Ð»Ð¸Ð·Ð¸Ñ€Ð¾Ð²Ð°Ð½ (Ð˜Ð˜ ÑÐ»ÐµÐ¿Ð¾Ðº)";
      alert("Ð”Ð¾ÑÑ‚ÑƒÐ¿ Ðº Ð¼Ð¸ÐºÑ€Ð¾Ñ„Ð¾Ð½Ñƒ Ð½Ðµ Ð¿Ñ€ÐµÐ´Ð¾ÑÑ‚Ð°Ð²Ð»ÐµÐ½. Ð˜ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ÑÑ Ð´ÐµÐ¼Ð¾-ÑÐ»ÐµÐ¿Ð¾Ðº Ð˜Ð˜.");
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

// Generate Personal Meditation Text & Play Audio Track
function generatePersonalMeditation() {
  const name = document.getElementById('child-name').value || (appState.lang === 'he' ? "×¡×•×¤×™×”" : "Ð¡Ð¾Ñ„Ð¸Ñ");
  const gender = document.getElementById('child-gender').value;
  const audioSource = document.getElementById('audio-mode-source').value;

  const isGirl = (gender === 'girl');
  let customText = "";

  if (appState.lang === 'he') {
    customText = BASE_MEDITATION_TEMPLATE_HE.replace(/{NAME}/g, name);
  } else {
    const genderEnd = isGirl ? 'Ð°' : '';
    const genderAdj = isGirl ? 'Ð°Ñ' : 'Ñ‹Ð¹';
    const genderWizard = isGirl ? 'Ñ†Ð°' : '';
    const genderFriend = isGirl ? 'Ð¾Ð¹' : 'Ð¾Ð¼';

    customText = BASE_MEDITATION_TEMPLATE_RU
      .replace(/{NAME}/g, name)
      .replace(/{GENDER_END}/g, genderEnd)
      .replace(/{GENDER_ADJ}/g, genderAdj)
      .replace(/{GENDER_WIZARD}/g, genderWizard)
      .replace(/{GENDER_FRIEND}/g, genderFriend);
  }

  document.getElementById('meditation-text-box').innerText = customText;
  document.getElementById('player-title').innerText = `${name} â€” ${appState.lang === 'he' ? '×¡×™×¤×•×¨-×ž×“×™×˜×¦×™×”' : 'Ð Ð°ÑÑÐºÐ°Ð·-ÐœÐµÐ´Ð¸Ñ‚Ð°Ñ†Ð¸Ñ'}`;
  
  // Smooth scroll to player card
  const playerCard = document.querySelector('.player-card');
  if (playerCard) {
    playerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    playerCard.style.boxShadow = '0 0 40px rgba(255, 107, 0, 0.5)';
    setTimeout(() => { playerCard.style.boxShadow = ''; }, 2000);
  }

  appState.isPlayingAudio = false;

  if (appState.recordedAudioUrl) {
    playParentRecordedVoice();
  } else if (audioSource === 'tts') {
    document.getElementById('player-subtitle').innerText = `ðŸ¤– Ð”Ð¸Ð½Ð°Ð¼Ð¸Ñ‡ÐµÑÐºÐ¸Ð¹ Ð˜Ð˜-Ð´Ð¸ÐºÑ‚Ð¾Ñ€ â€¢ ÐÐ¸Ð·ÐºÐ¸Ð¹ Ñ‚ÐµÐ¼Ð±Ñ€`;
    speakTextTTS(customText);
  } else {
    document.getElementById('player-subtitle').innerText = `ðŸŽµ Ð¡Ñ‚ÑƒÐ´Ð¸Ð¹Ð½Ð°Ñ MP3 Ñ„Ð¾Ð½Ð¾Ð³Ñ€Ð°Ð¼Ð¼Ð° â€¢ Ð‘ÐµÐ· Ð¼ÑƒÐ·Ñ‹ÐºÐ¸`;
    playMP3AudioTrack(true);
  }

  logClickAnalytics('Meditation_Generated', name, 0, { audio_source: audioSource });
}

// Play Parent's Actual Recorded Voice Audio
function playParentRecordedVoice() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (appState.audioTrack) appState.audioTrack.pause();

  if (appState.recordedAudioUrl) {
    const parentAudio = new Audio(appState.recordedAudioUrl);
    appState.isPlayingAudio = true;
    document.getElementById('play-btn').innerText = "â¸";
    document.getElementById('player-subtitle').innerText = "ðŸŽ™ ÐžÐ·Ð²ÑƒÑ‡Ð¸Ð²Ð°Ð½Ð¸Ðµ Ð·Ð°Ð¿Ð¸ÑÐ°Ð½Ð½Ñ‹Ð¼ Ð³Ð¾Ð»Ð¾ÑÐ¾Ð¼ Ñ€Ð¾Ð´Ð¸Ñ‚ÐµÐ»Ñ!";

    parentAudio.play().then(() => {
      console.log("â–¶ Playing parent recorded audio...");
    }).catch(err => {
      console.warn("Parent recorded audio play error:", err);
      playMP3AudioTrack(true);
    });

    parentAudio.onended = () => {
      appState.isPlayingAudio = false;
      document.getElementById('play-btn').innerText = "â–¶";
    };
  } else {
    alert("ðŸŽ™ Ð’Ñ‹ ÐµÑ‰Ðµ Ð½Ðµ Ð·Ð°Ð¿Ð¸ÑÐ°Ð»Ð¸ ÑÐ²Ð¾Ð¹ Ð³Ð¾Ð»Ð¾Ñ! ÐÐ°Ð¶Ð¼Ð¸Ñ‚Ðµ Ð¼Ð¸ÐºÑ€Ð¾Ñ„Ð¾Ð½ ÑÐ»ÐµÐ²Ð° Ð´Ð»Ñ Ð·Ð°Ð¿Ð¸ÑÐ¸ Ð¾Ñ‚Ñ€Ñ‹Ð²ÐºÐ° Ð²Ð°ÑˆÐµÐ³Ð¾ Ð³Ð¾Ð»Ð¾ÑÐ°.");
    const micBtn = document.getElementById('mic-btn');
    if (micBtn) {
      micBtn.classList.add('recording');
      setTimeout(() => micBtn.classList.remove('recording'), 3000);
    }
    document.getElementById('player-subtitle').innerText = "ðŸŽµ Ð¡Ñ‚ÑƒÐ´Ð¸Ð¹Ð½Ð°Ñ MP3 Ñ„Ð¾Ð½Ð¾Ð³Ñ€Ð°Ð¼Ð¼Ð° (Ð“Ð¾Ð»Ð¾Ñ Ð½Ðµ Ð·Ð°Ð¿Ð¸ÑÐ°Ð½)";
    playMP3AudioTrack(true);
  }
}

// Play Studio Audio Track (meditation1.mp3)
function playMP3AudioTrack(forceStart = false) {
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  if (!appState.audioTrack) {
    initAudioPlayer();
  }

  if (appState.isPlayingAudio && !forceStart) {
    appState.audioTrack.pause();
    appState.isPlayingAudio = false;
    document.getElementById('play-btn').innerText = "â–¶";
  } else {
    appState.audioTrack.currentTime = 0;
    appState.audioTrack.play().then(() => {
      appState.isPlayingAudio = true;
      document.getElementById('play-btn').innerText = "â¸";
    }).catch(err => {
      console.warn("MP3 playback fallback to speech synth:", err);
      const text = document.getElementById('meditation-text-box').innerText;
      speakTextTTS(text);
    });
  }
}

function togglePlayAudio() {
  if (appState.isPlayingAudio) {
    if (appState.audioTrack) appState.audioTrack.pause();
    if (window.speechSynthesis) window.speechSynthesis.pause();
    appState.isPlayingAudio = false;
    document.getElementById('play-btn').innerText = "â–¶";
  } else {
    generatePersonalMeditation();
  }
}

// Speech Synthesis TTS (Slow calm voice with dynamic voice selection)
function speakTextTTS(text) {
  if (appState.audioTrack) appState.audioTrack.pause();
  if (!window.speechSynthesis) {
    alert("Ð’ Ð²Ð°ÑˆÐµÐ¼ Ð±Ñ€Ð°ÑƒÐ·ÐµÑ€Ðµ Ð½ÐµÐ´Ð¾ÑÑ‚ÑƒÐ¿ÐµÐ½ SpeechSynthesis. ÐŸÑ€Ð¾Ð¸Ð³Ñ€Ñ‹Ð²Ð°ÐµÑ‚ÑÑ MP3 Ñ„Ð¾Ð½Ð¾Ð³Ñ€Ð°Ð¼Ð¼Ð°.");
    playMP3AudioTrack(true);
    return;
  }

  window.speechSynthesis.cancel();
  if (window.speechSynthesis.resume) {
    window.speechSynthesis.resume();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.6;
  utterance.pitch = 0.75;
  utterance.lang = appState.lang === 'he' ? 'he-IL' : 'ru-RU';

  utterance.onstart = () => {
    appState.isPlayingAudio = true;
    document.getElementById('play-btn').innerText = "â¸";
    document.getElementById('player-progress').style.width = "30%";
  };

  utterance.onend = () => {
    appState.isPlayingAudio = false;
    document.getElementById('play-btn').innerText = "â–¶";
    document.getElementById('player-progress').style.width = "100%";
  };

  utterance.onerror = (e) => {
    console.warn("SpeechSynthesis error:", e);
    appState.isPlayingAudio = false;
    document.getElementById('play-btn').innerText = "â–¶";
    playMP3AudioTrack(true);
  };

  window.speechSynthesis.speak(utterance);
}

// Generate Emergency Tantrum Audio
function generateEmergencyAudio() {
  const contextInput = document.getElementById('emergency-context').value || "Ð ÐµÐ±ÐµÐ½Ð¾Ðº Ñ€Ð°ÑÑ‚Ñ€ÐµÐ²Ð¾Ð¶ÐµÐ½";
  const name = document.getElementById('child-name').value || "Ð ÐµÐ±ÐµÐ½Ð¾Ðº";

  const emergencyScript = `
    ${name}, ÑÐ´ÐµÐ»Ð°Ð¹ Ð³Ð»ÑƒÐ±Ð¾ÐºÐ¸Ð¹ Ð²Ñ‹Ð´Ð¾Ñ… Ð²Ð¼ÐµÑÑ‚Ðµ ÑÐ¾ Ð¼Ð½Ð¾Ð¹... ÐžÐ´Ð¸Ð½... Ð´Ð²Ð°... Ñ‚Ñ€Ð¸... 
    Ð¯ Ð·Ð½Ð°ÑŽ, Ñ‡Ñ‚Ð¾ ÑÐ¸Ñ‚ÑƒÐ°Ñ†Ð¸Ñ: "${contextInput}" Ð²Ñ‹Ð·Ñ‹Ð²Ð°ÐµÑ‚ Ð¼Ð½Ð¾Ð³Ð¾ ÑÐ¼Ð¾Ñ†Ð¸Ð¹. 
    ÐÐ¾ ÑÐµÐ¹Ñ‡Ð°Ñ Ñ‚Ñ‹ Ð½Ð°Ñ…Ð¾Ð´Ð¸ÑˆÑŒÑÑ Ð² Ð¿Ð¾Ð»Ð½Ð¾Ð¹ Ð±ÐµÐ·Ð¾Ð¿Ð°ÑÐ½Ð¾ÑÑ‚Ð¸. 
    ÐŸÐ¾Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐ¹, ÐºÐ°Ðº Ð¼ÑÐ³ÐºÐ°Ñ Ð²Ð¾Ð»Ð½Ð° Ð¿Ð¾ÐºÐ¾Ñ Ð½Ð°Ð¿Ð¾Ð»Ð½ÑÐµÑ‚ Ñ‚Ð²Ð¾Ðµ Ñ‚ÐµÐ»Ð¾. Ð¢Ñ‹ ÑÐ¸Ð»ÑŒÐ½Ñ‹Ð¹, Ñ‚Ñ‹ Ð»ÑŽÐ±Ð¸Ð¼Ñ‹Ð¹, Ñ‚Ñ‹ ÑÐ¿Ñ€Ð°Ð²Ð¸ÑˆÑŒÑÑ.
  `;

  document.getElementById('meditation-text-box').innerHTML = `<p><strong>ðŸš¨ Ð­ÐšÐ¡Ð¢Ð Ð•ÐÐÐžÐ• ÐÐ£Ð”Ð˜Ðž Ð—ÐÐ—Ð•ÐœÐ›Ð•ÐÐ˜Ð¯:</strong><br><br>${emergencyScript}</p>`;
  playMP3AudioTrack();

  logClickAnalytics('EmergencyAudio_Generated', contextInput, 0);
}

// Interactive Signature Canvas (NDA Signature)
function initSignatureCanvas() {
  appState.signatureCanvas = document.getElementById('signature-canvas');
  if (!appState.signatureCanvas) return;
  appState.signatureCtx = appState.signatureCanvas.getContext('2d');

  appState.signatureCtx.strokeStyle = '#000000';
  appState.signatureCtx.lineWidth = 2.5;
  appState.signatureCtx.lineCap = 'round';

  const canvas = appState.signatureCanvas;

  function startDrawing(e) {
    appState.isDrawingSignature = true;
    appState.signatureCtx.beginPath();
    const pos = getCanvasPos(e);
    appState.signatureCtx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!appState.isDrawingSignature) return;
    const pos = getCanvasPos(e);
    appState.signatureCtx.lineTo(pos.x, pos.y);
    appState.signatureCtx.stroke();
    document.getElementById('sig-status').innerText = "ÐŸÐ¾Ð´Ð¿Ð¸ÑÑŒ Ð¿Ð¾ÑÑ‚Ð°Ð²Ð»ÐµÐ½Ð° âœ“";
    document.getElementById('sig-status').style.color = "#10B981";
  }

  function stopDrawing() {
    appState.isDrawingSignature = false;
  }

  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  canvas.addEventListener('touchstart', startDrawing, { passive: true });
  canvas.addEventListener('touchmove', draw, { passive: true });
  canvas.addEventListener('touchend', stopDrawing);
}

function clearSignatureCanvas() {
  if (appState.signatureCtx && appState.signatureCanvas) {
    appState.signatureCtx.clearRect(0, 0, appState.signatureCanvas.width, appState.signatureCanvas.height);
    document.getElementById('sig-status').innerText = "ÐŸÐ¾Ð´Ð¿Ð¸ÑÑŒ Ð¿ÑƒÑÑ‚Ð°";
    document.getElementById('sig-status').style.color = "var(--text-muted)";
  }
}

function openNDAModal() {
  document.getElementById('nda-modal').classList.remove('hidden');
  logClickAnalytics('NDAModal_Opened', 'NDA_Form', 0);
}

function closeNDAModal() {
  document.getElementById('nda-modal').classList.add('hidden');
}

async function submitNDASignature() {
  const name = document.getElementById('nda-user-name').value || 'ÐÐ½Ð¾Ð½Ð¸Ð¼Ð½Ñ‹Ð¹ ÐŸÐ¾Ð´Ð¿Ð¸ÑÐ°Ð½Ñ‚';
  const contact = document.getElementById('nda-user-contact') ? document.getElementById('nda-user-contact').value : '';
  const email = document.getElementById('nda-user-email') ? document.getElementById('nda-user-email').value : '';
  const sigData = appState.signatureCanvas ? appState.signatureCanvas.toDataURL() : '';

  localStorage.setItem('ndaSigned', 'true');
  if (typeof hasSignedNDA !== 'undefined') {
    hasSignedNDA = true;
  }

  let pdfBase64 = '';
  if (window.html2pdf) {
    const pdfDiv = document.createElement('div');
    pdfDiv.style.padding = '20px';
    pdfDiv.style.fontFamily = 'Arial, sans-serif';
    pdfDiv.innerHTML = `
      <h2>ÐŸÐ¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÑŒÑÐºÐ¾Ðµ ÑÐ¾Ð³Ð»Ð°ÑˆÐµÐ½Ð¸Ðµ (Terms of Service)</h2>
      <p>ÐžÐ¢ÐšÐÐ— ÐžÐ¢ ÐžÐ¢Ð’Ð•Ð¢Ð¡Ð¢Ð’Ð•ÐÐÐžÐ¡Ð¢Ð˜ Ð˜ ÐžÐ“Ð ÐÐÐ˜Ð§Ð•ÐÐ˜Ð• ÐŸÐ Ð•Ð¢Ð•ÐÐ—Ð˜Ð™ (DISCLAIMER)</p>
      <hr/>
      <p><b>Ð¤Ð˜Ðž:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>WhatsApp/TG:</b> ${contact}</p>
      <p><b>Ð”Ð°Ñ‚Ð°:</b> ${new Date().toLocaleString('ru-RU')}</p>
      <br/>
      <p>Ð¯, ${name}, Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´Ð°ÑŽ ÑÐ²Ð¾Ðµ ÑÐ¾Ð³Ð»Ð°ÑÐ¸Ðµ Ñ Ð¿Ñ€Ð°Ð²Ð¸Ð»Ð°Ð¼Ð¸ ÑÐµÑ€Ð²Ð¸ÑÐ° MindEcho AI.</p>
      <br/><br/>
      <p><b>Ð­Ð»ÐµÐºÑ‚Ñ€Ð¾Ð½Ð½Ð°Ñ Ð¿Ð¾Ð´Ð¿Ð¸ÑÑŒ:</b></p>
      ${sigData ? `<img src="${sigData}" style="max-height: 100px; border: 1px solid #000;" />` : ''}
    `;
    try {
      pdfBase64 = await html2pdf().set({ margin: 1, filename: 'NDA.pdf' }).from(pdfDiv).outputPdf('datauristring');
    } catch(e) { console.error('PDF Generation error', e); }
  }

  alert(`ðŸŽ‰ Ð¡Ð¾Ð³Ð»Ð°ÑˆÐµÐ½Ð¸Ðµ ÑƒÑÐ¿ÐµÑˆÐ½Ð¾ Ð¿Ð¾Ð´Ð¿Ð¸ÑÐ°Ð½Ð¾!\nÐŸÐ¾Ð´Ð¿Ð¸ÑÐ°Ð½Ñ‚: ${name}\nÐ¤Ð°Ð¹Ð» NDA (PDF) ÑÐ¾Ñ…Ñ€Ð°Ð½ÐµÐ½ Ð½Ð° Google Ð”Ð¸ÑÐº.`);
  closeNDAModal();

  logClickAnalytics('NDA_Signed', name, 0, {
    user_name: name,
    contact: contact,
    email: email,
    signature_data: sigData ? 'Signature Captured' : 'Empty',
    pdf_base64: pdfBase64
  });

  if (appState.pendingCheckout) {
    appState.pendingCheckout = false;
    if (appState.selectedPrice === 0) {
      openAuthModal('free');
    } else {
      document.getElementById('checkout-plan-name').innerText = appState.selectedPlan;
      document.getElementById('checkout-plan-price').innerText = `$${appState.selectedPrice}`;
      document.getElementById('checkout-modal').classList.remove('hidden');
    }
  } else {
    scrollToSection('generator');
  }
}

// CustDev Survey Modal & Scenarios
const CUSTDEV_SCENARIOS = {
  burnout: [
    { label: "1. Ð¡ÐºÐ¾Ð»ÑŒÐºÐ¾ Ð²Ñ€ÐµÐ¼ÐµÐ½Ð¸ Ð·Ð°Ð½Ð¸Ð¼Ð°ÐµÑ‚ ÑƒÐºÐ»Ð°Ð´Ñ‹Ð²Ð°Ð½Ð¸Ðµ Ñ€ÐµÐ±ÐµÐ½ÐºÐ° Ð¸ Ð½Ð°ÑÐºÐ¾Ð»ÑŒÐºÐ¾ Ð²Ñ‹ Ñ‡ÑƒÐ²ÑÑ‚Ð²ÑƒÐµÑ‚Ðµ Ð²Ñ‹Ð³Ð¾Ñ€Ð°Ð½Ð¸Ðµ Ðº Ð²ÐµÑ‡ÐµÑ€Ñƒ (1-10)?", placeholder: "ÐÐ°Ð¿Ñ€Ð¸Ð¼ÐµÑ€: 1.5 Ñ‡Ð°ÑÐ°, Ð²Ñ‹Ð³Ð¾Ñ€Ð°Ð½Ð¸Ðµ 8/10" },
    { label: "2. Ð§Ñ‚Ð¾ Ð±Ð¾Ð»ÑŒÑˆÐµ Ð²ÑÐµÐ³Ð¾ Ð¼ÐµÑˆÐ°ÐµÑ‚ Ð½Ð¾Ñ€Ð¼Ð°Ð»ÑŒÐ½Ð¾Ð¼Ñƒ ÑÐ½Ñƒ Ñ€ÐµÐ±ÐµÐ½ÐºÐ°?", placeholder: "ÐÐ°Ð¿Ñ€Ð¸Ð¼ÐµÑ€: ÐšÐ°Ð¿Ñ€Ð¸Ð·Ñ‹, Ð¿Ñ€Ð¾ÑÐ¸Ñ‚ Ð¿Ð¾ÑÐ¸Ð´ÐµÑ‚ÑŒ Ñ€ÑÐ´Ð¾Ð¼, Ð¿ÐµÑ€ÐµÐ²Ð¾Ð·Ð±ÑƒÐ¶Ð´ÐµÐ½Ð¸Ðµ..." },
    { label: "3. Ð“Ð¾Ñ‚Ð¾Ð²Ñ‹ Ð»Ð¸ Ð²Ñ‹ Ð¿Ð¾Ð¿Ñ€Ð¾Ð±Ð¾Ð²Ð°Ñ‚ÑŒ Ð¸Ð½ÑÑ‚Ñ€ÑƒÐ¼ÐµÐ½Ñ‚, Ð´Ð°Ñ€ÑÑ‰Ð¸Ð¹ 1-2 Ñ‡Ð°ÑÐ° Ð»Ð¸Ñ‡Ð½Ð¾Ð³Ð¾ Ð²Ñ€ÐµÐ¼ÐµÐ½Ð¸?", placeholder: "Ð”Ð°, Ñ…Ð¾Ñ‡Ñƒ Ð¿Ñ€Ð¾Ñ‚ÐµÑÑ‚Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ" }
  ],
  tantrums: [
    { label: "1. ÐšÐ°Ðº Ñ‡Ð°ÑÑ‚Ð¾ Ñ€ÐµÐ±ÐµÐ½Ð¾Ðº Ð²Ð¿Ð°Ð´Ð°ÐµÑ‚ Ð² Ð¸ÑÑ‚ÐµÑ€Ð¸ÐºÐ¸ Ð¸ ÑÑÐ¾Ñ€Ñ‹?", placeholder: "ÐÐ°Ð¿Ñ€Ð¸Ð¼ÐµÑ€: ÐšÐ°Ð¶Ð´Ñ‹Ð¹ Ð´ÐµÐ½ÑŒ Ð¿Ñ€Ð¸ ÑƒÐ¹Ð´Ðµ Ñ Ð´ÐµÑ‚ÑÐºÐ¾Ð¹ Ð¿Ð»Ð¾Ñ‰Ð°Ð´ÐºÐ¸..." },
    { label: "2. Ð§Ñ‚Ð¾ Ð²Ñ‹ Ð¾Ð±Ñ‹Ñ‡Ð½Ð¾ Ð¸ÑÐ¿Ñ‹Ñ‚Ñ‹Ð²Ð°ÐµÑ‚Ðµ Ð² ÑÑ‚Ð¾Ñ‚ Ð¼Ð¾Ð¼ÐµÐ½Ñ‚?", placeholder: "ÐÐ°Ð¿Ñ€Ð¸Ð¼ÐµÑ€: Ð‘ÐµÑÑÐ¸Ð»Ð¸Ðµ, Ð²Ð¸Ð½Ñƒ, Ñ€Ð°Ð·Ð´Ñ€Ð°Ð¶ÐµÐ½Ð¸Ðµ..." },
    { label: "3. Ð¥Ð¾Ñ‚Ð¸Ñ‚Ðµ Ð¿Ñ€Ð¾Ñ‚ÐµÑÑ‚Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ 4-ÑˆÐ°Ð³Ð¾Ð²Ñ‹Ð¹ ÑÐºÑÑ‚Ñ€ÐµÐ½Ð½Ñ‹Ð¹ Ð¿Ñ€Ð¾Ñ‚Ð¾ÐºÐ¾Ð» Ð·Ð°Ð·ÐµÐ¼Ð»ÐµÐ½Ð¸Ñ?", placeholder: "Ð”Ð°, Ð¾Ñ‡ÐµÐ½ÑŒ Ð°ÐºÑ‚ÑƒÐ°Ð»ÑŒÐ½Ð¾" }
  ],
  confidence: [
    { label: "1. ÐšÐ°ÐºÐ¸Ðµ ÐºÐ°Ñ‡ÐµÑÑ‚Ð²Ð° Ð²Ñ‹ Ð¼ÐµÑ‡Ñ‚Ð°ÐµÑ‚Ðµ Ñ€Ð°Ð·Ð²Ð¸Ð²Ð°Ñ‚ÑŒ Ð² Ñ€ÐµÐ±ÐµÐ½ÐºÐµ?", placeholder: "ÐÐ°Ð¿Ñ€Ð¸Ð¼ÐµÑ€: Ð£Ð²ÐµÑ€ÐµÐ½Ð½Ð¾ÑÑ‚ÑŒ, Ð»ÐµÐ³ÐºÐ°Ñ ÑƒÑ‡ÐµÐ±Ð°, Ð²ÐµÑ€Ð½Ñ‹Ðµ Ð´Ñ€ÑƒÐ·ÑŒÑ" },
    { label: "2. Ð—Ð°Ð¼ÐµÑ‡Ð°ÐµÑ‚Ðµ Ð»Ð¸ ÑÑ‚Ñ€Ð°Ñ…Ð¸ Ð¸Ð»Ð¸ ÑÐ¾Ð¼Ð½ÐµÐ½Ð¸Ñ Ð² ÑÐ²Ð¾Ð¸Ñ… ÑÐ¸Ð»Ð°Ñ… Ñƒ Ñ€ÐµÐ±ÐµÐ½ÐºÐ°?", placeholder: "Ð˜Ð½Ð¾Ð³Ð´Ð° Ð±Ð¾Ð¸Ñ‚ÑÑ Ð¾Ñ‚Ð²ÐµÑ‡Ð°Ñ‚ÑŒ Ñƒ Ð´Ð¾ÑÐºÐ¸..." },
    { label: "3. Ð¥Ð¾Ñ‚Ð¸Ñ‚Ðµ Ð¿Ð¾ÑÐ¼Ð¾Ñ‚Ñ€ÐµÑ‚ÑŒ ÑƒÑ‚Ñ€ÐµÐ½Ð½Ð¸Ð¹ Ñ€Ð°ÑÑÐºÐ°Ð·-Ð½Ð°ÑÑ‚Ñ€Ð¾Ð¹ Ð½Ð° ÑƒÑÐ¿ÐµÑ…?", placeholder: "Ð”Ð°, Ñ…Ð¾Ñ‡Ñƒ Ð¿Ð¾Ð¿Ñ€Ð¾Ð±Ð¾Ð²Ð°Ñ‚ÑŒ" }
  ],
  expert: [
    { label: "1. ÐÐ°ÑÐºÐ¾Ð»ÑŒÐºÐ¾ Ð²Ð°Ð¼ Ð±Ð»Ð¸Ð·ÐºÐ° Ð¸Ð´ÐµÑ Ð˜Ð˜ + ÐšÐŸÐ¢ ÑÐºÐ¾ÑÐ¸ÑÑ‚ÐµÐ¼Ñ‹ Ð´Ð»Ñ ÑÐµÐ¼ÐµÐ¹?", placeholder: "ÐžÑ‡ÐµÐ½ÑŒ Ð¿Ð¾Ð´Ð´ÐµÑ€Ð¶Ð¸Ð²Ð°ÑŽ Ð¿Ñ€Ð¾ÐµÐºÑ‚" },
    { label: "2. Ð§ÐµÐ³Ð¾ Ð½Ðµ Ñ…Ð²Ð°Ñ‚Ð°ÐµÑ‚ ÑÐ¾Ð²Ñ€ÐµÐ¼ÐµÐ½Ð½Ñ‹Ð¼ ÑÐµÑ€Ð²Ð¸ÑÐ°Ð¼ Ð´Ð»Ñ Ñ€Ð¾Ð´Ð¸Ñ‚ÐµÐ»ÐµÐ¹?", placeholder: "ÐÐ°Ð¿Ñ€Ð¸Ð¼ÐµÑ€: ÐšÐ°Ñ‡ÐµÑÑ‚Ð²ÐµÐ½Ð½Ð¾Ð¹ Ð¿ÐµÑ€ÑÐ¾Ð½Ð°Ð»Ð¸Ð·Ð°Ñ†Ð¸Ð¸" },
    { label: "3. Ð“Ð¾Ñ‚Ð¾Ð²Ñ‹ Ð´Ð°Ñ‚ÑŒ ÑÐºÑÐ¿ÐµÑ€Ñ‚Ð½Ñ‹Ð¹ Ð¾Ñ‚Ð·Ñ‹Ð² Ð¿Ð¾ÑÐ»Ðµ Ñ‚ÐµÑÑ‚Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸Ñ?", placeholder: "Ð”Ð°, Ð³Ð¾Ñ‚Ð¾Ð²Ð° Ð½Ð°Ð¿Ð¸ÑÐ°Ñ‚ÑŒ Ð¾Ñ‚Ð·Ñ‹Ð²" }
  ]
};

function openCustDevModal() {
  document.getElementById('custdev-modal').classList.remove('hidden');
  selectCustDevScenario('burnout');
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

  const questions = CUSTDEV_SCENARIOS[scenarioKey] || CUSTDEV_SCENARIOS.burnout;
  const container = document.getElementById('custdev-q-container');
  container.innerHTML = '';

  questions.forEach((q, idx) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'custdev-q-item';
    qDiv.innerHTML = `
      <label>${q.label}</label>
      <input type="text" id="cd-input-${idx}" placeholder="${q.placeholder}" class="form-input">
    `;
    container.appendChild(qDiv);
  });
}

function handleCustDevSubmit(e) {
  e.preventDefault();
  const answers = [];
  const questions = CUSTDEV_SCENARIOS[appState.currentCustDevScenario] || [];

  questions.forEach((q, idx) => {
    const val = document.getElementById(`cd-input-${idx}`)?.value || '';
    answers.push(`${q.label}: ${val}`);
  });

  alert("ðŸŽ‰ Ð¡Ð¿Ð°ÑÐ¸Ð±Ð¾ Ð·Ð° Ð²Ð°ÑˆÐ¸ Ð¾Ñ‚Ð²ÐµÑ‚Ñ‹! ÐžÑ‚Ð²ÐµÑ‚Ñ‹ Ð·Ð°Ð¿Ð¸ÑÐ°Ð½Ñ‹. Ð’Ð°Ð¼ Ð¿Ñ€ÐµÐ´Ð¾ÑÑ‚Ð°Ð²Ð»ÐµÐ½ Ð¿Ñ€Ð¸Ð¾Ñ€Ð¸Ñ‚ÐµÑ‚Ð½Ñ‹Ð¹ VIP-Ð´Ð¾ÑÑ‚ÑƒÐ¿.");
  closeCustDevModal();

  logClickAnalytics('CustDev_Submitted', appState.currentCustDevScenario, 0, {
    custdev_answers: answers.join(" | ")
  });
}

// Pricing Toggle (Monthly vs Annual)
function toggleBillingCycle() {
  const isAnnual = document.getElementById('billing-switch').checked;
  appState.isAnnualBilling = isAnnual;

  const basicPrice   = document.querySelector('.price-basic');
  const premiumPrice = document.querySelector('.price-premium');
  const platinumPrice= document.querySelector('.price-platinum');

  const basicAnnualSub   = document.querySelector('.price-basic-annual');
  const premiumAnnualSub = document.querySelector('.price-premium-annual');
  const platinumAnnualSub= document.querySelector('.price-platinum-annual');

  const monthLabel = document.getElementById('label-monthly');
  const annualLabel = document.getElementById('label-annual');

  if (isAnnual) {
    if (basicPrice)    basicPrice.innerHTML   = "$29.99 <span>/ Ð³Ð¾Ð´</span>";
    if (premiumPrice)  premiumPrice.innerHTML = "$59.99 <span>/ Ð³Ð¾Ð´</span>";
    if (platinumPrice) platinumPrice.innerHTML= "$99.99 <span>/ Ð³Ð¾Ð´</span>";
    if (basicAnnualSub)    basicAnnualSub.classList.remove('hidden');
    if (premiumAnnualSub)  premiumAnnualSub.classList.remove('hidden');
    if (platinumAnnualSub) platinumAnnualSub.classList.remove('hidden');
    if (monthLabel)  monthLabel.classList.remove('active');
    if (annualLabel) annualLabel.classList.add('active');
  } else {
    if (basicPrice)    basicPrice.innerHTML   = "$7 <span>/ Ð¼ÐµÑÑÑ†</span>";
    if (premiumPrice)  premiumPrice.innerHTML = "$14.99 <span>/ Ð¼ÐµÑÑÑ†</span>";
    if (platinumPrice) platinumPrice.innerHTML= "$24.99 <span>/ Ð¼ÐµÑÑÑ†</span>";
    if (basicAnnualSub)    basicAnnualSub.classList.add('hidden');
    if (premiumAnnualSub)  premiumAnnualSub.classList.add('hidden');
    if (platinumAnnualSub) platinumAnnualSub.classList.add('hidden');
    if (monthLabel)  monthLabel.classList.add('active');
    if (annualLabel) annualLabel.classList.remove('active');
  }

  logClickAnalytics('BillingCycle_Toggled', isAnnual ? 'Annual' : 'Monthly', 0);
}

// Plan Selection & Checkout Modal
function selectPlan(planName, price) {
  appState.selectedPlan = planName;
  appState.selectedPrice = price;

  logClickAnalytics('TariffButton_Click', planName, price);

  if (!localStorage.getItem('ndaSigned')) {
    appState.pendingCheckout = true;
    openNDAModal();
  } else {
    if (price === 0) {
      openAuthModal('free');
    } else {
      document.getElementById('checkout-plan-name').innerText = planName;
      document.getElementById('checkout-plan-price').innerText = `$${price}`;
      document.getElementById('checkout-modal').classList.remove('hidden');
    }
  }
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').classList.add('hidden');
}

function handlePaymentSubmit(e) {
  e.preventDefault();
  alert(`ðŸŽ‰ ÐŸÐ¾Ð´Ð¿Ð¸ÑÐºÐ° "${appState.selectedPlan}" ÑƒÑÐ¿ÐµÑˆÐ½Ð¾ Ð°ÐºÑ‚Ð¸Ð²Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð°! Ð”Ð¾Ð±Ñ€Ð¾ Ð¿Ð¾Ð¶Ð°Ð»Ð¾Ð²Ð°Ñ‚ÑŒ Ð² ÑÐºÐ¾ÑÐ¸ÑÑ‚ÐµÐ¼Ñƒ MindEcho AI.`);
  closeCheckoutModal();
  logClickAnalytics('Payment_Completed', appState.selectedPlan, appState.selectedPrice);
}

// Auth Modal Handlers
function openAuthModal(type = 'login') {
  document.getElementById('auth-modal').classList.remove('hidden');
  logClickAnalytics('AuthModal_Opened', type, 0);
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
}

function simulateSocialAuth(provider) {
  const userId = 'USER-' + Math.floor(100000 + Math.random() * 900000);
  const sampleName = provider === 'Google' ? 'Google User' : 'Apple User';
  const sampleEmail = provider.toLowerCase() + '_user@mindecho.ai';

  alert(`ðŸŽ‰ Ð’Ñ…Ð¾Ð´ Ñ‡ÐµÑ€ÐµÐ· ${provider} Ð²Ñ‹Ð¿Ð¾Ð»Ð½ÐµÐ½ ÑƒÑÐ¿ÐµÑˆÐ½Ð¾!\nÐ’Ð°Ñˆ ID: ${userId}`);
  closeAuthModal();

  logClickAnalytics('Social_Registration', provider, 0, {
    user_id: userId,
    user_name: sampleName,
    email: sampleEmail,
    phone: 'ÐÐµ ÑƒÐºÐ°Ð·Ð°Ð½',
    address: 'ÐžÐ±Ð»Ð°Ñ‡Ð½Ñ‹Ð¹ Ð¿Ñ€Ð¾Ñ„Ð¸Ð»ÑŒ ' + provider,
    auth_provider: provider
  });
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const userId = 'USER-' + Math.floor(100000 + Math.random() * 900000);
  const name = document.getElementById('auth-name').value || 'ÐÐ½Ð¾Ð½Ð¸Ð¼Ð½Ñ‹Ð¹ Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÑŒ';
  const email = document.getElementById('auth-email').value;
  localStorage.setItem('userEmail', email);
  const phone = document.getElementById('auth-phone').value || 'ÐÐµ ÑƒÐºÐ°Ð·Ð°Ð½';
  const address = document.getElementById('auth-address').value || 'ÐÐµ ÑƒÐºÐ°Ð·Ð°Ð½';

  alert(`ðŸŽ‰ Ð¡Ð¿Ð°ÑÐ¸Ð±Ð¾, ${name}! ÐÐºÐºÐ°ÑƒÐ½Ñ‚ Ð·Ð°Ñ€ÐµÐ³Ð¸ÑÑ‚Ñ€Ð¸Ñ€Ð¾Ð²Ð°Ð½.\nÐ’Ð°Ñˆ ID: ${userId}`);
  closeAuthModal();

  logClickAnalytics('Email_Registration', 'Email Form', 0, {
    user_id: userId,
    user_name: name,
    email: email,
    phone: phone,
    address: address,
    auth_provider: 'Email/Phone Form'
  });
}

// Google Sheets Webhook Click & Onboarding Logger
// â”€â”€â”€ Core Analytics Logger (v2 â€” 16 fields) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function logClickAnalytics(eventType, planName, priceAmount, extraData = {}) {
  if (isAdminDevice) {
    console.log('🛡️ Admin Action Ignored:', eventType);
    return;
  }
  const storedEmail = localStorage.getItem('userEmail');
  if (storedEmail === 'get777903@gmail.com' || extraData.email === 'get777903@gmail.com') {
    return; // Ignore activity from admin account
  }
  const timeOnPage = Math.round((Date.now() - analyticsState.pageStartTime) / 1000);
  const referrer = document.referrer
    ? (document.referrer.includes('instagram') ? 'Instagram'
      : document.referrer.includes('google') ? 'Google'
      : document.referrer.includes('facebook') ? 'Facebook'
      : document.referrer.includes('telegram') ? 'Telegram'
      : document.referrer)
    : 'direct';
  const ua = navigator.userAgent;
  const deviceType = /Mobile|Android|iPhone/i.test(ua) ? 'mobile'
    : /iPad|Tablet/i.test(ua) ? 'tablet' : 'desktop';

  const payload = {
    timestamp:      new Date().toLocaleString('ru-RU'),
    event_type:     eventType,
    session_id:     SESSION_ID,
    user_name:      extraData.user_name  || '-',
    email:          extraData.email      || '-',
    phone:          extraData.phone      || '-',
    plan_name:      planName             || '-',
    price:          priceAmount          || 0,
    language:       appState.lang        || 'ru',
    device_type:    deviceType,
    referrer:       referrer,
    page_section:   extraData.section    || detectSection(),
    scroll_depth:   analyticsState.maxScrollDepth,
    time_on_page:   timeOnPage,
    child_name:     extraData.child_name || '-',
    payment_intent: extraData.payment_intent || false,
    user_agent:     ua
  };

  console.log('ðŸ“Š [MindEcho Analytics 111]', eventType, payload);

  try {
    fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.warn('Google Sheets Webhook notice:', err));
  } catch (err) {
    console.warn('Analytics fetch error:', err);
  }

  // --- FIREBASE PUSH ---
  if (window.db) {
    window.db.collection("analytics").add(payload).catch(err => console.error("FB err", err));
  }
}

// Detect which section of page user is viewing
function detectSection() {
  const sections = ['pricing', 'generator', 'modes', 'mission', 'nda', 'custdev'];
  const scrollY = window.scrollY + window.innerHeight / 2;
  for (const id of sections) {
    const el = document.getElementById(id);
    if (el && scrollY >= el.offsetTop && scrollY < el.offsetTop + el.offsetHeight) return id;
  }
  return 'hero';
}

// â”€â”€â”€ Full Scroll & Time Tracking Init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initAnalyticsTracking() {
  // Page View on load
  logClickAnalytics('Page_View', '-', 0, { section: 'hero' });

  // Scroll depth tracking (max % reached)
  window.addEventListener('scroll', function() {
    const scrolled = window.scrollY;
    const total = document.body.scrollHeight - window.innerHeight;
    const pct = total > 0 ? Math.round((scrolled / total) * 100) : 0;
    if (pct > analyticsState.maxScrollDepth) {
      analyticsState.maxScrollDepth = pct;
    }

    // Pricing section visibility
    const pricingEl = document.getElementById('pricing');
    if (pricingEl && !analyticsState.pricingViewed) {
      const rect = pricingEl.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.75) {
        analyticsState.pricingViewed = true;
        logClickAnalytics('Pricing_Viewed', '-', 0, { section: 'pricing' });
      }
    }
  }, { passive: true });

  // Time engagement milestones
  [30, 60, 120].forEach(function(secs) {
    setTimeout(function() {
      if (!analyticsState.engagedTimers[secs]) {
        analyticsState.engagedTimers[secs] = true;
        logClickAnalytics('Engaged_' + secs + 's', '-', 0);
      }
    }, secs * 1000);
  });

  // Track Play button click
  const playBtn = document.getElementById('play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', function() {
      logClickAnalytics('Play_Click', '-', 0, { section: 'generator' });
    });
  }

  // Track Buy buttons
  document.querySelectorAll('[onclick*="selectPlan"], [onclick*="TariffButton"]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const text = btn.innerText || '';
      const ev = text.includes('Basic') ? 'Buy_Basic_Click'
        : text.includes('Pro') ? 'Buy_Pro_Click'
        : 'Buy_Premium_Click';
      logClickAnalytics(ev, text.trim(), 0, { section: 'pricing', payment_intent: true });
    });
  });
}

// Register PWA Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('ðŸ“± [PWA 111] Service Worker registered'))
      .catch(err => console.log('PWA SW registration failed:', err));
  }
}

