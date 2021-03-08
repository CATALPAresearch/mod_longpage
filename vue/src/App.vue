<template>
  <div
    id="longpage-app"
    class="row no-gutters w-100"
  >
    <div
      id="longpage-main"
      ref="mainRef"
      class="col vh-100-wo-nav overflow-y-auto row no-gutters justify-content-center p-3"
    >
      <div
        id="longpage-content"
        ref="contentRef"
        class="generalbox center clearfix col"
        lang="de"
        v-html="content"
      />
      <div
        class="col col-auto p-0 mx-1"
        style="width: 3em;"
      >
        <post-indicators />
      </div>
    </div>
    <longpage-sidebar class="col-auto" />
  </div>
</template>

<script>
import {ACT, GET} from './store/types';
import {AnnotationType, LONGPAGE_CONTENT_ID} from '@/config/constants';
import {EventBus} from '@/lib/event-bus';
import {getHighlightsAnchoredAt} from '@/lib/annotation/highlight-selection-listening';
import Log from './lib/Logging';
import LongpageSidebar from '@/components/LongpageSidebar';
import {mapActions, mapGetters} from 'vuex';
import PostIndicators from '@/components/LongpageContent/AnnotationIndicatorSidebar';
import {ReadingTimeEstimator} from '@/lib/reading-time-estimator';
import {toIdSelector} from '@/util/style';
import Utils from './util/utils';

export default {
    name: 'App',
    components: {
      PostIndicators,
      LongpageSidebar,
    },
    props: {
      content: {type: String, required: true},
    },
    data() {
      return {
        eventListeners: [],
        readingTimeEstimator: new ReadingTimeEstimator(toIdSelector(LONGPAGE_CONTENT_ID)),
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
    mounted() {
      this.$refs.mainRef.addEventListener('click', event => {
        const highlightsAtClickCoords = getHighlightsAnchoredAt(event.target);
        EventBus.publish('annotations-selected', {
          type: highlightsAtClickCoords.length ? AnnotationType.HIGHLIGHT : undefined,
          selection: highlightsAtClickCoords,
        });
      });

      Y.use('mathjax', () => {
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.$refs.contentRef]);
      });
      this[ACT.FETCH_USER_ROLES]();
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
      ['h2', 'h3'].forEach(hTag => {
        this.readingTimeEstimator.calcAndDisplay(hTag);
      });
    },
    methods: {
      log(key, values) {
        this.logger.add(key, values);
      },
      ...mapActions([ACT.FETCH_ENROLLED_USERS, ACT.FETCH_USER_ROLES]),
    },
};
</script>
