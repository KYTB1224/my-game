import { setPlayer2Monster } from './main.js';

export const specialBgmAudio = new Audio('assets/sound/special-bgm.mp3');
specialBgmAudio.loop = true;

const specialBtn = document.getElementById('special-btn');
const specialScreen = document.getElementById('special-screen');
const startupScreen = document.getElementById('startup-screen');
const scanScreen = document.getElementById('scan-screen');
const startScanBtn = document.getElementById('start-scan');
const stopScanBtn = document.getElementById('stop-scan');
const loadMonsterBtn = document.getElementById('load-monster-btn');
const approveBtn = document.getElementById('approve-btn');
const rescanBtn = document.getElementById('rescan-btn');
const startBattleBtn = document.getElementById('start-battle-btn');
const scanResultText = document.getElementById('scan-result');
const monsterImage = document.getElementById('monster-image');


// 「Specialボタン」の有効化・無効化を切り替える関数
export function updateSpecialButtonState(specialBtn) {
    let discoveredCount = 0;
    const monsterNames = ["Asian Dragon","Cerberus", "Cockatrice", "Dark Knight", "Dark Pharaoh", "Death Plant", "Demon", "Dinosaur", "Dragon", "Gargoyle", "Ghost", "Goblin", "Golem", "Gryphon", "Harpy", "Jack-o'-lantern", "Living Dead", "Lizardman", "Mandrake", "Minotaur", "Mummy", "Orc", "Phantom", "Phoenix", "Sea Serpent", "Skeleton", "Troll", "Vampire", "Werewolf", "Yeti"];

    monsterNames.forEach(name => {
        if (localStorage.getItem(`discovered-${name}`)) discoveredCount++;
    });

    specialBtn.disabled = discoveredCount < 5;
}

// 発見モンスター数に応じて各Specialボタンの有効化を判定
function updateSpecialStages() {
    let discoveredCount = 0;
    const monsterNames = ["Asian Dragon","Cerberus", "Cockatrice", "Dark Knight", "Dark Pharaoh", "Death Plant", "Demon", "Dinosaur", "Dragon", "Gargoyle", "Ghost", "Goblin", "Golem", "Gryphon", "Harpy", "Jack-o'-lantern", "Living Dead", "Lizardman", "Mandrake", "Minotaur", "Mummy", "Orc", "Phantom", "Phoenix", "Sea Serpent", "Skeleton", "Troll", "Vampire", "Werewolf", "Yeti"];

    monsterNames.forEach(name => {
        if (localStorage.getItem(`discovered-${name}`)) discoveredCount++;
    });

    document.getElementById('special-1-btn').disabled = discoveredCount < 10;
    document.getElementById('special-2-btn').disabled = discoveredCount < 20;
    document.getElementById('special-3-btn').disabled = discoveredCount < 30;
}

function removeQrVideo() {
    const oldVideo = document.getElementById('qr-video');
    if (oldVideo && oldVideo.parentNode) {
        oldVideo.parentNode.removeChild(oldVideo);
    }
}

// Specialボタンが押されたら画面遷移
specialBtn.addEventListener('click', () => {
    document.getElementById('privacy-policy-link').style.display = 'none';
    document.getElementById('copyright-notice').style.display = 'none';

    removeQrVideo();
    startupScreen.style.display = 'none';
    specialScreen.style.display = 'flex';

    specialBgmAudio.currentTime = 0;
    specialBgmAudio.play();

    const startupBgm = document.getElementById('startup-bgm');
    startupBgm.pause();
    startupBgm.currentTime = 0;

    updateSpecialStages();
});

// Special 1ボタン処理
const special1Btn = document.getElementById('special-1-btn');
special1Btn.addEventListener('click', () => {
    localStorage.removeItem('isNormalBattle'); // 🌟 明示的に通常バトルフラグを消す
    localStorage.setItem('isSpecialBattle', 'special_1');
    specialScreen.style.display = 'none';
    scanScreen.style.display = 'block';

    localStorage.setItem('isSpecialBattle', 'special_1');

    scanResultText.textContent = "Player 1, please scan your monster.";

    // ボタンの初期化処理（displayとdisabledをセット）
    startScanBtn.style.display = 'inline-block';
    startScanBtn.disabled = false;

    stopScanBtn.style.display = 'inline-block';
    stopScanBtn.disabled = true;

    loadMonsterBtn.style.display = 'inline-block';
    loadMonsterBtn.disabled = false;

    approveBtn.style.display = 'none';
    rescanBtn.style.display = 'none';
    startBattleBtn.style.display = 'none';
    
    // モンスター画像を非表示に戻す
    monsterImage.src = "";
    monsterImage.style.display = "none";

    // カメラ映像を表示（重要！これがないと黒丸が消える）
    const qrVideo = document.getElementById('qr-video');
    if (qrVideo) {
        qrVideo.style.display = 'block';
    }
});



// Special 2ボタン処理
const special2Btn = document.getElementById('special-2-btn');
special2Btn.addEventListener('click', () => {
    localStorage.removeItem('isNormalBattle'); // 🌟 明示的に通常バトルフラグを消す
    localStorage.setItem('isSpecialBattle', 'special_1');
    specialScreen.style.display = 'none';
    scanScreen.style.display = 'block';

    localStorage.setItem('isSpecialBattle', 'special_2');

    scanResultText.textContent = "Player 1, please scan your monster.";

    // ボタンの初期化処理（displayとdisabledをセット）
    startScanBtn.style.display = 'inline-block';
    startScanBtn.disabled = false;

    stopScanBtn.style.display = 'inline-block';
    stopScanBtn.disabled = true;

    loadMonsterBtn.style.display = 'inline-block';
    loadMonsterBtn.disabled = false;

    approveBtn.style.display = 'none';
    rescanBtn.style.display = 'none';
    startBattleBtn.style.display = 'none';
    
    // モンスター画像を非表示に戻す
    monsterImage.src = "";
    monsterImage.style.display = "none";

    // カメラ映像を表示（重要！これがないと黒丸が消える）
    const qrVideo = document.getElementById('qr-video');
    if (qrVideo) {
        qrVideo.style.display = 'block';
    }
});

// Special 3ボタン処理
const special3Btn = document.getElementById('special-3-btn');
special3Btn.addEventListener('click', () => {
    localStorage.removeItem('isNormalBattle'); // 🌟 明示的に通常バトルフラグを消す
    localStorage.setItem('isSpecialBattle', 'special_1');
    specialScreen.style.display = 'none';
    scanScreen.style.display = 'block';

    localStorage.setItem('isSpecialBattle', 'special_3');

    scanResultText.textContent = "Player 1, please scan your monster.";

    // ボタンの初期化処理（displayとdisabledをセット）
    startScanBtn.style.display = 'inline-block';
    startScanBtn.disabled = false;

    stopScanBtn.style.display = 'inline-block';
    stopScanBtn.disabled = true;

    loadMonsterBtn.style.display = 'inline-block';
    loadMonsterBtn.disabled = false;

    approveBtn.style.display = 'none';
    rescanBtn.style.display = 'none';
    startBattleBtn.style.display = 'none';
    
    // モンスター画像を非表示に戻す
    monsterImage.src = "";
    monsterImage.style.display = "none";

    // カメラ映像を表示（重要！これがないと黒丸が消える）
    const qrVideo = document.getElementById('qr-video');
    if (qrVideo) {
        qrVideo.style.display = 'block';
    }
});


// SpecialモンスターをP2にセットする関数
// SpecialモンスターをP2にセットする関数
export function setSpecialBattleOpponent(specialBattleName) {
    let monsterData;
    switch (specialBattleName) {
        case "special_1":
            monsterData = {
                name: "Fat Troll",
                element: "Emotional",
                maxHp: 2000,
                baseAttack: 120,
                baseDefense: 130,
                speed: 20,
                skill1: "Overload",
                skill2: "Overload",
                skills: ["Overload", "Overload"],
                imagePath: "assets/monsters/fat_troll.webp"
            };
            break;

        case "special_2":
            monsterData = {
                name: "Drake",
                element: "Instinctive",
                maxHp: 1400,
                baseAttack: 250,
                baseDefense: 180,
                speed: 220,
                skill1: "Critical",
                skill2: "Thorns",
                skills: ["Critical", "Thorns"],
                imagePath: "assets/monsters/drake.webp"
            };
            break;

        case "special_3":
            monsterData = {
                name: "Bael",
                element: "Logical",
                maxHp: 1600,
                baseAttack: 230,
                baseDefense: 230,
                speed: 250,
                skill1: "Vampire",
                skill2: "Counter",
                skills: ["Vampire", "Counter"],
                imagePath: "assets/monsters/bael.webp"
            };
            break;

        default:
            console.error("Unknown special battle: " + specialBattleName);
            return;
    }

    setPlayer2Monster(monsterData);
}

const specialBackBtn = document.getElementById('special-back-btn');

specialBackBtn.addEventListener('click', () => {
    document.getElementById('privacy-policy-link').style.display = 'block';
    document.getElementById('copyright-notice').style.display = 'block';

    // 🌟 special BGMを停止
    specialBgmAudio.pause();
    specialBgmAudio.currentTime = 0;

    // 🌟 起動画面に戻る処理
    document.getElementById('special-screen').style.display = 'none';
    document.getElementById('startup-screen').style.display = 'flex';

    // 起動画面のBGMを再開したい場合（オプション）
    const startupBgm = document.getElementById('startup-bgm');
    startupBgm.currentTime = 0;
    if (!window.isMuted) startupBgm.play();

    // Special画面の状態リセット（必要なら追加）
    updateSpecialStages();
});
