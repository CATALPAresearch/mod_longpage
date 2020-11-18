export class AnnotationTarget {
    constructor({selector = [], pageid, styleclass}) {
        this.selector = selector;
        this.pageid = pageid;
        this.styleclass = styleclass;
    }
}
