import ajax from 'core/ajax';
import {MoodleWSMethods} from '@/config/constants';
import {GET, ACT, MUTATE} from '../types';
import {User} from '@/types/user';

export default {
    state: {
        enrolledUsers: [],
        userRoles: [],
    },
    getters: {
        [GET.USER]: ({enrolledUsers}, getters) => id => enrolledUsers.find(
            user => user.id === (id || getters[GET.LONGPAGE_CONTEXT].userId)
        ),
        [GET.ENROLLED_USERS]: ({enrolledUsers}) => enrolledUsers,
    },
    actions: {
        [ACT.FETCH_ENROLLED_USERS]({commit, getters}) {
            const context = getters[GET.LONGPAGE_CONTEXT];
            ajax.call([{
                methodname: MoodleWSMethods.GET_ENROLLED_USERS,
                args: {
                    pageid: context.pageId,
                },
                done: ({users}) => {
                    commit(MUTATE.SET_ENROLLED_USERS, users.map(response => new User(response)));
                },
                fail: (e) => {
                    console.error(`"${MoodleWSMethods.GET_ENROLLED_USERS}" failed`, e);
                }
            }]);
        },
        [ACT.FETCH_USER_ROLES]({commit, getters}) {
            const context = getters[GET.LONGPAGE_CONTEXT];
            ajax.call([{
                methodname: MoodleWSMethods.GET_USER_ROLES_FOR_MODULE,
                args: {
                    pageid: context.pageId,
                },
                done: ({userroles}) => {
                    commit(MUTATE.SET_USER_ROLES, userroles);
                },
                fail: (e) => {
                    console.error(`"${MoodleWSMethods.GET_USER_ROLES_FOR_MODULE}" failed`, e);
                }
            }]);
        },
    },
    mutations: {
        [MUTATE.SET_ENROLLED_USERS](state, enrolledUsers) {
            state.enrolledUsers = enrolledUsers;
        },
        [MUTATE.SET_USER_ROLES](state, enrolledUsers) {
            state.enrolledUsers = enrolledUsers;
        },
    },
};
