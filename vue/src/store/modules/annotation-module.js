import {AnnotationTargetType, MoodleWSMethods} from '@/config/constants';
import {GET, ACT, MUTATE} from '../types';
import {Annotation} from '@/lib/annotation/types/annotation';
import ajax from 'core/ajax';
import {filterAnnotationsByTargetType} from '@/lib/annotation/utils';
import MappingService from '@/services/mapping-service';
import {cloneDeep} from 'lodash';

export default {
    state: {
        annotationsInEdit: [],
        annotations: [],
        annotationFilter: {},
    },
    getters: {
        [GET.ANNOTATION_FILTER]: ({annotationFilter}) => annotationFilter,
        [GET.ANNOTATION_WITH_CONTEXT]: (_, getters) => annotation => {
            return new Annotation({
                ...annotation,
                pageId: getters[GET.LONGPAGE_CONTEXT].pageId,
                userId: getters[GET.LONGPAGE_CONTEXT].userId,
            });
        },
        [GET.ANNOTATIONS]: ({annotations}) => annotations,
        [GET.ANNOTATIONS_IN_EDIT]: ({annotationsInEdit}) => annotationsInEdit,
        [GET.ANNOTATIONS_TARGETING_PAGE_SEGMENT]: (_, getters) => {
            return filterAnnotationsByTargetType(getters[GET.ANNOTATIONS], AnnotationTargetType.PAGE_SEGMENT);
        },
        [GET.ANNOTATIONS_TARGETING_PAGE_SEGMENT_FILTERED]: (_, getters) => {
            return filterAnnotationsByTargetType(getters[GET.ANNOTATIONS], AnnotationTargetType.PAGE_SEGMENT)
                .filter(annotation => !getters[GET.ANNOTATION_FILTER].ids ||
                    getters[GET.ANNOTATION_FILTER].ids.includes(annotation.id)
                );
        },
        [GET.ANNOTATIONS_TARGETING_ANNOTATION]: (_, getters) => {
            return filterAnnotationsByTargetType(getters[GET.ANNOTATIONS], AnnotationTargetType.ANNOTATION);
        },
        [GET.PROVISIONAL_ANNOTATION_ID]: ({annotationsInEdit}) => `new-${annotationsInEdit.length}`,
        [GET.RESPONSES_TO]: (_, getters) => (annotationId) => {
            return getters[GET.ANNOTATIONS_TARGETING_ANNOTATION].filter(
                annotation => annotation.target.some(
                    ({annotationId: otherAnnotationId}) => otherAnnotationId === annotationId
                )
            );
        },
        [GET.USER_IS_AUTHOR]: (_, getters) => annotation => annotation.userId === getters[GET.LONGPAGE_CONTEXT].userId,
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
        [ACT.CREATE_ANNOTATION]({commit, getters}, annotation) {
            const methodname = MoodleWSMethods.CREATE_ANNOTATION;
            const annotationWithContext = getters[GET.ANNOTATION_WITH_CONTEXT](annotation);
            return new Promise((resolve) => {
                ajax.call([{
                    methodname,
                    args: MappingService[methodname](annotationWithContext),
                    done: ({id}) => {
                        annotationWithContext.id = id;
                        commit(MUTATE.ADD_ANNOTATIONS, [annotationWithContext]);
                        resolve(id);
                    },
                    fail: (e) => {
                        console.error(`"${methodname}" failed`, e);
                    }
                }]);
            });
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
            const methodname = MoodleWSMethods.GET_ANNOTATIONS;
            const context = getters[GET.LONGPAGE_CONTEXT];
            ajax.call([{
                methodname,
                args: {
                    pageid: context.pageId,
                    userid: context.userId,
                },
                done: (annotations) => {
                    commit(MUTATE.SET_ANNOTATIONS, MappingService[methodname](annotations));
                },
                fail: (e) => {
                    console.error(`"${methodname}" failed`, e);
                }
            }]);
        },
        [ACT.FILTER_ANNOTATIONS]({commit}, filter) {
           commit(MUTATE.RESET_ANNOTATION_FILTER, filter);
        },
        [ACT.UPDATE_ANNOTATION]({commit, dispatch}, annotationUpdated) {
            if (!annotationUpdated.created) {
                return dispatch(ACT.CREATE_ANNOTATION, annotationUpdated);
            }

            const methodname = MoodleWSMethods.UPDATE_ANNOTATION;
            ajax.call([{
                methodname,
                args: MappingService[methodname](annotationUpdated),
                done: () => {
                    commit(MUTATE.UPDATE_ANNOTATION, annotationUpdated);
                },
                fail: (e) => {
                    console.error(`"${methodname}" failed`, e);
                }
            }]);
        },
    },
    mutations: {
        [MUTATE.ADD_ANNOTATIONS](state, annotations) {
            state.annotations.push(...annotations);
        },
        [MUTATE.ADD_ANNOTATION_IN_EDIT](state, annotationsInEdit) {
            state.annotationsInEdit.push(annotationsInEdit);
        },
        [MUTATE.REMOVE_ANNOTATION_BY_ID](state, id) {
            state.annotations = state.annotations.filter(annotation => annotation.id !== id);
        },
        [MUTATE.REMOVE_ANNOTATION_IN_EDIT_BY_ID](state, id) {
            state.annotationsInEdit = state.annotationsInEdit.filter(annotation => annotation.id !== id);
        },
        [MUTATE.REMOVE_ANNOTATIONS](state, annotations) {
            state.annotations = state.annotations.filter(annotation => !annotations.includes(annotation));
        },
        [MUTATE.RESET_ANNOTATION_FILTER](state, filter) {
            state.annotationFilter = filter || {};
        },
        [MUTATE.SET_ANNOTATIONS](state, annotations) {
            state.annotations = annotations;
        },
        [MUTATE.UPDATE_ANNOTATION](state, annotationUpdate) {
            const annotation = state.annotations.find(annotation => annotation.id === annotationUpdate.id);
            Object.assign(annotation, annotationUpdate);
        }
    },
};
