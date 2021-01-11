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
import AnnotationCard from './annotation-sidebar/AnnotationCard.vue';
import {mapGetters} from 'vuex';
import {GET} from '@/store/types';
import {SelectorType} from '@/config/constants';

const AnnotationSortingFunction = Object.freeze({
  BY_POSITION: (annotationA, annotationB) => {
    const {start: startA = 0} = annotationA.target[0].selector.find(s => s.type === SelectorType.TEXT_POSITION_SELECTOR) || {};
    const {start: startB = 0} = annotationB.target[0].selector.find(s => s.type === SelectorType.TEXT_POSITION_SELECTOR) || {};
    return startA - startB;
  }
});

const setZIndex = (htmlElements, zIndex) => {
  htmlElements.forEach(element => {
    element.style.zIndex = zIndex;
  });
};

export default {
  name: 'AnnotationSidebar',
  components: {
    AnnotationCard
  },
  computed: {
    annotationsOrderedByTextPosition() {
      return Array.from(this.annotations).sort(AnnotationSortingFunction.BY_POSITION);
    },
    ...mapGetters({
      annotations: GET.ANNOTATIONS,
      selectedHighlights: GET.SELECTED_HIGHLIGHTS,
    }),
  },
  watch: {
    selectedHighlights(newValue, oldValue) {
      setZIndex(newValue, 3); // TODO: Get value from overlay
      setZIndex(oldValue, 2); // TODO: Get value from old value
    },
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