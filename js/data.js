// js/data.js

// Alphabet Data
const alphabetData = [
    { letter: 'A', urdu: 'اے', phonetic: 'ay', example: 'Apple - سیب' },
    { letter: 'B', urdu: 'بی', phonetic: 'bee', example: 'Ball - گیند' },
    { letter: 'C', urdu: 'سی', phonetic: 'see', example: 'Cat - بلی' },
    { letter: 'D', urdu: 'ڈی', phonetic: 'dee', example: 'Dog - کتا' },
    { letter: 'E', urdu: 'ای', phonetic: 'ee', example: 'Egg - انڈا' },
    { letter: 'F', urdu: 'ایف', phonetic: 'ef', example: 'Fish - مچھلی' },
    { letter: 'G', urdu: 'جی', phonetic: 'jee', example: 'Girl - لڑکی' },
    { letter: 'H', urdu: 'ایچ', phonetic: 'aych', example: 'House - گھر' },
    { letter: 'I', urdu: 'آئی', phonetic: 'eye', example: 'Ice - برف' },
    { letter: 'J', urdu: 'جے', phonetic: 'jay', example: 'Juice - جوس' },
    { letter: 'K', urdu: 'کے', phonetic: 'kay', example: 'Key - چابی' },
    { letter: 'L', urdu: 'ایل', phonetic: 'el', example: 'Lion - شیر' },
    { letter: 'M', urdu: 'ایم', phonetic: 'em', example: 'Moon - چاند' },
    { letter: 'N', urdu: 'این', phonetic: 'en', example: 'Nose - ناک' },
    { letter: 'O', urdu: 'او', phonetic: 'oh', example: 'Orange - نارنگی' },
    { letter: 'P', urdu: 'پی', phonetic: 'pee', example: 'Pen - قلم' },
    { letter: 'Q', urdu: 'کیو', phonetic: 'cue', example: 'Queen - ملکہ' },
    { letter: 'R', urdu: 'آر', phonetic: 'ar', example: 'Rose - گلاب' },
    { letter: 'S', urdu: 'ایس', phonetic: 'es', example: 'Sun - سورج' },
    { letter: 'T', urdu: 'ٹی', phonetic: 'tee', example: 'Tree - درخت' },
    { letter: 'U', urdu: 'یو', phonetic: 'you', example: 'Umbrella - چھتری' },
    { letter: 'V', urdu: 'وی', phonetic: 'vee', example: 'Van - وین' },
    { letter: 'W', urdu: 'ڈبلیو', phonetic: 'double-you', example: 'Water - پانی' },
    { letter: 'X', urdu: 'ایکس', phonetic: 'ex', example: 'X-ray - ایکس رے' },
    { letter: 'Y', urdu: 'وائی', phonetic: 'why', example: 'Yellow - پیلا' },
    { letter: 'Z', urdu: 'زیڈ', phonetic: 'zed', example: 'Zoo - چڑیا گھر' }
];

const lowercaseAlphabetData = [
    { letter: 'a', urdu: 'اے', phonetic: 'ay', example: 'ant - چیونٹی' },
    { letter: 'b', urdu: 'بی', phonetic: 'bee', example: 'book - کتاب' },
    { letter: 'c', urdu: 'سی', phonetic: 'see', example: 'car - گاڑی' },
    { letter: 'd', urdu: 'ڈی', phonetic: 'dee', example: 'door - دروازہ' },
    { letter: 'e', urdu: 'ای', phonetic: 'ee', example: 'ear - کان' },
    { letter: 'f', urdu: 'ایف', phonetic: 'ef', example: 'fan - پنکھا' },
    { letter: 'g', urdu: 'جی', phonetic: 'jee', example: 'goat - بکری' },
    { letter: 'h', urdu: 'ایچ', phonetic: 'aych', example: 'hat - ٹوپی' },
    { letter: 'i', urdu: 'آئی', phonetic: 'eye', example: 'ink - سیاہی' },
    { letter: 'j', urdu: 'جے', phonetic: 'jay', example: 'jar - برتن' },
    { letter: 'k', urdu: 'کے', phonetic: 'kay', example: 'kite - پتنگ' },
    { letter: 'l', urdu: 'ایل', phonetic: 'el', example: 'lamp - چراغ' },
    { letter: 'm', urdu: 'ایم', phonetic: 'em', example: 'man - آدمی' },
    { letter: 'n', urdu: 'این', phonetic: 'en', example: 'net - جال' },
    { letter: 'o', urdu: 'او', phonetic: 'oh', example: 'owl - الو' },
    { letter: 'p', urdu: 'پی', phonetic: 'pee', example: 'pot - برتن' },
    { letter: 'q', urdu: 'کیو', phonetic: 'cue', example: 'quilt - رضائی' },
    { letter: 'r', urdu: 'آر', phonetic: 'ar', example: 'rat - چوہا' },
    { letter: 's', urdu: 'ایس', phonetic: 'es', example: 'star - ستارہ' },
    { letter: 't', urdu: 'ٹی', phonetic: 'tee', example: 'top - اوپر' },
    { letter: 'u', urdu: 'یو', phonetic: 'you', example: 'up - اوپر' },
    { letter: 'v', urdu: 'وی', phonetic: 'vee', example: 'vase - گلدان' },
    { letter: 'w', urdu: 'ڈبلیو', phonetic: 'double-you', example: 'wall - دیوار' },
    { letter: 'x', urdu: 'ایکس', phonetic: 'ex', example: 'box - ڈبہ' },
    { letter: 'y', urdu: 'وائی', phonetic: 'why', example: 'yes - ہاں' },
    { letter: 'z', urdu: 'زیڈ', phonetic: 'zed', example: 'zero - صفر' }
];

const countingData = [
    { number: '1', urdu: 'ایک', phonetic: 'ayk', word: 'One' },
    { number: '2', urdu: 'دو', phonetic: 'do', word: 'Two' },
    { number: '3', urdu: 'تین', phonetic: 'teen', word: 'Three' },
    { number: '4', urdu: 'چار', phonetic: 'char', word: 'Four' },
    { number: '5', urdu: 'پانچ', phonetic: 'panch', word: 'Five' },
    { number: '6', urdu: 'چھ', phonetic: 'chhe', word: 'Six' },
    { number: '7', urdu: 'سات', phonetic: 'saat', word: 'Seven' },
    { number: '8', urdu: 'آٹھ', phonetic: 'aath', word: 'Eight' },
    { number: '9', urdu: 'نو', phonetic: 'no', word: 'Nine' },
    { number: '10', urdu: 'دس', phonetic: 'das', word: 'Ten' },
    { number: '11', urdu: 'گیارہ', phonetic: 'gyarah', word: 'Eleven' },
    { number: '12', urdu: 'بارہ', phonetic: 'barah', word: 'Twelve' },
    { number: '13', urdu: 'تیرہ', phonetic: 'terah', word: 'Thirteen' },
    { number: '14', urdu: 'چودہ', phonetic: 'chaudah', word: 'Fourteen' },
    { number: '15', urdu: 'پندرہ', phonetic: 'pandrah', word: 'Fifteen' },
    { number: '16', urdu: 'سولہ', phonetic: 'solah', word: 'Sixteen' },
    { number: '17', urdu: 'سترہ', phonetic: 'satrah', word: 'Seventeen' },
    { number: '18', urdu: 'اٹھارہ', phonetic: 'atharah', word: 'Eighteen' },
    { number: '19', urdu: 'انیس', phonetic: 'unees', word: 'Nineteen' },
    { number: '20', urdu: 'بیس', phonetic: 'bees', word: 'Twenty' }
];
// js/data.js
const vocabularyData = [
    // BEGINNER LEVEL (34 words)
    {
        id: 1,
        english: "Hello",
        urdu: "ہیلو",
        phonetic: "HEH-low",
        category: "Greetings",
        difficulty: "Beginner",
        sentences: [
            {
                id: 11,
                sentence: "Hello everyone!",
                translation: "سب کو ہیلو!"
            },
            {
                id: 12,
                sentence: "Say hello to your teacher.",
                translation: "اپنے استاد کو ہیلو کہیں۔"
            },
            {
                id: 13,
                sentence: "Hello, nice to meet you.",
                translation: "ہیلو، آپ سے مل کر خوشی ہوئی۔"
            }
        ]
    },
    {
        id: 2,
        english: "Water",
        urdu: "پانی",
        phonetic: "PAH-nee",
        category: "Basic Needs",
        difficulty: "Beginner",
        sentences: [
            {
                id: 21,
                sentence: "I need water.",
                translation: "مجھے پانی چاہیے۔"
            },
            {
                id: 22,
                sentence: "The water is cold.",
                translation: "پانی ٹھنڈا ہے۔"
            },
            {
                id: 23,
                sentence: "Drink more water daily.",
                translation: "روزانہ زیادہ پانی پیئں۔"
            }
        ]
    },
    {
        id: 3,
        english: "Food",
        urdu: "کھانا",
        phonetic: "kha-NAH",
        category: "Basic Needs",
        difficulty: "Beginner",
        sentences: [
            {
                id: 31,
                sentence: "This food is delicious.",
                translation: "یہ کھانا لذیذ ہے۔"
            },
            {
                id: 32,
                sentence: "I love Pakistani food.",
                translation: "مجھے پاکستانی کھانا پسند ہے۔"
            },
            {
                id: 33,
                sentence: "We eat food together.",
                translation: "ہم مل کر کھانا کھاتے ہیں۔"
            }
        ]
    },
    {
        id: 4,
        english: "House",
        urdu: "گھر",
        phonetic: "ghar",
        category: "Places",
        difficulty: "Beginner",
        sentences: [
            {
                id: 41,
                sentence: "This is my house.",
                translation: "یہ میرا گھر ہے۔"
            },
            {
                id: 42,
                sentence: "Come to our house.",
                translation: "ہمارے گھر آئیں۔"
            },
            {
                id: 43,
                sentence: "The house is beautiful.",
                translation: "گھر خوبصورت ہے۔"
            }
        ]
    },
    {
        id: 5,
        english: "Book",
        urdu: "کتاب",
        phonetic: "ki-TAAB",
        category: "Education",
        difficulty: "Beginner",
        sentences: [
            {
                id: 51,
                sentence: "Read this book.",
                translation: "یہ کتاب پڑھیں۔"
            },
            {
                id: 52,
                sentence: "I bought a new book.",
                translation: "میں نے نئی کتاب خریدی۔"
            },
            {
                id: 53,
                sentence: "Books are important.",
                translation: "کتابیں اہم ہیں۔"
            }
        ]
    },
    {
        id: 6,
        english: "Mother",
        urdu: "ماں",
        phonetic: "maan",
        category: "Family",
        difficulty: "Beginner",
        sentences: [
            {
                id: 61,
                sentence: "My mother is kind.",
                translation: "میری ماں مہربان ہے۔"
            },
            {
                id: 62,
                sentence: "Mother cooks dinner.",
                translation: "ماں رات کا کھانا بناتی ہے۔"
            },
            {
                id: 63,
                sentence: "I love my mother.",
                translation: "میں اپنی ماں سے محبت کرتا ہوں۔"
            }
        ]
    },
    {
        id: 7,
        english: "Father",
        urdu: "باپ",
        phonetic: "baap",
        category: "Family",
        difficulty: "Beginner",
        sentences: [
            {
                id: 71,
                sentence: "My father works hard.",
                translation: "میرے باپ محنت کرتے ہیں۔"
            },
            {
                id: 72,
                sentence: "Father drives the car.",
                translation: "باپ گاڑی چلاتے ہیں۔"
            },
            {
                id: 73,
                sentence: "Ask your father first.",
                translation: "پہلے اپنے باپ سے پوچھیں۔"
            }
        ]
    },
    {
        id: 8,
        english: "School",
        urdu: "اسکول",
        phonetic: "is-KOOL",
        category: "Education",
        difficulty: "Beginner",
        sentences: [
            {
                id: 81,
                sentence: "I go to school daily.",
                translation: "میں روزانہ اسکول جاتا ہوں۔"
            },
            {
                id: 82,
                sentence: "School starts at 8 AM.",
                translation: "اسکول صبح 8 بجے شروع ہوتا ہے۔"
            },
            {
                id: 83,
                sentence: "Our school is big.",
                translation: "ہمارا اسکول بڑا ہے۔"
            }
        ]
    },
    {
        id: 9,
        english: "Friend",
        urdu: "دوست",
        phonetic: "dost",
        category: "Relationships",
        difficulty: "Beginner",
        sentences: [
            {
                id: 91,
                sentence: "He is my best friend.",
                translation: "وہ میرا بہترین دوست ہے۔"
            },
            {
                id: 92,
                sentence: "Friends help each other.",
                translation: "دوست ایک دوسرے کی مدد کرتے ہیں۔"
            },
            {
                id: 93,
                sentence: "I made new friends.",
                translation: "میں نے نئے دوست بنائے۔"
            }
        ]
    },
    {
        id: 10,
        english: "Good",
        urdu: "اچھا",
        phonetic: "ach-CHA",
        category: "Adjectives",
        difficulty: "Beginner",
        sentences: [
            {
                id: 101,
                sentence: "This is very good.",
                translation: "یہ بہت اچھا ہے۔"
            },
            {
                id: 102,
                sentence: "You did a good job.",
                translation: "آپ نے اچھا کام کیا۔"
            },
            {
                id: 103,
                sentence: "Good morning everyone.",
                translation: "سب کو صبح بخیر۔"
            }
        ]
    },
    {
        id: 11,
        english: "Bad",
        urdu: "برا",
        phonetic: "bu-RAH",
        category: "Adjectives",
        difficulty: "Beginner",
        sentences: [
            {
                id: 111,
                sentence: "That's a bad idea.",
                translation: "یہ برا خیال ہے۔"
            },
            {
                id: 112,
                sentence: "Bad weather today.",
                translation: "آج برا موسم ہے۔"
            },
            {
                id: 113,
                sentence: "Don't do bad things.",
                translation: "برے کام نہ کریں۔"
            }
        ]
    },
    {
        id: 12,
        english: "Big",
        urdu: "بڑا",
        phonetic: "ba-DAH",
        category: "Adjectives",
        difficulty: "Beginner",
        sentences: [
            {
                id: 121,
                sentence: "That's a big elephant.",
                translation: "یہ بڑا ہاتھی ہے۔"
            },
            {
                id: 122,
                sentence: "I want a big pizza.",
                translation: "مجھے بڑا پیزا چاہیے۔"
            },
            {
                id: 123,
                sentence: "Big dreams come true.",
                translation: "بڑے خواب پورے ہوتے ہیں۔"
            }
        ]
    },
    {
        id: 13,
        english: "Small",
        urdu: "چھوٹا",
        phonetic: "chho-TAH",
        category: "Adjectives",
        difficulty: "Beginner",
        sentences: [
            {
                id: 131,
                sentence: "A small child is playing.",
                translation: "ایک چھوٹا بچہ کھیل رہا ہے۔"
            },
            {
                id: 132,
                sentence: "This room is small.",
                translation: "یہ کمرہ چھوٹا ہے۔"
            },
            {
                id: 133,
                sentence: "Small steps lead to success.",
                translation: "چھوٹے قدم کامیابی کی طرف لے جاتے ہیں۔"
            }
        ]
    },
    {
        id: 14,
        english: "Happy",
        urdu: "خوش",
        phonetic: "khush",
        category: "Emotions",
        difficulty: "Beginner",
        sentences: [
            {
                id: 141,
                sentence: "I am very happy today.",
                translation: "میں آج بہت خوش ہوں۔"
            },
            {
                id: 142,
                sentence: "Happy birthday to you!",
                translation: "آپ کو سالگرہ مبارک!"
            },
            {
                id: 143,
                sentence: "She looks happy.",
                translation: "وہ خوش نظر آ رہی ہے۔"
            }
        ]
    },
    {
        id: 15,
        english: "Sad",
        urdu: "غمگین",
        phonetic: "gham-GEEN",
        category: "Emotions",
        difficulty: "Beginner",
        sentences: [
            {
                id: 151,
                sentence: "Don't be sad.",
                translation: "غمگین نہ ہوں۔"
            },
            {
                id: 152,
                sentence: "The sad story made me cry.",
                translation: "غمگین کہانی نے مجھے رلا دیا۔"
            },
            {
                id: 153,
                sentence: "Why are you sad?",
                translation: "آپ کیوں غمگین ہیں؟"
            }
        ]
    },
    {
        id: 16,
        english: "Car",
        urdu: "گاڑی",
        phonetic: "GAH-ree",
        category: "Transportation",
        difficulty: "Beginner",
        sentences: [
            {
                id: 161,
                sentence: "My car is red.",
                translation: "میری گاڑی لال ہے۔"
            },
            {
                id: 162,
                sentence: "The car is very fast.",
                translation: "گاڑی بہت تیز ہے۔"
            },
            {
                id: 163,
                sentence: "Park the car here.",
                translation: "گاڑی یہاں کھڑی کریں۔"
            }
        ]
    },
    {
        id: 17,
        english: "Dog",
        urdu: "کتا",
        phonetic: "kut-TAH",
        category: "Animals",
        difficulty: "Beginner",
        sentences: [
            {
                id: 171,
                sentence: "The dog is barking.",
                translation: "کتا بھونک رہا ہے۔"
            },
            {
                id: 172,
                sentence: "I love my pet dog.",
                translation: "میں اپنے پالتو کتے سے محبت کرتا ہوں۔"
            },
            {
                id: 173,
                sentence: "Feed the dog daily.",
                translation: "کتے کو روزانہ کھانا دیں۔"
            }
        ]
    },
    {
        id: 18,
        english: "Cat",
        urdu: "بلی",
        phonetic: "bil-LEE",
        category: "Animals",
        difficulty: "Beginner",
        sentences: [
            {
                id: 181,
                sentence: "The cat is sleeping.",
                translation: "بلی سو رہی ہے۔"
            },
            {
                id: 182,
                sentence: "My cat loves milk.",
                translation: "میری بلی کو دودھ پسند ہے۔"
            },
            {
                id: 183,
                sentence: "Black cat crossed the road.",
                translation: "کالی بلی نے سڑک پار کی۔"
            }
        ]
    },
    {
        id: 19,
        english: "Sun",
        urdu: "سورج",
        phonetic: "soo-raj",
        category: "Nature",
        difficulty: "Beginner",
        sentences: [
            {
                id: 191,
                sentence: "The sun is bright.",
                translation: "سورج روشن ہے۔"
            },
            {
                id: 192,
                sentence: "Sun rises in the east.",
                translation: "سورج مشرق سے طلوع ہوتا ہے۔"
            },
            {
                id: 193,
                sentence: "I love sunny days.",
                translation: "مجھے دھوپ والے دن پسند ہیں۔"
            }
        ]
    },
    {
        id: 20,
        english: "Moon",
        urdu: "چاند",
        phonetic: "chaand",
        category: "Nature",
        difficulty: "Beginner",
        sentences: [
            {
                id: 201,
                sentence: "The moon is beautiful tonight.",
                translation: "آج رات چاند خوبصورت ہے۔"
            },
            {
                id: 202,
                sentence: "Full moon shines brightly.",
                translation: "پورا چاند روشن چمکتا ہے۔"
            },
            {
                id: 203,
                sentence: "Children love the moon.",
                translation: "بچے چاند سے محبت کرتے ہیں۔"
            }
        ]
    },
    {
        id: 21,
        english: "Tree",
        urdu: "درخت",
        phonetic: "da-rakht",
        category: "Nature",
        difficulty: "Beginner",
        sentences: [
            {
                id: 211,
                sentence: "The tree is very tall.",
                translation: "درخت بہت لمبا ہے۔"
            },
            {
                id: 212,
                sentence: "Birds sit on trees.",
                translation: "پرندے درختوں پر بیٹھتے ہیں۔"
            },
            {
                id: 213,
                sentence: "Plant more trees.",
                translation: "زیادہ درخت لگائیں۔"
            }
        ]
    },
    {
        id: 22,
        english: "Red",
        urdu: "لال",
        phonetic: "laal",
        category: "Colors",
        difficulty: "Beginner",
        sentences: [
            {
                id: 221,
                sentence: "I like red apples.",
                translation: "مجھے لال سیب پسند ہیں۔"
            },
            {
                id: 222,
                sentence: "She wore a red dress.",
                translation: "اس نے لال لباس پہنا۔"
            },
            {
                id: 223,
                sentence: "Red is a bright color.",
                translation: "لال ایک روشن رنگ ہے۔"
            }
        ]
    },
    {
        id: 23,
        english: "Blue",
        urdu: "نیلا",
        phonetic: "nee-LAH",
        category: "Colors",
        difficulty: "Beginner",
        sentences: [
            {
                id: 231,
                sentence: "The sky is blue.",
                translation: "آسمان نیلا ہے۔"
            },
            {
                id: 232,
                sentence: "I have blue eyes.",
                translation: "میری آنکھیں نیلی ہیں۔"
            },
            {
                id: 233,
                sentence: "Blue is my favorite color.",
                translation: "نیلا میرا پسندیدہ رنگ ہے۔"
            }
        ]
    },
    {
        id: 24,
        english: "Green",
        urdu: "ہرا",
        phonetic: "ha-RAH",
        category: "Colors",
        difficulty: "Beginner",
        sentences: [
            {
                id: 241,
                sentence: "Grass is green.",
                translation: "گھاس ہری ہے۔"
            },
            {
                id: 242,
                sentence: "Green vegetables are healthy.",
                translation: "ہری سبزیاں صحت مند ہیں۔"
            },
            {
                id: 243,
                sentence: "I love green tea.",
                translation: "مجھے ہری چائے پسند ہے۔"
            }
        ]
    },
    {
        id: 25,
        english: "One",
        urdu: "ایک",
        phonetic: "aik",
        category: "Numbers",
        difficulty: "Beginner",
        sentences: [
            {
                id: 251,
                sentence: "I have one brother.",
                translation: "میرا ایک بھائی ہے۔"
            },
            {
                id: 252,
                sentence: "One apple please.",
                translation: "ایک سیب دیں۔"
            },
            {
                id: 253,
                sentence: "One step at a time.",
                translation: "ایک وقت میں ایک قدم۔"
            }
        ]
    },
    {
        id: 26,
        english: "Two",
        urdu: "دو",
        phonetic: "do",
        category: "Numbers",
        difficulty: "Beginner",
        sentences: [
            {
                id: 261,
                sentence: "I have two hands.",
                translation: "میرے دو ہاتھ ہیں۔"
            },
            {
                id: 262,
                sentence: "Two plus two equals four.",
                translation: "دو اور دو چار ہوتے ہیں۔"
            },
            {
                id: 263,
                sentence: "Wait for two minutes.",
                translation: "دو منٹ انتظار کریں۔"
            }
        ]
    },
    {
        id: 27,
        english: "Three",
        urdu: "تین",
        phonetic: "teen",
        category: "Numbers",
        difficulty: "Beginner",
        sentences: [
            {
                id: 271,
                sentence: "I have three sisters.",
                translation: "میری تین بہنیں ہیں۔"
            },
            {
                id: 272,
                sentence: "Count to three.",
                translation: "تین تک گنیں۔"
            },
            {
                id: 273,
                sentence: "Three meals a day.",
                translation: "دن میں تین وقت کھانا۔"
            }
        ]
    },
    {
        id: 28,
        english: "Yes",
        urdu: "ہاں",
        phonetic: "haan",
        category: "Responses",
        difficulty: "Beginner",
        sentences: [
            {
                id: 281,
                sentence: "Yes, I agree.",
                translation: "ہاں، میں متفق ہوں۔"
            },
            {
                id: 282,
                sentence: "Yes, that's correct.",
                translation: "ہاں، یہ درست ہے۔"
            },
            {
                id: 283,
                sentence: "Say yes to opportunities.",
                translation: "مواقع کے لیے ہاں کہیں۔"
            }
        ]
    },
    {
        id: 29,
        english: "No",
        urdu: "نہیں",
        phonetic: "na-HEEN",
        category: "Responses",
        difficulty: "Beginner",
        sentences: [
            {
                id: 291,
                sentence: "No, I don't want that.",
                translation: "نہیں، مجھے وہ نہیں چاہیے۔"
            },
            {
                id: 292,
                sentence: "No smoking here please.",
                translation: "یہاں سگریٹ نوشی نہیں۔"
            },
            {
                id: 293,
                sentence: "No problem at all.",
                translation: "کوئی مسئلہ نہیں۔"
            }
        ]
    },
    {
        id: 30,
        english: "Come",
        urdu: "آؤ",
        phonetic: "aa-o",
        category: "Actions",
        difficulty: "Beginner",
        sentences: [
            {
                id: 301,
                sentence: "Come here quickly.",
                translation: "یہاں جلدی آؤ۔"
            },
            {
                id: 302,
                sentence: "Come to my birthday party.",
                translation: "میری سالگرہ کی پارٹی میں آؤ۔"
            },
            {
                id: 303,
                sentence: "Come and sit with us.",
                translation: "آؤ اور ہمارے ساتھ بیٹھو۔"
            }
        ]
    },
    {
        id: 31,
        english: "Go",
        urdu: "جاؤ",
        phonetic: "jaa-o",
        category: "Actions",
        difficulty: "Beginner",
        sentences: [
            {
                id: 311,
                sentence: "Go to your room.",
                translation: "اپنے کمرے میں جاؤ۔"
            },
            {
                id: 312,
                sentence: "Let's go to the park.",
                translation: "چلو پارک چلتے ہیں۔"
            },
            {
                id: 313,
                sentence: "Go slowly and carefully.",
                translation: "آہستہ اور احتیاط سے جاؤ۔"
            }
        ]
    },
    {
        id: 32,
        english: "Eat",
        urdu: "کھانا",
        phonetic: "khaa-NAH",
        category: "Actions",
        difficulty: "Beginner",
        sentences: [
            {
                id: 321,
                sentence: "Time to eat dinner.",
                translation: "رات کا کھانا کھانے کا وقت۔"
            },
            {
                id: 322,
                sentence: "Eat healthy food.",
                translation: "صحت مند کھانا کھائیں۔"
            },
            {
                id: 323,
                sentence: "Don't eat too much.",
                translation: "زیادہ نہ کھائیں۔"
            }
        ]
    },
    {
        id: 33,
        english: "Drink",
        urdu: "پینا",
        phonetic: "pee-NAH",
        category: "Actions",
        difficulty: "Beginner",
        sentences: [
            {
                id: 331,
                sentence: "Drink your milk.",
                translation: "اپنا دودھ پیئں۔"
            },
            {
                id: 332,
                sentence: "I drink tea every morning.",
                translation: "میں ہر صبح چائے پیتا ہوں۔"
            },
            {
                id: 333,
                sentence: "Drink plenty of water.",
                translation: "بہت پانی پیئں۔"
            }
        ]
    },
    {
        id: 34,
        english: "Sleep",
        urdu: "سونا",
        phonetic: "so-NAH",
        category: "Actions",
        difficulty: "Beginner",
        sentences: [
            {
                id: 341,
                sentence: "I need to sleep now.",
                translation: "مجھے اب سونا ہے۔"
            },
            {
                id: 342,
                sentence: "Sleep well tonight.",
                translation: "آج رات اچھی نیند لیں۔"
            },
            {
                id: 343,
                sentence: "Children sleep early.",
                translation: "بچے جلدی سوتے ہیں۔"
            }
        ]
    },

    // MEDIUM LEVEL (33 words)
    {
        id: 35,
        english: "Beautiful",
        urdu: "خوبصورت",
        phonetic: "khoob-soo-rat",
        category: "Adjectives",
        difficulty: "Medium",
        sentences: [
            {
                id: 351,
                sentence: "She has a beautiful smile.",
                translation: "اس کی مسکراہٹ خوبصورت ہے۔"
            },
            {
                id: 352,
                sentence: "This garden is beautiful.",
                translation: "یہ باغ خوبصورت ہے۔"
            },
            {
                id: 353,
                sentence: "Beautiful moments are precious.",
                translation: "خوبصورت لمحے قیمتی ہوتے ہیں۔"
            }
        ]
    },
    {
        id: 36,
        english: "Understand",
        urdu: "سمجھنا",
        phonetic: "samajh-NAH",
        category: "Mental Actions",
        difficulty: "Medium",
        sentences: [
            {
                id: 361,
                sentence: "Do you understand the lesson?",
                translation: "کیا آپ سبق سمجھتے ہیں؟"
            },
            {
                id: 362,
                sentence: "I understand your problem.",
                translation: "میں آپ کا مسئلہ سمجھتا ہوں۔"
            },
            {
                id: 363,
                sentence: "Understanding takes time.",
                translation: "سمجھنے میں وقت لگتا ہے۔"
            }
        ]
    },
    {
        id: 37,
        english: "Important",
        urdu: "اہم",
        phonetic: "a-HAM",
        category: "Adjectives",
        difficulty: "Medium",
        sentences: [
            {
                id: 371,
                sentence: "Education is very important.",
                translation: "تعلیم بہت اہم ہے۔"
            },
            {
                id: 372,
                sentence: "This meeting is important.",
                translation: "یہ میٹنگ اہم ہے۔"
            },
            {
                id: 373,
                sentence: "Family is the most important.",
                translation: "خاندان سب سے اہم ہے۔"
            }
        ]
    },
    {
        id: 38,
        english: "Different",
        urdu: "مختلف",
        phonetic: "mukh-ta-lif",
        category: "Adjectives",
        difficulty: "Medium",
        sentences: [
            {
                id: 381,
                sentence: "Everyone is different.",
                translation: "ہر شخص مختلف ہے۔"
            },
            {
                id: 382,
                sentence: "Try different approaches.",
                translation: "مختلف طریقے آزمائیں۔"
            },
            {
                id: 383,
                sentence: "Different cultures are interesting.",
                translation: "مختلف ثقافتیں دلچسپ ہیں۔"
            }
        ]
    },
    {
        id: 39,
        english: "Necessary",
        urdu: "ضروری",
        phonetic: "za-roo-ree",
        category: "Adjectives",
        difficulty: "Medium",
        sentences: [
            {
                id: 391,
                sentence: "Exercise is necessary for health.",
                translation: "ورزش صحت کے لیے ضروری ہے۔"
            },
            {
                id: 392,
                sentence: "It's necessary to study hard.",
                translation: "محنت سے پڑھنا ضروری ہے۔"
            },
            {
                id: 393,
                sentence: "Necessary changes must be made.",
                translation: "ضروری تبدیلیاں کرنی چاہیئں۔"
            }
        ]
    },
    {
        id: 40,
        english: "Difficult",
        urdu: "مشکل",
        phonetic: "mush-kil",
        category: "Adjectives",
        difficulty: "Medium",
        sentences: [
            {
                id: 401,
                sentence: "This question is difficult.",
                translation: "یہ سوال مشکل ہے۔"
            },
            {
                id: 402,
                sentence: "Learning new languages is difficult.",
                translation: "نئی زبانیں سیکھنا مشکل ہے۔"
            },
            {
                id: 403,
                sentence: "Nothing is too difficult.",
                translation: "کچھ بھی زیادہ مشکل نہیں۔"
            }
        ]
    },
    {
        id: 41,
        english: "Remember",
        urdu: "یاد رکھنا",
        phonetic: "yaad rakh-NAH",
        category: "Mental Actions",
        difficulty: "Medium",
        sentences: [
            {
                id: 411,
                sentence: "Remember to call me.",
                translation: "مجھے فون کرنا یاد رکھیں۔"
            },
            {
                id: 412,
                sentence: "I can't remember his name.",
                translation: "مجھے اس کا نام یاد نہیں۔"
            },
            {
                id: 413,
                sentence: "Remember the good times.",
                translation: "اچھے وقت کو یاد رکھیں۔"
            }
        ]
    },
    {
        id: 42,
        english: "Forget",
        urdu: "بھولنا",
        phonetic: "bhool-NAH",
        category: "Mental Actions",
        difficulty: "Medium",
        sentences: [
            {
                id: 421,
                sentence: "Don't forget your homework.",
                translation: "اپنا ہوم ورک نہ بھولیں۔"
            },
            {
                id: 422,
                sentence: "I always forget names.",
                translation: "میں ہمیشہ نام بھول جاتا ہوں۔"
            },
            {
                id: 423,
                sentence: "Time helps us forget pain.",
                translation: "وقت ہمیں درد بھولنے میں مدد کرتا ہے۔"
            }
        ]
    },
    {
        id: 43,
        english: "Believe",
        urdu: "یقین کرنا",
        phonetic: "ya-keen kar-NAH",
        category: "Mental Actions",
        difficulty: "Medium",
        sentences: [
            {
                id: 431,
                sentence: "I believe in hard work.",
                translation: "میں محنت پر یقین رکھتا ہوں۔"
            },
            {
                id: 432,
                sentence: "Believe in yourself.",
                translation: "اپنے آپ پر یقین رکھیں۔"
            },
            {
                id: 433,
                sentence: "Do you believe this story?",
                translation: "کیا آپ اس کہانی پر یقین کرتے ہیں؟"
            }
        ]
    },
    {
        id: 44,
        english: "Knowledge",
        urdu: "علم",
        phonetic: "ilm",
        category: "Abstract Concepts",
        difficulty: "Medium",
        sentences: [
            {
                id: 441,
                sentence: "Knowledge is power.",
                translation: "علم طاقت ہے۔"
            },
            {
                id: 442,
                sentence: "Share your knowledge with others.",
                translation: "اپنا علم دوسروں کے ساتھ بانٹیں۔"
            },
            {
                id: 443,
                sentence: "Knowledge comes from experience.",
                translation: "علم تجربے سے آتا ہے۔"
            }
        ]
    },
    {
        id: 45,
        english: "Experience",
        urdu: "تجربہ",
        phonetic: "taj-ri-BAH",
        category: "Abstract Concepts",
        difficulty: "Medium",
        sentences: [
            {
                id: 451,
                sentence: "Experience teaches us lessons.",
                translation: "تجربہ ہمیں سبق سکھاتا ہے۔"
            },
            {
                id: 452,
                sentence: "I have work experience.",
                translation: "میرے پاس کام کا تجربہ ہے۔"
            },
            {
                id: 453,
                sentence: "This was a good experience.",
                translation: "یہ ایک اچھا تجربہ تھا۔"
            }
        ]
    },
    {
        id: 46,
        english: "Problem",
        urdu: "مسئلہ",
        phonetic: "mas-a-LAH",
        category: "Abstract Concepts",
        difficulty: "Medium",
        sentences: [
            {
                id: 461,
                sentence: "Every problem has a solution.",
                translation: "ہر مسئلے کا حل ہوتا ہے۔"
            },
            {
                id: 462,
                sentence: "What's the main problem?",
                translation: "اصل مسئلہ کیا ہے؟"
            },
            {
                id: 463,
                sentence: "Let's solve this problem together.",
                translation: "آئیے اس مسئلے کو مل کر حل کرتے ہیں۔"
            }
        ]
    },
    {
        id: 47,
        english: "Solution",
        urdu: "حل",
        phonetic: "hal",
        category: "Abstract Concepts",
        difficulty: "Medium",
        sentences: [
            {
                id: 471,
                sentence: "We found the perfect solution.",
                translation: "ہمیں بہترین حل مل گیا۔"
            },
            {
                id: 472,
                sentence: "Simple solutions work best.",
                translation: "آسان حل بہترین کام کرتے ہیں۔"
            },
            {
                id: 473,
                sentence: "Every solution creates new possibilities.",
                translation: "ہر حل نئے امکانات پیدا کرتا ہے۔"
            }
        ]
    },
    {
        id: 48,
        english: "Opportunity",
        urdu: "موقع",
        phonetic: "mau-qa",
        category: "Abstract Concepts",
        difficulty: "Medium",
        sentences: [
            {
                id: 481,
                sentence: "This is a great opportunity.",
                translation: "یہ ایک بہترین موقع ہے۔"
            },
            {
                id: 482,
                sentence: "Opportunity knocks once.",
                translation: "موقع ایک بار آتا ہے۔"
            },
            {
                id: 483,
                sentence: "Create your own opportunities.",
                translation: "اپنے موقع خود بنائیں۔"
            }
        ]
    },
    {
        id: 49,
        english: "Decision",
        urdu: "فیصلہ",
        phonetic: "fais-LAH",
        category: "Abstract Concepts",
        difficulty: "Medium",
        sentences: [
            {
                id: 491,
                sentence: "Make a wise decision.",
                translation: "عقلمندی کا فیصلہ کریں۔"
            },
            {
                id: 492,
                sentence: "This decision will change everything.",
                translation: "یہ فیصلہ سب کچھ بدل دے گا۔"
            },
            {
                id: 493,
                sentence: "Think before making decisions.",
                translation: "فیصلہ کرنے سے پہلے سوچیں۔"
            }
        ]
    },
    {
        id: 50,
        english: "Success",
        urdu: "کامیابی",
        phonetic: "kaa-mi-yaa-bee",
        category: "Abstract Concepts",
        difficulty: "Medium",
        sentences: [
            {
                id: 501,
                sentence: "Success requires hard work.",
                translation: "کامیابی کے لیے محنت چاہیے۔"
            },
            {
                id: 502,
                sentence: "Celebrate your success.",
                translation: "اپنی کامیابی کا جشن منائیں۔"
            },
            {
                id: 503,
                sentence: "Success comes to those who wait.",
                translation: "کامیابی صبر کرنے والوں کو ملتی ہے۔"
            }
        ]
    },
    {
        id: 51,
        english: "Failure",
        urdu: "ناکامی",
        phonetic: "naa-kaa-mee",
        category: "Abstract Concepts",
        difficulty: "Medium",
        sentences: [
            {
                id: 511,
                sentence: "Failure is a part of learning.",
                translation: "ناکامی سیکھنے کا حصہ ہے۔"
            },
            {
                id: 512,
                sentence: "Don't fear failure.",
                translation: "ناکامی سے نہ ڈریں۔"
            },
            {
                id: 513,
                sentence: "Learn from your failures.",
                translation: "اپنی ناکامیوں سے سیکھیں۔"
            }
        ]
    },
    {
        id: 52,
        english: "Progress",
        urdu: "ترقی",
        phonetic: "ta-rak-kee",
        category: "Abstract Concepts",
        difficulty: "Medium",
        sentences: [
            {
                id: 521,
                sentence: "We are making good progress.",
                translation: "ہم اچھی ترقی کر رہے ہیں۔"
            },
            {
                id: 522,
                sentence: "Progress takes patience.",
                translation: "ترقی میں صبر چاہیے۔"
            },
            {
                id: 523,
                sentence: "Technology brings progress.",
                translation: "ٹیکنالوجی ترقی لاتی ہے۔"
            }
        ]
    },
    {
        id: 53,
        english: "Relationship",
        urdu: "رشتہ",
        phonetic: "rish-TAH",
        category: "Relationships",
        difficulty: "Medium",
        sentences: [
            {
                id: 531,
                sentence: "Healthy relationships matter.",
                translation: "صحت مند رشتے اہم ہیں۔"
            },
            {
                id: 532,
                sentence: "Build strong relationships.",
                translation: "مضبوط رشتے بنائیں۔"
            },
            {
                id: 533,
                sentence: "Relationships need care.",
                translation: "رشتوں کو دیکھ بھال چاہیے۔"
            }
        ]
    },
    {
        id: 54,
        english: "Responsibility",
        urdu: "ذمہ داری",
        phonetic: "zim-meh-daa-ree",
        category: "Abstract Concepts",
        difficulty: "Medium",
        sentences: [
            {
                id: 541,
                sentence: "This is your responsibility.",
                translation: "یہ آپ کی ذمہ داری ہے۔"
            },
            {
                id: 542,
                sentence: "Take responsibility for your actions.",
                translation: "اپنے اعمال کی ذمہ داری لیں۔"
            },
            {
                id: 543,
                sentence: "Great responsibility comes with power.",
                translation: "طاقت کے ساتھ بڑی ذمہ داری آتی ہے۔"
            }
        ]
    },
    {
        id: 55,
        english: "Environment",
        urdu: "ماحول",
        phonetic: "maa-hol",
        category: "Nature",
        difficulty: "Medium",
        sentences: [
            {
                id: 551,
                sentence: "Protect the environment.",
                translation: "ماحول کی حفاظت کریں۔"
            },
            {
                id: 552,
                sentence: "Clean environment is healthy.",
                translation: "صاف ماحول صحت مند ہے۔"
            },
            {
                id: 553,
                sentence: "Pollution damages the environment.",
                translation: "آلودگی ماحول کو نقصان پہنچاتی ہے۔"
            }
        ]
    },
    {
        id: 56,
        english: "Communication",
        urdu: "رابطہ",
        phonetic: "raa-bi-TAH",
        category: "Social Skills",
        difficulty: "Medium",
        sentences: [
            {
                id: 561,
                sentence: "Good communication is essential.",
                translation: "اچھا رابطہ ضروری ہے۔"
            },
            {
                id: 562,
                sentence: "Improve your communication skills.",
                translation: "اپنی رابطہ کاری کی مہارت بہتر بنائیں۔"
            },
            {
                id: 563,
                sentence: "Communication builds trust.",
                translation: "رابطہ اعتماد بناتا ہے۔"
            }
        ]
    },
    {
        id: 57,
        english: "Technology",
        urdu: "ٹیکنالوجی",
        phonetic: "tek-no-lo-jee",
        category: "Modern Life",
        difficulty: "Medium",
        sentences: [
            {
                id: 571,
                sentence: "Technology changes our lives.",
                translation: "ٹیکنالوجی ہماری زندگی بدلتی ہے۔"
            },
            {
                id: 572,
                sentence: "Learn new technology skills.",
                translation: "نئی ٹیکنالوجی کی مہارت سیکھیں۔"
            },
            {
                id: 573,
                sentence: "Technology helps education.",
                translation: "ٹیکنالوجی تعلیم میں مدد کرتی ہے۔"
            }
        ]
    },
    {
        id: 58,
        english: "Culture",
        urdu: "ثقافت",
        phonetic: "sa-qaa-fat",
        category: "Society",
        difficulty: "Medium",
        sentences: [
            {
                id: 581,
                sentence: "Pakistani culture is rich.",
                translation: "پاکستانی ثقافت بھرپور ہے۔"
            },
            {
                id: 582,
                sentence: "Respect different cultures.",
                translation: "مختلف ثقافتوں کا احترام کریں۔"
            },
            {
                id: 583,
                sentence: "Culture shapes our identity.",
                translation: "ثقافت ہماری شناخت بناتی ہے۔"
            }
        ]
    },
    {
        id: 59,
        english: "Community",
        urdu: "برادری",
        phonetic: "bi-raa-da-ree",
        category: "Society",
        difficulty: "Medium",
        sentences: [
            {
                id: 591,
                sentence: "Our community is united.",
                translation: "ہماری برادری متحد ہے۔"
            },
            {
                id: 592,
                sentence: "Help your community grow.",
                translation: "اپنی برادری کو بڑھنے میں مدد کریں۔"
            },
            {
                id: 593,
                sentence: "Community service is valuable.",
                translation: "برادری کی خدمت قیمتی ہے۔"
            }
        ]
    },
    {
        id: 60,
        english: "Development",
        urdu: "ترقی",
        phonetic: "ta-rak-kee",
        category: "Progress",
        difficulty: "Medium",
        sentences: [
            {
                id: 601,
                sentence: "Personal development is important.",
                translation: "ذاتی ترقی اہم ہے۔"
            },
            {
                id: 602,
                sentence: "The city's development is rapid.",
                translation: "شہر کی ترقی تیز ہے۔"
            },
            {
                id: 603,
                sentence: "Development requires planning.",
                translation: "ترقی کے لیے منصوبہ بندی چاہیے۔"
            }
        ]
    },
    {
        id: 61,
        english: "Education",
        urdu: "تعلیم",
        phonetic: "ta-leem",
        category: "Learning",
        difficulty: "Medium",
        sentences: [
            {
                id: 611,
                sentence: "Education opens doors.",
                translation: "تعلیم راستے کھولتی ہے۔"
            },
            {
                id: 612,
                sentence: "Quality education matters.",
                translation: "معیاری تعلیم اہم ہے۔"
            },
            {
                id: 613,
                sentence: "Education is a basic right.",
                translation: "تعلیم بنیادی حق ہے۔"
            }
        ]
    },
    {
        id: 62,
        english: "Health",
        urdu: "صحت",
        phonetic: "si-hat",
        category: "Well-being",
        difficulty: "Medium",
        sentences: [
            {
                id: 621,
                sentence: "Health is wealth.",
                translation: "صحت دولت ہے۔"
            },
            {
                id: 622,
                sentence: "Take care of your health.",
                translation: "اپنی صحت کا خیال رکھیں۔"
            },
            {
                id: 623,
                sentence: "Mental health is important too.",
                translation: "ذہنی صحت بھی اہم ہے۔"
            }
        ]
    },
    {
        id: 63,
        english: "Business",
        urdu: "کاروبار",
        phonetic: "kaa-ro-baar",
        category: "Work",
        difficulty: "Medium",
        sentences: [
            {
                id: 631,
                sentence: "Start your own business.",
                translation: "اپنا کاروبار شروع کریں۔"
            },
            {
                id: 632,
                sentence: "Business requires dedication.",
                translation: "کاروبار میں لگن چاہیے۔"
            },
            {
                id: 633,
                sentence: "Small business creates jobs.",
                translation: "چھوٹا کاروبار ملازمت پیدا کرتا ہے۔"
            }
        ]
    },
    {
        id: 64,
        english: "Government",
        urdu: "حکومت",
        phonetic: "hu-koo-mat",
        category: "Politics",
        difficulty: "Medium",
        sentences: [
            {
                id: 641,
                sentence: "Government serves the people.",
                translation: "حکومت عوام کی خدمت کرتی ہے۔"
            },
            {
                id: 642,
                sentence: "Good government brings prosperity.",
                translation: "اچھی حکومت خوشحالی لاتی ہے۔"
            },
            {
                id: 643,
                sentence: "Citizens should support good government.",
                translation: "شہریوں کو اچھی حکومت کا ساتھ دینا چاہیے۔"
            }
        ]
    },
    {
        id: 65,
        english: "Economy",
        urdu: "معیشت",
        phonetic: "mai-shat",
        category: "Economics",
        difficulty: "Medium",
        sentences: [
            {
                id: 651,
                sentence: "The economy is growing.",
                translation: "معیشت بڑھ رہی ہے۔"
            },
            {
                id: 652,
                sentence: "Strong economy helps everyone.",
                translation: "مضبوط معیشت سب کی مدد کرتی ہے۔"
            },
            {
                id: 653,
                sentence: "Education improves the economy.",
                translation: "تعلیم معیشت کو بہتر بناتی ہے۔"
            }
        ]
    },
    {
        id: 66,
        english: "Strategy",
        urdu: "حکمت عملی",
        phonetic: "hik-mat am-lee",
        category: "Planning",
        difficulty: "Medium",
        sentences: [
            {
                id: 661,
                sentence: "We need a new strategy.",
                translation: "ہمیں نئی حکمت عملی چاہیے۔"
            },
            {
                id: 662,
                sentence: "Good strategy wins games.",
                translation: "اچھی حکمت عملی کھیل جتاتی ہے۔"
            },
            {
                id: 663,
                sentence: "Plan your strategy carefully.",
                translation: "اپنی حکمت عملی احتیاط سے بنائیں۔"
            }
        ]
    },
    {
        id: 67,
        english: "Management",
        urdu: "انتظام",
        phonetic: "in-ti-zaam",
        category: "Organization",
        difficulty: "Medium",
        sentences: [
            {
                id: 671,
                sentence: "Good management saves time.",
                translation: "اچھا انتظام وقت بچاتا ہے۔"
            },
            {
                id: 672,
                sentence: "Time management is crucial.",
                translation: "وقت کا انتظام انتہائی اہم ہے۔"
            },
            {
                id: 673,
                sentence: "Learn management skills.",
                translation: "انتظام کی مہارت سیکھیں۔"
            }
        ]
    },

    // HARD LEVEL (33 words)
    {
        id: 68,
        english: "Philosophical",
        urdu: "فلسفیانہ",
        phonetic: "fal-sa-fee-aa-nah",
        category: "Abstract Thinking",
        difficulty: "Hard",
        sentences: [
            {
                id: 681,
                sentence: "He asked a philosophical question.",
                translation: "اس نے ایک فلسفیانہ سوال پوچھا۔"
            },
            {
                id: 682,
                sentence: "Philosophical thinking develops wisdom.",
                translation: "فلسفیانہ سوچ دانائی پیدا کرتی ہے۔"
            },
            {
                id: 683,
                sentence: "Ancient philosophical texts guide us.",
                translation: "قدیم فلسفیانہ تحریریں ہماری رہنمائی کرتی ہیں۔"
            }
        ]
    },
    {
        id: 69,
        english: "Sophisticated",
        urdu: "پیچیدہ",
        phonetic: "pai-chee-dah",
        category: "Complexity",
        difficulty: "Hard",
        sentences: [
            {
                id: 691,
                sentence: "This is a sophisticated machine.",
                translation: "یہ ایک پیچیدہ مشین ہے۔"
            },
            {
                id: 692,
                sentence: "Sophisticated algorithms solve complex problems.",
                translation: "پیچیدہ الگورتھم پیچیدہ مسائل حل کرتے ہیں۔"
            },
            {
                id: 693,
                sentence: "Her sophisticated approach impressed everyone.",
                translation: "اس کے پیچیدہ انداز نے سب کو متاثر کیا۔"
            }
        ]
    },
    {
        id: 70,
        english: "Comprehensive",
        urdu: "جامع",
        phonetic: "jaa-mi",
        category: "Completeness",
        difficulty: "Hard",
        sentences: [
            {
                id: 701,
                sentence: "We need a comprehensive plan.",
                translation: "ہمیں ایک جامع منصوبے کی ضرورت ہے۔"
            },
            {
                id: 702,
                sentence: "Comprehensive education covers all subjects.",
                translation: "جامع تعلیم تمام مضامین پر محیط ہے۔"
            },
            {
                id: 703,
                sentence: "The report was comprehensive and detailed.",
                translation: "رپورٹ جامع اور تفصیلی تھی۔"
            }
        ]
    },
    {
        id: 71,
        english: "Unprecedented",
        urdu: "بے مثال",
        phonetic: "be-mi-saal",
        category: "Uniqueness",
        difficulty: "Hard",
        sentences: [
            {
                id: 711,
                sentence: "This is an unprecedented achievement.",
                translation: "یہ ایک بے مثال کامیابی ہے۔"
            },
            {
                id: 712,
                sentence: "Unprecedented challenges require innovation.",
                translation: "بے مثال چیلنجز کے لیے نئی ایجادات چاہیئں۔"
            },
            {
                id: 713,
                sentence: "The situation is unprecedented.",
                translation: "صورتحال بے مثال ہے۔"
            }
        ]
    },
    {
        id: 72,
        english: "Extraordinary",
        urdu: "غیر معمولی",
        phonetic: "ghair ma-moo-lee",
        category: "Exceptional",
        difficulty: "Hard",
        sentences: [
            {
                id: 721,
                sentence: "She has extraordinary talent.",
                translation: "اس کے پاس غیر معمولی صلاحیت ہے۔"
            },
            {
                id: 722,
                sentence: "Extraordinary circumstances require courage.",
                translation: "غیر معمولی حالات میں ہمت چاہیے۔"
            },
            {
                id: 723,
                sentence: "This is an extraordinary opportunity.",
                translation: "یہ ایک غیر معمولی موقع ہے۔"
            }
        ]
    },
    {
        id: 73,
        english: "Inevitable",
        urdu: "ناگزیر",
        phonetic: "naa-gu-zeer",
        category: "Certainty",
        difficulty: "Hard",
        sentences: [
            {
                id: 731,
                sentence: "Change is inevitable in life.",
                translation: "زندگی میں تبدیلی ناگزیر ہے۔"
            },
            {
                id: 732,
                sentence: "Progress makes some jobs inevitable.",
                translation: "ترقی کچھ کاموں کو ناگزیر بنا دیتی ہے۔"
            },
            {
                id: 733,
                sentence: "The outcome was inevitable.",
                translation: "نتیجہ ناگزیر تھا۔"
            }
        ]
    },
    {
        id: 74,
        english: "Magnificent",
        urdu: "شاندار",
        phonetic: "shaan-daar",
        category: "Excellence",
        difficulty: "Hard",
        sentences: [
            {
                id: 741,
                sentence: "The palace was magnificent.",
                translation: "محل شاندار تھا۔"
            },
            {
                id: 742,
                sentence: "What a magnificent performance!",
                translation: "کیا شاندار کارکردگی ہے!"
            },
            {
                id: 743,
                sentence: "Magnificent architecture inspires awe.",
                translation: "شاندار فن تعمیر حیرت پیدا کرتا ہے۔"
            }
        ]
    },
]