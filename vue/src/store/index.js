import AnnotationModule from './modules/annotation-module';
import Vuex, {Store} from 'vuex';
import Vue from 'vue';
import {GET} from "./types";

Vue.use(Vuex);

export const createStore = (longpageContext) => new Store({
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
