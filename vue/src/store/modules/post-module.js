import {ACT, GET, MUTATE} from '../types';
import {AnnotationCompareFunction} from '@/util/comparing';
import ajax from 'core/ajax';
import {flatten} from 'lodash';
import {Post} from '@/types/post';
import {Thread} from '@/types/thread';
import {MoodleWSMethods} from '@/config/constants';
import MappingService from '@/services/mapping-service';
import {ThreadFilter} from '@/util/filters/thread-filter';

export default {
    state: {
        threads: [],
    },
    getters: {
        [GET.NEW_POST]: (_, getters) => (params = {}) => {
            return new Post({
                creatorId: getters[GET.LONGPAGE_CONTEXT].userId,
                ...params,
            });
        },
        [GET.NEW_THREAD]: (_, getters) => (params = {}) => {
            const thread = new Thread({...params});
            if (!thread.posts.length) thread.posts.push(getters[GET.NEW_POST]({threadId: thread.id}));
            return thread;
        },
        [GET.POST]: ({threads}) => (postId, threadId) => {
            const thread = threads.find(t => t.id === threadId);
            return thread && thread.posts.find(p => p.id === postId);
        },
        [GET.POSTS]: ({threads}) => {
            return flatten(threads.map(({posts}) => posts));
        },
        [GET.THREAD]: ({threads}) => id => threads.find(t => t.id === id),
        [GET.THREAD_FILTER]: (_, getters) => getters[GET.ANNOTATION_FILTER].body,
        [GET.THREADS]: ({threads}, getters) => {
            return new ThreadFilter(getters[GET.THREAD_FILTER])
                .applyTo(...threads)
                .sort(
                (threadA, threadB) => {
                    const [annotationA, annotationB] = [threadA, threadB].map(t => getters[GET.ANNOTATION](t.annotationId));
                    return AnnotationCompareFunction.BY_POSITION(annotationA, annotationB);
                });
        },
    },
    actions: {
        [ACT.CREATE_POST]({commit, dispatch, getters}, params = {}) {
            const post = getters[GET.POST](params.id) || getters[GET.NEW_POST](params);
            dispatch(ACT.REPLACE_OR_ADD_POST, post);
            if (!post.content) return;
            const thread = getters[GET.THREAD](post.threadId);
            if (!thread.created) {
                dispatch(ACT.CREATE_ANNOTATION, getters[GET.ANNOTATION](thread.annotationId));
                return;
            }

            ajax.call([{
                methodname: MoodleWSMethods.CREATE_POST,
                args: MappingService.mapPostToArgs(post),
                done: (response) => {
                    const postUpdate = MappingService.mapResponseToPost(response.post);
                    commit(MUTATE.UPDATE_POST, {threadId: thread.id, postId: post.id, postUpdate});
                },
                fail: (e) => {
                    commit(MUTATE.REMOVE_POSTS_FROM_THREAD, {threadId: thread.id, posts: [post]});
                    console.error(`"${MoodleWSMethods.CREATE_POST}" failed`, e);
                }
            }]);
        },
        [ACT.DELETE_POST]({commit, dispatch, getters}, post) {
            if (!post.created) return;

            const thread = getters[GET.THREAD](post.threadId);
            const postIsThreadRoot = thread.root.id === post.id;
            if (postIsThreadRoot) {
                dispatch(ACT.DELETE_ANNOTATION, getters[GET.ANNOTATION](thread.annotationId));
                return;
            }

            commit(MUTATE.REMOVE_POSTS_FROM_THREAD, {threadId: thread.id, posts: [post]});

            ajax.call([{
                methodname: MoodleWSMethods.DELETE_POST,
                args: {id: post.id},
                done: () => {},
                fail: (e) => {
                    commit(MUTATE.ADD_POSTS_TO_THREAD, {threadId: thread.id, posts: [post]});
                    console.error(`"${MoodleWSMethods.DELETE_POST}" failed`, e);
                }
            }]);
        },
        [ACT.REPLACE_OR_ADD_POST]({commit, getters}, post) {
            if (getters[GET.POST](post.id, post.threadId)) {
                commit(MUTATE.UPDATE_POST, {threadId: post.threadId, postId: post.id, postUpdate: post});
            } else commit(MUTATE.ADD_POSTS_TO_THREAD, {threadId: post.threadId, posts: [post]});
        },
        [ACT.REPLACE_OR_ADD_THREAD]({commit, getters}, thread) {
            if (getters[GET.THREAD](thread.id)) {
                commit(MUTATE.UPDATE_THREAD, {id: thread.id, threadUpdate: thread});
            } else commit(MUTATE.ADD_THREADS, [thread]);
        },
        [ACT.TOGGLE_POST_BOOKMARK]({commit, getters}, {postId, threadId}) {
            const post = getters[GET.POST](postId, threadId);
            commit(
                MUTATE.UPDATE_POST,
                {threadId: post.threadId, postId: post.id, postUpdate: {...post, bookmarkedByUser: !post.bookmarkedByUser}}
            );
            const methodname = post.bookmarkedByUser ? MoodleWSMethods.CREATE_POST_BOOKMARK : MoodleWSMethods.DELETE_POST_BOOKMARK;
            ajax.call([{
                methodname,
                args: {postid: post.id},
                fail: (e) => {
                    console.error(`"${methodname}" failed`, e);
                    commit(
                        MUTATE.UPDATE_POST,
                        {threadId: post.threadId, postId: post.id, postUpdate: {...post, bookmarkedByUser: !post.bookmarkedByUser}}
                    );
                }
            }]);
        },
        [ACT.TOGGLE_POST_LIKE]({commit, getters}, {postId, threadId}) {
            const post = getters[GET.POST](postId, threadId);
            commit(
                MUTATE.UPDATE_POST,
                {threadId: post.threadId, postId: post.id, postUpdate: {...post, likedByUser: !post.likedByUser}}
            );
            const methodname = post.likedByUser ? MoodleWSMethods.CREATE_POST_LIKE : MoodleWSMethods.DELETE_POST_LIKE;
            ajax.call([{
                methodname,
                args: {postid: post.id},
                fail: (e) => {
                    console.error(`"${methodname}" failed`, e);
                    commit(
                        MUTATE.UPDATE_POST,
                        {threadId: post.threadId, postId: post.id, postUpdate: {...post, likedByUser: !post.likedByUser}}
                    );
                }
            }]);
        },
        [ACT.TOGGLE_POST_READING]({commit, getters}, {postId, threadId}) {
            const post = getters[GET.POST](postId, threadId);
            commit(
                MUTATE.UPDATE_POST,
                {threadId: post.threadId, postId: post.id, postUpdate: {...post, readByUser: !post.readByUser}}
            );
            const methodname = post.readByUser ? MoodleWSMethods.CREATE_POST_READING : MoodleWSMethods.DELETE_POST_READING;
            ajax.call([{
                methodname,
                args: {postid: post.id},
                fail: (e) => {
                    console.error(`"${methodname}" failed`, e);
                    commit(
                        MUTATE.UPDATE_POST,
                        {threadId: post.threadId, postId: post.id, postUpdate: {...post, readByUser: !post.readByUser}}
                    );
                }
            }]);
        },
        [ACT.TOGGLE_THREAD_SUBSCRIPTION]({commit, getters}, threadId) {
            const thread = getters[GET.THREAD](threadId);
            commit(
                MUTATE.UPDATE_THREAD,
                {id: threadId, threadUpdate: {...thread, subscribedToByUser: !thread.subscribedToByUser}}
            );
            const methodname = thread.subscribedToByUser ?
                MoodleWSMethods.CREATE_THREAD_SUBSCRIPTION : MoodleWSMethods.DELETE_THREAD_SUBSCRIPTION;
            ajax.call([{
                methodname,
                args: {threadid: thread.id},
                fail: (e) => {
                    console.error(`"${methodname}" failed`, e);
                    commit(
                        MUTATE.UPDATE_THREAD,
                        {id: threadId, threadUpdate: {...thread, subscribedToByUser: !thread.subscribedToByUser}}
                    );
                }
            }]);
        },
        [ACT.UPDATE_POST]({commit, getters}, postUpdate) {
            const post = {...getters[GET.POST](postUpdate.id, postUpdate.threadId)};
            commit(MUTATE.UPDATE_POST, {threadId: post.threadId, postId: post.id, postUpdate});
            ajax.call([{
                methodname: MoodleWSMethods.UPDATE_POST,
                args: MappingService.mapPostUpdateToArgs(postUpdate),
                done: (response) => {
                    const postUpdate = MappingService.mapResponseToPost(response.post);
                    commit(MUTATE.UPDATE_POST, {threadId: post.threadId, postId: post.id, postUpdate});
                },
                fail: (e) => {
                    commit(MUTATE.UPDATE_POST, {threadId: post.threadId, postId: post.id, postUpdate: post});
                    console.error(`"${MoodleWSMethods.UPDATE_POST}" failed`, e);
                }
            }]);
        },
    },
    mutations: {
        [MUTATE.ADD_POSTS_TO_THREAD](state, {threadId, posts}) {
          const thread = state.threads.find(thread => thread.id === threadId);
          thread.posts = [...thread.posts, ...posts];
        },
        [MUTATE.ADD_THREADS](state, threads) {
            state.threads.push(...threads);
        },
        [MUTATE.REMOVE_POSTS_FROM_THREAD](state, {threadId, posts}) {
            const thread = state.threads.find(thread => thread.id === threadId);
            thread.posts = thread.posts.filter(p => !posts.find(post => post.id === p.id));
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
        [MUTATE.UPDATE_POST](state, {threadId, postId, postUpdate}) {
            const thread = state.threads.find(thread => thread.id === threadId);
            const post = thread.posts.find(post => post.id === postId);
            Object.assign(post, postUpdate);
        },
        [MUTATE.UPDATE_THREAD](state, {id, threadUpdate}) {
            const thread = state.threads.find(thread => thread.id === id);
            Object.assign(thread, threadUpdate);
        }
    },
};
