import {SelectorType} from '@/config/constants';

export const AnnotationCompareFunction = Object.freeze({
    BY_POSITION: (annotationA, annotationB) => {
        const {start: startA = 0} = annotationA.target.selectors.find(s => s.type === SelectorType.TEXT_POSITION_SELECTOR) || {};
        const {start: startB = 0} = annotationB.target.selectors.find(s => s.type === SelectorType.TEXT_POSITION_SELECTOR) || {};
        return startA - startB;
    }
});
