<template>
  <div class="border-secondary card hvr-grow-shadow" @click.stop="selectAnnotation">
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
        <font-awesome-icon class="ml-1" icon="trash" @click.stop="deleteAnnotation" />
        <font-awesome-icon class="ml-1" icon="pen" @click.stop="$emit('edit')" />
      </div>
    </div>
  </div>
</template>

<script>
import {Annotation} from "@/lib/annotation/types/annotation";
import {DateTimeFormatter} from "@/config/i18n";
import {HighlightingConfig,SelectorType} from '@/config/constants';
import {mapActions, mapMutations} from 'vuex';
import scrollIntoView from 'scroll-into-view';
import {ACT, MUTATE} from "@/store/types";

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
    highlightHTMLElement() {
      return Array.from(document.getElementsByTagName(HighlightingConfig.HL_TAG_NAME)).find(element => element._annotation === this.annotation);
    },
    lastModifiedLocaleDateString() {
      return DateTimeFormatter.format(new Date(Number(this.annotation.timemodified)));
      return this.annotation.timemodified === this.annotation.timecreated ?
          DateTimeFormatter.format(new Date(Number(this.annotation.timemodified))) : '';
    },
  },
  methods: {
    deleteAnnotation() {
      this[ACT.DELETE_ANNOTATION](this.annotation);
    },
    selectAnnotation() {
      this[MUTATE.SET_SELECTED_ANNOTATIONS]([this.annotation]);
      scrollIntoView(this.highlightHTMLElement);
      document.getElementById('overlay').style.display = 'block';
    },
    ...mapActions([ACT.DELETE_ANNOTATION]),
    ...mapMutations([MUTATE.SET_SELECTED_ANNOTATIONS]),
  }
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