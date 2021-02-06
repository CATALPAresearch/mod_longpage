import {AnnotationTarget} from '@/lib/annotation/types/annotation-target';
import {AnnotationTargetType} from '@/config/constants';

export class PageSegment extends AnnotationTarget {
    constructor({selector = [], styleClass}) {
        super({type: AnnotationTargetType.PAGE_SEGMENT});
        this.selector = selector;
        this.styleClass = styleClass;
    }
}