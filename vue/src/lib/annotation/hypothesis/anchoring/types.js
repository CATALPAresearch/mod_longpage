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
 * This module exports a set of classes for converting between DOM `Range`
 * objects and different types of selectors. It is mostly a thin wrapper around a
 * set of anchoring libraries. It serves two main purposes:
 *
 *  1. Providing a consistent interface across different types of anchors.
 *  2. Insulating the rest of the code from API changes in the underlying anchoring
 *     libraries.
 */
import {
  fromRange as posFromRange,
  toRange as posToRange,
} from 'dom-anchor-text-position';
import {
  fromRange as quoteFromRange,
  toRange as quoteToRange,
  toTextPosition,
} from 'dom-anchor-text-quote';

import {SerializedRange, sniff} from './range';

/**
 * @typedef {import("./range").BrowserRange} BrowserRange}
 * @typedef {import("./range").NormalizedRange} NormalizedRange}
 * @typedef {Range|BrowserRange|NormalizedRange|SerializedRange} AnyRangeType
 *
 * @typedef {import('../../api').RangeSelector} RangeSelector
 * @typedef {import('../../api').TextPositionSelector} TextPositionSelector
 * @typedef {import('../../api').TextQuoteSelector} TextQuoteSelector
 *
 * @typedef TextContentNode
 * @prop {string} textContent
 */

/**
 * Converts between `RangeSelector` selectors and `Range` objects.
 */
export class RangeAnchor {
  /**
   * @param {Node} root - A root element from which to anchor.
   * @param {AnyRangeType} range -  A range describing the anchor.
   */
  constructor(root, range) {
    this.root = root;
    this.range = sniff(range).normalize(this.root);
  }

  /**
   * @param {Node} root -  A root element from which to anchor.
   * @param {AnyRangeType} range -  A range describing the anchor.
   */
  static fromRange(root, range) {
    return new RangeAnchor(root, range);
  }

  /**
   * Create an anchor from a serialized `RangeSelector` selector.
   *
   * @param {Node} root -  A root element from which to anchor.
   * @param {RangeSelector} selector
   */
  static fromSelector(root, selector) {
    const data = {
      start: selector.startContainer,
      startOffset: selector.startOffset,
      end: selector.endContainer,
      endOffset: selector.endOffset,
    };
    const range = new SerializedRange(data);
    return new RangeAnchor(root, range);
  }

  toRange() {
    return this.range.toRange();
  }

  /**
   * @return {RangeSelector}
   */
  toSelector() {
    const range = this.range.serialize(this.root);
    return {
      type: 'RangeSelector',
      startContainer: range.start,
      startOffset: range.startOffset,
      endContainer: range.end,
      endOffset: range.endOffset,
    };
  }
}

/**
 * Converts between `TextPositionSelector` selectors and `Range` objects.
 */
export class TextPositionAnchor {
  /**
   * @param {Node|TextContentNode} root
   * @param {number} start
   * @param {number} end
   */
  constructor(root, start, end) {
    this.root = root;
    this.start = start;
    this.end = end;
  }

  /**
   * @param {Node} root
   * @param {Range} range
   */
  static fromRange(root, range) {
    const selector = posFromRange(root, range);
    return TextPositionAnchor.fromSelector(root, selector);
  }
  /**
   * @param {Node} root
   * @param {TextPositionSelector} selector
   */
  static fromSelector(root, selector) {
    return new TextPositionAnchor(root, selector.start, selector.end);
  }

  /**
   * @return {TextPositionSelector}
   */
  toSelector() {
    return {
      type: 'TextPositionSelector',
      start: this.start,
      end: this.end,
    };
  }

  toRange() {
    return posToRange(this.root, {start: this.start, end: this.end});
  }
}

/**
 * Converts between `TextQuoteSelector` selectors and `Range` objects.
 */
export class TextQuoteAnchor {
  /**
   * @param {Node|TextContentNode} root - A root element from which to anchor.
   * @param {string} exact
   * @param {Object} context
   *   @param {string} [context.prefix]
   *   @param {string} [context.suffix]
   */
  constructor(root, exact, context = {}) {
    this.root = root;
    this.exact = exact;
    this.context = context;
  }
  /**
   * @param {Node} root
   * @param {Range} range
   */
  static fromRange(root, range) {
    const selector = quoteFromRange(root, range);
    return TextQuoteAnchor.fromSelector(root, selector);
  }

  /**
   * @param {Node|TextContentNode} root
   * @param {TextQuoteSelector} selector
   */
  static fromSelector(root, selector) {
    const {prefix, suffix} = selector;
    return new TextQuoteAnchor(root, selector.exact, {prefix, suffix});
  }

  /**
   * @return {TextQuoteSelector}
   */
  toSelector() {
    return {
      type: 'TextQuoteSelector',
      exact: this.exact,
      prefix: this.context.prefix,
      suffix: this.context.suffix,
    };
  }

  /**
   * @param {Object} [options]
   *   @param {number} [options.hint] -
   *     Offset hint to disambiguate matches
   *     https://github.com/tilgovi/dom-anchor-text-quote#totextpositionroot-selector-options
   */
  toRange(options = {}) {
    const range = quoteToRange(this.root, this.toSelector(), options);
    if (range === null) {
      throw new Error('Quote not found');
    }
    return range;
  }

  /**
   * @param {Object} [options]
   *   @param {number} [options.hint] -
   *     Offset hint to disambiguate matches
   *     https://github.com/tilgovi/dom-anchor-text-quote#totextpositionroot-selector-options
   */
  toPositionAnchor(options = {}) {
    const anchor = toTextPosition(this.root, this.toSelector(), options);
    if (anchor === null) {
      throw new Error('Quote not found');
    }
    return new TextPositionAnchor(this.root, anchor.start, anchor.end);
  }
}
