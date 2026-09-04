class AlarmAudioService {
  private audioCtx: AudioContext | null = null;
  private oscNode: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private sirenInterval: any = null;
  private isPlaying: boolean = false;

  /**
   * Synthesize a penetrating warbling biohazard alarm siren using HTML5 Web Audio API
   * Zero external assets, zero network calls, 100% offline.
   */
  playBiohazardSiren(): () => void {
    if (this.isPlaying) return () => this.stopBiohazardSiren();

    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported on this platform.');
        return () => {};
      }

      this.audioCtx = new AudioContextClass();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.15, this.audioCtx.currentTime); // Safe, audible volume
      this.gainNode.connect(this.audioCtx.destination);

      this.oscNode = this.audioCtx.createOscillator();
      this.oscNode.type = 'triangle';
      this.oscNode.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      this.oscNode.connect(this.gainNode);
      this.oscNode.start();
      this.isPlaying = true;

      // Warble pitch between 440 Hz and 880 Hz every 350ms
      let high = false;
      this.sirenInterval = setInterval(() => {
        if (!this.audioCtx || !this.oscNode) return;
        const targetFreq = high ? 440 : 880;
        this.oscNode.frequency.exponentialRampToValueAtTime(
          targetFreq,
          this.audioCtx.currentTime + 0.3
        );
        high = !high;
      }, 350);
    } catch (err) {
      console.warn('AudioContext failed to initialize:', err);
    }

    return () => this.stopBiohazardSiren();
  }

  stopBiohazardSiren(): void {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }

    try {
      if (this.oscNode) {
        this.oscNode.stop();
        this.oscNode.disconnect();
        this.oscNode = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
      if (this.audioCtx && this.audioCtx.state !== 'closed') {
        this.audioCtx.close();
        this.audioCtx = null;
      }
    } catch (err) {
      console.warn('Error stopping Web Audio siren:', err);
    } finally {
      this.isPlaying = false;
    }
  }

  /**
   * Speak emergency Marathi biohazard warning aloud via offline Web Speech Synthesis
   */
  speakMarathiWarning(
    customText: string = 'सावधान! मृत जनावराचे शव कापू नका. हवेत ॲन्थ्रॅक्सचे बीजाणू पसरण्याचा गंभीर धोका आहे. त्वरित पशुवैद्यकीय अधिकाऱ्यांशी संपर्क साधा.'
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis API not available in this environment.');
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(customText);
      utterance.rate = 0.88; // Deliberate and clear in loud barn environments
      utterance.pitch = 1.0;

      // Locate Marathi (mr-IN), Hindi (hi-IN), or default Indian English voice
      const voices = window.speechSynthesis.getVoices();
      const marathiVoice = voices.find(
        (v) => v.lang.startsWith('mr') || v.lang === 'mr-IN'
      );
      const hindiVoice = voices.find(
        (v) => v.lang.startsWith('hi') || v.lang === 'hi-IN'
      );
      const indianVoice = voices.find((v) => v.lang.includes('IN'));

      if (marathiVoice) {
        utterance.voice = marathiVoice;
        utterance.lang = 'mr-IN';
      } else if (hindiVoice) {
        utterance.voice = hindiVoice;
        utterance.lang = 'hi-IN';
      } else if (indianVoice) {
        utterance.voice = indianVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis invocation failed:', err);
    }
  }

  stopSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const alarmAudioService = new AlarmAudioService();
