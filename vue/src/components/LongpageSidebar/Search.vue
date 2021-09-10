<script>
import elasticlunr from "elasticlunr";
import { LONGPAGE_APP_CONTAINER_ID, SidebarTabKeys, SidebarEvents } from "@/config/constants";
import { EventBus } from "@/lib/event-bus";


export default {
  name: "Search",
  props: {
    // hideTabContent,
    // log,
  },
  emits: [SidebarEvents.TOGGLE_TABS],
  data: function () {
    return {
      SidebarTabKeys,
      SidebarEvents,
      index: {},
      search: "",
      searchResults: "",
      searchTerm: "",
      showSearchResults: false,
    };
  },

  mounted: function () {
    this.setupSearch();
  },

  methods: {
    setupSearch: function () {
      let _this = this;

      var customized_stop_words = ["an", "der", "die", "das"]; // add German stop words
      elasticlunr.addStopWords(customized_stop_words);

      _this.index = elasticlunr();
      //index.use(de);
      _this.index.addField("title");
      _this.index.addField("body");
      _this.index.setRef("id");
      // collect index
                            //commented section below because it produces double data entries
      // $(
      //   "#longpage-app h2, #longpage-app h3, #longpage-app h4, #longpage-app div, #longpage-app p, #longpage-app ul, #longpage-app ol, #longpage-app pre"
      // ).each(function (i, val) {
      //   _this.index.addDoc({
      //     id: i,
      //     title: $(val).text(),
      //     body: "",
      //     link: $(val).attr("id"),
      //   });
      // });

      $(
        "#longpage-app h2, #longpage-app h3, #longpage-app h4, #longpage-app div, #longpage-app p, #longpage-app ul, #longpage-app ol, #longpage-app pre"
      ).each(function (i, val) {
        if ($(this).is("h2") || $(this).is("h3") || $(this).is("h4")) {
          _this.index.addDoc({
            id: i,
            title: $(val).text(),
            body: "",
            link: $(val).attr("id"),
          });
        } else {
          let attr = $(this).attr("id");
          if (typeof attr === typeof undefined || attr === false) {
            $(val).attr("id", "search-" + i);
          }
          _this.index.addDoc({
            id: i,
            title: "",
            body: $(val).text(),
            link: $(val).attr("id"),
          });
        }
      });
    },

    doFulltextSearch: function (e) {
      let _this = this;
      this.showSearchResults = true;
      if (this.searchTerm !== "") {
        this.searchResults = this.index.search(String(this.searchTerm), {
          fields: {
            title: { boost: 2 },
            body: { boost: 1 },
          },
        });
        this.searchResults = this.searchResults.map(function (res) {
          let pos = _this.index.documentStore.docs[res.ref].body.indexOf(
            _this.searchTerm
          );
          res.doc = new Object();
          res.doc.link = _this.index.documentStore.docs[res.ref].link;
          res.doc.short =
            pos > 0
              ? "... " +
                _this.index.documentStore.docs[res.ref].body
                  .substr(pos - 20 > 0 ? pos - 20 : 0, 40)
                  .replace(
                    _this.searchTerm,
                    "<strong>" + _this.searchTerm + "</strong>"
                  )
              : _this.searchTerm;
          //console.log(pos, _this.searchTerm, res.doc.short)
          return res;
        });
              EventBus.publish('searchterm-entered', {searchTerm: this.searchTerm, searchResults: this.searchResults.length});

        // _this.$emit("log", "searchterm", {
        //   searchterm: this.searchTerm,
        //   results: this.searchResults.length,
        // });
      }
      e.preventDefault();
    },

    searchResultClick: function (doc) {
      //this.hideSearchResults();     disabled this functionality for now
      // this.$emit("log", "searchresultselected", {
      //   searchterm: this.term,
      //   results: this.searchResults.length,
      //   selected: doc.link,
      //   title: doc.title,
      // });
      EventBus.publish('searchresult-selected', {searchTerm: this.searchTerm, searchResults: this.searchResults.length, link: doc.link, short: doc.short});
    },

    hideSearchResults: function () {
      this.showSearchResults = false;
    },
    publishEvent(EventType){
      EventBus.publish(EventType);
    },
    deleteSearchResults(){
      this.searchResults = "";
      this.searchTerm = "";
    }
  },
};
//@click="publishEvent(SidebarEvents.TOGGLE_TABS)"
</script>

<template>
  <div class="w-md-75 w-xs-100">
    <div class="d-flex w-100 mb-1 text-right">
      <input
        v-model="searchTerm"
        v-on:keyup.enter="doFulltextSearch"
        id="search-string"
        class="
          form-control form-control-sm
          mr-sm-2
          w-md-50 w-xs-75
          ml-auto
        "
        type="search"
        placeholder="Suchen"
        aria-label="Search"
      />
      <button
        @click="doFulltextSearch"
        id="search-full-text"
        class="btn btn-light btn-sm mr-0"
        type="button"
      >
        <i class="fa fa-search"></i>
      </button>
    </div>
    <div
      v-if="showSearchResults"
      class="h-100 w-md-50 w-xs-100 ml-auto px-0 mx-0"
      style="z-index: 3000"
    >
      
      <div class="p-3 bg-light" style="max-height: 80vh; overflow: auto">
        <div class = "d-flex">
        <div class="mb-2 w-75">
          {{ searchResults.length }} Suchtreffer für '{{ searchTerm }}':
          
        </div>
        <div class="w-25">
        <button
          type="button"
          class="close ml-auto align-self-center d-block"
          aria-label="Close"
          @click="deleteSearchResults()"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
        </div>
        <ul id="search-results" class="list-unstyled">
          <li class="mb-2" v-for="res in searchResults">
            <a
              v-if="res.doc.short.length > 0"
              class="underline"
              style="word-wrap: break-word; color: #004c97 !important"
              :href="'#' + res.doc.link"
              @click="searchResultClick(res.doc)"
            >
              <span v-html="res.doc.short"></span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style>
</style>