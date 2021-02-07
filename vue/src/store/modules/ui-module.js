import {GET, MUTATE} from '../types';

export default {
    state: {
        sidebarTabOpenedKey: undefined
    },
    getters: {
        [GET.SIDEBAR_TAB_OPENED_KEY]: ({sidebarTabOpenedKey}) => sidebarTabOpenedKey
    },
    mutations: {
        [MUTATE.RESET_SIDEBAR_TAB_OPENED_KEY](state, sidebarTabOpenedKey) {
            state.sidebarTabOpenedKey = sidebarTabOpenedKey;
        },
    },
};
