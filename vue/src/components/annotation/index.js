import {FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText} from '@/assets/icons/font-awesome';
import {LONGPAGE_MAIN_ID, LONGPAGE_TEXT_CONTAINER_ID} from '@/config/constants';
import AnnotationBodyIndicators from '@/components/annotation/AnnotationBodyIndicators';
import AnnotationSidebar from './AnnotationSidebar.vue';
import AnnotationWrapper from './AnnotationWrapper';
import {createApp} from 'vue';
import {createDiv} from '@/util/misc';
import {i18n} from '@/config/i18n';
import {toIdSelector} from '@/util/style';

const useAnnotationSidebar = (store) => {
    const rootContainerId = 'longpage-sidebar';
    document
        .querySelector(toIdSelector(LONGPAGE_MAIN_ID))
        .appendChild(createDiv({class: 'col col-auto', id: rootContainerId}));
    createApp(AnnotationSidebar)
        .component('font-awesome-icon', FontAwesomeIcon)
        .component('font-awesome-layers', FontAwesomeLayers)
        .component('font-awesome-layers-text', FontAwesomeLayersText)
        .use(i18n)
        .use(store)
        .mount(toIdSelector(rootContainerId));
};

const useAnnotationToolbarPopover = (store) => {
    const rootContainerId = 'annnotation-toolbar-popover';
    document.body.appendChild(createDiv({id: rootContainerId}));
    createApp(AnnotationWrapper)
        .use(i18n)
        .use(store)
        .mount(toIdSelector(rootContainerId));
};

export const useAnnotations = (store) => {
    useAnnotationToolbarPopover(store);
    useAnnotationSidebar(store);
};
