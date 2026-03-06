const DialogV2 = foundry.applications.api.DialogV2;

export const deprecationWarnings = function () {
    lifepathModifiers();
    statSkillModifiers();
    ritualComponents();
};

async function lifepathModifiers() {
    let affectedActors = game.actors
        .filter(actor => actor.isOwner)
        .filter(actor => actor.effects.size > 0)
        .filter(actor =>
            actor.effects.find(
                effect =>
                    effect.changes.find(change => change.key.includes('strongStrikeAttackBonus')) ||
                    effect.changes.find(change => change.key.includes('jointStrikeAttackBonus'))
            )
        );

    if (affectedActors.length > 0) {
        const dialogTemplate = await foundry.applications.handlebars.renderTemplate(
            'systems/TheWitcherTRPG/templates/dialog/deprecations/lifepathModifiers.hbs',
            { affectedActors }
        );
        DialogV2.prompt({
            window: { title: `${game.i18n.localize('WITCHER.deprecations.lifepathModifiers.title')}` },
            content: dialogTemplate
        });
    }
}

async function statSkillModifiers() {
    let affectedActors = game.actors
        .filter(actor => actor.isOwner)
        .filter(actor => actor.type != 'mystery' && actor.type != 'loot')
        .filter(
            actor =>
                !!(actor.system.reputation.modifiers?.length > 0) ||
                !!Object.values(actor.system.stats).find(stat => stat.modifiers?.length > 0) ||
                !!Object.values(actor.system.derivedStats).find(stat => stat.modifiers?.length > 0) ||
                !!Object.values(actor.system.skills).find(
                    skillGroup => !!Object.values(skillGroup).find(skill => skill.modifiers?.length > 0)
                )
        );

    if (affectedActors.length > 0) {
        const dialogTemplate = await foundry.applications.handlebars.renderTemplate(
            'systems/TheWitcherTRPG/templates/dialog/deprecations/statSkillModifiers.hbs',
            { affectedActors }
        );
        DialogV2.prompt({
            window: { title: `${game.i18n.localize('WITCHER.deprecations.statSkillModifiers.title')}` },
            content: dialogTemplate
        });
    }
}

async function ritualComponents() {
    let actorWithItem = game.actors
        .filter(actor => actor.isOwner)
        .filter(actor => actor.type != 'mystery' && actor.type != 'loot')
        .flatMap(actor => Array.from(actor.items.values()))
        .filter(item => item.type == 'ritual')
        .filter(item => item.system.components)
        .map(item => {
            return { actor: item.parent, item: item.name };
        });

    let items = game.items
        .filter(item => item.type == 'ritual')
        .filter(item => item.system.components)
        .map(item => {
            return { actor: { name: 'Sidebar' }, item: item.name };
        });

    let ritualComponents = actorWithItem.concat(items);

    if (actorWithItem.length > 0) {
        const dialogTemplate = await foundry.applications.handlebars.renderTemplate(
            'systems/TheWitcherTRPG/templates/dialog/deprecations/ritualComponents.hbs',
            { ritualComponents }
        );
        DialogV2.prompt({
            window: { title: `${game.i18n.localize('WITCHER.deprecations.ritualComponents.title')}` },
            content: dialogTemplate
        });
    }
}
