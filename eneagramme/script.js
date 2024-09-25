document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    loadProgress();
});

let questions = []; // Stocke les questions globalement
let currentQuestionIndex = 0; // Pour suivre l'index de la question actuelle
const questionsPerSection = 9; // Nombre de questions par section

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

    const startIndex = currentQuestionIndex * questionsPerSection;
    const endIndex = Math.min(startIndex + questionsPerSection, questions.length);
    
    for (let i = startIndex; i < endIndex; i++) {
        const question = questions[i];
        const savedAnswer = localStorage.getItem(`enneagram_q${question.id}`) || ''; // Récupérer la réponse sauvegardée

        const questionElement = document.createElement('div');
        questionElement.innerHTML = `
            <p>${question.text}</p>
            <input type="radio" name="enneagram_q${question.id}" value="agree" ${savedAnswer === 'agree' ? 'checked' : ''}> D'accord
            <input type="radio" name="enneagram_q${question.id}" value="neutral" ${savedAnswer === 'neutral' ? 'checked' : ''}> Neutre
            <input type="radio" name="enneagram_q${question.id}" value="disagree" ${savedAnswer === 'disagree' ? 'checked' : ''}> Pas d'accord
        `;
        questionContainer.appendChild(questionElement);
    }

    updateProgressBar();
}

function saveProgress() {
    const inputs = document.querySelectorAll('input[type="radio"]:checked');
    inputs.forEach(input => {
        localStorage.setItem(input.name, input.value);
    });
}

function loadProgress() {
    const totalQuestions = questions.length;
    const completedQuestions = Object.keys(localStorage).filter(key => key.startsWith('enneagram_q')).length;

    if (completedQuestions < totalQuestions) {
        displayQuestions();
    } else {
        calculateEnneagramResults();
    }
}

function updateProgressBar() {
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const totalQuestions = questions.length;
    const completedQuestions = currentQuestionIndex * questionsPerSection + document.querySelectorAll('input[type="radio"]:checked').length;

    const progressPercentage = (completedQuestions / totalQuestions) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

function calculateEnneagramResults() {
    const results = {
        type1: 0,
        type2: 0,
        type3: 0,
        type4: 0,
        type5: 0,
        type6: 0,
        type7: 0,
        type8: 0,
        type9: 0,
    };

    // Parcourir les réponses stockées
    questions.forEach((question) => {
        const answer = localStorage.getItem(`enneagram_q${question.id}`);
        if (answer === 'agree') {
            results[`type${question.type}`]++; // Augmenter le score du type associé
        }
    });

    // Calculer les pourcentages de chaque type
    const totalQuestionsByType = questions.reduce((acc, question) => {
        acc[question.type] = (acc[question.type] || 0) + 1;
        return acc;
    }, {});

    for (let type in results) {
        const totalQuestionsForType = totalQuestionsByType[type.replace('type', '')];

        // Vérifier si le type a bien des questions associées
        if (totalQuestionsForType > 0) {
            results[type] = ((results[type] / totalQuestionsForType) * 100).toFixed(2);
        } else {
            results[type] = 0; // Si un type n'a aucune question associée, mettre à 0%
        }
    }

    displayEnneagramResults(results);
}

function displayEnneagramResults(results) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = ''; // Réinitialiser le conteneur des résultats
    resultContainer.style.display = 'block';

    resultContainer.innerHTML += `<h2>Résultats partiels du test d'ennéagramme</h2>`;
    
    for (const [type, score] of Object.entries(results)) {
        resultContainer.innerHTML += `<p><strong>Type ${type.replace('type', '')} :</strong> ${score}%</p>`;
    }
}

// Réinitialiser le test
document.getElementById('reset-button').addEventListener('click', () => {
    localStorage.clear(); // Effacer les réponses sauvegardées
    currentQuestionIndex = 0; // Réinitialiser l'index
    displayQuestions(); // Afficher les questions
});

document.getElementById('submit-button').addEventListener('click', () => {
    saveProgress(); // Sauvegarder les réponses
    calculateEnneagramResults(); // Calculer les résultats après chaque section
    currentQuestionIndex++; // Passer à la section suivante
    if ((currentQuestionIndex * questionsPerSection) < questions.length) {
        displayQuestions(); // Afficher la section suivante
    } else {
        finalizeEnneagramResults(); // Afficher les résultats finaux si toutes les sections sont terminées
    }
});
