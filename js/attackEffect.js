// attackEffect.js（最新版）
// アニメーション用画像を事前にプリロードする関数（★追加★）
export function preloadEffectImages() {
    // 攻撃エフェクト（15枚）
    for (let i = 1; i <= 15; i++) {
        const img = new Image();
        img.src = `assets/effects/damage/frame_${i}.png`;
    }

    // スキルエフェクト（8枚）
    for (let i = 1; i <= 8; i++) {
        const img = new Image();
        img.src = `assets/effects/skill/skill${i}.png`;
    }
}

// 攻撃エフェクトの再生関数（既存維持）
export function playAttackSpriteAnimation(player, callback) {
    const container = document.getElementById(`attack-effect-${player}`);

    container.innerHTML = '';
    container.style.display = 'block';
   
    if (!window.isMuted) { 
        window.attackSound.currentTime = 0;
        window.attackSound.play();
    }

   
    const monsterImageId = player === 'p1' ? 'player1-monster-image' : 'player2-monster-image';
    const monsterImage = document.getElementById(monsterImageId);
    const monsterRect = monsterImage.getBoundingClientRect();

    const imageHeight = monsterRect.height;
    container.style.height = `${imageHeight}px`;
    container.style.width = `${imageHeight}px`;
    container.style.position = 'fixed';

    const offsetY = 0; 
    container.style.top = `${monsterRect.top + window.scrollY - offsetY}px`;
    container.style.left = `${monsterRect.left + window.scrollX + (monsterRect.width - imageHeight) / 2}px`;
    container.style.transform = 'none';

    const totalFrames = 15;
    let currentFrame = 1;

    const imageElement = document.createElement('img');
    imageElement.style.width = '100%';
    imageElement.style.height = '100%';
    imageElement.src = `assets/effects/damage/frame_${currentFrame}.png`;

    container.appendChild(imageElement);

    const animationInterval = setInterval(() => {
        currentFrame++;
        if (currentFrame > totalFrames) {
            clearInterval(animationInterval);
            container.style.display = 'none';

            if (callback) callback();
            return;
        }

        imageElement.src = `assets/effects/damage/frame_${currentFrame}.png`;
    }, 50);
}

// スキルエフェクトの再生関数（★新規追加★）
export function playSkillSpriteAnimation(player, callback) {
    const container = document.getElementById(`skill-effect-${player}`);

    container.innerHTML = '';
    container.style.display = 'block';

    if (!window.isMuted) {
        window.skillSound.currentTime = 0;
        window.skillSound.play();
    }
    
    const monsterImageId = player === 'p1' ? 'player1-monster-image' : 'player2-monster-image';
    const monsterImage = document.getElementById(monsterImageId);
    const monsterRect = monsterImage.getBoundingClientRect();

    const imageHeight = monsterRect.height;
    container.style.height = `${imageHeight}px`;
    container.style.width = `${imageHeight}px`;
    container.style.position = 'fixed';

    const offsetY = 30; 
    container.style.top = `${monsterRect.top + window.scrollY - offsetY}px`;
    container.style.left = `${monsterRect.left + window.scrollX + (monsterRect.width - imageHeight) / 2}px`;
    container.style.transform = 'none';

    const totalFrames = 8; // スキル用は8枚
    let currentFrame = 1;

    const imageElement = document.createElement('img');
    imageElement.style.width = '100%';
    imageElement.style.height = '100%';
    imageElement.src = `assets/effects/skill/skill${currentFrame}.png`;

    container.appendChild(imageElement);

    const animationInterval = setInterval(() => {
        currentFrame++;
        if (currentFrame > totalFrames) {
            clearInterval(animationInterval);
            container.style.display = 'none';

            if (callback) callback();
            return;
        }

        imageElement.src = `assets/effects/skill/skill${currentFrame}.png`;
    }, 50); // 速度は自由に調整可（50ms前後がオススメ）
}
