// Variables globales para la práctica de días de la semana
let voices = [], japaneseVoices = [], voicesLoaded = false;
let currentDay = null;
let currentJapaneseDay = null;
let questionsCount = 0, correctAnswers = 0, currentStreak = 0;
let answerRevealed = false;
let currentQuestionAnswered = false;

// Días de la semana en español e inglés para mostrar
const weekdaysSpanish = [
    "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
];

const weekdaysEnglish = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

// Función para generar un día aleatorio
const generateRandomDay = () => {
    const dayIndex = Math.floor(Math.random() * 7); // 0-6 para los días de la semana
    
    return {
        dayIndex: dayIndex,
        spanish: weekdaysSpanish[dayIndex],
        english: weekdaysEnglish[dayIndex]
    };
};

// Función para obtener la representación japonesa del día
const getJapaneseDay = (dayIndex) => {
    const dayInfo = weekdays[dayIndex];
    
    return {
        romaji: dayInfo.romaji,
        kanji: dayInfo.kanji,
        hiragana: dayInfo.hiragana,
        speechText: dayInfo.romaji,
        dayOnly: dayInfo
    };
};

// Normalizar texto para comparación
const normalizeText = (text) => {
    return text
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove punctuation
        .replace(/\s{2,}/g, ' ') // Multiple spaces to single space
        .trim();
};

// Verificar la respuesta del usuario
const checkUserAnswer = (userAnswer, correctAnswer, inputMode) => {
    const normalizedUser = normalizeText(userAnswer);
    let normalizedCorrect = '';
    
    switch(inputMode) {
        case 'romaji':
            normalizedCorrect = normalizeText(correctAnswer.romaji);
            break;
        case 'hiragana':
            normalizedCorrect = normalizeText(correctAnswer.hiragana);
            break;
        case 'kanji':
            normalizedCorrect = normalizeText(correctAnswer.kanji);
            break;
    }
    
    // Comparación flexible (permite variaciones menores)
    return normalizedUser === normalizedCorrect;
};

// Mostrar el día generado
const displayDay = (day) => {
    const dayDisplay = document.getElementById('dayToPractice');
    const englishDisplay = document.getElementById('dayEnglish');
    
    dayDisplay.textContent = day.spanish;
    englishDisplay.textContent = day.english;
};

// Mostrar la respuesta correcta
const displayCorrectAnswer = (japaneseDay) => {
    document.querySelector('#romajiAnswer .japanese-text').textContent = japaneseDay.romaji;
    document.querySelector('#kanjiAnswer .japanese-text').textContent = japaneseDay.kanji;
    document.querySelector('#hiraganaAnswer .japanese-text').textContent = japaneseDay.hiragana;
    
    document.querySelector('.answer-area').style.display = 'block';
};

// Ocultar la respuesta y resetear la interfaz
const resetInterface = () => {
    document.getElementById('userAnswer').value = '';
    document.getElementById('userAnswer').className = '';
    document.getElementById('feedback').style.display = 'none';
    document.querySelector('.answer-area').style.display = 'none';
    document.getElementById('checkAnswer').disabled = false;
    document.getElementById('checkAnswer').style.display = 'inline-block';
    document.getElementById('checkAnswer').textContent = 'Verificar';
    document.getElementById('nextQuestion').style.display = 'none';
    document.getElementById('showAnswer').style.display = 'inline-block';
    answerRevealed = false;
    currentQuestionAnswered = false;
};

// Actualizar estadísticas
const updateStats = () => {
    document.getElementById('questionsCount').textContent = questionsCount;
    document.getElementById('correctCount').textContent = correctAnswers;
    
    const accuracy = questionsCount > 0 ? Math.round((correctAnswers / questionsCount) * 100) : 0;
    document.getElementById('accuracyRate').textContent = `${accuracy}%`;
    document.getElementById('streakCount').textContent = currentStreak;
};

// Mostrar retroalimentación
const showFeedback = (isCorrect, userAnswer = '') => {
    const feedback = document.getElementById('feedback');
    const userInput = document.getElementById('userAnswer');
    const checkButton = document.getElementById('checkAnswer');
    
    if (isCorrect) {
        feedback.textContent = '¡Correcto! 🎉';
        feedback.className = 'feedback correct';
        userInput.className = 'correct';
        currentStreak++;
        correctAnswers++;
        currentQuestionAnswered = true;
        
        // Deshabilitar el botón de verificar temporalmente
        checkButton.disabled = true;
        checkButton.textContent = '✓ Correcto';
        
    } else {
        feedback.textContent = userAnswer ? 'Incorrecto. Inténtalo de nuevo.' : 'Por favor, escribe tu respuesta.';
        feedback.className = 'feedback incorrect';
        if (userAnswer) {
            userInput.className = 'incorrect';
            currentStreak = 0;
        }
    }
    
    feedback.style.display = 'block';
    
    // Mostrar botón de siguiente pregunta solo si se acertó
    if (isCorrect) {
        document.getElementById('nextQuestion').style.display = 'inline-block';
        document.getElementById('showAnswer').style.display = 'none';
    }
};

// Actualizar la etiqueta del input según el modo seleccionado
const updateInputLabel = () => {
    const inputMode = document.querySelector('input[name="inputMode"]:checked').value;
    const label = document.getElementById('inputLabel');
    const hint = document.getElementById('inputHint');
    
    switch(inputMode) {
        case 'romaji':
            label.textContent = 'Escribe el día en Romaji:';
            hint.textContent = 'Ejemplo: getsuyōbi (para lunes)';
            break;
        case 'hiragana':
            label.textContent = 'Escribe el día en Hiragana:';
            hint.textContent = 'Ejemplo: げつようび (para lunes)';
            break;
        case 'kanji':
            label.textContent = 'Escribe el día en Kanji:';
            hint.textContent = 'Ejemplo: 月曜日 (para lunes)';
            break;
    }
};

// Cargar voces para síntesis de voz
const loadVoices = () => {
    voices = speechSynthesis.getVoices();
    japaneseVoices = voices.filter(voice => 
        voice.lang.startsWith('ja') || voice.lang.includes('JP') || 
        voice.name.toLowerCase().includes('japan') || voice.name.toLowerCase().includes('japanese')
    );
    
    const voiceSelect = document.getElementById('voiceSelect');
    const speakButton = document.getElementById('speakButton');
    const buttonText = document.getElementById('buttonText');
    
    voiceSelect.innerHTML = '';
    
    if (japaneseVoices.length > 0) {
        japaneseVoices.forEach((voice, i) => {
            voiceSelect.innerHTML += `<option value="${i}">${voice.name} (${voice.lang})</option>`;
        });
        
        speakButton.disabled = false;
        buttonText.textContent = 'Escuchar pronunciación';
        voicesLoaded = true;
    } else {
        voiceSelect.innerHTML = '<option value="">No se encontraron voces japonesas</option>';
        speakButton.disabled = false;
        buttonText.textContent = 'Escuchar pronunciación (voz por defecto)';
        voicesLoaded = false;
    }
};

// Reproducir el día en japonés
const speakJapaneseDay = async () => {
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

// Generar nueva pregunta
const generateNewQuestion = () => {
    currentDay = generateRandomDay();
    currentJapaneseDay = getJapaneseDay(currentDay.dayIndex);
    
    displayDay(currentDay);
    resetInterface();
    
    if (!answerRevealed) {
        questionsCount++;
    }
    updateStats();
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Cargar voces
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    
    // Configurar eventos
    document.getElementById('generateDay').addEventListener('click', generateNewQuestion);
    
    document.getElementById('checkAnswer').addEventListener('click', () => {
        // Si ya se respondió correctamente esta pregunta, no hacer nada
        if (currentQuestionAnswered) return;
        
        const userAnswer = document.getElementById('userAnswer').value.trim();
        const inputMode = document.querySelector('input[name="inputMode"]:checked').value;
        
        if (!userAnswer) {
            showFeedback(false);
            return;
        }
        
        const isCorrect = checkUserAnswer(userAnswer, currentJapaneseDay, inputMode);
        showFeedback(isCorrect, userAnswer);
    });
    
    document.getElementById('showAnswer').addEventListener('click', () => {
        displayCorrectAnswer(currentJapaneseDay);
        document.getElementById('showAnswer').style.display = 'none';
        document.getElementById('nextQuestion').style.display = 'inline-block';
        document.getElementById('checkAnswer').disabled = true;
        document.getElementById('checkAnswer').textContent = 'Respuesta mostrada';
        answerRevealed = true;
        currentStreak = 0;
        currentQuestionAnswered = true;
        updateStats();
    });
    
    document.getElementById('nextQuestion').addEventListener('click', generateNewQuestion);
    
    document.getElementById('speakButton').addEventListener('click', speakJapaneseDay);
    
    // Permitir Enter para verificar (solo si no se ha respondido aún)
    document.getElementById('userAnswer').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !currentQuestionAnswered) {
            document.getElementById('checkAnswer').click();
        }
    });
    
    // Si el usuario empieza a escribir después de haber acertado, permitir verificar de nuevo
    document.getElementById('userAnswer').addEventListener('input', () => {
        if (currentQuestionAnswered) {
            // Si cambia la respuesta después de acertar, permitir verificar de nuevo
            document.getElementById('checkAnswer').disabled = false;
            document.getElementById('checkAnswer').textContent = 'Verificar';
            document.getElementById('feedback').style.display = 'none';
            document.getElementById('userAnswer').className = '';
            currentQuestionAnswered = false;
        }
    });
    
    // Actualizar etiqueta cuando cambia el modo de entrada
    document.querySelectorAll('input[name="inputMode"]').forEach(radio => {
        radio.addEventListener('change', updateInputLabel);
    });
    
    // Generar primera pregunta
    updateInputLabel();
    generateNewQuestion();
});