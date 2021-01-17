import ajax from 'core/ajax';
import {AnnotationTargetType, HighlightingConfig, MoodleWSMethods} from '@/config/constants';
import {filterAnnotationsByTargetType} from '@/lib/annotation/utils';
import {GET, ACT, MUTATE} from '../types';
import MappingService from '@/services/mapping-service';


export default {
    state: {
        annotations: [],
        selectedAnnotations: [],
    },
    getters: {
        [GET.ANNOTATIONS]: ({annotations}) => annotations,
        [GET.SELECTED_ANNOTATIONS]: ({selectedAnnotations}) => selectedAnnotations,
        [GET.SELECTED_HIGHLIGHTS]: ({selectedAnnotations}) => {
            return Array
                .from(document.getElementsByTagName(HighlightingConfig.HL_TAG_NAME))
                .filter(element => selectedAnnotations.includes(element._annotation));
        },
        [GET.ANNOTATIONS_TARGETING_PAGE_SEGMENT]: (_, getters) => {
            return filterAnnotationsByTargetType(getters[GET.ANNOTATIONS], AnnotationTargetType.PAGE_SEGMENT);
        },
        [GET.ANNOTATIONS_TARGETING_ANNOTATION]: (_, getters) => {
            return filterAnnotationsByTargetType(getters[GET.ANNOTATIONS], AnnotationTargetType.ANNOTATION);
        },
        [GET.RESPONSES_TO]: (_, getters) => (annotationId) => {
            return getters[GET.ANNOTATIONS_TARGETING_ANNOTATION].filter(
                annotation => annotation.target.some(
                    ({annotationId: otherAnnotationId}) => otherAnnotationId === annotationId
                )
            );
        },
    },
    actions: {
        [ACT.CREATE_ANNOTATION]({commit}, annotation) {
            const methodname = MoodleWSMethods.CREATE_ANNOTATION;
            ajax.call([{
                methodname,
                args: MappingService[methodname](annotation),
                done: ({id}) => {
                    annotation.id = id;
                    commit(MUTATE.ADD_ANNOTATIONS, [annotation]);
                },
                fail: (e) => {
                    console.error(`"${methodname}" failed`, e);
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
        [ACT.UPDATE_ANNOTATION]({commit}, annotationUpdate) {
            const methodname = MoodleWSMethods.UPDATE_ANNOTATION;
            ajax.call([{
                methodname,
                args: MappingService[methodname](annotationUpdate),
                done: () => {
                    commit(MUTATE.UPDATE_ANNOTATION, annotationUpdate);
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
        [MUTATE.REMOVE_ANNOTATIONS](state, annotations) {
            state.annotations = state.annotations.filter(annotation => !annotations.includes(annotation));
        },
        [MUTATE.SET_ANNOTATIONS](state, annotations) {
            state.annotations = annotations;
        },
        [MUTATE.SET_SELECTED_ANNOTATIONS](state, selectedAnnotations) {
            state.selectedAnnotations = selectedAnnotations;
        },
        [MUTATE.UPDATE_ANNOTATION](state, annotationUpdate) {
            const annotation = state.annotations.find(annotation => annotation.id === annotationUpdate.id);
            Object.assign(annotation, annotationUpdate);
        }
    },
};
