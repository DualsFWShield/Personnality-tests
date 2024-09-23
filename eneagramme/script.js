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
    const wings = Array(9).fill(0); // Pour les ailes

    // Parcourir les réponses stockées
    questions.forEach(question => {
        const answer = localStorage.getItem(`enneagram_q${question.id}`);
        if (answer) {
            const typeIndex = question.type - 1; // Le type est stocké directement dans la question
            if (answer === 'agree') {
                scores[typeIndex]++;
            } else if (answer === 'disagree') {
                scores[typeIndex]--;
            }
        }
    });

    // Déterminer le type principal
    const maxScoreIndex = scores.indexOf(Math.max(...scores));
    const mainType = maxScoreIndex + 1; // Ajout 1 pour correspondre aux types 1-9

    // Déterminer les ailes (les types adjacents)
    let leftWing = null;
    let rightWing = null;

    if (mainType > 1) leftWing = mainType - 1; // Aile gauche
    if (mainType < 9) rightWing = mainType + 1; // Aile droite

    // Ajouter des points aux ailes selon les réponses aux questions associées
    if (leftWing) wings[leftWing - 1] = scores[leftWing - 1]; // Ajuster les scores de l'aile gauche
    if (rightWing) wings[rightWing - 1] = scores[rightWing - 1]; // Ajuster les scores de l'aile droite

    // Calculer le tritype (3 types les plus forts)
    const tritype = [];
    const tempScores = [...scores]; // Faire une copie des scores
    for (let j = 0; j < 3; j++) {
        const highestScoreIndex = tempScores.indexOf(Math.max(...tempScores));
        tritype.push(highestScoreIndex + 1);
        tempScores[highestScoreIndex] = -Infinity; // Éliminer ce type
    }

    // Stocker les résultats
    const results = {
        mainType,
        wings: wings.map((wing, index) => (wing > 0 ? index + 1 : null)).filter(Boolean),
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

function getTypeDetails(type) {
    const typeDescriptions = {
        1: "Type 1 - Le Réformateur : Moralité et perfectionnisme.",
        2: "Type 2 - L'Aide : Altruisme et besoin d'être aimé.",
        3: "Type 3 - Le Performeur : Ambition et désir de succès.",
        4: "Type 4 - L'Individualiste : Émotion et recherche de soi.",
        5: "Type 5 - L'Investigateur : Analyse et besoin de connaissance.",
        6: "Type 6 - Le Loyaliste : Sécurité et loyauté.",
        7: "Type 7 - L'Épicurien : Aventure et plaisir.",
        8: "Type 8 - Le Protecteur : Force et pouvoir.",
        9: "Type 9 - Le Médiateur : Paix et harmonie."
    };
    return `<p>${typeDescriptions[type]}</p>`;
}

function getWingsDetails(mainType, wings) {
    const wingDescriptions = {
        1: {
            9: "L’aile du type 9 m’apporte l’acceptation de l’autre, moins d’expression de la colère, plus de recherche de consensus et d’harmonie. Par contre je vais moins aider activement mon entourage et j’ai encore plus de mal à terminer mes projets.",
            2: "L’aile du type 2 m’apporte plus de dévouement et plus de conscience des besoins des autres. Par contre elle m’apporte moins de conscience de mes incohérences et encore plus d’autoritarisme."
        },
        2: {
            1: "L’aile du type 1 m’amène plus de principes et d’indépendance d’opinion. Par contre, elle me rend encore plus intrusif et manipulateur.",
            3: "L’aile du type 3 me donne plus de recul dans le choix de mes relations. Par contre elle me rend plus dépendant du regard des autres et me donne encore moins conscience de mes besoins."
        },
        3: {
            2: "L’aile 2 me permet de découvrir l’impact de mon comportement sur les autres. Par contre ça me rend dépendant d’encore plus d’approbation extérieure et encore moins conscience de mes émotions.",
            4: "L’aile 4 me donne encore plus conscience de mes émotions authentiques, ça améliore ma créativité. Par contre, ça augmente le mensonge émotionnel et ma compétitivité."
        },
        4: {
            3: "L’aile en 3 m’apporte moins de honte, plus de ressources pour agir et pour me faire reconnaître. Par contre elle me donne plus de dépendance des autres vis-à-vis de mon image et me donne moins de recul et de vision à long terme.",
            5: "L’aile en 5 m’amène plus de recul sur mes émotions, mes sentiments et plus de pondération, un peu moins de dépendance à l’égard des autres. Par contre elle implique plus de difficultés à communiquer socialement et plus de retrait."
        },
        5: {
            4: "L’aile du type 4 me donne plus de conscience de mes émotions et celles des autres. Par contre elle implique plus de repli sur moi, d’envie de m’isoler des autres.",
            6: "L’aile du type 6 me donne plus de facilité à entrer en relation et à donner de moi pour les personnes appartenant au cadre. Par contre elle implique plus de peurs et moins conscience de mes propres émotions."
        },
        6: {
            5: "L’aile en 5 m’apporte plus de recul et d’objectivité, moins de dépendance émotionnelle et intellectuelle (grâce à la dissociation du type 5). Par contre elle ajoute encore plus d’angoisse, moins de légèreté, plus d’inquiétude par rapport à l’inconnu.",
            7: "L’aile en 7 m’apporte plus de légèreté, de joie et d’imagination, moins de peur concernant le futur et moins de timidité. Par contre elle rend mon cerveau moins “objectif”, encore plus de justification de mes peurs et de mes projections, à coup de raisonnements foireux."
        },
        7: {
            6: "L’aile du type 6 me donne plus de conscience des autres, de respect de ma parole. Par contre elle m’amène plus d’inquiétude, de mentalisation et de peur de souffrir.",
            8: "L’aile du type 8 me donne plus d’audace, de persévérance dans la douleur et dans ma capacité à dire non. Par contre, elle me donne encore moins de conscience d’autrui et de culpabilité, plus de débauche et d’excès."
        },
        8: {
            7: "L’aile du type 7 amène plus de réflexion et de vision long terme, d’auto-dérision. Par contre elle diminue ma tolérance à la frustration et me donne encore moins conscience de l’autre.",
            9: "L’aile du type 9 amène plus de conscience de mon impact sur les autres, moins de colère. Par contre elle me donne encore moins d’introspection et un peu moins d’action."
        },
        9: {
            8: "L’aile du type 8 amène plus de capacité à dire non et faire entendre mon désaccord. Par contre elle me donne plus d’agressivité passive et plus de difficulté à me confier.",
            1: "L’aile du type 1 amène plus de discipline et de valeur personnelle. Par contre, elle amène une chute drastique de l’amour de soi, moins de confiance de la capacité de l’autre à se débrouiller seul."
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
