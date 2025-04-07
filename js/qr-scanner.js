import { generateSHA256, extendHashTo100Chars, getElementEmoji, getSkillEmoji, showDiscoveryPopup } from './utils.js';
import { generateMonster } from './monster-generator.js';
import { setCurrentScannedMonster } from './main.js';
import { updateSpecialButtonState } from './special.js';
import QrScanner from './qr-scanner.min.js';
QrScanner.WORKER_PATH = './js/qr-scanner-worker.min.js';

let qrScanner = null;

const scanResultText = document.getElementById('scan-result');
const startScanBtn = document.getElementById('start-scan');
const stopScanBtn = document.getElementById('stop-scan');
const approveBtn = document.getElementById('approve-btn');
const rescanBtn = document.getElementById('rescan-btn');



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
    "Jack-o'-Lantern":"assets/monsters/jack-o'-lantern.webp",
    "Dark Pharaoh":"assets/monsters/dark_pharaoh.webp", 
    "Asian Dragon": "assets/monsters/asian_dragon.webp",
    "Dragon": "assets/monsters/dragon.webp",
    "Vampire": "assets/monsters/vampire.webp",
    "Phoenix": "assets/monsters/phoenix.webp",
    "Golem": "assets/monsters/golem.webp",
  };
  
// utils.jsにあった方がよいが、一旦ここに置くことも可能
function getMonsterSkillDescription(monster) {
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

    const [skill1, skill2] = monster.skills;
    let descriptions = "";

    if (skill1 === skill2) {
        descriptions = skillDescriptions[`Double ${skill1}`];
    } else {
        descriptions = `${skillDescriptions[skill1]}<br>${skillDescriptions[skill2]}`;
    }
    return descriptions;
}

let allowScan = false; // ✅ 最初はスキャン禁止

export async function scanQRCode() {
    await stopScanning();

    const oldVideo = document.getElementById('qr-video');
    const cameraContainer = oldVideo?.parentNode || document.getElementById('camera-container');
    if (oldVideo) cameraContainer.removeChild(oldVideo);

    const newVideo = document.createElement('video');

const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: "environment",
width: { ideal: 1920 },
height: { ideal: 1080 },  // ← カンマが必要！
focusMode: "continuous",
zoom: true,
advanced: [
  { focusMode: "continuous" },
  { torch: false },
]
  }
});

const track = stream.getVideoTracks()[0];
const capabilities = track.getCapabilities();

if (capabilities.focusMode && capabilities.focusMode.includes("continuous")) {
  await track.applyConstraints({ advanced: [{ focusMode: "continuous" }] });
}



newVideo.srcObject = stream;
    newVideo.id = 'qr-video';
    newVideo.setAttribute('autoplay', true);
    newVideo.setAttribute('muted', true);
    newVideo.setAttribute('playsinline', true);
    newVideo.setAttribute('controls', false);

    newVideo.style.display = 'block';
    newVideo.style.opacity = '0'; // ✅ 最初は透明
    newVideo.style.transition = 'opacity 0.3s ease';
    newVideo.style.objectFit = 'cover';
    newVideo.style.backgroundColor = 'black';
    newVideo.style.border = '4px solid white';

    cameraContainer.appendChild(newVideo);

    qrScanner = new QrScanner(newVideo, async result => {
        if (!allowScan) return; // ✅ 映像出るまでは無視！

        allowScan = false; // ✅ 1回でスキャン終了
        qrScanner.stop();

        if (!window.isMuted) {
            window.scanCompleteSound.currentTime = 0;
            window.scanCompleteSound.play();
        }

        const hash = await generateSHA256(result);
        const extendedHash = extendHashTo100Chars(hash);
        const monster = generateMonster(extendedHash);

        setCurrentScannedMonster(monster);

        const monsterImage = document.getElementById('monster-image');
        if (monsterImageMap[monster.name]) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    monsterImage.src = monsterImageMap[monster.name];
                    monsterImage.style.display = "block";
                    monsterImage.classList.add('pop-animation');
                });
            });
        } else {
            monsterImage.style.display = "none";
        }

        if (!localStorage.getItem(`discovered-${monster.name}`)) {
            localStorage.setItem(`discovered-${monster.name}`, true);
            updateSpecialButtonState(document.getElementById('special-btn'));
            showPopupMessage(`🎉 New Monster Discovered: ${monster.name}!`);
        }

        scanResultText.classList.remove('simple-text');
        scanResultText.classList.add('monster-box');
        scanResultText.innerHTML = `
            <strong>Scanned Monster:</strong><br>
            Name: ${monster.name}<br>
            Persona: ${monster.element} ${getElementEmoji(monster.element)}<br>
            HP: ${monster.hp}<br>
            ATK: ${monster.attack}<br>
            DEF: ${monster.defense}<br>
            SPD: ${monster.speed}<br>
            Skills: ${monster.skill1} ${getSkillEmoji(monster.skill1)}, ${monster.skill2} ${getSkillEmoji(monster.skill2)}<br>
            <div class="skill-details">
                ${getMonsterSkillDescription(monster)}
            </div>
        `;

        newVideo.style.opacity = "0";
        startScanBtn.style.display = "none";
        stopScanBtn.style.display = "none";
        if (window.isCodeCheckMode) {
            document.getElementById('codecheck-confirm-btn').style.display = "inline-block";
            document.getElementById('codecheck-quit-btn').style.display = "inline-block";
            approveBtn.style.display = "none";
        } else {
            approveBtn.style.display = "inline-block";
        }
        
        rescanBtn.style.display = "inline-block";
        
    });

    qrScanner.start().then(() => {
        const video = document.getElementById('qr-video');

        const interval = setInterval(() => {
            if (
                video.readyState === 4 &&
                video.videoWidth > 16 &&
                video.videoHeight > 16
            ) {
                video.style.opacity = "1"; // ✅ 映像出たら表示
                allowScan = true;          // ✅ この瞬間だけスキャン解禁！
                clearInterval(interval);
            }
        }, 50);
    }).catch(error => {
        console.error("Failed to start QR scanner:", error);
    });
}


  
  export async function stopScanning() {
    if (qrScanner) {
      await qrScanner.stop();
      qrScanner.destroy();
      qrScanner = null;
    }
  }

  export function showPopupMessage(message) {
    const popup = document.getElementById('discovery-popup');
    popup.textContent = message;
    popup.style.display = 'block';

    requestAnimationFrame(() => {
        popup.style.opacity = '1';
    });

    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => {
            popup.style.display = 'none';
        }, 500);
    }, 2000);
}
