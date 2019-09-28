/**
 * TODO
 * 
 * Logging
 * - consider pollyfills for scrolling: https://github.com/w3c/IntersectionObserver/tree/master/polyfill
 * - add Logging class
 * 
 * 
 * 
 */

define([
    'jquery',
    'core/ajax'
], function ($, ajax) {

    /**
     * Plot a timeline
     * @param d3 (Object) Data Driven Documents
     * @param dc (Object) Dimensional Javascript Charting Library
     * @param utils (Object) Custome util class
     */
    var Longtext = function (Vue, d3, utils, log) {

        require.config({
            enforceDefine: false,
            baseUrl: M.cfg.wwwroot + "/mod/page/lib/",
            paths: {
                "elasticlunr": ["elasticlunr.min"],
                "lunrde": ["lunr.de"],
                "stemmer": ["lunr.stemmer.support"]
            }/*,
            shim: {
                'vue259': {
                    exports: 'Vue'
                }
            }*/
        });

        var app = new Vue({
            el: '#nav-app',
            data: function () {
                return {
                    message: '',
                    search: '',
                    filter_assessment: true,
                    filter_text: true,
                    content: []
                };
            },
            created: function () {
                this.generateTableOfContent();

                this.enableScrollLogging();

                this.setupSearch();

                this.estimateReadingTime();

                // log interactions
                $('.longpage-citation').click(function () {
                    log.add('citation_view', { citation: $(this).data('content') });
                });
                $('.longpage-footnote').click(function () {
                    log.add('footnote_view', { title: $(this).find('button').data('original-title'), text: $(this).find('button').data('content') });
                });
                $('.longpage-crossref').click(function () {
                    log.add('crossref_follow', { source: $(this).text(), target: $(this).attr('href'), parent: $(this).parent().attr('id') });
                });
                $('.longpage-assignment-link').click(function () {
                    log.add('assignment_open', { target: $(this).attr('href') });
                });
                var toggle = false;
                $('.longpage-toc-toggle').click(function () {
                    toggle = !toggle;
                    log.add('toc_toggle', { open: toggle });
                });
                $('.nav-link-h4').click(function () {
                    log.add('toc_entry_open', { level: 'h4', target: $(this).attr('href') });
                });
                $('.nav-link-h3').click(function () {
                    console.log('toc_entry_open', { level: 'h3', target: $(this).attr('href') });
                });

            },
            mounted: function () {
            },
            computed: {
                filteredContent: function () {
                    var _this = this;
                    var filtered = Object.values(this.content).filter(function (c) {
                        if (c.type === 'assessment' && this.filter_assessment) {
                            return true;
                        } else if (c.type === 'content' && this.filter_text) {
                            return true;
                        }
                        return false;
                    });
                    return Object.values(filtered).filter(function (c) {
                        return '';//Object.values(c).join(' ').toLowerCase().includes(_this.search.toLowerCase());
                    });
                }
            },
            methods: {
                estimateReadingTime: function () {
                    // 200 word per Minute https://de.wikipedia.org/wiki/Lesegeschwindigkeit
                    //add 12 seconds for each inline image. Boom, read time.
                    var readingSpeedPerLanguage = { de: { cpm: 250, variance: 50 } };

                    var estimateTime = function (text, language, numImg) {
                        var length = text.match(/([\s]+)/g).length; console.log(length)
                        var readingSpeed = readingSpeedPerLanguage[language];
                        var readingTimeSlow = Math.ceil(length / (readingSpeed.cpm - readingSpeed.variance) + numImg * 0.3);
                        var readingTimeFast = Math.ceil(length / (readingSpeed.cpm + readingSpeed.variance) + numImg * 0.3);
                        return readingTimeFast + '-' + readingTimeSlow + ' Minuten';
                    };
                    $('.longpage-container h2').after($('<span class="longpage-reading-time-estimation"></span>').text('' + estimateTime($('.longpage-container').text(), 'de', $('.longpage-container').find('img').length) + ''));
                },
                generateTableOfContent: function () {
                    // Generates a table of content from a HTML DOM
                    var prevH2Item = $();
                    var prevH2List = $();
                    var li = $();
                    var anchor = '';
                    var indexH3 = 0;
                    var indexH4 = 0;
                    $(".longpage-container h3, .longpage-container h4").each(function () {
                        if ($(this).is("h3")) {
                            $(this).attr('id', "xh3item-" + indexH3);
                            li = "<li class='nav-item'><a class='nav-link nav-link-h3' data-toggle='collapse' data-parent='#tocList' data-target='#h3item-" + indexH3 + "' href='#xh3item-" + indexH3 + "'>" + $(this).text() + "</a></li>";
                            prevH2List = $('<ul></ul>').addClass('nav flex-column ml-3');
                            prevH2Item = $(li);
                            $('.nav-link-h3').click(function (e) {
                                var target = $(this).attr('href');
                                var scrollPos = window.scrollY || window.scrollTop || document.getElementsByTagName('html')[0].scrollTop || window.pageYOffset;
                                var elPos = document.getElementById(target.replace('#', '')).scrollTop; // not working
                                window.location.href = window.location.href.split('#')[0] + target;
                            });
                            var wrap = $('<div></div>')
                                .attr('id', 'h3item-' + indexH3)
                                .addClass('collapse')
                                .append(prevH2List)
                                ;
                            prevH2Item.append(wrap);
                            prevH2Item.appendTo("#tocList");
                            indexH3++;
                        } else if ($(this).is("h4")) {
                            $(this).attr('id', "h4item-" + indexH4);
                            li = "<li class='nav-item'><a class='nav-link nav-link-h4' href='#h4item-" + indexH4 + "'>" + $(this).text() + "</a></li>";
                            prevH2List.append(li);
                            indexH4++;
                        }
                    });
                },
                enableScrollLogging: function () {

                    if (
                        "IntersectionObserver" in window &&
                        "IntersectionObserverEntry" in window &&
                        "intersectionRatio" in window.IntersectionObserverEntry.prototype
                    ) {
                        var measuredElement = document.querySelector('.longpage-container');
                        var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                        var scrollWidth = document.documentElement.scrollWidth - window.innerWidth;
                        var yPadding, xPadding;
                        if (getComputedStyle) {
                            var computedStyle = getComputedStyle(measuredElement);
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
                                document.getElementById('tocList').classList.add("scrollDown");//header-not-at-top
                                //console.log('smaller 0', entries[0].target);
                            } else {
                                document.getElementById('tocList').classList.remove("scrollDown");
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
                                    log.add('scroll', logentry);
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
                        $('p, ul, pre, div.longpage-image-block, div.longpage-assignment, h2, h3').each(function (i, val) {
                            if ($(this).attr('id') === '' || $(this).attr('id') === undefined) {
                                $(this).attr('id', 'paragraph-' + pCounter);
                                pCounter++;
                            }
                            observer.observe(document.querySelector("#" + $(this).attr('id')));
                        });
                    };
                },
                setupSearch: function () {
                    require([
                        'jquery',
                        'elasticlunr',
                        'lunrde',
                        'stemmer'
                    ], function ($, elasticlunr, de, stemmer) {
                        var customized_stop_words = ['an', 'der', 'die', 'das']; // add German stop words
                        elasticlunr.addStopWords(customized_stop_words);

                        var index = elasticlunr();
                        //index.use(de);
                        index.addField('title');
                        index.addField('body');
                        index.setRef('id');
                        // collect index
                        $('.longpage-container h2, .longpage-container h3, .longpage-container h4, .longpage-container p, .longpage-container ul, .longpage-container ol, .longpage-container pre').each(function (i, val) {
                            index.addDoc({ id: i, title: $(val).text(), body: '', link: $(val).attr('id') });
                        });

                        $('.longpage-container h2, .longpage-container h3, .longpage-container h4, .longpage-container p, .longpage-container ul, .longpage-container ol, .longpage-container pre').each(function (i, val) {
                            if ($(this).is("h2") || $(this).is("h3") || $(this).is("h4")) {
                                index.addDoc({ id: i, title: $(val).text(), body: '', link: $(val).attr('id') });
                            } else {
                                if ($(val).attr('id') === '' || $(val).attr('id') === undefined) {
                                    $(val).attr('id', Math.ceil(Math.random() * 1000));
                                }
                                index.addDoc({ id: i, title: '', body: $(val).text(), link: $(val).attr('id') });
                            }
                        });

                        $("#longpage-search-form").submit(function (e) {
                            e.preventDefault();
                        });
                        var doFulltextSearch = function (e) {
                            var term = $('#search-string').val();
                            if (term !== '') {
                                var res = index.search(String(term), {
                                    fields: {
                                        title: { boost: 2 },
                                        body: { boost: 1 }
                                    }
                                }); // console.log(res);
                                log.add('searchterm', { searchterm: term, results: res.kength });
                                $('#search-results').empty();
                                for (var i = 0; i < res.length; i++) {
                                    var li = $('<li></li>');
                                    $('<a></a>')
                                        .text(res[i].doc.title === '' ? res[i].doc.body.substr(0, 20) : res[i].doc.title)
                                        .attr('href', '#' + res[i].doc.link)
                                        .click(function () {
                                            log.add('searchresultselected', { searchterm: term, results: res.kength, selected: res[i].doc.link, title: res[i].doc.title });
                                        })
                                        .appendTo(li)
                                        ;
                                    $('<div></div>')
                                        .text(res[i].doc.body.substr(0, 20))
                                        .appendTo(li)
                                        ;
                                    li.appendTo('#search-results');
                                }
                                $('#search-results-panel').collapse('show');
                            }
                        };
                        $('#search-full-text').click(function (e) {
                            doFulltextSearch(e);
                        });
                        $('#search-string').on('keypress', function (e) {
                            if (e.which === 13) {
                                doFulltextSearch(e);
                            }
                        });
                    });
                },
                decode: function (str) {
                    let out = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
                    return out;
                }
            }
        });


    };// end Longtext

    return Longtext;
});








