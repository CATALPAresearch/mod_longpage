/**
 * Type definitions for objects passed between the annotator and sidebar.
 */

/**
 * @typedef {import("./api").Selector} Selector
 * @typedef {import("./annotation-target").AnnotationTarget} AnnotationTarget
 */

/**
 * An object representing an annotation in the document.
 *
 * @typedef AnnotationData
 * @prop {string} uri
 * @prop {Target[]} target
 * @prop {string} $tag
 * @prop {boolean} [$highlight] -
 *   Flag indicating that this annotation was created using the "Highlight" button,
 *   as opposed to "Annotate".
 * @prop {boolean} [$orphan] -
 *   Flag indicating that this annotation was not found in the document.
 *   It is initially `undefined` while anchoring is in progress and then set to
 *   `true` if anchoring failed or `false` if it succeeded.
 * @prop {DocumentMetadata} document
 */

/**
 * An object representing the location in a document that an annotation is
 * associated with.
 *
 * @typedef Anchor
 * @prop {Annotation} annotation
 * @prop {HTMLElement[]} [highlights]
 * @prop {Range} [range]
 * @prop {AnnotationTarget} target
 */

// Make TypeScript treat this file as a module.
export const unused = {};
