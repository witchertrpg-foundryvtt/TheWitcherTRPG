import { RollConfig } from '../rollConfig.js';

/**
 * @param {string} rollFormula rollFormula to apply
 * @param {*} messageData messageData to display
 * @param {RollConfig} config Configuration for Extended roll
 * @param {Flag} flags an object/array of objects of flags to be set
 */
export async function extendedRoll(rollFormula, messageData, config = new RollConfig(), flags = []) {
    let roll = new Roll(rollFormula);
    let evaluatedRoll = await roll.evaluate();
    let rollTotal = Number(evaluatedRoll.total);

    //crit/fumble calculation
    if (config.showCrit && (isCrit(evaluatedRoll) || isFumble(evaluatedRoll))) {
        let extraRollDescription = isCrit(evaluatedRoll)
            ? `${game.i18n.localize('WITCHER.Crit')}`
            : `${game.i18n.localize('WITCHER.Fumble')}`;

        let critClass = config.reversal ? 'dice-fail' : 'dice-success';
        let fumbleClass = config.reversal ? 'dice-success' : 'dice-fail';
        messageData.flavor += isCrit(evaluatedRoll)
            ? `<div class="${critClass}"><i class="fas fa-dice-d6"></i>${game.i18n.localize('WITCHER.Crit')}</div>`
            : `<div class="${fumbleClass}"><i class="fas fa-dice-d6"></i>${game.i18n.localize('WITCHER.Fumble')}</div>`;

        messageData.flavor += `<div>${roll.formula} = <b>${rollTotal}</b></div>`;

        //print crit/fumble roll
        let extraRollFormula = `1d10x10[${extraRollDescription}]`;
        let extraRoll = await new Roll(extraRollFormula).evaluate();
        let extraRollTotal = Number(extraRoll.total);
        messageData.flavor += `<div>${extraRollFormula} = <b>${extraRollTotal}</b></div>`;

        //add/subtract extra result from the original one
        extraRollFormula = `${rollTotal}[${game.i18n.localize('WITCHER.BeforeCrit')}]`;
        let options;
        if (isCrit(evaluatedRoll)) {
            extraRollFormula += `+${extraRollTotal}[${extraRollDescription}]`;
            rollTotal += extraRollTotal;
            options = {
                crit: true
            };
        } else {
            options = {
                fumble: true,
                fumbleAmount: extraRollTotal
            };

            if (extraRollTotal >= rollTotal) {
                extraRollTotal = rollTotal;
            }

            extraRollFormula += `-${extraRollTotal}[${extraRollDescription}]`;
            rollTotal -= extraRollTotal;
        }

        //print add/subtract roll info
        extraRoll = await new Roll(extraRollFormula, null, options).evaluate();
        evaluatedRoll = extraRoll;
    }

    messageData.system.rollTotal = evaluatedRoll.total;

    //calculate overall success/failure for the attack/defense
    if (config.threshold >= 0) {
        let success;
        if (!config.reversal) {
            success = config.defense ? evaluatedRoll.total >= config.threshold : evaluatedRoll.total > config.threshold;
            evaluatedRoll.options.rollOver = evaluatedRoll.total - config.threshold;
        } else {
            success = config.defense ? evaluatedRoll.total <= config.threshold : evaluatedRoll.total < config.threshold;
            evaluatedRoll.options.rollOver = config.threshold - evaluatedRoll.total;
        }

        evaluatedRoll.options.success = success;

        let successHeader = config.thresholdDesc
            ? `: ${game.i18n.localize(config.thresholdDesc)}`
            : ': ' + config.threshold;
        messageData.flavor += success
            ? `<div class="dice-success"><i>${game.i18n.localize('WITCHER.Chat.Success')}${successHeader}</i></br>${config.messageOnSuccess}</div>`
            : `<div class="dice-fail"><i>${game.i18n.localize('WITCHER.Chat.Fail')}${successHeader}</i></br>${config.messageOnFailure}</div>`;

        messageData.flags = {
            TheWitcherTRPG: success ? config.flagsOnSuccess : config.flagsOnFailure
        };
    }

    if (config.showResult) {
        let message = await evaluatedRoll.toMessage(messageData);
        if (flags) {
            if (Array.isArray(flags)) {
                flags.forEach(flag => message.setFlag('TheWitcherTRPG', flag.key, flag.value));
            } else {
                message.setFlag('TheWitcherTRPG', flags.key, flags.value);
            }
        }
    } else {
        evaluatedRoll.messageData = messageData;
    }

    return evaluatedRoll;
}

function isCrit(roll) {
    return roll.dice[0]?.results[0].result == 10;
}

function isFumble(roll) {
    return roll.dice[0]?.results[0].result == 1;
}
