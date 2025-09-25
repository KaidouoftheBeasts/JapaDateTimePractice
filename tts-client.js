// Cliente TTS para comunicación con el servidor eSpeak NG
class TTSClient {
    constructor() {
        // Usar la IP de tu servidor - IMPORTANTE cambiar por tu IP real
        this.serverBaseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : 'http://TU_IP_DEL_SERVIDOR:3000';
            
        this.isAvailable = false;
        this.availableVoices = ['japanese'];
    }

    // Inicializar cliente
    async initialize() {
        try {
            console.log('🔍 Inicializando cliente TTS...');
            const response = await fetch(`${this.serverBaseUrl}/api/health`);
            
            if (!response.ok) throw new Error('Servidor no responde');
            
            const data = await response.json();
            this.isAvailable = data.eSpeakNG;
            
            if (this.isAvailable) {
                await this.loadVoices();
                console.log('✅ Cliente TTS inicializado con servidor');
            } else {
                console.log('⚠️ Usando fallback local');
            }
            
            return this.isAvailable;
        } catch (error) {
            console.log('❌ Servidor TTS no disponible, usando fallback local:', error.message);
            this.isAvailable = false;
            return false;
        }
    }

    // Cargar voces disponibles
    async loadVoices() {
        try {
            const response = await fetch(`${this.serverBaseUrl}/api/voices`);
            const data = await response.json();
            this.availableVoices = data.voices;
            return this.availableVoices;
        } catch (error) {
            console.log('Error cargando voces:', error);
            this.availableVoices = ['japanese'];
            return this.availableVoices;
        }
    }

    // Sintetizar texto a audio
    async speak(text, options = {}) {
        if (!text || text.trim().length === 0) {
            throw new Error('Texto vacío');
        }

        // Intentar con servidor primero
        if (this.isAvailable) {
            try {
                return await this.speakServer(text, options);
            } catch (error) {
                console.log('Fallback a síntesis local:', error);
                this.isAvailable = false;
            }
        }

        // Fallback a síntesis local del navegador
        return this.speakLocal(text);
    }

    // Usar servidor TTS
    async speakServer(text, options = {}) {
        const { voice = 'japanese', speed = 160, pitch = 50 } = options;
        
        const response = await fetch(`${this.serverBaseUrl}/api/tts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                voice: voice,
                speed: speed,
                pitch: pitch
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Error del servidor TTS');
        }

        // Reproducir audio
        await this.playAudio(data.audioUrl);
        return true;
    }

    // Síntesis local del navegador
    async speakLocal(text) {
        return new Promise((resolve, reject) => {
            if (!('speechSynthesis' in window)) {
                reject(new Error('Speech Synthesis no soportado'));
                return;
            }

            // Cancelar cualquier síntesis previa
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            utterance.onend = () => {
                console.log('✅ Audio local completado');
                resolve(true);
            };

            utterance.onerror = (event) => {
                console.error('❌ Error síntesis local:', event);
                reject(new Error('Error en síntesis de voz'));
            };

            // Forzar voz japonesa si está disponible
            const voices = window.speechSynthesis.getVoices();
            const japaneseVoice = voices.find(v => v.lang.startsWith('ja'));
            if (japaneseVoice) {
                utterance.voice = japaneseVoice;
            }

            window.speechSynthesis.speak(utterance);
        });
    }

    // Reproducir audio desde URL
    async playAudio(audioUrl) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(audioUrl);
            
            audio.onended = () => {
                console.log('✅ Audio del servidor completado');
                resolve(true);
            };
            
            audio.onerror = (error) => {
                console.error('❌ Error reproduciendo audio:', error);
                reject(new Error('Error reproduciendo audio'));
            };

            // Intentar reproducir
            audio.play().catch(error => {
                console.error('Error al iniciar reproducción:', error);
                reject(error);
            });
        });
    }

    // Verificar si hay soporte de audio
    isAudioSupported() {
        return typeof Audio !== 'undefined';
    }

    // Obtener estado
    getStatus() {
        return {
            available: this.isAvailable,
            voices: this.availableVoices,
            server: this.serverBaseUrl
        };
    }
}

// Instancia global
window.ttsClient = new TTSClient();