const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 3000;
const AUDIO_DIR = '/app/audio-cache';

// Crear directorio de audio si no existe
if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/audio', express.static(AUDIO_DIR));

// Middleware de log
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Verificar eSpeak NG al iniciar
console.log('🔍 Verificando eSpeak NG...');
exec('espeak-ng --version', (error, stdout) => {
    if (error) {
        console.error('❌ eSpeak NG no está disponible:', error);
    } else {
        console.log('✅ eSpeak NG disponible:', stdout.trim());
    }
});

// API para generar audio
app.post('/api/tts', async (req, res) => {
    try {
        const { text, voice = 'japanese', speed = 160, pitch = 50 } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Texto requerido' 
            });
        }

        // Limitar longitud del texto
        const cleanText = text.trim().substring(0, 300);
        
        // Hash para cache
        const crypto = require('crypto');
        const textHash = crypto.createHash('md5').update(cleanText + voice + speed + pitch).digest('hex');
        const audioFileName = `${textHash}.wav`;
        const audioFilePath = path.join(AUDIO_DIR, audioFileName);
        const audioUrl = `http://localhost:3000/audio/${audioFileName}`;

        // Verificar cache
        if (fs.existsSync(audioFilePath)) {
            console.log('🎵 Audio desde cache:', cleanText.substring(0, 50) + '...');
            return res.json({ 
                success: true, 
                audioUrl: audioUrl.replace('localhost', req.hostname),
                cached: true
            });
        }

        // Generar nuevo audio
        console.log('🔊 Generando audio:', cleanText.substring(0, 50) + '...');
        await generateAudio(cleanText, audioFilePath, voice, speed, pitch);

        if (fs.existsSync(audioFilePath)) {
            const stats = fs.statSync(audioFilePath);
            console.log('✅ Audio generado:', stats.size + ' bytes');
            
            res.json({ 
                success: true, 
                audioUrl: audioUrl.replace('localhost', req.hostname),
                cached: false,
                size: stats.size
            });
        } else {
            throw new Error('No se pudo generar el archivo de audio');
        }

    } catch (error) {
        console.error('❌ Error en TTS:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
});

// Función para generar audio con eSpeak NG
function generateAudio(text, outputPath, voice, speed, pitch) {
    return new Promise((resolve, reject) => {
        // Escapar texto para shell
        const safeText = text.replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/\$/g, "\\$");
        
        const command = `espeak-ng -v${voice} -s${speed} -p${pitch} -a 100 --stdout "${safeText}" > "${outputPath}"`;

        exec(command, { timeout: 15000 }, (error, stdout, stderr) => {
            if (error) {
                console.error('Error eSpeak NG:', error);
                // Intentar con voz por defecto
                const fallbackCommand = `espeak-ng -vjapanese -s${speed} --stdout "${safeText}" > "${outputPath}"`;
                
                exec(fallbackCommand, { timeout: 15000 }, (fallbackError) => {
                    if (fallbackError) {
                        reject(fallbackError);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    });
}

// Endpoint para verificar voces
app.get('/api/voices', (req, res) => {
    exec('espeak-ng --voices', (error, stdout) => {
        if (error) {
            res.json({ 
                voices: ['japanese', 'kyoko', 'otoya'],
                default: 'japanese'
            });
        } else {
            const voices = stdout.split('\n')
                .filter(line => line.includes('japanese') || line.includes('jp'))
                .map(line => {
                    const parts = line.split(/\s+/);
                    return parts[1] || 'japanese';
                })
                .filter(voice => voice && voice.length > 0);
            
            res.json({ 
                voices: voices.length > 0 ? voices : ['japanese'],
                default: voices[0] || 'japanese'
            });
        }
    });
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
    exec('espeak-ng --version', (error) => {
        res.json({ 
            status: error ? 'degraded' : 'healthy',
            service: 'Japanese TTS Server',
            eSpeakNG: !error,
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });
});

// Servir archivos de audio
app.get('/audio/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(AUDIO_DIR, filename);
    
    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 1 día
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'Audio no encontrado' });
    }
});

// Manejo de errores
app.use((error, req, res, next) => {
    console.error('Error no manejado:', error);
    res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
    });
});

console.log(`🚀 Servidor TTS iniciado en http://0.0.0.0:${PORT}`);
app.listen(PORT, '0.0.0.0');