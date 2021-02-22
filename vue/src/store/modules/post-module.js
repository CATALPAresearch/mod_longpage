import {ACT, GET, MUTATE} from '../types';

export default {
    state: {
        threads: [],
    },
    getters: {
        [GET.THREADS]: ({threads}) => threads,
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
        [MUTATE.REMOVE_POST](state, post) {
            const thread = state.threads.find(thread => thread.id === post.threadId);
            thread.posts = thread.posts.filter(p => p.id !== post.id);
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
