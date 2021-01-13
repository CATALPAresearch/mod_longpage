import ajax from 'core/ajax';
import {MoodleWSMethods} from '@/config/constants';
import {GET, ACT, MUTATE} from '../types';

export default {
    state: {
        enrolledUsers: [],
    },
    getters: {
        [GET.USER]: ({enrolledUsers}, getters) => enrolledUsers.find(user => user.id === getters[GET.LONGPAGE_CONTEXT].userId),
        [GET.ENROLLED_USERS]: ({enrolledUsers}) => enrolledUsers,
    },
    actions: {
        [ACT.FETCH_ENROLLED_USERS]({commit, getters}) {
            const methodname = MoodleWSMethods.GET_ENROLLED_USERS;
            const context = getters[GET.LONGPAGE_CONTEXT];
            ajax.call([{
                methodname,
                args: {
                    cmid: context.pageId,
                },
                done: ({users}) => {
                    commit(MUTATE.SET_ENROLLED_USERS, users);
                },
                fail: (e) => {
                    console.error('failed', e);
                }
            }]);
        },
    },
    mutations: {
        [MUTATE.SET_ENROLLED_USERS](state, enrolledUsers) {
            state.enrolledUsers = enrolledUsers;
        },
    },
};
