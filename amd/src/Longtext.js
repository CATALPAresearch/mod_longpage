/**
 * TODO
 * ---
 * - replace jquery event handling
 *
 */

define([
    'jquery',
    M.cfg.wwwroot + '/mod/page/amd/src/Components/ReadingTime.js',
    M.cfg.wwwroot + '/mod/page/amd/src/Components/TableOfContent.js',
    M.cfg.wwwroot + '/mod/page/amd/src/Components/Search.js',
    M.cfg.wwwroot + '/mod/page/amd/src/Components/ReadingProgress.js', // attention
    M.cfg.wwwroot + '/mod/page/amd/src/Components/CourseRecommondation.js', // attention
    M.cfg.wwwroot + '/mod/page/amd/src/Components/Bookmark.js',
], function ($, ReadingTime, TableOfContent, Search, ReadingProgress, CourseRecommondation, Bookmark) {

    var Longtext = function (Vue, Store, utils, logger, context) {
        Vue.component('TableOfContent', TableOfContent);
        Vue.component('Search', Search);
        Vue.component('ReadingProgress', ReadingProgress);
        Vue.component('ReadingTime', ReadingTime);
        Vue.component('CourseRecommondation', CourseRecommondation);
        Vue.component('Bookmark', Bookmark);

        const pageStore = new Store(context);

        new Vue({
            el: 'longpage-container',

            store: pageStore.store,

            data: function () {
                return {
                    context: context,
                    tabContentVisible: false,
                };
            },

            mounted: function () {
                var _this = this;
                this.$store.dispatch('loadBookmarks');
                
                // log bootstrap interactions
                $('.longpage-citation').click(function () {
                    _this.log('citation_view', { citation: $(this).data('content') });
                });
                $('.longpage-footnote').click(function () {
                    _this.log('footnote_view', { title: $(this).find('button').data('original-title'), text: $(this).find('button').data('content') });
                });
                $('.longpage-crossref').click(function () {
                    _this.log('crossref_follow', { source: $(this).text(), target: $(this).attr('href'), parent: $(this).parent().attr('id') });
                });
                $('.longpage-assignment-link').click(function () {
                    _this.log('assignment_open', { target: $(this).attr('href') });
                });

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
                    document.querySelector('#longpage-features').querySelector('a.active.show').classList.remove("active");
                },

                followLink: function (target, event) {
                    let elem = document.getElementById(target);
                    if (!elem) { return; }

                    //this.$emit('log', 'toc_entry_open', { level: level, target: target, title: elem.innerHTML });
                    //history.pushState(null, null, target)
                    let elScrollOffset = elem.getBoundingClientRect().top
                    let scrollOffset = window.pageYOffset || document.documentElement.scrollTop
                    let padding = 150;
                    window.scroll({
                        top: elScrollOffset + scrollOffset - padding,
                        behavior: 'smooth'
                    });
                    this.hideTabContent();
                    event.preventDefault();
                }
            },
            template: `
                <div>
                    <nav id="longpage-navbar" class="navbar-expand navbar-light bg-light py-2 mx-0 pl-1 pr-2">
                        <div class="row w-100 px-0 mx-0">
                            <span class="title-toc col-4 col-sm-4 col-xs-12">
                                <a class="navbar-brand">{{ context.pagename }}</a>
                            </span>
                            <div class="col-8 col-md-8 col-xs-12">
                                <ul class="nav nav-tabs" id="longpage-features" role="tablist">
                                    <li class="nav-item">
                                        <a class="nav-link" id="toc-tab" title="Inhaltsverzeichnis" data-toggle="tab" href="#tableofcontent" role="tab" aria-controls="tableofcontents" aria-selected="false" @click="showTabContent()">
                                            <i class="fa fa-list"></i><span class="ml-1 d-none d-md-inline">Inhaltsverzeichnis</span>
                                        </a>
                                    </li>
                                    <li hidden class="nav-item">
                                        <a class="nav-link" id="concepts-tab" title="Concept Map" data-toggle="tab" href="#concepts" role="tab" aria-controls="concepts" aria-selected="false" @click="showTabContent()">
                                            <i class="fa fa-map"></i><span class="ml-1 d-none d-md-inline">Concept Map</span>
                                        </a>
                                    </li>
                                    <li hidden class="nav-item">
                                        <a class="nav-link" id="tests-tab" title="Selbsttests" data-toggle="tab" href="#tests" role="tab" aria-controls="tests" aria-selected="false" @click="showTabContent()">
                                            <i class="fa fa-check"></i> <span class="ml-1 d-none d-md-inline">Selbsttestaufgaben</span>
                                        </a>
                                    </li>
                                    <li class="nav-item" hidden>
                                        <a class="nav-link" id="bookmarks-tab" title="Lesezeichen" data-toggle="tab" href="#bookmarks" role="tab" aria-controls="bookmarkss" aria-selected="false" @click="showTabContent()">
                                            <i class="fa fa-bookmark"></i><span class="ml-1 d-none d-md-inline">Lesezeichen</span>
                                        </a>
                                    </li>
                                    <li hidden class="nav-item">
                                        <a class="nav-link" id="annotations-tab" title="Hervorhebungen" data-toggle="tab" href="#annotations" role="tab" aria-controls="annotations" aria-selected="false" @click="showTabContent()">
                                            <i class="fa fa-pencil"></i><span class="ml-1 d-none d-md-inline">Hervorhebungen</span>
                                        </a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="search-tab" data-toggle="tab" href="#search" role="tab" aria-controls="search" aria-selected="false" @click="showTabContent()">
                                            <i class="fa fa-search"></i> <span class="ml-1 d-none d-md-inline">Suche</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <!-- Longpage Feature Tabs -->
                        <div :style="{display: tabContentVisible ? 'block' : 'none'}" class="tab-content" id="myTabContent">
                            <div class="tab-pane fade p-3" id="tableofcontent" role="tabpanel" aria-labelledby="toc-tab">
                                <TableOfContent @hideTabContent='hideTabContent' v-on:log='log'></TableOfContent>
                            </div>
                            <div class="tab-pane fade v" id="concepts" role="tabpanel" aria-labelledby="toc-tab">
                                <CourseRecommondation @hideTabContent='hideTabContent' v-on:log='log'></CourseRecommondation>
                            </div>
                            <div class="tab-pane fade p-3" id="tests" role="tabpanel" aria-labelledby="toc-tab">
                                Tests
                                <button type="button" class="close ml-auto align-self-center d-block" aria-label="Close" v-on:click="hideTabContent()">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="tab-pane fade p-3" id="bookmarks" role="tabpanel" aria-labelledby="toc-tab">
                                <button type="button" class="close ml-auto align-self-center d-block" aria-label="Close" v-on:click="hideTabContent()">
                                        <span aria-hidden="true">&times;</span>
                                </button>
                                <div class="w-75" v-if="$store.getters.getBookmarks.length == 0">
                                    Es wurden noch keine Lesezeichen angelegt. Markieren Sie einen Textauschnitt, um ein Lesezeichen anzulegen.
                                </div>
                                <div v-if="$store.getters.getBookmarks.length > 0">
                                    Meine Lesezeichen:
                                    <ul>
                                        <li v-for="b in $store.getters.getBookmarks">
                                            <a v-on:click="followLink(b.target, $event)" style="cursor:pointer;">{{ b.selection }}</a> 
                                            <i v-on:click="$store.commit('removeBookmark', b.id)" class="ml-3 p-1 fa fa-trash"></i>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="tab-pane fade p-3" id="annotations" role="tabpanel" aria-labelledby="toc-tab">
                                Annotations
                                <button type="button" class="close ml-auto align-self-center d-block" aria-label="Close" v-on:click="hideTabContent()">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="tab-pane fade p-3" id="search" role="tabpanel" aria-labelledby="search-tab">
                                <Search @hideTabContent='hideTabContent' v-on:log='log'></Search>
                            </div>
                        </div>
                    </nav>

                    <ReadingTime></ReadingTime>
                    <ReadingProgress v-on:log='log' v-bind:context="context"></ReadingProgress>
                    <Bookmark v-on:log='log'></Bookmark>
                </div>
            `
        });
    };// end Longtext

    return Longtext;
});