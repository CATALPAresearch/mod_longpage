<template>
  <div id="annotation-sidebar" class="col col-3 p-4">
    <h2 class="mb-4" id="annotation-sidebar-heading">{{ $t('annotationSidebar.heading') }}</h2>
    <annotation-card
        class="mb-4"
        v-for="annotation in annotationsOrderedByTextPosition"
        :key="annotation.id"
        :annotation="annotation"
    />
  </div>
</template>

<script>
import AnnotationCard from "./annotation-sidebar/AnnotationCard.vue";
import {mapGetters} from "vuex";
import {GET} from "@/store/types";
import {SelectorType} from "@/config/constants";

const AnnotationSortingFunction = Object.freeze({
  BY_POSITION: (annotationA, annotationB) => {
    const {start: startA = 0} = annotationA.target[0].selector.find(s => s.type === SelectorType.TEXT_POSITION_SELECTOR) || {};
    const {start: startB = 0} = annotationB.target[0].selector.find(s => s.type === SelectorType.TEXT_POSITION_SELECTOR) || {};
    return startA - startB;
  }
});

const setZIndex = (htmlElements, zIndex) => {
  htmlElements.forEach(element => element.style.zIndex = zIndex);
};

export default {
  name: "AnnotationSidebar",
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
}
</script>

<style lang="scss" scoped>
  #annotation-sidebar {
    border-left: 1px solid #dee2e6;
    position: sticky;

    #annotation-sidebar-heading {
      font-weight: bold;
    }
  }
</style>