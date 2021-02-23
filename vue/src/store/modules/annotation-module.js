import {AnnotationType, MoodleWSMethods} from '@/config/constants';
import {GET, ACT, MUTATE} from '../types';
import ajax from 'core/ajax';
import MappingService from '@/services/mapping-service';
import {Annotation} from '@/types/annotation';

export default {
    state: {
        annotations: [],
        annotationFilter: {},
    },
    getters: {
        [GET.ANNOTATION]: ({annotations}) => id => annotations.find(a => a.id === id),
        [GET.ANNOTATION_FILTER]: ({annotationFilter}) => annotationFilter,
        [GET.ANNOTATION_WITH_CONTEXT]: (_, getters) => annotation => ({
            ...annotation,
            pageId: getters[GET.LONGPAGE_CONTEXT].pageId,
        }),
        [GET.ANNOTATIONS]: ({annotations}) => annotations,
        [GET.ANNOTATIONS_TARGETING_PAGE_SEGMENT]: (_, getters) => {
            return getters[GET.ANNOTATIONS];
        },
        [GET.ANNOTATIONS_TARGETING_PAGE_SEGMENT_FILTERED]: (_, getters) => {
            return getters[GET.ANNOTATIONS]
                .filter(annotation => !getters[GET.ANNOTATION_FILTER].ids ||
                    getters[GET.ANNOTATION_FILTER].ids.includes(annotation.id)
                );
        },
        [GET.ANNOTATIONS_TARGETING_ANNOTATION]: (_, getters) => {
            return getters[GET.ANNOTATIONS];
        },
        [GET.NEW_ANNOTATION]: (_, getters) => (params = {}) => {
            const annotation = new Annotation({
                creatorId: getters[GET.LONGPAGE_CONTEXT].userId,
                pageId: getters[GET.LONGPAGE_CONTEXT].pageId,
                ...params,
            });
            annotation.body =
                params.type === AnnotationType.POST && !params.body
                    ? getters[GET.NEW_THREAD]({annotationId: annotation.id}) : undefined;
            return annotation;
        },
    },
    actions: {
        [ACT.REPLACE_OR_ADD_ANNOTATION]({commit, getters}, annotation) {
            if (getters[GET.ANNOTATION](annotation.id)) {
                commit(MUTATE.UPDATE_ANNOTATION, {id: annotation.id, annotationUpdate: annotation});
            } else commit(MUTATE.ADD_ANNOTATIONS, [annotation]);
        },
        [ACT.CREATE_ANNOTATION]({commit, dispatch, getters}, params = {}) {
            const annotation = getters[GET.ANNOTATION](params.id) || getters[GET.NEW_ANNOTATION](params);
            dispatch(ACT.REPLACE_OR_ADD_ANNOTATION, annotation);
            if (annotation.type === AnnotationType.POST) {
                dispatch(ACT.REPLACE_OR_ADD_THREAD, annotation.body);
                commit(MUTATE.UPDATE_ANNOTATION, {id: annotation.id, annotationUpdate: {isPublic: annotation.body.isPublic}});
                if (!annotation.body.root.content) return;
            }

            ajax.call([{
                methodname: MoodleWSMethods.CREATE_ANNOTATION,
                args: MappingService.mapAnnotationToArgs(annotation),
                done: (response) => {
                    const annotationUpdate = MappingService.mapResponseToAnnotation(response.annotation);
                    if (annotationUpdate.type === AnnotationType.POST) {
                        commit(MUTATE.UPDATE_THREAD, {id: annotation.body.id, threadUpdate: annotationUpdate.body});
                    }
                    commit(MUTATE.UPDATE_ANNOTATION, {id: annotation.id, annotationUpdate});
                },
                fail: (e) => {
                    commit(MUTATE.REMOVE_THREADS, [annotation.body]);
                    commit(MUTATE.REMOVE_ANNOTATIONS, [annotation]);
                    console.error(`"${MoodleWSMethods.CREATE_ANNOTATION}" failed`, e);
                }
            }]);
        },
        [ACT.DELETE_ANNOTATION]({commit}, annotation) {
            if (!annotation.created) return;

            commit(MUTATE.REMOVE_THREADS, [annotation.body]);
            commit(MUTATE.REMOVE_ANNOTATIONS, [annotation]);

            ajax.call([{
                methodname: MoodleWSMethods.DELETE_ANNOTATION,
                args: {id: annotation.id},
                done: () => {},
                fail: (e) => {
                    commit(MUTATE.ADD_ANNOTATIONS, [annotation]);
                    commit(MUTATE.ADD_THREADS, [annotation.body]);
                    console.error(`"${MoodleWSMethods.DELETE_ANNOTATION}" failed`, e);
                }
            }]);
        },
        [ACT.FETCH_ANNOTATIONS]({commit, getters}) {
            ajax.call([{
                methodname: MoodleWSMethods.GET_ANNOTATIONS,
                args: {
                    parameters: {
                        pageid: getters[GET.LONGPAGE_CONTEXT].pageId,
                    },
                },
                done: (response) => {
                    const annotations = MappingService.mapResponseToAnnotations(response.annotations);
                    commit(MUTATE.SET_ANNOTATIONS, annotations);
                    commit(MUTATE.SET_THREADS, annotations.filter(a => Boolean(a.body)).map(a => a.body));
                },
                fail: (e) => {
                    console.error(`"${MoodleWSMethods.GET_ANNOTATIONS}" failed`, e);
                }
            }]);
        },
        [ACT.FILTER_ANNOTATIONS]({commit}, filter) {
           commit(MUTATE.RESET_ANNOTATION_FILTER, filter);
        },
    },
    mutations: {
        [MUTATE.ADD_ANNOTATIONS](state, annotations) {
            state.annotations.push(...annotations);
        },
        [MUTATE.REMOVE_ANNOTATIONS](state, annotationsToRemove) {
            state.annotations = state.annotations.filter(a => !annotationsToRemove.find(atr => atr.id === a.id));
        },
        [MUTATE.RESET_ANNOTATION_FILTER](state, filter) {
            state.annotationFilter = filter || {};
        },
        [MUTATE.SET_ANNOTATIONS](state, annotations) {
            state.annotations = annotations;
        },
        [MUTATE.UPDATE_ANNOTATION](state, {id, annotationUpdate}) {
            const annotation = state.annotations.find(annotation => annotation.id === id);
            Object.assign(annotation, annotationUpdate);
        }
    },
};
