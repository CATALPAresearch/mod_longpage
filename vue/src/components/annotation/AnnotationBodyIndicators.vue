<template>
  <annotation-body-indicator
    v-for="(annotations, top) in indicatorTopToAnnotationsMap"
    :key="`${top}-${annotations.length}-${annotations.reduce((sum, annotation) => sum + (annotation.hasBody ? 1 : 0))}`"
    :annotations="annotations"
    :top="Number(top)"
  />
</template>

<script>
import AnnotationBodyIndicator from '@/components/annotation/AnnotationBodyIndicator';
import emitter from 'tiny-emitter/instance';
import {LINE_HEIGHT_IN_PX, LONGPAGE_TEXT_CONTAINER_ID} from '@/config/constants';
import {MUTATE} from '@/store/types';
import {ResizeObserver} from '@juggle/resize-observer';

  // TODO: Recalculate only new, updated or deleted indicators on update of annotations or anchors
  //         (currently all; key can be removed/simplified then)

  export default {
    name: 'AnnotationBodyIndicators',
    components: {
      AnnotationBodyIndicator
    },
    props: {
      parentElement: {type: Element, required: true},
    },
    data() {
      return {
        anchors: [],
        indicatorTopToAnnotationsMap: {},
      };
    },
    mounted() {
      this.updateOnResize(document.getElementById(LONGPAGE_TEXT_CONTAINER_ID));
      this.updateOnAnchorUpdates();
      this.updateOnAnnotationUpdates();
    },
    methods: {
      getIndicatorTop(highlights, offset = 0) {
        return highlights
          .map(highlight => highlight.getBoundingClientRect().bottom)
          .reduce((maxBottom, bottom) => Math.max(maxBottom, bottom)) - offset;
      },
      getTopOffset() {
        return this.parentElement.getBoundingClientRect().top + LINE_HEIGHT_IN_PX;
      },
      updateIndicatorTopToAnnotationsMap(anchors, map = {}) {
        return anchors
          .filter(anchor => Boolean(anchor.annotation.hasBody))
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
      updateOnAnnotationUpdates() {
        this.$store.subscribe(mutation => {
          switch (mutation.type) {
            case MUTATE.UPDATE_ANNOTATION:
              this.indicatorTopToAnnotationsMap = this.updateIndicatorTopToAnnotationsMap(this.anchors);
          }
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
