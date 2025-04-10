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

    // 🔁 タイマーも見た目も完全リセット！
    if (window.discoveryPopupTimeout) {
        clearTimeout(window.discoveryPopupTimeout);
        window.discoveryPopupTimeout = null;
    }

    // ❗️ すぐ非表示処理が発火しないよう、安全にリセット
    popup.style.transition = 'none';
    popup.style.opacity = '1';
    popup.style.display = 'block';
    void popup.offsetWidth; // 強制リフロー
    popup.style.transition = ''; // transitionを再有効に

    // ✅ 新たな非表示タイマーをセット
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
