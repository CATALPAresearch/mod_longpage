import AnnotationToolbarPopoverWrapper from './AnnotationToolbarPopoverWrapper';
import {createApp} from 'vue';
import {createDiv} from '@/util/misc';
import {i18n} from '@/config/i18n';
import {toIdSelector} from '@/util/style';

const useAnnotationToolbarPopover = (store) => {
    const rootContainerId = 'annnotation-toolbar-popover';
    document.body.appendChild(createDiv({id: rootContainerId}));
    createApp(AnnotationToolbarPopoverWrapper)
        .use(i18n)
        .use(store)
        .mount(toIdSelector(rootContainerId));
};

export const useAnnotations = (store) => {
    useAnnotationToolbarPopover(store);
};
