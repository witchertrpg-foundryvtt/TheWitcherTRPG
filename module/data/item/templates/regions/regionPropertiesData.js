import regionBehaviours from './regionBehavioursData.js';

const fields = foundry.data.fields;

export default class RegionProperties extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            createRegionFromTemplate: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.Item.RegionProperties.createRegionFromTemplate'
            }),
            behaviours: new fields.SchemaField(regionBehaviours())
        };
    }

    async createRegionFromTemplateUuids(templateUuids, roll, damage, options) {
        this.createRegionFromTemplates(
            templateUuids.map(uuid => fromUuidSync(uuid)),
            roll,
            damage,
            options
        );
    }

    async createRegionFromTemplates(templates, roll, damage, options) {
        let item = this.parent.parent;
        if (!game.user.isGM) {
            emitForGM('createRegionFromTemplateUuids', [
                item.uuid,
                templates.map(template => template.uuid),
                roll,
                damage,
                options
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

            Object.keys(this.behaviours)
                .filter(key => this.behaviours[key])
                .forEach(key => behaviors.push(this.createRegionBehaviour(key, this.behaviours[key])));

            let regions = await game.scenes.active.createEmbeddedDocuments('Region', [
                {
                    name: item.name,
                    shapes: [shape],
                    behaviors: behaviors,
                    flags: {
                        TheWitcherTRPG: {
                            roll: roll,
                            item: item,
                            itemUuid: item.uuid,
                            duration: damage.duration,
                            actorUuid: item.parent.uuid,
                            options: options
                        }
                    }
                }
            ]);

            regions.forEach(region => region.update({ visibility: 2 }));
        });
    }

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

    /** @inheritdoc */
    static migrateData(source) {
        super.migrateData(source);

        source.behaviours.tokenMoveWithin = source.behaviours.tokenPreMove;
    }
}
