/**
 * TODO
 * 
 * Logging
 * - listen to scroll events: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 * - consider pollyfills for scrolling: https://github.com/w3c/IntersectionObserver/tree/master/polyfill
 * 
 * Add fulltext to elasticlunr
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
    let Longtext = function (Vue, d3, utils, html_content) {

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
                        li = "<li class='nav-item'><a class='nav-link' href='#h4item-" + indexH4 + "'>" + $(this).text() + "</a></li>";
                        prevH2List.append(li);
                        indexH4++;
                    }
                });


                // scroll event listener
                if (
                    "IntersectionObserver" in window &&
                    "IntersectionObserverEntry" in window &&
                    "intersectionRatio" in window.IntersectionObserverEntry.prototype
                ) {
                    var topPadding = 0;
                    var handleScrolling = function (entries) {
                        if (entries[0].boundingClientRect.y < topPadding) {
                            document.getElementById('tocList').classList.add("scrollDown");//header-not-at-top
                            console.log('smaller 0', entries[0].target);
                        } else {
                            document.getElementById('tocList').classList.remove("scrollDown");
                            console.log('greater 0', entries[0].target);
                        }
                    };
                    var options = {
                        root: null,
                        rootMargin: "0px"
                        //threshold: buildThresholdList()
                    };
                    var observer = new IntersectionObserver(handleScrolling, options);
                    observer.observe(document.querySelector("p"));
                }




                // search xxx
                require([
                    'elasticlunr',
                    'lunrde',
                    'stemmer'
                ], function (elasticlunr, de, stemmer) {
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
                        if ($('#search-string').val() !== '') {
                            var res = index.search(String($('#search-string').val()), {
                                fields: {
                                    title: { boost: 2 },
                                    body: { boost: 1 }
                                }
                            }); console.log(res);
                            $('#search-results').empty();
                            for (var i = 0; i < res.length; i++) {
                                var li = $('<li></li>');
                                $('<a></a>')
                                    .text(res[i].doc.title === '' ? res[i].doc.body.substr(0,30) : res[i].doc.title)
                                    .attr('href', '#' + res[i].doc.link)
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
                decode: function (str) {
                    let out = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
                    return out;
                }
            }
        });


    };// end Longtext

    return Longtext;
});








