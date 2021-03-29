import {getPostIdFromItsDOMId, getThreadIdFromItsDOMId, isDOMIdOfPost, isDOMIdOfThread} from '@/util/annotation';
import {EventBus} from '@/lib/event-bus';

const scrollInPost = () => {
    const hash = window.location.hash.substring(1);
    if (!isDOMIdOfPost(hash)) return;

    const postId = getPostIdFromItsDOMId(hash);

    EventBus.publish('post-selected-by-url-hash', {postId, postDOMId: hash});
};

const scrollInThread = () => {
    const hash = window.location.hash.substring(1);
    if (!isDOMIdOfThread(hash)) return;

    const threadId = getThreadIdFromItsDOMId(hash);

    EventBus.publish('thread-selected-by-url-hash', {threadId, threadDOMId: hash});
};

window.addEventListener('hashchange', () => {
    scrollInPost();
    scrollInThread();
});

EventBus.subscribe('page-ready', () => {
    scrollInPost();
    scrollInThread();
});
