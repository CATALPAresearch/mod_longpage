export default {
    _eventBus: null,
    async _getEventBus() {
        if (!this._eventBus) {
            this._eventBus = await import('core/pubsub');
        }

        return this._eventBus;
    },
    async publish(event, payload) {
        (await this._getEventBus()).publish(event, payload);
    },
    async subscribe(event, handler) {
        (await this._getEventBus()).subscribe(event, handler);
    }
};
