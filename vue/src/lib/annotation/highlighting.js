/*
  TODO: Use our css class, tag, _annotation (data) for annotation
    - Remove dependencies on hypothesis styles or include them in project
 */
/**
 * Based on Hypothesis client's modules (see https://github.com/hypothesis/client):
 *   - src/annotator/highlighter.js
 */
import {HighlightingConfig} from '../../config/constants';

/**
 * Subset of the `NormalizedRange` class defined in `range.js` that this
 * module currently uses.
 *
 * @typedef NormalizedRange
 * @prop {() => Node[]} textNodes
 */

/**
 * Wraps the DOM Nodes within the provided range with a highlight
 * element of the specified class and returns the highlight Elements.
 *
 * @param {NormalizedRange} normedRange - Range to be highlighted.
 * @param {string} cssClass - A CSS class to use for the highlight
 * @return {HighlightElement[]} - Elements wrapping text in `normedRange` to add a highlight effect
 */
export function highlightRange(normedRange, cssClass) {
  const white = /^\s*$/;

  // Find text nodes within the range to highlight.
  const textNodes = normedRange.textNodes();

  // Group text nodes into spans of adjacent nodes. If a group of text nodes are
  // adjacent, we only need to create one highlight element for the group.
  let textNodeSpans = [];
  let prevNode = null;
  let currentSpan = null;

  textNodes.forEach(node => {
    if (prevNode && prevNode.nextSibling === node) {
      currentSpan.push(node);
    } else {
      currentSpan = [node];
      textNodeSpans.push(currentSpan);
    }
    prevNode = node;
  });

  // PostFilter out text node spans that consist only of white space. This avoids
  // inserting highlight elements in places that can only contain a restricted
  // subset of nodes such as table rows and lists.
  textNodeSpans = textNodeSpans.filter(span =>
    // Check for at least one text node with non-space content.
    span.some(node => !white.test(node.nodeValue))
  );

  // Wrap each text node span with a `<{{ Config.HL_TAG_NAME }}>` element.
  const highlights = [];
  textNodeSpans.forEach(nodes => {
    // A custom element name is used here rather than `<span>` to reduce the
    // likelihood of highlights being hidden by page styling.

    /** @type {HighlightElement} */
    const highlightEl = document.createElement(HighlightingConfig.HL_TAG_NAME);
    highlightEl.className = [HighlightingConfig.HL_CLASS_NAME, cssClass].join(' ');

    nodes[0].parentNode.replaceChild(highlightEl, nodes[0]);
    nodes.forEach(node => highlightEl.appendChild(node));

    highlights.push(highlightEl);
  });

  return highlights;
}

/**
 * Replace a child `node` with `replacements`.
 *
 * nb. This is like `ChildNode.replaceWith` but it works in older browsers.
 *
 * @param {ChildNode} node
 * @param {Node[]} replacements
 */
function replaceWith(node, replacements) {
  const parent = /** @type {Node} */ (node.parentNode);
  replacements.forEach(r => parent.insertBefore(r, node));
  node.remove();
}

/**
 * Remove all highlights under a given root element.
 *
 * @param {HTMLElement} root
 */
export function removeAllHighlights(root) {
  const highlights = Array.from(root.querySelectorAll(HighlightingConfig.HL_TAG_NAME));
  removeHighlights(/** @type {HighlightElement[]} */ (highlights));
}

/**
 * Remove highlights from a range previously highlighted with `highlightRange`.
 *
 * @param {HighlightElement[]} highlights - The highlight elements returned by `highlightRange`
 */
export function removeHighlights(highlights) {
  for (let h of highlights) {
    if (h.parentNode) {
      const children = Array.from(h.childNodes);
      replaceWith(h, children);
    }

    if (h.svgHighlight) {
      h.svgHighlight.remove();
    }
  }
}

/**
 * Set whether highlights under the given root element should be visible.
 *
 * @param {HTMLElement} root
 * @param {boolean} visible
 */
export function setHighlightsVisible(root, visible) {
  const showHighlightsClass = HighlightingConfig.SHOW_HLS_CLASS_NAME;
  root.classList.toggle(showHighlightsClass, visible);
}

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