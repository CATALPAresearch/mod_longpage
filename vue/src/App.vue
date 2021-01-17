<template>
  <div>
    <nav
      id="longpage-navbar"
      class="navbar-expand navbar-light bg-light py-2 mx-0 pl-1 pr-2"
    >
      <div class="row w-100 px-0 mx-0">
        <span class="title-toc col-4 col-sm-4 col-xs-12">
          <a class="navbar-brand">{{ context.pageName }}</a>
        </span>
        <div class="col-8 col-md-8 col-xs-12">
          <ul
            id="longpage-features"
            class="nav nav-tabs"
            role="tablist"
          >
            <li class="nav-item">
              <a
                id="toc-tab"
                class="nav-link"
                title="Inhaltsverzeichnis"
                data-toggle="tab"
                href="#tableofcontent"
                role="tab"
                aria-controls="tableofcontents"
                aria-selected="false"
                @click="showTabContent()"
              >
                <i class="fa fa-list" /><span class="ml-1 d-none d-md-inline">Inhaltsverzeichnis</span>
              </a>
            </li>
            <li
              hidden
              class="nav-item"
            >
              <a
                id="concepts-tab"
                class="nav-link"
                title="Concept Map"
                data-toggle="tab"
                href="#concepts"
                role="tab"
                aria-controls="concepts"
                aria-selected="false"
                @click="showTabContent()"
              >
                <i class="fa fa-map" /><span class="ml-1 d-none d-md-inline">Concept Map</span>
              </a>
            </li>
            <li
              hidden
              class="nav-item"
            >
              <a
                id="tests-tab"
                class="nav-link"
                title="Selbsttests"
                data-toggle="tab"
                href="#tests"
                role="tab"
                aria-controls="tests"
                aria-selected="false"
                @click="showTabContent()"
              >
                <i class="fa fa-check" /> <span class="ml-1 d-none d-md-inline">Selbsttestaufgaben</span>
              </a>
            </li>
            <li class="nav-item">
              <a
                id="search-tab"
                class="nav-link"
                data-toggle="tab"
                href="#search"
                role="tab"
                aria-controls="search"
                aria-selected="false"
                @click="showTabContent()"
              >
                <i class="fa fa-search" /> <span class="ml-1 d-none d-md-inline">Suche</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Longpage Feature Tabs -->
      <div
        id="myTabContent"
        :style="{display: tabContentVisible ? 'block' : 'none'}"
        class="tab-content"
      >
        <div
          id="tableofcontent"
          class="tab-pane fade p-3"
          role="tabpanel"
          aria-labelledby="toc-tab"
        >
          <TableOfContent
            @hideTabContent="hideTabContent"
            @log="log"
          />
        </div>
        <div
          id="concepts"
          class="tab-pane fade v"
          role="tabpanel"
          aria-labelledby="toc-tab"
        >
          <CourseRecommondation
            @hideTabContent="hideTabContent"
            @log="log"
          />
        </div>
        <div
          id="tests"
          class="tab-pane fade p-3"
          role="tabpanel"
          aria-labelledby="toc-tab"
        >
          Tests
          <button
            type="button"
            class="close ml-auto align-self-center d-block"
            aria-label="Close"
            @click="hideTabContent()"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div
          id="search"
          class="tab-pane fade p-3"
          role="tabpanel"
          aria-labelledby="search-tab"
        >
          <Search
            @hideTabContent="hideTabContent"
            @log="log"
          />
        </div>
      </div>
    </nav>

    <ReadingTime />
    <ReadingProgress
      :context="context"
      @log="log"
    />
  </div>
</template>

<script>
import CourseRecommondation from './components/CourseRecommondation';
import {ACT, GET} from './store/types';
import Log from './lib/Logging';
import {mapActions, mapGetters} from 'vuex';
import ReadingProgress from './components/ReadingProgress';
import ReadingTime from './components/ReadingTime';
import Search from './components/Search';
import TableOfContent from './components/TableOfContent';
import Utils from './util/utils';

export default {
    name: 'App',
    components: {
      CourseRecommondation,
      ReadingProgress,
      ReadingTime,
      Search,
      TableOfContent,
    },
    data: function() {
      return {
        eventListeners: [],
        tabContentVisible: false,
      };
    },
    computed: {
      logger() {
        return this.context ? new Log(new Utils(), this.context.courseId, {
          context: 'mod_page',
          outputType: 1
        }) : null;
      },
      ...mapGetters({context: GET.LONGPAGE_CONTEXT}),
    },
    created() {
      document.addEventListener('keyup', $event => {
        if ($event.keyCode === 27) {
          this.hideTabContent();
        }
      });
    },
    mounted() {
      this[ACT.FETCH_ENROLLED_USERS]();
      var _this = this;
      // Log bootstrap interactions
      $('.longpage-citation').click(function() {
        _this.log('citation_view', {citation: $(this).data('content')});
      });
      $('.longpage-footnote').click(function() {
        _this.log('footnote_view', {
          title: $(this).find('button').data('original-title'),
          text: $(this).find('button').data('content')
        });
      });
      $('.longpage-crossref').click(function() {
        _this.log('crossref_follow', {
          source: $(this).text(),
          target: $(this).attr('href'),
          parent: $(this).parent().attr('id')
        });
      });
      $('.longpage-assignment-link').click(function() {
        _this.log('assignment_open', {target: $(this).attr('href')});
      });
    },
    methods: {
      log(key, values) {
        this.logger.add(key, values);
      },
      showTabContent() {
        this.tabContentVisible = true;
      },
      hideTabContent() {
        this.tabContentVisible = false;
        if (document.querySelector('#longpage-features').querySelector('a.active.show')) {
          document.querySelector('#longpage-features').querySelector('a.active.show').classList.remove('active');
        }
      },
      ...mapActions([ACT.FETCH_ENROLLED_USERS]),
    },
};
</script>
