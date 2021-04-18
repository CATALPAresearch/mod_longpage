import './components/LongpageContent/Footnote';
import './lib/hashchange-listening';
import './lib/page-ready-listening';
import './lib/scroll-snapping';
import App from './App.vue';
import {createApp} from 'vue';
import {initStore} from '@/store';
import {LONGPAGE_APP_CONTAINER_ID} from '@/config/constants';
import {toIdSelector} from '@/util/style';
import {i18n} from '@/config/i18n';

export const init = (courseId, pageId, pageName, userId, content, scrollTop) => {
    try {
        const store = initStore({courseId: Number(courseId), pageId: Number(pageId), pageName, userId: Number(userId)});
        createApp(App, {content, scrollTop: Number(scrollTop)})
            .use(store)
            .use(i18n)
            .mount(toIdSelector(LONGPAGE_APP_CONTAINER_ID));
    } catch (e) {
        /* eslint-disable no-console */
        console.error(e);
    }
};
