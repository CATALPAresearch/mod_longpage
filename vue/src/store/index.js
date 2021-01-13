import AnnotationModule from './modules/annotation-module';
import UserModule from './modules/user-module';
import {createStore} from 'vuex';
import {GET} from './types';

export const initStore = (longpageContext) => createStore({
    modules: {
        AnnotationModule,
        UserModule,
    },
    state: {
        longpageContext,
    },
    getters: {
        [GET.LONGPAGE_CONTEXT]: ({longpageContext}) => longpageContext,
    }
});
