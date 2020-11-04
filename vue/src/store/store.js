import AnnotationModule from './modules/annotation-module';
import {createBookmarkingModule} from './modules/bookmarking-module';
import Vuex, {Store} from 'vuex';
import Vue from 'vue';

Vue.use(Vuex);

export const createStore = (context) => new Store({
  modules: {
    AnnotationModule,
    BookmarkingModule: createBookmarkingModule(context),
  },
  state: {
    courseid: context.courseid,
    pageid: context.pageid,
    pagename: context.pagename,
  },
});
