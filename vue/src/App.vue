<template>
  <div
    id="longpage-app"
    class="row no-gutters w-100"
  >
    <div
      id="longpage-main"
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
        style="width: 1.5em;"
      >
        <note-indicators />
      </div>
    </div>
    <longpage-sidebar class="col-auto" />
  </div>
</template>

<script>
import {ACT, GET} from './store/types';
import {mapActions, mapGetters} from 'vuex';
import AnnotationBodyIndicators from '@/components/annotation/AnnotationBodyIndicators';
import Log from './lib/Logging';
import {LONGPAGE_CONTENT_ID} from '@/config/constants';
import LongpageSidebar from '@/components/longpage-sidebar';
import {ReadingTimeEstimator} from '@/lib/reading-time-estimator';
import {toIdSelector} from '@/util/style';
import Utils from './util/utils';

export default {
    name: 'App',
    components: {
      NoteIndicators: AnnotationBodyIndicators,
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
    created() {
      document.addEventListener('keyup', $event => {
        if ($event.keyCode === 27) {
          this.hideTabContent();
        }
      });
    },
    mounted() {
      Y.use('mathjax', () => {
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.$refs.contentRef]);
      });
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

<style lang="scss">
#longpage-main {

}
</style>
