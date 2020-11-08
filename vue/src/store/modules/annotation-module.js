import ajax from 'core/ajax';
import {GET, ACT, MUTATE} from '../types';
import {deepLowerCaseKeys} from '../../util/misc'
import {capitalize, snakeCase} from "../../util/misc";

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
                done: ({id}) => {
                    commit(MUTATE.SET_ANNOTATIONS, [...getters[GET.ANNOTATIONS], {...annotation, id}])
                },
                fail: (e) => {
                    console.error('"mod_page_create_annotation" failed', e);
                }
            }]);
        },
        [ACT.FETCH_ANNOTATIONS]({commit, getters}) {
            ajax.call([{
                methodname: 'mod_page_get_annotations_by_page_and_user',
                args: {
                    pageid: getters[GET.PAGE_ID],
                    userid: getters[GET.USER_ID],
                },
                done: (annotations) => {
                    const an = JSON.parse(annotations).map(annotation => ({
                        ...annotation,
                        target: annotation.target.map(t => ({
                            ...t,
                            selector: t.selector.map(s => ({...s, type: capitalize(s.type)})),
                        })),
                    }));
                    commit(MUTATE.SET_ANNOTATIONS, an);
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
