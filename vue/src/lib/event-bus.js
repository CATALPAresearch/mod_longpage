import emitter from 'tiny-emitter/instance';

export class EventBus {
    static publish(event, payload) {
        emitter.emit(event, payload);
    }

    static subscribe(event, handler) {
        emitter.on(event, handler);
    }
}
