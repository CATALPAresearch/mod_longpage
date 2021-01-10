import {AnnotationTarget} from '@/lib/annotation/types/annotation-target';

export class Annotation extends AnnotationTarget {
    constructor({
        $orphan = false,
        anonymous = false,
        body = '',
        id,
        isPrivate = false,
        pageId,
        tags = [],
        target = [],
        timecreated = Date.now(),
        timemodified = Date.now(),
        userId
    }) {
        super();
        this.$orphan = $orphan;
        this.anonymous = anonymous;
        this.body = body;
        this.id = id;
        this.isPrivate = isPrivate;
        this.pageId = pageId;
        this.tags = tags;
        this.target = target;
        this.timecreated = timecreated;
        this.timemodified = timemodified;
        this.userId = userId;
    }
}
