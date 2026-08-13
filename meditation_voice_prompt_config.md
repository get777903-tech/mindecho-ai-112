# 📜 СПЕЦИФИКАЦИЯ ПРОМПТА И НАСТРОЕК ГОЛОСА (MindEcho AI 2026)

## [SYSTEM CONFIGURATION & VOICE PARAMS]

* **ELEVENLABS_STABILITY**: `0.60` (strictly set to 0.60 for optimal smooth pacing)
* **ELEVENLABS_SPEED**: `0.70` (strictly slow bedtime pace)
* **ELEVENLABS_SIMILARITY_BOOST**: `0.80`
* **ELEVENLABS_STYLE**: `0.00`
* **ELEVENLABS_MODEL**: `eleven_multilingual_v2`
* **PITCH_SHIFT**: `Pitch Shift (-3 Semitones) for deep soothing parent voice tone`
* **TEXT_FORMATTING_RULE**: `Разделение фраз на отдельные строки (\n\n) + Добавление знака тире (—), запятых (,) и многоточий (...) для понижения интонации и задержки`
* **VOICE_SOURCE**: `Родительский голос из аудиозаписи в приложении (Speech-to-Speech / Клонированный голос с микрофона/файла пользователя)`
* **DEFAULT_DEMO_TRACK**: `audio/meditation1.mp3` (for all standard demo play buttons)
* **GENERATED_TRACK_BTN**: `«▶️ Слушать сказку-медитацию, сгенерированную заданным голосом»`

---

## ⚠️ ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА ГЕНЕРАЦИИ (RULES & MANDATES)

1. **STABILITY_RULE**:
   > Use `ELEVENLABS_STABILITY = 0.60` to guarantee consistent cadence and eliminate early phrase rushing.

2. **INTONATION_LOWERING_RULE**:
   > Insert em-dashes (`—`), commas (`,`), and ellipses (`...`) before pause breaks to lower vocal pitch and elongate vowel articulation.

3. **LINE_SEPARATION_RULE**:
   > Format every sentence on its own separate line with double newlines (`\n\n`) to ensure individual phrase breath processing.

4. **VOICE_SOURCE_RULE**:
   > Parent voice MUST BE TAKEN DIRECTLY from the audio recording recorded or uploaded by the parent in the application (`parent_recorded_voice.webm` / `appState.recordedAudioBlob`) and sent via Speech-to-Speech / Instant Voice Cloning (`POST /v1/voices/add`).
