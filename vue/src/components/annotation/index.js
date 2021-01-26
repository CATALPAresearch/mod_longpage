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
    const rootContainerId = 'annotation-sidebar-wrapper';
    document
        .querySelector(toIdSelector(LONGPAGE_MAIN_ID))
        .appendChild(createDiv({class: 'col col-4', id: rootContainerId}));
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

const useAnnotationBodyIndicatorSidebar = (store) => {
    const id = 'annotation-body-indicator-sidebar';
    const root = createDiv({id, class: 'col col-auto p-0 mx-1', style: 'width: 1.5em;'});
    document.querySelector(toIdSelector(LONGPAGE_TEXT_CONTAINER_ID)).appendChild(root);
    createApp(AnnotationBodyIndicators, {parentElement: root})
        .component('font-awesome-icon', FontAwesomeIcon)
        .component('font-awesome-layers', FontAwesomeLayers)
        .component('font-awesome-layers-text', FontAwesomeLayersText)
        .use(i18n)
        .use(store)
        .mount(toIdSelector(id));
};

export const useAnnotations = (store) => {
    useAnnotationToolbarPopover(store);
    useAnnotationSidebar(store);
    useAnnotationBodyIndicatorSidebar(store);
};
