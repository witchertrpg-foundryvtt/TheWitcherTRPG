const fields = foundry.data.fields;

export default class BaseMessageData extends foundry.abstract.DataModel {
    /**
     * Key information about this ChatMessage subtype
     */
    static metadata = Object.freeze({
        type: 'base'
    });

    static defineSchema() {
        return {};
    }
}
