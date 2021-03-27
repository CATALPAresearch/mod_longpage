<template>
  <div
    id="annotation-toolbar-popover"
    ref="annotationToolbarPopover"
    :style="style"
  >
    <div
      v-show="arrowDirection === ArrowDirection.UP"
      ref="arrowUp"
      class="arrow-up mx-auto"
    />
    <div
      id="annotation-toolbar"
      class="d-flex align-items-center p-1"
      :class="{
        'shadow-down': arrowDirection === ArrowDirection.DOWN,
        'shadow-up': arrowDirection === ArrowDirection.UP
      }"
    >
      <div
        v-for="(option, index) in highlightingOptions"
        :key="index"
        class="annotation-toolbar-item dot"
        :class="[option]"
        :title="$t('content.annotationToolbar.createHighlight')"
        :aria-label="$t('content.annotationToolbar.createHighlight')"
        @click.prevent="$emit('highlight-clicked', option)"
      >
        A
      </div>
      <div
        class="annotation-toolbar-item dot"
      >
        <i
          :title="$t('content.annotationToolbar.createBookmark')"
          :aria-label="$t('content.annotationToolbar.createBookmark')"
          class="fa fa-bookmark-o fa-fw"
          @click.prevent="$emit('bookmark-clicked')"
        />
      </div>
      <div
        class="annotation-toolbar-item dot"
      >
        <i
          :title="$t('content.annotationToolbar.createPost')"
          :aria-label="$t('content.annotationToolbar.createPost')"
          class="fa fa-comment-o fa-fw"
          @click.prevent="$emit('post-clicked')"
        />
      </div>
    </div>
    <div
      v-show="arrowDirection === ArrowDirection.DOWN"
      ref="arrowDown"
      class="arrow-down mx-auto"
    />
  </div>
</template>

<script>
  import {ArrowDirection} from '../../config/constants';
  import {toNumber, toPx} from '../../util/style';

  export default {
    name: 'AnnotationToolbar',
    props: {
      arrowDirection: {type: Number, default: ArrowDirection.UP},
      highlightingOptions: {type: Array, default: () => []},
      showDelete: {type: Boolean, default: false},
      left: {type: Number, required: true},
      top: {type: Number, required: true},
      visible: {type: Boolean, default: false},
      zIndex: {type: Number, default: 999999},
    },
    emits: ['bookmark-clicked', 'highlight-clicked', 'post-clicked'],
    data() {
      return {
        ArrowDirection,
      };
    },
    computed: {
      style() {
        return {
          left: toPx(this.left),
          top: toPx(this.top),
          visibility: this.visible ? 'visible' : 'hidden',
          zIndex: this.zIndex,
        };
      },
    },
    methods: {
      arrowHeight() {
        const ref = this.arrowDirection === ArrowDirection.UP ? 'arrowUp' : 'arrowDown';
        return toNumber(window.getComputedStyle(this.$refs[ref]).getPropertyValue('border-top-width'));
      },
      boundingClientRect() {
        return this.$refs.annotationToolbarPopover.getBoundingClientRect();
      },
      height() {
        return this.boundingClientRect().height;
      },
      width() {
        return this.boundingClientRect().width;
      },
    },
  };
</script>

<style lang="scss">
@import "../../styles/main.scss";
@import "~hover.css";

#annotation-toolbar-popover {
  display: inline-block;
  position: absolute;
  text-align: center;
  font-size: 1rem;

  #annotation-toolbar {
    background-color: white;
    border-radius: 20px;
    display: inline-block;
  }

  .shadow-down {
    box-shadow: 0 2px 4px 2px rgba(39, 43, 49, 0.2) !important;
  }

  .shadow-up {
    box-shadow: 0 -2px 4px 2px rgba(39, 43, 49, 0.2) !important;
  }
}

.annotation-toolbar-item {
  @extend .hvr-grow !optional;
  margin: 0.125rem;
  cursor: pointer;
}

.dot {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  display: inline-block;
  line-height: 20px;
}

$arrow-color: white;

@mixin arrow {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid $arrow-color;
}

.arrow-down {
  @include arrow;
  transform: rotate(0deg);
  -webkit-transform: rotate(0deg);
}

.arrow-up {
  @include arrow;
  transform: rotate(180deg);
  -webkit-transform: rotate(180deg);
}
</style>
