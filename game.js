/* ================= BASE SETUP ================= */
const player = document.getElementById('player');
const scoreBoard = document.getElementById('scoreBoard');
const highScoreBoard = document.getElementById('highScore');
const hpBar = document.getElementById('hpBar');
const hpContainer = document.getElementById('hpContainer');
const exitBtn = document.getElementById('exitBtn');
const menuContainer = document.getElementById('menuContainer');
const menu = document.getElementById('menu');
const skinPanel = document.getElementById('skinPanel');
const upgradePanel = document.getElementById('upgradePanel');
const infoPanel = document.getElementById('infoPanel');
const gameOver = document.getElementById('gameOver');
const finalScoreText = document.getElementById('finalScore');
const toast = document.getElementById('toast');
const storyModeSelection = document.getElementById('storyModeSelection');
const characterSelection = document.getElementById('characterSelection');
const bossHPBar = document.getElementById('bossHPBar');
const bossHPFill = document.getElementById('bossHPFill');
const bossHPText = document.getElementById('bossHPText');
const bossWarning = document.getElementById('bossWarning');
const normalSkinsRow = document.getElementById('normalSkinsRow');
const fantasySkinsRow = document.getElementById('fantasySkinsRow');
const upgradeItems = document.getElementById('upgradeItems');

// Audio elements
const bgMusic = document.getElementById('bgMusic');
const gameplayMusic = document.getElementById('gameplayMusic');
const shootSound = document.getElementById('shootSound');
const breakSound = document.getElementById('breakSound');
const clickSound = document.getElementById('clickSound');
const gameoverSound = document.getElementById('gameoverSound');
const launchSound = document.getElementById('launchSound');
const bossMusic = document.getElementById('bossMusic');
const bossWarningSound = document.getElementById('bossWarningSound');

let gameMeteors = [];
let gameEnemies = [];
let enemyBullets = [];
let score = 0;
let highScore = 0;
let maxHP = 100;
let currentHP = maxHP;
let selectedSkin = 'normal1.png';
let normalSkinUnlocked = {0:true};
let fantasySkinUnlocked = {0:true};
let keys = {};
let speed = 6;
let gameRunning = false;
let isStoryMode = false;
let selectedCharacter = 'male';
let currentStoryStage = 0;
let bossActive = false;
let bossHP = 1000;
let maxBossHP = 1000;
let bossType = ''; // 'boss' or 'megaboss'
let nextBossScore = 1500; // Skor pertama boss muncul
let bossDefeatedCount = 0; // Jumlah boss yang sudah dikalahkan

// Upgrade system
let upgrades = {
    health: { level: 0, baseCost: 200, maxLevel: 10, name: 'Health Boost', desc: 'Tambah maksimum HP (+50 HP per level)' },
    bullet: { level: 0, baseCost: 300, maxLevel: 5, name: 'Bullet Power', desc: 'Tembakan lebih kuat (hancurkan meteor level tinggi)' },
    speed: { level: 0, baseCost: 150, maxLevel: 8, name: 'Movement Speed', desc: 'Pesawat bergerak lebih cepat (+1 speed per level)' },
    double: { level: 0, baseCost: 500, maxLevel: 1, name: 'Double Shot', desc: 'Tembakan ganda ke atas dan bawah' },
    triple: { level: 0, baseCost: 800, maxLevel: 1, name: 'Triple Shot', desc: 'Tembakan tiga arah (tengah, atas, bawah)' },
    quad: { level: 0, baseCost: 1200, maxLevel: 1, name: 'Quad Shot', desc: 'Tembakan empat arah (semua penjuru)' },
    rebirth: { level: 0, baseCost: 5000, maxLevel: 5, name: 'Rebirth', desc: 'Reset semua upgrade, dapatkan 2x damage dan score' }
};

let bulletUpgraded = false;
let doubleShot = false;
let tripleShot = false;
let quadShot = false;
let rebirthMultiplier = 1;

// Touch controls
let touchControls = null;

/* ================= INITIALIZATION ================= */
function initializeGame() {
    // Initialize skin unlocks
    for (let i = 1; i <= 14; i++) {
        normalSkinUnlocked[i] = false;
        fantasySkinUnlocked[i] = false;
    }
    
    // Load all saved data
    loadAllData();
    
    // Create skin panels dynamically
    createSkinPanels();
    
    // Create upgrade panel dynamically
    createUpgradePanel();
    
    // Setup button hover effects
    setupButtonHoverEffects();
    
    // Setup audio
    setupAudio();
    
    // Create touch controls for mobile
    createTouchControls();
    
    // Start menu effects
    startMenuMeteorSpawner();
    
    // Place player
    player.style.left = '-320px';
    player.style.top = '50%';
    player.src = selectedSkin;
    currentHP = maxHP;
    updateHPBar();
    
    // Bind events
    bindEvents();
}

/* ================= SKIN PANELS CREATION ================= */
function createSkinPanels() {
    // Normal skins
    const normalUnlockThresholds = {
        1: 100, 2: 200, 3: 350, 4: 500, 5: 700,
        6: 900, 7: 1200, 8: 1500, 9: 1800, 10: 2200,
        11: 2600, 12: 3000, 13: 3500, 14: 4000
    };
    
    for (let i = 0; i <= 14; i++) {
        const skinItem = document.createElement('div');
        skinItem.className = 'skin-item';
        skinItem.innerHTML = `
            <img id="normal${i}" class="skinThumb ${normalSkinUnlocked[i] ? '' : 'locked'}" 
                 src="normal${i+1}.png" 
                 onclick="trySelectNormalSkin(${i})"
                 onerror="this.src='normal1.png'">
            <div id="normal${i}Label" class="skin-label">
                ${i === 0 ? 'Basic' : normalSkinUnlocked[i] ? 
                    `Unlocked (${normalUnlockThresholds[i]})` : 
                    `Locked (${normalUnlockThresholds[i]})`}
            </div>
        `;
        normalSkinsRow.appendChild(skinItem);
    }
    
    // Fantasy skins
    const fantasyUnlockThresholds = {
        1: 150, 2: 300, 3: 500, 4: 700, 5: 1000,
        6: 1500, 7: 2000, 8: 2500, 9: 3000, 10: 4000,
        11: 5000, 12: 6000, 13: 7000, 14: 8000
    };
    
    for (let i = 0; i <= 14; i++) {
        const skinItem = document.createElement('div');
        skinItem.className = 'skin-item';
        skinItem.innerHTML = `
            <img id="skin${i}" class="skinThumb ${fantasySkinUnlocked[i] ? '' : 'locked'}" 
                 src="skin${i+1}.png" 
                 onclick="trySelectSkin(${i})"
                 onerror="this.src='skin1.png'">
            <div id="skin${i}Label" class="skin-label">
                ${i === 0 ? 'Basic Fantasy' : fantasySkinUnlocked[i] ? 
                    `Unlocked (${fantasyUnlockThresholds[i]})` : 
                    `Locked (${fantasyUnlockThresholds[i]})`}
            </div>
        `;
        fantasySkinsRow.appendChild(skinItem);
    }
}

/* ================= UPGRADE PANEL CREATION ================= */
function createUpgradePanel() {
    const upgradeKeys = ['health', 'bullet', 'speed', 'double', 'triple', 'quad', 'rebirth'];
    
    upgradeKeys.forEach(key => {
        const upgrade = upgrades[key];
        const upgradeItem = document.createElement('div');
        upgradeItem.className = 'upgrade-item';
        upgradeItem.id = `${key}UpgradeItem`;
        upgradeItem.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-title">${upgrade.name}</div>
                <div class="upgrade-desc">${upgrade.desc}</div>
                <div class="upgrade-level">Level: <span id="${key}Level">${upgrade.level}</span>/${upgrade.maxLevel}</div>
            </div>
            <div class="upgrade-cost" id="${key}Cost">Cost: ${calculateUpgradeCost(upgrade.baseCost, upgrade.level)}</div>
            <button class="upgrade-btn" onclick="upgrade('${key}')" id="${key}UpgradeBtn">UPGRADE</button>
        `;
        upgradeItems.appendChild(upgradeItem);
    });
}

/* ================= TOUCH CONTROLS ================= */
function createTouchControls() {
    touchControls = document.createElement('div');
    touchControls.className = 'touch-controls';
    touchControls.innerHTML = `
        <div class="touch-btn" id="touchUp">W</div>
        <div class="touch-btn" id="touchShoot">FIRE</div>
        <div class="touch-btn" id="touchDown">S</div>
    `;
    document.body.appendChild(touchControls);
    
    // Add touch events
    document.getElementById('touchUp').addEventListener('touchstart', () => keys['w'] = true);
    document.getElementById('touchUp').addEventListener('touchend', () => keys['w'] = false);
    document.getElementById('touchDown').addEventListener('touchstart', () => keys['s'] = true);
    document.getElementById('touchDown').addEventListener('touchend', () => keys['s'] = false);
    document.getElementById('touchShoot').addEventListener('touchstart', shoot);
}

/* ================= STAR CREATION ================= */
function createStar() {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.left = Math.random() * 100 + 'vw';
    s.style.top = '-10px';
    s.style.animationDuration = (5 + Math.random() * 7) + 's';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 15000);
}

setInterval(createStar, 120);

/* ================= METEOR FUNCTIONS ================= */
function createMeteor() {
    const meteor = document.createElement('img');
    meteor.className = 'meteor';
    meteor.dataset.level = 1 + Math.floor(Math.random() * 6);
    meteor.src = `tingkat${meteor.dataset.level}.png`;
    meteor.style.top = (50 + (Math.random() * 70 - 35)) + 'vh';
    meteor.style.left = (window.innerWidth + 80) + 'px';
    meteor.style.transform = `rotate(${Math.random() * 360}deg)`;
    const duration = 3800 + Math.random() * 4200;
    meteor.style.transition = `transform ${duration}ms linear, left ${duration}ms linear`;
    document.body.appendChild(meteor);
    gameMeteors.push(meteor);

    requestAnimationFrame(() => {
        meteor.style.left = '-160px';
        meteor.style.transform = `rotate(${Math.random() * 720 - 360}deg)`;
    });

    setTimeout(() => {
        if (document.body.contains(meteor)) {
            meteor.remove();
            gameMeteors = gameMeteors.filter(m => m !== meteor);
        }
    }, duration + 600);
}

function createMenuMeteor() {
    const meteor = document.createElement('img');
    meteor.className = 'meteor';
    meteor.dataset.level = 1 + Math.floor(Math.random() * 6);
    meteor.src = `tingkat${meteor.dataset.level}.png`;
    meteor.style.top = (Math.random() * 100) + 'vh';
    meteor.style.left = (window.innerWidth + 80) + 'px';
    meteor.style.transform = `rotate(${Math.random() * 360}deg)`;
    const duration = 6000 + Math.random() * 6000;
    meteor.style.transition = `transform ${duration}ms linear, left ${duration}ms linear`;
    document.body.appendChild(meteor);

    requestAnimationFrame(() => {
        meteor.style.left = '-160px';
        meteor.style.transform = `rotate(${Math.random() * 720 - 360}deg)`;
    });

    setTimeout(() => {
        if (document.body.contains(meteor)) {
            meteor.remove();
        }
    }, duration + 600);
}

let meteorInterval;
let menuMeteorInterval;

function startMeteorSpawner() { 
    meteorInterval = setInterval(createMeteor, 1100); 
}

function stopMeteorSpawner() { 
    clearInterval(meteorInterval); 
}

function startMenuMeteorSpawner() { 
    menuMeteorInterval = setInterval(createMenuMeteor, 2000); 
}

function stopMenuMeteorSpawner() { 
    clearInterval(menuMeteorInterval); 
}

/* ================= ENEMY FUNCTIONS ================= */
function createEnemy() {
    const enemyTypes = ['musuh1.png', 'musuh2.png', 'musuh3.png', 'satelit1.png', 'satelit2.png'];
    const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    const enemy = document.createElement('img');
    enemy.className = 'enemy';
    enemy.src = enemyType;
    enemy.style.top = (Math.random() * (window.innerHeight - 120)) + 'px';
    enemy.style.left = (window.innerWidth + 80) + 'px';
    document.body.appendChild(enemy);
    gameEnemies.push(enemy);

    const duration = 8000 + Math.random() * 4000;
    enemy.style.transition = `left ${duration}ms linear`;
    
    requestAnimationFrame(() => {
        enemy.style.left = '-160px';
    });

    const shootInterval = setInterval(() => {
        if (!document.body.contains(enemy) || !gameRunning) {
            clearInterval(shootInterval);
            return;
        }
        enemyShoot(enemy);
    }, 1500 + Math.random() * 1000);

    setTimeout(() => {
        if (document.body.contains(enemy)) {
            enemy.remove();
            gameEnemies = gameEnemies.filter(e => e !== enemy);
        }
        clearInterval(shootInterval);
    }, duration + 600);
}

function createBoss(type = 'boss') {
    if (bossActive) return;
    
    bossActive = true;
    bossType = type;
    
    if (type === 'boss') {
        bossHP = 1000 + (bossDefeatedCount * 200);
        maxBossHP = bossHP;
    } else {
        bossHP = 2000 + (bossDefeatedCount * 300);
        maxBossHP = bossHP;
    }
    
    showBossWarning(type);
    
    setTimeout(() => {
        if (!gameRunning) return;
        
        bossHPBar.style.display = 'block';
        updateBossHPBar();
        
        gameplayMusic.pause();
        bossMusic.currentTime = 0;
        bossMusic.play();
        
        const boss = document.createElement('img');
        boss.className = type === 'boss' ? 'boss' : 'megaboss';
        boss.src = type === 'boss' ? 'bos.png' : 'megabos.png';
        boss.style.top = '50%';
        boss.style.left = (window.innerWidth + 80) + 'px';
        boss.style.transform = 'translateY(-50%) scaleX(-1)';
        document.body.appendChild(boss);
        gameEnemies.push(boss);

        const duration = 5000;
        boss.style.transition = `left ${duration}ms ease-out`;
        
        requestAnimationFrame(() => {
            boss.style.left = (window.innerWidth - (type === 'boss' ? 400 : 500)) + 'px';
        });

        const shootInterval = setInterval(() => {
            if (!document.body.contains(boss) || !gameRunning || !bossActive) {
                clearInterval(shootInterval);
                return;
            }
            bossShoot(boss);
        }, type === 'boss' ? 800 : 600);

        let movingDown = true;
        const moveInterval = setInterval(() => {
            if (!document.body.contains(boss) || !gameRunning || !bossActive) {
                clearInterval(moveInterval);
                return;
            }
            
            const currentTop = parseInt(boss.style.top);
            if (movingDown) {
                boss.style.top = (currentTop + 2) + 'px';
                if (currentTop > window.innerHeight - (type === 'boss' ? 300 : 400)) movingDown = false;
            } else {
                boss.style.top = (currentTop - 2) + 'px';
                if (currentTop < 100) movingDown = true;
            }
        }, 50);

        setTimeout(() => {
            if (document.body.contains(boss)) {
                boss.remove();
                gameEnemies = gameEnemies.filter(e => e !== boss);
                bossActive = false;
                bossHPBar.style.display = 'none';
                bossMusic.pause();
                gameplayMusic.currentTime = 0;
                gameplayMusic.play();
            }
            clearInterval(shootInterval);
            clearInterval(moveInterval);
        }, 60000);
    }, 3000);
}

function showBossWarning(type) {
    bossWarning.textContent = type === 'boss' ? "BOSS INCOMING!" : "MEGA BOSS INCOMING!";
    bossWarning.style.display = 'block';
    
    if (bossWarningSound) {
        bossWarningSound.currentTime = 0;
        bossWarningSound.play();
    }
    
    setTimeout(() => {
        bossWarning.style.display = 'none';
    }, 3000);
}

function bossShoot(boss) {
    if (!gameRunning) return;
    
    const bulletCount = bossType === 'boss' ? 3 : 5;
    for (let i = 0; i < bulletCount; i++) {
        const p = document.createElement('div');
        p.className = 'enemy-bullet';
        p.style.width = bossType === 'boss' ? '20px' : '25px';
        p.style.height = bossType === 'boss' ? '6px' : '8px';
        
        const er = boss.getBoundingClientRect();
        const startLeft = er.left + 8;
        const startTop = er.top + er.height / 2 - 3 + (i - Math.floor(bulletCount / 2)) * 30;
        p.style.left = startLeft + 'px';
        p.style.top = startTop + 'px';
        document.body.appendChild(p);
        enemyBullets.push(p);

        const speedBul = bossType === 'boss' ? 10 : 12;
        const it = setInterval(() => {
            if (!document.body.contains(p)) { 
                clearInterval(it); 
                enemyBullets = enemyBullets.filter(b => b !== p);
                return; 
            }
            
            p.style.left = (p.offsetLeft - speedBul) + 'px';
            
            if (isCollide(p, player)) {
                const dmg = bossType === 'boss' ? 20 : 30;
                reduceHP(dmg);
                p.remove();
                clearInterval(it);
                enemyBullets = enemyBullets.filter(b => b !== p);
                
                const pr = player.getBoundingClientRect();
                const cx = (Math.max(pr.left, er.left) + Math.min(pr.right, er.right)) / 2;
                const cy = (Math.max(pr.top, er.top) + Math.min(pr.bottom, er.bottom)) / 2;
                spawnExplosion(cx, cy, 20);
            }
            
            if (p.offsetLeft < -50) {
                p.remove();
                clearInterval(it);
                enemyBullets = enemyBullets.filter(b => b !== p);
            }
        }, 24);
    }
}

let enemyInterval;

function startEnemySpawner() { 
    enemyInterval = setInterval(createEnemy, 3000); 
}

function stopEnemySpawner() { 
    clearInterval(enemyInterval); 
    bossActive = false;
    bossHPBar.style.display = 'none';
}

function checkBossSpawn() {
    if (!gameRunning || bossActive) return;
    
    if (score >= nextBossScore) {
        const bossTypeToSpawn = (bossDefeatedCount % 2 === 0) ? 'boss' : 'megaboss';
        createBoss(bossTypeToSpawn);
        nextBossScore += 1500;
    }
}

function enemyShoot(enemy) {
    if (!gameRunning) return;
    
    const p = document.createElement('div');
    p.className = 'enemy-bullet';
    
    const er = enemy.getBoundingClientRect();
    const startLeft = er.left + 8;
    const startTop = er.top + er.height / 2 - 2;
    p.style.left = startLeft + 'px';
    p.style.top = startTop + 'px';
    document.body.appendChild(p);
    enemyBullets.push(p);

    const speedBul = 12;
    const it = setInterval(() => {
        if (!document.body.contains(p)) { 
            clearInterval(it); 
            enemyBullets = enemyBullets.filter(b => b !== p);
            return; 
        }
        
        p.style.left = (p.offsetLeft - speedBul) + 'px';
        
        if (isCollide(p, player)) {
            const dmg = 10 + Math.floor(Math.random() * 5);
            reduceHP(dmg);
            p.remove();
            clearInterval(it);
            enemyBullets = enemyBullets.filter(b => b !== p);
            
            const pr = player.getBoundingClientRect();
            const cx = (Math.max(pr.left, er.left) + Math.min(pr.right, er.right)) / 2;
            const cy = (Math.max(pr.top, er.top) + Math.min(pr.bottom, er.bottom)) / 2;
            spawnExplosion(cx, cy, 15);
        }
        
        if (p.offsetLeft < -50) {
            p.remove();
            clearInterval(it);
            enemyBullets = enemyBullets.filter(b => b !== p);
        }
    }, 24);
}

/* ================= GAME FLOW ================= */
function startGameModeSelection() {
    playClickSound();
    menuContainer.style.display = 'none';
    storyModeSelection.style.display = 'flex';
}

function backToMainMenu() {
    playClickSound();
    storyModeSelection.style.display = 'none';
    menuContainer.style.display = 'flex';
}

function backToModeSelection() {
    playClickSound();
    characterSelection.style.display = 'none';
    storyModeSelection.style.display = 'flex';
}

function startStoryMode() {
    playClickSound();
    storyModeSelection.style.display = 'none';
    characterSelection.style.display = 'flex';
    isStoryMode = true;
}

function startFreePlay() {
    playClickSound();
    storyModeSelection.style.display = 'none';
    isStoryMode = false;
    startGame();
}

function selectCharacter(gender) {
    playClickSound();
    selectedCharacter = gender;
    characterSelection.style.display = 'none';
    startGame();
}

function startGame() {
    menuContainer.style.display = 'none';
    scoreBoard.style.display = 'block';
    highScoreBoard.style.display = 'block';
    exitBtn.style.display = 'block';
    hpContainer.style.display = 'block';
    player.src = selectedSkin;
    player.style.display = 'block';
    
    // Show touch controls on mobile
    if (window.innerWidth <= 800) {
        document.querySelector('.touch-controls').style.display = 'flex';
    }
    
    bossActive = false;
    nextBossScore = 1500;
    bossDefeatedCount = 0;
    
    launchSound.currentTime = 0;
    launchSound.play();
    
    bgMusic.pause();
    gameplayMusic.currentTime = 0;
    gameplayMusic.play();
    
    stopMenuMeteorSpawner();
    
    player.style.left = '90px';
    
    score = 0; 
    updateScore();
    currentHP = maxHP; 
    updateHPBar();
    gameRunning = true;
    
    startMeteorSpawner();
    startEnemySpawner();
    
    if (isStoryMode) {
        showStoryIntro();
    }
    
    requestAnimationFrame(gameLoop);
}

function showStoryIntro() {
    const storyIntro = document.createElement('div');
    storyIntro.style.position = 'fixed';
    storyIntro.style.inset = '0';
    storyIntro.style.background = 'rgba(0,0,0,0.9)';
    storyIntro.style.display = 'flex';
    storyIntro.style.alignItems = 'center';
    storyIntro.style.justifyContent = 'center';
    storyIntro.style.flexDirection = 'column';
    storyIntro.style.zIndex = '99999';
    storyIntro.style.color = '#fff';
    storyIntro.style.textAlign = 'center';
    storyIntro.style.padding = '40px';
    
    storyIntro.innerHTML = `
        <div class="story-title">MISI PENYELAMATAN BUMI</div>
        <div class="story-text">
            <p>Tahun 2150. Bumi berada di ambang kehancuran.</p>
            <p>Serangan asteroid raksasa dan invasi alien telah mengancam keberlangsungan hidup umat manusia.</p>
            <p>Sebagai ${selectedCharacter === 'male' ? 'Kapten Alex' : 'Letnan Sarah'}, Anda ditugaskan untuk memimpin misi penyelamatan terakhir.</p>
            <p>Hancurkan semua ancaman yang mendekati Bumi dan selamatkan peradaban manusia!</p>
            <p><strong>PERINGATAN:</strong> Boss akan muncul pada skor 1500, 3000, 4500, dan seterusnya!</p>
        </div>
        <div class="btn" style="margin-top:30px" onclick="this.parentElement.remove()">MULAI MISI</div>
    `;
    
    document.body.appendChild(storyIntro);
}

function restartGame() {
    gameOver.style.display = 'none';
    
    gameMeteors.forEach(m => m.remove());
    gameMeteors = [];
    
    gameEnemies.forEach(e => e.remove());
    gameEnemies = [];
    
    enemyBullets.forEach(b => b.remove());
    enemyBullets = [];
    
    bossHPBar.style.display = 'none';
    
    startGame();
}

function backToMenu() {
    gameplayMusic.pause();
    bossMusic.pause();
    bgMusic.currentTime = 0;
    bgMusic.play();
    
    stopMeteorSpawner();
    stopEnemySpawner();
    
    gameMeteors.forEach(m => m.remove());
    gameMeteors = [];
    
    gameEnemies.forEach(e => e.remove());
    gameEnemies = [];
    
    enemyBullets.forEach(b => b.remove());
    enemyBullets = [];
    
    // Hide touch controls
    document.querySelector('.touch-controls').style.display = 'none';
    
    scoreBoard.style.display = 'none';
    highScoreBoard.style.display = 'none';
    exitBtn.style.display = 'none';
    hpContainer.style.display = 'none';
    player.style.display = 'none';
    bossHPBar.style.display = 'none';
    bossWarning.style.display = 'none';
    
    menuContainer.style.display = 'flex';
    gameOver.style.display = 'none';
    
    startMenuMeteorSpawner();
    
    gameRunning = false;
    
    saveAllData();
}

function exitGame() {
    playClickSound();
    saveAllData();
    window.location.href = "about:blank";
}

/* ================= MOVEMENT ================= */
document.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') shoot();
});

document.addEventListener('keyup', e => { 
    keys[e.key.toLowerCase()] = false; 
});

function clamp(n, a, b) { 
    return Math.max(a, Math.min(b, n)); 
}

function smoothMove() {
    if (!gameRunning) return;
    
    if (keys['w']) player.style.top = (player.offsetTop - speed) + 'px';
    if (keys['s']) player.style.top = (player.offsetTop + speed) + 'px';

    const rect = player.getBoundingClientRect();
    let left = clamp(player.offsetLeft, 10, window.innerWidth - rect.width - 10);
    let top = clamp(player.offsetTop, 10, window.innerHeight - rect.height + 100);
    player.style.left = left + 'px';
    player.style.top = top + 'px';
}

function gameLoop() {
    if (!gameRunning) return;
    smoothMove();
    checkCollisions();
    checkBossSpawn();
    requestAnimationFrame(gameLoop);
}

/* ================= SHOOTING ================= */
function shoot() {
    if (!gameRunning) return;
    
    shootSound.currentTime = 0;
    shootSound.play();
    
    if (quadShot) {
        createQuadBullets();
    } else if (tripleShot) {
        createTripleBullets();
    } else if (doubleShot) {
        createDoubleBullets();
    } else {
        createSingleBullet();
    }
}

function createSingleBullet() {
    const p = document.createElement('div');
    p.className = bulletUpgraded ? 'peluru upgraded' : 'peluru';
    
    const pr = player.getBoundingClientRect();
    const startLeft = pr.left + pr.width - 8;
    const startTop = pr.top + pr.height / 2 - 2;
    p.style.left = startLeft + 'px';
    p.style.top = startTop + 'px';
    document.body.appendChild(p);

    moveBullet(p, 24);
}

function createDoubleBullets() {
    const pr = player.getBoundingClientRect();
    
    const p1 = document.createElement('div');
    p1.className = 'peluru double';
    p1.style.left = (pr.left + pr.width - 8) + 'px';
    p1.style.top = (pr.top + pr.height / 4 - 2) + 'px';
    document.body.appendChild(p1);
    moveBullet(p1, 22);
    
    const p2 = document.createElement('div');
    p2.className = 'peluru double';
    p2.style.left = (pr.left + pr.width - 8) + 'px';
    p2.style.top = (pr.top + 3 * pr.height / 4 - 2) + 'px';
    document.body.appendChild(p2);
    moveBullet(p2, 22);
}

function createTripleBullets() {
    const pr = player.getBoundingClientRect();
    
    const p1 = document.createElement('div');
    p1.className = 'peluru triple';
    p1.style.left = (pr.left + pr.width - 8) + 'px';
    p1.style.top = (pr.top + pr.height / 4 - 2) + 'px';
    document.body.appendChild(p1);
    moveBullet(p1, 20);
    
    const p2 = document.createElement('div');
    p2.className = 'peluru triple';
    p2.style.left = (pr.left + pr.width - 8) + 'px';
    p2.style.top = (pr.top + pr.height / 2 - 2) + 'px';
    document.body.appendChild(p2);
    moveBullet(p2, 20);
    
    const p3 = document.createElement('div');
    p3.className = 'peluru triple';
    p3.style.left = (pr.left + pr.width - 8) + 'px';
    p3.style.top = (pr.top + 3 * pr.height / 4 - 2) + 'px';
    document.body.appendChild(p3);
    moveBullet(p3, 20);
}

function createQuadBullets() {
    const pr = player.getBoundingClientRect();
    
    const p1 = document.createElement('div');
    p1.className = 'peluru quad';
    p1.style.left = (pr.left + pr.width - 8) + 'px';
    p1.style.top = (pr.top + pr.height / 5 - 2) + 'px';
    document.body.appendChild(p1);
    moveBullet(p1, 18);
    
    const p2 = document.createElement('div');
    p2.className = 'peluru quad';
    p2.style.left = (pr.left + pr.width - 8) + 'px';
    p2.style.top = (pr.top + 2 * pr.height / 5 - 2) + 'px';
    document.body.appendChild(p2);
    moveBullet(p2, 18);
    
    const p3 = document.createElement('div');
    p3.className = 'peluru quad';
    p3.style.left = (pr.left + pr.width - 8) + 'px';
    p3.style.top = (pr.top + 3 * pr.height / 5 - 2) + 'px';
    document.body.appendChild(p3);
    moveBullet(p3, 18);
    
    const p4 = document.createElement('div');
    p4.className = 'peluru quad';
    p4.style.left = (pr.left + pr.width - 8) + 'px';
    p4.style.top = (pr.top + 4 * pr.height / 5 - 2) + 'px';
    document.body.appendChild(p4);
    moveBullet(p4, 18);
}

function moveBullet(p, speedBul) {
    const it = setInterval(() => {
        if (!document.body.contains(p)) { 
            clearInterval(it); 
            return; 
        }
        
        p.style.left = (p.offsetLeft + speedBul) + 'px';
        
        gameMeteors.slice().forEach(m => {
            if (isCollide(p, m)) {
                if (bulletUpgraded) {
                    const mr = m.getBoundingClientRect();
                    spawnExplosion(mr.left + mr.width / 2, mr.top + mr.height / 2, 26);
                    m.remove();
                    gameMeteors = gameMeteors.filter(met => met !== m);
                    addScore(15 * rebirthMultiplier);
                } else {
                    meteorHit(m);
                }
                p.remove();
                clearInterval(it);
            }
        });
        
        gameEnemies.slice().forEach(e => {
            if (isCollide(p, e)) {
                if (e.className === 'boss' || e.className === 'megaboss') {
                    bossHit(e);
                } else {
                    enemyHit(e);
                }
                p.remove();
                clearInterval(it);
            }
        });
        
        if (p.offsetLeft > window.innerWidth + 50) {
            p.remove();
            clearInterval(it);
        }
    }, 18);
}

/* ================= COLLISION ================= */
function isCollide(a, b) {
    if (!a || !b) return false;
    const r1 = a.getBoundingClientRect();
    const r2 = b.getBoundingClientRect();
    return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
}

function meteorHit(meteor) {
    breakSound.currentTime = 0;
    breakSound.play();
    
    let lvl = Number(meteor.dataset.level || 1);
    if (lvl > 1) {
        lvl--;
        meteor.dataset.level = lvl;
        meteor.src = `tingkat${lvl}.png`;
        meteor.style.filter = 'brightness(1.5)';
        setTimeout(() => meteor.style.filter = '', 120);
        return;
    }
    
    const mr = meteor.getBoundingClientRect();
    spawnExplosion(mr.left + mr.width / 2, mr.top + mr.height / 2, 26);
    meteor.remove();
    gameMeteors = gameMeteors.filter(m => m !== meteor);
    addScore(10 * rebirthMultiplier);
}

function enemyHit(enemy) {
    breakSound.currentTime = 0;
    breakSound.play();
    
    const er = enemy.getBoundingClientRect();
    spawnExplosion(er.left + er.width / 2, er.top + er.height / 2, 30);
    enemy.remove();
    gameEnemies = gameEnemies.filter(e => e !== enemy);
    addScore(20 * rebirthMultiplier);
}

function bossHit(boss) {
    breakSound.currentTime = 0;
    breakSound.play();
    
    const damage = 50 + (upgrades.bullet.level * 10);
    bossHP -= damage;
    
    const br = boss.getBoundingClientRect();
    spawnExplosion(br.left + br.width / 2, br.top + br.height / 2, 15);
    
    updateBossHPBar();
    
    if (bossHP <= 0) {
        bossDefeated(boss);
    }
}

function bossDefeated(boss) {
    const br = boss.getBoundingClientRect();
    spawnExplosion(br.left + br.width / 2, br.top + br.height / 2, 80);
    
    boss.remove();
    gameEnemies = gameEnemies.filter(e => e !== boss);
    bossActive = false;
    bossHPBar.style.display = 'none';
    
    bossDefeatedCount++;
    
    const bonusScore = bossType === 'boss' ? 500 : 1000;
    addScore(bonusScore * rebirthMultiplier);
    
    bossMusic.pause();
    gameplayMusic.currentTime = 0;
    gameplayMusic.play();
    
    showToast(`${bossType === 'boss' ? 'BOSS' : 'MEGA BOSS'} DIKALAHKAN! +${bonusScore} Score`);
    showToast(`Boss berikutnya pada skor ${nextBossScore}`);
}

function updateBossHPBar() {
    const hpPercent = (bossHP / maxBossHP) * 100;
    bossHPFill.style.width = hpPercent + '%';
    bossHPText.textContent = `${bossType === 'boss' ? 'BOSS' : 'MEGA BOSS'} HP: ${bossHP}/${maxBossHP}`;
}

function spawnExplosion(x, y, count = 18) {
    if (typeof x === 'string') x = parseFloat(x) || 0;
    if (typeof y === 'string') y = parseFloat(y) || 0;
    
    for (let i = 0; i < count; i++) {
        const part = document.createElement('div');
        part.style.position = 'absolute';
        part.style.left = (x + Math.random() * 40 - 20) + 'px';
        part.style.top = (y + Math.random() * 40 - 20) + 'px';
        part.style.width = (2 + Math.random() * 6) + 'px';
        part.style.height = part.style.width;
        part.style.borderRadius = '50%';
        part.style.pointerEvents = 'none';
        const hue = 20 + Math.random() * 40;
        part.style.background = `linear-gradient(90deg, rgba(255,${120 + Math.floor(Math.random() * 80)},40,1), rgba(255,220,120,0.8))`;
        part.style.opacity = '1';
        part.style.zIndex = 999;
        document.body.appendChild(part);

        const vx = (Math.random() - 0.5) * (3 + Math.random() * 10);
        const vy = (Math.random() - 0.5) * (3 + Math.random() * 10);

        let life = 600 + Math.random() * 500;
        const start = Date.now();
        const anim = setInterval(() => {
            const t = Date.now() - start;
            if (!document.body.contains(part)) { 
                clearInterval(anim); 
                return; 
            }
            
            part.style.left = (parseFloat(part.style.left) + vx * (t / 1000)) + 'px';
            part.style.top = (parseFloat(part.style.top) + vy * (t / 1000) + 0.02 * t) + 'px';
            const prog = t / life;
            part.style.opacity = Math.max(0, 1 - prog);
            part.style.transform = `scale(${1 - prog})`;
            
            if (t > life) {
                part.remove();
                clearInterval(anim);
            }
        }, 28);
    }
}

function checkCollisions() {
    const pr = player.getBoundingClientRect();
    
    gameMeteors.slice().forEach(m => {
        if (!document.body.contains(m)) return;
        if (isCollide(player, m)) {
            const dmg = 18 + Math.floor(Math.random() * 8);
            reduceHP(dmg);
            const mr = m.getBoundingClientRect();
            const cx = (Math.max(pr.left, mr.left) + Math.min(pr.right, mr.right)) / 2;
            const cy = (Math.max(pr.top, mr.top) + Math.min(pr.bottom, mr.bottom)) / 2;
            spawnExplosion(cx, cy, 22);
            m.remove();
            gameMeteors = gameMeteors.filter(x => x !== m);
        }
    });
    
    gameEnemies.slice().forEach(e => {
        if (!document.body.contains(e)) return;
        if (isCollide(player, e)) {
            const dmg = 25 + Math.floor(Math.random() * 10);
            reduceHP(dmg);
            const er = e.getBoundingClientRect();
            const cx = (Math.max(pr.left, er.left) + Math.min(pr.right, er.right)) / 2;
            const cy = (Math.max(pr.top, er.top) + Math.min(pr.bottom, er.bottom)) / 2;
            spawnExplosion(cx, cy, 25);
            e.remove();
            gameEnemies = gameEnemies.filter(x => x !== e);
        }
    });
}

/* ================= HP SYSTEM ================= */
function reduceHP(amount) {
    currentHP -= amount;
    if (currentHP < 0) currentHP = 0;
    updateHPBar();
    if (currentHP <= 0) onPlayerDeath();
}

function updateHPBar() {
    const pct = Math.max(0, currentHP / maxHP * 100);
    hpBar.style.width = pct + '%';
    if (pct < 30) hpBar.style.background = 'linear-gradient(90deg,#ff6b6b,#ff3b3b)';
    else hpBar.style.background = 'linear-gradient(90deg,var(--hp-fill-start),var(--hp-fill-end))';
}

function onPlayerDeath() {
    gameRunning = false;
    stopMeteorSpawner();
    stopEnemySpawner();
    
    gameoverSound.currentTime = 0;
    gameoverSound.play();
    
    gameMeteors.forEach(m => m.remove());
    gameMeteors = [];
    gameEnemies.forEach(e => e.remove());
    gameEnemies = [];
    enemyBullets.forEach(b => b.remove());
    enemyBullets = [];
    
    bossHPBar.style.display = 'none';
    bossWarning.style.display = 'none';
    document.querySelector('.touch-controls').style.display = 'none';
    
    if (score > highScore) {
        highScore = score;
        updateHighScore();
        saveAllData();
    }
    
    finalScoreText.innerText = 'Score: ' + score;
    gameOver.style.display = 'flex';
    
    saveAllData();
}

/* ================= SCORE SYSTEM ================= */
function addScore(n) {
    score += n;
    updateScore();
    checkUnlocks();
    
    if (score > highScore) {
        highScore = score;
        updateHighScore();
    }
}

function updateScore() { 
    scoreBoard.innerText = 'SCORE: ' + score; 
}

function updateHighScore() { 
    highScoreBoard.innerText = 'HIGH SCORE: ' + highScore; 
    if (document.getElementById('currentHighScore')) {
        document.getElementById('currentHighScore').textContent = highScore;
    }
}

function checkUnlocks() {
    const normalUnlockThresholds = {
        1: 100, 2: 200, 3: 350, 4: 500, 5: 700,
        6: 900, 7: 1200, 8: 1500, 9: 1800, 10: 2200,
        11: 2600, 12: 3000, 13: 3500, 14: 4000
    };
    
    for (let i = 1; i <= 14; i++) {
        if (!normalSkinUnlocked[i] && score >= normalUnlockThresholds[i]) {
            normalSkinUnlocked[i] = true;
            unlockNormalSkinVisual(i);
            showToast('Normal Skin ' + (i + 1) + ' unlocked!');
            saveAllData();
        }
    }
    
    const fantasyUnlockThresholds = {
        1: 150, 2: 300, 3: 500, 4: 700, 5: 1000,
        6: 1500, 7: 2000, 8: 2500, 9: 3000, 10: 4000,
        11: 5000, 12: 6000, 13: 7000, 14: 8000
    };
    
    for (let i = 1; i <= 14; i++) {
        if (!fantasySkinUnlocked[i] && score >= fantasyUnlockThresholds[i]) {
            fantasySkinUnlocked[i] = true;
            unlockFantasySkinVisual(i);
            showToast('Fantasy Skin ' + (i + 1) + ' unlocked!');
            saveAllData();
        }
    }
}

function unlockNormalSkinVisual(idx) {
    const el = document.getElementById('normal' + idx);
    const lbl = document.getElementById('normal' + idx + 'Label');
    if (el) el.classList.remove('locked');
    if (lbl) { 
        lbl.style.color = '#fff'; 
        const unlockThresholds = {
            1: 100, 2: 200, 3: 350, 4: 500, 5: 700,
            6: 900, 7: 1200, 8: 1500, 9: 1800, 10: 2200,
            11: 2600, 12: 3000, 13: 3500, 14: 4000
        };
        lbl.innerText = 'Unlocked (' + unlockThresholds[idx] + ')'; 
    }
}

function unlockFantasySkinVisual(idx) {
    const el = document.getElementById('skin' + idx);
    const lbl = document.getElementById('skin' + idx + 'Label');
    if (el) el.classList.remove('locked');
    if (lbl) { 
        lbl.style.color = '#fff'; 
        const unlockThresholds = {
            1: 150, 2: 300, 3: 500, 4: 700, 5: 1000,
            6: 1500, 7: 2000, 8: 2500, 9: 3000, 10: 4000,
            11: 5000, 12: 6000, 13: 7000, 14: 8000
        };
        lbl.innerText = 'Unlocked (' + unlockThresholds[idx] + ')'; 
    }
}

/* ================= UPGRADE SYSTEM ================= */
function calculateUpgradeCost(baseCost, currentLevel) {
    return Math.floor(baseCost * Math.pow(currentLevel + 1, 1.2));
}

function updateUpgradeButtons() {
    document.getElementById('currentHighScore').textContent = highScore;
    
    const upgradeKeys = ['health', 'bullet', 'speed', 'double', 'triple', 'quad', 'rebirth'];
    
    upgradeKeys.forEach(key => {
        const upgrade = upgrades[key];
        const cost = calculateUpgradeCost(upgrade.baseCost, upgrade.level);
        const levelEl = document.getElementById(key + 'Level');
        const costEl = document.getElementById(key + 'Cost');
        const btnEl = document.getElementById(key + 'UpgradeBtn');
        
        if (levelEl) levelEl.textContent = upgrade.level;
        if (costEl) costEl.textContent = `Cost: ${cost}`;
        if (btnEl) {
            btnEl.disabled = upgrade.level >= upgrade.maxLevel || highScore < cost;
        }
    });
}

function upgrade(type) {
    const upgrade = upgrades[type];
    const cost = calculateUpgradeCost(upgrade.baseCost, upgrade.level);
    
    if (highScore >= cost && upgrade.level < upgrade.maxLevel) {
        highScore -= cost;
        upgrade.level++;
        
        switch(type) {
            case 'health':
                maxHP += 50;
                currentHP = maxHP;
                updateHPBar();
                document.getElementById('upgradeStatus').textContent = 'Health upgraded! +50 HP (Total: ' + maxHP + ' HP)';
                showToast('Health upgraded to ' + maxHP + ' HP');
                break;
            case 'bullet':
                bulletUpgraded = true;
                document.getElementById('upgradeStatus').textContent = 'Bullet upgraded! Power increased (Level ' + upgrade.level + ')';
                showToast('Bullet power upgraded! Level ' + upgrade.level);
                break;
            case 'speed':
                speed += 1;
                document.getElementById('upgradeStatus').textContent = 'Speed upgraded! +1 movement (Total: ' + speed + ' speed)';
                showToast('Movement speed increased! Level ' + upgrade.level);
                break;
            case 'double':
                doubleShot = true;
                tripleShot = false;
                quadShot = false;
                document.getElementById('upgradeStatus').textContent = 'Double Shot unlocked!';
                showToast('Double Shot activated!');
                break;
            case 'triple':
                doubleShot = false;
                tripleShot = true;
                quadShot = false;
                document.getElementById('upgradeStatus').textContent = 'Triple Shot unlocked!';
                showToast('Triple Shot activated!');
                break;
            case 'quad':
                doubleShot = false;
                tripleShot = false;
                quadShot = true;
                document.getElementById('upgradeStatus').textContent = 'Quad Shot unlocked!';
                showToast('Quad Shot activated!');
                break;
            case 'rebirth':
                rebirthMultiplier = 1 + (upgrade.level * 0.5);
                document.getElementById('upgradeStatus').textContent = 'Rebirth activated! Score and damage x' + rebirthMultiplier;
                showToast('Rebirth level ' + upgrade.level + '! Multiplier: x' + rebirthMultiplier);
                break;
        }
        
        updateHighScore();
        updateUpgradeButtons();
        saveAllData();
    }
}

/* ================= UI FUNCTIONS ================= */
function openUpgradeMenu() {
    playClickSound();
    updateUpgradeButtons();
    upgradePanel.style.display = 'flex';
}

function closeUpgradeMenu() {
    playClickSound();
    upgradePanel.style.display = 'none';
}

function openSkinMenu() { 
    playClickSound();
    
    for (let i = 1; i <= 14; i++) {
        const el = document.getElementById('normal' + i);
        const lbl = document.getElementById('normal' + i + 'Label');
        if (normalSkinUnlocked[i]) { 
            if (el) el.classList.remove('locked'); 
            if (lbl) lbl.style.color = '#fff'; 
        } else { 
            if (el) el.classList.add('locked'); 
            if (lbl) lbl.style.color = '#ccc'; 
        }
    }
    
    for (let i = 1; i <= 14; i++) {
        const el = document.getElementById('skin' + i);
        const lbl = document.getElementById('skin' + i + 'Label');
        if (fantasySkinUnlocked[i]) { 
            if (el) el.classList.remove('locked'); 
            if (lbl) lbl.style.color = '#fff'; 
        } else { 
            if (el) el.classList.add('locked'); 
            if (lbl) lbl.style.color = '#ccc'; 
        }
    }
    
    skinPanel.style.display = 'flex';
}

function closeSkinMenu() { 
    playClickSound();
    skinPanel.style.display = 'none'; 
}

function trySelectNormalSkin(idx) {
    playClickSound();
    
    if (!normalSkinUnlocked[idx]) {
        const unlockThresholds = {
            1: 100, 2: 200, 3: 350, 4: 500, 5: 700,
            6: 900, 7: 1200, 8: 1500, 9: 1800, 10: 2200,
            11: 2600, 12: 3000, 13: 3500, 14: 4000
        };
        showToast('Skin terkunci. Capai skor ' + unlockThresholds[idx] + ' untuk unlock.');
        return;
    }
    
    selectedSkin = 'normal' + (idx + 1) + '.png';
    player.src = selectedSkin;
    showToast('Normal Skin ' + (idx + 1) + ' diterapkan');
    saveAllData();
}

function trySelectSkin(idx) {
    playClickSound();
    
    if (!fantasySkinUnlocked[idx]) {
        const unlockThresholds = {
            1: 150, 2: 300, 3: 500, 4: 700, 5: 1000,
            6: 1500, 7: 2000, 8: 2500, 9: 3000, 10: 4000,
            11: 5000, 12: 6000, 13: 7000, 14: 8000
        };
        showToast('Skin terkunci. Capai skor ' + unlockThresholds[idx] + ' untuk unlock.');
        return;
    }
    
    selectedSkin = 'skin' + (idx + 1) + '.png';
    player.src = selectedSkin;
    showToast('Fantasy Skin ' + (idx + 1) + ' diterapkan');
    saveAllData();
}

function openInfoMenu() {
    playClickSound();
    infoPanel.style.display = 'flex';
}

function closeInfoMenu() {
    playClickSound();
    infoPanel.style.display = 'none';
}

let toastT;
function showToast(text) {
    clearTimeout(toastT);
    toast.innerText = text;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    toastT = setTimeout(() => { 
        toast.style.opacity = '0'; 
        setTimeout(() => toast.style.display = 'none', 300); 
    }, 2000);
}

/* ================= SAVE/LOAD SYSTEM ================= */
function saveAllData() {
    localStorage.setItem('meteorGameNormalSkins', JSON.stringify(normalSkinUnlocked));
    localStorage.setItem('meteorGameFantasySkins', JSON.stringify(fantasySkinUnlocked));
    localStorage.setItem('meteorGameUpgrades', JSON.stringify(upgrades));
    localStorage.setItem('meteorGameBulletUpgraded', bulletUpgraded);
    localStorage.setItem('meteorGameSpeed', speed);
    localStorage.setItem('meteorGameMaxHP', maxHP);
    localStorage.setItem('meteorGameSelectedSkin', selectedSkin);
    localStorage.setItem('meteorGameHighScore', highScore);
    localStorage.setItem('meteorGameDoubleShot', doubleShot);
    localStorage.setItem('meteorGameTripleShot', tripleShot);
    localStorage.setItem('meteorGameQuadShot', quadShot);
    localStorage.setItem('meteorGameRebirthMultiplier', rebirthMultiplier);
}

function loadAllData() {
    const savedNormalSkins = localStorage.getItem('meteorGameNormalSkins');
    const savedFantasySkins = localStorage.getItem('meteorGameFantasySkins');
    const savedUpgrades = localStorage.getItem('meteorGameUpgrades');
    const savedBullet = localStorage.getItem('meteorGameBulletUpgraded');
    const savedSpeed = localStorage.getItem('meteorGameSpeed');
    const savedMaxHP = localStorage.getItem('meteorGameMaxHP');
    const savedSkin = localStorage.getItem('meteorGameSelectedSkin');
    const savedHighScore = localStorage.getItem('meteorGameHighScore');
    const savedDouble = localStorage.getItem('meteorGameDoubleShot');
    const savedTriple = localStorage.getItem('meteorGameTripleShot');
    const savedQuad = localStorage.getItem('meteorGameQuadShot');
    const savedRebirth = localStorage.getItem('meteorGameRebirthMultiplier');
    
    if (savedNormalSkins) {
        const loaded = JSON.parse(savedNormalSkins);
        normalSkinUnlocked = { ...normalSkinUnlocked, ...loaded };
    }
    
    if (savedFantasySkins) {
        const loaded = JSON.parse(savedFantasySkins);
        fantasySkinUnlocked = { ...fantasySkinUnlocked, ...loaded };
    }
    
    if (savedUpgrades) {
        const loaded = JSON.parse(savedUpgrades);
        Object.keys(loaded).forEach(key => {
            if (upgrades[key]) {
                upgrades[key] = { ...upgrades[key], ...loaded[key] };
            }
        });
    }
    
    if (savedBullet) bulletUpgraded = JSON.parse(savedBullet);
    if (savedSpeed) speed = parseInt(savedSpeed);
    if (savedMaxHP) maxHP = parseInt(savedMaxHP);
    if (savedSkin) selectedSkin = savedSkin;
    if (savedHighScore) {
        highScore = parseInt(savedHighScore);
        updateHighScore();
    }
    if (savedDouble) doubleShot = JSON.parse(savedDouble);
    if (savedTriple) tripleShot = JSON.parse(savedTriple);
    if (savedQuad) quadShot = JSON.parse(savedQuad);
    if (savedRebirth) rebirthMultiplier = parseFloat(savedRebirth);
}

/* ================= HELPER FUNCTIONS ================= */
function playClickSound() {
    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.log('Audio play failed:', e));
}

function setupButtonHoverEffects() {
    const buttons = document.querySelectorAll('.btn, .upgrade-btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => playClickSound());
        btn.addEventListener('click', () => playClickSound());
    });
}

function setupAudio() {
    bgMusic.volume = 0.7;
    gameplayMusic.volume = 0.7;
    shootSound.volume = 0.5;
    breakSound.volume = 0.6;
    clickSound.volume = 0.3;
    gameoverSound.volume = 0.7;
    launchSound.volume = 0.5;
    bossMusic.volume = 0.7;
    if (bossWarningSound) bossWarningSound.volume = 0.8;
}

function bindEvents() {
    // Enable audio after first user interaction
    document.addEventListener('click', function enableAudio() {
        bgMusic.play().catch(e => console.log('Autoplay prevented'));
        document.removeEventListener('click', enableAudio);
    });
    
    // Prevent image drag
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', e => e.preventDefault());
    });
    
    // Mobile touch to shoot
    document.addEventListener('touchstart', (e) => {
        if (!gameRunning) return;
        if (e.target.closest('.touch-btn')) return;
        shoot();
    });
}

/* ================= INITIALIZE GAME ================= */
document.addEventListener('DOMContentLoaded', initializeGame);
