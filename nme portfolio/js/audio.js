/**
 * The Gupta Age - Procedural Web Audio Engine
 * Generates meditative ancient Indian temple soundscapes:
 * - Tanpura acoustic drone with rich harmonics and slow cyclical phasing
 * - Resonant singing bowl / temple bell chimes on interactions
 * - Atmospheric wind whispers
 * 100% synthesized via Web Audio API (zero external audio file dependencies)
 */

class SoundscapeEngine {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.masterGain = null;
        this.droneGain = null;
        this.oscillators = [];
        this.lfo = null;
        this.isMuted = true;
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        this.droneGain.connect(this.masterGain);
    }

    startDrone() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        // Indian Tanpura tuning: Pa - Sa - Sa - Sa (D3, G3, G3, G2 base frequency ~ 146.83 Hz)
        const fundamental = 146.83; // D3
        const freqs = [
            fundamental * 0.75, // A2 (Pa)
            fundamental,        // D3 (Sa)
            fundamental * 1.002, // D3 slightly detuned for organic beating
            fundamental * 2.0,  // D4 (high Sa)
            fundamental * 1.498 // A3 (Pa high)
        ];

        this.oscillators = [];

        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            // Rich warm low-pass filter
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450 + (idx * 120), this.ctx.currentTime);
            filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

            // Subtle amplitude modulation for meditative drone breathing
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.setValueAtTime(0.08 + (idx * 0.03), this.ctx.currentTime);
            lfoGain.gain.setValueAtTime(0.025, this.ctx.currentTime);
            lfo.connect(gain.gain);
            lfo.start();

            gain.gain.setValueAtTime(0.04 / (idx + 1), this.ctx.currentTime);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.droneGain);

            osc.start();
            this.oscillators.push({ osc, lfo, gain, filter });
        });

        // Atmospheric noise (wind / temple breeze)
        this.createTempleBreeze();

        this.isPlaying = true;
        this.isMuted = false;
        this.masterGain.gain.exponentialRampToValueAtTime(0.8, this.ctx.currentTime + 3);
    }

    createTempleBreeze() {
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(300, this.ctx.currentTime);
        bandpass.Q.setValueAtTime(1.8, this.ctx.currentTime);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.012, this.ctx.currentTime);

        whiteNoise.connect(bandpass);
        bandpass.connect(noiseGain);
        noiseGain.connect(this.droneGain);

        whiteNoise.start();
        this.breezeNode = { whiteNoise, bandpass, noiseGain };
    }

    playTempleBell(freq = 587.33) { // D5 chime
        if (!this.ctx || this.isMuted) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2.76, now); // Metallic overtone

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(250, now);

        bellGain.gain.setValueAtTime(0.0001, now);
        bellGain.gain.linearRampToValueAtTime(0.18, now + 0.02);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(bellGain);
        bellGain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 4.6);
        osc2.stop(now + 4.6);
    }

    playCoinChime() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // High crystal chime of pure gold coin
        const coinFreqs = [1760, 2093, 2349, 2637];
        const f = coinFreqs[Math.floor(Math.random() * coinFreqs.length)];

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.75);
    }

    toggle() {
        if (!this.ctx) {
            this.init();
            this.startDrone();
            return true;
        }

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        if (this.isMuted) {
            this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.masterGain.gain.linearRampToValueAtTime(0.8, this.ctx.currentTime + 1);
            this.isMuted = false;
            this.playTempleBell(659.25);
            return true;
        } else {
            this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
            this.isMuted = true;
            return false;
        }
    }
}

window.soundEngine = new SoundscapeEngine();
