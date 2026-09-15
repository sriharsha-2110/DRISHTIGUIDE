class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.isMuted = false;
    this.lastSpokenText = '';
    this.speechRate = 1.0;
    this.speechPitch = 1.0;
  }

  speak(text, isCritical = false) {
    if (!text || this.isMuted || !this.synth) return;

    this.lastSpokenText = text;

    // If critical alert, cancel ongoing speech immediately!
    if (isCritical && this.synth.speaking) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = isCritical ? 1.15 : this.speechRate;
    utterance.pitch = isCritical ? 1.1 : this.speechPitch;

    // Try selecting clear English voice if available
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) ||
                           voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    this.synth.speak(utterance);
  }

  repeatLast() {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText, true);
    } else {
      this.speak("No recent guidance to repeat.");
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
