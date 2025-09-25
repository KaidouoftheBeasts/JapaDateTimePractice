// Variables globales para la práctica de días del mes
let voices = [], japaneseVoices = [], voicesLoaded = false;
let currentDate = null;
let currentJapaneseDate = null;
let questionsCount = 0, correctAnswers = 0, currentStreak = 0;
let answerRevealed = false;
let currentQuestionAnswered = false;

// Función para generar una fecha aleatoria según la dificultad
const generateRandomDate = () => {
    const difficulty = document.getElementById('difficulty').value;
    
    let day, month, year;
    
    // Generar día (1-31)
    day = Math.floor(Math.random() * 31) + 1;
    
    // Generar mes (1-12)
    month = Math.floor(Math.random() * 12) + 1;
    
    // Generar año (2023-2027)
    year = Math.floor(Math.random() * 5) + 2023;
    
    let displayText = "";
    let dateInfo = "";
    
    if (difficulty === 'basic') {
        displayText = `${day} de ${getMonthName(month)}`;
        dateInfo = `Día ${day}`;
    } else if (difficulty === 'intermediate') {
        displayText = `${day} de ${getMonthName(month)}`;
        dateInfo = `${getMonthName(month)} ${day}`;
    } else { // advanced
        displayText = `${day} de ${getMonthName(month)} de ${year}`;
        dateInfo = `${year}, ${getMonthName(month)} ${day}`;
    }
    
    return {
        day: day,
        month: month,
        year: year,
        displayText: displayText,
        dateInfo: dateInfo,
        difficulty: difficulty
    };
};

// Función auxiliar para obtener nombre del mes en español
const getMonthName = (month) => {
    const monthsSpanish = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return monthsSpanish[month - 1];
};

// Función para obtener la representación japonesa de la fecha
const getJapaneseDate = (dateObj) => {
    const dayJ = convertNumberToJapanese(dateObj.day, 'day');
    const monthJ = months[dateObj.month];
    
    let romaji, kanji, hiragana, speechText;
    
    if (dateObj.difficulty === 'basic') {
        romaji = dayJ.romaji;
        kanji = dayJ.kanji;
        hiragana = dayJ.hiragana;
        speechText = dayJ.romaji;
    } else if (dateObj.difficulty === 'intermediate') {
        romaji = `${monthJ.romaji} ${dayJ.romaji}`;
        kanji = `${monthJ.kanji}${dayJ.kanji}`;
        hiragana = `${monthJ.hiragana} ${dayJ.hiragana}`;
        speechText = `${monthJ.romaji} ${dayJ.romaji}`;
    } else { // advanced
        const yearJ = convertNumberToJapanese(dateObj.year, 'year');
        romaji = `${yearJ.romaji}nen ${monthJ.romaji} ${dayJ.romaji}`;
        kanji = `${yearJ.kanji}年${monthJ.kanji}${dayJ.kanji}`;
        hiragana = `${yearJ.hiragana}ねん ${monthJ.hiragana} ${dayJ.hiragana}`;
        speechText = `${yearJ.romaji}ねん ${monthJ.romaji} ${dayJ.romaji}`;
    }
    
    return {
        romaji: romaji,
        kanji: kanji,
        hiragana: hiragana,
        speechText: speechText
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

// Mostrar la fecha generada
const displayDate = (date) => {
    const dateDisplay = document.getElementById('dateToPractice');
    const infoDisplay = document.getElementById('dateInfo');
    
    dateDisplay.textContent = date.displayText;
    infoDisplay.textContent = date.dateInfo;
};

// Mostrar la respuesta correcta
const displayCorrectAnswer = (japaneseDate) => {
    document.querySelector('#romajiAnswer .japanese-text').textContent = japaneseDate.romaji;
    document.querySelector('#kanjiAnswer .japanese-text').textContent = japaneseDate.kanji;
    document.querySelector('#hiraganaAnswer .japanese-text').textContent = japaneseDate.hiragana;
    
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
    const difficulty = document.getElementById('difficulty').value;
    const label = document.getElementById('inputLabel');
    const hint = document.getElementById('inputHint');
    
    switch(inputMode) {
        case 'romaji':
            label.textContent = 'Escribe la fecha en Romaji:';
            if (difficulty === 'basic') {
                hint.textContent = 'Ejemplo: tsuitachi (para día 1)';
            } else if (difficulty === 'intermediate') {
                hint.textContent = 'Formato: [mes] [día]';
            } else {
                hint.textContent = 'Formato: [año]nen [mes] [día]';
            }
            break;
        case 'hiragana':
            label.textContent = 'Escribe la fecha en Hiragana:';
            if (difficulty === 'basic') {
                hint.textContent = 'Ejemplo: ついたち (para día 1)';
            } else if (difficulty === 'intermediate') {
                hint.textContent = 'Formato: [mes] [día]';
            } else {
                hint.textContent = 'Formato: [año]ねん [mes] [día]';
            }
            break;
        case 'kanji':
            label.textContent = 'Escribe la fecha en Kanji:';
            if (difficulty === 'basic') {
                hint.textContent = 'Ejemplo: 一日 (para día 1)';
            } else if (difficulty === 'intermediate') {
                hint.textContent = 'Formato: [mes][día]';
            } else {
                hint.textContent = 'Formato: [año]年[mes][día]';
            }
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

// Reproducir la fecha en japonés
const speakJapaneseDate = async () => {
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
    currentDate = generateRandomDate();
    currentJapaneseDate = getJapaneseDate(currentDate);
    
    displayDate(currentDate);
    resetInterface();
    
    if (!answerRevealed) {
        questionsCount++;
    }
    updateStats();
    updateInputLabel();
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Cargar voces
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    
    // Configurar eventos
    document.getElementById('generateDate').addEventListener('click', generateNewQuestion);
    
    document.getElementById('checkAnswer').addEventListener('click', () => {
        // Si ya se respondió correctamente esta pregunta, no hacer nada
        if (currentQuestionAnswered) return;
        
        const userAnswer = document.getElementById('userAnswer').value.trim();
        const inputMode = document.querySelector('input[name="inputMode"]:checked').value;
        
        if (!userAnswer) {
            showFeedback(false);
            return;
        }
        
        const isCorrect = checkUserAnswer(userAnswer, currentJapaneseDate, inputMode);
        showFeedback(isCorrect, userAnswer);
    });
    
    document.getElementById('showAnswer').addEventListener('click', () => {
        displayCorrectAnswer(currentJapaneseDate);
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
    
    document.getElementById('speakButton').addEventListener('click', speakJapaneseDate);
    
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