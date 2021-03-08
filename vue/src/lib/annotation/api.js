/**
 * Type definitions for objects returned from the Hypothesis API.
 *
 * The canonical reference is the API documentation at
 * https://h.readthedocs.io/en/latest/api-reference/
 */

/**
 * @typedef {import("../../types/annotation-target").AnnotationTarget} AnnotationTarget
 */

/**
 * @typedef TextQuoteSelector
 * @prop {'TextQuoteSelector'} type
 * @prop {string} exact
 * @prop {string} [prefix]
 * @prop {string} [suffix]
 */

/**
 * @typedef TextPositionSelector
 * @prop {'TextPositionSelector'} type
 * @prop {number} start
 * @prop {number} end
 */

/**
 * @typedef RangeSelector
 * @prop {'RangeSelector'} type
 * @prop {string} startContainer
 * @prop {string} endContainer
 * @prop {number} startOffset
 * @prop {number} endOffset
 */

/**
 * @typedef {TextQuoteSelector | TextPositionSelector | RangeSelector} Selector
 */

/**
 * @typedef Annotation
 * @prop {string} [id] - TODO
 *   The server-assigned ID for the annotation. This is only set once the
 *   annotation has been saved to the backend.
 * @prop {string} $tag - A locally-generated unique identifier for annotations.
 *   This is set for all annotations, whether they have been saved to the backend
 *   or not. TODO
 * @prop {string} timecreated
 * @prop {string} timemodified
 * @prop {number} userId
 * @prop {boolean} hidden TODO
 *
 * @prop {AnnotationTarget[]} target
 *
 * @prop {string[]} tags - TODO in an array of bodys
 * @prop {string} text - TODO in an array of bodys
 *
 * // Properties not present on API objects, but added by utilities in the client.
 * @prop {boolean} [$orphan]
 */

// Make TypeScript treat this file as a module.
export const unused = {};
