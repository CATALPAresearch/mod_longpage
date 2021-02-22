import {AnnotationType, MoodleWSMethods} from '@/config/constants';
import {GET, ACT, MUTATE} from '../types';
import ajax from 'core/ajax';
import MappingService from '@/services/mapping-service';
import {cloneDeep} from 'lodash';
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
        [GET.ANNOTATIONS_IN_EDIT]: ({annotationsInEdit}) => annotationsInEdit,
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
        [GET.NEW_ANNOTATION]: (_, getters) => (params = {}) => new Annotation(
            {pageId: getters[GET.LONGPAGE_CONTEXT].pageId, ...params}
        ),
        [GET.PROVISIONAL_ANNOTATION_ID]: ({annotationsInEdit}) => `new-${annotationsInEdit.length}`,
    },
    actions: {
        [ACT.START_EDITING_ANNOTATION]({commit, getters}, annotation) {
            if (!annotation.created) {
                annotation.id = getters[GET.PROVISIONAL_ANNOTATION_ID];
                commit(MUTATE.ADD_ANNOTATIONS, [annotation]);
            }
            commit(MUTATE.ADD_ANNOTATION_IN_EDIT, cloneDeep(annotation));
            return annotation.id;
        },
        [ACT.STOP_EDITING_ANNOTATION]({commit}, annotation) {
            if (!annotation.created) commit(MUTATE.REMOVE_ANNOTATIONS, [annotation]);
            commit(MUTATE.REMOVE_ANNOTATION_IN_EDIT_BY_ID, annotation.id);
        },
        [ACT.CREATE_ANNOTATION]({commit, getters}, params) {
            const annotation = getters[GET.NEW_ANNOTATION](params);
            commit(MUTATE.ADD_ANNOTATIONS, [annotation]);
            commit(MUTATE.ADD_THREADS, [annotation.body]);
            if (annotation.type === AnnotationType.POST && !annotation.body.root.content) return;

            ajax.call([{
                methodname: MoodleWSMethods.CREATE_ANNOTATION,
                args: MappingService.mapAnnotationToArgs(annotation),
                done: (response) => {
                    const annotationUpdate = MappingService.mapResponseToAnnotation(response.annotation);
                    commit(MUTATE.UPDATE_ANNOTATION, {id: annotation.id, annotationUpdate});
                },
                fail: (e) => {
                    commit(MUTATE.REMOVE_ANNOTATIONS, [annotation]);
                    commit(MUTATE.REMOVE_THREADS, [annotation.body]);
                    console.error(`"${MoodleWSMethods.CREATE_ANNOTATION}" failed`, e);
                }
            }]);
        },
        [ACT.DELETE_ANNOTATION]({commit}, annotation) {
            const methodname = MoodleWSMethods.DELETE_ANNOTATION;
            ajax.call([{
                methodname,
                args: {id: annotation.id},
                done: () => {
                    commit(MUTATE.REMOVE_ANNOTATIONS, [annotation]);
                },
                fail: (e) => {
                    console.error(`"${methodname}" failed`, e);
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
