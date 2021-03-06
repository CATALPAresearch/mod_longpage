<template>
  <div ref="postIndicators">
    <annotation-indicator
      v-for="(annotations, top) in indicatorTopToAnnotationsMap"
      :key="`${top}-${annotations.length}-${annotations.reduce((sum, annotation) => sum + (annotation.hasBody ? 1 : 0))}`"
      :annotations="annotations"
      :annotation-types="annotationTypesIndicated"
      :top="Number(top)"
    />
  </div>
</template>

<script>
import AnnotationIndicator from '@/components/LongpageContent/AnnotationIndicator';
import emitter from 'tiny-emitter/instance';
import {AnnotationType, LONGPAGE_CONTENT_ID} from '@/config/constants';
import {ResizeObserver} from '@juggle/resize-observer';

export default {
    name: 'AnnotationIndicatorSidebar',
    components: {
      AnnotationIndicator,
    },
    data() {
      return {
        anchors: [],
        annotationTypesIndicated: [AnnotationType.POST, AnnotationType.BOOKMARK],
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
          .reduce((minTop, top) => Math.min(minTop, top)) - offset;
      },
      getTopOffset() {
        return this.parentElement.getBoundingClientRect().top;
      },
      updateIndicatorTopToAnnotationsMap(anchors, map = {}) {
        return anchors
          .filter(anchor => this.annotationTypesIndicated.includes(anchor.annotation.type))
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
