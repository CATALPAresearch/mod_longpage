import ajax from 'core/ajax';
import {GET, ACT, MUTATE} from '../types';
import MappingService from "@/services/mapping-service";
import {MoodleWSMethods} from "@/config/constants";

export default {
    state: {
        annotations: [],
    },
    getters: {
        [GET.ANNOTATIONS]: ({annotations}) => annotations,
    },
    actions: {
        [ACT.CREATE_ANNOTATION]({commit, getters}, annotation) {
            const methodname = MoodleWSMethods.CREATE_ANNOTATION;
            ajax.call([{
                methodname,
                args: MappingService[methodname](annotation),
                done: ({id}) => {
                    annotation.id = id;
                    commit(MUTATE.SET_ANNOTATIONS, [...getters[GET.ANNOTATIONS], annotation])
                },
                fail: (e) => {
                    console.error('"mod_page_create_annotation" failed', e);
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
    },
    mutations: {
        [MUTATE.SET_ANNOTATIONS](state, annotations) {
            state.annotations = annotations;
        },
        [MUTATE.RESET_ANNOTATIONS](state) {
            state.annotations = [];
        }
    },
}
