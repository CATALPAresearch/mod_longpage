<template>
  <div>
    <a
      role="button"
      :style="style"
      class="position-absolute text-secondary div text-secondary fa-1-5x"
      @click.stop="filterAnnotations"
    >
      <i class="svg icon fa fa-comment-o fa-fw fa-w-16" />
      <span
        v-if="count > 1"
        class="span bg-dark font-weight-boldest text-white"
      >{{ count }}</span>
    </a>
  </div>
</template>

<script>
  import {ACT} from '@/store/types';
  import {mapActions} from 'vuex';
  import {toPx} from '@/util/style';

  export default {
    name: 'PostIndicator',
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
        // This[ACT.FILTER_ANNOTATIONS]({ids: this.annotations.map(annotation => annotation.id)});
      },
      ...mapActions([ACT.FILTER_ANNOTATIONS]),
    }
  };
</script>

<style lang="scss" scoped>
.div {
  line-height: 1.5;
  box-sizing: border-box;
  display: inline-block;
  height: 1em;
  position: relative;
  text-align: center;
  vertical-align: -0.125em;
  width: 1em;
}

.svg {
  box-sizing: border-box;
  display: inline-block;
  height: 1em;
  font-size: inherit;
  vertical-align: -0.125em;
  width: 1em;
  overflow: visible;
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  transform-origin: center center;
}

.span {
  display: inline-block;
  position: absolute;
  border-radius: 1em;
  box-sizing: border-box;
  height: 1.5em;
  line-height: 1;
  max-width: 5em;
  min-width: 1.5em;
  padding: 0.25em;
  text-overflow: ellipsis;
  right: 0;
  top: 0;
  transform: scale(0.25);
  transform-origin: top right;
}
</style>
