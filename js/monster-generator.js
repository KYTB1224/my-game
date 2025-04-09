// monster-generator.js

import { generateSHA256, extendHashTo100Chars } from './utils.js';

const monsterNames = [
    "Cerberus", "Cockatrice", "Dark Knight", "Death Plant", "Demon", "Dinosaur",
    "Gargoyle", "Ghost", "Goblin", "Gryphon", "Harpy", "Living Dead", "Lizardman",
    "Mandrake", "Minotaur", "Mummy", "Orc", "Phantom", "Sea Serpent", "Skeleton",
    "Troll", "Werewolf", "Yeti", "Jack-o'-Lantern", "Dark Pharaoh"
];

const skillList = [
    "Lucky", "Counter", "Heal", "Revive", "Thorns", "Evasion",
    "Endurance", "Growth", "Learning", "Critical", "Vampire", "Overload", "Petrify",
    "Taunt", "Intimidate", "Supersonic" // 🌟 追加スキル
  ];
  

const elements = ["Emotional", "Logical", "Intuitive", "Instinctive"];

export async function generateMonsterFromQR(qrData) {
    const hash = await generateSHA256(qrData);
    const extendedHash = extendHashTo100Chars(hash);
    return generateMonster(extendedHash);
}

export function generateMonster(extendedHash) {
    const hpValue = (Math.round(parseInt(extendedHash[15], 16) / 3) + 8) * 100 
    + (parseInt(extendedHash[92], 16) % 11) * 10;
    const attackValue = (parseInt(extendedHash[33], 16) + 5) * 10;
    const defenseValue = (parseInt(extendedHash[50], 16) + 5) * 10;
    const speedValue = (parseInt(extendedHash[66], 16) + 5) * 10;

    const skill1Index = parseInt(extendedHash.substring(20, 22), 16) % skillList.length;
    const skill2Index = parseInt(extendedHash.substring(45, 47), 16) % skillList.length;
    let skill1 = skillList[skill1Index];
    let skill2 = skillList[skill2Index];

    const nameIndex = parseInt(extendedHash.substring(5, 9), 16) % monsterNames.length;
    let monsterName = monsterNames[nameIndex];

    const rareCheck = parseInt(extendedHash[70] + extendedHash[71], 16);

    if (rareCheck === 0) { 
        monsterName = "Vampire";
        skill1 = skill2 = "Vampire";
    } else if (rareCheck === 1) { 
        monsterName = "Phoenix";
        skill1 = skill2 = "Revive";
    } else if (rareCheck === 2) {
        monsterName = "Golem";
        skill1 = skill2 = "Petrify";
    } else if (attackValue >= 180 && defenseValue >= 180) {
        const dragonCheck = parseInt(extendedHash[99], 16);
        monsterName = dragonCheck <= 7 ? "Dragon" : "Asian Dragon";
    } else if (skill1 === skill2) {
        if (skill1 === "Vampire") monsterName = "Vampire";
        else if (skill1 === "Revive") monsterName = "Phoenix";
        else if (skill1 === "Petrify") monsterName = "Golem";
    }

    const elementIndex = parseInt(extendedHash[89], 16) % 16;
    const element = elements[Math.floor(elementIndex / 4)];

    return {
        name: monsterName,
        hp: hpValue,
        maxHp: hpValue,
        attack: attackValue,
        defense: defenseValue,
        speed: speedValue,
        skill1: skill1,
        skill2: skill2,
        skills: [skill1, skill2],
        element: element,
        baseAttack: attackValue,
        baseDefense: defenseValue,
        growthCounter: 0,
        learningCounter: 0,
        growthActivation: 0,
        learningActivation: 0,
        reviveActivation: 0,
        healActivation: 0
    };
}
