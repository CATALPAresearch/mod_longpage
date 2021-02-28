import AnnotationToolbarController from './AnnotationToolbarController';
import {createApp} from 'vue';
import {createDiv} from '@/util/misc';
import {i18n} from '@/config/i18n';
import {toIdSelector} from '@/util/style';

const useAnnotationToolbar = (store) => {
    const rootContainerId = 'annnotation-toolbar';
    document.body.appendChild(createDiv({id: rootContainerId}));
    createApp(AnnotationToolbarController)
        .use(i18n)
        .use(store)
        .mount(toIdSelector(rootContainerId));
};

export const useAnnotations = (store) => {
    useAnnotationToolbar(store);
};
