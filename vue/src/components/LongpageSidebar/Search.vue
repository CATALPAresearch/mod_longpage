<script>
import elasticlunr from "elasticlunr";
import Fuse from "fuse.js";
import {
  LONGPAGE_APP_CONTAINER_ID,
  SidebarTabKeys,
  SidebarEvents,
} from "@/config/constants";
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
      index: [],
      search: "",
      searchResults: "",
      searchTerm: "",
      showSearchResults: false,
      fuse: null,
    };
  },

  mounted: function () {
    this.setupSearch();
  },

  methods: {
    setupSearch: function () {
      let _this = this;
      let DocObj = new Object();

      // var customized_stop_words = ["an", "der", "die", "das"]; // add German stop words
      // elasticlunr.addStopWords(customized_stop_words);

      // _this.index = elasticlunr();
      // //index.use(de);
      // _this.index.addField("title");
      // _this.index.addField("body");
      // _this.index.setRef("id");
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
        DocObj = new Object();
        if ($(this).is("h2") || $(this).is("h3") || $(this).is("h4")) {
          DocObj.id = i;
          DocObj.title = $(val).text();
          DocObj.body = "";
          DocObj.link = $(val).attr("id");
          // _this.index.addDoc({
          //   id: i,
          //   title: $(val).text(),
          //   body: "",
          //   link: $(val).attr("id"),
          // });
        } else {
          let attr = $(this).attr("id");
          if (typeof attr === typeof undefined || attr === false) {
            $(val).attr("id", "search-" + i);
          }
          DocObj.id = i;
          DocObj.title = "";
          DocObj.body = $(val).text();
          DocObj.link = $(val).attr("id");
          // _this.index.addDoc({
          //   id: i,
          //   title: "",
          //   body: $(val).text(),
          //   link: $(val).attr("id"),
          // });
        }
        _this.index.push(DocObj);
      });
      let options = {
        // isCaseSensitive: false,
        includeScore: true,
        shouldSort: true,
        includeMatches: true,
        // findAllMatches: false,
        minMatchCharLength: 3,
        // location: 0,
        threshold: 0.5,
        // distance: 100,
        // useExtendedSearch: false,
        // ignoreLocation: false,
        // ignoreFieldNorm: false,
        keys: ["title", "body"],
      };
      this.fuse = new Fuse(this.index, options);
    },

    doFulltextSearch: function (e) {
      let _this = this;
      this.showSearchResults = true;
      let index = this.fuse.getIndex();

      this.searchResults = this.fuse.search(this.searchTerm);

      this.searchResults = this.searchResults.map(function (res) {
        let changelist = [];
        let pos = _this.index[res.refIndex].body.indexOf(_this.searchTerm);
        res.doc = new Object();
        res.doc.link = _this.index[res.refIndex].link;
        if (res.item.body != "") {
          if (pos > 0) {
            res.doc.short =
              "... " +
              _this.index[res.refIndex].body
                .substr(pos - 20 > 0 ? pos - 20 : 0, 40)
                .replace(
                  _this.searchTerm,
                  "<strong>" + _this.searchTerm + "</strong>"
                );
          } else {
            res.matches[0].indices.forEach((element) => {
              changelist.push(
                _this.index[res.refIndex].body.substr(
                  element[0],
                  element[1] - element[0] + 1
                )
              );
            });
            changelist.forEach((el) => {
              _this.index[res.refIndex].body = _this.index[
                res.refIndex
              ].body.replace(el, "<strong>" + el + "</strong>");
            });
            res.doc.short = _this.index[res.refIndex].body;
          }
        } else if (res.item.title != "") {
          if (pos > 0) {
            res.doc.short =
              "... " +
              _this.index[res.refIndex].title
                .substr(pos - 20 > 0 ? pos - 20 : 0, 40)
                .replace(
                  _this.searchTerm,
                  "<strong>" + _this.searchTerm + "</strong>"
                );
          } else {
            res.matches[0].indices.forEach((element) => {
              changelist.push(
                _this.index[res.refIndex].title.substr(
                  element[0],
                  element[1] - element[0] + 1
                )
              );
            });
            changelist.forEach((el) => {
              _this.index[res.refIndex].title = _this.index[
                res.refIndex
              ].title.replace(el, "<strong>" + el + "</strong>");
            });
            res.doc.short = _this.index[res.refIndex].title;
          }
        }
        return res;
      });
      EventBus.publish("searchterm-entered", {
        searchTerm: this.searchTerm,
        searchResults: this.searchResults.length,
      });
      e.preventDefault();
    },

    searchResultClick: function (doc) {
      EventBus.publish("searchresult-selected", {
        searchTerm: this.searchTerm,
        searchResults: this.searchResults.length,
        link: doc.link,
        short: doc.short,
      });
    },

    hideSearchResults: function () {
      this.showSearchResults = false;
    },
    publishEvent(EventType) {
      EventBus.publish(EventType);
    },
    deleteSearchResults() {
      this.searchResults = "";
      this.showSearchResults = false;
      //this.searchTerm = "";
    },
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
        class="form-control form-control-sm mr-sm-2 w-md-50 w-xs-75 ml-auto"
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
        <div class="d-flex">
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