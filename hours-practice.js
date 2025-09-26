// Variables globales para la práctica de horas
let voices = [], japaneseVoices = [], voicesLoaded = false;
let currentTime = null;
let currentJapaneseTime = null;
let questionsCount = 0, correctAnswers = 0, currentStreak = 0;
let answerRevealed = false;
let currentQuestionAnswered = false;

// Función para convertir horas a japonés
const convertTimeToJapanese = (hours, minutes, seconds) => {
    const period = hours >= 12 ? amPm.pm : amPm.am;
    const displayHours = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
    
    // Horas especiales
    let hoursJ;
    if (displayHours === 4) {
        hoursJ = { kanji: "四", hiragana: "よ", romaji: "yo" };
    } else if (displayHours === 7) {
        hoursJ = { kanji: "七", hiragana: "しち", romaji: "shichi" };
    } else if (displayHours === 9) {
        hoursJ = { kanji: "九", hiragana: "く", romaji: "ku" };
    } else {
        hoursJ = numbers[displayHours] || { 
            kanji: displayHours.toString(), 
            hiragana: displayHours.toString(), 
            romaji: displayHours.toString() 
        };
    }
    
    const minutesJ = getMinutePronunciation(minutes);
    const secondsJ = getSecondPronunciation(seconds);
    
    return {
        romaji: `${period.romaji} ${hoursJ.romaji}ji${minutesJ.romaji ? ` ${minutesJ.romaji}` : ""}${secondsJ.romaji ? ` ${secondsJ.romaji}` : ""}`.trim(),
        kanji: `${period.kanji}${hoursJ.kanji}時${minutesJ.kanji}${secondsJ.kanji}`,
        hiragana: `${period.hiragana}${hoursJ.hiragana}じ${minutesJ.hiragana}${secondsJ.hiragana}`,
        speechText: `${period.romaji} ${hoursJ.romaji}じ${minutesJ.romaji ? ` ${minutesJ.romaji}` : ""}${secondsJ.romaji ? ` ${secondsJ.romaji}` : ""}`.trim(),
        // Respuestas individuales para verificación
        period: period,
        hours: hoursJ,
        minutes: minutesJ,
        seconds: secondsJ
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

// Generar una hora aleatoria según la dificultad (MODIFICADO: minutos y segundos completamente aleatorios)
const generateRandomTime = () => {
    const difficulty = document.getElementById('difficulty').value;
    
    let hours, minutes, seconds;
    
    // Generar horas (siempre entre 0 y 23)
    hours = Math.floor(Math.random() * 24);
    
    // Generar minutos según la dificultad (MODIFICADO: ahora completamente aleatorios)
    if (difficulty === 'basic') {
        minutes = 0; // Horas exactas
        seconds = 0;
    } else if (difficulty === 'intermediate') {
        minutes = Math.floor(Math.random() * 60); // Cualquier minuto entre 0-59
        seconds = 0;
    } else { // advanced
        minutes = Math.floor(Math.random() * 60); // Cualquier minuto entre 0-59
        seconds = Math.floor(Math.random() * 60); // Cualquier segundo entre 0-59
    }
    
    return { hours, minutes, seconds };
};

// Mostrar la hora generada
const displayTime = (time) => {
    const timeDisplay = document.getElementById('timeToPractice');
    const periodDisplay = document.getElementById('timePeriod');
    
    // Formatear la hora
    const displayHours = time.hours === 0 ? 12 : (time.hours > 12 ? time.hours - 12 : time.hours);
    const period = time.hours >= 12 ? 'PM' : 'AM';
    
    timeDisplay.textContent = `${displayHours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
    
    // Mostrar segundos si es nivel avanzado
    if (document.getElementById('difficulty').value === 'advanced') {
        timeDisplay.textContent += `:${time.seconds.toString().padStart(2, '0')}`;
    }
    
    periodDisplay.textContent = period;
};

// Mostrar la respuesta correcta
const displayCorrectAnswer = (japaneseTime) => {
    document.querySelector('#romajiAnswer .japanese-text').textContent = japaneseTime.romaji;
    document.querySelector('#kanjiAnswer .japanese-text').textContent = japaneseTime.kanji;
    document.querySelector('#hiraganaAnswer .japanese-text').textContent = japaneseTime.hiragana;
    
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
            label.textContent = 'Escribe la hora en Romaji:';
            hint.textContent = 'Formato: [gozen/gogo] [hora]ji [minutos] [segundos]';
            break;
        case 'hiragana':
            label.textContent = 'Escribe la hora en Hiragana:';
            hint.textContent = 'Formato: [ごぜん/ごご] [hora]じ [minutos] [segundos]';
            break;
        case 'kanji':
            label.textContent = 'Escribe la hora en Kanji:';
            hint.textContent = 'Formato: [午前/午後][hora]時[minutos][segundos]';
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

// Función para reproducir texto usando el servicio TTS
const speakJapaneseText = async (text) => {
    const button = document.getElementById('speakButton');
    const buttonText = document.getElementById('buttonText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    try {
        button.disabled = true;
        loadingSpinner.style.display = 'block';
        buttonText.textContent = 'Generando audio...';
        
        // Usar el servicio TTS global
        if (window.ttsService) {
            await window.ttsService.generateSpeech(text);
        } else {
            // Fallback al TTS del navegador
            await fallbackBrowserTTS(text);
        }
        
    } catch (error) {
        console.error('Error speaking text:', error);
        // Fallback al TTS del navegador en caso de error
        await fallbackBrowserTTS(text);
    } finally {
        button.disabled = false;
        loadingSpinner.style.display = 'none';
        buttonText.textContent = voicesLoaded ? 'Escuchar pronunciación' : 'Escuchar pronunciación (voz por defecto)';
    }
};

// Fallback al TTS del navegador
const fallbackBrowserTTS = (text) => {
    return new Promise((resolve) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8;
            
            if (voicesLoaded) {
                const selectedIndex = parseInt(document.getElementById('voiceSelect').value);
                if (selectedIndex >= 0 && japaneseVoices[selectedIndex]) {
                    utterance.voice = japaneseVoices[selectedIndex];
                }
            }
            
            utterance.onend = resolve;
            utterance.onerror = resolve;
            
            speechSynthesis.speak(utterance);
        } else {
            resolve();
        }
    });
};

// Reproducir la hora en japonés
const speakJapaneseTime = () => {
    if (!currentJapaneseTime) return;
    speakJapaneseText(currentJapaneseTime.speechText);
};

// Generar nueva pregunta
const generateNewQuestion = () => {
    currentTime = generateRandomTime();
    currentJapaneseTime = convertTimeToJapanese(
        currentTime.hours, 
        currentTime.minutes, 
        currentTime.seconds
    );
    
    displayTime(currentTime);
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
    document.getElementById('generateTime').addEventListener('click', generateNewQuestion);
    
    document.getElementById('checkAnswer').addEventListener('click', () => {
        // Si ya se respondió correctamente esta pregunta, no hacer nada
        if (currentQuestionAnswered) return;
        
        const userAnswer = document.getElementById('userAnswer').value.trim();
        const inputMode = document.querySelector('input[name="inputMode"]:checked').value;
        
        if (!userAnswer) {
            showFeedback(false);
            return;
        }
        
        const isCorrect = checkUserAnswer(userAnswer, currentJapaneseTime, inputMode);
        showFeedback(isCorrect, userAnswer);
    });
    
    document.getElementById('showAnswer').addEventListener('click', () => {
        displayCorrectAnswer(currentJapaneseTime);
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
    
    document.getElementById('speakButton').addEventListener('click', speakJapaneseTime);
    
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
    
    // Actualizar cuando cambia la dificultad
    document.getElementById('difficulty').addEventListener('change', generateNewQuestion);
    
    // Generar primera pregunta
    updateInputLabel();
    generateNewQuestion();
});