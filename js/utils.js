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
        "Petrify": "🪨"
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

    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => {
            popup.style.display = 'none';
        }, 500);
    }, 2000);
}
