/*
* TODO:
*  - Improve on readability
*/

/**
 * Based on Hypothesis client's modules (see https://github.com/hypothesis/client):
 *   - src/annotator/guest.js
 */
import {debounce, remove} from 'lodash';
import {highlightRange, removeHighlights} from './highlighting';
import {anchor} from './hypothesis/anchoring/html';
import emitter from 'tiny-emitter/instance';
import {MUTATE} from '@/store/types';
import {sniff} from './hypothesis/anchoring/range';

const emitAnchorsUpdate = debounce((anchors) => {
    emitter.emit('anchors-updated', anchors);
}, 500);

export class Anchoring {
    /**
     * @param {HTMLElement} root
     * @param {Anchor[]} anchors
     */
    constructor(root, store, anchors = []) {
        this.anchoring = {anchor};
        this.root = root;
        this.anchors = anchors;
        this.unsubscribe = store.subscribe((mutation) => {
            switch (mutation.type) {
                case MUTATE.ADD_ANNOTATIONS:
                    this.anchorAnnotations(mutation.payload);
                    break;

                case MUTATE.REMOVE_ANNOTATIONS:
                    mutation.payload.forEach(annotation => {
                         this.detachAnnotation(annotation);
                    });
                    break;
                case MUTATE.SET_ANNOTATIONS:
                    this.detachAllAnnotations();
                    this.anchorAnnotations(mutation.payload);
                    break;
                // TODO: Add all annotation manipulation methods

            }
        });
    }

    anchorAnnotations(annotations) {
        annotations.reduce(
            (anchorPromises, annotation) => anchorPromises.then(() => this.anchorAnnotation(annotation)),
            Promise.resolve(),
        );
    }

    /**
     * Anchor (locate) an annotation's selectors in the document.
     * Used after new annotation have been loaded & after new annotation has been created.
     *
     * @param {Annotation} annotation
     * @return {Promise<Anchor[]>}
     */
    anchorAnnotation(annotation) {
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
                !target.selectors ||
                !target.selectors.some(s => s.type === 'TextQuoteSelector')
            ) {
                return Promise.resolve({annotation, target});
            }

            // Find a target using the anchoring module.
            return this.anchoring.anchor(this.root, target.selectors)
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
                anchor.target.styleClass
            ));
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
                if (anchor.target.selectors) {
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
            return anchors;
        };

        /**
         * Inform other parts of the application about
         * the results of anchoring.
         *
         * @param {Anchor[]} anchors
         */
        const sync = anchors => {
            // Add the anchors for this annotation to instance storage.
            this.anchors = this.anchors.concat(anchors);
            emitAnchorsUpdate(this.anchors);
            return anchors;
        };

        // Remove all the anchors for this annotation from the instance storage.
        for (anchor of this.anchors.splice(0, this.anchors.length)) {
            if (anchor.annotation === annotation) {
                // Anchors are valid as long as they still have a range and their target
                // is still in the list of targets for this annotation.
                if (anchor.range && annotation.target === anchor.target) {
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
        // Anchor the target of this annotation that is not anchored already.
        if (!anchoredTargets.includes(annotation.target)) {
            anchor = locate(annotation.target).then(highlight);
            anchors.push(anchor);
        }
        return Promise.all(anchors).then(markOrphans).then(sync);
    }

    /**
     * Remove the anchors and associated highlights for an annotation from the document.
     *
     * @param {Annotation} annotation
     */
    detachAnnotation(annotation) {
        const anchorsOfAnnotation = remove(this.anchors, anchor => anchor.annotation.id === annotation.id);
        emitter.emit('anchors-updated', this.anchors);
        const highlightsOfAnnotation = anchorsOfAnnotation.reduce(
            (highlights, anchor) => highlights.concat(anchor.highlights || []), [],
        );
        this.removeHighlights(highlightsOfAnnotation);
    }

    detachAllAnnotations() {
        this.removeHighlights(this.getAllHighlights());
        this.anchors = [];
    }

    getAllHighlights() {
        return this.anchors.reduce((highlights, anchor) => {
            highlights.push(...(anchor.highlights || []));
            return highlights;
        }, []);
    }

    removeHighlights(highlights) {
        requestAnimationFrame(() => {
            removeHighlights(highlights);
        });
    }
}
