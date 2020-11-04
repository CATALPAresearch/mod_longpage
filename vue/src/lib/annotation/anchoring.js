/**
 * Based on Hypothesis client's modules (see https://github.com/hypothesis/client):
 *   - src/annotator/guest.js
 */
import {highlightRange, removeHighlights} from "./highlighting";
import {anchor} from "./hypothesis/anchoring/html";
import {sniff} from "./hypothesis/anchoring/range";

export class Anchoring {
    /**
     * @param {HTMLElement} root
     * @param {Anchor[]} anchors
     */
    constructor(root, anchors = []) {
        this.anchoring = {anchor};
        this.root = root
        this.anchors = anchors;
    }

    /**
     * Anchor (locate) an annotation's selectors in the document.
     * Used after new annotation have been loaded & after new annotation has been created.
     *
     * @param {Annotation} annotation
     * @param {string} cssClass
     * @return {Promise<Anchor[]>}
     */
    anchor(annotation, cssClass) {
        let anchor;

        // Anchors for all annotations are in the `anchors` instance property. These
        // are anchors for this annotation only. After all the targets have been
        // processed these will be appended to the list of anchors known to the
        // instance. Anchors hold an annotation, a target of that annotation, a
        // document range for that target and an Array of highlights.
        const anchors = [];

        // The targets that are already anchored. This function consults this to
        // determine which targets can be left alone.
        const anchoredTargets = [];

        // These are the highlights for existing anchors of this annotation with
        // targets that have since been removed from the annotation. These will
        // be removed by this function.
        let deadHighlights = [];

        // Initialize the target array.
        if (!annotation.target) {
            annotation.target = [];
        }

        /**
         * Locate the region of the current document that the annotation refers to.
         *
         * @param {Target} target
         */
        const locate = target => {
            // Check that the anchor has a TextQuoteSelector -- without a
            // TextQuoteSelector we have no basis on which to verify that we have
            // reanchored correctly and so we shouldn't even try.
            //
            // Returning an anchor without a range will result in this annotation being
            // treated as an orphan (assuming no other targets anchor).
            if (
                !target.selector ||
                !target.selector.some(s => s.type === 'TextQuoteSelector')
            ) {
                return Promise.resolve({ annotation, target });
            }

            // Find a target using the anchoring module.
            return this.anchoring.anchor(this.root, target.selector)
                .then(range => ({
                    annotation,
                    target,
                    range,
                }))
                .catch(() => ({
                    annotation,
                    target,
                }));
        };

        /**
         * Highlight the range for an anchor.
         *
         * @param {Anchor} anchor
         */
        const highlight = anchor => {
            if (!anchor.range) {
                return anchor;
            }
            const range = sniff(anchor.range);
            const normedRange = range.normalize(this.root);
            const highlights = /** @type {AnnotationHighlight[]} */ (highlightRange(
                normedRange,
                cssClass
            ))
            // You need to put some information on the highlight so when it is clicked later on we can identify the annotation
            highlights.forEach(h => {
                h._annotation = anchor.annotation;
            });
            anchor.highlights = highlights;
            return anchor;
        };

        function getAnnotationsAnchoringState(anchors) {
            let hasAnchorableTargets = false;
            let hasAnchoredTargets = false;
            for (let anchor of anchors) {
                if (anchor.target.selector) {
                    hasAnchorableTargets = true;
                    if (anchor.range) {
                        hasAnchoredTargets = true;
                        break;
                    }
                }
            }
            return {hasAnchorableTargets, hasAnchoredTargets};
        }

        const markOrphans = anchors => {
            // An annotation is considered to be an orphan if it has at least one
            // target with selectors, and all targets with selectors failed to anchor
            // (i.e. we didn't find it in the page and thus it has no range).
            let {hasAnchorableTargets, hasAnchoredTargets} = getAnnotationsAnchoringState(anchors);
            annotation.$orphan = hasAnchorableTargets && !hasAnchoredTargets;
            return anchors
        }

        /**
         * Inform other parts of the application about
         * the results of anchoring.
         *
         * @param {Anchor[]} anchors
         */
        const sync = anchors => {
            // Add the anchors for this annotation to instance storage.
            this.anchors = this.anchors.concat(anchors)
            // TODO: Inform other parts of the application about the results of anchoring.
            return anchors;
        };

        // Remove all the anchors for this annotation from the instance storage.
        for (anchor of this.anchors.splice(0, this.anchors.length)) {
            if (anchor.annotation === annotation) {
                // Anchors are valid as long as they still have a range and their target
                // is still in the list of targets for this annotation.
                if (anchor.range && annotation.target.includes(anchor.target)) {
                    anchors.push(anchor);
                    anchoredTargets.push(anchor.target);
                } else if (anchor.highlights) {
                    // These highlights are no longer valid and should be removed.
                    deadHighlights = deadHighlights.concat(anchor.highlights);
                    delete anchor.highlights;
                    delete anchor.range;
                }
            } else {
                // These can be ignored, so push them back onto the new list.
                this.anchors.push(anchor);
            }
        }

        // Remove all the highlights that have no corresponding target anymore.
        requestAnimationFrame(() => removeHighlights(deadHighlights));

        // Actual work going on
        // Anchor any targets of this annotation that are not anchored already.
        for (let target of annotation.target) {
            if (!anchoredTargets.includes(target)) {
                anchor = locate(target).then(highlight);
                anchors.push(anchor);
            }
        }
        return Promise.all(anchors).then(markOrphans).then(sync);
    }

    /**
     * Remove the anchors and associated highlights for an annotation from the document.
     *
     * @param {Annotation} annotation
     */
    detach(annotation) {
        const anchors = [];
        let unhighlight = [];

        for (let anchor of this.anchors) {
            if (anchor.annotation === annotation) {
                unhighlight.push(...(anchor.highlights || []));
            } else {
                anchors.push(anchor);
            }
        }

        this.anchors = anchors;

        requestAnimationFrame(() => {
            removeHighlights(unhighlight);
        });
    }
}
