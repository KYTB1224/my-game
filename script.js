import {getElementEmoji, getSkillEmoji } from './js/utils.js';
import { 
    player1Monster, 
    player2Monster, 
    currentScannedMonster, 
    registerMonster,
    setCurrentScannedMonster,
    resetMonsters // 🌟 ここを追記
} from './js/main.js';

import { playAttackSpriteAnimation } from './js/attackEffect.js';
import { playSkillSpriteAnimation } from './js/attackEffect.js';
import { scanQRCode, stopScanning } from './js/qr-scanner.js';
import { showPopupMessage } from './js/qr-scanner.js';
import * as Main from './js/main.js';
// script.js の最初の方に追記
import { updateSpecialButtonState } from './js/special.js';
import { specialBgmAudio } from './js/special.js';
import { setSpecialBattleOpponent } from './js/special.js';

import { setScanningForPlayer } from './js/main.js';


window.addEventListener('DOMContentLoaded', () => {
    updateSpecialButtonState(specialBtn); // 🌟 起動時にSpecialボタンの状態を更新
    document.getElementById('privacy-policy-link').style.display = 'block'; // 追加
});



let isFastForwarding = false;

const startupScreen = document.getElementById('startup-screen');
const scanScreen = document.getElementById('scan-screen');
const battleContainer = document.getElementById('battle-container');
const video = document.getElementById('qr-video');
const gameStartBtn = document.getElementById('game-start-btn');
const startScanBtn = document.getElementById('start-scan');
const stopScanBtn = document.getElementById('stop-scan');
const specialBtn = document.getElementById('special-btn');
const scanResultText = document.getElementById('scan-result');
const hpDisplay = document.getElementById('hp-display');
const startBattleBtn = document.getElementById('start-battle-btn');
const nextTurnBtn = document.getElementById('next-turn-btn');
const approveBtn = document.getElementById('approve-btn');
const rescanBtn = document.getElementById('rescan-btn');
const scanNextBattleBtn = document.getElementById('scan-next-battle-btn');
const quitGameBtn = document.getElementById('quit-game-btn');
const battleLogElement = document.getElementById('battle-log');
const fastForwardBtn = document.getElementById('fast-forward-btn');

fastForwardBtn.onclick = () => {
    fastForwardBtn.style.display = "none";
    nextTurnBtn.style.display = "none";
    fastForwardTurns(5); // ここで専用関数を呼ぶだけ
};

function removeQrVideo() {
    const oldVideo = document.getElementById('qr-video');
    if (oldVideo && oldVideo.parentNode) {
        oldVideo.parentNode.removeChild(oldVideo);
    }
}

function createQrVideo() {
    const container = document.getElementById('camera-container');
    const newVideo = document.createElement('video');
    newVideo.id = 'qr-video';
    newVideo.style.display = 'block';
    container.appendChild(newVideo);
}

const buttonsToHide = [nextTurnBtn, startBattleBtn, approveBtn, rescanBtn, scanNextBattleBtn, quitGameBtn];
buttonsToHide.forEach(btn => btn.style.display = "none");

const scanBgmAudio = new Audio('assets/sound/scan-bgm.mp3');
scanBgmAudio.loop = true; // 🌟ループ再生をオン

scanScreen.style.display = 'none';  
startupScreen.style.display = 'block';
let qrScanner;

window.attackSound = new Audio('assets/sound/attack-sound.mp3');
window.skillSound = new Audio('assets/sound/skill-sound.mp3');
window.scanCompleteSound = new Audio('assets/sound/scan-complete.mp3');

const skillDescriptions = {
    "Lucky": "🍀 Occasionally grants beneficial effects in battle.",
    "Double Lucky": "🍀🍀 Frequently grants beneficial effects in battle.",
    "Counter": "🔄 Sometimes counterattacks when damaged.",
    "Double Counter": "🔄🔄 Frequently counterattacks when damaged.",
    "Heal": "❤️ Restores a small amount of HP after each turn.",
    "Double Heal": "❤️❤️ Restores a large amount of HP each turn.",
    "Revive": "✨ Occasionally revives when defeated (1 HP).",
    "Double Revive": "✨✨ Frequently revives when defeated (1 HP).",
    "Thorns": "🌵 Reflects small damage back when attacked.",
    "Double Thorns": "🌵🌵 Reflects significant damage when attacked.",
    "Evasion": "👟 Occasionally evades enemy attacks completely.",
    "Double Evasion": "👟👟 Frequently evades enemy attacks completely.",
    "Endurance": "🛡️ Slightly reduces damage taken at low HP.",
    "Double Endurance": "🛡️🛡️ Greatly reduces damage taken at low HP.",
    "Growth": "📈 ATK gradually increases (up to 3 activations).",
    "Double Growth": "📈📈 ATK gradually rises faster later (max 6).",
    "Learning": "📚 DEF gradually increases (up to 3 activations).",
    "Double Learning": "📚📚 DEF gradually rises faster later (max 6).",
    "Critical": "💥 Occasionally deals double damage when attacking.",
    "Double Critical": "💥💥 Often deals double damage when attacking.",
    "Vampire": "🦇 Absorbs small HP & slightly boosts ATK on attack.",
    "Double Vampire": "🦇🦇 Absorbs more HP & moderately boosts ATK.",
    "Overload": "⚡ Gradually boosts ATK but takes self-damage.",
    "Double Overload": "⚡⚡ Greatly boosts ATK, but takes high self-damage.",
    "Petrify": "🪨 Occasionally boosts ATK or halves damage taken.",
    "Double Petrify": "🪨🪨 Often boosts ATK or halves damage taken."
};

const monsterImageMap = {
    "Cerberus": "assets/monsters/cerberus.webp",
    "Cockatrice": "assets/monsters/cockatrice.webp",
    "Dark Knight": "assets/monsters/dark_knight.webp",
    "Death Plant": "assets/monsters/death_plant.webp",
    "Demon": "assets/monsters/demon.webp",
    "Dinosaur": "assets/monsters/dinosaur.webp",
    "Gargoyle": "assets/monsters/gargoyle.webp",
    "Ghost": "assets/monsters/ghost.webp",
    "Goblin": "assets/monsters/goblin.webp",
    "Gryphon": "assets/monsters/gryphon.webp",
    "Harpy": "assets/monsters/harpy.webp",
    "Living Dead": "assets/monsters/living_dead.webp",
    "Lizardman": "assets/monsters/lizardman.webp",
    "Mandrake": "assets/monsters/mandrake.webp",
    "Minotaur": "assets/monsters/minotaur.webp",
    "Mummy": "assets/monsters/mummy.webp",
    "Orc": "assets/monsters/orc.webp",
    "Phantom": "assets/monsters/phantom.webp",
    "Sea Serpent": "assets/monsters/sea_serpent.webp",
    "Skeleton": "assets/monsters/skeleton.webp",
    "Troll": "assets/monsters/troll.webp",
    "Werewolf": "assets/monsters/werewolf.webp",
    "Yeti": "assets/monsters/yeti.webp",
    "Jack-o'-lantern":"assets/monsters/jack-o'-lantern.webp",
    "Dark Pharaoh":"assets/monsters/dark_pharaoh.webp",
  
    // 🔸 レアモンスター
    "Asian Dragon": "assets/monsters/asian_dragon.webp",
    "Dragon": "assets/monsters/dragon.webp",
    "Vampire": "assets/monsters/vampire.webp",
    "Phoenix": "assets/monsters/phoenix.webp",
    "Golem": "assets/monsters/golem.webp",
  };
  


function getMonsterSkillDescription(monster) {
    const [skill1, skill2] = monster.skills;
    let descriptions = "";

    if (skill1 === skill2) { // 2つ同じスキルを持つ
        descriptions = skillDescriptions[`Double ${skill1}`];
    } else {
        descriptions = `${skillDescriptions[skill1]}<br>${skillDescriptions[skill2]}`;
    }
    return descriptions;
}



// textContent設定（初期表示テキスト）
scanResultText.textContent = "Now scan for Player 1.";
startBattleBtn.textContent = "Start Battle";
approveBtn.textContent = "Approve";
rescanBtn.textContent = "Rescan";
nextTurnBtn.textContent = "Next";
scanNextBattleBtn.textContent = "Scan for Next Battle";
quitGameBtn.textContent = "Quit the Game";

// 初期状態（非表示）
nextTurnBtn.style.display = "none";
startBattleBtn.style.display = "none";
approveBtn.style.display = "none";
rescanBtn.style.display = "none";
scanNextBattleBtn.style.display = "none";
quitGameBtn.style.display = "none";



// ※この3つは、ファイル上部にすでに宣言されているはずなので、重複しないように！
startScanBtn.disabled = false; 
stopScanBtn.disabled = true;

function updateButtonState(button, isEnabled) {
    button.disabled = !isEnabled;
    button.style.backgroundColor = isEnabled ? '#1b2a41' : 'grey';
    button.style.borderColor = isEnabled ? '#66ccff' : '#888';
    button.style.color = isEnabled ? '#fff' : '#ccc';
    button.style.opacity = isEnabled ? '1' : '0.6';
}


startScanBtn.addEventListener('click', () => {
    removeQrVideo();    // まず古いvideo削除
    createQrVideo(); 
    setCurrentScannedMonster(null);
    scanResultText.textContent = "Scanning...";
    scanQRCode();
    video.style.display = "block";

    updateButtonState(startScanBtn, false);
    updateButtonState(stopScanBtn, true);
});

// 正しく修正されたstopScanBtnイベントリスナー
stopScanBtn.addEventListener('click', async () => {
    await stopScanning();
    removeQrVideo();
    scanResultText.textContent = "";
    video.style.display = "none";

    // 🌟 こちらの書き方に統一（元の色に戻ります）
    updateButtonState(startScanBtn, true);
    updateButtonState(stopScanBtn, false);
});


let currentPlayer = 1;  // ←追加：現在スキャンしているプレイヤーを記録する変数
approveBtn.addEventListener("click", async () => {
    if (!currentScannedMonster) {
        console.error("⚠ エラー: currentScannedMonsterが存在しない");
        return;
    }

    // 🌟【QRカメラ停止＆非表示処理（必須）】
    await stopScanning();
    removeQrVideo();
    const qrVideo = document.getElementById('qr-video');
    if (qrVideo) qrVideo.style.display = 'none';

    // 🌟【黒丸を再表示する処理（必須追加！）】
    const monsterImage = document.getElementById('monster-image');
    monsterImage.style.display = "none";

    registerMonster(currentScannedMonster);
    setCurrentScannedMonster(null);

    const specialBattle = localStorage.getItem('isSpecialBattle');

    if (specialBattle) {
        scanResultText.innerHTML = "✨ Let the battle begin! ✨";
        startBattleBtn.style.display = "inline-block";
        startScanBtn.style.display = "none";
        stopScanBtn.style.display = "none";
        loadMonsterBtn.style.display = "none";
        approveBtn.style.display = "none";
        rescanBtn.style.display = "none";

        setSpecialBattleOpponent(specialBattle);
        setScanningForPlayer(2);
        currentPlayer = 2;

    } else {
        if (currentPlayer === 1) {
            scanResultText.textContent = "Player 2, please scan your monster.";

            // 🌟 ボタンの完全リセット（ここも再確認）
            startScanBtn.disabled = false;  
            stopScanBtn.disabled = true;   
            loadMonsterBtn.disabled = false;

            startScanBtn.removeAttribute("style");
            stopScanBtn.removeAttribute("style");
            loadMonsterBtn.removeAttribute("style");

            startScanBtn.style.display = "inline-block";
            stopScanBtn.style.display = "inline-block";
            loadMonsterBtn.style.display = "inline-block";

            approveBtn.style.display = "none";
            rescanBtn.style.display = "none";
            startBattleBtn.style.display = "none";

            setScanningForPlayer(2);
            currentPlayer = 2;

            // 🌟【ここで再び黒丸を表示！】
            if (qrVideo) qrVideo.style.display = 'block';

        } else if (currentPlayer === 2) {
            scanResultText.innerHTML = "✨ Let the battle begin! ✨";
            startBattleBtn.style.display = "inline-block";

            startScanBtn.style.display = "none";
            stopScanBtn.style.display = "none";
            loadMonsterBtn.style.display = "none";
            approveBtn.style.display = "none";
            rescanBtn.style.display = "none";

            currentPlayer = 1;
        }
    }
});

// 🌟修正後はこのコードで正常動作します（変更不要）
rescanBtn.addEventListener("click", async () => {
    console.log("🔄 Rescan ボタンが押されました！");
    setCurrentScannedMonster(null);

    scanResultText.classList.remove('monster-box');
    scanResultText.classList.add('simple-text');
    scanResultText.textContent = "Rescanning... Please scan again.";

    approveBtn.style.display = "none";
    rescanBtn.style.display = "none";


    const monsterImage = document.getElementById('monster-image');
    monsterImage.src = "";
    monsterImage.style.display = "none";

    await stopScanning(); // 明示的に待機
    await scanQRCode();   // QRスキャナを再起動（awaitを付けるのがベスト）
});



gameStartBtn.addEventListener('click', () => {
    removeQrVideo();
    localStorage.removeItem('isSpecialBattle'); // 必ず先頭で確実に消す
    localStorage.setItem('isNormalBattle', 'true'); // 🌟 通常バトルであるフラグを立てる（明示的）

    const startupBgm = document.getElementById('startup-bgm');
    document.getElementById('privacy-policy-link').style.display = 'none';
    startupBgm.pause();
    startupBgm.currentTime = 0;

    scanBgmAudio.currentTime = 0;
    scanBgmAudio.play();

    startupScreen.style.display = 'none';  
    scanScreen.style.display = 'block';   
    battleContainer.style.display = 'none';
    gameStartBtn.style.display = 'none';

    startScanBtn.style.display = "inline-block";
    startScanBtn.disabled = false;

    stopScanBtn.style.display = "inline-block";
    stopScanBtn.disabled = true;

    loadMonsterBtn.style.display = "inline-block";
    loadMonsterBtn.disabled = false;

    scanResultText.textContent = "Player 1, please scan your monster.";

    const qrVideo = document.getElementById('qr-video');
    if (qrVideo) {
        qrVideo.style.display = 'block';
    }

    // デバッグ用コードは削除（誤動作を防ぐため）
});



// 🌟新規追加：Loadボタンが押されたら呼び出し画面へ
const loadMonsterBtn = document.getElementById('load-monster-btn');
const loadMonsterScreen = document.getElementById('load-monster-screen');
loadMonsterBtn.addEventListener('click', () => {
    scanScreen.style.display = 'none';
    loadMonsterScreen.style.display = 'flex';

    // 🌟ここでconfirmボタンを初期化（必須）
    loadConfirmBtn.disabled = true;
    selectedLoadSlot = null;


});

// 🌟新規追加：「戻る」ボタン処理（Load画面→スキャン画面へ戻る）
const loadBackBtn = document.getElementById('load-back-btn');
loadBackBtn.addEventListener('click', () => {
    loadMonsterScreen.style.display = 'none';
    scanScreen.style.display = 'block';
});

// 🌟新規追加：スロットを読み込み表示// 🌟新規追加：スロットを読み込み表示（名前を変更しました！）
const loadMonsterSlots = document.querySelectorAll('#load-slots-container .slot');

function loadStoredMonsters() {
    const specialBattle = localStorage.getItem('isSpecialBattle');
    const isNormalBattle = localStorage.getItem('isNormalBattle');
    const excludedMonsters = ["Fat Troll", "Drake", "Bael"]; // 除外モンスターリスト

    loadMonsterSlots.forEach((slot, index) => {
        const data = JSON.parse(localStorage.getItem(`monster-slot-${index}`));

        if (data && data.name) {
            // special時に特定モンスターを除外する条件を追加🌟
            if (specialBattle && excludedMonsters.includes(data.name)) {
                // 特定モンスターを使用不可にする表示
                slot.innerHTML = `
                    <div style='display:flex;align-items:center;justify-content:center;width:100%;height:100%; font-size: 13px; color: gray; text-align: center;'>
                        [Unavailable]<br>${data.name}
                    </div>
                `;
                slot.classList.add('disabled'); // クリック無効にするためのクラス
            } else {
                // 通常表示
                slot.innerHTML = `
                    <div style="line-height: 1.4; font-size: 11px; text-align: center;">
                        <strong style="font-size:13px;">${data.name}</strong><br>
                        (${data.element})<br>
                        HP: ${data.maxHp} | AT: ${data.baseAttack}<br>
                        DF: ${data.baseDefense} | SPD: ${data.speed}<br>
                        S1: ${data.skill1} ${getSkillEmoji(data.skill1)}<br>
                        S2: ${data.skill2} ${getSkillEmoji(data.skill2)}
                    </div>
                `;
                slot.classList.remove('disabled'); // disabled解除
            }
        } else {
            // 空スロットの場合
            slot.innerHTML = `
                <div style='display:flex;align-items:center;justify-content:center;width:100%;height:100%; font-size: 14px;'>
                    [Empty Slot]
                </div>
            `;
            slot.classList.add('disabled'); // 空スロットもクリック不可
        }
        slot.classList.remove('selected');
    });
}

loadMonsterBtn.addEventListener('click', loadStoredMonsters);





// 🔹 グローバル変数
let battleLogData = [];
let battleIndex = 0;
let attacker, defender, attackerPlayer, defenderPlayer;
let battlePhase = "attackTurnStart"; // 初期状態はattackTurnStart
let currentTurn = 20; // これに統一！
let initialPlayer1Monster = null;
let initialPlayer2Monster = null;
const MIN_TURNS = 1;


startBattleBtn.addEventListener("click", () => {
    scanBgmAudio.pause();
    scanBgmAudio.currentTime = 0;
    specialBgmAudio.pause();
    specialBgmAudio.currentTime = 0;

    const specialBattle = localStorage.getItem('isSpecialBattle');

    // 先にspecial判定を済ませる
    const battleBackground = document.getElementById('battle-background');
    const battleBgmAudio = document.getElementById('battle-bgm');

    if (specialBattle === 'special_3') {
        // 🌟 Special3専用の背景・BGM
        battleBackground.src = 'assets/back/special3.webp';
        battleBgmAudio.src = 'assets/sound/special3-bgm.mp3';
    } else {
        // 🔹 通常のランダム背景・BGM
        const randomBackgroundNumber = Math.floor(Math.random() * 8) + 1;
        battleBackground.src = `assets/back/${randomBackgroundNumber}.webp`;

        const bgmNumber = Math.floor(Math.random() * 3) + 1;
        battleBgmAudio.src = `assets/sound/b-bgm${bgmNumber}.mp3`;
    }

    battleBackground.style.display = 'block';
    battleBgmAudio.currentTime = 0;
    battleBgmAudio.loop = true;
    if (!window.isMuted) battleBgmAudio.play();
    
    // 🌟別の変数名に変更して再定義を防ぐ！
    const tempPlayer1Image = document.getElementById('player1-monster-image');
    const tempPlayer2Image = document.getElementById('player2-monster-image');

    tempPlayer1Image.classList.remove('fade-out');
    tempPlayer1Image.style.opacity = "";
    tempPlayer1Image.style.visibility = "visible";

    tempPlayer2Image.classList.remove('fade-out');
    tempPlayer2Image.style.opacity = "";
    tempPlayer2Image.style.visibility = "visible";

    document.getElementById('add-to-collection-btn').style.display = "none";

    if (!player1Monster || !player2Monster) {
        alert("Error: Monsters not set!");
        return;
    }


    initialPlayer1Monster = JSON.parse(JSON.stringify(player1Monster));
    initialPlayer2Monster = JSON.parse(JSON.stringify(player2Monster));

    [player1Monster, player2Monster].forEach(monster => {
        monster.hp = monster.maxHp;
        monster.attack = monster.baseAttack;
        monster.defense = monster.baseDefense;
        monster.growthActivation = 0;
        monster.learningActivation = 0;
        monster.reviveActivation = 0;
        monster.healActivation = 0;
        monster.attackCount = 0;
        monster.defenseCount = 0;
    });


    scanScreen.style.display = 'none';  
    battleContainer.style.display = 'block';


    currentTurn = 20; // 🔴 ターン数をリセット
    const turnDisplay = document.getElementById('turn-display');
    turnDisplay.textContent = `Turn: ${currentTurn}`;
    turnDisplay.style.display = "block";  // 🔴 ターン表示を必ず再表示
    


    // ★↓↓ モンスター画像再設定処理（必須） ↓↓★
    const player1ImagePath = `assets/monsters/${player1Monster.name.toLowerCase().replace(/ /g, "_")}.webp`;
    const player2ImagePath = `assets/monsters/${player2Monster.name.toLowerCase().replace(/ /g, "_")}.webp`;

    const player1Image = document.getElementById('player1-monster-image');
    player1Image.src = player1ImagePath;
    player1Image.classList.remove('mirror-image'); // P1は通常向き

    const player2Image = document.getElementById('player2-monster-image');
    player2Image.src = player2ImagePath;
    player2Image.classList.add('mirror-image'); // ★P2を反転表示

    scanResultText.textContent = "";
    battleContainer.style.display = 'block';
    startBattleBtn.style.display = "none";
    nextTurnBtn.style.display = "inline-block";
    scanNextBattleBtn.style.display = "none";
    quitGameBtn.style.display = "none";

    finalizeTurn();

    if (player1Monster.speed >= player2Monster.speed) {
        initializeBattle(player1Monster, player2Monster, "P1", "P2");
    } else {
        initializeBattle(player2Monster, player1Monster, "P2", "P1");
    }

});



// 🌟スキル発動表示用の関数を新規追加
function displaySkillActivation(playerId, monsterName, skillName, details) {
    battleLogData.push({
        log: `${details}`,
        skillAnimation: playerId  // これでどのプレイヤーにアニメを出すか判断
    });
}


function displayBattleLog() {
    if (isFastForwarding) return; // Fast Forward中は一切表示しない🔴
    if (battleIndex >= battleLogData.length) {
        return;
    }

    nextTurnBtn.style.display = "none";
    const currentLog = battleLogData[battleIndex];

    battleLogElement.innerHTML = "";

    typeWriterEffect(battleLogElement, currentLog.log, async () => {

        if (isFastForwarding) return; // 念のため🔴
        // 【従来のダメージログ処理（変更なし）】
        if (/dealt \d+ damage/.test(currentLog.log)) {
            const targetPlayer = defenderPlayer === 'P1' ? 'p1' : 'p2';
    
            playAttackSpriteAnimation(targetPlayer, async () => {
                await proceedAfterLog(currentLog);
            });
    
        // 🌟【スキルアニメーション再生処理（新規追加）】
        } else if (currentLog.skillAnimation) {
            playSkillSpriteAnimation(currentLog.skillAnimation, async () => {
                await proceedAfterLog(currentLog);
            });
    
        // 【それ以外の通常ログ処理（変更なし）】
        } else {
            await proceedAfterLog(currentLog);
        }
    });
    

    async function proceedAfterLog(log) {
        // 実際のモンスターステータスをここで更新（先に確実に行う）
        if ('p1Attack' in log) player1Monster.attack = log.p1Attack;
        if ('p2Attack' in log) player2Monster.attack = log.p2Attack;
        if ('p1Defense' in log) player1Monster.defense = log.p1Defense;
        if ('p2Defense' in log) player2Monster.defense = log.p2Defense;
    
        if (hasPendingAnimations(log)) {
            await handleAfterLogAnimations(log);  // 完了するまで待つ
        }
    
        updatePlayerStatusDisplay(1, player1Monster);
        updatePlayerStatusDisplay(2, player2Monster);
    
        if (/🏆 Player \d's .* wins!/.test(log.log)) {
            const winSound = document.getElementById('win-sound');
            winSound.currentTime = 0;
            winSound.play().catch(e => console.error("再生エラー:", e));
        }
        
    
        const battleBgmAudio = document.getElementById('battle-bgm'); // ←ここに追加
    
        // 🔴 「Defeated!」ログでBGMをフェードアウトさせる処理（新規追加）
        if (/was defeated/.test(log.log)) {
            fadeOutAudio(battleBgmAudio);
        }
    
        battleIndex++;
    
        if (battleIndex >= battleLogData.length) {
            if (battlePhase === "battleFinished" || isBattleFinished()) {
                nextTurnBtn.style.display = "none";
                scanNextBattleBtn.style.display = "inline-block";
                quitGameBtn.style.display = "inline-block";
                finalizeTurn();
            } else if (battlePhase === "endOfTurn") {
                finalizeTurn();
                nextTurnBtn.style.display = "inline-block";
            } else {
                nextTurnBtn.style.display = "inline-block";
            }
        }
    }

}


function typeWriterEffect(element, text, callback) {

    if (isFastForwarding) {
        element.textContent = text;  // 即表示🔴
        if (callback) callback();
        return;
    }

    element.textContent = '';
    nextTurnBtn.style.display = "none"; // Nextボタンを隠す

    let i = 0;
    const speed = 10; 

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {

            if (callback) callback();
        }
    }
    type();
}

function hasPendingAnimations(currentLog) {
    return (
        ('p1HpChange' in currentLog && currentLog.p1HpChange !== 0) ||
        ('p2HpChange' in currentLog && currentLog.p2HpChange !== 0) ||
        ('p1Attack' in currentLog) ||
        ('p1Defense' in currentLog) ||
        ('p2Attack' in currentLog) ||
        ('p2Defense' in currentLog)
    );
}

async function handleAfterLogAnimations(currentLog) {
    const animationPromises = [];

    if ('p1HpChange' in currentLog && currentLog.p1HpChange !== 0) {
        animationPromises.push(new Promise(resolve => {
            showHpChangeEffect(1, currentLog.p1HpChange);
            animateHpBar(1, Math.round(player1Monster.hp / player1Monster.maxHp * 100), resolve);
        }));
    }

    if ('p2HpChange' in currentLog && currentLog.p2HpChange !== 0) {
        animationPromises.push(new Promise(resolve => {
            showHpChangeEffect(2, currentLog.p2HpChange);
            animateHpBar(2, Math.round(player2Monster.hp / player2Monster.maxHp * 100), resolve);
        }));
    }

    if ('p1Attack' in currentLog) {
        animationPromises.push(new Promise(resolve => {
            animateNumberChange('player1-at', parseInt(document.getElementById('player1-at').textContent), currentLog.p1Attack, 800);
            setTimeout(resolve, 800);
        }));
    }

    if ('p2Attack' in currentLog) {
        animationPromises.push(new Promise(resolve => {
            animateNumberChange('player2-at', parseInt(document.getElementById('player2-at').textContent), currentLog.p2Attack, 800);
            setTimeout(resolve, 800);
        }));
    }

    if ('p1Defense' in currentLog) {
        animationPromises.push(new Promise(resolve => {
            animateNumberChange('player1-df', parseInt(document.getElementById('player1-df').textContent), currentLog.p1Defense, 800);
            setTimeout(resolve, 800);
        }));
    }

    if ('p2Defense' in currentLog) {
        animationPromises.push(new Promise(resolve => {
            animateNumberChange('player2-df', parseInt(document.getElementById('player2-df').textContent), currentLog.p2Defense, 800);
            setTimeout(resolve, 800);
        }));
    }

    await Promise.all(animationPromises);
}

function processBattlePhase() {
    let phaseLogs = [];

    while (true) {
        switch (battlePhase) {
            case "attackTurnStart":
                phaseLogs = attackTurnStart(attacker, attackerPlayer);
                battlePhase = "defenseTurnStart";
                break;

            case "defenseTurnStart":
                phaseLogs = defenseTurnStart(defender, defenderPlayer);
                battlePhase = "beforeAttackOverload";
                break;

            case "beforeAttackOverload":
                {
                    const { logs, attackerDied } = beforeAttackOverload(attacker, attackerPlayer);
                    phaseLogs = logs;
                    battlePhase = attackerDied ? "attackerReviveCheck" : "checkAttackMiss";
                }
                break;

                case "attackerReviveCheck":
                    {
                        const { logs, revived } = reviveCheck(attacker, attackerPlayer);
                        phaseLogs = logs;
                        battlePhase = revived ? "checkAttackMiss" : "endOfTurn";  // 🟢Revive成功なら攻撃を継続
                    }
                    break;
                    

            case "checkAttackMiss":
                {
                    const { logs, missed } = checkAttackMiss(attacker, attackerPlayer, defender, defenderPlayer);
                    phaseLogs = logs;
                    battlePhase = missed ? "endOfTurn" : "elementModifierCheck";
                }
                break;

            case "elementModifierCheck":
                {
                    const { logs, multiplier } = elementModifierCheck(attacker, attackerPlayer, defender, defenderPlayer);
                    attacker.currentElementMultiplier = multiplier;
                    phaseLogs = logs;
                    battlePhase = "attackerLuckyCriticalCheck";
                }
                break;

            case "attackerLuckyCriticalCheck":
                {
                    const baseDamage = Math.round(((attacker.attack + Math.sqrt(attacker.attack)) / defender.defense) * 100) + 45;
                    const randomMultiplier = [0.85, 0.9, 0.95, 1.0][Math.floor(Math.random() * 4)];
                    let damage = Math.round(baseDamage * randomMultiplier * attacker.currentElementMultiplier);

                    const { logs, damage: modifiedDamage } = attackerLuckyCriticalCheck(attacker, attackerPlayer, damage);
                    attacker.currentDamage = modifiedDamage;

                    phaseLogs = logs;
                    battlePhase = "defenderEvasionCheck";
                }
                break;

            case "defenderEvasionCheck":
                {
                    const { logs, damage, isEvaded } = defenderEvasionCheck(defender, defenderPlayer, attacker, attackerPlayer, attacker.currentDamage);
                    attacker.currentDamage = damage;
                    phaseLogs = logs;
                    battlePhase = isEvaded ? "endOfTurn" : "defenderLuckyEnduranceCheck";
                }
                break;

            case "defenderLuckyEnduranceCheck":
                {
                    const { logs, damage } = defenderLuckyEnduranceCheck(defender, defenderPlayer, attacker.currentDamage);
                    attacker.currentDamage = damage;
                    phaseLogs = logs;
                    battlePhase = "applyDamageToDefender";
                }
                break;

                case "applyDamageToDefender":
                    {
                        const { logs, defenderDied } = applyDamageToDefender(attacker, defender, attackerPlayer, defenderPlayer, attacker.currentDamage);
                        phaseLogs = logs;
                        battlePhase = defenderDied ? "defenderReviveCheck" : "attackerVampireCheck";
                    }
                    break;
                

                
                    case "defenderReviveCheck":
                        {
                            const { logs, revived } = reviveCheck(defender, defenderPlayer);
                            phaseLogs = logs;
                    
                            battlePhase = revived ? "attackerVampireCheck" : "endOfTurn";
                        }
                        break;
                    
                    



            case "attackerVampireCheck":
                phaseLogs = attackerVampireCheck(attacker, attackerPlayer, attacker.currentDamage);
                battlePhase = "defenderHealCheck";
                break;

            case "defenderHealCheck":
                phaseLogs = defenderHealCheck(defender, defenderPlayer);
                battlePhase = "defenderCounterCheck";
                break;

                case "defenderCounterCheck":
                    {
                        const { logs, attackerDied } = defenderCounterCheck(attacker, defender, attackerPlayer, defenderPlayer, attacker.currentDamage);
                        phaseLogs = logs;
                        if (attackerDied) {
                            battlePhase = "attackerReviveCheckAfterCounter";
                        } else {
                            battlePhase = "defenderThornsCheck";
                        }
                    }
                    break;
                
                    case "attackerReviveCheckAfterCounter":
                        {
                            const { logs, revived } = reviveCheck(attacker, attackerPlayer);
                            phaseLogs = logs;
                            if (revived) {
                                battlePhase = "defenderThornsCheck";  // 🟢Revive成功時は次の処理に進む
                            } else {
                                battlePhase = "endOfTurn";  // 🟢Revive失敗時のみターン終了
                            }
                        }
                        break;
                
                case "defenderThornsCheck":
                    phaseLogs = defenderThornsCheck(defender, attacker, defenderPlayer, attackerPlayer);
                    if (attacker.hp <= 0) {
                        battlePhase = "attackerReviveCheckAfterThorns";
                    } else {
                        battlePhase = "endOfTurn";
                    }
                    break;
                
                    case "attackerReviveCheckAfterThorns":
                        {
                            const { logs, revived } = reviveCheck(attacker, attackerPlayer);  // 🟢revivedを取得するよう修正
                            phaseLogs = logs;
                            if (revived) {
                                battlePhase = "endOfTurn";  // 🟢Revive成功でも処理が他にないためターン終了（ここはOK）
                            } else {
                                battlePhase = "endOfTurn";  // Revive失敗時もターン終了
                            }
                        }
                        break;
                    
                        case "endOfTurn":
                            currentTurn--; // 🔴ターンをここで減らす（最重要）
                        
                            if (currentTurn <= 0) {
                                // タイムアップ処理
                                battlePhase = "timeUp";
                            } else {
                                phaseLogs = endOfTurn(attackerPlayer, defenderPlayer);
                                finalizeTurn();
                        
                                [attacker, defender] = [defender, attacker];
                                [attackerPlayer, defenderPlayer] = [defenderPlayer, attackerPlayer];
                        
                                battlePhase = "attackTurnStart";
                            }
                            break;


                            case "timeUp":
                                const p1Hp = player1Monster.hp;
                                const p2Hp = player2Monster.hp;
                            
                                let resultLog = "";
                                let winner = null;
                            
                                if (p1Hp > p2Hp) {
                                    resultLog = `⏰ Time Up! 🏆 Player 1's ${player1Monster.name} wins by remaining HP!`;
                                    winner = 'P1';
                                } else if (p2Hp > p1Hp) {
                                    resultLog = `⏰ Time Up! 🏆 Player 2's ${player2Monster.name} wins by remaining HP!`;
                                    winner = 'P2';
                                } else {
                                    resultLog = `⏰ Time Up! 🤝 It's a Draw!`;
                                }
                            
                                battleLogData = [{ log: resultLog }];
                                battleIndex = 0;
                            
                                currentTurn = 0;
                                updateTurnDisplay();
                            
                                fadeOutAudio(document.getElementById('battle-bgm'));
                            
                                setTimeout(() => {
                                    const winSound = document.getElementById('win-sound');
                                    winSound.currentTime = 0;
                                    if (!isMuted) winSound.play();
                                }, 500);
                            
                                // ★★ここからが超重要な修正★★
                                const specialBattle = localStorage.getItem('isSpecialBattle'); // ← ここで取得（コールバック外）
                            
                                displayBattleLogWithCallback(() => {
                                    nextTurnBtn.style.display = "none";
                                    quitGameBtn.style.display = "inline-block";
                            
                                    const addToCollectionBtn = document.getElementById('add-to-collection-btn');
                            
                                    if (specialBattle) {
                                        scanNextBattleBtn.style.display = "none"; // specialでは必ず非表示
                                        if (winner === 'P1') {
                                            addToCollectionBtn.style.display = "inline-block";
                                        } else {
                                            addToCollectionBtn.style.display = "none";
                                        }
                                        localStorage.removeItem('isSpecialBattle'); // ←ここに移動！（超重要！）
                                    } else {
                                        // 通常バトル
                                        scanNextBattleBtn.style.display = "inline-block";
                                        addToCollectionBtn.style.display = "inline-block";
                                    }
                                });
                            
                                battlePhase = "battleFinished";
                                break;
                            
                            
                            case "battleFinished":
                                handleBattleEnd();
                                return;
                            
                            default:
                                console.error("不正なbattlePhase:", battlePhase);
                                return;
                            }
                            
                            if (phaseLogs.length > 0) {
                                battleLogData = phaseLogs;
                                battleIndex = 0;
                                displayBattleLog();
                                break;
                            }
                            
                            if (isBattleFinished()) {
                                battlePhase = "battleFinished";
                                handleBattleEnd();
                                break;
                            }
                            }
                            }
                            
                            nextTurnBtn.onclick = () => {    
                                fastForwardBtn.style.display = "none";
                                if (battlePhase !== "battleFinished") {
                                    processBattlePhase();
                                } else {
                                    handleBattleEnd();
                                }
                            };
                            
    

// 攻撃ターン開始時スキル処理
// 攻撃ターン開始時スキル処理（修正版）
function attackTurnStart(attacker, attackerPlayer) {
    const logs = [];
    attacker.attackCount = (attacker.attackCount || 0) + 1;

    const growthCount = attacker.skills.filter(s => s === "Growth").length;

    const activationTurnsSingle = [4, 5, 6]; // 1つ持ちの場合のターン
    const activationTurnsDouble = [4, 5, 6, 7, 8, 9]; // 2つ持ちの場合のターン

    const activationTurns = growthCount === 2 ? activationTurnsDouble : activationTurnsSingle;

    if (growthCount && activationTurns.includes(attacker.attackCount)) {
        attacker.growthActivation++;

        const BASE = 100;
        let k;

        if (growthCount === 1) {
            k = 0.3; 
        } else {
            k = attacker.growthActivation <= 3 ? 0.4 : 0.9;
        }

        const increaseAmount = Math.round((k * BASE * BASE) / attacker.attack);

        attacker.attack += increaseAmount;

        logs.push({ 
            log: `📈 ${attackerPlayer} ${attacker.name}'s Growth activated! Attack +${increaseAmount} → ${attacker.attack}`,
            skillAnimation: attackerPlayer === 'P1' ? 'p1' : 'p2',
            ...(attackerPlayer === "P1" ? { p1Attack: attacker.attack } : { p2Attack: attacker.attack })
        });
    }

    return logs;
}




// 防御ターン開始時スキル処理
// 防御ターン開始時スキル処理（修正版）
function defenseTurnStart(defender, defenderPlayer) {
    const logs = [];
    defender.defenseCount = (defender.defenseCount || 0) + 1;

    const learningCount = defender.skills.filter(s => s === "Learning").length;

    const activationTurnsSingle = [4, 5, 6]; // 1つ持ちの場合のターン
    const activationTurnsDouble = [4, 5, 6, 7, 8, 9]; // 2つ持ちの場合のターン

    const activationTurns = learningCount === 2 ? activationTurnsDouble : activationTurnsSingle;

    if (learningCount && activationTurns.includes(defender.defenseCount)) {
        defender.learningActivation++;

        const BASE = 100;
        let k;

        if (learningCount === 1) {
            k = 0.3; 
        } else {
            k = defender.learningActivation <= 3 ? 0.3 : 0.8;
        }

        const increaseAmount = Math.round((k * BASE * BASE) / defender.defense);

        defender.defense += increaseAmount;

        logs.push({ 
            log: `📚 ${defenderPlayer} ${defender.name}'s Learning activated! Defense +${increaseAmount} → ${defender.defense}`,
            skillAnimation: defenderPlayer === 'P1' ? 'p1' : 'p2'
        });
    }

    return logs;
}


function beforeAttackOverload(attacker, attackerPlayer) {
    const logs = [];
    let attackerDied = false;

    const overloadCount = attacker.skills.filter(s => s === "Overload").length;
    if (overloadCount && attacker.attackCount >= 2) {
        let damage;
        let rate;

        if (overloadCount === 1) {
            damage = 10 + (attacker.attackCount - 2) * 10;
            rate = 1.1;
        } else {
            damage = 20 + (attacker.attackCount - 2) * 15;
            rate = 1.2;
        }

        // ★ここが重要！AttackとHPを直接更新
        attacker.attack = Math.round(attacker.attack * rate);
        attacker.hp = Math.max(attacker.hp - damage, 0);

        logs.push({
            log: `⚡ ${attackerPlayer} ${attacker.name}'s Overload activated! Attack: ${attacker.attack}, took ${damage} damage.`,
            ...(attackerPlayer === "P1" ? { p1HpChange: -damage, p1Attack: attacker.attack } : { p2HpChange: -damage, p2Attack: attacker.attack }),
            skillAnimation: attackerPlayer === 'P1' ? 'p1' : 'p2'
        });

        if (attacker.hp <= 0) {
            attackerDied = true;
        }
    }

    return { logs, attackerDied };
}




// Reviveチェックの流れ（理想）
function reviveCheck(monster, playerLabel) {
    const logs = [];
    if (monster.hp > 0) return { logs, revived: false };

    const reviveCount = monster.skills.filter(s => s === "Revive").length;

    let chances;
    if (reviveCount === 2) {
        chances = [100, 90, 50, 20];
    } else if (reviveCount === 1) {
        chances = [100, 30, 10];
    } else {
        chances = [];
    }

    const chance = chances[monster.reviveActivation] || 0;

    if (Math.random() * 100 < chance) {
        monster.hp = 1;
        monster.reviveActivation++;
        logs.push({ 
            log: `✨ ${playerLabel} ${monster.name}'s Revive activated! Revived with 1 HP.`,
            skillAnimation: playerLabel === 'P1' ? 'p1' : 'p2'
        });
        
        return { logs, revived: true };
    } else {
        monster.hp = 0;  // 明示的にHPを0に確定
        logs.push({ log: `${playerLabel}'s ${monster.name} was defeated!` });  // ←必ずここでdefeated表示
        fadeOutDefeatedMonster(playerLabel);
        document.getElementById('death-sound').play();
        return { logs, revived: false };
    }
}


function checkAttackMiss(attacker, attackerPlayer, defender, defenderPlayer) {
    if (Math.random() < 0.05) {
        return { logs: [{ log: `❌ ${attackerPlayer} ${attacker.name}'s attack missed!` }], missed: true };
    }
    return { logs: [], missed: false };
}

function elementModifierCheck(attacker, attackerPlayer, defender, defenderPlayer) {
    const multiplier = getElementMultiplier(attacker.element, defender.element);
    const logs = multiplier !== 1.0 
        ? [{ log: `Persona Modifier: ${attacker.element}→${defender.element} ×${multiplier}` }] 
        : [];
    
    return { logs, multiplier };
}

function attackerLuckyCriticalCheck(attacker, attackerPlayer, damage) {
    const logs = [];
    const luckyCount = attacker.skills.filter(s => s === "Lucky").length;
    const petrifyCount = attacker.skills.filter(s => s === "Petrify").length;
    const criticalCount = attacker.skills.filter(s => s === "Critical").length;

    let effectActivated = false;

    if (luckyCount && Math.random() * 100 < (luckyCount === 2 ? 35 : 20)) {
        damage = Math.round(damage * 1.3);
        logs.push({ log: `🍀 ${attackerPlayer} ${attacker.name}'s Lucky! Damage ×1.3`,skillAnimation: attackerPlayer === 'P1' ? 'p1' : 'p2'});
        effectActivated = true;
    }

    if (!effectActivated && petrifyCount && Math.random() * 100 < (petrifyCount === 2 ? 35 : 20)) {
        damage = Math.round(damage * 1.2);
        logs.push({ log: `🪨 ${attackerPlayer} ${attacker.name}'s Petrify! Damage ×1.1`,skillAnimation: attackerPlayer === 'P1' ? 'p1' : 'p2'});
        effectActivated = true;
    }

    if (!effectActivated && criticalCount) {
        let criticalChance = criticalCount === 2 ? 30 : 15;
        if (attacker.hp <= attacker.maxHp * 0.2) {
            criticalChance = criticalCount === 2 ? 60 : 30;
        }
        if (Math.random() * 100 < criticalChance) {
            damage *= 2;
            logs.push({ log: `💥 ${attackerPlayer} ${attacker.name}'s Critical! Damage ×2`,skillAnimation: attackerPlayer === 'P1' ? 'p1' : 'p2' });
        }
    }

    return { logs, damage };
}

function defenderEvasionCheck(defender, defenderPlayer, attacker, attackerPlayer, damage) {
    const evasionCount = defender.skills.filter(s => s === "Evasion").length;
    const chance = evasionCount === 2 ? 35 : evasionCount === 1 ? 20 : 0;

    if (Math.random() * 100 < chance) {
        return { logs: [{ log: `👟 ${defenderPlayer} ${defender.name}'s Evasion! Evaded attack!`, skillAnimation: defenderPlayer === 'P1' ? 'p1' : 'p2' }], damage: 0, isEvaded: true };
    }
    return { logs: [], damage, isEvaded: false };
}

function defenderLuckyEnduranceCheck(defender, defenderPlayer, damage) {
    const logs = [];

    const luckyCount = defender.skills.filter(s => s === "Lucky").length;
    const petrifyCount = defender.skills.filter(s => s === "Petrify").length;
    const enduranceCount = defender.skills.filter(s => s === "Endurance").length;

    // Luckyチェック（ダメージ0）
    if (luckyCount && Math.random() * 100 < (luckyCount === 2 ? 15 : 10)) {
        logs.push({ log: `🍀 ${defenderPlayer} ${defender.name}'s Lucky! Damage = 0`, skillAnimation: defenderPlayer === 'P1' ? 'p1' : 'p2'});
        return { logs, damage: 0 };
    }

    // Endurance判定前に、Petrifyを確認
    let petrifyActivated = false;
    if (petrifyCount && Math.random() * 100 < (petrifyCount === 2 ? 30 : 15)) {
        damage = Math.round(damage / 2); // 50%減少
        logs.push({ log: `🪨 ${defenderPlayer} ${defender.name}'s Petrify! Damage -50%`,skillAnimation: defenderPlayer === 'P1' ? 'p1' : 'p2' });
        petrifyActivated = true;
    }

    // Petrify未発動でEndurance判定
    if (!petrifyActivated && enduranceCount && defender.hp <= defender.maxHp / 2) {
        const rate = enduranceCount === 2 ? 0.6 : 0.75;
        damage = Math.round(damage * rate);
        const reductionPercent = Math.round((1 - rate) * 100);
        logs.push({ 
            log: `🛡️ ${defenderPlayer} ${defender.name}'s Endurance! Damage -${reductionPercent}%`, skillAnimation: defenderPlayer === 'P1' ? 'p1' : 'p2'
        });
    }

    return { logs, damage };
}

// 防御側ダメージ適用（共通）
function applyDamageToDefender(attacker, defender, attackerPlayer, defenderPlayer, damage) {
    const logs = [];

    defender.hp = Math.max(defender.hp - damage, 0); // ←必ずここでHPを実際に減らすよう修正！

    logs.push({
        log: `👊${attackerPlayer} ${attacker.name} dealt ${damage} damage to ${defenderPlayer} ${defender.name}.`,
        ...(defenderPlayer === "P1" ? { p1HpChange: -damage } : { p2HpChange: -damage })
    });

    const defenderDied = defender.hp <= 0;

    return { logs, defenderDied }; // defenderDiedを戻り値に追加
}



function attackerVampireCheck(attacker, attackerPlayer, damageDealt) {
    const logs = [];

    if (damageDealt <= 0 || attacker.hp >= attacker.maxHp) return logs;

    const vampireCount = attacker.skills.filter(skill => skill === "Vampire").length;
    if (vampireCount === 0) return logs;

    const vampireRate = vampireCount === 2 ? 0.2 : 0.1;
    const attackIncrease = vampireCount === 2 ? 10 : 5;

    const vampireHeal = Math.round(damageDealt * vampireRate);
    const actualHeal = Math.min(vampireHeal, attacker.maxHp - attacker.hp);

    attacker.hp += actualHeal;   // ←必ずここでHP更新する
    attacker.attack += attackIncrease; // ←必ずここで攻撃力更新する

    logs.push({
        log: `🦇 ${attackerPlayer} ${attacker.name}'s Vampire activated! HP +${actualHeal}, Attack +${attackIncrease}.`,
        ...(attackerPlayer === "P1" ? { p1HpChange: actualHeal, p1Attack: attacker.attack } : { p2HpChange: actualHeal, p2Attack: attacker.attack }),
        skillAnimation: attackerPlayer === 'P1' ? 'p1' : 'p2'
    });

    return logs;
}



function defenderHealCheck(defender, defenderPlayer) {
    const logs = [];

    if (defender.hp <= 0) return logs;

    const healCount = defender.skills.filter(skill => skill === "Heal").length;
    if (healCount === 0) return logs;

    const possibleHeals = healCount === 2 ? [20, 40, 60] : [10, 20, 30];
    const healAmount = possibleHeals[Math.floor(Math.random() * possibleHeals.length)];

    // ★ここが重要！HPをここで直接回復
    const actualHeal = Math.min(healAmount, defender.maxHp - defender.hp);
    defender.hp += actualHeal;

    logs.push({
        log: `❤️ ${defenderPlayer} ${defender.name}'s Heal activated! HP +${actualHeal}.`,
        ...(defenderPlayer === "P1" ? { p1HpChange: actualHeal } : { p2HpChange: actualHeal }),
        skillAnimation: defenderPlayer === 'P1' ? 'p1' : 'p2'
    });

    return logs;
}

function defenderCounterCheck(attacker, defender, attackerPlayer, defenderPlayer, damageDealt) {
    const logs = [];

    if (defender.hp <= 0 || damageDealt <= 0) return { logs, attackerDied: false };

    const counterCount = defender.skills.filter(skill => skill === "Counter").length;
    if (counterCount === 0) return { logs, attackerDied: false };

    let counterChance = counterCount === 2 ? 35 : 20;
    if (defender.hp <= defender.maxHp * 0.2) {
        counterChance = counterCount === 2 ? 65 : 35;
    }

    let attackerDied = false;

    if (Math.random() * 100 < counterChance) {
        const counterDamage = Math.round(damageDealt / 1.5);

        // ★ここが重要！HPをここで直接減算
        attacker.hp = Math.max(attacker.hp - counterDamage, 0);

        logs.push({
            log: `🔄 ${defenderPlayer}'s Counter activated! ${attackerPlayer} ${attacker.name} takes ${counterDamage} damage.`,
            ...(attackerPlayer === "P1" ? { p1HpChange: -counterDamage } : { p2HpChange: -counterDamage }),
            skillAnimation: defenderPlayer === 'P1' ? 'p1' : 'p2'
        });

        if (attacker.hp <= 0) {
            attackerDied = true;
        }
    }

    return { logs, attackerDied };
}

function defenderThornsCheck(defender, attacker, defenderPlayer, attackerPlayer) {
    const logs = [];

    const thornsCount = defender.skills.filter(skill => skill === "Thorns").length;
    if (thornsCount === 0) return logs;

    const possibleDamages = thornsCount === 2 ? [20, 40, 60] : [10, 20, 30];
    const thornsDamage = possibleDamages[Math.floor(Math.random() * possibleDamages.length)];

    // ★ここが重要！HPをここで直接減算
    attacker.hp = Math.max(attacker.hp - thornsDamage, 0);

    logs.push({
        log: `🌵 ${defenderPlayer}'s Thorns activated! ${attackerPlayer} ${attacker.name} takes ${thornsDamage} damage.`,
        ...(attackerPlayer === "P1" ? { p1HpChange: -thornsDamage } : { p2HpChange: -thornsDamage }),
        skillAnimation: defenderPlayer === 'P1' ? 'p1' : 'p2'
    });

    return logs;
}



function isBattleFinished() {
    return (player1Monster.hp <= 0 || player2Monster.hp <= 0);
}

function handleBattleEnd() {
    const specialBattle = localStorage.getItem('isSpecialBattle');
    let finalLog = '';
    let winner = null;

    if (player1Monster.hp <= 0 && player2Monster.hp <= 0) {
        finalLog = `🤝 The battle ended in a draw!`;
    } else if (player1Monster.hp <= 0) {
        finalLog = `🏆 Player 2's ${player2Monster.name} wins!`;
        winner = 'P2';
    } else if (player2Monster.hp <= 0) {
        finalLog = `🏆 Player 1's ${player1Monster.name} wins!`;
        winner = 'P1';
    }

    battleLogElement.textContent = finalLog;

    if (finalLog.includes("wins!")) {
        const winSound = document.getElementById('win-sound');
        winSound.currentTime = 0;
        winSound.play().catch(e => console.error("勝利サウンド再生エラー:", e));
    }

    nextTurnBtn.style.display = "none";
    quitGameBtn.style.display = "inline-block";

    const addToCollectionBtn = document.getElementById('add-to-collection-btn');

    if (specialBattle) {
        scanNextBattleBtn.style.display = "none";
        if (winner === 'P1') {
            addToCollectionBtn.style.display = "inline-block";
        } else {
            addToCollectionBtn.style.display = "none";
        }
        localStorage.removeItem('isSpecialBattle');
    } else {
        addToCollectionBtn.style.display = "inline-block";
        scanNextBattleBtn.style.display = "inline-block";
    }
}



function endOfTurn(attackerPlayer, defenderPlayer) {
    let logs = [];

    if (player1Monster.hp > 0 && player2Monster.hp > 0) {
        logs.push({ log: `▶️ ${attackerPlayer}'s turn has ended. ${defenderPlayer}'s turn begins!` });
        updateTurnDisplay(); // 🔴表示だけを更新（ターン減算なし！）
    }

    return logs;
}



function finalizeTurn() {
    if (isBattleFinished()) {
        const winner = player1Monster.hp > 0 ? "Player 1" :
                       player2Monster.hp > 0 ? "Player 2" : null;

        const finalLog = winner
            ? `🏆 ${winner}'s ${winner === "Player 1" ? player1Monster.name : player2Monster.name} wins!`
            : "🤝 The battle ended in a draw!";

        battleLogData.push({ log: finalLog });

        nextTurnBtn.style.display = "inline-block";
        scanNextBattleBtn.style.display = "none";
        quitGameBtn.style.display = "none";
    }
}


function initializeBattle(first, second, firstPlayer, secondPlayer) {
    attacker = first;
    defender = second;
    attackerPlayer = firstPlayer;
    defenderPlayer = secondPlayer;

    currentTurn = 20; 
    updateTurnDisplay();

    battleLogData = [];
    battleIndex = 0;

    [attacker, defender].forEach(monster => {
        monster.attackCount = 0;
        monster.defenseCount = 0;
        monster.growthActivation = 0;
        monster.learningActivation = 0;
        monster.reviveActivation = 0;
        monster.healActivation = 0;
    });

    battleLogData.push({
        log: `${attackerPlayer} ${attacker.name} attacks first!`
    });

    nextTurnBtn.style.display = "none";
    scanNextBattleBtn.style.display = "none";
    quitGameBtn.style.display = "none";

    typeWriterEffect(battleLogElement, battleLogData[battleIndex].log, () => {
        updatePlayerStatusDisplay(1, player1Monster);
        updatePlayerStatusDisplay(2, player2Monster);

        battleIndex++;
        nextTurnBtn.style.display = "inline-block";
        
        // ★★★ ここを追加 ★★★
        fastForwardBtn.style.display = "inline-block"; // Fast Forwardを表示する
    });

    battlePhase = "attackTurnStart";
    finalizeTurn(); 
}


function updateTurnDisplay() {
    document.getElementById('turn-display').textContent = `Turns Remaining: ${currentTurn}`;
}


scanNextBattleBtn.addEventListener("click", () => {
    console.log("🔄 新しいバトルを開始");

    resetMonsters();

    setCurrentScannedMonster(null);
    battleLogData = [];
    battleIndex = 0;
    
    const winSound = document.getElementById('win-sound');
    winSound.pause();
    winSound.currentTime = 0;

    scanResultText.textContent = "Please scan Player 1's monster.";
    scanNextBattleBtn.style.display = "none";
    quitGameBtn.style.display = "none";
    startBattleBtn.style.display = "none";
    nextTurnBtn.style.display = "none";

    approveBtn.style.display = "none";
    rescanBtn.style.display = "none";

    startScanBtn.style.display = "inline-block";
    stopScanBtn.style.display = "inline-block";
    loadMonsterBtn.style.display = "inline-block";  // 🌟ここに追加

    battleLogElement.classList.add("battle-log-style");
    battleContainer.style.display = 'none';

    document.getElementById('turn-display').style.display = "none";
    document.getElementById('battle-background').style.display = 'none';
    document.getElementById('add-to-collection-btn').style.display = "none";

    setTimeout(() => {
        updatePlayerStatusDisplay(1, { name: "---", hp: 0, maxHp: 0, attack: 0, defense: 0, element: "", skill1: "-", skill2: "-" });
        updatePlayerStatusDisplay(2, { name: "---", hp: 0, maxHp: 0, attack: 0, defense: 0, element: "", skill1: "-", skill2: "-" });
    }, 50);

    hpDisplay.innerHTML = `
    <div id="player-status-container">
        <div class="player-status" id="player1-status">
            <strong>P1: ---</strong><br>
            HP: <span id="player1-hp">0/0 [0%]</span>
            <div class="hp-bar"><div class="hp-fill" id="player1-hp-fill"></div></div>
            AT: <span id="player1-at">0</span><br>
            DF: <span id="player1-df">0</span><br>
            S1: <span id="player1-skill1">-</span><br>
            S2: <span id="player1-skill2">-</span>
        </div>

        <div class="player-status" id="player2-status">
            <strong>P2: ---</strong><br>
            HP: <span id="player2-hp">0/0 [0%]</span>
            <div class="hp-bar"><div class="hp-fill" id="player2-hp-fill"></div></div>
            AT: <span id="player2-at">0</span><br>
            DF: <span id="player2-df">0</span><br>
            S1: <span id="player2-skill1">-</span><br>
            S2: <span id="player2-skill2">-</span>
        </div>
    </div>
    `;

    battleLogElement.innerHTML = "";
    battleContainer.style.display = 'none';  
    scanScreen.style.display = 'block';

    document.getElementById('player1-monster-image').src = "";
    document.getElementById('player2-monster-image').src = "";

    const player1Img = document.getElementById('player1-monster-image');
const player2Img = document.getElementById('player2-monster-image');

// 🌟 フェードアウト後に残るスタイルをリセット
[player1Img, player2Img].forEach(img => {
    img.style.visibility = 'visible';   // 非表示を解除
    img.classList.remove('fade-out');   // fade-outクラス削除
    img.src = "";                       // 画像をクリア
});

});


// **「Quit the Game」ボタンの動作**
quitGameBtn.addEventListener("click", () => {
    document.getElementById('turn-display').style.display = "none";
    console.log("❌ ゲーム終了");
    location.reload(); // ページをリロード
    document.getElementById('battle-background').style.display = 'none'; // 背景を消す
    document.getElementById('privacy-policy-link').style.display = 'block';
});

function getElementMultiplier(attackerElement, defenderElement) {
    const elementChart = {
        "Emotional": { "Logical": 1.1, "Instinctive": 0.9 },
        "Logical": { "Intuitive": 1.1, "Emotional": 0.9 },
        "Intuitive": { "Instinctive": 1.1, "Logical": 0.9 },
        "Instinctive": { "Emotional": 1.1, "Intuitive": 0.9 }
    };

    return elementChart[attackerElement]?.[defenderElement] || 1.0;
}


window.displayBattleLogData = displayBattleLog;


function updatePlayerStatusDisplay(player, monster) {
    const hpPercentage = Math.round((monster.hp / monster.maxHp) * 100);
    const hpBar = document.getElementById(`player${player}-hp-fill`);

    // HPが20%以下になったら赤色に、それ以上なら元の色に戻す
    if (hpPercentage <= 20) {  // この数値は好みで調整可能（15～25%あたり推奨）
        hpBar.style.backgroundColor = '#e74c3c'; // 赤色（ピンチの色）
    } else {
        hpBar.style.backgroundColor = '#2ecc71'; // 通常の色（例：緑色）
    }

    document.getElementById(`player${player}-status`).querySelector('strong').textContent =
        `P${player}: ${monster.name} ${getElementEmoji(monster.element)}`;


    // HPバー表示をアニメーション的に更新（コールバック追加）
    animateHpBar(player, hpPercentage, () => {

    });

    // HP表示（数値）をアニメーション的に更新
    const currentHpElement = document.getElementById(`player${player}-hp`);
    const [currentHp] = currentHpElement.textContent.split('/'); // 現在のHPを取得
    animateNumberChange(`player${player}-hp`, parseInt(currentHp), monster.hp, 800, (newValue) => {
        currentHpElement.textContent = `${newValue}/${monster.maxHp} [${hpPercentage}%]`;
    });

    
    // Attack表示をアニメーション的に更新
    const currentAtElement = document.getElementById(`player${player}-at`);
    const currentAt = parseInt(currentAtElement.textContent);
    animateNumberChange(`player${player}-at`, currentAt, monster.attack, 800);

    // Defense表示をアニメーション的に更新
    const currentDfElement = document.getElementById(`player${player}-df`);
    const currentDf = parseInt(currentDfElement.textContent);
    animateNumberChange(`player${player}-df`, currentDf, monster.defense, 800);

    document.getElementById(`player${player}-skill1`).textContent = `${monster.skill1} ${getSkillEmoji(monster.skill1)}`;
    document.getElementById(`player${player}-skill2`).textContent = `${monster.skill2} ${getSkillEmoji(monster.skill2)}`;
}

function animateHpBar(player, newHpPercentage, callback) {
    const hpBar = document.getElementById(`player${player}-hp-fill`);
    const startPercentage = parseFloat(hpBar.style.width) || 0;
    const duration = 500;
    const startTime = performance.now();

    function update(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const currentPercentage = startPercentage + (newHpPercentage - startPercentage) * progress;
        hpBar.style.width = `${currentPercentage}%`;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            if(callback) callback();  // 完了時コールバックを必ず呼ぶ
        }
    }
    requestAnimationFrame(update);
}



function animateNumberChange(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    const range = end - start;
    let startTime = null;

    function step(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const currentValue = Math.round(start + range * progress);
        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}


// HPエフェクト表示関数（重要）
function showHpChangeEffect(player, amount) {

    const image = document.getElementById(`player${player}-monster-image`);
    const container = document.getElementById('monster-images-container');

    // 🌟まず0.3秒後に効果音だけ再生
// 🌟まず0.3秒後に効果音だけ再生（修正版）
setTimeout(() => {
    if (!isMuted) { // 🔰 ミュートチェック追加
        const soundEffect = amount >= 0 ? recoverSound : damageSound;
        soundEffect.currentTime = 0; // 音を最初に戻す
        soundEffect.play();
    }
}, 200);


    // 🌟次に0.5秒後にエフェクト開始
    setTimeout(() => {

        // 光るエフェクト
        image.style.animation = amount >= 0 ? 'flash-blue 0.5s ease-out' : 'flash-red 0.5s ease-out';
        image.addEventListener('animationend', () => {
            image.style.animation = '';
        }, { once: true });

        // 数字ポップアップ表示
        const popup = document.createElement('div');
        popup.classList.add('hp-popup', amount >= 0 ? 'plus' : 'minus');
        popup.textContent = (amount >= 0 ? '+' : '') + amount;

        container.style.position = 'relative';
        popup.style.position = 'absolute';

        if (player === 1) {
            popup.style.left = '25%';
        } else {
            popup.style.left = '75%';
        }
        popup.style.top = '0';
        popup.style.transform = 'translate(-50%, 0)';

        container.appendChild(popup);

        popup.addEventListener('animationend', () => {
            popup.remove();
        });

    }, 500); // 0.5秒（500ms）後に表示
}



document.getElementById('add-to-collection-btn').addEventListener('click', () => {

    const winSound = document.getElementById('win-sound');
    winSound.pause();
    winSound.currentTime = 0;

    // 🌟 追加：scan-bgmをループで再生する処理
    scanBgmAudio.loop = true;  // ループ設定を確実に有効化
    scanBgmAudio.currentTime = 0;  // 最初から再生
    scanBgmAudio.play().catch(e => console.error("scan-bgm 再生エラー:", e));

    document.getElementById('battle-container').style.display = 'none';
    document.getElementById('scan-screen').style.display = 'none';
    document.getElementById('startup-screen').style.display = 'none';
    document.getElementById('turn-display').style.display = 'none';

    const selectScreen = document.getElementById('select-monster-screen');
    selectScreen.style.display = 'block';

    const container = document.getElementById('select-monster-container');
    container.innerHTML = '';

    function createMonsterDiv(monster, playerId) {
        const div = document.createElement('div');
        div.id = playerId;
        div.classList.add('player-status');
        div.innerHTML = `
            <strong>${monster.name} ${getElementEmoji(monster.element)}</strong><br>
            HP: ${monster.maxHp}/${monster.maxHp}<br>
            AT: ${monster.baseAttack}<br>
            DF: ${monster.baseDefense}<br>
            SPD: ${monster.speed}<br>
            S1: ${monster.skill1} ${getSkillEmoji(monster.skill1)}<br>
            S2: ${monster.skill2} ${getSkillEmoji(monster.skill2)}
        `;
        return div;
    }
    
    const p1div = createMonsterDiv(initialPlayer1Monster, 'select-p1');
    const p2div = createMonsterDiv(initialPlayer2Monster, 'select-p2');

    container.appendChild(p1div);
    container.appendChild(p2div);

    const selectedMonsters = [];
    const confirmBtn = document.getElementById('select-confirm-btn');
    confirmBtn.disabled = true;  // 初期状態で押せない（グレー）

    function toggleSelection(div, monster) {
        if (selectedMonsters.includes(monster)) {
            selectedMonsters.splice(selectedMonsters.indexOf(monster), 1);
            div.classList.remove('selected-monster');
        } else {
            selectedMonsters.push(monster);
            div.classList.add('selected-monster');
        }
        
        // 選択に応じて確実にボタンを切り替える
        confirmBtn.disabled = selectedMonsters.length === 0;
    }

    p1div.onclick = () => toggleSelection(p1div, initialPlayer1Monster);
    p2div.onclick = () => toggleSelection(p2div, initialPlayer2Monster);

    confirmBtn.onclick = () => {

            // 🌟以前のスロット選択状態をクリアする（青枠解除）
    loadMonsterSlots.forEach(slot => slot.classList.remove('selected'));

    loadStoredMonsters();

    const monsterImage = document.getElementById('monster-image');
    monsterImage.src = "";
    monsterImage.style.display = "none";

        confirmBtn.textContent = 'Registered!';
        confirmBtn.disabled = true;
        setTimeout(() => {
            confirmBtn.textContent = 'Confirm';
            confirmBtn.disabled = true;
        }, 1500);


        
    };

    document.getElementById('select-back-btn').addEventListener('click', () => {
        // 選択画面を非表示
        document.getElementById('select-monster-screen').style.display = 'none';
      
        // バトル終了後画面を再表示
        document.getElementById('battle-container').style.display = 'block';
      
        // バトル終了後の各種ボタンを再表示（ここが重要！）
        document.getElementById('scan-next-battle-btn').style.display = 'inline-block';
        document.getElementById('quit-game-btn').style.display = 'inline-block';
        document.getElementById('add-to-collection-btn').style.display = 'inline-block';
      
        // バトルログを再表示（任意）
        document.getElementById('battle-log').style.display = 'block';
      });
      
});

// ====== 新規追加：モンスター登録画面への遷移処理 ======

let monstersToRegister = [];

// コンファームボタンを押したとき
// Confirmボタンの完全な動作
document.getElementById('select-confirm-btn').addEventListener('click', () => {
    const selectedMonsters = document.querySelectorAll('.selected-monster');
    if (selectedMonsters.length === 0) return;
  
    monstersToRegister = Array.from(selectedMonsters).map(div => {
      return div.id === 'select-p1' ? initialPlayer1Monster : initialPlayer2Monster;
    });
  
    document.getElementById('select-monster-screen').style.display = 'none';
    document.getElementById('register-slots-screen').style.display = 'flex';
    document.getElementById('scan-next-battle-btn').style.display = 'none';
    document.getElementById('quit-game-btn').style.display = 'none';
    loadSlots();
  
    // Confirmボタンを一旦無効化（誤操作防止）
    const confirmBtn = document.getElementById('select-confirm-btn');
    confirmBtn.textContent = 'Confirm';
    confirmBtn.disabled = true;
  });
  
  // ▼ Register Slots画面のBackボタンの動作（修正版）
  document.getElementById('register-slots-back-btn').addEventListener('click', () => {
    document.getElementById('register-slots-screen').style.display = 'none';
    document.getElementById('select-monster-screen').style.display = 'block';
  
    // Confirmボタンを再表示＆再度使用可能にする
    const confirmBtn = document.getElementById('select-confirm-btn');
    confirmBtn.textContent = 'Confirm';
    confirmBtn.disabled = false;

    document.getElementById('scan-next-battle-btn').style.display = 'inline-block';
    document.getElementById('quit-game-btn').style.display = 'inline-block';
  });
  
  // ▼ Select Monster画面のBackボタン（修正版）
  document.getElementById('select-back-btn').addEventListener('click', () => {
    document.getElementById('select-monster-screen').style.display = 'none';
    document.getElementById('battle-container').style.display = 'block';
  
    // バトル終了後に必要なボタンを必ず再表示する
    document.getElementById('scan-next-battle-btn').style.display = 'inline-block';
    document.getElementById('quit-game-btn').style.display = 'inline-block';
    document.getElementById('add-to-collection-btn').style.display = 'inline-block';
  
    // バトルログを再表示（もし消えてたら）
    document.getElementById('battle-log').style.display = 'block';
  });
  


  // ▼▼【修正版】登録スロット画面のJS処理▼▼

// 必要な要素を再取得（再確認）
const slots = document.querySelectorAll('#slots-container .slot');
const finalRegisterBtn = document.getElementById('final-register-btn');
let selectedSlots = []; // 選択済みスロット番号を管理

// スロット情報をロードして表示（元の関数を維持）
// スロットをロードする関数（修正版）
function loadSlots() {
    slots.forEach((slot, index) => {
        let data;
        try {
            data = JSON.parse(localStorage.getItem(`monster-slot-${index}`));
        } catch (e) {
            data = null;
        }

        if (data && data.name) {
            slot.innerHTML = `
            <div style="line-height:1.2; font-size: 12px; text-align: center;">
                <strong style="font-size:13px;">${data.name}</strong> <br>
                ${data.element || ''}<br>
                HP: ${data.maxHp} | AT: ${data.baseAttack}<br>
                DF: ${data.baseDefense} | SPD: ${data.speed || 'N/A'}<br>
                S1: ${data.skill1}<br>
                S2: ${data.skill2}
            </div>
            `;
        } else {
            slot.innerHTML = `
                <div style='display:flex;align-items:center;justify-content:center;width:100%;height:100%; font-size: 14px;'>
                    [Empty Slot]
                </div>
            `;
        }
        slot.classList.remove('selected');
    });

    updateFinalRegisterBtn();
}
  

// スロットクリック時の処理（青枠表示＋選択数制限）
slots.forEach(slot => {
  slot.addEventListener('click', () => {
    const slotNumber = slot.getAttribute('data-slot');

    if (slot.classList.contains('selected')) {
      // 選択済みなら解除
      slot.classList.remove('selected');
      selectedSlots = selectedSlots.filter(n => n !== slotNumber);
    } else {
      // 選択可能数を制限 (monstersToRegisterの数だけ)
      if (selectedSlots.length < monstersToRegister.length) {
        slot.classList.add('selected');
        selectedSlots.push(slotNumber);
      } else {
        showPopupMessage(`⚠️ You can select only ${monstersToRegister.length} slot(s).`);
      }
    }
    updateFinalRegisterBtn();
  });
});

finalRegisterBtn.addEventListener('click', () => {
    selectedSlots.forEach((slotNumber, index) => {
        const monster = monstersToRegister[index];

        const monsterWithImage = {
            ...monster,
            image: `${monster.name.replace(/\s/g, '_')}.webp`
        };

        localStorage.setItem(`monster-slot-${slotNumber}`, JSON.stringify(monsterWithImage));


    // 追加① 🌟 scan-bgm を停止
    scanBgmAudio.pause();
    scanBgmAudio.currentTime = 0;

    // 追加② 🌟 scan-complete.mp3 を再生
    if (!isMuted) { // ミュート状態でなければ再生
        scanCompleteSound.currentTime = 0;
        scanCompleteSound.play().catch(e => console.error("Scan complete 再生エラー:", e));
    }
    
        showPopupMessage("✅ Monster(s) Registered Successfully!");
    
        document.getElementById('scan-next-battle-btn').style.display = 'inline-block';
        document.getElementById('quit-game-btn').style.display = 'inline-block';
    
        setTimeout(() => {
            location.reload();
        }, 1500);

    });

    // メッセージを登録用に変更
    showPopupMessage("✅ Monster(s) Registered Successfully!");

    document.getElementById('scan-next-battle-btn').style.display = 'inline-block';
    document.getElementById('quit-game-btn').style.display = 'inline-block';

    setTimeout(() => {
        location.reload();
    }, 1500);
});

  

// 最終登録ボタンの有効/無効を更新
function updateFinalRegisterBtn() {
  finalRegisterBtn.disabled = selectedSlots.length !== monstersToRegister.length;
}

// Backボタンの処理（元のコードを維持）
document.getElementById('register-slots-back-btn').addEventListener('click', () => {
  document.getElementById('register-slots-screen').style.display = 'none';
  document.getElementById('select-monster-screen').style.display = 'block';

  // Confirmボタンの状態も元に戻す
  const confirmBtn = document.getElementById('select-confirm-btn');
  confirmBtn.textContent = 'Confirm';
  confirmBtn.disabled = false;

  // 選択状態をリセット
  slots.forEach(s => s.classList.remove('selected'));
  selectedSlots = [];
});

// ▼▼ 画面を表示したらスロット情報をロード ▼▼
loadSlots();

// 🌟 呼び出し画面でのモンスター選択と決定処理
let selectedLoadSlot = null;
const loadConfirmBtn = document.getElementById('load-confirm-btn');

// スロットをクリックした時の動作
loadMonsterSlots.forEach(slot => {
    slot.addEventListener('click', () => {
        // 空スロットのクリックを無効化
        if (slot.textContent.includes('[empty slot]')) return;
        if (slot.classList.contains('disabled')) return;

        loadMonsterSlots.forEach(s => s.classList.remove('selected'));
        
        // 新しく選択したスロットを青色に
        slot.classList.add('selected');
        
        // 選択したスロット番号を保存
        selectedLoadSlot = slot.getAttribute('data-slot');

        // Confirmボタンを有効化
        loadConfirmBtn.disabled = false;
        // 以前の選択を解除

        loadMonsterSlots.forEach(s => s.classList.remove('selected'));
        
        // 新しく選択したスロットを青色に
        slot.classList.add('selected');
        
        // 選択したスロット番号を保存
        selectedLoadSlot = slot.getAttribute('data-slot');

    });
});

// 🌟 Confirmボタンを押した時の処理
// 🌟 Confirmボタンを押した時の処理（修正版・中心ずれ対応）
loadConfirmBtn.addEventListener('click', () => {
    if (selectedLoadSlot === null) return;

    const loadedMonster = JSON.parse(localStorage.getItem(`monster-slot-${selectedLoadSlot}`));
    

    if (!loadedMonster) {
        alert('Error: No monster data found!');
        return;
    }

    setCurrentScannedMonster({
        ...loadedMonster,
        hp: loadedMonster.maxHp,
        attack: loadedMonster.baseAttack,
        defense: loadedMonster.baseDefense
    });

    const monsterImagePath = `assets/monsters/${loadedMonster.name.toLowerCase().replace(/ /g, "_")}.webp`;

    // Load画面を閉じてScan画面に戻す処理
    loadMonsterScreen.style.display = 'none';
    scanScreen.style.display = 'block';
　　removeQrVideo();
    createQrVideo(); 
    
    // 🌟重要：QRスキャン時と完全一致するように動画は非表示に
    const video = document.getElementById('qr-video');
    video.style.display = "none";

    // 🌟重要：モンスター画像のコンテナを表示させる処理を追加（ズレの原因はこれ）
    const monsterImageContainer = document.getElementById('monster-image-container');
    monsterImageContainer.style.display = "block";

    // モンスター画像表示処理（これは現状維持で良い）
    const monsterImage = document.getElementById('monster-image');
    monsterImage.src = monsterImagePath;
    monsterImage.style.display = "block";
    monsterImage.classList.add('pop-animation');

    // スキャン結果テキストの設定（これは問題ない）
    scanResultText.classList.remove('simple-text');
    scanResultText.classList.add('monster-box');

    scanResultText.innerHTML = `
        <strong>Loaded Monster:</strong><br>
        Name: ${loadedMonster.name}<br>
        Persona: ${loadedMonster.element}<br>
        HP: ${loadedMonster.maxHp}<br>
        ATK: ${loadedMonster.baseAttack}<br>
        DEF: ${loadedMonster.baseDefense}<br>
        SPD: ${loadedMonster.speed}<br>
        Skills: ${loadedMonster.skill1}, ${loadedMonster.skill2}<br>
        <div class="skill-details">
            ${getMonsterSkillDescription(loadedMonster)}
        </div>
    `;

    if (!isMuted) {
        scanCompleteSound.currentTime = 0;
        scanCompleteSound.play();
    }
    
    
    // 🌟ボタン並び（問題なし・維持）
    loadMonsterBtn.style.display = "inline-block";
    approveBtn.style.display = "inline-block";
    rescanBtn.style.display = "inline-block";

    startScanBtn.style.display = "none";
    stopScanBtn.style.display = "none";

    loadConfirmBtn.disabled = true;
    selectedLoadSlot = null;
});



const monsterNamesABC = ["Asian Dragon","Cerberus", "Cockatrice", "Dark Knight", "Dark Pharaoh", "Death Plant", "Demon", "Dinosaur", "Dragon", "Gargoyle", "Ghost", "Goblin", "Golem", "Gryphon", "Harpy", "Jack-o'-lantern", "Living Dead", "Lizardman", "Mandrake", "Minotaur", "Mummy", "Orc", "Phantom", "Phoenix", "Sea Serpent", "Skeleton", "Troll", "Vampire", "Werewolf", "Yeti"];

document.getElementById('gallery-btn').onclick = () => {
    const startupBgm = document.getElementById('startup-bgm');
    startupBgm.pause();
    startupBgm.currentTime = 0;
    
    document.getElementById('startup-screen').style.display = 'none';
    document.getElementById('gallery-screen').style.display = 'block';
    loadGalleryPage(1);
};

let currentGalleryPage = 1;

function loadGalleryPage(page) {
    
    document.getElementById('privacy-policy-link').style.display = 'none';
    currentGalleryPage = page;

    const startIndex = (page - 1) * 15;
    const endIndex = startIndex + 15;
    const galleryContainer = document.getElementById('gallery-container');
    galleryContainer.innerHTML = '';

    monsterNamesABC.slice(startIndex, endIndex).forEach(name => {
        const discovered = localStorage.getItem(`discovered-${name}`);
        const slot = document.createElement('div');
        slot.className = 'gallery-slot';

        if (discovered) {
            slot.innerHTML = `<img src="assets/monsters/${name.toLowerCase().replace(/ /g, "_")}.webp" alt="${name}">`;
            slot.onclick = () => showModal(name);
        } else {
            slot.textContent = "Not Discovered";
        }
        galleryContainer.appendChild(slot);
    });

    document.getElementById('gallery-prev-btn').style.display = page === 1 ? 'none' : 'inline-block';
    document.getElementById('gallery-next-btn').style.display = page === 2 ? 'none' : 'inline-block';

    document.getElementById('gallery-title').textContent = `Monster List (${page}/2)`;
}

document.getElementById('gallery-next-btn').onclick = () => loadGalleryPage(2);
document.getElementById('gallery-prev-btn').onclick = () => loadGalleryPage(1);
document.getElementById('gallery-exit-btn').onclick = () => {
    document.getElementById('gallery-screen').style.display = 'none';
    document.getElementById('startup-screen').style.display = 'block';
    document.getElementById('privacy-policy-link').style.display = 'block';
    const startupBgm = document.getElementById('startup-bgm');
    startupBgm.currentTime = 0;
    if (!window.isMuted) startupBgm.play();

};


function showModal(name) {
    document.getElementById('modal-image').src = `assets/monsters/${name.toLowerCase().replace(/ /g, "_")}.webp`;
    document.getElementById('modal-name').textContent = name;
    document.getElementById('gallery-modal').style.display = 'flex';
}

document.getElementById('gallery-modal').onclick = () => {
    document.getElementById('gallery-modal').style.display = 'none';
};


function fadeOutDefeatedMonster(player) {
    const monsterImg = document.getElementById(player === "P1" ? "player1-monster-image" : "player2-monster-image");
    if (monsterImg) {
        monsterImg.classList.add('fade-out');
        setTimeout(() => {
            monsterImg.style.visibility = 'hidden';
        }, 1500); // フェードアウト完了後に非表示化（任意）
    }
}



window.addEventListener('DOMContentLoaded', () => {

    // 起動画面のBGMを再生
    const startupBgm = document.getElementById('startup-bgm');
  
    if (startupBgm) {
      startupBgm.currentTime = 0;
      startupBgm.play().catch(error => {
        console.error('BGMが再生できませんでした:', error);
      });
    } else {
      console.error('startup-bgmが見つかりません！HTMLのaudioタグを確認してください。');
    }
  
  });
  

  // FastForward用のターンスキップ関数（最終修正版）
  function fastForwardTurns(turnsToSkip = 5) {
    let turnsSkipped = 0;

    while (turnsSkipped < turnsToSkip && !isBattleFinished() && currentTurn > 0) {
        battlePhase = "attackTurnStart";

        while (battlePhase !== "endOfTurn" && !isBattleFinished()) {
            switch (battlePhase) {
                case "attackTurnStart":
                    attackTurnStart(attacker, attackerPlayer);
                    battlePhase = "defenseTurnStart";
                    break;

                case "defenseTurnStart":
                    defenseTurnStart(defender, defenderPlayer);
                    battlePhase = "beforeAttackOverload";
                    break;

                case "beforeAttackOverload":
                    {
                        const { attackerDied } = beforeAttackOverload(attacker, attackerPlayer);
                        battlePhase = attackerDied ? "attackerReviveCheck" : "checkAttackMiss";
                    }
                    break;

                case "attackerReviveCheck":
                    {
                        const { revived } = reviveCheck(attacker, attackerPlayer);
                        battlePhase = revived ? "checkAttackMiss" : "endOfTurn";
                    }
                    break;

                case "checkAttackMiss":
                    {
                        const { missed } = checkAttackMiss(attacker, attackerPlayer, defender, defenderPlayer);
                        battlePhase = missed ? "endOfTurn" : "elementModifierCheck";
                    }
                    break;

                case "elementModifierCheck":
                    {
                        const { multiplier } = elementModifierCheck(attacker, attackerPlayer, defender, defenderPlayer);
                        attacker.currentElementMultiplier = multiplier;
                        battlePhase = "attackerLuckyCriticalCheck";
                    }
                    break;

                case "attackerLuckyCriticalCheck":
                    {
                        const baseDamage = Math.round(((attacker.attack + Math.sqrt(attacker.attack)) / defender.defense) * 100) + 35;
                        const randomMultiplier = [0.85, 0.9, 0.95, 1.0][Math.floor(Math.random() * 4)];
                        let damage = Math.round(baseDamage * randomMultiplier * attacker.currentElementMultiplier);

                        const { damage: modifiedDamage } = attackerLuckyCriticalCheck(attacker, attackerPlayer, damage);
                        attacker.currentDamage = modifiedDamage;

                        battlePhase = "defenderEvasionCheck";
                    }
                    break;

                case "defenderEvasionCheck":
                    {
                        const { damage, isEvaded } = defenderEvasionCheck(defender, defenderPlayer, attacker, attackerPlayer, attacker.currentDamage);
                        attacker.currentDamage = damage;
                        battlePhase = isEvaded ? "endOfTurn" : "defenderLuckyEnduranceCheck";
                    }
                    break;

                case "defenderLuckyEnduranceCheck":
                    {
                        const { damage } = defenderLuckyEnduranceCheck(defender, defenderPlayer, attacker.currentDamage);
                        attacker.currentDamage = damage;
                        battlePhase = "applyDamageToDefender";
                    }
                    break;

                case "applyDamageToDefender":
                    applyDamageToDefender(attacker, defender, attackerPlayer, defenderPlayer, attacker.currentDamage);
                    battlePhase = defender.hp <= 0 ? "defenderReviveCheck" : "attackerVampireCheck";
                    break;

                case "defenderReviveCheck":
                    {
                        const { revived } = reviveCheck(defender, defenderPlayer);
                        if (!revived && defender.hp <= 0) {
                            // 🌟 修正：バトル終了を即座に確定する
                            battlePhase = "battleFinished";
                        } else {
                            battlePhase = "attackerVampireCheck";
                        }
                    }
                    break;

                case "attackerVampireCheck":
                    attackerVampireCheck(attacker, attackerPlayer, attacker.currentDamage);
                    battlePhase = "defenderHealCheck";
                    break;

                case "defenderHealCheck":
                    defenderHealCheck(defender, defenderPlayer);
                    battlePhase = "defenderCounterCheck";
                    break;

                case "defenderCounterCheck":
                    {
                        const { attackerDied } = defenderCounterCheck(attacker, defender, attackerPlayer, defenderPlayer, attacker.currentDamage);
                        battlePhase = attackerDied ? "attackerReviveCheckAfterCounter" : "defenderThornsCheck";
                    }
                    break;

                case "attackerReviveCheckAfterCounter":
                    {
                        const { revived } = reviveCheck(attacker, attackerPlayer);
                        battlePhase = revived ? "defenderThornsCheck" : "battleFinished";
                    }
                    break;

                case "defenderThornsCheck":
                    defenderThornsCheck(defender, attacker, defenderPlayer, attackerPlayer);
                    battlePhase = attacker.hp <= 0 ? "attackerReviveCheckAfterThorns" : "endOfTurn";
                    break;

                case "attackerReviveCheckAfterThorns":
                    {
                        const { revived } = reviveCheck(attacker, attackerPlayer);
                        battlePhase = revived ? "endOfTurn" : "battleFinished";
                    }
                    break;

                default:
                    battlePhase = "endOfTurn";
                    break;
            }
        }

        if (!isBattleFinished()) {
            currentTurn--;
            turnsSkipped++;
        } else {
            break; // 戦闘終了の場合即座に停止
        }

        finalizeTurn();

        [attacker, defender] = [defender, attacker];
        [attackerPlayer, defenderPlayer] = [defenderPlayer, attackerPlayer];
    }

    updatePlayerStatusDisplay(1, player1Monster);
    updatePlayerStatusDisplay(2, player2Monster);
    currentTurn += 1; 
    updateTurnDisplay();

    if (!isBattleFinished()) {
        battleLogData = [{ log: `⏩ Fast forwarded ${turnsSkipped} turns!` }];
    } else {
        // 🌟 ここに注意！倒されたログ表示後、次のNextで勝敗を表示
        const defeatedPlayer = player1Monster.hp <= 0 ? "P1" : "P2";
        const defeatedMonster = player1Monster.hp <= 0 ? player1Monster.name : player2Monster.name;

        battleLogData = [{ log: `${defeatedPlayer}'s ${defeatedMonster} was defeated!` }];

        // 🌟 battlePhaseをbattleFinishedに明示的にセット
        battlePhase = "battleFinished";

        fadeOutDefeatedMonster(defeatedPlayer);
        document.getElementById('death-sound').play();
    }

    battleIndex = 0;
    displayBattleLog();

    nextTurnBtn.style.display = "inline-block";

    if (turnsSkipped % 2 === 1) {
        [attacker, defender] = [defender, attacker];
        [attackerPlayer, defenderPlayer] = [defenderPlayer, attackerPlayer];
    }
}



function fadeOutAudio(audio) {
    const fadeInterval = setInterval(() => {
        if (audio.volume > 0.05) {
            audio.volume -= 0.05;
        } else {
            clearInterval(fadeInterval);
            audio.volume = 0;
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 1; // 元に戻しておく
        }
    }, 50);  // ← フェード速度調整（数値小さめで早め）
}

// 即停止処理
function stopAudioImmediately(audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
}


// ここから追加するコード
const battleBgmAudio = document.getElementById('battle-bgm');

document.getElementById('add-to-collection-btn').onclick = () => {
    stopAudioImmediately(battleBgmAudio);
    // ★他の処理があればここに追記
};

document.getElementById('scan-next-battle-btn').onclick = () => {
    stopAudioImmediately(battleBgmAudio);
    // ★他の処理があればここに追記
};

document.getElementById('quit-game-btn').onclick = () => {
    stopAudioImmediately(battleBgmAudio);
    // ★他の処理があればここに追記
};




// 変数を追加（画面の上部あたり）
window.isMuted = false; // 初期状態：音が出ている

const damageSound = new Audio('assets/sound/damage-sound.mp3');
const recoverSound = new Audio('assets/sound/recover-sound.mp3');
const scanCompleteSound = new Audio('assets/sound/scan-complete.mp3');

// allAudios に追加
const allAudios = [
    document.getElementById('startup-bgm'),
    document.getElementById('battle-bgm'),
    document.getElementById('win-sound'),
    document.getElementById('death-sound'),
    scanBgmAudio,
    damageSound,
    recoverSound,
    scanCompleteSound,
    attackSound,  // ←追加
    skillSound    // ←追加
];

// ミュート切り替え関数を定義
function toggleMute() {
    isMuted = !isMuted;

    allAudios.forEach(audio => {
        audio.muted = isMuted;
    });

    specialBgmAudio.muted = isMuted;

    // 🔴 追加ここから -----
    if (!isMuted) {
        // ミュート解除時に現在画面で使っているBGMを再生

        const startupBgm = document.getElementById('startup-bgm');
        const battleBgm = document.getElementById('battle-bgm');

        if (document.getElementById('startup-screen').style.display === 'block') {
            if (startupBgm.paused) {
                startupBgm.play();
            }
        } else if (document.getElementById('battle-container').style.display === 'block') {
            if (battleBgm.paused) {
                battleBgm.play();
            }
        } else if (document.getElementById('special-screen').style.display === 'flex') {
            if (specialBgmAudio.paused) {
                specialBgmAudio.play();
            }
        } else if (document.getElementById('scan-screen').style.display === 'block') {
            if (scanBgmAudio.paused) {
                scanBgmAudio.play();
            }
        }
    }
    // ----- 追加ここまで 🔴

    // アイコンを切り替える
    const soundToggleImg = document.getElementById('sound-toggle');
    soundToggleImg.src = isMuted ? 'assets/sound/2.png' : 'assets/sound/1.png';
}



// ボタンにクリックイベントを設定（1回だけ設定）
document.getElementById('sound-toggle-container').onclick = toggleMute;



document.getElementById('exit-button').onclick = () => {
    showConfirmationPopup(
        "Return to the start screen?\n(All unsaved progress will be lost)",
        () => {  // 🌟「Yes」の場合だけリセットする
            resetMonsterFade(); // ←ここに移動！
            
            resetTemporaryGameState();
            showStartupScreen();
        },
        null // 「No」の場合
    );
    document.getElementById('privacy-policy-link').style.display = 'block';
    document.getElementById('privacy-policy-link').style.display = 'none';
};


function resetTemporaryGameState() {
    // main.js内のモンスター情報をリセット
    Main.resetMonsters();

    battleLogData = [];
    setCurrentScannedMonster(null); 
    battleIndex = 0;    
    currentPlayer = 1;
    setScanningForPlayer(1);
    setCurrentScannedMonster(null);

    localStorage.removeItem('isSpecialBattle');
    localStorage.removeItem('isNormalBattle');
    
    document.getElementById('privacy-policy-link').style.display = 'block';

    const scanResult = document.getElementById('scan-result');
    scanResult.textContent = '';
    scanResult.classList.remove('monster-box', 'simple-text');

    document.getElementById('battle-log').textContent = '';

    const buttonsToHide = [
        'start-scan', 'stop-scan', 'load-monster-btn', 'approve-btn', 
        'rescan-btn', 'start-battle-btn', 'next-turn-btn',
        'scan-next-battle-btn', 'quit-game-btn', 'add-to-collection-btn'
    ];

    buttonsToHide.forEach(id => {
        const btn = document.getElementById(id);
        btn.style.display = 'none';
        btn.disabled = false;
    });

    fastForwardBtn.style.display = "none";

    document.getElementById('battle-background').style.display = 'none';
    document.getElementById('turn-display').style.display = 'none';

    const monsterImage = document.getElementById('monster-image');
    monsterImage.style.display = 'none';
    monsterImage.src = '';
    monsterImage.classList.remove('pop-animation');

    document.getElementById('player1-monster-image').src = '';
    document.getElementById('player2-monster-image').src = '';

    const qrVideo = document.getElementById('qr-video');
    if (qrVideo) {
        qrVideo.style.display = 'none';
    }

    if (typeof stopScanning === 'function') {
        stopScanning();
    }

    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });

    document.getElementById('startup-screen').style.display = 'block';
    document.getElementById('scan-screen').style.display = 'none';
    document.getElementById('special-screen').style.display = 'none';
    document.getElementById('battle-container').style.display = 'none';

    document.getElementById('game-start-btn').style.display = 'inline-block';
    document.getElementById('gallery-btn').style.display = 'inline-block';
    document.getElementById('special-btn').style.display = 'inline-block';

    specialBgmAudio.pause();
    specialBgmAudio.currentTime = 0;

    scanBgmAudio.pause();
    scanBgmAudio.currentTime = 0;

    const startupBgm = document.getElementById('startup-bgm');
    if (!window.isMuted) {
        startupBgm.currentTime = 0;
        startupBgm.play();
    }

    const galleryModal = document.getElementById('gallery-modal');
    if (galleryModal) {
        galleryModal.style.display = 'none';
    }

    // ★★ここに追加★★ ボタン状態の初期化
    updateButtonState(document.getElementById('start-scan'), true);
    updateButtonState(document.getElementById('stop-scan'), false);
    updateButtonState(document.getElementById('load-monster-btn'), true);
    removeQrVideo();
}


function showStartupScreen() {
    document.getElementById('startup-screen').style.display = 'block';
    document.getElementById('scan-screen').style.display = 'none';
    document.getElementById('battle-container').style.display = 'none';
    document.getElementById('select-monster-screen').style.display = 'none';
    document.getElementById('register-slots-screen').style.display = 'none';
    document.getElementById('load-monster-screen').style.display = 'none';
    document.getElementById('gallery-screen').style.display = 'none';

    // 開始画面のBGMを再生
    const startupBgm = document.getElementById('startup-bgm');
    startupBgm.currentTime = 0;
    startupBgm.play();
}

// 🌟【新規追加】カスタム確認ポップアップ関数
function showConfirmationPopup(message, yesCallback, noCallback) {
    const popup = document.getElementById('confirmation-popup');
    const messageElem = document.getElementById('confirmation-message');
    const yesBtn = document.getElementById('confirm-yes-btn');
    const noBtn = document.getElementById('confirm-no-btn');

    messageElem.textContent = message;
    popup.style.display = 'flex';

    // イベントリスナーを一度リセット
    yesBtn.onclick = () => {
        popup.style.display = 'none';
        if (yesCallback) yesCallback();
    };
    noBtn.onclick = () => {
        popup.style.display = 'none';
        if (noCallback) noCallback();
    };
}

// 🌟【修正】Exitボタンのクリックイベントを書き換え

// モンスター画像の要素取得（既に取得済なら不要）
const player1MonsterImg = document.getElementById('player1-monster-image');
const player2MonsterImg = document.getElementById('player2-monster-image');

// フェードアウトをリセットする関数を定義
function resetMonsterFade() {
    [player1MonsterImg, player2MonsterImg].forEach(img => {
        img.classList.remove('fade-out');
        img.style.opacity = '1';
        img.style.visibility = 'visible';
    });
}

// 各ボタンにイベントを設定して、クリック時に必ずリセット関数を呼ぶ

// 🌟Add to Collection ボタン
document.getElementById('add-to-collection-btn').addEventListener('click', () => {
    resetMonsterFade();
});



// 🌟Scan for Next Battleボタン
document.getElementById('scan-next-battle-btn').addEventListener('click', async () => {
    resetMonsterFade();

    // QRカメラ停止＆非表示処理
    await stopScanning();
    
    // モンスター画像を非表示
    const monsterImage = document.getElementById('monster-image');
    if (monsterImage) monsterImage.style.display = "none";

    const qrVideo = document.getElementById('qr-video');
    if (qrVideo) qrVideo.style.display = 'block';

    // ボタンの状態をリセット
    startScanBtn.disabled = false;  
    stopScanBtn.disabled = true;   
    loadMonsterBtn.disabled = false;

    startScanBtn.removeAttribute("style");
    stopScanBtn.removeAttribute("style");
    loadMonsterBtn.removeAttribute("style");
});

// 🌟Quit Gameボタン
document.getElementById('quit-game-btn').addEventListener('click', () => {
    resetMonsterFade();
});

// displayBattleLogが完了したあとにcallbackを呼ぶ関数を新規作成
function displayBattleLogWithCallback(callback) {
    if (battleIndex >= battleLogData.length) {
        if (callback) callback();
        return;
    }

    nextTurnBtn.style.display = "none";
    const currentLog = battleLogData[battleIndex];

    battleLogElement.innerHTML = "";

    typeWriterEffect(battleLogElement, currentLog.log, async () => {
        if (/🏆|🤝/.test(currentLog.log)) {
            if (!isMuted) {
                const winSound = document.getElementById('win-sound');
                winSound.currentTime = 0;
                winSound.play().catch(e => console.error("再生エラー:", e));
            }
        }

        battleIndex++;

        if (battleIndex >= battleLogData.length) {
            if (callback) callback();
        }
    });
}

document.getElementById('privacy-policy-link').addEventListener('click', () => {
    window.open('https://sites.google.com/view/qr-monster-battle-privacy/%E3%83%9B%E3%83%BC%E3%83%A0', '_blank');
});
