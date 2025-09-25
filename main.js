// Variables globales
let voices = [], japaneseVoices = [], voicesLoaded = false, currentMode = 'datetime';

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

// Cargar voces
const loadVoices = () => {
    voices = speechSynthesis.getVoices();
    japaneseVoices = voices.filter(voice => 
        voice.lang.startsWith('ja') || voice.lang.includes('JP') || 
        voice.name.toLowerCase().includes('japan') || voice.name.toLowerCase().includes('japanese')
    );
    
    const voiceSelect = document.getElementById('voiceSelect');
    const voiceStatus = document.getElementById('voiceStatus');
    const speakButton = document.getElementById('speakButton');
    const buttonText = document.getElementById('buttonText');
    
    voiceSelect.innerHTML = '';
    
    if (japaneseVoices.length > 0) {
        japaneseVoices.forEach((voice, i) => {
            voiceSelect.innerHTML += `<option value="${i}">${voice.name} (${voice.lang})</option>`;
        });
        
        voiceStatus.textContent = `✓ ${japaneseVoices.length} voces japonesas encontradas`;
        voiceStatus.className = 'status success';
        speakButton.disabled = false;
        buttonText.textContent = 'Decir en japonés';
        voicesLoaded = true;
    } else {
        voiceSelect.innerHTML = '<option value="">No se encontraron voces japonesas</option>';
        voiceStatus.textContent = '✗ No hay voces japonesas. Se usará voz por defecto.';
        voiceStatus.className = 'status warning';
        speakButton.disabled = false;
        buttonText.textContent = 'Decir en japonés (voz por defecto)';
        voicesLoaded = false;
    }
};

// Reproducir fecha/hora en japonés (ACTUALIZADO CON TTS PROPIO)
const speakJapaneseDateTime = async () => {
    if (!currentMode) return;
    
    const currentDateTime = new Date();
    const japaneseDateTime = formatJapaneseDateTime(currentDateTime, currentMode);
    const button = document.getElementById('speakButton');
    const buttonText = document.getElementById('buttonText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    button.disabled = true;
    loadingSpinner.style.display = 'block';
    buttonText.textContent = 'Hablando...';
    
    try {
        // Usar el servidor TTS personalizado
        const response = await fetch('/api/tts/speak', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: japaneseDateTime.speechText
            })
        });
        
        if (!response.ok) {
            throw new Error('Error en el servidor TTS');
        }
        
        const data = await response.json();
        
        // Reproducir audio
        const audio = new Audio(data.audio_url);
        audio.play();
        
        audio.onended = () => {
            button.disabled = false;
            loadingSpinner.style.display = 'none';
            buttonText.textContent = 'Decir en japonés';
        };
        
        audio.onerror = () => {
            button.disabled = false;
            loadingSpinner.style.display = 'none';
            buttonText.textContent = 'Decir en japonés';
        };
        
    } catch (error) {
        console.error('Error TTS:', error);
        button.disabled = false;
        loadingSpinner.style.display = 'none';
        buttonText.textContent = 'Decir en japonés';
        
        // Fallback a Web Speech API si está disponible
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(japaneseDateTime.speechText);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
            
            utterance.onend = () => {
                button.disabled = false;
                loadingSpinner.style.display = 'none';
                buttonText.textContent = 'Decir en japonés';
            };
        }
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    
    document.getElementById('datetimeButton').addEventListener('click', () => updateDisplay('datetime'));
    document.getElementById('dateButton').addEventListener('click', () => updateDisplay('date'));
    document.getElementById('timeButton').addEventListener('click', () => updateDisplay('time'));
    
    document.getElementById('speakButton').addEventListener('click', speakJapaneseDateTime);
    
    updateDisplay('datetime');
    setInterval(() => updateDisplay(currentMode), 60000);
});