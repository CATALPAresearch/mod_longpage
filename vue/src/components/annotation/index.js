import {LONGPAGE_MAIN_ID, LONGPAGE_TEX_OVERLAY_ID, LONGPAGE_TEXT_CONTAINER_ID} from "@/config/constants";
import AnnotationSidebar from "./AnnotationSidebar";
import AnnotationWrapper from "./AnnotationWrapper";
import {createDiv} from "@/util/misc";
import {i18n} from "@/config/i18n";
import {toIdSelector} from "@/util/style";
import Vue from "vue";

const useAnnotationSidebar = (store) => {
    document.querySelector(toIdSelector(LONGPAGE_MAIN_ID)).appendChild(createDiv({id: 'annotation-sidebar'}));
    new Vue({
        el: '#annotation-sidebar',
        i18n,
        store,
        render: h => h(AnnotationSidebar),
    });
};

const useAnnotationToolbarPopover = (store) => {
    document.body.appendChild(createDiv({id: 'annnotation-toolbar-popover'}));
    new Vue({
        el: '#annnotation-toolbar-popover',
        i18n,
        store,
        render: h => h(AnnotationWrapper),
    });
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
