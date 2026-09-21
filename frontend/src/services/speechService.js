class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.isMuted = false;
    this.lastSpokenText = '';
    this.speechRate = 1.0;
    this.speechVolume = 1.0;
    this.vibrationEnabled = true;
    this.currentLangCode = 'en-US';
  }

  setSettings({ rate, volume, vibration, langCode }) {
    if (rate !== undefined) this.speechRate = rate;
    if (volume !== undefined) this.speechVolume = volume;
    if (vibration !== undefined) this.vibrationEnabled = vibration;
    if (langCode !== undefined) this.currentLangCode = langCode;
  }

  triggerVibration(pattern = [80]) {
    if (this.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignored if unsupported on desktop
      }
    }
  }

  speak(text, langCode = null, isCritical = false) {
    if (!text || this.isMuted || !this.synth) return;

    this.lastSpokenText = text;
    const targetLang = langCode || this.currentLangCode;

    if (isCritical && this.synth.speaking) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = isCritical ? 1.15 : this.speechRate;
    utterance.volume = this.speechVolume;
    utterance.lang = targetLang;

    // Try selecting best matching voice for target language
    const voices = this.synth.getVoices();
    const matchingVoice = voices.find(v => v.lang === targetLang || v.lang.startsWith(targetLang.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    this.synth.speak(utterance);
  }

  repeatLast(langCode = null) {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText, langCode, true);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
    return this.isMuted;
  }

  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }
}

export const speechService = new SpeechService();
