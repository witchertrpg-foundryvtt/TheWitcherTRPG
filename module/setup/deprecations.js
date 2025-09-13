const DialogV2 = foundry.applications.api.DialogV2;

export const deprecationWarnings = function () {
    lifepathModifiers();
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

    console.log(affectedActors);

    if (affectedActors.length > 0) {
        const dialogTemplate = await renderTemplate(
            'systems/TheWitcherTRPG/templates/dialog/deprecations/lifepathModifiers.hbs',
            { affectedActors }
        );
        DialogV2.prompt({
            window: { title: `${game.i18n.localize('WITCHER.deprecations.lifepathModifiers.title')}` },
            content: dialogTemplate
        });
    }
}
