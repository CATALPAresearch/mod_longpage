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
    M.cfg.wwwroot + '/mod/page/amd/src/TableOfContent.js',
    M.cfg.wwwroot + '/mod/page/amd/src/Search.js',
    M.cfg.wwwroot + '/mod/page/amd/src/ReadingProgress.js',
    M.cfg.wwwroot + '/mod/page/amd/src/CourseRecommondation',
], function ($, ReadingTime, TableOfContent, Search, ReadingProgress, CourseRecommondation) {


    // new CourseRecommender();

    var Longtext = function (Vue, utils, logger, pagename) {
        Vue.component('TableOfContent', TableOfContent);
        Vue.component('Search', Search);
        Vue.component('ReadingProgress', ReadingProgress);
        Vue.component('ReadingTime', ReadingTime);
        Vue.component('CourseRecommondation', CourseRecommondation);

        new Vue({
            el: 'longpage-container',
            data: function () {
                return {
                    pagename: '',
                    tabContentVisible: false,
                    //
                    filter_assessment: true,
                    filter_text: true,
                    content: []
                };
            },
            components: { },
            mounted: function () {
                
                this.pagename = pagename;

                // log bootstrap interactions
                $('.longpage-citation').click(function () {
                    this.log('citation_view', { citation: $(this).data('content') });
                });
                $('.longpage-footnote').click(function () {
                    this.log('footnote_view', { title: $(this).find('button').data('original-title'), text: $(this).find('button').data('content') });
                });
                $('.longpage-crossref').click(function () {
                    this.log('crossref_follow', { source: $(this).text(), target: $(this).attr('href'), parent: $(this).parent().attr('id') });
                });
                $('.longpage-assignment-link').click(function () {
                    this.log('assignment_open', { target: $(this).attr('href') });
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

                log(key, values) {
                    logger.add(key, values)
                },

                showTabContent() {
                    this.tabContentVisible = true;
                },
                hideTabContent() {
                    this.tabContentVisible = false;
                },

                decode: function (str) {
                    let out = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
                    return out;
                }
            },
            template: `
                <div>
                    <nav id="longpage-navbar" class="navbar-expand navbar-light bg-light py-2 mx-0 pl-1 pr-2">
                        <div class="row w-100 px-0 mx-0">
                            <span class="title-toc col-4 col-sm-4 col-xs-12">
                                <a class="navbar-brand">{{ pagename }}</a>
                            </span>
                            <div class="col-4 col-sm-4 col-xs-4">
                                <ul class="nav nav-tabs" id="longpageFeatures" role="tablist">
                                    <li class="nav-item">
                                        <a class="nav-link" id="toc-tab" data-toggle="tab" href="#tableofcontent" role="tab" aria-controls="tableofcontents" aria-selected="false" @click="showTabContent()">
                                            <i class="fa fa-list"></i>
                                        </a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="concepts-tab" data-toggle="tab" href="#concepts" role="tab" aria-controls="concepts" aria-selected="false" @click="showTabContent()">
                                            <i class="fa fa-map"></i>
                                        </a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="tests-tab" data-toggle="tab" href="#tests" role="tab" aria-controls="tests" aria-selected="false" @click="showTabContent()">
                                            <i class="fa fa-check"></i>
                                        </a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="bookmarks-tab" data-toggle="tab" href="#bookmarks" role="tab" aria-controls="bookmarkss" aria-selected="false" @click="showTabContent()">
                                            <i class="fa fa-bookmark"></i>
                                        </a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="annotations-tab" data-toggle="tab" href="#annotations" role="tab" aria-controls="annotations" aria-selected="false" @click="showTabContent()">
                                            <i class="fa fa-pencil"></i>
                                        </a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="search-tab" data-toggle="tab" href="#search" role="tab" aria-controls="search" aria-selected="false" @click="showTabContent()">
                                            <i class="fa fa-search"></i>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <!-- -->
                        <div :style="{visibility: tabContentVisible ? 'visible' : 'hidden'}" class="tab-content" id="myTabContent">
                            <div class="tab-pane fade" id="tableofcontent" role="tabpanel" aria-labelledby="toc-tab">
                                <TableOfContent @hideTabContent='hideTabContent' v-on:log='log'></TableOfContent>
                            </div>
                            <div class="tab-pane fade" id="concepts" role="tabpanel" aria-labelledby="toc-tab">
                                <CourseRecommondation @hideTabContent='hideTabContent' v-on:log='log'></CourseRecommondation>
                            </div>
                            <div class="tab-pane fade" id="tests" role="tabpanel" aria-labelledby="toc-tab">
                                Tests
                                <button type="button" class="close ml-auto align-self-center d-block" aria-label="Close" v-on:click="hideTabContent()">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="tab-pane fade" id="bookmarks" role="tabpanel" aria-labelledby="toc-tab">
                                Bookmarks
                                <button type="button" class="close ml-auto align-self-center d-block" aria-label="Close" v-on:click="hideTabContent()">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="tab-pane fade" id="annotations" role="tabpanel" aria-labelledby="toc-tab">
                                Annotations
                                <button type="button" class="close ml-auto align-self-center d-block" aria-label="Close" v-on:click="hideTabContent()">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="search-pane fade" id="search" role="tabpanel" aria-labelledby="search-tab">
                                <Search @hideTabContent='hideTabContent' v-on:log='log'></Search>
                            </div>
                        </div>
                    </nav>
                    <ReadingTime></ReadingTime>
                    <ReadingProgress v-on:log='log'></ReadingProgress>
                    
                </div>
            `
        });
        // });
    };// end Longtext



    return Longtext;
});