import {LONGPAGE_MAIN_ID, LONGPAGE_TEX_OVERLAY_ID, LONGPAGE_TEXT_CONTAINER_ID} from "@/config/constants";
import AnnotationSidebar from "./AnnotationSidebar.vue";
import AnnotationWrapper from "./AnnotationWrapper";
import {createDiv} from "@/util/misc";
import {i18n} from "@/config/i18n";
import {toIdSelector} from "@/util/style";
import {createApp} from "vue";
import {FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText} from "@/assets/icons/font-awesome";

const useAnnotationSidebar = (store) => {
    const rootContainerId = 'annotation-sidebar-wrapper';
    document
        .querySelector(toIdSelector(LONGPAGE_MAIN_ID))
        .appendChild(createDiv({"class": 'col col-4', id: rootContainerId}));
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

const useLongpageTextOverlay = () => {
    const overlay = createDiv({id: LONGPAGE_TEX_OVERLAY_ID});
    document.querySelector(toIdSelector(LONGPAGE_TEXT_CONTAINER_ID)).appendChild(overlay);
    overlay.addEventListener('click', () => {
        overlay.style.display = 'none';
    });
};

export const useAnnotations = (store) => {
    useAnnotationToolbarPopover(store);
    useAnnotationSidebar(store);
    useLongpageTextOverlay();
};
