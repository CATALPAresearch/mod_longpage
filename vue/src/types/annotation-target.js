import {SelectorType} from "@/config/constants";

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

    get text() {
        const textQuoteSelector = this.selectors.find(sel => sel.type === SelectorType.TEXT_QUOTE_SELECTOR);
        return textQuoteSelector && textQuoteSelector.exact;
    }
}
