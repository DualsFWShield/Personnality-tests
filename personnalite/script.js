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
        displayResults();
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

        if (question.dimension === 'E/I') {
            results[input.value === 'agree' ? 'E' : 'I']++;
        } else if (question.dimension === 'S/N') {
            results[input.value === 'agree' ? 'S' : 'N']++;
        } else if (question.dimension === 'T/F') {
            results[input.value === 'agree' ? 'T' : 'F']++;
        } else if (question.dimension === 'J/P') {
            results[input.value === 'agree' ? 'J' : 'P']++;
        }
    });

    displayResults(results);
}

function displayResults(results) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';

    for (const [key, value] of Object.entries(results)) {
        const percentage = ((value / questions.length) * 100).toFixed(2);
        resultContainer.innerHTML += `<p>${key}: ${value} (${percentage}%)</p>`;
    }

    const personalityType = `${results.E > results.I ? 'E' : 'I'}${results.S > results.N ? 'S' : 'N'}${results.T > results.F ? 'T' : 'F'}${results.J > results.P ? 'J' : 'P'}`;
    resultContainer.innerHTML += `<h2>Type de personnalité: ${personalityType}</h2>`;

    // Redirection vers la page détaillée
    window.location.href = `https://www.16personalities.com/fr/la-personnalite-${personalityType.toLowerCase()}`;
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
