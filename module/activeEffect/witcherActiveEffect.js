const DialogV2 = foundry.applications.api.DialogV2;

export default class WitcherActiveEffect extends ActiveEffect {
    get isSuppressed() {
        if (
            this.parent.system.isActive === false ||
            this.parent.system.equipped === false ||
            this.system.applySelf === true ||
            this.system.applyOnTarget === true ||
            this.system.applyOnHit === true ||
            this.system.applyOnDamage === true
        )
            return true;

        return false;
    }

    get isDisabled() {
        return this.disabled || !(this.parent?.system?.equipped ?? true);
    }

    /**
     * Is this effect an temporary Item Improvement on an item
     * @type {boolean}
     */
    get isAppliedTemporaryItemImprovement() {
        return this.system.isTransferred;
    }

    get isTemporaryItemImprovement() {
        return this.type === 'temporaryItemImprovement';
    }

    /**
     * Determine whether the ActiveEffect requires a duration update.
     * True if the worldTime has changed for an effect whose duration is tracked in seconds.
     * True if the combat turn has changed for an effect tracked in turns where the effect target is a combatant.
     * @returns {boolean}
     * @protected
     */
    _requiresDurationUpdate() {
        const { _worldTime, _combatTime, type } = this.duration;
        if (type === 'seconds') return game.time.worldTime !== _worldTime;
        if (type === 'turns' && game.combat) {
            const ct = this._getCombatTime(game.combat.round, game.combat.turn);
            return ct !== _combatTime && !!(this.target?.inCombat ?? this.target?.parent?.inCombat);
        }
        return false;
    }

    /* -------------------------------------------- */
    /*  Event Handlers                              */
    /* -------------------------------------------- */

    /** @inheritDoc */
    async _preCreate(data, options, user) {
        const allowed = await super._preCreate(data, options, user);
        if (allowed === false) return false;

        // Set initial duration data for Actor-owned effects or transferred item effects
        if (this.parent instanceof Actor || this.system.isTransferred) {
            const updates = this.constructor.getInitialDuration();
            for (const k of Object.keys(updates.duration)) {
                if (Number.isNumeric(data.duration?.[k])) delete updates.duration[k]; // Prefer user-defined duration data
            }
            updates.transfer = false;
            this.updateSource(updates);
        }

        for await (let change of this._source.changes) {
            if (change.key.includes('@skill')) {
                await this.chooseSkill(change);
            }
        }
    }

    async chooseSkill(change) {
        let allSkills = Object.keys(CONFIG.WITCHER.skillMap)
            .map(key => {
                let skill = CONFIG.WITCHER.skillMap[key];
                return {
                    label: skill.label,
                    value: 'system.skills.' + skill.attribute.name + '.' + key + '.activeEffectModifiers',
                    group: game.i18n.localize('WITCHER.skills.name')
                };
            })
            .reduce((skills, skill) => {
                skills[skill.label] = skill;
                return skills;
            }, {});

        const dialogTemplate = await foundry.applications.handlebars.renderTemplate(
            'systems/TheWitcherTRPG/templates/dialog/activeEffects/wizard.hbs',
            {
                selects: allSkills
            }
        );

        let skill = await DialogV2.prompt({
            content: dialogTemplate,
            modal: true,
            ok: {
                callback: (event, button, dialog) => {
                    return button.form.elements.path.value;
                }
            },
            rejectClose: true
        });

        change.key = skill;
    }
}
