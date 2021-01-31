<template>
  <div
    class="h-100 overflow-y-auto overflow-x-hidden"
  >
    <div class="pt-3 px-3 bg-white sticky-top">
      <h3
        id="annotation-sidebar-heading"
      >
        {{ $t('annotationSidebar.heading') }}
      </h3>
      <annotation-filter />
      <hr>
    </div>
    <div class="pb-3 px-3">
      <div
        v-if="annotationsOrderedByTextPosition.length"
        id="annotation-card-container"
      >
        <annotation-card
          v-for="annotation in annotationsOrderedByTextPosition"
          :key="annotation.id"
          :annotation="annotation"
          class="my-3"
        />
      </div>
      <p
        v-else
      >
        {{ $t('annotationSidebar.notYetCreatedAnnotations') }}
      </p>
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
