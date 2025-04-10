window.discoveryPopupTimeout = null;

export async function generateSHA256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function extendHashTo100Chars(hash) {
    let extendedHash = hash;
    while (extendedHash.length < 100) {
        extendedHash += hash; 
    }
    return extendedHash.substring(0, 100);
}

export function getElementEmoji(element) {
    return {
        "Emotional": "💖",
        "Logical": "🧠",
        "Intuitive": "✨",
        "Instinctive": "🐾"
    }[element] || "";
}

export function getSkillEmoji(skill) {
    const skillEmojis = {
        "Lucky": "🍀",
        "Counter": "🔄",
        "Heal": "❤️",
        "Revive": "🌟",
        "Thorns": "🌵",
        "Evasion": "👟",
        "Endurance": "🛡️",
        "Growth": "📈",
        "Learning": "📚",
        "Critical": "💥",
        "Vampire": "🦇",
        "Overload": "⚡",
        "Petrify": "🪨",
        "Taunt": "👎",
        "Intimidate": "👁️",
        "Supersonic": "💫"

    };
    return skillEmojis[skill] || "";
}

export function showDiscoveryPopup(monsterName) {
    const popup = document.getElementById('discovery-popup');
    popup.textContent = `🎉 New Monster Discovered: ${monsterName}!`;

    // 既存のタイマーを完全キャンセル
    if (window.discoveryPopupTimeout) {
        clearTimeout(window.discoveryPopupTimeout);
        window.discoveryPopupTimeout = null;
    }

    // 強制的に再表示（リセット含め）
    popup.style.display = 'block';
    popup.style.opacity = '1';

    // トランジションを中断して再スタート（←ここが重要！）
    popup.style.transition = 'none';  // 一旦無効
    void popup.offsetWidth;           // リフロー強制（CSS再評価させる）
    popup.style.transition = '';      // 再有効（←必要なら）

    // 新たな非表示処理をセット（A→B完全切替）
    window.discoveryPopupTimeout = setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => {
            popup.style.display = 'none';
        }, 500);
    }, 2000);
}



export function updateButtonState(button, isEnabled) {
    button.disabled = !isEnabled;
    button.style.backgroundColor = isEnabled ? '#1b2a41' : 'grey';
    button.style.borderColor = isEnabled ? '#66ccff' : '#888';
    button.style.color = isEnabled ? '#fff' : '#ccc';
    button.style.opacity = isEnabled ? '1' : '0.6';
}
