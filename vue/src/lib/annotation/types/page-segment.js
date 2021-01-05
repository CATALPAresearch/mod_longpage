import {AnnotationTarget} from '@/lib/annotation/types/annotation-target';

export class PageSegment extends AnnotationTarget {
    constructor({selector = [], styleclass}) {
        super();
        this.selector = selector;
        this.styleclass = styleclass;
    }
}