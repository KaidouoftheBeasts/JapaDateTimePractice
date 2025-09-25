// Variables globales
let voices = [], japaneseVoices = [], voicesLoaded = false, currentMode = 'datetime';

// Detectar dispositivo móvil
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isChromeMobile = /Chrome\/[.0-9]* Mobile/i.test(navigator.userAgent);

// Función mejorada para cargar voces
const loadVoices = () => {
    return new Promise((resolve) => {
        voices = speechSynthesis.getVoices();
        
        if (voices.length > 0) {
            japaneseVoices = voices.filter(voice => 
                voice.lang.startsWith('ja') || voice.lang.includes('JP') || 
                voice.name.toLowerCase().includes('japan') || voice.name.toLowerCase().includes('japanese')
            );
            resolve(japaneseVoices);
        } else {
            // En Android, a veces hay que esperar más tiempo
            if (isMobile) {
                setTimeout(() => {
                    voices = speechSynthesis.getVoices();
                    japaneseVoices = voices.filter(voice => 
                        voice.lang.startsWith('ja') || voice.lang.includes('JP') || 
                        voice.name.toLowerCase().includes('japan') || voice.name.toLowerCase().includes('japanese')
                    );
                    resolve(japaneseVoices);
                }, 2000); // Esperar 2 segundos en móvil
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    voices = speechSynthesis.getVoices();
                    japaneseVoices = voices.filter(voice => 
                        voice.lang.startsWith('ja') || voice.lang.includes('JP') || 
                        voice.name.toLowerCase().includes('japan') || voice.name.toLowerCase().includes('japanese')
                    );
                    resolve(japaneseVoices);
                };
            }
        }
    });
};

// Función para formatear fecha y hora en japonés
const formatJapaneseDateTime = (date, mode) => {
    const year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    const weekday = date.getDay(), hours = date.getHours(), minutes = date.getMinutes();
    
    const period = hours >= 12 ? amPm.pm : amPm.am;
    const displayHours = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
    
    const yearJ = convertNumberToJapanese(year, 'year');
    const monthJ = months[month];
    const dayJ = convertNumberToJapanese(day, 'day');
    const hoursJ = convertNumberToJapanese(displayHours, 'hours');
    const minutesJ = convertNumberToJapanese(minutes, 'minutes');
    const weekdayJ = weekdays[weekday];
    
    let romaji = "", kanji = "", hiragana = "", speechText = "";
    
    switch(mode) {
        case 'datetime':
            romaji = `${yearJ.romaji}nen ${monthJ.romaji} ${dayJ.romaji} (${weekdayJ.romaji}) ${period.romaji} ${hoursJ.romaji}ji ${minutesJ.romaji}`;
            kanji = `${yearJ.kanji}年${monthJ.kanji}${dayJ.kanji}（${weekdayJ.kanji}）${period.kanji}${hoursJ.kanji}時${minutesJ.kanji}`;
            hiragana = `${yearJ.hiragana}ねん ${monthJ.hiragana} ${dayJ.hiragana}（${weekdayJ.hiragana}）${period.hiragana}${hoursJ.hiragana}じ${minutesJ.hiragana}`;
            speechText = `${yearJ.romaji}ねん ${monthJ.romaji} ${dayJ.romaji}、${weekdayJ.romaji}、${period.romaji} ${hoursJ.romaji}じ${minutes > 0 ? ` ${minutesJ.romaji}` : ''}`;
            break;
        case 'date':
            romaji = `${yearJ.romaji}nen ${monthJ.romaji} ${dayJ.romaji} (${weekdayJ.romaji})`;
            kanji = `${yearJ.kanji}年${monthJ.kanji}${dayJ.kanji}（${weekdayJ.kanji}）`;
            hiragana = `${yearJ.hiragana}ねん ${monthJ.hiragana} ${dayJ.hiragana}（${weekdayJ.hiragana}）`;
            speechText = `${yearJ.romaji}ねん ${monthJ.romaji} ${dayJ.romaji}、${weekdayJ.romaji}`;
            break;
        case 'time':
            romaji = `${period.romaji} ${hoursJ.romaji}ji ${minutesJ.romaji}`;
            kanji = `${period.kanji}${hoursJ.kanji}時${minutesJ.kanji}`;
            hiragana = `${period.hiragana}${hoursJ.hiragana}じ${minutesJ.hiragana}`;
            speechText = `${period.romaji} ${hoursJ.romaji}じ${minutes > 0 ? ` ${minutesJ.romaji}` : ''}`;
            break;
    }
    
    return { romaji, kanji, hiragana, speechText };
};

// Actualizar la visualización
const updateDisplay = (mode = 'datetime') => {
    const currentDateTime = new Date();
    const japaneseDateTime = formatJapaneseDateTime(currentDateTime, mode);
    
    document.getElementById('currentTime').textContent = 
        currentDateTime.toLocaleDateString('es-ES', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true 
        });
    
    document.getElementById('romajiDisplay').textContent = japaneseDateTime.romaji;
    document.getElementById('kanjiDisplay').textContent = japaneseDateTime.kanji;
    document.getElementById('hiraganaDisplay').textContent = japaneseDateTime.hiragana;
    
    currentMode = mode;
    
    document.querySelectorAll('.option-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(mode + 'Button').classList.add('active');
};

// Fallback para mostrar texto en Android si falla la voz
const showMobileFallback = (japaneseDateTime) => {
    const fallbackDiv = document.getElementById('voiceFallback');
    if (!fallbackDiv) {
        const newFallback = document.createElement('div');
        newFallback.id = 'voiceFallback';
        newFallback.style.cssText = `
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            font-size: 14px;
        `;
        newFallback.innerHTML = `
            <strong>📱 Texto para practicar pronunciación:</strong><br>
            <strong>Romaji:</strong> ${japaneseDateTime.romaji}<br>
            <strong>Hiragana:</strong> ${japaneseDateTime.hiragana}<br>
            <em>Puedes copiar este texto y usar una app de traducción para escuchar la pronunciación.</em>
        `;
        document.querySelector('.voice-selector').after(newFallback);
        
        // Auto-eliminar después de 10 segundos
        setTimeout(() => {
            if (fallbackDiv && fallbackDiv.parentNode) {
                fallbackDiv.parentNode.removeChild(fallbackDiv);
            }
        }, 10000);
    }
};

// Función mejorada de síntesis de voz para Android
const speakJapaneseDateTime = async () => {
    if (!currentMode) return;
    
    const currentDateTime = new Date();
    const japaneseDateTime = formatJapaneseDateTime(currentDateTime, currentMode);
    const button = document.getElementById('speakButton');
    const buttonText = document.getElementById('buttonText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    button.disabled = true;
    loadingSpinner.style.display = 'block';
    buttonText.textContent = 'Generando audio...';
    
    try {
        await window.ttsClient.speak(japaneseDateTime.speechText, {
            voice: 'japanese',
            speed: 160,
            pitch: 50
        });
        buttonText.textContent = 'Audio completado ✓';
    } catch (error) {
        console.error('Error al generar audio:', error);
        buttonText.textContent = 'Error en audio ❌';
    } finally {
        setTimeout(() => {
            button.disabled = false;
            loadingSpinner.style.display = 'none';
            buttonText.textContent = 'Decir en japonés';
        }, 1000);
    }
};

// Función mejorada para inicializar voces
const initializeVoices = () => {
    loadVoices().then((voices) => {
        const voiceSelect = document.getElementById('voiceSelect');
        const voiceStatus = document.getElementById('voiceStatus');
        const speakButton = document.getElementById('speakButton');
        const buttonText = document.getElementById('buttonText');
        
        voiceSelect.innerHTML = '';
        
        if (voices.length > 0) {
            voices.forEach((voice, i) => {
                voiceSelect.innerHTML += `<option value="${i}">${voice.name} (${voice.lang})</option>`;
            });
            
            if (isMobile) {
                voiceStatus.textContent = `✓ ${voices.length} voces japonesas detectadas en Android`;
            } else {
                voiceStatus.textContent = `✓ ${voices.length} voces japonesas encontradas`;
            }
            voiceStatus.className = 'status success';
            speakButton.disabled = false;
            buttonText.textContent = 'Decir en japonés';
            voicesLoaded = true;
        } else {
            voiceSelect.innerHTML = '<option value="">No se encontraron voces japonesas</option>';
            
            if (isMobile) {
                voiceStatus.textContent = 'ℹ️ En Android, se usará la voz por defecto del sistema. Toca el botón para probar.';
                // Mostrar ayuda específica para Android
                document.getElementById('androidHelp').style.display = 'block';
            } else {
                voiceStatus.textContent = '✗ No hay voces japonesas. Se usará voz por defecto.';
            }
            
            voiceStatus.className = 'status warning';
            speakButton.disabled = false;
            buttonText.textContent = isMobile ? 'Probar voz (Android)' : 'Decir en japonés (voz por defecto)';
            voicesLoaded = false;
        }
    }).catch(error => {
        console.error('Error loading voices:', error);
        const voiceStatus = document.getElementById('voiceStatus');
        voiceStatus.textContent = '⚠️ Error al cargar voces. Intentando nuevamente...';
        voiceStatus.className = 'status warning';
        
        // Reintentar después de 3 segundos
        setTimeout(initializeVoices, 3000);
    });
};

// Prevenir zoom no deseado en móviles
const disableZoom = () => {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    document.addEventListener('gesturestart', function (e) {
        e.preventDefault();
    });
};

// Inicialización mejorada para Android
document.addEventListener('DOMContentLoaded', () => {
    // Prevenir zoom en móviles
    if (isMobile) {
        disableZoom();
        
        // Añadir meta tag viewport dinámicamente para Android
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
        }
    }
    
    // Configurar evento para reintentar carga de voces en Android
    document.getElementById('retryVoices')?.addEventListener('click', () => {
        const voiceStatus = document.getElementById('voiceStatus');
        voiceStatus.textContent = '🔄 Recargando voces...';
        voiceStatus.className = 'status warning';
        
        initializeVoices();
    });
    
    // Inicializar voces
    speechSynthesis.onvoiceschanged = initializeVoices;
    initializeVoices();
    
    // Configurar eventos de botones
    document.getElementById('datetimeButton').addEventListener('click', () => updateDisplay('datetime'));
    document.getElementById('dateButton').addEventListener('click', () => updateDisplay('date'));
    document.getElementById('timeButton').addEventListener('click', () => updateDisplay('time'));
    
    document.getElementById('speakButton').addEventListener('click', speakJapaneseDateTime);
    
    // Inicializar display
    updateDisplay('datetime');
    
    // Actualizar cada minuto
    setInterval(() => updateDisplay(currentMode), 60000);
    
    // Log para debugging
    console.log('Dispositivo móvil detectado:', isMobile);
    console.log('Chrome Mobile detectado:', isChromeMobile);
});