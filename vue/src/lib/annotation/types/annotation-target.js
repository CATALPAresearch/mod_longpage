export class AnnotationTarget {
    constructor(selectors = [], pageid, styleclass) {
        this.selector = selectors;
        this.pageid = pageid;
        this.styleclass = styleclass;
    }
}
