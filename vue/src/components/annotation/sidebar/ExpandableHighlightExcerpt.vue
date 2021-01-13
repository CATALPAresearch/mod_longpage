<template>
  <div>
    <a
      class="font-italic longpage-highlight text-small"
      :class="[highlightStyleClass, {'mr-1': isExpandable}]"
      @click.stop="$emit('highlight-clicked')"
    >
      {{ highlightedTextExcerpt }}
    </a>
    <a
      v-if="isExpandable"
      :key="isExpanded"
      class="badge badge-light link"
      @click.stop="isExpanded = !isExpanded"
    >{{ isExpanded ? $t('annotationCard.less') : $t('annotationCard.more') }}</a>
  </div>
</template>

<script>
const MIN_EXPANDABLE_TEXT_LENGTH = 120;
const UNEXPANDED_TEXT_LENGTH = 100;

export default {
  name: 'ExpandableHighlightExcerpt',
  props: {
    highlightedText: {type: String, required: true},
    highlightStyleClass: {type: String, required: true},
  },
  data() {
    return {
      isExpanded: false,
    };
  },
  computed: {
    isExpandable() {
      return this.highlightedText && this.highlightedText.length > MIN_EXPANDABLE_TEXT_LENGTH;
    },
    highlightedTextExcerpt() {
      if (!this.isExpandable || this.isExpanded) return this.highlightedText;

      const beginning = this.highlightedText.slice(0, UNEXPANDED_TEXT_LENGTH);
      const suffix = beginning.endsWith('.') ? '..' : '...';
      return `${beginning}${suffix}`;
    },
  },
};
</script>
