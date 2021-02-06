import {GET, MUTATE} from '../types';

export default {
    state: {
        sidebarTabOpened: undefined
    },
    getters: {
        [GET.SIDEBAR_TAB_OPENED]: ({sidebarTabOpened}) => sidebarTabOpened
    },
    mutations: {
        [MUTATE.SET_SIDEBAR_TAB_OPENED](state, sidebarTabOpened) {
            state.sidebarTabOpened = sidebarTabOpened;
        },
    },
};
