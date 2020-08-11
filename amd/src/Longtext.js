/**
 * TODO
 * 
 * Logging
 * - consider pollyfills for scrolling: https://github.com/w3c/IntersectionObserver/tree/master/polyfill
 *
 */

define([
    'jquery',
   M.cfg.wwwroot + '/mod/page/amd/src/ReadingTime.js',
], function ($, ReadingTime) {

    /**
     * Plot a timeline
     * @param d3 (Object) Data Driven Documents
     * @param dc (Object) Dimensional Javascript Charting Library
     * @param utils (Object) Custome util class
     */
    var Longtext = function (Vue, d3, utils, log, pagename) {

        require.config({
            enforceDefine: false,
            baseUrl: M.cfg.wwwroot + "/mod/page/lib/",
            paths: {
                "elasticlunr": ["elasticlunr.min"],
                "lunrde": ["lunr.de"],
                "stemmer": ["lunr.stemmer.support"]
            }
        });

        var app = new Vue({
            el: '#nav-app',
            data: function () {
                return {
                    pagename: '',
                    //
                    filter_assessment: true,
                    filter_text: true,
                    content: [],
                    // toc
                    
                    // search
                    index: {},
                    search: '',
                    searchResults: '',
                    searchTerm: '',
                    showSearchResults: false

                };
            },
            components: { 
                'ReadingTime': ReadingTime
            },
            created: function () {
                this.pagename = pagename;
                this.generateTableOfContent();

                this.enableScrollLogging();

                this.setupSearch();


                if (
                    "IntersectionObserver" in window &&
                    "IntersectionObserverEntry" in window &&
                    "intersectionRatio" in window.IntersectionObserverEntry.prototype
                ) {
                    var observerxx = new IntersectionObserver(entries => {
                        if (entries[0].boundingClientRect.y < 0) {
                            document.getElementById('longpage-navbar').classList.add("header-not-at-top");
                            document.getElementById('table-of-content').classList.add("header-not-at-top");
                        } else {
                            document.getElementById('longpage-navbar').classList.remove("header-not-at-top");
                            document.getElementById('table-of-content').classList.remove("header-not-at-top");
                        }
                    });
                    observerxx.observe(document.querySelector("#top-of-site-pixel-anchor"));
                }



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
                    log.add('toc_entry_open', { level: 'h3', target: $(this).attr('href') });
                });

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

                /* TOC*/
               
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
                                //var scrollPos = window.scrollY || window.scrollTop || document.getElementsByTagName('html')[0].scrollTop || window.pageYOffset;
                                //var elPos = document.getElementById(target.replace('#', '')).scrollTop; // not working
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
                                $(this).attr('id', 'paragraph-' + pCounter);
                                pCounter++;
                            }
                            observer.observe(document.querySelector("#" + $(this).attr('id')));
                        });
                    };
                },



                setupSearch: function () {
                    let _this = this;
                    require([
                        'jquery',
                        'elasticlunr',
                        'lunrde',
                        'stemmer'
                    ], function ($, elasticlunr, de, stemmer) {
                        var customized_stop_words = ['an', 'der', 'die', 'das']; // add German stop words
                        elasticlunr.addStopWords(customized_stop_words);

                        _this.index = elasticlunr();
                        //index.use(de);
                        _this.index.addField('title');
                        _this.index.addField('body');
                        _this.index.setRef('id');
                        // collect index
                        $('.longpage-container h2, .longpage-container h3, .longpage-container h4, .longpage-container p, .longpage-container ul, .longpage-container ol, .longpage-container pre').each(function (i, val) {
                            _this.index.addDoc({ id: i, title: $(val).text(), body: '', link: $(val).attr('id') });
                        });

                        $('.longpage-container h2, .longpage-container h3, .longpage-container h4, .longpage-container p, .longpage-container ul, .longpage-container ol, .longpage-container pre').each(function (i, val) {
                            if ($(this).is("h2") || $(this).is("h3") || $(this).is("h4")) {
                                _this.index.addDoc({ id: i, title: $(val).text(), body: '', link: $(val).attr('id') });
                            } else {
                                if ($(val).attr('id') === '' || $(val).attr('id') === undefined) {
                                    $(val).attr('id', Math.ceil(Math.random() * 1000));
                                }
                                _this.index.addDoc({ id: i, title: '', body: $(val).text(), link: $(val).attr('id') });
                            }
                        });
                    });
                },

                doFulltextSearch: function (e) {
                    let _this = this;
                    this.showSearchResults = true;
                    if (this.searchTerm !== '') {
                        this.searchResults = this.index.search(String(this.searchTerm), {
                            fields: {
                                title: { boost: 2 },
                                body: { boost: 1 }
                            }
                        });
                        this.searchResults = this.searchResults.map(function(res){
                            let pos = res.doc.body.indexOf(_this.searchTerm);
                            res.doc.short = pos > 0 ? '... ' + res.doc.body.substr(pos - 20 > 0 ? pos - 20 : 0, 40) : '';
                            console.log(pos, _this.searchTerm, res.doc.short)
                            return res;
                        })
                        log.add('searchterm', { searchterm: this.searchTerm, results: this.searchResults.length });
                    }
                },

                hideSearchResults: function(){
                    this.showSearchResults = false;
                },

                decode: function (str) {
                    let out = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
                    return out;
                }
            },
            el: 'longpage-container',
            template: `
                <div>
                    <nav id="longpage-navbar" class="page-navbar navbar navbar-light bg-light py-2 mx-0 pl-1 pr-2">
                        <div class="row w-100 px-0 mx-0">
                            <span class="title-toc col-8">
                                <a class="navbar-brand">{{ pagename }}</a>
                                <a class="btn btn-link longpage-toc-toggle longpage-nav-btn" data-toggle="collapse" role="button" href="#table-of-content">Inhaltsverzeichnis</a>
                            </span>
                            <form class="form-inline col-4 mb-1 px-0 mx-0">
                                <input v-model="searchTerm" id="search-string" class="form-control mr-sm-2 d-inline w-50 d-flex ml-auto" type="search" placeholder="Suche" aria-label="Search">
                                <button @click="doFulltextSearch" id="search-full-text" class="btn btn-outline-success d-inline mr-0" type="button">Suchen</button>
                            </form>
                        </div>
                        <div v-if="showSearchResults" class="row w-100 px-0 mx-0" id="search-results-panel">
                            <div class="col-9"></div>
                            <div class="col-3 p-2 bg-light" style="max-height:70vh; overflow:auto">
                                <button type="button" class="close ml-auto align-self-center d-block" aria-label="Close" v-on:click="hideSearchResults">
                                    <span aria-hidden="true">&times;</span>
                                </button><br>
                                <ul id="search-results" class="list-unstyled">
                                    <li class="mb-2" v-for="res in searchResults">
                                        <a 
                                            class="underline"
                                            style="word-wrap: break-word;"
                                            :href="'#'+res.doc.link">{{ res.doc.body.title }} {{ res.doc.short }}</a>
                                        <!--
                                        log.add('searchresultselected', { searchterm: term, results: res.kength, selected: res[i].doc.link, title: res[i].doc.title });
                                        -->
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                    <div class="collapse" id="table-of-content">Hello
                        <ul id="tocList" class="nav-pills"></ul>
                    </div>
                    <ReadingTime></ReadingTime>
                </div>
            `
        });


    };// end Longtext

    return Longtext;
});