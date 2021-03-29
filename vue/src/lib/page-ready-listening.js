import {EventBus} from '@/lib/event-bus';

let timeout = null;

new MutationObserver((_, observer) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
        observer.disconnect();
        setTimeout(() => {
            EventBus.publish('page-ready');
        });
    }, 500);
}).observe(document, {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true,
});
