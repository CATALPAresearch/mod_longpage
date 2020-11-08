import ajax from 'core/ajax';
import {GET, ACT, MUTATE} from '../types';
import {deepLowerCaseKeys} from '../../util/misc'
import {snakeCase} from 'lodash';

export default {
    state: {
        annotations: [],
    },
    getters: {
        [GET.ANNOTATIONS]: ({annotations}) => annotations,
    },
    actions: {
        [ACT.CREATE_ANNOTATION]({commit, getters}, annotation) {
            ajax.call([{
                methodname: 'mod_page_create_annotation',
                args: {
                    annotation: deepLowerCaseKeys({
                        target: annotation.target.map(target => ({
                            ...target,
                            selector: target.selector.map(selector => ({...selector, type: snakeCase(selector.type)})),
                        })),
                        timecreated: annotation.timecreated,
                        timemodified: annotation.timemodified,
                        userid: annotation.userid,
                    }),
                },
                done: (res) => {
                    console.log(res);
                    commit(MUTATE.SET_ANNOTATIONS, [getters[GET.ANNOTATIONS], annotation])
                },
                fail: (e) => {
                    console.error('"mod_page_create_annotation" failed', e);
                }
            }]);
        },
        [ACT.READ_ANNOTATIONS]({commit}) {
            ajax.call([{
                methodname: 'mod_page_get_annotations_by_page',
                done: (annotations) => {
                    commit(MUTATE.SET_ANNOTATIONS, annotations)
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
