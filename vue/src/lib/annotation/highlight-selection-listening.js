import {AnnotationType, HighlightingConfig, LONGPAGE_CONTENT_ID} from '../../config/constants';
import {EventBus} from '@/lib/event-bus';
import {toIdSelector} from '@/util/style';

// Const contentContainer = document.querySelector(toIdSelector(LONGPAGE_CONTENT_ID));
//
//
// contentContainer.addEventListener('click', event => {
//     const highlightsAtClickCoords = getHighlightsAnchoredAt(event.target);
//     EventBus.publish('highlights-selected', highlightsAtClickCoords);
// });

/**
 * Return the annotations associated with any highlights that contain a given
 * DOM node.
 *
 * @param {Node} node
 * @return {AnnotationData[]}
 */
const getAnnotationsAnchoredAt = (node) => {
    const items = getHighlightsContainingNode(node)
        .map(h => /** @type {AnnotationHighlight} */ (h)._annotation)
        .filter(ann => ann !== undefined);

    return /** @type {AnnotationData[]} */ (items);
};

/**
 * Return the highlights associated that contain a given
 * DOM node.
 *
 * @param {Node} node
 * @return {AnnotationData[]}
 */
export const getHighlightsAnchoredAt = (node) => {
    return getAnnotationsAnchoredAt(node)
        .filter(annotation => annotation.type === AnnotationType.HIGHLIGHT);
};

/**
 * Get the highlight elements that contain the given node.
 *
 * @param {Node} node
 * @return {HighlightElement[]}
 */
const getHighlightsContainingNode = (node) => {
    let el =
        node.nodeType === Node.ELEMENT_NODE
            ? /** @type {Element} */ (node)
            : node.parentElement;
    const highlights = [];
    while (el) {
        if (el.classList.contains(HighlightingConfig.HL_CLASS_NAME)) {
            highlights.push(/** @type {HighlightElement} */ (el));
        }
        el = el.parentElement;
    }
    return highlights;
};