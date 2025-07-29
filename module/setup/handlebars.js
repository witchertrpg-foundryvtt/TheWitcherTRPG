export async function preloadHandlebarsTemplates() {
    const templatePath = [
        'systems/TheWitcherTRPG/templates/sheets/actor/character-sheet.hbs',
        'systems/TheWitcherTRPG/templates/sheets/actor/monster-sheet.hbs',
        'systems/TheWitcherTRPG/templates/sheets/actor/loot-sheet.hbs',

        'systems/TheWitcherTRPG/templates/partials/character-header.hbs',

        'systems/TheWitcherTRPG/templates/partials/character/tab-skills.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/skill-display.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/custom-skill-display.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-profession.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-background.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-inventory.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/substances.hbs',
        'systems/TheWitcherTRPG/templates/partials/character/tab-magic.hbs',
        'systems/TheWitcherTRPG/templates/sheets/actor/partials/character/tab-effects.hbs',

        'systems/TheWitcherTRPG/templates/sheets/actor/partials/character/inventory/tab-inventory-alchemical.hbs',
        'systems/TheWitcherTRPG/templates/sheets/actor/partials/character/inventory/tab-inventory-components.hbs',
        'systems/TheWitcherTRPG/templates/sheets/actor/partials/character/inventory/tab-inventory-weapons.hbs',
        'systems/TheWitcherTRPG/templates/sheets/actor/partials/character/inventory/tab-inventory-armors.hbs',
        'systems/TheWitcherTRPG/templates/sheets/actor/partials/character/inventory/tab-inventory-diagrams.hbs',
        'systems/TheWitcherTRPG/templates/sheets/actor/partials/character/inventory/tab-inventory-valuables.hbs',
        'systems/TheWitcherTRPG/templates/sheets/actor/partials/character/inventory/tab-inventory-mounts.hbs',
        'systems/TheWitcherTRPG/templates/sheets/actor/partials/character/inventory/tab-inventory-runes-glyphs.hbs',
        'systems/TheWitcherTRPG/templates/sheets/actor/partials/character/inventory/inventory-items-summary.hbs',

        'systems/TheWitcherTRPG/templates/sheets/actor/partials/character/tab-magic-spells.hbs',

        'systems/TheWitcherTRPG/templates/partials/crit-wounds-table.hbs',

        'systems/TheWitcherTRPG/templates/partials/monster/monster-skill-tab.hbs',
        'systems/TheWitcherTRPG/templates/partials/monster/monster-inventory-tab.hbs',
        'systems/TheWitcherTRPG/templates/partials/monster/monster-details-tab.hbs',
        'systems/TheWitcherTRPG/templates/partials/monster/monster-spell-tab.hbs',
        'systems/TheWitcherTRPG/templates/partials/monster/monster-skill-display.hbs',
        'systems/TheWitcherTRPG/templates/partials/monster/monster-custom-skill-display.hbs',
        'systems/TheWitcherTRPG/templates/partials/monster/monster-profession-skill-display.hbs',
        'systems/TheWitcherTRPG/templates/sheets/actor/configuration/partials/skillConfiguration.hbs',

        'systems/TheWitcherTRPG/templates/sheets/actor/partials/loot/loot-item-display.hbs',

        'systems/TheWitcherTRPG/templates/partials/item-header.hbs',
        'systems/TheWitcherTRPG/templates/partials/spell-header.hbs',
        'systems/TheWitcherTRPG/templates/partials/item-image.hbs',
        'systems/TheWitcherTRPG/templates/partials/associated-item.hbs',
        'systems/TheWitcherTRPG/templates/partials/associated-diagram.hbs',
        'systems/TheWitcherTRPG/templates/partials/effect-part.hbs',

        'systems/TheWitcherTRPG/templates/sheets/item/configuration/partials/attackOptionsPart.hbs',
        'systems/TheWitcherTRPG/templates/sheets/item/configuration/partials/profession/skillPathSkillPart.hbs',
        'systems/TheWitcherTRPG/templates/sheets/item/configuration/partials/profession/profAttackOptionsPart.hbs',

        'systems/TheWitcherTRPG/templates/sheets/investigation/mystery-sheet.hbs',
        'systems/TheWitcherTRPG/templates/sheets/investigation/partials/clue-display.hbs',
        'systems/TheWitcherTRPG/templates/sheets/investigation/partials/obstacle-display.hbs',

        'systems/TheWitcherTRPG/templates/dialog/verbal-combat.hbs',
        'systems/TheWitcherTRPG/templates/dialog/repair-dialog.hbs',

        'systems/TheWitcherTRPG/templates/chat/damage/damageToLocation.hbs',
        'systems/TheWitcherTRPG/templates/chat/item/repair.hbs',

        'systems/TheWitcherTRPG/templates/chat/item/partials/item-description/alchemicals.hbs',
        'systems/TheWitcherTRPG/templates/chat/item/partials/item-description/crafting-items.hbs',
        'systems/TheWitcherTRPG/templates/chat/item/partials/item-description/description.hbs',
        'systems/TheWitcherTRPG/templates/chat/item/partials/item-description/spell-description.hbs',
        'systems/TheWitcherTRPG/templates/chat/item/partials/item-description/tags.hbs',

        'systems/TheWitcherTRPG/templates/partials/components-list.hbs'
    ];
    return foundry.applications.handlebars.loadTemplates(templatePath);
}

export async function registerHandelbarHelpers() {
    Handlebars.registerHelper('getOwnedComponentCount', function (actor, componentName) {
        if (!actor) {
            console.warn(
                "'actor' parameter passed into getOwnedComponentCount is undefined. That might be a problem with one of the selected actors diagrams."
            );
            return 0;
        }
        let ownedComponent = actor.findNeededComponent(componentName);
        return ownedComponent.sum('quantity');
    });

    Handlebars.registerHelper('getSetting', function (setting) {
        return game.settings.get('TheWitcherTRPG', setting);
    });

    Handlebars.registerHelper('window', function (...props) {
        props.pop();
        return props.reduce((result, prop) => result[prop], window);
    });

    Handlebars.registerHelper('includes', function (csv, substr) {
        return csv
            .split(',')
            .map(v => v.trim())
            .includes(substr);
    });

    Handlebars.registerHelper('formatModLabel', function (statCurrent, statMax) {
        let calc = statCurrent - statMax;
        return calc;
    });

    Handlebars.registerHelper({
        eq: (v1, v2) => v1 === v2,
        ne: (v1, v2) => v1 !== v2,
        lt: (v1, v2) => v1 < v2,
        gt: (v1, v2) => v1 > v2,
        lte: (v1, v2) => v1 <= v2,
        gte: (v1, v2) => v1 >= v2,
        and() {
            return Array.prototype.every.call(arguments, Boolean);
        },
        or() {
            return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
        }
    });

    Handlebars.registerHelper('eachLimit', function (context, limit, options) {
        if (!context || typeof context !== 'object') return '';

        const keys = Object.keys(context);
        const result = [];

        for (let i = 0; i < limit; i++) {
            const key = keys[i];
            const lifeEvent = context[key];
            const data = Handlebars.createFrame(options.data || {});
            data.key = key;

            result.push(options.fn({ lifeEvent, key }, { data }));
        }
        return result.join('');
    });

    Handlebars.registerHelper('has', (value, set) => {
        return set.has(value);
    });

    Handlebars.registerHelper('armorPartsInfo', function (armor) {
        const location = armor.location;
        const parts = [
            {
                key: 'head',
                name: game.i18n.localize('WITCHER.Location.Head'),
                stopping: 'headStopping',
                max: 'headMaxStopping',
                icon: 'fa-helmet-safety'
            },
            {
                key: 'torso',
                name: game.i18n.localize('WITCHER.Location.Torso'),
                stopping: 'torsoStopping',
                max: 'torsoMaxStopping',
                icon: 'fa-shirt'
            },
            {
                key: 'leftHand',
                name: game.i18n.localize('WITCHER.Location.leftArm'),
                stopping: 'leftArmStopping',
                max: 'leftArmMaxStopping',
                icon: 'fa-hand'
            },
            {
                key: 'rightHand',
                name: game.i18n.localize('WITCHER.Location.rightArm'),
                stopping: 'rightArmStopping',
                max: 'rightArmMaxStopping',
                icon: 'fa-hand-back-fist'
            },
            {
                key: 'leftLeg',
                name: game.i18n.localize('WITCHER.Location.rightLeg'),
                stopping: 'leftLegStopping',
                max: 'leftLegMaxStopping',
                icon: 'fa-shoe-prints'
            },
            {
                key: 'rightLeg',
                name: game.i18n.localize('WITCHER.Location.leftLeg'),
                stopping: 'rightLegStopping',
                max: 'rightLegMaxStopping',
                icon: 'fa-shoe-prints'
            },
            {
                key: 'shield',
                name: game.i18n.localize('WITCHER.Actor.Shield'),
                stopping: 'reliability',
                max: 'reliabilityMax',
                icon: 'fa-shield'
            }
        ];

        const fullCover = location === 'FullCover';
        const protections = {
            Head: ['head'],
            Torso: ['torso', 'leftHand', 'rightHand'],
            Leg: ['leftLeg', 'rightLeg'],
            Shield: ['shield']
        };

        const isCovered = partKey => {
            if (fullCover) return partKey !== 'shield';
            return protections[location]?.includes(partKey);
        };

        return parts
            .filter(part => isCovered(part.key))
            .map(part => {
                const current = armor[part.stopping] || 0;
                const max = armor[part.max] || 0;
                const percentage = max > 0 ? Math.round((current / max) * 100) : 0;

                let color = 'gray';
                if (percentage > 66) color = 'green';
                else if (percentage > 33) color = 'orange';
                else color = 'red';

                return {
                    ...part,
                    current,
                    max,
                    percentage,
                    color,
                    tooltip: `${part.name}: ${current} / ${max}`
                };
            });
    });

    Handlebars.registerHelper('capitalize', function (str) {
        if (typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    });
}
