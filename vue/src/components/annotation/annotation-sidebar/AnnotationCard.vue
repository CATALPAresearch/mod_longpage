<template>
  <div class="border-secondary card hvr-grow-shadow" @click="$emit('selected')">
    <div class="card-body text-dark p-2">
      <div class="font-weight-lighter mb-1 text-right text-small">
        {{ $t('annotationSidebar.annotationCard.created') }} {{ createdLocaleDateString }}
        <span v-if="createdLocaleDateString !== lastModifiedLocaleDateString">
          <span class="font-italic">
            ({{ $t('annotationSidebar.annotationCard.lastModified') }} {{ lastModifiedLocaleDateString }})
          </span>
        </span>
      </div>
      <div class="mb-1 p-2">
        <span class="font-italic longpage-highlight text-small" :class="annotationTarget.styleclass">
          {{ highlightedText }}
        </span>
      </div>
      <div class="annotation-actions card-actions text-right">
        <font-awesome-icon class="ml-1" icon="trash" @click.stop="$emit('delete')" />
        <font-awesome-icon class="ml-1" icon="pen" @click.stop="$emit('edit')" />
      </div>
    </div>
  </div>
</template>

<script>
import {Annotation} from "../../../lib/annotation/types/annotation";
import {DateTimeFormatter} from "@/config/i18n";
import {SelectorType} from '../../../config/constants';

export default {
  name: "AnnotationCard",
  props: {
    annotation: {type: Annotation, required: true},
  },
  computed: {
    annotationTarget() {
      return this.annotation.target[0];
    },
    createdLocaleDateString() {
      return DateTimeFormatter.format(new Date(Number(this.annotation.timecreated)));
    },
    highlightedText() {
      const textQuoteSelector = this.annotationTarget.selector.find(sel => sel.type === SelectorType.TEXT_QUOTE_SELECTOR);
      return textQuoteSelector ? textQuoteSelector.exact : '';
    },
    lastModifiedLocaleDateString() {
      return DateTimeFormatter.format(new Date(Number(this.annotation.timemodified)));
      return this.annotation.timemodified === this.annotation.timecreated ?
          DateTimeFormatter.format(new Date(Number(this.annotation.timemodified))) : '';
    },
  },
}
</script>

<style lang="scss" scoped>
  .card {
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    display: block;

    &:hover {
      cursor: pointer;
    }
  }
</style>