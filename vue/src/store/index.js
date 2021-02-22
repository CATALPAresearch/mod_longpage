import AnnotationModule from './modules/annotation-module';
import PostModule from './modules/post-module';
import UIModule from './modules/ui-module';
import UserModule from './modules/user-module';
import {createStore} from 'vuex';
import {GET} from './types';

export const initStore = (longpageContext) => createStore({
    modules: {
        AnnotationModule,
        PostModule,
        UIModule,
        UserModule,
    },
    state: {
        longpageContext,
    },
    getters: {
        [GET.LONGPAGE_CONTEXT]: ({longpageContext}) => longpageContext,
    }
});
