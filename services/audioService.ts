type SoundEffect = 'correct' | 'incorrect' | 'powerup' | 'skip' | 'hint' | 'complete';

class AudioService {
    private sounds: { [key in SoundEffect]?: HTMLAudioElement } = {};
    private _isMuted = false;

    constructor() {
        if (typeof window !== 'undefined') {
            this.sounds = {
                correct: new Audio('https://actions.google.com/sounds/v1/positive/success.ogg'),
                incorrect: new Audio('https://actions.google.com/sounds/v1/negative/failure.ogg'),
                powerup: new Audio('https://actions.google.com/sounds/v1/ui/ui_tap_positive.ogg'),
                skip: new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_2486a11e40.mp3'),
                hint: new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_c36345388a.mp3'),
                complete: new Audio('https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg'),
            };
            
            Object.values(this.sounds).forEach(sound => {
                if(sound) {
                    sound.load();
                }
            });
        }
        try {
            const storedMuteState = localStorage.getItem('isMuted');
            this._isMuted = storedMuteState ? JSON.parse(storedMuteState) : false;
        } catch (e) {
            this._isMuted = false;
        }
    }

    get isMuted(): boolean {
        return this._isMuted;
    }

    public playSound(soundName: SoundEffect) {
        if (!this._isMuted && this.sounds[soundName]) {
            const sound = this.sounds[soundName]!;
            sound.currentTime = 0;
            sound.play().catch(error => console.error(`Could not play sound: ${soundName}`, error));
        }
    }

    public toggleMute(): boolean {
        this._isMuted = !this._isMuted;
        try {
            localStorage.setItem('isMuted', JSON.stringify(this._isMuted));
        } catch (e) {
            // Ignore storage errors
        }
        return this._isMuted;
    }
}

export const audioService = new AudioService();