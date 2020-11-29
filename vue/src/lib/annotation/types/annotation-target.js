export class AnnotationTarget {
    constructor({selector = [], pageId, styleclass}) {
        this.selector = selector;
        this.pageId = pageId;
        this.styleclass = styleclass;
    }
}
