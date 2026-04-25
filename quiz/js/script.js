// Данные квиза
const questions = [
    {
        question: "Что ребёнку нравится больше?",
        options: [
            { text: "Считать, решать задачи", type: "A" },
            { text: "Придумывать, фантазировать", type: "B" },
            { text: "Общаться, играть с другими", type: "C" }
        ]
    },
    {
        question: "Как он решает сложную задачу?",
        options: [
            { text: "Ищет логику, пробует варианты", type: "A" },
            { text: "Делает по-своему, нестандартно", type: "B" },
            { text: "Просит помощи или обсуждает", type: "C" }
        ]
    },
    {
        question: "Что даётся легче?",
        options: [
            { text: "Цифры и правила", type: "A" },
            { text: "Рисование, истории", type: "B" },
            { text: "Командные игры", type: "C" }
        ]
    },
    {
        question: "Как ведёт себя на занятиях?",
        options: [
            { text: "Сосредоточен, внимателен", type: "A" },
            { text: "Быстро теряет интерес", type: "B" },
            { text: "Активный, общительный", type: "C" }
        ]
    },
    {
        question: "Что чаще выбирает?",
        options: [
            { text: "Конструктор / задачи", type: "A" },
            { text: "Творчество", type: "B" },
            { text: "Игры с людьми", type: "C" }
        ]
    }
];

const results = {
    A: {
        title: "Логик",
        description: "У вашего ребёнка выражено логическое мышление. Он хорошо справляется с задачами и анализом. Важно развивать гибкость мышления и поддерживать интерес к обучению."
    },
    B: {
        title: "Творец",
        description: "Ребёнок мыслит нестандартно и креативно. Важно направить этот потенциал, чтобы он не терял интерес к обучению и мог реализовать свои идеи."
    },
    C: {
        title: "Коммуникатор",
        description: "Ребёнок развивается через общение и взаимодействие. Важно создать среду, где это станет его сильной стороной."
    }
};

// Переменные состояния
let currentQuestionIndex = 0;
let answers = { A: 0, B: 0, C: 0 };

// Элементы DOM
const questionContainer = document.getElementById('questionContainer');
const resultContainer = document.getElementById('resultContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// Функция для отображения вопроса
function showQuestion(index) {
    const question = questions[index];
    questionContainer.innerHTML = `
        <h2 class="fade-in">${question.question}</h2>
        <div class="options">
            ${question.options.map((option, i) => `
                <div class="option-card" data-type="${option.type}" onclick="selectOption(this)">
                    ${option.text}
                </div>
            `).join('')}
        </div>
    `;
    updateProgress();
}

// Функция выбора варианта
function selectOption(element) {
    const type = element.getAttribute('data-type');
    answers[type]++;
    
    // Анимация выбора
    element.classList.add('selected');
    
    // Переход к следующему вопросу через 1 секунду
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion(currentQuestionIndex);
        } else {
            showResult();
        }
    }, 1000);
}

// Функция обновления прогресса
function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${currentQuestionIndex + 1}/${questions.length}`;
}

// Функция показа результата
function showResult() {
    const maxType = Object.keys(answers).reduce((a, b) => answers[a] > answers[b] ? a : b);
    const result = results[maxType];
    
    document.getElementById('resultTitle').textContent = result.title;
    document.getElementById('resultDescription').textContent = result.description;
    
    questionContainer.style.display = 'none';
    resultContainer.style.display = 'block';
    resultContainer.classList.add('fade-in');
    
    // Скрываем заголовок и подзаголовок на результатах
    document.getElementById('quizTitle').style.display = 'none';
    document.getElementById('quizSubtitle').style.display = 'none';
}

// Функция сброса квиза
function resetQuiz() {
    currentQuestionIndex = 0;
    answers = { A: 0, B: 0, C: 0 };
    
    resultContainer.style.display = 'none';
    questionContainer.style.display = 'block';
    
    document.getElementById('quizTitle').style.display = 'block';
    document.getElementById('quizSubtitle').style.display = 'block';
    
    showQuestion(0);
}

// Инициализация
showQuestion(0);