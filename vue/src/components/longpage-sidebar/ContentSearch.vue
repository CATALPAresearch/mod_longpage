<template>
  <div class="form-inline w-md-75 w-xs-100">
    <div class="w-100 mb-1 text-right">
      <input
        id="search-string"
        v-model="searchTerm"
        class="form-control form-control-sm mr-sm-2 d-inline w-md-50 w-xs-75 d-inline ml-auto"
        type="search"
        placeholder="Suchen"
        aria-label="Search"
        @keyup.enter="doFulltextSearch"
      >
      <button
        id="search-full-text"
        class="btn btn-light btn-sm d-inline mr-0"
        type="button"
        @click="doFulltextSearch"
      >
        <i class="fa fa-search" />
      </button>
    </div>
    <div
      v-if="showSearchResults"
      class="row w-md-50 w-xs-100 ml-auto px-0 mx-0"
      style="z-index:3000;"
    >
      <div class="w-100 text-right">
        <button
          type="button"
          class="close ml-auto align-self-center d-block"
          aria-label="Close"
          @click="$emit('hideTabContent')"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div
        class="p-3 bg-light"
        style="max-height:80vh; overflow:auto"
      >
        <div class="mb-2">
          {{ searchResults.length }} Suchtreffer für '{{ searchTerm }}':
        </div>
        <ul
          id="search-results"
          class="list-unstyled"
        >
          <li
            v-for="res in searchResults"
            v-if="res.doc.short.length > 0"
            class="mb-2"
          >
            <a
              class="underline"
              style="word-wrap: break-word; color: #004C97 !important;"
              :href="'#'+res.doc.link"
              @click="searchResultClick(res.doc)"
            >
              <span v-html="res.doc.short" />

            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable max-len, no-console, no-loop-func, no-undef, no-unused-vars, no-bitwise */
/**
 * TODO:
 * ---
 * - Suchbegriff im Text hervorheben
 * - remove jquery
 */
import elasticlunr from 'elasticlunr';

export default {
    name: 'Search',
    props: ['hideTabContent', 'log'],

    data() {
        return {
            index: {},
            search: '',
            searchResults: '',
            searchTerm: '',
            showSearchResults: false
        };
    },

    mounted() {
        this.setupSearch();
    },

    methods: {
        setupSearch() {
            let _this = this;
            var customized_stop_words = ['an', 'der', 'die', 'das']; // Add German stop words
            elasticlunr.addStopWords(customized_stop_words);

            _this.index = elasticlunr();
            // Index.use(de);
            _this.index.addField('title');
            _this.index.addField('body');
            _this.index.setRef('id');
            // Collect index
            $('.longpage-container h2, .longpage-container h3, .longpage-container h4, .longpage-container div, .longpage-container p, .longpage-container ul, .longpage-container ol, .longpage-container pre').each(function(i, val) {
                _this.index.addDoc({id: i, title: $(val).text(), body: '', link: $(val).attr('id')});
            });
            $('.longpage-container h2, .longpage-container h3, .longpage-container h4, .longpage-container div, .longpage-container p, .longpage-container ul, .longpage-container ol, .longpage-container pre').each(function(i, val) {

                if ($(this).is('h2') || $(this).is('h3') || $(this).is('h4')) {
                    _this.index.addDoc({id: i, title: $(val).text(), body: '', link: $(val).attr('id')});
                } else {
                    if ($(val).attr('id') === '' || $(val).attr('id') === undefined) {
                        $(val).attr('id', Math.ceil(Math.random() * 1000));
                    }
                    _this.index.addDoc({id: i, title: '', body: $(val).text(), link: $(val).attr('id')});
                }
            });
        },

        doFulltextSearch(e) {
            let _this = this;
            this.showSearchResults = true;
            if (this.searchTerm !== '') {
                this.searchResults = this.index.search(String(this.searchTerm), {
                    fields: {
                        title: {boost: 2},
                        body: {boost: 1}
                    }
                });
                this.searchResults = this.searchResults.map(function(response) {
                    const res = {
                        ...response,
                        doc: _this.index.documentStore.getDoc(response.ref)
                    };
                    let pos = res.doc.body.indexOf(_this.searchTerm);
                    res.doc.short = pos > 0 ? '... ' + res.doc.body.substr(pos - 20 > 0 ? pos - 20 : 0, 40).replace(_this.searchTerm, '<strong>' + _this.searchTerm + '</strong>') : _this.searchTerm;
                    // Console.log(pos, _this.searchTerm, res.doc.short)
                    return res;
                });
                _this.$emit('log', 'searchterm', {searchterm: this.searchTerm, results: this.searchResults.length});
            }
            e.preventDefault();
        },

        searchResultClick(doc) {
            this.hideSearchResults();
            this.$emit('log', 'searchresultselected', {searchterm: this.term, results: this.searchResults.length, selected: doc.link, title: doc.title});
        },

        hideSearchResults() {
            this.showSearchResults = false;
        },
    },
};
</script>
