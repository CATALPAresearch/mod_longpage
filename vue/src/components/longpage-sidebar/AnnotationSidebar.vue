<template>
  <div class="h-100 bg-light">
    <div class="h-100 d-flex flex-column">
      <div class="p-3 bg-white">
        <h3
          id="annotation-sidebar-heading"
          class="m-0"
        >
          {{ $t('sidebar.tabs.annotations.heading') }}
        </h3>
        <annotation-filter />
      </div>
      <hr class="my-0 mx-3">
      <div
        v-if="annotationsOrderedByTextPosition.length"
        :id="ANNOTATION_CARD_CONTAINER_ID"
        class="p-3 flex-shrink-1 flex-grow-1 overflow-y-auto overflow-x-hidden"
      >
        <thread
          v-for="annotation in annotationsOrderedByTextPosition"
          :key="annotation.id"
          :annotation="annotation"
          class="mb-3"
        />
      </div>
      <p
        v-else
        class="p-3"
      >
        {{ $t('annotationSidebar.notYetCreatedAnnotations') }}
      </p>
    </div>
  </div>
</template>

<script>
import Thread from './annotation-sidebar/Thread.vue';
import {mapGetters} from 'vuex';
import {GET} from '@/store/types';
import {ANNOTATION_CARD_CONTAINER_ID, SelectorType} from '@/config/constants';
import AnnotationFilter from '@/components/longpage-sidebar/annotation-sidebar/AnnotationFilter';

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
    Thread
  },
  data() {
    return {
      ANNOTATION_CARD_CONTAINER_ID,
    };
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
