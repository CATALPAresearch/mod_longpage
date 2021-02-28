<template>
  <div ref="postIndicators">
    <post-indicator
      v-for="(annotations, top) in indicatorTopToAnnotationsMap"
      :key="`${top}-${annotations.length}-${annotations.reduce((sum, annotation) => sum + (annotation.hasBody ? 1 : 0))}`"
      :annotations="annotations"
      :top="Number(top)"
    />
  </div>
</template>

<script>
  import PostIndicator from '@/components/LongpageContent/PostIndicator';
  import emitter from 'tiny-emitter/instance';
  import {LONGPAGE_CONTENT_ID} from '@/config/constants';
  import {ResizeObserver} from '@juggle/resize-observer';

  export default {
    name: 'PostIndicators',
    components: {
      PostIndicator
    },
    data() {
      return {
        anchors: [],
        indicatorTopToAnnotationsMap: {},
        parentElement: null,
      };
    },
    mounted() {
      this.parentElement = this.$refs.postIndicators;
      this.updateOnAnchorUpdates();
      this.updateOnResize(document.getElementById(LONGPAGE_CONTENT_ID));
    },
    methods: {
      getIndicatorTop(highlights, offset = 0) {
        return highlights
          .map(highlight => highlight.getBoundingClientRect().top)
          .reduce((minTop, top) => Math.timeMin(minTop, top)) - offset;
      },
      getTopOffset() {
        return this.parentElement.getBoundingClientRect().top;
      },
      updateIndicatorTopToAnnotationsMap(anchors, map = {}) {
        return anchors
          .filter(anchor => Boolean(anchor.annotation.body))
          .map(anchor => [this.getIndicatorTop(anchor.highlights, this.getTopOffset()), anchor.annotation])
          .reduce((result, [top, annotation]) => {
            result[top] = result[top] || [];
            result[top].push(annotation);
            return result;
          }, map);
      },
      updateOnAnchorUpdates() {
        emitter.on('anchors-updated', anchors => {
          this.anchors = anchors;
          this.indicatorTopToAnnotationsMap = this.updateIndicatorTopToAnnotationsMap(anchors);
        });
      },
      updateOnResize(container) {
        const ro = new ResizeObserver(() => {
          this.indicatorTopToAnnotationsMap = this.updateIndicatorTopToAnnotationsMap(this.anchors);
        });
        ro.observe(container);
      }
    }
  };
</script>
