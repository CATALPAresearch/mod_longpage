/* eslint-disable max-len, no-console, no-undef, no-unused-vars, no-bitwise */
/**
 * Similar:
 * - https://scripting.neurotask.com/assets/js/nm/logger/docs/_build/activity_tracker.html
 * - https://gist.github.com/gaboratorium/736598ec2c001620804e94d370d6fbe3
 * - see works of Andreas Dengel
 *
 * TODO
 * - label fast scrolling and reading in data base
 * - contineously load read progress data
 * - visualize course progress
 * ---
 * - remove jquery
 */
import $ from 'jquery';

export default {
    name: 'ReadingProgress',
    props: ['log', 'context'],

    data: function() {
        return {
        };
    },

    mounted: function() {
        // This.enableScrollLogging();

        // this.visualizeReadingProgress();

        if (
            "IntersectionObserver" in window &&
            "IntersectionObserverEntry" in window &&
            "intersectionRatio" in window.IntersectionObserverEntry.prototype
        ) {
            var observer = new IntersectionObserver(entries => {
                if (entries[0].boundingClientRect.y < 0) {
                    document.getElementById('longpage-navbar').classList.add("header-not-at-top");
                    // Document.getElementById('table-of-content').classList.add("header-not-at-top");
                } else {
                    document.getElementById('longpage-navbar').classList.remove("header-not-at-top");
                    // Document.getElementById('table-of-content').classList.remove("header-not-at-top");
                }
            });
            observer.observe(document.querySelector("#top-of-site-pixel-anchor"));
        }
    },

    methods: {
        enableScrollLogging: function() {
            let _this = this;
            if (
                "IntersectionObserver" in window &&
                "IntersectionObserverEntry" in window &&
                "intersectionRatio" in window.IntersectionObserverEntry.prototype &&
                document.querySelector('.longpage-container')
            ) {
                var measuredElement = document.querySelector('.longpage-container');
                var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                var scrollWidth = document.documentElement.scrollWidth - window.innerWidth;
                var yPadding, xPadding;
                if (window.getComputedStyle && measuredElement) {
                    var computedStyle = window.getComputedStyle(measuredElement);
                    yPadding = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
                    xPadding = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
                }
                // OffsetHeight includes border, padding and margin, but clinetHeight includes onle the padding
                var containerHeight = measuredElement.clientHeight - yPadding;
                var containerWidth = measuredElement.clientWidth - xPadding;

                var scrollXDistance = 0;
                var scrollYDistance = 0;
                var topPadding = 0;
                let last_entry = {};
                var handleScrolling = function(entries) {
                    if (entries[0].boundingClientRect.y < topPadding) {
                        // Document.getElementById('table-of-content').classList.add("scrollDown");//header-not-at-top
                    } else {
                        // Document.getElementById('table-of-content').classList.remove("scrollDown");
                    }


                    let time_diff = 0;
                    // Iterate over all entries that are within the viewport at the same time.
                    for (var entry of entries) {
                        // Feature detection
                        if (typeof entry.isVisible === 'undefined') {
                            // The browser doesn't support Intersection Observer v2, falling back to v1 behavior.
                            entry.isVisible = true;
                        }

                        if (entry.isIntersecting && entry.isVisible) {
                            var now = new Date();
                            let word_count = $('#' + entry.target.id).text().split(' ').length;
                            // TODO: Determine portion of visible text
                            // _this.get($('#' + entry.target.id).get(0)).visibility

                            //
                            scrollXDistance = window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollRight;
                            scrollYDistance = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;

                            var logentry = {
                                utc: now.getTime(),
                                pageid: _this.context.pageid,
                                relativeTime: entry.time, // ??
                                targetID: entry.target.id,
                                targetTag: entry.target.localName,
                                targetClasses: entry.target.className,
                                targetWordCount: word_count,
                                scrollXDistance: scrollXDistance === undefined ? 0 : scrollXDistance,
                                scrollYDistance: scrollYDistance === undefined ? 0 : scrollYDistance,
                                scrollHeight: scrollHeight,
                                scrollWidth: scrollWidth,
                                containerHeight: containerHeight,
                                containerWidth: containerWidth,
                                behavior: null, // Read, scroll, inactive
                            };

                            // Reading detection
                            time_diff = (now.getTime() - last_entry.utc) / 1000; // In seconds
                            let ratio = last_entry.targetWordCount / time_diff;
                            if (ratio < 0.1) {
                                last_entry.behavior = 'idle';
                            } else if (ratio >= 0.1 && ratio <= 3.6) {
                                last_entry.behavior = 'reading';
                            } else {
                                last_entry.behavior = 'scrolling';
                            }

                            // Output
                            console.log(last_entry.targetID + '\t', time_diff + '\t', last_entry.targetWordCount + '\t', ratio.toFixed(1) + '\t', last_entry.behavior);
                            _this.$emit('log', 'scroll', last_entry);

                            last_entry = logentry;
                            // _this.$emit('log', 'scroll', logentry);
                        }
                    }
                };

                var options = {
                    root: null,
                    rootMargin: "0px",
                    threshold: [1.0],
                    trackVisibility: true,
                    delay: 100
                };

                var observer = new IntersectionObserver(handleScrolling, options);
                var pCounter = 0;
                //
                const observedSelectors = [
                    '.longpage-container h2',
                    '.longpage-container h3',
                    '.longpage-container pre',
                    '.longpage-container img',
                    'div.longpage-image-block',
                    'div.longpage-assignment',
                    '.longpage-container p',
                    '.longpage-container .longpage-assignment',
                    '.longpage-container ol',
                    '.longpage-container ul',
                    '.longpage-container h2',
                    '.longpage-container h3',
                    '.longpage-container h4'
                ];
                $(observedSelectors.join(', ')).each(function(i, val) {
                    if ($(this).attr('id') === '' || $(this).attr('id') === undefined) {
                        $(this).attr('id', 'paragraph-' + pCounter).addClass('longpage-paragraph');
                        pCounter++;
                    }
                    observer.observe(document.querySelector("#" + $(this).attr('id')));
                });
            }
        },

        /** Detailed but slow method to estimate the portion of an element that is visble with the viewport. */
        get: function(element) {
            if (typeof element !== "object" || !(element instanceof HTMLElement)) {
 throw new Error("No valid HTMLElement.");
}
            const b = element.getBoundingClientRect();
            const vpw = (window.innerWidth || document.documentElement.clientWidth);
            const vph = (window.innerHeight || document.documentElement.clientHeight);
            let e = {
                element: element,
                dimensions: {
                    height: b.height,
                    width: b.width
                },
                viewport: {
                    width: vpw,
                    height: vph
                },
                position: {
                    top: b.top,
                    left: b.left,
                    right: b.right,
                    bottom: b.bottom,
                    centerX: (b.right + b.width / 2),
                    centerY: (b.top + b.height / 2)
                },
                fullyInsideVP: (b.top >= 0 && b.bottom <= vph && b.left >= 0 && b.right <= vpw) ? true : false,
                isHidden: false, // This._isHidden(),
                visibility: 0
            };

            if (!e.isHidden) {
                let px = 0;
                for (let y = 0; y < Math.floor(b.height); y++) {
                    const posY = b.top + y;
                    for (let x = 0; x < Math.floor(b.width); x++) {
                        const posX = b.left + x;
                        if (posX >= 0 && posX <= vpw && posY >= 0 && posY <= vph) {
                            let elem = document.elementFromPoint(posX, posY);
                            if (elem !== null && elem === element) {
 px++;
}
                        }
                    }
                }
                e.visibility = px / (Math.floor(b.width) * Math.floor(b.height));
                e.visibility = Number(e.visibility.toFixed(2));
            }
            return e;
        },

        visualizeReadingProgress: function() {
            ajax.call([{
                methodname: 'mod_page_getreadingprogress',
                args: {data: {courseid: this.context.courseid, pageid: this.context.pageid}},
                done: function(reads) {
                    try {
                        let data = Object.values(JSON.parse(reads.response));
                        let max = data.reduce((a, b) => a.count > b.count ? a : b).count;
                        for (var i = 0; i < data.length; i++) {
                            $('#' + data[i].section).append(
                                $('<span></span>')
                                    // .text(data[i].section)
                                    // .addClass('reading-progress progress-' + Math.ceil(data[i].count / max * 5))
                            );
                        }
                    } catch (e) {
 console.log(e);
}
                },
                fail: function(e) {
 console.error('fail', e);
}
            }]);
        },
    },

    template: `
        <div></div>
    `
};
