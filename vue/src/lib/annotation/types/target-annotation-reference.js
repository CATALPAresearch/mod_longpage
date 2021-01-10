import {AnnotationTarget} from '@/lib/annotation/types/annotation-target';
import {AnnotationTargetType} from '@/config/constants';

export class TargetAnnotationReference extends AnnotationTarget {
    constructor({annotationId}) {
        super({type: AnnotationTargetType.ANNOTATION});
        this.annotationId = annotationId;
    }
}