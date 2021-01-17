<template>
  <a
    role="button"
    @click.stop="filterAnnotations"
  >
    <font-awesome-layers
      full-width
      :style="style"
      class="annotation-body-indicator fa-1-5x position-absolute text-secondary"
    >
      <font-awesome-icon :icon="['far', 'comment']" />
      <font-awesome-layers-text
        v-if="count > 1"
        counter
        :value="count"
        position="top-right"
        class="bg-dark font-weight-boldest text-white"
      />
    </font-awesome-layers>
  </a>
</template>

<script>
  import {ACT} from '@/store/types';
  import {mapActions} from 'vuex';
  import {toPx} from '@/util/style';

  export default {
    name: 'AnnotationBodyIndicator',
    props: {
      annotations: {type: Array, default: () => []},
      top: {type: Number},
      visible: {type: Boolean, default: true},
    },
    computed: {
      count() {
        return this.annotations.length;
      },
      style() {
        return {
          top: toPx(this.top),
          visibility: this.visible ? 'visible' : 'hidden',
        };
      },
    },
    methods: {
      filterAnnotations() {
        this[ACT.FILTER_ANNOTATIONS]({ids: this.annotations.map(annotation => annotation.id)});
      },
      ...mapActions([ACT.FILTER_ANNOTATIONS]),
    }
  };
</script>
