define([
    'jquery',
    M.cfg.wwwroot + '/mod/page/lib/build/vue.min'
], function ($, Vue) {

    Vue.component('ReadingProgress',
        {
            props: ['log'],

            data: function () {
                return {
                    //showTOC: false,
                }
            },

            mounted: function () {
                this.enableScrollLogging();

                this.visualizeReadingProgress();

                if (
                    "IntersectionObserver" in window &&
                    "IntersectionObserverEntry" in window &&
                    "intersectionRatio" in window.IntersectionObserverEntry.prototype
                ) {
                    var observer = new IntersectionObserver(entries => {
                        if (entries[0].boundingClientRect.y < 0) {
                            document.getElementById('longpage-navbar').classList.add("header-not-at-top");
                            //document.getElementById('table-of-content').classList.add("header-not-at-top");
                        } else {
                            document.getElementById('longpage-navbar').classList.remove("header-not-at-top");
                            //document.getElementById('table-of-content').classList.remove("header-not-at-top");
                        }
                    });
                    observer.observe(document.querySelector("#top-of-site-pixel-anchor"));
                }
            },

            methods: {
                enableScrollLogging: function () {
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
                        //offsetHeight includes border, padding and margin, but clinetHeight includes onle the padding
                        var containerHeight = measuredElement.clientHeight - yPadding;
                        var containerWidth = measuredElement.clientWidth - xPadding;

                        var scrollXDistance = 0;
                        var scrollYDistance = 0;
                        var topPadding = 0;
                        var handleScrolling = function (entries) {
                            //console.log(entries[0].boundingClientRect.y, entries[0].target);
                            if (entries[0].boundingClientRect.y < topPadding) {
                                //document.getElementById('table-of-content').classList.add("scrollDown");//header-not-at-top
                                //console.log('smaller 0', entries[0].target);
                            } else {
                                //document.getElementById('table-of-content').classList.remove("scrollDown");
                                //console.log('greater 0', entries[0].target);
                            }

                            for (var entry of entries) {
                                // feature detection
                                if (typeof entry.isVisible === 'undefined') {
                                    // The browser doesn't support Intersection Observer v2, falling back to v1 behavior.
                                    entry.isVisible = true;
                                }
                                if (entry.isIntersecting && entry.isVisible) {
                                    var now = new Date();
                                    scrollXDistance = window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollRight;
                                    scrollYDistance = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;
                                    var logentry = {
                                        utc: now.getTime(),
                                        relativeTime: entry.time,
                                        targetID: entry.target.id,
                                        targetTag: entry.target.localName,
                                        targetClasses: entry.target.className,
                                        scrollXDistance: scrollXDistance === undefined ? 0 : scrollXDistance,
                                        scrollYDistance: scrollYDistance === undefined ? 0 : scrollYDistance,
                                        scrollHeight: scrollHeight,
                                        scrollWidth: scrollWidth,
                                        containerHeight: containerHeight,
                                        containerWidth: containerWidth
                                    };
                                    _this.$emit('log', 'scroll', logentry);
                                }
                            }
                        }

                        var options = {
                            root: null,
                            rootMargin: "0px",
                            threshold: [1.0],
                            trackVisibility: true,
                            delay: 100
                        };

                        var observer = new IntersectionObserver(handleScrolling, options);
                        var pCounter = 0;
                        $('p, ul, pre, div.longpage-image-block, div.longpage-assignment, h2, h3').each(function (i, val) {
                            if ($(this).attr('id') === '' || $(this).attr('id') === undefined) {
                                $(this).attr('id', 'paragraph-' + pCounter).addClass('longpage-paragraph');
                                pCounter++;
                            }
                            observer.observe(document.querySelector("#" + $(this).attr('id')));
                        });
                    };
                },


                visualizeReadingProgress: function () {
                    let data = {
                        'paragraph-13': 3,
                        'paragraph-44': 4,
                        'paragraph-55': 5,
                        'paragraph-46': 0,
                        'paragraph-47': 1,
                    }

                    /*for (let i in data) {
                        console.log(i, data[i])
                        $('#' + i).append($('<span></span>').addClass('reading-progress progress-' + data[i]));
                    }*/
                    for (var i = 1; i < 460; i++) {
                        $('#paragraph-' + i).append($('<span></span>').addClass('reading-progress progress-' + Math.ceil(Math.random() * 5)));
                    }
                },
            },

            template: `
                <div></div>
            `
        });

});