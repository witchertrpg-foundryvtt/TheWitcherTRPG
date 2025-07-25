/**
 * A helper class for building MeasuredTemplates for spells and abilities
 * Adopted from 5e https://github.com/foundryvtt/dnd5e/blob/3.2.x/module/canvas/ability-template.mjs#L36
 */
export default class AbilityTemplate extends foundry.canvas.placeables.MeasuredTemplate {
    /**
     * Track the timestamp when the last mouse move event was captured.
     * @type {number}
     */
    #moveTime = 0;

    /* -------------------------------------------- */

    /**
     * The initially active CanvasLayer to re-activate after the workflow is complete.
     * @type {CanvasLayer}
     */
    #initialLayer;

    /* -------------------------------------------- */

    /**
     * Track the bound event handlers so they can be properly canceled later.
     * @type {object}
     */
    #events;

    /* -------------------------------------------- */

    /**
     * A factory method to create an AbilityTemplate instance using provided data from an Item instance
     * @param {Item} item               The Item object for which to construct the template
     * @param {object} [options={}]       Options to modify the created template.
     * @returns {AbilityTemplate|null}    The template object, or null if the item does not produce a template
     */
    static fromItem(item, options = {}) {
        const templateShape = item.system.templateType;
        if (!templateShape) return null;

        // Prepare template data
        const templateData = foundry.utils.mergeObject(
            {
                t: templateShape,
                user: game.user.id,
                distance: item.system.templateSize,
                direction: 0,
                x: 0,
                y: 0,
                fillColor: game.user.color,
                flags: { witcher: { origin: item.uuid } }
            },
            options
        );

        // Additional type-specific data
        switch (templateShape) {
            case 'cone':
                templateData.angle = CONFIG.MeasuredTemplate.defaults.angle;
                break;
            case 'rect': // 5e rectangular AoEs are always cubes
                templateData.width = item.system.templateSize;
                templateData.distance = Math.hypot(item.system.templateSize, item.system.templateSize);
                templateData.direction = 45;
                break;
            case 'ray':
                templateData.width = 1;
                templateData.distance = item.system.templateSize ?? canvas.dimensions.distance;
                break;
            default:
                break;
        }

        // Return the template constructed from the item data
        const cls = CONFIG.MeasuredTemplate.documentClass;
        const template = new cls(templateData, { parent: canvas.scene });
        const object = new this(template);
        object.item = item;
        object.actorSheet = item.actor?.sheet || null;

        return object;
    }

    /* -------------------------------------------- */

    /**
     * Creates a preview of the spell template.
     * @returns {Promise}  A promise that resolves with the final measured template if created.
     */
    drawPreview() {
        const initialLayer = canvas.activeLayer;

        // Draw the template and switch to the template layer
        this.draw();
        this.layer.activate();
        this.layer.preview.addChild(this);

        // Hide the sheet that originated the preview
        this.actorSheet?.minimize();

        // Activate interactivity
        return this.activatePreviewListeners(initialLayer);
    }

    /* -------------------------------------------- */

    /**
     * Activate listeners for the template preview
     * @param {CanvasLayer} initialLayer  The initially active CanvasLayer to re-activate after the workflow is complete
     * @returns {Promise}                 A promise that resolves with the final measured template if created.
     */
    activatePreviewListeners(initialLayer) {
        return new Promise((resolve, reject) => {
            this.#initialLayer = initialLayer;
            this.#events = {
                cancel: this._onCancelPlacement.bind(this),
                confirm: this._onConfirmPlacement.bind(this),
                move: this._onMovePlacement.bind(this),
                resolve,
                reject,
                rotate: this._onRotatePlacement.bind(this)
            };

            // Activate listeners
            canvas.stage.on('mousemove', this.#events.move);
            canvas.stage.on('mousedown', this.#events.confirm);
            canvas.app.view.oncontextmenu = this.#events.cancel;
            canvas.app.view.onwheel = this.#events.rotate;
        });
    }

    /* -------------------------------------------- */

    /**
     * Shared code for when template placement ends by being confirmed or canceled.
     * @param {Event} event  Triggering event that ended the placement.
     */
    async _finishPlacement(event) {
        this.layer._onDragLeftCancel(event);
        canvas.stage.off('mousemove', this.#events.move);
        canvas.stage.off('mousedown', this.#events.confirm);
        canvas.app.view.oncontextmenu = null;
        canvas.app.view.onwheel = null;
        this.#initialLayer.activate();
        await this.actorSheet?.maximize();
    }

    /* -------------------------------------------- */

    /**
     * Move the template preview when the mouse moves.
     * @param {Event} event  Triggering mouse event.
     */
    _onMovePlacement(event) {
        event.stopPropagation();
        const now = Date.now(); // Apply a 20ms throttle
        if (now - this.#moveTime <= 20) return;
        const center = event.data.getLocalPosition(this.layer);
        const interval = canvas.grid.type === CONST.GRID_TYPES.GRIDLESS ? 0 : 2;
        const snapped = canvas.grid.getSnappedPoint(center, { mode: interval });
        this.document.updateSource({ x: snapped.x, y: snapped.y });
        this.refresh();
        this.#moveTime = now;
    }

    /* -------------------------------------------- */

    /**
     * Rotate the template preview by 3˚ increments when the mouse wheel is rotated.
     * @param {Event} event  Triggering mouse event.
     */
    _onRotatePlacement(event) {
        if (event.ctrlKey) event.preventDefault(); // Avoid zooming the browser window
        event.stopPropagation();
        const delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
        const snap = event.shiftKey ? delta : 5;
        const update = { direction: this.document.direction + snap * Math.sign(event.deltaY) };
        this.document.updateSource(update);
        this.refresh();
    }

    /* -------------------------------------------- */

    /**
     * Confirm placement when the left mouse button is clicked.
     * @param {Event} event  Triggering mouse event.
     */
    async _onConfirmPlacement(event) {
        await this._finishPlacement(event);
        const interval = canvas.grid.type === CONST.GRID_TYPES.GRIDLESS ? 0 : 2;
        const destination = canvas.grid.getSnappedPoint(this.document, { mode: interval });
        this.document.updateSource(destination);
        this.#events.resolve(canvas.scene.createEmbeddedDocuments('MeasuredTemplate', [this.document.toObject()]));
    }

    /* -------------------------------------------- */

    /**
     * Cancel placement when the right mouse button is clicked.
     * @param {Event} event  Triggering mouse event.
     */
    async _onCancelPlacement(event) {
        await this._finishPlacement(event);
        this.#events.reject();
    }
}
