document.addEventListener('DOMContentLoaded', () => { 
    loadQuestions();
    loadProgress();
});

let questions = []; // Stocke les questions globalement
let currentQuestionIndex = 0; // Index de la question actuelle
const questionsPerPage = 6; // Nombre de questions à afficher par page

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

function resetResults() {
    results = {
        E: 0,
        I: 0,
        S: 0,
        N: 0,
        T: 0,
        F: 0,
        J: 0,
        P: 0
    };
}

let results = {
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0
};

function calculateResults() {
    // Réinitialiser les résultats avant de calculer
    resetResults();

    // Comptage des réponses dans localStorage
    questions.forEach((question, index) => {
        const answer = localStorage.getItem(`q${index}`);
        
        if (answer === 'agree') {
            results[question.dimension]++;
        } else if (answer === 'disagree') {
            // Inverser les points pour la dimension opposée
            if (question.dimension === 'E') results.I++;
            else if (question.dimension === 'I') results.E++;
            else if (question.dimension === 'S') results.N++;
            else if (question.dimension === 'N') results.S++;
            else if (question.dimension === 'T') results.F++;
            else if (question.dimension === 'F') results.T++;
            else if (question.dimension === 'J') results.P++;
            else if (question.dimension === 'P') results.J++;
        }
    });

    // Calculer le total des questions par dimension
    const totals = {
        E_I: 13,
        S_N: 11,
        T_F: 24,
        J_P: 12
    };

    // Calcul des pourcentages
    const finalresults = {
        E: ((results.E / totals.E_I) * 100).toFixed(2),
        I: ((results.I / totals.E_I) * 100).toFixed(2),
        S: ((results.S / totals.S_N) * 100).toFixed(2),
        N: ((results.N / totals.S_N) * 100).toFixed(2),
        T: ((results.T / totals.T_F) * 100).toFixed(2),
        F: ((results.F / totals.T_F) * 100).toFixed(2),
        J: ((results.J / totals.J_P) * 100).toFixed(2),
        P: ((results.P / totals.J_P) * 100).toFixed(2)
    };

    // Logique pour déterminer le type de personnalité avec égalité
    let EorI = finalresults.E > finalresults.I ? 'E' : 'I';
    let SorN = finalresults.S > finalresults.N ? 'S' : 'N';
    let TorF = finalresults.T > finalresults.F ? 'T' : 'F';
    let JorP = finalresults.J > finalresults.P ? 'J' : 'P';

    // Gérer les égalités
    if (finalresults.E === finalresults.I) {
        EorI = 'E/I';
    }
    if (finalresults.S === finalresults.N) {
        SorN = 'S/N';
    }
    if (finalresults.T === finalresults.F) {
        TorF = 'T/F';
    }
    if (finalresults.J === finalresults.P) {
        JorP = 'J/P';
    }

    // Création du type de personnalité final
    const personalityType = `${EorI}${SorN}${TorF}${JorP}`;

    // Afficher les résultats
    displayResults(finalresults, personalityType);
}



function displayResults(finalresults, personalityType) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = ''; // Réinitialiser le conteneur des résultats

    // Affichage des résultats avec mise en forme
    for (const [key, value] of Object.entries(finalresults)) {
        resultContainer.innerHTML += `<p style="font-weight: bold;">${key}: ${value} %</p>`;
    }

    // Affichage du type de personnalité
    resultContainer.innerHTML += `
        <h2>Type de personnalité: ${personalityType}</h2>
        <CENTER><a text-align="center" href="https://www.16personalities.com/fr/la-personnalite-${personalityType.toLowerCase()}">Détails</a></CENTER>
    `;
}

// Réinitialiser le test
document.getElementById('reset-button').addEventListener('click', () => {
    localStorage.clear(); // Effacer les réponses sauvegardées
    resetResults();
    currentQuestionIndex = 0; // Réinitialiser l'index des questions
    displayQuestions(); // Afficher les questions
});

// Ajoutez un écouteur d'événements sur le bouton de soumission
document.getElementById('submit-button').addEventListener('click', () => {
    saveProgress();
    calculateResults(); // Calcul des résultats partiels après chaque soumission
    currentQuestionIndex += questionsPerPage;

    if (currentQuestionIndex < questions.length) {
        displayQuestions();
    } else {
        calculateResults(); // Afficher les résultats finaux après toutes les questions
    }
});
