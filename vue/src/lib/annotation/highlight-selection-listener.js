import {HighlightingConfig} from "../../config/constants";

/**
 * Get the highlight elements that contain the given node.
 *
 * @param {Node} node
 * @return {HighlightElement[]}
 */
export function getHighlightsContainingNode(node) {
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
}

/**
 * Return the annotations associated with any highlights that contain a given
 * DOM node.
 *
 * @param {Node} node
 * @return {AnnotationData[]}
 */
function annotationsAt(node) {
    const items = getHighlightsContainingNode(node)
        .map(h => /** @type {AnnotationHighlight} */ (h)._annotation)
        .filter(ann => ann !== undefined);
    return /** @type {AnnotationData[]} */ (items);
}

export const addAnnotationSelectionListener = (callback) => addEventListener('click', event => {
    callback(annotationsAt(event.target));
});
