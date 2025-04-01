// main.jsの冒頭部（修正版）
const scanResultText = document.getElementById('scan-result');
const startScanBtn = document.getElementById('start-scan');
const stopScanBtn = document.getElementById('stop-scan');
// ★ loadMonsterBtnの定義は削除
const approveBtn = document.getElementById('approve-btn');
const rescanBtn = document.getElementById('rescan-btn');
const startBattleBtn = document.getElementById('start-battle-btn');

export let player1Monster = null;
export let player2Monster = null;
export let currentScannedMonster = null;
export let scanningForPlayer = 1;
export function setScanningForPlayer(value) {
    scanningForPlayer = value;
}

export function setCurrentScannedMonster(monster) {
    currentScannedMonster = monster;
}


export function registerMonster(monster) {
    const imagePath = `assets/monsters/${monster.name.toLowerCase().replace(/ /g, "_")}.webp`;

    if (scanningForPlayer === 1) {
        player1Monster = monster;
        scanningForPlayer = 2;

        scanResultText.classList.remove('monster-box');
        scanResultText.classList.add('simple-text');
        scanResultText.textContent = "Player 1's monster is ready! Please scan Player 2's monster.";

        const player1Image = document.getElementById('player1-monster-image');
        player1Image.src = imagePath;
        player1Image.classList.remove('mirror-image');
        startScanBtn.style.display = "inline-block";
        stopScanBtn.style.display = "inline-block";
        document.getElementById('load-monster-btn').style.display = "inline-block"; // ←直接取得に変更
        approveBtn.style.display = "none";
        rescanBtn.style.display = "none";

    } else if (scanningForPlayer === 2) {
        player2Monster = monster;

        scanResultText.classList.remove('monster-box');
        scanResultText.classList.add('simple-text');
        scanResultText.textContent = "Player 2's monster is ready! Let the battle begin!";

        const player2Image = document.getElementById('player2-monster-image');
        player2Image.src = imagePath;
        player2Image.classList.add('mirror-image');

        startScanBtn.style.display = "none";
        stopScanBtn.style.display = "none";
        document.getElementById('load-monster-btn').style.display = "none"; // ←直接取得に変更
        approveBtn.style.display = "none";
        rescanBtn.style.display = "none";
        startBattleBtn.style.display = "inline-block";
    }
}

export function resetMonsters() {
    player1Monster = null;
    player2Monster = null;
    currentScannedMonster = null;
    scanningForPlayer = 1;
}

// Main.jsに必要な関数（未実装の場合）
export function setPlayer2Monster(monsterData) {
    player2Monster = { ...monsterData, hp: monsterData.maxHp };
    const player2MonsterImage = document.getElementById('player2-monster-image');
    player2MonsterImage.src = monsterData.imagePath;
    player2MonsterImage.style.display = "block";
}
