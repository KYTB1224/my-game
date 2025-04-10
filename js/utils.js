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
    popup.style.display = 'block';

    requestAnimationFrame(() => {
        popup.style.opacity = '1';
    });

    // 🔁 前のタイマーが残ってたらキャンセル！
    if (window.discoveryPopupTimeout) {
        clearTimeout(window.discoveryPopupTimeout);
    }

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
