import {AnnotationType} from '@/config/constants';
import {AnnotationTarget} from '@/types/annotation-target';

export class Annotation {
    static preliminaryIdsAssignedCount = 0;

    static _getPreliminaryId() {
        return `new-annotation-${Annotation.preliminaryIdsAssignedCount++}`
    }

    constructor({
        $orphan = false,
        id = Annotation._getPreliminaryId(),
        body,
        creatorId,
        isPublic = false,
        pageId,
        target = new AnnotationTarget({}),
        timeCreated,
        timeModified,
        type = AnnotationType.HIGHLIGHT,
    }) {
        this.$orphan = $orphan;
        this.id = id;
        this.body = body;
        this.creatorId = creatorId;
        this.isPublic = isPublic;
        this.pageId = pageId;
        this.target = target;
        this.timeCreated = timeCreated;
        this.timeModified = timeModified;
        this.type = type;
    }

    get created() {
        return Boolean(this.timecreated);
    }
}
