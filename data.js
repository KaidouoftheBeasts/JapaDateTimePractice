// Datos optimizados para la aplicación
const specialDays = {
    1: { kanji: "一日", hiragana: "ついたち", romaji: "tsuitachi" },
    2: { kanji: "二日", hiragana: "ふつか", romaji: "futsuka" },
    3: { kanji: "三日", hiragana: "みっか", romaji: "mikka" },
    4: { kanji: "四日", hiragana: "よっか", romaji: "yokka" },
    5: { kanji: "五日", hiragana: "いつか", romaji: "itsuka" },
    6: { kanji: "六日", hiragana: "むいか", romaji: "muika" },
    7: { kanji: "七日", hiragana: "なのか", romaji: "nanoka" },
    8: { kanji: "八日", hiragana: "ようか", romaji: "youka" },
    9: { kanji: "九日", hiragana: "ここのか", romaji: "kokonoka" },
    10: { kanji: "十日", hiragana: "とおか", romaji: "touka" },
    14: { kanji: "十四日", hiragana: "じゅうよっか", romaji: "juu yokka" },
    20: { kanji: "二十日", hiragana: "はつか", romaji: "hatsuka" },
    24: { kanji: "二十四日", hiragana: "にじゅうよっか", romaji: "nijuu yokka" }
};

const amPm = { 
    am: { kanji: "午前", hiragana: "ごぜん", romaji: "gozen" }, 
    pm: { kanji: "午後", hiragana: "ごご", romaji: "gogo" } 
};

const numbers = {
    0: { kanji: "〇", hiragana: "れい", romaji: "rei" }, 
    1: { kanji: "一", hiragana: "いち", romaji: "ichi" },
    2: { kanji: "二", hiragana: "に", romaji: "ni" }, 
    3: { kanji: "三", hiragana: "さん", romaji: "san" },
    4: { kanji: "四", hiragana: "よん", romaji: "yon" }, 
    5: { kanji: "五", hiragana: "ご", romaji: "go" },
    6: { kanji: "六", hiragana: "ろく", romaji: "roku" }, 
    7: { kanji: "七", hiragana: "なな", romaji: "nana" },
    8: { kanji: "八", hiragana: "はち", romaji: "hachi" }, 
    9: { kanji: "九", hiragana: "きゅう", romaji: "kyuu" },
    10: { kanji: "十", hiragana: "じゅう", romaji: "juu" },
    11: { kanji: "十一", hiragana: "じゅういち", romaji: "juuichi" },
    12: { kanji: "十二", hiragana: "じゅうに", romaji: "juuni" }
};

const months = {
    1: { kanji: "一月", hiragana: "いちがつ", romaji: "ichigatsu" }, 
    2: { kanji: "二月", hiragana: "にがつ", romaji: "nigatsu" },
    3: { kanji: "三月", hiragana: "さんがつ", romaji: "sangatsu" }, 
    4: { kanji: "四月", hiragana: "しがつ", romaji: "shigatsu" },
    5: { kanji: "五月", hiragana: "ごがつ", romaji: "gogatsu" }, 
    6: { kanji: "六月", hiragana: "ろくがつ", romaji: "rokugatsu" },
    7: { kanji: "七月", hiragana: "しちがつ", romaji: "shichigatsu" }, 
    8: { kanji: "八月", hiragana: "はちがつ", romaji: "hachigatsu" },
    9: { kanji: "九月", hiragana: "くがつ", romaji: "kugatsu" }, 
    10: { kanji: "十月", hiragana: "じゅうがつ", romaji: "juugatsu" },
    11: { kanji: "十一月", hiragana: "じゅういちがつ", romaji: "juuichigatsu" }, 
    12: { kanji: "十二月", hiragana: "じゅうにがつ", romaji: "juunigatsu" }
};

const weekdays = [
    { kanji: "日曜日", hiragana: "にちようび", romaji: "nichiyoubi" }, 
    { kanji: "月曜日", hiragana: "げつようび", romaji: "getsuyoubi" },
    { kanji: "火曜日", hiragana: "かようび", romaji: "kayoubi" }, 
    { kanji: "水曜日", hiragana: "すいようび", romaji: "suiyoubi" },
    { kanji: "木曜日", hiragana: "もくようび", romaji: "mokuyoubi" }, 
    { kanji: "金曜日", hiragana: "きんようび", romaji: "kinyoubi" },
    { kanji: "土曜日", hiragana: "どようび", romaji: "doyoubi" }
];

// Función corregida para días del mes
const getDayPronunciation = (day) => {
    if (specialDays[day]) return specialDays[day];
    
    if (day <= 10) {
        return {
            kanji: numbers[day].kanji + "日",
            hiragana: numbers[day].hiragana + "にち",
            romaji: numbers[day].romaji + " nichi"
        };
    }
    
    const tens = Math.floor(day / 10);
    const ones = day % 10;
    
    if (ones === 0) {
        // CORRECCIÓN: No incluir "ichi" para 10, 20, 30
        if (tens === 1) {
            return {
                kanji: "十日",
                hiragana: "じゅうにち",
                romaji: "juu nichi"
            };
        } else {
            return {
                kanji: numbers[tens].kanji + "十日",
                hiragana: numbers[tens].hiragana + "じゅうにち",
                romaji: numbers[tens].romaji + "juu nichi"
            };
        }
    } else {
        // CORRECCIÓN: No incluir "ichi" para las decenas (11-19, 21-29, etc.)
        if (tens === 1) {
            return {
                kanji: "十" + numbers[ones].kanji + "日",
                hiragana: "じゅう" + numbers[ones].hiragana + "にち",
                romaji: "juu" + numbers[ones].romaji + " nichi"
            };
        } else {
            return {
                kanji: numbers[tens].kanji + "十" + numbers[ones].kanji + "日",
                hiragana: numbers[tens].hiragana + "じゅう" + numbers[ones].hiragana + "にち",
                romaji: numbers[tens].romaji + "juu" + numbers[ones].romaji + " nichi"
            };
        }
    }
};

// Función COMPLETAMENTE CORREGIDA para minutos
const getMinutePronunciation = (minutes) => {
    if (minutes === 0) return { romaji: "", hiragana: "", kanji: "" };
    
    // CASOS ESPECIALES ÚNICOS
    if (minutes === 1) return { romaji: "ippun", hiragana: "いっぷん", kanji: "一分" };
    if (minutes === 6) return { romaji: "roppun", hiragana: "ろっぷん", kanji: "六分" };
    if (minutes === 8) return { romaji: "happun", hiragana: "はっぷん", kanji: "八分" };
    if (minutes === 10) return { romaji: "juuppun", hiragana: "じゅっぷん", kanji: "十分" };
    
    // DECENAS ESPECIALES
    if (minutes === 20) return { romaji: "nijuuppun", hiragana: "にじゅっぷん", kanji: "二十分" };
    if (minutes === 30) return { romaji: "sanjuuppun", hiragana: "さんじゅっぷん", kanji: "三十分" };
    if (minutes === 40) return { romaji: "yonjuuppun", hiragana: "よんじゅっぷん", kanji: "四十分" };
    if (minutes === 50) return { romaji: "gojuuppun", hiragana: "ごじゅっぷん", kanji: "五十分" };
    
    // Para números simples (2-9)
    if (minutes < 10) {
        const isSpecial = [1, 3, 4, 6, 8].includes(minutes);
        const pronunciation = isSpecial ? "pun" : "fun";
        const hiraganaEnd = isSpecial ? "ぷん" : "ふん";
        
        return {
            romaji: numbers[minutes].romaji + pronunciation,
            hiragana: numbers[minutes].hiragana + hiraganaEnd,
            kanji: numbers[minutes].kanji + "分"
        };
    }
    
    // Para números de 11-59 (excluyendo los casos especiales ya tratados)
    const tens = Math.floor(minutes / 10);
    const ones = minutes % 10;
    
    // CORRECCIÓN: Las decenas no deben incluir "ichi" para 10, 20, 30, etc.
    if (ones === 0) {
        // Para 10, 20, 30, 40, 50 - ya están definidos arriba
        // Para otros casos como 15, 25, 35, 45
        if (minutes === 10) return { romaji: "juuppun", hiragana: "じゅっぷん", kanji: "十分" };
        if (minutes === 20) return { romaji: "nijuuppun", hiragana: "にじゅっぷん", kanji: "二十分" };
        if (minutes === 30) return { romaji: "sanjuuppun", hiragana: "さんじゅっぷん", kanji: "三十分" };
        if (minutes === 40) return { romaji: "yonjuuppun", hiragana: "よんじゅっぷん", kanji: "四十分" };
        if (minutes === 50) return { romaji: "gojuuppun", hiragana: "ごじゅっぷん", kanji: "五十分" };
        
        return {
            romaji: numbers[tens].romaji + "juuppun",
            hiragana: numbers[tens].hiragana + "じゅっぷん",
            kanji: numbers[tens].kanji + "十分"
        };
    } else {
        // DETERMINAR PRONUNCIACIÓN CORRECTA SEGÚN EL ÚLTIMO DÍGITO
        let onesPronunciation;
        let onesHiragana;
        let onesKanji;
        
        switch(ones) {
            case 1:
                onesPronunciation = "ippun";
                onesHiragana = "いっぷん";
                onesKanji = "一分";
                break;
            case 2:
                onesPronunciation = "nifun";
                onesHiragana = "にふん";
                onesKanji = "二分";
                break;
            case 3:
                onesPronunciation = "sanpun";
                onesHiragana = "さんぷん";
                onesKanji = "三分";
                break;
            case 4:
                onesPronunciation = "yonpun";
                onesHiragana = "よんぷん";
                onesKanji = "四分";
                break;
            case 5:
                onesPronunciation = "gofun";
                onesHiragana = "ごふん";
                onesKanji = "五分";
                break;
            case 6:
                onesPronunciation = "roppun";
                onesHiragana = "ろっぷん";
                onesKanji = "六分";
                break;
            case 7:
                onesPronunciation = "nanafun";
                onesHiragana = "ななふん";
                onesKanji = "七分";
                break;
            case 8:
                onesPronunciation = "happun";
                onesHiragana = "はっぷん";
                onesKanji = "八分";
                break;
            case 9:
                onesPronunciation = "kyuufun";
                onesHiragana = "きゅうふん";
                onesKanji = "九分";
                break;
        }
        
        // CORRECCIÓN CRÍTICA: Para las decenas, no usar "ichi" para 10
        let tensPart, tensHiragana, tensKanji;
        
        if (tens === 1) {
            tensPart = "juu";
            tensHiragana = "じゅう";
            tensKanji = "十";
        } else {
            tensPart = numbers[tens].romaji + "juu";
            tensHiragana = numbers[tens].hiragana + "じゅう";
            tensKanji = numbers[tens].kanji + "十";
        }
        
        return {
            romaji: tensPart + onesPronunciation,
            hiragana: tensHiragana + onesHiragana,
            kanji: tensKanji + onesKanji.replace("分", "") + "分"
        };
    }
};

// Función para segundos (también corregida por consistencia)
const getSecondPronunciation = (seconds) => {
    if (seconds === 0) return { romaji: "", hiragana: "", kanji: "" };
    
    // Para números simples (1-9)
    if (seconds < 10) {
        return {
            romaji: numbers[seconds].romaji + "byou",
            hiragana: numbers[seconds].hiragana + "びょう",
            kanji: numbers[seconds].kanji + "秒"
        };
    }
    
    // Para números de 10-59
    const tens = Math.floor(seconds / 10);
    const ones = seconds % 10;
    
    if (ones === 0) {
        // CORRECCIÓN: No incluir "ichi" para 10 segundos
        if (tens === 1) {
            return {
                romaji: "jubyou",
                hiragana: "じゅうびょう",
                kanji: "十秒"
            };
        } else {
            return {
                romaji: numbers[tens].romaji + "juubyou",
                hiragana: numbers[tens].hiragana + "じゅうびょう",
                kanji: numbers[tens].kanji + "十秒"
            };
        }
    } else {
        // CORRECCIÓN: No incluir "ichi" para las decenas
        let tensPart, tensHiragana, tensKanji;
        
        if (tens === 1) {
            tensPart = "juu";
            tensHiragana = "じゅう";
            tensKanji = "十";
        } else {
            tensPart = numbers[tens].romaji + "juu";
            tensHiragana = numbers[tens].hiragana + "じゅう";
            tensKanji = numbers[tens].kanji + "十";
        }
        
        return {
            romaji: tensPart + numbers[ones].romaji + "byou",
            hiragana: tensHiragana + numbers[ones].hiragana + "びょう",
            kanji: tensKanji + numbers[ones].kanji + "秒"
        };
    }
};

// Función para convertir números a japonés (corregida para horas)
const convertNumberToJapanese = (num, type = 'general') => {
    if (type === 'day') return getDayPronunciation(num);
    if (type === 'minutes') return getMinutePronunciation(num);
    if (type === 'seconds') return getSecondPronunciation(num);
    
    if (type === 'hours') {
        let hour = num > 12 ? num - 12 : (num === 0 ? 12 : num);
        if (hour === 4) return { kanji: "四", hiragana: "よ", romaji: "yo" };
        if (hour === 7) return { kanji: "七", hiragana: "しち", romaji: "shichi" };
        if (hour === 9) return { kanji: "九", hiragana: "く", romaji: "ku" };
        return numbers[hour] || { kanji: hour.toString(), hiragana: hour.toString(), romaji: hour.toString() };
    }
    
    if (num <= 10) return numbers[num];
    
    if (num < 100) {
        const tens = Math.floor(num / 10), ones = num % 10;
        
        // CORRECCIÓN: No incluir "ichi" para 10, 20, 30, etc.
        if (ones === 0) {
            if (tens === 1) {
                return {
                    kanji: "十",
                    hiragana: "じゅう",
                    romaji: "juu"
                };
            } else {
                return {
                    kanji: numbers[tens].kanji + "十",
                    hiragana: numbers[tens].hiragana + "じゅう",
                    romaji: numbers[tens].romaji + "juu"
                };
            }
        } else {
            if (tens === 1) {
                return {
                    kanji: "十" + numbers[ones].kanji,
                    hiragana: "じゅう" + numbers[ones].hiragana,
                    romaji: "juu" + numbers[ones].romaji
                };
            } else {
                return {
                    kanji: numbers[tens].kanji + "十" + numbers[ones].kanji,
                    hiragana: numbers[tens].hiragana + "じゅう" + numbers[ones].hiragana,
                    romaji: numbers[tens].romaji + "juu" + numbers[ones].romaji
                };
            }
        }
    }
    
    if (type === 'year') {
        if (num === 2025) return { kanji: "二千二十五", hiragana: "にせんにじゅうご", romaji: "nisen nijūgo" };
        const yearStr = num.toString();
        return { 
            kanji: yearStr.split('').map(d => numbers[d]?.kanji || d).join(''),
            hiragana: yearStr.split('').map(d => numbers[d]?.hiragana || d).join(''),
            romaji: yearStr.split('').map(d => numbers[d]?.romaji || d).join('')
        };
    }
    
    return { kanji: num.toString(), hiragana: num.toString(), romaji: num.toString() };
};