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
 * Functions (aka. 'operators') for generating and manipulating streams of
 * values using the Observable API.
 */

import Observable from 'zen-observable';

/**
 * Returns an observable of events emitted by a DOM event source
 * (eg. an Element, Document or Window).
 *
 * @param {EventTarget} src - The event source.
 * @param {Array<string>} eventNames - List of events to subscribe to
 */
export function listen(src, eventNames) {
  return new Observable(function (observer) {
    const onNext = function (event) {
      observer.next(event);
    };

    eventNames.forEach(function (event) {
      src.addEventListener(event, onNext);
    });

    return function () {
      eventNames.forEach(function (event) {
        src.removeEventListener(event, onNext);
      });
    };
  });
}

/**
 * Delay events from a source Observable by `delay` ms.
 */
export function delay(delay, src) {
  return new Observable(function (obs) {
    let timeouts = [];
    const sub = src.subscribe({
      next: function (value) {
        const t = setTimeout(function () {
          timeouts = timeouts.filter(function (other) {
            return other !== t;
          });
          obs.next(value);
        }, delay);
        timeouts.push(t);
      },
    });
    return function () {
      timeouts.forEach(clearTimeout);
      sub.unsubscribe();
    };
  });
}

/**
 * Buffers events from a source Observable, waiting for a pause of `delay`
 * ms with no events before emitting the last value from `src`.
 *
 * @template T
 * @param {number} delay
 * @param {Observable<T>} src
 * @return {Observable<T>}
 */
export function buffer(delay, src) {
  return new Observable(function (obs) {
    let lastValue;
    let timeout;

    function onNext() {
      obs.next(lastValue);
    }

    const sub = src.subscribe({
      next: function (value) {
        lastValue = value;
        clearTimeout(timeout);
        timeout = setTimeout(onNext, delay);
      },
    });

    return function () {
      sub.unsubscribe();
      clearTimeout(timeout);
    };
  });
}

/**
 * Merges multiple streams of values into a single stream.
 *
 * @param {Array<Observable>} sources
 * @return Observable
 */
export function merge(sources) {
  return new Observable(function (obs) {
    const subs = sources.map(function (src) {
      return src.subscribe({
        next: function (value) {
          obs.next(value);
        },
      });
    });

    return function () {
      subs.forEach(function (sub) {
        sub.unsubscribe();
      });
    };
  });
}

/** Drop the first `n` events from the `src` Observable. */
export function drop(src, n) {
  let count = 0;
  return src.filter(function () {
    ++count;
    return count > n;
  });
}

export { Observable };
