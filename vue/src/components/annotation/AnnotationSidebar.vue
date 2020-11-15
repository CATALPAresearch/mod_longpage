<template>
  <div id="annotation-sidebar" class="col-3 p-3">
    <h2 id="annotation-sidebar-heading">{{ $t('annotationSidebar.heading') }}</h2>
    <annotation-card
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

export default {
  name: "AnnotationSidebar",
  components: {
    AnnotationCard
  },
  computed: {
    annotationsOrderedByTextPosition() {
      const sortedAnnotations =  this.annotations.sort(AnnotationSortingFunction.BY_POSITION);
      console.log(sortedAnnotations);
      return sortedAnnotations;
    },
    ...mapGetters({
      annotations: GET.ANNOTATIONS,
    }),
  },
}
</script>

<style lang="scss" scoped>
  #annotation-sidebar {
    box-shadow: -2px 4px rgba(0,0,0,.08);
    position: sticky;

    #annotation-sidebar-heading {
      font-weight: bold;
    }
  }
</style>