import {ACT, GET, MUTATE} from '../types';
import {AnnotationCompareFunction} from '@/util/comparing';
import {Post} from '@/types/post';
import {Thread} from '@/types/thread';

export default {
    state: {
        newThreads: [],
        threads: [],
    },
    getters: {
        [GET.NEW_POST]: (_, getters) => (params = {}) => {
            return new Post({...params, creatorId: getters[GET.USER()]});
        },
        [GET.NEW_THREAD]: (_, getters) => (params = {}) => {
            return new Thread({...params, posts: getters[GET.NEW_POST]});
        },
        [GET.THREADS]: (_, getters) => {
            return getters[GET.THREADS_SORTED_BY_ANNOTATION_POSITION];
        },
        [GET.THREADS_SORTED_BY_ANNOTATION_POSITION]: ({newThreads, threads}, getters) => {
            return [...newThreads, ...threads].sort(
                (threadA, threadB) => {
                    const [annotationA, annotationB] = [threadA, threadB].map(t => getters[GET.ANNOTATION](t.annotationId));
                    return AnnotationCompareFunction.BY_POSITION(annotationA, annotationB);
                }
            );
        },
    },
    actions: {
        [ACT.CREATE_POST]({commit}, post) {
            commit(MUTATE.ADD_POST_TO_THREAD, post);
        },
        [ACT.DELETE_POST]({commit}, post) {
            commit(MUTATE.REMOVE_POST, post);
        },
        [ACT.UPDATE_POST]({commit}, postUpdate) {
            commit(MUTATE.REPLACE_POST, postUpdate);
        },
    },
    mutations: {
        [MUTATE.ADD_POST_TO_THREAD](state, post) {
          const thread = state.threads.find(thread => thread.id === post.threadId);
          thread.posts = [...thread.posts, post];
        },
        [MUTATE.ADD_THREADS](state, threads) {
            state.threads.push(...threads);
        },
        [MUTATE.REMOVE_POST](state, post) {
            const thread = state.threads.find(thread => thread.id === post.threadId);
            thread.posts = thread.posts.filter(p => p.id !== post.id);
        },
        [MUTATE.REMOVE_THREADS](state, threadsToRemove) {
            state.threads = state.threads.filter(t => !threadsToRemove.find(ttr => ttr.id === t.id));
        },
        [MUTATE.REPLACE_POST](state, post) {
            const thread = state.threads.find(thread => thread.id === post.threadId);
            const posts = [...thread.posts];
            posts.splice(posts.findIndex(p => p.id === post.id), 1, post);
            thread.posts = posts;
        },
        [MUTATE.SET_THREADS](state, threads) {
            state.threads = threads;
        },
    },
};
