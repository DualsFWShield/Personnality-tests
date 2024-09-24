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
    const scores = Array(9).fill(0); // 9 types de l'ennéagramme

    // Parcourir les réponses stockées
    questions.forEach(question => {
        const answer = localStorage.getItem(`enneagram_q${question.id}`);
        if (answer) {
            const typeIndex = question.type - 1; // Le type est stocké directement dans la question
            scores[typeIndex] += (answer === 'agree' ? 1 : answer === 'disagree' ? -1 : 0);
        }
    });

    // Déterminer le type principal et les ailes
    const maxScoreIndex = scores.indexOf(Math.max(...scores));
    const mainType = maxScoreIndex + 1; // Ajout 1 pour correspondre aux types 1-9
    const wings = [];

    // Ajouter des points aux ailes
    if (mainType > 1) wings.push(mainType - 1); // Aile gauche
    if (mainType < 9) wings.push(mainType + 1); // Aile droite

    // Calculer le tritype (3 types les plus forts)
    const tritype = [...scores]
        .map((score, index) => ({ score, index: index + 1 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(item => item.index);

    // Stocker les résultats
    const results = {
        mainType,
        wings,
        tritype,
    };

    displayEnneagramResults(results);
}

function displayEnneagramResults(results) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';
    resultContainer.style.display = 'block';

    resultContainer.innerHTML += `<h2>Résultats de votre test d'ennéagramme</h2>`;
    resultContainer.innerHTML += `<p><strong>Type principal :</strong> ${results.mainType}</p>`;
    resultContainer.innerHTML += `<p><strong>Ailes :</strong> ${results.wings.join(', ') || 'Aucune aile'}</p>`;
    resultContainer.innerHTML += `<p><strong>Tritype :</strong> ${results.tritype.join(', ')}</p>`;

    // Détails supplémentaires
    resultContainer.innerHTML += `<h3>Détails :</h3>`;
    resultContainer.innerHTML += getWingsDetails(results.mainType, results.wings);
}

function getWingsDetails(mainType, wings) {
    const wingDescriptions = {
        1: {
            9: "L'aile 9 apporte de l'acceptation et une quête d'harmonie, mais peut entraîner moins d'engagement dans les projets.",
            2: "L'aile 2 apporte dévouement et conscience des autres, mais peut accroître l'autoritarisme."
        },
        2: {
            1: "L'aile 1 renforce les principes et l'indépendance, mais peut accroître l'intrusivité.",
            3: "L'aile 3 permet de mieux choisir ses relations, mais augmente la dépendance à l'approbation."
        },
        3: {
            2: "L'aile 2 aide à comprendre son impact sur autrui, mais accroît la dépendance à l'approbation.",
            4: "L'aile 4 augmente la conscience émotionnelle, mais peut accroître la compétitivité."
        },
        4: {
            3: "L'aile 3 diminue la honte et augmente les ressources, mais accroît la dépendance à l'image.",
            5: "L'aile 5 apporte plus de recul émotionnel, mais entraîne un retrait social."
        },
        5: {
            4: "L'aile 4 augmente la conscience émotionnelle, mais peut conduire à l'isolement.",
            6: "L'aile 6 facilite les relations, mais augmente les peurs."
        },
        6: {
            5: "L'aile 5 apporte objectivité, mais augmente l'angoisse.",
            7: "L'aile 7 apporte légèreté, mais diminue l'objectivité."
        },
        7: {
            6: "L'aile 6 renforce la conscience des autres, mais accroît l'inquiétude.",
            8: "L'aile 8 apporte audace, mais diminue la conscience d'autrui."
        },
        8: {
            7: "L'aile 7 renforce la vision à long terme, mais diminue la tolérance à la frustration.",
            9: "L'aile 9 augmente la conscience de l'impact sur les autres, mais diminue l'introspection."
        },
        9: {
            8: "L'aile 8 renforce la capacité à exprimer son désaccord, mais peut entraîner de l'agressivité passive.",
            1: "L'aile 1 accroît la discipline, mais peut diminuer l'estime de soi."
        }
    };

    return wings.map(wing => `<p>${wingDescriptions[mainType][wing]}</p>`).join('');
}

// Réinitialiser le test
document.getElementById('reset-button').addEventListener('click', () => {
    localStorage.clear(); // Effacer les réponses sauvegardées
    currentQuestionIndex = 0; // Réinitialiser l'index
    displayQuestions(); // Afficher les questions
});

// Ajoutez un écouteur d'événements sur le bouton de soumission
document.getElementById('submit-button').addEventListener('click', () => {
    saveProgress();
    currentQuestionIndex++; // Passer à la section suivante
    if ((currentQuestionIndex * questionsPerSection) < questions.length) {
        displayQuestions();
    } else {
        calculateEnneagramResults();
    }
});
