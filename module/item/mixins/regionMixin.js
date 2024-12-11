import { emitForGM } from '../../scripts/socket/socketMessage.js';

export let regionMixin = {
    async createRegionFromTemplateUuids(templateUuids, roll, damage) {
        this.createRegionFromTemplates(
            templateUuids.map(uuid => fromUuidSync(uuid)),
            roll,
            damage
        );
    },

    async createRegionFromTemplates(templates, roll, damage) {
        if (!game.user.isGM) {
            emitForGM('createRegionFromTemplateUuids', [
                this.uuid,
                templates.map(template => template.uuid),
                roll,
                damage
            ]);
            return;
        }
        templates.forEach(async template => {
            let origShape = template.object.shape ?? template.object._computeShape();
            let points = origShape.points ?? origShape.toPolygon().points;
            let shape = {
                hole: false,
                type: 'polygon',
                points: points.map((pt, ind) => (ind % 2 ? pt + template.y : pt + template.x))
            };

            let behaviors = [];

            Object.keys(this.system.regionProperties.behaviours)
                .filter(key => this.system.regionProperties.behaviours[key])
                .forEach(key =>
                    behaviors.push(this.createRegionBehaviour(key, this.system.regionProperties.behaviours[key]))
                );

            let regions = await game.scenes.active.createEmbeddedDocuments('Region', [
                {
                    name: this.name,
                    shapes: [shape],
                    behaviors: behaviors,
                    flags: {
                        TheWitcherTRPG: {
                            roll: roll,
                            item: this,
                            itemUuid: this.uuid,
                            duration: damage.duration,
                            actorUuid: this.parent.uuid
                        }
                    }
                }
            ]);

            regions.forEach(region => region.update({ visibility: 2 }));
        });
    },

    createRegionBehaviour(event, uuid) {
        return {
            name: 'Execute Macro on ' + event,
            type: 'executeMacro',
            system: {
                events: [event],
                uuid: uuid
            }
        };
    }
};
