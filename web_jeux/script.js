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
    const idx = aleatoire(0, nombreCouleur-1);
    console.log(`Mot: ${nom[idx]}`);
    rectangle.innerHTML = nom[idx];
}

function motCouleur(rectangle) {
    const idx = aleatoire(0, nombreCouleur-1);
    const c = aleatoire(0, nombreCouleur-1);
    console.log(`Couleur: ${nom[idx]}`);
    rectangle.innerHTML = nom[idx];
    rectangle.style.color = couleur[c];
}

function comparer(motTexte, couleurNom) {
    const idx = nom.indexOf(motTexte);
    console.log(`idx: ${idx}`);
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

function handleAnswer(side, answerYes) {
    if (!gameRun) return;
    const rect = (side === 'left') ? g2 : d2;
    const rect2 = (side === 'left') ? g1 : d1;
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
            if(leftStreak<5) leftStreak++;        
        }else{
            leftStreak = 1;
        }
        mot(g1); motCouleur(g2);
    }else {
        if (isCorrect) if (isCorrect) {
            rightScore += 100 * rightStreak;
            if(rightStreak<5) rightStreak++;
        }else{
            rightStreak = 1;
        }
        mot(d1); motCouleur(d2);
    }

    mise_a_jourScores();
    rect.classList.remove('correct','wrong');
    rect.classList.add(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => rect.classList.remove('correct','wrong'), 300);
}

function startGame() {
    if (gameRun) return;
    gameRun = true;
    if (!paused) {
        seconds = 0;
        if (time) time.textContent = `temps : ${seconds}`;
        leftScore = 0; rightScore = 0;
        leftStreak = 0; rightStreak = 0;
        mise_a_jourScores();
        mot(g1); mot(d1); motCouleur(g2); motCouleur(d2);
    } else {
        paused = false;
        if (time) time.textContent = `temps : ${seconds}`;
    }

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
    leftStreak = 0;
    rightStreak = 0;
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
        leftStreak = 0; rightStreak = 0; seconds = 0;
        mise_a_jourScores();
        page(true);
    });

    box.appendChild(btnReplay);
    modal.appendChild(box);
    document.body.appendChild(modal);
}

function page(autoStart = true) {
    page1.classList.add('hidden');
    page2.classList.remove('hidden');
    leftScore = 0;
    rightScore = 0;
    leftStreak = 0;
    rightStreak = 0;
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

document.addEventListener('keydown', (e) => {
    if (!gameRun) return;
    const key = e.key.toLowerCase();
    switch (key) {
        case 'q':
            handleAnswer('left', true);
            break;
        case 'd':
            handleAnswer('left', false);
            break;
        case 'j':
            handleAnswer('right', true);
            break;
        case 'l':
            handleAnswer('right', false);
            break;
    }
});


play.addEventListener('click', () => page(true));
pause.addEventListener('click', () => {
    if(!gameRun){startGame();}else{stopGame();}});

arrow.addEventListener('click', () => recommencer());
regle.addEventListener('click', open_regle);
backRegle.addEventListener('click', close_regle);

mise_a_jourScores();





