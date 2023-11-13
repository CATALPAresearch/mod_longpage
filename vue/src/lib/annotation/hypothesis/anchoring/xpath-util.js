// Copyright (c) 2013-2019 Hypothes.is Project and contributors
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
//     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
/**
 * Get the node name for use in generating an xpath expression.
 *
 * @param {Node} node
 */
function getNodeName(node) {
  const nodeName = node.nodeName.toLowerCase();
  let result = nodeName;
  if (nodeName === '#text') {
    result = 'text()';
  }
  return result;
}

/**
 * Get the index of the node as it appears in its parent's child list
 *
 * @param {Node} node
 */
function getNodePosition(node) {
  let pos = 0;
  /** @type {Node|null} */
  let tmp = node;
  while (tmp) {
    if (tmp.nodeName === node.nodeName) {
      pos += 1;
    }
    tmp = tmp.previousSibling;
  }
  return pos;
}

function getPathSegment(node) {
  const name = getNodeName(node);
  const pos = getNodePosition(node);
  return `${name}[${pos}]`;
}

/**
 * A simple XPath generator which can generate XPaths of the form
 * /tag[index]/tag[index].
 *
 * @param {Node} node - The node to generate a path to
 * @param {Node} root - Root node to which the returned path is relative
 */
export function xpathFromNode(node, root) {
  let xpath = '';

  /** @type {Node|null} */
  let elem = node;
  while (elem !== root) {
    if (!elem) {
      throw new Error('Node is not a descendant of root');
    }
    xpath = getPathSegment(elem) + '/' + xpath;
    elem = elem.parentNode;
  }
  xpath = '/' + xpath;
  xpath = xpath.replace(/\/$/, ''); // Remove trailing slash

  return xpath;
}

/**
 * Return all text node descendants of `parent`.
 *
 * @param {Node} parent
 * @return {Text[]}
 */
export function getTextNodes(parent) {
  const nodes = [];
  for (let node of Array.from(parent.childNodes)) {
    // We test `nodeType` here rather than using `instanceof` because we have
    // tests where `node` comes from a different iframe.
    if (node.nodeType === Node.TEXT_NODE) {
      nodes.push(/** @type {Text} */ (node));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      nodes.push(...getTextNodes(/** @type {Element} */ (node)));
    }
  }
  return nodes;
}

/**
 * Determine the last text node inside or before the given node.
 */
export function getLastTextNodeUpTo(node) {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      return node; // We have found our text node.
    case Node.ELEMENT_NODE:
      // This is an element, we need to dig in
      if (node.lastChild) {
        // Does it have children at all?
        const result = getLastTextNodeUpTo(node.lastChild);
        if (result) {
          return result;
        }
      }
  }
  // Could not find a text node in current node, go backwards
  const prev = node.previousSibling;
  if (prev) {
    // eslint-disable-next-line no-unused-vars
    return getLastTextNodeUpTo(prev);
  } else {
    return null;
  }
}

/**
 * Determine the first text node in or after the given node.
 */
export function getFirstTextNodeNotBefore(node) {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      return node; // We have found our text node.
    case Node.ELEMENT_NODE:
      // This is an element, we need to dig in
      if (node.firstChild) {
        // Does it have children at all?
        const result = getFirstTextNodeNotBefore(node.firstChild);
        if (result) {
          return result;
        }
      }
  }
  // Could not find a text node in current node, go forward
  const next = node.nextSibling;
  if (next) {
    // eslint-disable-next-line no-unused-vars
    return getFirstTextNodeNotBefore(next);
  } else {
    return null;
  }
}
