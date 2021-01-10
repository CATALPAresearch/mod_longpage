<template>
  <div
    :id="`annotation-card-${annotation.id}`"
    class="annotation-card border-secondary card hvr-glow"
    @click.stop="selectAnnotation"
  >
    <div class="card-body text-dark p-2">
      <div class="font-weight-lighter mb-1 text-right text-small">
        {{ $t('annotationSidebar.annotationCard.created') }}
        <date-time-text :date-time="annotation.timecreated" />
        <span v-if="annotation.timecreated !== annotation.timemodified">
          <span class="font-italic">
            ({{ $t('annotationSidebar.annotationCard.lastModified') }}
            <date-time-text :date-time="annotation.timemodified" />)
          </span>
        </span>
      </div>
      <div class="mb-1 p-2">
        <span
          class="font-italic longpage-highlight text-small"
          :class="annotationTarget.styleclass"
        >
          {{ highlightedText }}
        </span>
      </div>
      <div class="p-2">
        <span v-if="!isBeingEdited">{{ annotation.body }}</span>
        <textarea
          v-else
          v-model="annotationUpdate.body"
          class="form-control"
          rows="3"
          @click.stop=""
        />
      </div>
      <div class="annotation-actions card-actions text-right">
        <div v-if="!isBeingEdited">
          <font-awesome-icon
            class="ml-1"
            icon="trash"
            @click.stop="deleteAnnotation"
          />
          <font-awesome-icon
            class="ml-1"
            icon="pen"
            @click.stop="openEditor"
          />
        </div>
        <div v-else>
          <font-awesome-icon
            class="ml-1"
            icon="times"
            @click.stop="closeEditor"
          />
          <font-awesome-icon
            class="ml-1"
            icon="save"
            @click.stop="updateAnnotation"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ACT, MUTATE} from '@/store/types';
import {Annotation} from '@/lib/annotation/types/annotation';
import {cloneDeep} from 'lodash';
import DateTimeText from '@/components/DateTimeText';
import {HighlightingConfig, LONGPAGE_TEX_OVERLAY_ID, SelectorType} from '@/config/constants';
import {mapActions, mapMutations} from 'vuex';
import scrollIntoView from 'scroll-into-view';

export default {
  name: 'AnnotationCard',
  components: {
    DateTimeText,
  },
  props: {
    annotation: {type: Annotation, required: true},
  },
  data() {
    return {
      isBeingEdited: false,
      annotationUpdate: null,
    };
  },
  computed: {
    annotationTarget() {
      return this.annotation.target[0];
    },
    highlightedText() {
      const textQuoteSelector = this.annotationTarget.selector.find(sel => sel.type === SelectorType.TEXT_QUOTE_SELECTOR);
      return textQuoteSelector ? textQuoteSelector.exact : '';
    },
    highlightHTMLElement() {
      return Array.from(document.getElementsByTagName(HighlightingConfig.HL_TAG_NAME)).find(element => element._annotation === this.annotation);
    },
  },
  methods: {
    closeEditor() {
      this.isBeingEdited = false;
      this.annotationUpdate = null;
    },
    deleteAnnotation() {
      this[ACT.DELETE_ANNOTATION](this.annotation);
    },
    openEditor() {
      this.isBeingEdited = true;
      this.annotationUpdate = cloneDeep(this.annotation);
    },
    selectAnnotation() {
      this[MUTATE.SET_SELECTED_ANNOTATIONS]([this.annotation]);
      scrollIntoView(this.highlightHTMLElement);
      document.getElementById(LONGPAGE_TEX_OVERLAY_ID).style.display = 'block';
    },
    updateAnnotation() {
      this[ACT.UPDATE_ANNOTATION](this.annotationUpdate);
      this.closeEditor();
    },
    ...mapActions([ACT.DELETE_ANNOTATION, ACT.UPDATE_ANNOTATION]),
    ...mapMutations([MUTATE.SET_SELECTED_ANNOTATIONS]),
  }
};
</script>

<style lang="scss" scoped>
  .card {
    display: block;

    &:hover {
      cursor: pointer;
    }
  }
</style>