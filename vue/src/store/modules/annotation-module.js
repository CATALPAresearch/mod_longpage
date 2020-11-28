import ajax from 'core/ajax';
import {GET, ACT, MUTATE} from '../types';
import MappingService from "@/services/mapping-service";
import {HighlightingConfig, MoodleWSMethods} from "@/config/constants";

export default {
    state: {
        annotations: [],
        selectedAnnotations: [],
    },
    getters: {
        [GET.ANNOTATIONS]: ({annotations}) => annotations,
        [GET.SELECTED_ANNOTATIONS]: ({selectedAnnotations}) => selectedAnnotations,
        [GET.SELECTED_HIGHLIGHTS]: ({selectedAnnotations}) => {
            return Array.from(document.getElementsByTagName(HighlightingConfig.HL_TAG_NAME)).filter(element => selectedAnnotations.includes(element._annotation));
        }
    },
    actions: {
        [ACT.CREATE_ANNOTATION]({commit, getters}, annotation) {
            const methodname = MoodleWSMethods.CREATE_ANNOTATION;
            ajax.call([{
                methodname,
                args: MappingService[methodname](annotation),
                done: ({id}) => {
                    annotation.id = id;
                    commit(MUTATE.SET_ANNOTATIONS, [...getters[GET.ANNOTATIONS], annotation]);
                },
                fail: (e) => {
                    console.error('"mod_page_create_annotation" failed', e);
                }
            }]);
        },
        [ACT.DELETE_ANNOTATION]({commit, getters}, annotation) {
            const methodname = MoodleWSMethods.DELETE_ANNOTATION;
            ajax.call([{
                methodname,
                args: { id: annotation.id },
                done: () => {
                    commit(MUTATE.REMOVE_ANNOTATIONS, [annotation]);
                },
                fail: (e) => {
                    console.error('"mod_page_delete_annotation" failed', e);
                }
            }]);
        },
        [ACT.FETCH_ANNOTATIONS]({commit, getters}) {
            const methodname = MoodleWSMethods.GET_ANNOTATIONS;
            ajax.call([{
                methodname,
                args: {
                    pageid: getters[GET.PAGE_ID],
                    userid: getters[GET.USER_ID],
                },
                done: (annotations) => {
                    commit(MUTATE.SET_ANNOTATIONS, MappingService[methodname](annotations));
                },
                fail: (e) => {
                    console.error('"mod_page_get_annotations_by_page" failed', e);
                }
            }]);
        },
        [ACT.UPDATE_ANNOTATION_BODY]({commit, getters}, annotationUpdate) {
            const methodname = MoodleWSMethods.UPDATE_ANNOTATION_BODY;
            ajax.call([{
                methodname,
                args: {
                    annotation_id: annotationUpdate.id,
                    value: annotationUpdate.body,
                },
                done: (annotations) => {
                    commit(MUTATE.UPDATE_ANNOTATION, annotationUpdate);
                },
                fail: (e) => {
                    console.error('"mod_page_update_annotation_body" failed', e);
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
            const annotationIndex = state.annotations.findIndex(annotation => annotation.id === annotationUpdate.id);
            state.annotations.splice(annotationIndex, 1, annotationUpdate);
        }
    },
}