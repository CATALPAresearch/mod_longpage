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
import {RangeAnchor, TextPositionAnchor, TextQuoteAnchor} from './types';

/**
 * @typedef {import("./types").AnyRangeType} AnyRangeType
 * @typedef {import('../../api').Selector} Selector
 */

/**
 * @param {RangeAnchor|TextPositionAnchor|TextQuoteAnchor} anchor
 * @param {Object} [options]
 *  @param {number} [options.hint]
 */
async function querySelector(anchor, options = {}) {
  return anchor.toRange(options);
}

/**
 * Anchor a set of selectors.
 *
 * This function converts a set of selectors into a document range.
 * It encapsulates the core anchoring algorithm, using the selectors alone or
 * in combination to establish the best anchor within the document.
 *
 * @param {Node} root - The root element of the anchoring context.
 * @param {Selector[]} selectors - The selectors to try.
 * @param {Object} [options]
 *   @param {number} [options.hint]
 */
export function anchor(root, selectors, options = {}) {
  let position = null;
  let quote = null;
  let range = null;

  // Collect all the selectors
  for (let selector of selectors) {
    switch (selector.type) {
      case 'TextPositionSelector':
        position = selector;
        options.hint = position.start; // TextQuoteAnchor hint
        break;
      case 'TextQuoteSelector':
        quote = selector;
        break;
      case 'RangeSelector':
        range = selector;
        break;
    }
  }

  /**
   * Assert the quote matches the stored quote, if applicable
   * @param {Range} range
   */
  const maybeAssertQuote = range => {
    return range;                             // TODO once MathJax and Hypothesis.js wont cause double formulas anymore, this can be put back in
    if (quote && quote.exact && range.toString() !== quote.exact) {
      throw new Error('quote mismatch');
    } else {
      return range;
    }
  };

  // From a default of failure, we build up catch clauses to try selectors in
  // order, from simple to complex.
  /** @type {Promise<Range>} */
  let promise = Promise.reject('unable to anchor');

  if (range) {
    promise = promise.catch(() => {
      let anchor = RangeAnchor.fromSelector(root, range);
      return querySelector(anchor, options).then(maybeAssertQuote);
    });
  }

  if (position) {
    promise = promise.catch(() => {
      let anchor = TextPositionAnchor.fromSelector(root, position);
      return querySelector(anchor, options).then(maybeAssertQuote);
    });
  }

  if (quote) {
    promise = promise.catch(() => {
      let anchor = TextQuoteAnchor.fromSelector(root, quote);
      return querySelector(anchor, options);
    });
  }

  return promise;
}

/**
 * @param {Node} root
 * @param {Range} range
 */
export function describe(root, range) {
  const types = [RangeAnchor, TextPositionAnchor, TextQuoteAnchor];
  const result = [];
  for (let type of types) {
    try {
      const anchor = type.fromRange(root, range);
      result.push(anchor.toSelector());
    } catch (error) {
      continue;
    }
  }
  return result;
}
