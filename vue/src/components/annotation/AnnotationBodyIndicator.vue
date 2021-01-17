<template>
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
</template>

<script>
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
  };
</script>
