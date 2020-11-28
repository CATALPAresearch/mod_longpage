import AnnotationModule from './modules/annotation-module';
import Vuex, {Store} from 'vuex';
import Vue from 'vue';
import {GET} from "./types";

Vue.use(Vuex);

export const createStore = (context) => new Store({
  modules: {
    AnnotationModule,
  },
  state: {
    courseid: context.courseid,
    pageid: context.pageid,
    pagename: context.pagename,
    userId: context.userId,
  },
  getters: {
    [GET.COURSE_ID]: ({courseid}) => courseid,
    [GET.PAGE_ID]: ({pageid}) => pageid,
    [GET.PAGE_NAME]: ({pagename}) => pagename,
    [GET.USER_ID]: ({userId}) => userId
  }
});
