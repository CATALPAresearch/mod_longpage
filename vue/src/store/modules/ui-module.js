import {ACT, GET, MUTATE} from '../types';
import ajax from 'core/ajax';
import {MoodleWSMethods} from '@/config/constants';

export default {
    state: {
        sidebarTabOpenedKey: undefined,
        scrollTop: 0,
    },
    getters: {
        [GET.SIDEBAR_TAB_OPENED_KEY]: ({sidebarTabOpenedKey}) => sidebarTabOpenedKey,
        [GET.SCROLL_TOP]: ({scrollTop}) => scrollTop,
    },
    mutations: {
        [MUTATE.RESET_SCROLL_TOP](state, scrollTop) {
            state.scrollTop = scrollTop;
        },
        [MUTATE.RESET_SIDEBAR_TAB_OPENED_KEY](state, sidebarTabOpenedKey) {
            state.sidebarTabOpenedKey = sidebarTabOpenedKey;
        },
    },
    actions: {
        [ACT.UPDATE_READING_PROGRESS]({commit, getters}, scrollTop) {
            const oldScrollTop = getters[GET.SCROLL_TOP];
            commit(MUTATE.RESET_SCROLL_TOP, scrollTop);
            ajax.call([{
                methodname: MoodleWSMethods.UPDATE_READING_PROGRESS,
                args: {
                    pageid: getters[GET.LONGPAGE_CONTEXT].pageId,
                    scrolltop: scrollTop,
                },
                fail: (e) => {
                    console.error(`"${MoodleWSMethods.UPDATE_READING_PROGRESS}" failed`, e);
                    commit(
                        MUTATE.RESET_SCROLL_TOP,
                        oldScrollTop
                    );
                }
            }]);
        },
    }
};
