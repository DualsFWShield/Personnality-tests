document.addEventListener('DOMContentLoaded', () => { 
    loadQuestions();
    loadProgress();
});

let questions = []; // Stocke les questions globalement
let currentQuestionIndex = 0; // Index de la question actuelle
const questionsPerPage = 4; // Nombre de questions à afficher par page

async function loadQuestions() {
    try {
        const response = await fetch('questions.json'); // Assurez-vous que le chemin est correct
        questions = await response.json();
        displayQuestions();
    } catch (error) {
        console.error('Erreur lors du chargement des questions:', error);
    }
}

function displayQuestions() {
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = ''; // Réinitialiser le conteneur

    // Afficher les questions en fonction de l'index courant
    for (let i = currentQuestionIndex; i < currentQuestionIndex + questionsPerPage && i < questions.length; i++) {
        const question = questions[i];
        const savedAnswer = localStorage.getItem(`q${i}`) || ''; // Récupérer la réponse sauvegardée

        const questionElement = document.createElement('div');
        questionElement.innerHTML = `
            <p>${question.text}</p>
            <input type="radio" name="q${i}" value="agree" ${savedAnswer === 'agree' ? 'checked' : ''}> D'accord
            <input type="radio" name="q${i}" value="neutral" ${savedAnswer === 'neutral' ? 'checked' : ''}> Neutre
            <input type="radio" name="q${i}" value="disagree" ${savedAnswer === 'disagree' ? 'checked' : ''}> Pas d'accord
        `;
        questionContainer.appendChild(questionElement);
    }
    
    updateProgressBar(); // Met à jour la barre de progression
}

function saveProgress() {
    const inputs = document.querySelectorAll('input[type="radio"]:checked');
    inputs.forEach(input => {
        const questionIndex = parseInt(input.name.replace('q', ''));
        localStorage.setItem(`q${questionIndex}`, input.value);
    });
}

function loadProgress() {
    const totalQuestions = questions.length;
    const completedQuestions = Object.keys(localStorage).filter(key => key.startsWith('q')).length;

    updateProgressBar(); // Mise à jour de la barre de progression

    if (completedQuestions < totalQuestions) {
        displayQuestions();
    } else {
        calculateResults();
    }
}

function updateProgressBar() {
    const totalQuestions = questions.length;
    const completedQuestions = Object.keys(localStorage).filter(key => key.startsWith('q')).length;
    const progress = (completedQuestions / totalQuestions) * 100;
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = `${progress}%`;
}

function calculateResults() {
    const results = {
        E: 0,
        I: 0,
        S: 0,
        N: 0,
        T: 0,
        F: 0,
        J: 0,
        P: 0
    };

    const inputs = document.querySelectorAll('input[type="radio"]:checked');
    inputs.forEach(input => {
        const questionIndex = parseInt(input.name.replace('q', ''));
        const question = questions[questionIndex];

        // Ajustement des scores selon les réponses
        if (input.value === 'agree') {
            if (question.dimension === 'E') {
                results.E++;
            } else if (question.dimension === 'I') {
                results.I++;
            } else if (question.dimension === 'S') {
                results.S++;
            } else if (question.dimension === 'N') {
                results.N++;
            } else if (question.dimension === 'T') {
                results.T++;
            } else if (question.dimension === 'F') {
                results.F++;
            } else if (question.dimension === 'J') {
                results.J++;
            } else if (question.dimension === 'P') {
                results.P++;
            }
        } else if (input.value === 'disagree') {
            if (question.dimension === 'E') {
                results.I++;
            } else if (question.dimension === 'I') {
                results.E++;
            } else if (question.dimension === 'S') {
                results.N++;
            } else if (question.dimension === 'N') {
                results.S++;
            } else if (question.dimension === 'T') {
                results.F++;
            } else if (question.dimension === 'F') {
                results.T++;
            } else if (question.dimension === 'J') {
                results.P++;
            } else if (question.dimension === 'P') {
                results.J++;
            } 
        }
    });

    // Compte des dimensions totalisées
    const totalQuestionsE = 7;
    const totalQuestionsI = 6;
    const totalQuestionsS = 5;
    const totalQuestionsN = 6;
    const totalQuestionsT = 11;
    const totalQuestionsF = 13;
    const totalQuestionsJ = 7;
    const totalQuestionsP = 5;


    // Affichage des résultats avec calcul des pourcentages
    results.E = (results.E / totalQuestionsE * 100).toFixed(2);
    results.I = (results.I / totalQuestionsI * 100).toFixed(2);
    results.S = (results.S / totalQuestionsS * 100).toFixed(2);
    results.N = (results.N / totalQuestionsN * 100).toFixed(2);
    results.T = (results.T / totalQuestionsT * 100).toFixed(2);
    results.F = (results.F / totalQuestionsF * 100).toFixed(2);
    results.J = (results.J / totalQuestionsJ * 100).toFixed(2);
    results.P = (results.P / totalQuestionsP * 100).toFixed(2);

    displayResults(results);
}

function displayResults(results) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';

    // Affichage des résultats avec mise en forme
    for (const [key, value] of Object.entries(results)) {
        resultContainer.innerHTML += `<p style="font-weight: bold;">${key}: ${value} %</p>`;
    }

    const personalityType = `${results.E > results.I ? 'E' : 'I'}${results.S > results.N ? 'S' : 'N'}${results.T > results.F ? 'T' : 'F'}${results.J > results.P ? 'J' : 'P'}`;
    
    // Affichage du type de personnalité
    resultContainer.innerHTML += `
    <h2 style="color: blue;">Type de personnalité: ${personalityType}</h2>
    <a href="https://www.16personalities.com/fr/la-personnalite-${personalityType.toLowerCase()}">Détails</a>
    `;
}

// Réinitialiser le test
document.getElementById('reset-button').addEventListener('click', () => {
    localStorage.clear(); // Effacer les réponses sauvegardées
    currentQuestionIndex = 0; // Réinitialiser l'index des questions
    displayQuestions(); // Afficher les questions
});

// Ajoutez un écouteur d'événements sur le bouton de soumission
document.getElementById('submit-button').addEventListener('click', () => {
    saveProgress();
    currentQuestionIndex += questionsPerPage;

    if (currentQuestionIndex < questions.length) {
        displayQuestions();
    } else {
        calculateResults();
    }
});
