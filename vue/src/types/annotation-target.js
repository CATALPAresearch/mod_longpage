export class AnnotationTarget {
    static preliminaryIdsAssignedCount = 0;

    static _getPreliminaryId() {
        return `new-annotation-target-${AnnotationTarget.preliminaryIdsAssignedCount++}`
    }

    constructor({id = AnnotationTarget._getPreliminaryId(), selectors = [], styleClass}) {
        this.id = id;
        this.selectors = selectors;
        this.styleClass = styleClass;
    }
}
