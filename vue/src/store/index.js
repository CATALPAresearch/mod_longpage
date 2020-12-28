import AnnotationModule from './modules/annotation-module';
import {createStore} from 'vuex';
import {GET} from "./types";

export const initStore = (longpageContext) => createStore({
    modules: {
      AnnotationModule,
    },
    state: {
      longpageContext,
    },
    getters: {
      [GET.LONGPAGE_CONTEXT]: ({longpageContext}) => longpageContext,
    }
});
