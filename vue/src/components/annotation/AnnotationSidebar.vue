<template>
  <div
    id="annotation-sidebar"
    class="p-4"
  >
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

  #annotation-sidebar-wrapper {
    border-left: 1px solid #dee2e6;

    #annotation-sidebar {
      position: -webkit-sticky;
      position: sticky;
      top: calc(#{$moodle-navbar-height} + #{$longpage-navbar-height});
      overflow-y: auto;
      height: calc(100vh - #{$moodle-navbar-height} - #{$longpage-navbar-height});

      #annotation-sidebar-heading {
        font-weight: bold;
        position: -webkit-sticky;
        position: sticky;
      }
    }
  }
</style>