const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');
const page3 = document.getElementById('page3');
const backRegle = document.getElementById('backRegle');
const play = document.getElementById('play');

const terrain = document.getElementById('terrain');
const time = document.getElementById('time');
const pause = document.getElementById('pause');
const arrow = document.getElementById('arrow');
const regle = document.getElementById('regle');

const scoreG = document.getElementById('scoreG');
const scoreD = document.getElementById('scoreD');
const puissanceG = document.getElementById('puissanceG');
const puissanceD = document.getElementById('puissanceD');

const g1 = document.getElementById('g1');
const g2 = document.getElementById('g2');
const d1 = document.getElementById('d1');
const d2 = document.getElementById('d2');

const couleur =["red", "yellow", "blue", "orange", 
            "green", "purple", "black", "white"];
const nom = ["ROUGE", "JAUNE", "BLEU", "ORANGE", 
            "VERT", "VIOLET", "NOIR", "BLANC"];


let nombreCouleur = couleur.length;
let timer = null;
let paused = false;
let gameRun = false;
const GAME_OVER = 60;
let wordInterval = null;
let seconds = 0;

let leftScore = 0;
let rightScore = 0;

let leftStreak = 1; 
let rightStreak = 1;

function aleatoire(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mot(rectangle){
    if (!rectangle) return;
    const idx = aleatoire(0, nombreCouleur-1);
    console.log(`Mot: ${nom[idx]}`);
    rectangle.innerHTML = nom[idx];
}

function motCouleur(rectangle) {
    if (!rectangle) return;
    const idx = aleatoire(0, nombreCouleur-1);
    const c = aleatoire(0, nombreCouleur-1);
    console.log(`Couleur: ${nom[idx]}`);
    rectangle.innerHTML = nom[idx];
    rectangle.style.color = couleur[c];
}

function comparer(motTexte, couleurNom) {
    const idx = nom.indexOf(motTexte);
    console.log(`idx: ${idx}`);
    // defensive: si idx === -1, retourner false
    if (idx === -1) {
        console.warn('Mot non reconnu dans comparer:', motTexte);
        return false;
    }
    console.log(`couleur[idx]: ${couleur[idx]}`);
    console.log(`couleurNom: ${couleurNom}`);
    return couleur[idx] == couleurNom;
}

function mise_a_jourScores() {
    if (scoreG) scoreG.textContent = "score : " + leftScore;
    if (scoreD) scoreD.textContent = "score : " + rightScore;

    if (puissanceG) puissanceG.textContent = `Puissance: x${leftStreak}`;
    if (puissanceD) puissanceD.textContent = `Puissance: x${rightStreak}`;
}

// affiche une image centrée, grand, en overlay
function showCenteredImage(src, { size = 240, duration = 1000 } = {}) {
    // supprimer s'il existe déjà
    const existing = document.getElementById('centered-image-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'centered-image-overlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.35)',
        zIndex: 10000,
        pointerEvents: 'auto'
    });

    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.width = size;
    img.height = size;
    Object.assign(img.style, {
        boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
        borderRadius: '8px',
        background: 'white',
        padding: '8px'
    });

    // fermer au clic sur l'image ou sur l'overlay
    overlay.addEventListener('click', () => overlay.remove());
    img.addEventListener('click', (e) => { e.stopPropagation(); overlay.remove(); });

    overlay.appendChild(img);
    document.body.appendChild(overlay);

    if (duration && duration > 0) {
        setTimeout(() => {
            overlay.remove();
        }, duration);
    }
}

function handleAnswer(side, answerYes) {
    if (!gameRun) return;
    const rect = (side === 'left')? g1: d1;
    const rect2 = (side === 'left')? g2: d2;
    const texte = rect2 ? rect2.textContent : '';
    const couleurAffichee = rect ? (rect.style.color || '') : '';
    console.log(`texte: ${texte}`);
    console.log(`couleurAffichee: ${couleurAffichee}`);

    const match = comparer(texte, couleurAffichee);
    const isCorrect = (answerYes && match) || (!answerYes && !match);

    // passe au suivant
    if (side === 'left') {
        if (isCorrect) {
            leftScore += 100 * leftStreak;  
            console.log(`Puissance: ${leftStreak}`);
            if(leftStreak<5) leftStreak++;        
        }else{
            leftStreak = 1;
        }
        mot(g1); motCouleur(g2);
    }else {
        // correction du double if erroné -> logique simplifiée
        if (isCorrect) {
            rightScore += 100 * rightStreak;
            if(rightStreak<5) rightStreak++;
        } else {
            rightStreak = 1;
        }
        mot(d1); motCouleur(d2);
    }

    mise_a_jourScores();
    if (rect) {
        rect.classList.remove('correct','wrong');
        rect.classList.add(isCorrect ? 'correct' : 'wrong');
        setTimeout(() => rect.classList.remove('correct','wrong'), 300);
    }
}

function startGame() {
    if (gameRun) return;
    gameRun = true;
    if (!paused) {
        seconds = 0;
        if (time) time.textContent = `temps : ${seconds}`;
        leftScore = 0; rightScore = 0;
        leftStreak = 1; rightStreak = 1;
        mise_a_jourScores();
        mot(g1); mot(d1); motCouleur(g2); motCouleur(d2);
    } else {
        // on reprend depuis une pause
        paused = false;
        if (time) time.textContent = `temps : ${seconds}`;
        // affiche une grande image play au centre (overlay) lors de la reprise
        // l'image est retirée automatiquement après 1.2s ou au clic
        showCenteredImage('img/pause.svg', { size: 260, duration: 1200 });
    }

    if (timer) { clearInterval(timer); timer = null; }
    timer = setInterval(() => {
        seconds++;
        if (time) time.textContent = `temps : ${seconds}`;
        if (seconds >= GAME_OVER) {
            endGame();
        }
    }, 1000);
}

function stopGame() {
    gameRun = false;
    paused = true;
    if (timer) { clearInterval(timer); timer = null; }
    if (wordInterval) { clearInterval(wordInterval); wordInterval = null; }
}

function recommencer() {
    const modal = document.getElementById('endgame-modal');
    if (modal) modal.remove();

    stopGame();

    leftScore = 0;
    rightScore = 0;
    leftStreak = 1;
    rightStreak = 1;
    seconds = 0;
    paused = false;
    mise_a_jourScores();
    if (time) time.textContent = `temps: 0`;

    page(true);
}

function endGame() {
    stopGame();
    gameRun = false;

    let resultMsg;
    if (leftScore > rightScore) resultMsg = `Joueur1 gagne ! (${leftScore} - ${rightScore})`;
    else if (rightScore > leftScore) resultMsg = `Joueur2 gagne ! (${rightScore} - ${leftScore})`;
    else resultMsg = `Égalité ! (${leftScore} - ${rightScore})`;

    console.log('endGame', { seconds, leftScore, rightScore, resultMsg });

    const existing = document.getElementById('endgame-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'endgame-modal';
    Object.assign(modal.style, {
        position: 'fixed', inset: '0', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', zIndex: 9999
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
        background: 'rgb(207 220 241)', color: 'rgb(63 78 105)', padding: '20px',
        borderRadius: '8px', minWidth: '260px', textAlign: 'center'
    });
    box.innerHTML = `<h2>MATCH FIN</h2><p style="font-weight:700">${resultMsg}</p>`;

    const btnReplay = document.createElement('button');
    btnReplay.textContent = 'Rejouer';
    btnReplay.style.margin = '8px';
    btnReplay.addEventListener('click', () => {
        modal.remove();
        leftScore = 0; rightScore = 0; 
        leftStreak = 1; rightStreak = 1; seconds = 0;
        mise_a_jourScores();
        page(true);
    });

    box.appendChild(btnReplay);
    modal.appendChild(box);
    document.body.appendChild(modal);
}

function page(autoStart = true) {
    if (page1) page1.classList.add('hidden');
    if (page2) page2.classList.remove('hidden');
    leftScore = 0;
    rightScore = 0;
    leftStreak = 1;
    rightStreak = 1;
    mise_a_jourScores();
    if (autoStart) startGame();
}

function open_regle() {
    if (gameRun) stopGame();
    if (page2) page2.classList.add('hidden');
    if (page3) page3.classList.remove('hidden');
}

function close_regle() {
    if (page3) page3.classList.add('hidden');
    if (page2) page2.classList.remove('hidden');
}

// Gestionnaire clavier amélioré : ajoute la touche 'Espace' pour STOP (pause)
// et conserve les touches q/d/j/l pour réponses.
// On traite l'espace avant le retour sur !gameRun pour permettre l'arrêt.
document.addEventListener('keydown', (e) => {
    const key = e.key ? e.key.toLowerCase() : '';
    const code = e.code ? e.code.toLowerCase() : '';

    // Espace : fonctionne comme stop (pause). Empêche le scroll par défaut.
    if (code === 'space' || key === ' ') {
        if (gameRun) {
            e.preventDefault();
            stopGame();
            // affiche visuel pause (grosse image au centre)
            showCenteredImage('img/pause.svg', { size: 260, duration: 1200 });
        }
        return;
    }

    if (!gameRun) return;

    switch (key) {
        case 'q':
        case 'keyq':
            handleAnswer('left', true);
            break;
        case 'd':
        case 'keyd':
            handleAnswer('left', false);
            break;
        case 'j':
        case 'keyj':
            handleAnswer('right', true);
            break;
        case 'l':
        case 'keyl':
            handleAnswer('right', false);
            break;
    }
});


play && play.addEventListener('click', () => page(true));
pause && pause.addEventListener('click', () => {
    if(!gameRun){startGame();}else{stopGame();}});

arrow && arrow.addEventListener('click', () => recommencer());
regle && regle.addEventListener('click', open_regle);
backRegle && backRegle.addEventListener('click', close_regle);

mise_a_jourScores();