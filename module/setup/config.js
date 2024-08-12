export const WITCHER = {}

//Stats
WITCHER.statTypes = {
    none: "",
    int: "WITCHER.Actor.Stat.Int",
    ref: "WITCHER.Actor.Stat.Ref",
    dex: "WITCHER.Actor.Stat.Dex",
    body: "WITCHER.Actor.Stat.Body",
    spd: "WITCHER.Actor.Stat.Spd",
    emp: "WITCHER.Actor.Stat.Emp",
    cra: "WITCHER.Actor.Stat.Cra",
    will: "WITCHER.Actor.Stat.Will",
    luck: "WITCHER.Actor.Stat.Luck",
}

WITCHER.statMap = {
    int: {
        origin: "stats",
        name: "int",
        label: "WITCHER.StInt",
        labelShort: "WITCHER.Actor.Stat.Int"
    },
    ref: {
        origin: "stats",
        name: "ref",
        label: "WITCHER.StRef",
        labelShort: "WITCHER.Actor.Stat.Ref"
    },
    dex: {
        origin: "stats",
        name: "dex",
        label: "WITCHER.StDex",
        labelShort: "WITCHER.Actor.Stat.Dex"
    },
    body: {
        origin: "stats",
        name: "body",
        label: "WITCHER.StBody",
        labelShort: "WITCHER.Actor.Stat.Body"
    },
    spd: {
        origin: "stats",
        name: "spd",
        label: "WITCHER.StSpd",
        labelShort: "WITCHER.Actor.Stat.Spd"
    },
    emp: {
        origin: "stats",
        name: "emp",
        label: "WITCHER.StEmp",
        labelShort: "WITCHER.Actor.Stat.Emp"
    },
    cra: {
        origin: "stats",
        name: "cra",
        label: "WITCHER.StCra",
        labelShort: "WITCHER.Actor.Stat.Cra"
    },
    will: {
        origin: "stats",
        name: "will",
        label: "WITCHER.StWill",
        labelShort: "WITCHER.Actor.Stat.Will"
    },
    luck: {
        origin: "stats",
        name: "luck",
        label: "WITCHER.StLuck",
        labelShort: "WITCHER.Actor.Stat.Luck"
    },

    stun: {
        origin: "coreStats",
        name: "stun",
        labelShort: "WITCHER.Actor.CoreStat.Stun",
    },
    run: {
        origin: "coreStats",
        name: "run",
        labelShort: "WITCHER.Actor.CoreStat.Run",
    },
    leap: {
        origin: "coreStats",
        name: "leap",
        labelShort: "WITCHER.Actor.CoreStat.Leap",
    },
    enc: {
        origin: "coreStats",
        name: "enc",
        labelShort: "WITCHER.Actor.CoreStat.Enc",
    },
    rec: {
        origin: "coreStats",
        name: "rec",
        labelShort: "WITCHER.Actor.CoreStat.Rec",
    },
    woundTreshold: {
        origin: "coreStats",
        name: "woundTreshold",
        labelShort: "WITCHER.Actor.CoreStat.woundTreshold",
    },

    hp: {
        origin: "derivedStats",
        name: "hp",
        labelShort: "WITCHER.Actor.DerStat.HP",
    },
    sta: {
        origin: "derivedStats",
        name: "sta",
        labelShort: "WITCHER.Actor.DerStat.Sta",
    },
    resolve: {
        origin: "derivedStats",
        name: "resolve",
        labelShort: "WITCHER.Actor.DerStat.Resolve",
    },
    focus: {
        origin: "derivedStats",
        name: "focus",
        labelShort: "WITCHER.Actor.DerStat.Focus",
    },
    vigor: {
        origin: "derivedStats",
        name: "vigor",
        labelShort: "WITCHER.Actor.DerStat.Vigor",
    },

    reputation: {
        origin: ""
    }
}

//Skills
WITCHER.meleeSkills = ["brawling", "melee", "smallblades", "staffspear", "swordsmanship"]
WITCHER.rangedSkills = ["athletics", "archery", "crossbow"]
WITCHER.magicSkills = ["spellcast", "ritcraft", "hexweave"]
WITCHER.verbalCombatSkills = ["charisma", "persuasion", "seduction", "leadership", "deceit", "socialetq", "intimidation"]
WITCHER.empatheticVerbalCombatSkills = ["charisma", "persuasion", "seduction", "leadership", "deceit", "socialetq"]

WITCHER.skillGroups = {
    allSkills: {
        label: "WITCHER.Skills.SkillGroups.allSkills",
        name: "allSkills",
    },
    meleeSkills: {
        label: "WITCHER.Skills.SkillGroups.meleeSkills",
        name: "meleeSkills",
    },
    rangedSkills: {
        label: "WITCHER.Skills.SkillGroups.rangedSkills",
        name: "rangedSkills",
    },
    magicSkills: {
        label: "WITCHER.Skills.SkillGroups.magicSkills",
        name: "magicSkills",
    },
    verbalCombatSkills: {
        label: "WITCHER.Skills.SkillGroups.verbalCombatSkills",
        name: "verbalCombatSkills",
    },
    empatheticVerbalCombatSkills: {
        label: "WITCHER.Skills.SkillGroups.empatheticVerbalCombatSkills",
        name: "empatheticVerbalCombatSkills",
    },
}

WITCHER.skillMap = {
    awareness: {
        attribute: WITCHER.statMap.int,
        label: "WITCHER.SkIntAwareness",
        name: "awareness",
    },
    business: {
        attribute: WITCHER.statMap.int,
        label: "WITCHER.SkIntBusiness",
        name: "business",
    },
    deduction: {
        attribute: WITCHER.statMap.int,
        label: "WITCHER.SkIntDeduction",
        name: "deduction",
    },
    education: {
        attribute: WITCHER.statMap.int,
        label: "WITCHER.SkIntEducation",
        name: "education",
    },
    commonsp: {
        attribute: WITCHER.statMap.int,
        label: "WITCHER.SkIntCommonLable",
        name: "commonsp",
    },
    eldersp: {
        attribute: WITCHER.statMap.int,
        label: "WITCHER.SkIntElderLable",
        name: "eldersp",
    },
    dwarven: {
        attribute: WITCHER.statMap.int,
        label: "WITCHER.SkIntDwarvenLable",
        name: "dwarven",
    },
    monster: {
        attribute: WITCHER.statMap.int,
        label: "WITCHER.SkIntMonster",
        name: "monster",
    },
    socialetq: {
        attribute: WITCHER.statMap.int,
        label: "WITCHER.SkIntSocialEt",
        name: "socialetq",
    },
    streetwise: {
        attribute: WITCHER.statMap.int,
        label: "WITCHER.SkIntStreet",
        name: "streetwise",
    },
    tactics: {
        attribute: WITCHER.statMap.int,
        label: "WITCHER.SkIntTacticsLable",
        name: "tactics",
    },
    teaching: {
        attribute: WITCHER.statMap.int,
        label: "WITCHER.SkIntTeaching",
        name: "teaching",
    },
    wilderness: {
        attribute: WITCHER.statMap.int,
        label: "WITCHER.SkIntWilderness",
        name: "wilderness",
    },

    brawling: {
        attribute: WITCHER.statMap.ref,
        label: "WITCHER.SkRefBrawling",
        name: "brawling",
    },
    dodge: {
        attribute: WITCHER.statMap.ref,
        label: "WITCHER.SkRefDodge",
        name: "dodge",
    },
    melee: {
        attribute: WITCHER.statMap.ref,
        label: "WITCHER.SkRefMelee",
        name: "melee",
    },
    riding: {
        attribute: WITCHER.statMap.ref,
        label: "WITCHER.SkRefRiding",
        name: "riding",
    },
    sailing: {
        attribute: WITCHER.statMap.ref,
        label: "WITCHER.SkRefSailing",
        name: "sailing",
    },
    smallblades: {
        attribute: WITCHER.statMap.ref,
        label: "WITCHER.SkRefSmall",
        name: "smallblades",
    },
    staffspear: {
        attribute: WITCHER.statMap.ref,
        label: "WITCHER.SkRefStaff",
        name: "staffspear",
    },
    swordsmanship: {
        attribute: WITCHER.statMap.ref,
        label: "WITCHER.SkRefSwordsmanship",
        name: "swordsmanship",
    },

    courage: {
        attribute: WITCHER.statMap.will,
        label: "WITCHER.SkWillCourage",
        name: "courage",
    },
    hexweave: {
        attribute: WITCHER.statMap.will,
        label: "WITCHER.SkWillHexLable",
        name: "hexweave",
    },
    intimidation: {
        attribute: WITCHER.statMap.will,
        label: "WITCHER.SkWillIntim",
        name: "intimidation",
    },
    spellcast: {
        attribute: WITCHER.statMap.will,
        label: "WITCHER.SkWillSpellcastLable",
        name: "spellcast",
    },
    resistmagic: {
        attribute: WITCHER.statMap.will,
        label: "WITCHER.SkWillResistMagLable",
        name: "resistmagic",
    },
    resistcoerc: {
        attribute: WITCHER.statMap.will,
        label: "WITCHER.SkWillResistCoer",
        name: "resistcoerc",
    },
    ritcraft: {
        attribute: WITCHER.statMap.will,
        label: "WITCHER.SkWillRitCraftLable",
        name: "ritcraft",
    },

    archery: {
        attribute: WITCHER.statMap.dex,
        label: "WITCHER.SkDexArchery",
        name: "archery",
    },
    athletics: {
        attribute: WITCHER.statMap.dex,
        label: "WITCHER.SkDexAthletics",
        name: "athletics",
    },
    crossbow: {
        attribute: WITCHER.statMap.dex,
        label: "WITCHER.SkDexCrossbow",
        name: "crossbow",
    },
    sleight: {
        attribute: WITCHER.statMap.dex,
        label: "WITCHER.SkDexSleight",
        name: "sleight",
    },
    stealth: {
        attribute: WITCHER.statMap.dex,
        label: "WITCHER.SkDexStealth",
        name: "stealth",
    },

    alchemy: {
        attribute: WITCHER.statMap.cra,
        label: "WITCHER.SkCraAlchemyLable",
        name: "alchemy",
    },
    crafting: {
        attribute: WITCHER.statMap.cra,
        label: "WITCHER.SkCraCraftingLable",
        name: "crafting",
    },
    disguise: {
        attribute: WITCHER.statMap.cra,
        label: "WITCHER.SkCraDisguise",
        name: "disguise",
    },
    firstaid: {
        attribute: WITCHER.statMap.cra,
        label: "WITCHER.SkCraAid",
        name: "firstaid",
    },
    forgery: {
        attribute: WITCHER.statMap.cra,
        label: "WITCHER.SkCraForge",
        name: "forgery",
    },
    picklock: {
        attribute: WITCHER.statMap.cra,
        label: "WITCHER.SkCraPick",
        name: "picklock",
    },
    trapcraft: {
        attribute: WITCHER.statMap.cra,
        label: "WITCHER.SkCraTrapCraftLable",
        name: "trapcraft",
    },

    physique: {
        attribute: WITCHER.statMap.body,
        label: "WITCHER.SkBodyPhys",
        name: "physique",
    },
    endurance: {
        attribute: WITCHER.statMap.body,
        label: "WITCHER.SkBodyEnd",
        name: "endurance",
    },

    charisma: {
        attribute: WITCHER.statMap.emp,
        label: "WITCHER.SkEmpCharisma",
        name: "charisma",
    },
    deceit: {
        attribute: WITCHER.statMap.emp,
        label: "WITCHER.SkEmpDeceit",
        name: "deceit",
    },
    finearts: {
        attribute: WITCHER.statMap.emp,
        label: "WITCHER.SkEmpArts",
        name: "finearts",
    },
    gambling: {
        attribute: WITCHER.statMap.emp,
        label: "WITCHER.SkEmpGambling",
        name: "gambling",
    },
    grooming: {
        attribute: WITCHER.statMap.emp,
        label: "WITCHER.SkEmpGrooming",
        name: "grooming",
    },
    perception: {
        attribute: WITCHER.statMap.emp,
        label: "WITCHER.SkEmpHumanPerc",
        name: "perception",
    },
    leadership: {
        attribute: WITCHER.statMap.emp,
        label: "WITCHER.SkEmpLeadership",
        name: "leadership",
    },
    persuasion: {
        attribute: WITCHER.statMap.emp,
        label: "WITCHER.SkEmpPersuasion",
        name: "persuasion",
    },
    performance: {
        attribute: WITCHER.statMap.emp,
        label: "WITCHER.SkEmpPerformance",
        name: "performance",
    },
    seduction: {
        attribute: WITCHER.statMap.emp,
        label: "WITCHER.SkEmpSeduction",
        name: "seduction",
    },
}

//Character info
WITCHER.homelands = {
    other: "WITCHER.background.other",
    aedirn: "WITCHER.Homelands.aedirn",
    angren: "WITCHER.Homelands.angren",
    cidaris: "WITCHER.Homelands.cidaris",
    cintra: "WITCHER.Homelands.cintra",
    dolblathanna: "WITCHER.Homelands.dolblathanna",
    ebbing: "WITCHER.Homelands.ebbing",
    etolia: "WITCHER.Homelands.etolia",
    gemmeria: "WITCHER.Homelands.gemmeria",
    gheso: "WITCHER.Homelands.gheso",
    kaedwen: "WITCHER.Homelands.kaedwen",
    kovir: "WITCHER.Homelands.kovir",
    lyria: "WITCHER.Homelands.lyria",
    maecht: "WITCHER.Homelands.maecht",
    magturga: "WITCHER.Homelands.magturga",
    mahakam: "WITCHER.Homelands.mahakam",
    mettina: "WITCHER.Homelands.mettina",
    nazair: "WITCHER.Homelands.nazair",
    nilfgaard: "WITCHER.Homelands.nilfgaard",
    poviss: "WITCHER.Homelands.poviss",
    redania: "WITCHER.Homelands.redania",
    rivia: "WITCHER.Homelands.rivia",
    skellige: "WITCHER.Homelands.skellige",
    temeria: "WITCHER.Homelands.temeria",
    verden: "WITCHER.Homelands.verden",
    vicovaro: "WITCHER.Homelands.vicovaro"
}

WITCHER.socialStanding = {
    equal: "WITCHER.socialStanding.equal",
    tolerated: "WITCHER.socialStanding.tolerated",
    hated: "WITCHER.socialStanding.hated",
    feared: "WITCHER.socialStanding.feared",
    toleratedFeared: "WITCHER.socialStanding.toleratedFeared",
    hatedFeared: "WITCHER.socialStanding.hatedFeared",
}

//Items
WITCHER.substanceTypes = {
    vitriol: "WITCHER.Inventory.Vitriol",
    rebis: "WITCHER.Inventory.Rebis",
    aether: "WITCHER.Inventory.Aether",
    quebrith: "WITCHER.Inventory.Quebrith",
    hydragenum: "WITCHER.Inventory.Hydragenum",
    vermilion: "WITCHER.Inventory.Vermilion",
    sol: "WITCHER.Inventory.Sol",
    caelum: "WITCHER.Inventory.Caelum",
    fulgur: "WITCHER.Inventory.Fulgur",
}

WITCHER.Availability = {
    Everywhere: "WITCHER.Item.AvailabilityEverywhere",
    Common: "WITCHER.Item.AvailabilityCommon",
    Poor: "WITCHER.Item.AvailabilityPoor",
    Rare: "WITCHER.Item.AvailabilityRare",
}

WITCHER.Concealment = {
    T: "WITCHER.Item.Tiny",
    S: "WITCHER.Item.Small",
    L: "WITCHER.Item.Large",
    NA: "WITCHER.Item.CantHide",
}

WITCHER.craftingLevels = {
    novice: "WITCHER.Diagram.Novice",
    journeyman: "WITCHER.Diagram.Journeyman",
    master: "WITCHER.Diagram.Master",
    "grand-master": "WITCHER.Diagram.GrandMaster",
    witcher: "WITCHER.Diagram.Witcher",
}

WITCHER.weapon = {
    hands: {
        none: "WITCHER.Weapon.Hands.none",
        left: "WITCHER.Weapon.Hands.left",
        right: "WITCHER.Weapon.Hands.right",
        both: "WITCHER.Weapon.Hands.both"
    }
}

WITCHER.spells = {
    Witcher: {
        skill: WITCHER.skillMap.spellcast,
    },
    Invocations: {
        skill: WITCHER.skillMap.spellcast,
    },
    Spells: {
        skill: WITCHER.skillMap.spellcast,
    },
    Rituals: {
        skill: WITCHER.skillMap.ritcraft,
    },
    Hexes: {
        skill: WITCHER.skillMap.hexweave,
    },
}


//Monster
WITCHER.MonsterTypes = {
    Humanoid: "WITCHER.Monster.Type.Humanoid",
    Necrophage: "WITCHER.Monster.Type.Necrophage",
    Specter: "WITCHER.Monster.Type.Specter",
    Beast: "WITCHER.Monster.Type.Beast",
    CursedOne: "WITCHER.Monster.Type.CursedOne",
    Hybrid: "WITCHER.Monster.Type.Hybrid",
    Insectoid: "WITCHER.Monster.Type.Insectoid",
    Elementa: "WITCHER.Monster.Type.Elementa",
    Relict: "WITCHER.Monster.Type.Relict",
    Ogroid: "WITCHER.Monster.Type.Ogroid",
    Draconid: "WITCHER.Monster.Type.Draconid",
    Vampire: "WITCHER.Monster.Type.Vampire",
}

WITCHER.monsterDifficulty = {
    easy: "WITCHER.Monster.Easy",
    medium: "WITCHER.Monster.Normal",
    hard: "WITCHER.Monster.Hard",
    exceptional: "WITCHER.Monster.Exceptional",
}

WITCHER.monsterComplexity = {
    simple: "WITCHER.Monster.Simple",
    complex: "WITCHER.Monster.Complex",
    difficult: "WITCHER.Monster.Difficult",
}


//Combat
WITCHER.location = {
    head: "WITCHER.Location.Head",
    torso: "WITCHER.Location.Torso",
    rightArm: "WITCHER.Location.rightArm",
    leftArm: "WITCHER.Location.leftArm",
    rightLeg: "WITCHER.Location.rightLeg",
    leftLeg: "WITCHER.Location.leftLeg",
}

WITCHER.Crit = {
    crackedJaw: {
        label: "WITCHER.CritWound.Name.SimpleCrackedJaw",
        description: "WITCHER.CritWound.SimpleCrackedJaw",
        location: ["head"],
        severity: "simple",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.SimpleCrackedJaw.None",
                stats: [],
                derived: [],
                skills: [
                    {
                        skillgroup: "magicSkills",
                        modifier: "-2"
                    },
                    {
                        skillgroup: "verbalCombatSkills",
                        modifier: "-2"
                    }
                ]
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.SimpleCrackedJaw.Stabilized",
                stats: [],
                derived: [],
                skills: [
                    {
                        skillgroup: "magicSkills",
                        modifier: "-1"
                    },
                    {
                        skillgroup: "verbalCombatSkills",
                        modifier: "-1"
                    }
                ]
            },
            treated: {
                description: "WITCHER.CritWound.Mod.SimpleCrackedJaw.Treated",
                stats: [],
                derived: [],
                skills: [
                    {
                        skillgroup: "magicSkills",
                        modifier: "-1"
                    },

                ]
            }
        }
    },
    disfiguringScar: {
        label: "WITCHER.CritWound.Name.SimpleDisfiguringScar",
        description: "WITCHER.CritWound.SimpleDisfiguringScar",
        location: ["head"],
        severity: "simple",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.SimpleDisfiguringScar.None",
                skills: [
                    {
                        skillgroup: "empatheticVerbalCombatSkills",
                        modifier: "-3"
                    }
                ]
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.SimpleDisfiguringScar.Stabilized",
                skills: [
                    {
                        skillgroup: "empatheticVerbalCombatSkills",
                        modifier: "-1"
                    }
                ]
            },
            treated: {
                description: "WITCHER.CritWound.Mod.SimpleDisfiguringScar.Treated",
                skills: [
                    {
                        skill: "seduction",
                        modifier: "-1"
                    }
                ]
            }
        }
    },
    crackedRibs: {
        label: "WITCHER.CritWound.Name.SimpleCrackedRibs",
        description: "WITCHER.CritWound.SimpleCrackedRibs",
        location: ["torso"],
        severity: "simple",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.SimpleCrackedRibs.None",
                stats: [
                    {
                        stat: "body",
                        modifier: "-2"
                    }
                ],
                derived: [],
                skills: []
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.SimpleCrackedRibs.Stabilized",
                stats: [
                    {
                        stat: "body",
                        modifier: "-1"
                    }
                ],
                derived: [],
                skills: []
            },
            treated: {
                description: "WITCHER.CritWound.Mod.SimpleCrackedRibs.Treated",
                stats: [],
                derived: [
                    {
                        derivedStat: "enc",
                        modifier: "-10"
                    }
                ],
                skills: []
            }
        }
    },
    foreignObject: {
        label: "WITCHER.CritWound.Name.SimpleForeignObject",
        description: "WITCHER.CritWound.SimpleForeignObject",
        location: ["torso"],
        severity: "simple",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.SimpleForeignObject.None",
                stats: [],
                derived: [],
                skills: []
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.SimpleForeignObject.Stabilized",
                stats: [],
                derived: [],
                skills: []
            },
            treated: {
                description: "WITCHER.CritWound.Mod.SimpleForeignObject.Treated",
                stats: [],
                derived: [],
                skills: []
            }
        }
    },
    sprainedArm: {
        label: "WITCHER.CritWound.Name.SimpleSprainedArm",
        description: "WITCHER.CritWound.SimpleSprainedArm",
        location: ["rightArm", "leftArm"],
        severity: "simple",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.SimpleSprainedArm.None",
                stats: [],
                derived: [],
                skills: []
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.SimpleSprainedArm.Stabilized",
                stats: [],
                derived: [],
                skills: []
            },
            treated: {
                description: "WITCHER.CritWound.Mod.SimpleSprainedArm.Treated",
                stats: [],
                derived: [],
                skills: [
                    {
                        skill: "physique",
                        modifier: "-1"
                    }
                ]
            }
        }
    },
    sprainedLeg: {
        label: "WITCHER.CritWound.Name.SimpleSprainedLeg",
        description: "WITCHER.CritWound.SimpleSprainedLeg",
        location: ["rightLeg", "leftLeg"],
        severity: "simple",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.SimpleSprainedLeg.None",
                stats: [
                    {
                        stat: "spd",
                        modifier: "-2"
                    }
                ],
                derived: [],
                skills: [
                    {
                        skill: "athletics",
                        modifier: "-2"
                    },
                    {
                        skill: "dodge",
                        modifier: "-2"
                    }
                ]
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.SimpleSprainedLeg.Stabilized",
                stats: [
                    {
                        stat: "spd",
                        modifier: "-1"
                    }
                ],
                derived: [],
                skills: [
                    {
                        skill: "athletics",
                        modifier: "-1"
                    },
                    {
                        skill: "dodge",
                        modifier: "-1"
                    }
                ]
            },
            treated: {
                description: "WITCHER.CritWound.Mod.SimpleSprainedLeg.Treated",
                stats: [
                    {
                        stat: "spd",
                        modifier: "-1"
                    }
                ],
                derived: [],
                skills: []
            }
        }
    },
    minorHeadWound: {
        label: "WITCHER.CritWound.Name.ComplexMinorHeadWound",
        description: "WITCHER.CritWound.ComplexMinorHeadWound",
        location: ["head"],
        severity: "complex",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.ComplexMinorHeadWound.None",
                stats: [
                    {
                        stat: "int",
                        modifier: "-1"
                    },
                    {
                        stat: "will",
                        modifier: "-1"
                    },
                ],
                derived: [
                    {
                        derivedStat: "stun",
                        modifier: "-1"
                    }
                ],
                skills: []
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.ComplexMinorHeadWound.Stabilized",
                stats: [
                    {
                        stat: "int",
                        modifier: "-1"
                    },
                    {
                        stat: "will",
                        modifier: "-1"
                    },
                ],
                derived: [],
                skills: []
            },
            treated: {
                description: "WITCHER.CritWound.Mod.ComplexMinorHeadWound.Treated",
                stats: [
                    {
                        stat: "will",
                        modifier: "-1"
                    },
                ],
                derived: [],
                skills: []
            }
        }
    },
    lostTeeth: {
        label: "WITCHER.CritWound.Name.ComplexLostTeeth",
        description: "WITCHER.CritWound.ComplexLostTeeth",
        location: ["head"],
        severity: "complex",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.ComplexLostTeeth.None",
                stats: [],
                derived: [],
                skills: [
                    {
                        skillgroup: "magicSkills",
                        modifier: "-3"
                    },
                    {
                        skillgroup: "verbalCombatSkills",
                        modifier: "-3"
                    }
                ]
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.ComplexLostTeeth.Stabilized",
                stats: [],
                derived: [],
                skills: [
                    {
                        skillgroup: "magicSkills",
                        modifier: "-2"
                    },
                    {
                        skillgroup: "verbalCombatSkills",
                        modifier: "-2"
                    }
                ]
            },
            treated: {
                description: "WITCHER.CritWound.Mod.ComplexLostTeeth.Treated",
                stats: [],
                derived: [],
                skills: [
                    {
                        skillgroup: "magicSkills",
                        modifier: "-1"
                    },
                    {
                        skillgroup: "verbalCombatSkills",
                        modifier: "-1"
                    }
                ]
            }
        }
    },
    rupturedSpleen: {
        label: "WITCHER.CritWound.Name.ComplexRupturedSpleen",
        description: "WITCHER.CritWound.ComplexRupturedSpleen",
        location: ["torso"],
        severity: "complex",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.ComplexRupturedSpleen.None",
                stats: [],
                derived: [],
                skills: []
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.ComplexRupturedSpleen.Stabilized",
                stats: [],
                derived: [],
                skills: []
            },
            treated: {
                description: "WITCHER.CritWound.Mod.ComplexRupturedSpleen.Treated",
                stats: [],
                derived: [
                    {
                        derivedStat: "stun",
                        modifier: "-2"
                    }
                ],
                skills: []
            }
        }
    },
    brokenRibs: {
        label: "WITCHER.CritWound.Name.ComplexBrokenRibs",
        description: "WITCHER.CritWound.ComplexBrokenRibs",
        location: ["torso"],
        severity: "complex",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.ComplexBrokenRibs.None",
                stats: [
                    {
                        stat: "body",
                        modifier: "-2"
                    },
                    {
                        stat: "ref",
                        modifier: "-1"
                    },
                    {
                        stat: "dex",
                        modifier: "-1"
                    }
                ],
                derived: [],
                skills: []
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.ComplexBrokenRibs.Stabilized",
                stats: [
                    {
                        stat: "body",
                        modifier: "-1"
                    },
                    {
                        stat: "ref",
                        modifier: "-1"
                    }
                ],
                derived: [],
                skills: []
            },
            treated: {
                description: "WITCHER.CritWound.Mod.ComplexBrokenRibs.Treated",
                stats: [
                    {
                        stat: "body",
                        modifier: "-1"
                    }
                ],
                derived: [],
                skills: []
            }
        }
    },
    fracturedArm: {
        label: "WITCHER.CritWound.Name.ComplexFracturedArm",
        description: "WITCHER.CritWound.ComplexFracturedArm",
        location: ["rightArm", "leftArm"],
        severity: "complex",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.ComplexFracturedArm.None",
                stats: [],
                derived: [],
                skills: []
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.ComplexFracturedArm.Stabilized",
                stats: [],
                derived: [],
                skills: []
            },
            treated: {
                description: "WITCHER.CritWound.Mod.ComplexFracturedArm.Treated",
                stats: [],
                derived: [],
                skills: []
            }
        }
    },
    fracturedLeg: {
        label: "WITCHER.CritWound.Name.ComplexFracturedLeg",
        description: "WITCHER.CritWound.ComplexFracturedLeg",
        location: ["rightLeg", "leftLeg"],
        severity: "complex",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.ComplexFracturedLeg.None",
                stats: [
                    {
                        stat: "spd",
                        modifier: "-3"
                    }
                ],
                derived: [],
                skills: [
                    {
                        skill: "athletics",
                        modifier: "-3"
                    },
                    {
                        skill: "dodge",
                        modifier: "-3"
                    }
                ]
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.ComplexFracturedLeg.Stabilized",
                stats: [
                    {
                        stat: "spd",
                        modifier: "-2"
                    }
                ],
                derived: [],
                skills: [
                    {
                        skill: "athletics",
                        modifier: "-2"
                    },
                    {
                        skill: "dodge",
                        modifier: "-2"
                    }
                ]
            },
            treated: {
                description: "WITCHER.CritWound.Mod.ComplexFracturedLeg.Treated",
                stats: [
                    {
                        stat: "spd",
                        modifier: "-1"
                    }
                ],
                derived: [],
                skills: [
                    {
                        skill: "athletics",
                        modifier: "-1"
                    },
                    {
                        skill: "dodge",
                        modifier: "-1"
                    }
                ]
            }
        }
    },
    skullFracture: {
        label: "WITCHER.CritWound.Name.DifficultSkullFracture",
        description: "WITCHER.CritWound.DifficultSkullFracture",
        location: ["head"],
        severity: "difficult",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.DifficultSkullFracture.None",
                stats: [
                    {
                        stat: "int",
                        modifier: "-1"
                    },
                    {
                        stat: "dex",
                        modifier: "-1"
                    },
                ],
                derived: [],
                skills: []
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.DifficultSkullFracture.Stabilized",
                stats: [
                    {
                        stat: "int",
                        modifier: "-1"
                    },
                    {
                        stat: "dex",
                        modifier: "-1"
                    },
                ],
                derived: [],
                skills: []
            },
            treated: {
                description: "WITCHER.CritWound.Mod.DifficultSkullFracture.Treated",
                stats: [],
                derived: [],
                skills: []
            }
        }
    },
    concussion: {
        label: "WITCHER.CritWound.Name.DifficultConcussion",
        description: "WITCHER.CritWound.DifficultConcussion",
        location: ["head"],
        severity: "difficult",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.DifficultConcussion.None",
                stats: [
                    {
                        stat: "int",
                        modifier: "-2"
                    },
                    {
                        stat: "ref",
                        modifier: "-2"
                    },
                    {
                        stat: "dex",
                        modifier: "-2"
                    },
                ],
                derived: [],
                skills: []
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.DifficultConcussion.Stabilized",
                stats: [
                    {
                        stat: "int",
                        modifier: "-1"
                    },
                    {
                        stat: "ref",
                        modifier: "-1"
                    },
                    {
                        stat: "dex",
                        modifier: "-1"
                    },
                ],
                derived: [],
                skills: []
            },
            treated: {
                description: "WITCHER.CritWound.Mod.DifficultConcussion.Treated",
                stats: [
                    {
                        stat: "int",
                        modifier: "-1"
                    },
                    {
                        stat: "dex",
                        modifier: "-1"
                    },
                ],
                derived: [],
                skills: []
            }
        }
    },
    tornStomach: {
        label: "WITCHER.CritWound.Name.DifficultTornStomach",
        description: "WITCHER.CritWound.DifficultTornStomach",
        location: ["torso"],
        severity: "difficult",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.DifficultTornStomach.None",
                stats: [],
                derived: [],
                skills: [
                    {
                        skill: "all",
                        modifier: "-2"
                    },
                ]
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.DifficultTornStomach.Stabilized",
                stats: [],
                derived: [],
                skills: [
                    {
                        skill: "all",
                        modifier: "-2"
                    },
                ]
            },
            treated: {
                description: "WITCHER.CritWound.Mod.DifficultTornStomach.Treated",
                stats: [],
                derived: [],
                skills: [
                    {
                        skill: "all",
                        modifier: "-1"
                    },
                ]
            }
        }
    },
    suckingChestWound: {
        label: "WITCHER.CritWound.Name.DifficultSuckingChestWound",
        description: "WITCHER.CritWound.DifficultSuckingChestWound",
        location: ["torso"],
        severity: "difficult",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.DifficultSuckingChestWound.None",
                stats: [
                    {
                        stat: "body",
                        modifier: "-3"
                    },
                    {
                        stat: "spd",
                        modifier: "-3"
                    }
                ],
                derived: [],
                skills: []
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.DifficultSuckingChestWound.Stabilized",
                stats: [
                    {
                        stat: "body",
                        modifier: "-2"
                    },
                    {
                        stat: "spd",
                        modifier: "-2"
                    }
                ],
                derived: [],
                skills: []
            },
            treated: {
                description: "WITCHER.CritWound.Mod.DifficultSuckingChestWound.Treated",
                stats: [
                    {
                        stat: "body",
                        modifier: "-1"
                    },
                    {
                        stat: "spd",
                        modifier: "-1"
                    }
                ],
                derived: [],
                skills: []
            }
        }
    },
    compoundArmFracture: {
        label: "WITCHER.CritWound.Name.DifficultCompoundArmFracture",
        description: "WITCHER.CritWound.DifficultCompoundArmFracture",
        location: ["rightArm", "leftArm"],
        severity: "difficult",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.DifficultCompoundArmFracture.None",
                stats: [],
                derived: [],
                skills: []
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.DifficultCompoundArmFracture.Stabilized",
                stats: [],
                derived: [],
                skills: []
            },
            treated: {
                description: "WITCHER.CritWound.Mod.DifficultCompoundArmFracture.Treated",
                stats: [],
                derived: [],
                skills: []
            }
        }
    },
    compoundLegFracture: {
        label: "WITCHER.CritWound.Name.DifficultCompoundLegFracture",
        description: "WITCHER.CritWound.DifficultCompoundLegFracture",
        location: ["rightLeg", "leftLeg"],
        severity: "difficult",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.DifficultCompoundLegFracture.None",
                stats: [
                    {
                        stat: "spd",
                        modifier: "/4"
                    }
                ],
                derived: [],
                skills: [
                    {
                        skill: "athletics",
                        modifier: "/4"
                    },
                    {
                        skill: "dodge",
                        modifier: "/4"
                    }
                ]
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.DifficultCompoundLegFracture.Stabilized",
                stats: [
                    {
                        stat: "spd",
                        modifier: "/2"
                    }
                ],
                derived: [],
                skills: [
                    {
                        skill: "athletics",
                        modifier: "/2"
                    },
                    {
                        skill: "dodge",
                        modifier: "/2"
                    }
                ]
            },
            treated: {
                description: "WITCHER.CritWound.Mod.DifficultCompoundLegFracture.Treated",
                stats: [
                    {
                        stat: "spd",
                        modifier: "-2"
                    }
                ],
                derived: [],
                skills: [
                    {
                        skill: "athletics",
                        modifier: "-2"
                    },
                    {
                        skill: "dodge",
                        modifier: "-2"
                    }
                ]
            }
        }
    },
    decapitated: {
        label: "WITCHER.CritWound.Name.DeadlyDecapitated",
        description: "WITCHER.CritWound.DeadlyDecapitated",
        location: ["head"],
        severity: "deadly",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.DeadlyDecapitated.None",
                stats: [],
                derived: [],
                skills: []
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.DeadlyDecapitated.Stabilized",
                stats: [],
                derived: [],
                skills: []
            },
            treated: {
                description: "WITCHER.CritWound.Mod.DeadlyDecapitated.Treated",
                stats: [],
                derived: [],
                skills: []
            }
        }
    },
    damagedEye: {
        label: "WITCHER.CritWound.Name.DeadlyDamagedEye",
        description: "WITCHER.CritWound.DeadlyDamagedEye",
        location: ["head"],
        severity: "deadly",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.DeadlyDamagedEye.None",
                stats: [
                    {
                        stat: "dex",
                        modifier: "-4"
                    }
                ],
                derived: [],
                skills: [
                    {
                        skill: "awareness",
                        modifier: "-5"
                    }
                ]
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.DeadlyDamagedEye.Stabilized",
                stats: [
                    {
                        stat: "dex",
                        modifier: "-2"
                    }
                ],
                derived: [],
                skills: [
                    {
                        skill: "awareness",
                        modifier: "-3"
                    }
                ]
            },
            treated: {
                description: "WITCHER.CritWound.Mod.DeadlyDamagedEye.Treated",
                stats: [
                    {
                        stat: "dex",
                        modifier: "-1"
                    }
                ],
                derived: [],
                skills: [
                    {
                        skill: "awareness",
                        modifier: "-1"
                    }
                ]
            }
        }
    },
    heartDamage: {
        label: "WITCHER.CritWound.Name.DeadlyHeartDamage",
        description: "WITCHER.CritWound.DeadlyHeartDamage",
        location: ["torso"],
        severity: "deadly",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.DeadlyHeartDamage.None",
                stats: [
                    {
                        stat: "body",
                        modifier: "/4"
                    },
                    {
                        stat: "spd",
                        modifier: "/4"
                    }
                ],
                derived: [
                    {
                        derivedStat: "sta",
                        modifier: "/4"
                    }
                ],
                skills: []
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.DeadlyHeartDamage.Stabilized",
                stats: [
                    {
                        stat: "body",
                        modifier: "/2"
                    },
                    {
                        stat: "spd",
                        modifier: "/2"
                    }
                ],
                derived: [
                    {
                        derivedStat: "sta",
                        modifier: "/2"
                    }
                ],
                skills: []
            },
            treated: {
                description: "WITCHER.CritWound.Mod.DeadlyHeartDamage.Treated",
                stats: [],
                derived: [],
                skills: []
            }
        }
    },
    septicShock: {
        label: "WITCHER.CritWound.Name.DeadlySepticShock",
        description: "WITCHER.CritWound.DeadlySepticShock",
        location: ["torso"],
        severity: "deadly",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.DeadlySepticShock.None",
                stats: [
                    {
                        stat: "int",
                        modifier: "-3"
                    },
                    {
                        stat: "will",
                        modifier: "-3"
                    },
                    {
                        stat: "ref",
                        modifier: "-3"
                    },
                    {
                        stat: "dex",
                        modifier: "-3"
                    },
                ],
                derived: [
                    {
                        derivedStat: "sta",
                        modifier: "/4"
                    }
                ],
                skills: []
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.DeadlySepticShock.Stabilized",
                stats: [
                    {
                        stat: "int",
                        modifier: "-1"
                    },
                    {
                        stat: "will",
                        modifier: "-1"
                    },
                    {
                        stat: "ref",
                        modifier: "-1"
                    },
                    {
                        stat: "dex",
                        modifier: "-1"
                    },
                ],
                derived: [
                    {
                        derivedStat: "sta",
                        modifier: "/2"
                    }
                ],
                skills: []
            },
            treated: {
                description: "WITCHER.CritWound.Mod.DeadlySepticShock.Treated",
                stats: [],
                derived: [
                    {
                        derivedStat: "sta",
                        modifier: "-5"
                    }
                ],
                skills: []
            }
        }
    },
    dismemberedArm: {
        label: "WITCHER.CritWound.Name.DeadlyDismemberedArm",
        description: "WITCHER.CritWound.DeadlyDismemberedArm",
        location: ["rightArm", "leftArm"],
        severity: "deadly",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.DeadlyDismemberedArm.None",
                stats: [],
                derived: [],
                skills: []
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.DeadlyDismemberedArm.Stabilized",
                stats: [],
                derived: [],
                skills: []
            },
            treated: {
                description: "WITCHER.CritWound.Mod.DeadlyDismemberedArm.Treated",
                stats: [],
                derived: [],
                skills: []
            }
        }
    },
    dismemberedLeg: {
        label: "WITCHER.CritWound.Name.DeadlyDismemberedLeg",
        description: "WITCHER.CritWound.DeadlyDismemberedLeg",
        location: ["rightLeg", "leftLeg"],
        severity: "deadly",
        effect: {
            none: {
                description: "WITCHER.CritWound.Mod.DeadlyDismemberedLeg.None",
                stats: [
                    {
                        stat: "spd",
                        modifier: "/4"
                    }
                ],
                derived: [],
                skills: [
                    {
                        skill: "athletics",
                        modifier: "/4"
                    },
                    {
                        skill: "dodge",
                        modifier: "/4"
                    }
                ]
            },
            stabilized: {
                description: "WITCHER.CritWound.Mod.DeadlyDismemberedLeg.Stabilized",
                stats: [
                    {
                        stat: "spd",
                        modifier: "/4"
                    }
                ],
                derived: [],
                skills: [
                    {
                        skill: "athletics",
                        modifier: "/4"
                    },
                    {
                        skill: "dodge",
                        modifier: "/4"
                    }
                ]
            },
            treated: {
                description: "WITCHER.CritWound.Mod.DeadlyDismemberedLeg.Treated",
                stats: [
                    {
                        stat: "spd",
                        modifier: "/4"
                    }
                ],
                derived: [],
                skills: [
                    {
                        skill: "athletics",
                        modifier: "/4"
                    },
                    {
                        skill: "dodge",
                        modifier: "/4"
                    }
                ]
            }
        }
    }
}

WITCHER.CritGravity = {
    simple: "WITCHER.CritWound.Simple",
    complex: "WITCHER.CritWound.Complex",
    difficult: "WITCHER.CritWound.Difficult",
    deadly: "WITCHER.CritWound.Deadly",
}

WITCHER.CritMod = {
    none: "WITCHER.CritWound.None",
    stabilized: "WITCHER.CritWound.Stabilized",
    treated: "WITCHER.CritWound.Treated",
}

WITCHER.verbalCombat = {

    EmpatheticAttacks: {
        Seduce: {
            name: "WITCHER.verbalCombat.Seduce",
            skill: WITCHER.skillMap.seduction,
            baseDmg: '1d6',
            dmgStat: WITCHER.statMap.emp,
            effect: "WITCHER.verbalCombat.SeduceEffect"
        },
        Persuade: {
            name: "WITCHER.verbalCombat.Persuade",
            skill: WITCHER.skillMap.persuasion,
            baseDmg: '1d6/2',
            dmgStat: WITCHER.statMap.emp,
            effect: "WITCHER.verbalCombat.PersuadeEffect"
        },
        Appeal: {
            name: "WITCHER.verbalCombat.Appeal",
            skill: WITCHER.skillMap.leadership,
            baseDmg: '1d10',
            dmgStat: WITCHER.statMap.emp,
            effect: "WITCHER.verbalCombat.AppealEffect"
        },
        Befriend: {
            name: "WITCHER.verbalCombat.Befriend",
            skill: WITCHER.skillMap.charisma,
            baseDmg: '1d6',
            dmgStat: WITCHER.statMap.emp,
            effect: "WITCHER.verbalCombat.BefriendEffect"
        },
    },

    AntagonisticAttacks: {
        Deceive: {
            name: "WITCHER.verbalCombat.Deceive",
            skill: WITCHER.skillMap.deceit,
            baseDmg: '1d6',
            dmgStat: WITCHER.statMap.int,
            effect: "WITCHER.verbalCombat.DeceiveEffect"
        },
        Ridicule: {
            name: "WITCHER.verbalCombat.Ridicule",
            skill: WITCHER.skillMap.socialetq,
            baseDmg: '1d6',
            dmgStat: WITCHER.statMap.will,
            effect: "WITCHER.verbalCombat.RidiculeEffect"
        },
        Intimidate: {
            name: "WITCHER.verbalCombat.Intimidate",
            skill: WITCHER.skillMap.intimidation,
            baseDmg: '1d10',
            dmgStat: WITCHER.statMap.will,
            effect: "WITCHER.verbalCombat.IntimidateEffect"
        },
    },


    Defenses: {
        Ignore: {
            name: "WITCHER.verbalCombat.Ignore",
            skill: WITCHER.skillMap.resistcoerc,
            baseDmg: '1d10',
            dmgStat: WITCHER.statMap.emp,
            effect: "WITCHER.verbalCombat.None"
        },
        Counterargue: {
            name: "WITCHER.verbalCombat.Counterargue",
            effect: "WITCHER.verbalCombat.CounterargueEffect"
        },
        ChangeSubject: {
            name: "WITCHER.verbalCombat.ChangeSubject",
            skill: WITCHER.skillMap.persuasion,
            baseDmg: '1d6',
            dmgStat: WITCHER.statMap.int,
            effect: "WITCHER.verbalCombat.None"
        },
        Disengage: {
            name: "WITCHER.verbalCombat.Disengage",
            skill: WITCHER.skillMap.resistcoerc,
            effect: "WITCHER.verbalCombat.DisengageEffect"
        },
    },


    EmpatheticTools: {
        Romance: {
            name: "WITCHER.verbalCombat.Romance",
            skill: WITCHER.skillMap.charisma,
            effect: "WITCHER.verbalCombat.RomanceEffect"
        },
        Study: {
            name: "WITCHER.verbalCombat.Study",
            skill: WITCHER.skillMap.perception,
            effect: "WITCHER.verbalCombat.StudyEffect"
        },
    },

    AntagonisticTools: {
        ImplyPersuade: {
            name: "WITCHER.verbalCombat.ImplyPersuade",
            skill: WITCHER.skillMap.persuasion,
            effect: "WITCHER.verbalCombat.ImplyEffect"
        },
        ImplyDeceit: {
            name: "WITCHER.verbalCombat.ImplyDeceit",
            skill: WITCHER.skillMap.deceit,
            effect: "WITCHER.verbalCombat.ImplyEffect"
        },
        Bribe: {
            name: "WITCHER.verbalCombat.Bribe",
            skill: WITCHER.skillMap.gambling,
            effect: "WITCHER.verbalCombat.BribeEffect"
        },
    }
}


//Effects and Modifiers
WITCHER.statusEffects = [
    {
        id: 'healing',
        name: 'WITCHER.statusEffects.healing',
        img: 'icons/svg/regen.svg',
    },
    {
        id: 'buffed',
        name: 'WITCHER.statusEffects.buffed',
        img: 'icons/svg/upgrade.svg',
    },
    {
        id: 'fire',
        name: 'WITCHER.statusEffects.fire',
        img: 'icons/svg/fire.svg',
    },
    {
        id: 'stun',
        name: 'WITCHER.statusEffects.stun',
        img: 'icons/svg/daze.svg',
    },
    {
        id: 'poison',
        name: 'WITCHER.statusEffects.poison',
        img: 'icons/svg/poison.svg',
    },
    {
        id: 'disease',
        name: 'WITCHER.statusEffects.disease',
        img: 'icons/svg/biohazard.svg',
    },
    {
        id: 'prone',
        name: 'WITCHER.statusEffects.prone',
        img: 'icons/svg/falling.svg',
        changes: [
            {
                key: 'system.skills.ref.brawling.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
            {
                key: 'system.skills.ref.melee.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
            {
                key: 'system.skills.ref.smallblades.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
            {
                key: 'system.skills.ref.staffspear.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
            {
                key: 'system.skills.ref.swordsmanship.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
            {
                key: 'system.skills.dex.archery.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
            {
                key: 'system.skills.dex.crossbow.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
            {
                key: 'system.skills.ref.dodge.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
        ],
    },
    {
        id: 'bleed',
        name: 'WITCHER.statusEffects.bleed',
        img: 'icons/svg/blood.svg',
    },
    {
        id: 'freeze',
        name: 'WITCHER.statusEffects.freeze',
        img: 'icons/svg/frozen.svg',
        changes: [
            {
                key: 'system.stats.spd.max',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.stats.ref.max',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1,
            },
        ],
    },
    {
        id: 'staggered',
        name: 'WITCHER.statusEffects.staggered',
        img: 'icons/svg/sword.svg',
        changes: [
            {
                key: 'system.skills.ref.brawling.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
            {
                key: 'system.skills.ref.melee.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
            {
                key: 'system.skills.ref.smallblades.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
            {
                key: 'system.skills.ref.staffspear.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
            {
                key: 'system.skills.ref.swordsmanship.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
            {
                key: 'system.skills.dex.archery.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
            {
                key: 'system.skills.dex.crossbow.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
            {
                key: 'system.skills.ref.dodge.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
        ],
    },
    {
        id: 'intoxication',
        name: 'WITCHER.statusEffects.intoxication',
        img: 'icons/svg/tankard.svg',
        changes: [
            {
                key: 'system.stats.dex.max',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
            {
                key: 'system.stats.ref.max',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
            {
                key: 'system.stats.int.max',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2,
            },
            {
                key: 'system.skills.emp.seduction.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.skills.emp.persuasion.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.skills.emp.leadership.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.skills.emp.charisma.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.skills.emp.deceit.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.skills.int.socialetq.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.skills.will.intimidation.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.skills.will.resistcoerc.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.skills.emp.perception.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.skills.emp.gambling.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
        ],
    },
    {
        id: 'hallucination',
        name: 'WITCHER.statusEffects.hallucination',
        img: 'systems/TheWitcherTRPG/assets/images/statusEffects/spectre.svg',
    },
    {
        id: 'nausea',
        name: 'WITCHER.statusEffects.nausea',
        img: 'icons/svg/stoned.svg',
    },
    {
        id: 'suffocation',
        name: 'WITCHER.statusEffects.suffocation',
        img: 'icons/svg/silenced.svg',
    },
    {
        id: 'blinded',
        name: 'WITCHER.statusEffects.blinded',
        img: 'icons/svg/blind.svg',
        changes: [
            {
                key: 'system.skills.ref.brawling.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.skills.ref.melee.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.skills.ref.smallblades.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.skills.ref.staffspear.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.skills.ref.swordsmanship.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.skills.dex.archery.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.skills.dex.crossbow.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.skills.ref.dodge.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -3,
            },
            {
                key: 'system.skills.int.awareness.value',
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -5,
            },
        ],
    },
    {
        id: 'shielded',
        name: 'WITCHER.statusEffects.shielded',
        img: 'icons/svg/mage-shield.svg',
    },
    {
        id: 'invisible',
        name: 'WITCHER.statusEffects.invisible',
        img: 'icons/svg/invisible.svg',
    },
    {
        id: 'unconscious',
        name: 'WITCHER.statusEffects.unconscious',
        img: 'icons/svg/unconscious.svg',
    },
    {
        id: 'grappled',
        name: 'WITCHER.statusEffects.grappled',
        img: 'icons/svg/net.svg',
    },
    {
        id: 'flying',
        name: 'WITCHER.statusEffects.flying',
        img: 'icons/svg/wing.svg',
    },
    {
        id: 'frightened',
        name: 'WITCHER.statusEffects.frightened',
        img: 'icons/svg/terror.svg',
    },
    {
        id: 'aiming',
        name: 'WITCHER.statusEffects.aiming',
        img: 'icons/svg/target.svg',
    },
    {
        id: 'deaf',
        name: 'WITCHER.statusEffects.deaf',
        img: 'icons/svg/deaf.svg',
    },
    {
        id: 'reducedVision',
        name: 'WITCHER.statusEffects.reducedVision',
        img: 'systems/TheWitcherTRPG/assets/images/statusEffects/visored-helm.svg',
    },
    {
        id: 'holdAction',
        name: 'WITCHER.statusEffects.holdAction',
        img: 'systems/TheWitcherTRPG/assets/images/statusEffects/uncertainty.svg',
    },
    {
        id: 'dead',
        name: 'WITCHER.statusEffects.dead',
        img: 'icons/svg/skull.svg',
    },
]

WITCHER.armorEffects = [
    {
        id: 'reducedVision',
        name: 'WITCHER.statusEffects.reducedVision',
        refersStatusEffect: true,
    },
    {
        id: 'fire',
        name: 'WITCHER.armorEffects.fireResistance',
        refersStatusEffect: true,
        addsResistance: true,
    },
    {
        id: 'poison',
        name: 'WITCHER.armorEffects.poisonResistance',
        refersStatusEffect: true,
        addsResistance: true,
    },
    {
        id: 'bleed',
        name: 'WITCHER.armorEffects.bleedResistance',
        refersStatusEffect: true,
        addsResistance: true
    },
]

WITCHER.specialModifier = [
    {
        id: "wolf-strike",
        name: "WITCHER.globalModifier.specialEffect.wolfstrike",
        tags: ["attack", "strong"],
        formula: "+3"
    },
    {
        id: "viper-strike",
        name: "WITCHER.globalModifier.specialEffect.viperstrike",
        tags: ["attack", "joint"],
        formula: "+3"
    },
    {
        id: "melee-damage",
        name: "WITCHER.globalModifier.specialEffect.meleeDamage",
        tags: ["melee-damage"],
        formula: "+1"
    },
    {
        id: "manticore-parry",
        name: "WITCHER.globalModifier.specialEffect.manticoreparry",
        tags: ["parry"],
        additionalTags: ["shield"],
        formula: "+3"
    },
    {
        id: "manticore-parry-thrown",
        name: "WITCHER.globalModifier.specialEffect.manticoreparrythrown",
        tags: ["parrythrown"],
        additionalTags: ["shield"],
        formula: "+5"
    },
    {
        id: "armor-encumbarance",
        name: "WITCHER.globalModifier.specialEffect.armorEncumbarance",
        tags: ["armorencumbarance"],
        formula: "-1"
    },
    {
        id: "armored-caster",
        name: "WITCHER.globalModifier.specialEffect.armoredCaster",
        tags: ["magic-armorencumbarance"],
        formula: "+1"
    },

]