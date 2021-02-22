import {HighlightingConfig} from '@/config/constants';

export const getHighlightByAnnotationId = annotationId => Array
    .from(document.getElementsByTagName(HighlightingConfig.HL_TAG_NAME))
    .find(element => element._annotation.id === annotationId);
