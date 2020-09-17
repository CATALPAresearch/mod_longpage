define([
    'jquery',
    M.cfg.wwwroot + '/mod/page/lib/build/vue.min.js'
], function ($, Vue) {

    require.config({
        enforceDefine: false,
        paths: {
            "elasticlunr": [M.cfg.wwwroot + "/mod/page/lib/build/elasticlunr.min"],
            "lunrde": [M.cfg.wwwroot + "/mod/page/lib/build/lunr.de.min"],
            "stemmer": [M.cfg.wwwroot + "/mod/page/lib/build/lunr.stemmer.support.min"]
        }
    });

    Vue.component('Search',
        {
            props: ['hideTabContent', 'log'],

            data: function () {
                return {
                    index: {},
                    search: '',
                    searchResults: '',
                    searchTerm: '',
                    showSearchResults: false
                }
            },

            mounted: function () {
                this.setupSearch();
            },

            methods: {
                setupSearch: function () {
                    let _this = this;
                    require([
                        'elasticlunr',
                        'lunrde',
                        'stemmer'
                    ], function (elasticlunr, de, stemmer) {

                        var customized_stop_words = ['an', 'der', 'die', 'das']; // add German stop words
                        elasticlunr.addStopWords(customized_stop_words);

                        _this.index = elasticlunr();
                        //index.use(de);
                        _this.index.addField('title');
                        _this.index.addField('body');
                        _this.index.setRef('id');
                        // collect index
                        $('.longpage-container h2, .longpage-container h3, .longpage-container h4, .longpage-container div, .longpage-container p, .longpage-container ul, .longpage-container ol, .longpage-container pre').each(function (i, val) {
                            _this.index.addDoc({ id: i, title: $(val).text(), body: '', link: $(val).attr('id') });
                        });

                        $('.longpage-container h2, .longpage-container h3, .longpage-container h4, .longpage-container div, .longpage-container p, .longpage-container ul, .longpage-container ol, .longpage-container pre').each(function (i, val) {
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
                        this.searchResults = this.searchResults.map(function (res) {
                            let pos = res.doc.body.indexOf(_this.searchTerm);
                            res.doc.short = pos > 0 ? '... ' + res.doc.body.substr(pos - 20 > 0 ? pos - 20 : 0, 40) : _this.searchTerm;
                            //console.log(pos, _this.searchTerm, res.doc.short)
                            return res;
                        })
                        _this.$emit('log', 'searchterm', { searchterm: this.searchTerm, results: this.searchResults.length });
                    }
                    e.preventDefault();
                },

                searchResultClick: function (doc) {
                    this.hideSearchResults();
                    this.$emit('log', 'searchresultselected', { searchterm: this.term, results: this.searchResults.length, selected: doc.link, title: doc.title });
                },

                hideSearchResults: function () {
                    this.showSearchResults = false;
                },
            },

            template: `
                <div class="form-inline text-right">
                    <input v-model="searchTerm" v-on:keyup.enter="doFulltextSearch" id="search-string" class="form-control form-control-sm mr-sm-2 d-inline w-50 d-flex ml-auto" type="search" placeholder="Suchen" aria-label="Search">
                    <button @click="doFulltextSearch" id="search-full-text" class="btn btn-light btn-sm d-inline mr-0" type="button"><i class="fa fa-search"></i></button>
                    <div v-if="showSearchResults" class="row w-100 px-0 mx-0" style="z-index:3000;">
                        <div class="col-9 d-inline d-xs-none"></div>
                        <div class="col-3 col-xs-12 p-3 bg-light" style="max-height:80vh; overflow:auto">
                            <button type="button" class="close ml-auto align-self-center d-block" aria-label="Close" v-on:click="$emit('hideTabContent')">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <br>
                            <div class="mb-2">{{ searchResults.length }} Suchtreffer für '{{ searchTerm }}':</div>
                            <ul id="search-results" class="list-unstyled">
                                <li class="mb-2" v-for="res in searchResults" v-if="res.doc.short.length > 0">
                                    <a 
                                        class="underline"
                                        style="word-wrap: break-word; color: #004C97 !important;"
                                        :href="'#'+res.doc.link"
                                        @click="searchResultClick(res.doc)"
                                        >
                                        {{ res.doc.short }}
                                        </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            `
        });
});
