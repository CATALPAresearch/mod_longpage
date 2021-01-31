<template>
  <div
    id="sidebar"
    class="h-100 row"
  >
    <div
      id="longpage-sidebar-main"
      class="col"
    >
      <div
        id="v-pills-tabContent"
        class="tab-content"
      >
        <div
          id="v-pills-home"
          class="tab-pane fade show active"
          role="tabpanel"
          aria-labelledby="v-pills-home-tab"
        >
          <div
            id="sidebar-content col"
            class="p-4"
          >
            <div id="annotation-sidebar">
              <h2
                id="annotation-sidebar-heading"
              >
                {{ $t('annotationSidebar.heading') }}
              </h2>
              <annotation-filter />
              <div
                v-if="annotationsOrderedByTextPosition.length"
                id="annotation-card-container"
              >
                <annotation-card
                  v-for="annotation in annotationsOrderedByTextPosition"
                  :key="annotation.id"
                  :annotation="annotation"
                  class="my-4"
                />
              </div>
              <p v-else>
                {{ $t('annotationSidebar.notYetCreatedAnnotations') }}
              </p>
            </div>
          </div>
        </div>
        <div
          id="v-pills-profile"
          class="tab-pane fade"
          role="tabpanel"
          aria-labelledby="v-pills-profile-tab"
        >
          ...
        </div>
        <div
          id="v-pills-messages"
          class="tab-pane fade"
          role="tabpanel"
          aria-labelledby="v-pills-messages-tab"
        >
          ...
        </div>
        <div
          id="v-pills-settings"
          class="tab-pane fade"
          role="tabpanel"
          aria-labelledby="v-pills-settings-tab"
        >
          ...
        </div>
      </div>
    </div>
    <div class="col-auto border-left p-0 h-100">
      <div
        id="v-pills-tab"
        class="nav flex-column nav-pills"
        role="tablist"
        aria-orientation="vertical"
      >
        <a
          id="v-pills-home-tab"
          class="nav-link active"
          data-toggle="pill"
          href="#v-pills-home"
          role="tab"
          aria-controls="v-pills-home"
          aria-selected="true"
        ><font-awesome-icon
          :icon="['far', 'comment']"
          class="fa-1-5x"
        /></a>
        <a
          id="v-pills-profile-tab"
          class="nav-link"
          data-toggle="pill"
          href="#v-pills-profile"
          role="tab"
          aria-controls="v-pills-profile"
          aria-selected="false"
        ><i class="fa fa-list fa-1-5x" /></a>
        <a
          id="v-pills-messages-tab"
          class="nav-link"
          data-toggle="pill"
          href="#v-pills-messages"
          role="tab"
          aria-controls="v-pills-messages"
          aria-selected="false"
        ><i class="fa fa-search fa-1-5x" /></a>
      </div>
    </div>
  </div>
</template>

<script>
import AnnotationCard from './sidebar/AnnotationCard.vue';
import {mapGetters} from 'vuex';
import {GET} from '@/store/types';
import {SelectorType} from '@/config/constants';
import AnnotationFilter from '@/components/annotation/sidebar/AnnotationFilter';

const AnnotationSortingFunction = Object.freeze({
  BY_POSITION: (annotationA, annotationB) => {
    const {start: startA = 0} = annotationA.target[0].selector.find(s => s.type === SelectorType.TEXT_POSITION_SELECTOR) || {};
    const {start: startB = 0} = annotationB.target[0].selector.find(s => s.type === SelectorType.TEXT_POSITION_SELECTOR) || {};
    return startA - startB;
  }
});

export default {
  name: 'AnnotationSidebar',
  components: {
    AnnotationFilter,
    AnnotationCard
  },
  computed: {
    annotationsOrderedByTextPosition() {
      return Array.from(this.annotations).sort(AnnotationSortingFunction.BY_POSITION);
    },
    ...mapGetters({
      annotations: GET.ANNOTATIONS_TARGETING_PAGE_SEGMENT_FILTERED,
    }),
  },
};
</script>

<style lang="scss">
  @import "../../styles/main.scss";

  //#annotation-sidebar {
  //  position: -webkit-sticky;
  //  position: sticky;
  //  top: $moodle-navbar-height;
  //  overflow-y: auto;
  //  height: calc(100vh - #{$moodle-navbar-height});
  //
  //  #annotation-sidebar-heading {
  //    font-weight: bold;
  //    position: -webkit-sticky;
  //    position: sticky;
  //  }
  //}
</style>