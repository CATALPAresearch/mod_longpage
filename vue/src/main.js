/**
 * See also https://github.com/zack24q/vue-navigation/
 *
 * @module     mod/longpage
 * @package    mod_longpage
 * @class      longpage
 * @copyright  2020 Niels Seidel <niels.seidel@fernuni-hagen.de>
 * @license    MIT
 * @since      3.1
 */
import './assets/icons';
import './components/Footnote';
import App from './App.vue';
import {createApp} from 'vue';
import {initStore} from '@/store';
import {LONGPAGE_HEADER_ID} from '@/config/constants';
import {toIdSelector} from '@/util/style';
import {useAnnotations} from './components/annotation';

export const init = (courseId, pageId, pageName, userId) => {
  try {
      const store = initStore({courseId: Number(courseId), pageId: Number(pageId), pageName, userId: Number(userId)});
      createApp(App)
          .use(store)
          .mount(toIdSelector(LONGPAGE_HEADER_ID));
      useAnnotations(store);
  } catch (e) {
    /* eslint-disable no-console */
    console.error(e);
  }
};
