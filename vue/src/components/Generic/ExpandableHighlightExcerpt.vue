<template>
  <div>
    <a
      class="font-italic longpage-highlight text-small"
      :class="[annotationTarget.styleClass, {'mr-1': isExpandable}]"
      @click.stop="$emit('highlight-clicked')"
    >
      {{ highlightedTextExcerpt }}
    </a>
    <a
      v-if="isExpandable"
      :key="isExpanded"
      role="button"
      class="badge badge-light"
      @click.stop="isExpanded = !isExpanded"
    >{{ isExpanded ? $t('expandable.less') : $t('expandable.more') }}</a>
  </div>
</template>

<script>
import {AnnotationTarget} from '@/types/annotation-target';

const MIN_EXPANDABLE_TEXT_LENGTH = 120;
const UNEXPANDED_TEXT_LENGTH = 100;

export default {
  name: 'ExpandableHighlightExcerpt',
  props: {
    annotationTarget: {type: AnnotationTarget, required: true},
  },
  emits: ['highlight-clicked'],
  data() {
    return {
      isExpanded: false,
    };
  },
  computed: {
    isExpandable() {
      return this.annotationTarget.text && this.annotationTarget.text.length > MIN_EXPANDABLE_TEXT_LENGTH;
    },
    highlightedTextExcerpt() {
      if (!this.isExpandable || this.isExpanded) return this.annotationTarget.text;

      const beginning = this.annotationTarget.text.slice(0, UNEXPANDED_TEXT_LENGTH);
      const suffix = beginning.endsWith('.') ? '..' : '...';
      return `${beginning}${suffix}`;
    },
  },
};
</script>
