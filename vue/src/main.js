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
import './lib/scroll-snapping';
import App from './App.vue';
import {createApp} from 'vue';
import {initStore} from '@/store';
import {LONGPAGE_APP_CONTAINER_ID} from '@/config/constants';
import {toIdSelector} from '@/util/style';
import {useAnnotations} from './components/annotation';
import {FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText} from '@/assets/icons/font-awesome';
import {i18n} from '@/config/i18n';

export const init = (courseId, pageId, pageName, userId, content) => {
  try {
      const store = initStore({courseId: Number(courseId), pageId: Number(pageId), pageName, userId: Number(userId)});
      createApp(App, {content})
          .use(store)
          .use(i18n)
          .component('font-awesome-icon', FontAwesomeIcon)
          .component('font-awesome-layers', FontAwesomeLayers)
          .component('font-awesome-layers-text', FontAwesomeLayersText)
          .mount(toIdSelector(LONGPAGE_APP_CONTAINER_ID));
      useAnnotations(store);
  } catch (e) {
    /* eslint-disable no-console */
    console.error(e);
  }
};
