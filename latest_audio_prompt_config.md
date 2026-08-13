# 📜 ФАЙЛ 1: ПОЛНЫЙ ПРОМПТ И НАСТРОЙКИ СИНТЕЗА ELEVENLABS

## [SYSTEM CONFIGURATION & VOICE PARAMS]

* **ELEVENLABS_STABILITY**: `0.60` (strictly set to 0.60 for optimal smooth pacing)
* **ELEVENLABS_SPEED**: `0.70` (strictly 0.70 minimum allowed speed)
* **ELEVENLABS_SIMILARITY_BOOST**: `0.80`
* **ELEVENLABS_STYLE**: `0.00`
* **ELEVENLABS_MODEL**: `eleven_multilingual_v2`
* **PITCH_SHIFT**: `Pitch Shift (-3 Semitones) for deep soothing parent voice tone`
* **TEXT_FORMATTING_RULE**: `Разделение фраз на отдельные строки (\n\n) + Добавление знака тире (—), запятых (,) и многоточий (...) для понижения интонации и задержки`
* **VOICE_SOURCE**: `Родительский голос из аудиозаписи в приложении (Speech-to-Speech / Клонированный голос с микрофона/файла пользователя)`
* **DEFAULT_DEMO_TRACK**: `audio/meditation1.mp3` (for all standard demo play buttons)
* **GENERATED_TRACK_BTN**: `«▶️ Слушать сказку-медитацию, сгенерированную заданным голосом»`
