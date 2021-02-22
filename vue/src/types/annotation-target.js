export class AnnotationTarget {
    constructor({selectors = [], styleClass}) {
        this.selectors = selectors;
        this.styleClass = styleClass;
    }
}
