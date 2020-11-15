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

export default {
  name: "AnnotationSidebar",
  components: {
    AnnotationCard
  },
  computed: {
    annotationsOrderedByTextPosition() {
      return this.annotations.sort((annA, annB) => annA.target[0].selector[1].startposition - annB.target[0].selector[1].startposition);
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