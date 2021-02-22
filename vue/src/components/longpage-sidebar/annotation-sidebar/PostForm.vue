<template>
  <div
    v-if="annotationUpdate"
    class="text-right"
  >
    <textarea
      ref="annotationEditor"
      v-model="annotationUpdate.body"
      class="form-control"
      :placeholder="$t('annotationCard.editor.bodyTextareaPlaceholder')"
      rows="3"
      @click.stop=""
      @keydown.enter.meta.exact="updateAnnotation"
      @keydown.esc.exact="closeEditor"
    />
    <button
      type="button"
      class="btn btn-sm btn-secondary ml-2 my-2"
      @click="closeEditor"
    >
      <font-awesome-icon
        class="ml-1"
        icon="times"
      />
      {{ $t('annotationCard.editor.cancel') }}
    </button>
    <div
      class="btn-group ml-2 my-2"
      role="group"
    >
      <button
        type="button"
        class="btn btn-primary btn-sm"
        @click="updateAnnotation"
      >
        <i :class="SaveActionData[selectedSaveAction].icon" />
        {{ $t(`annotationCard.editor.saveActions.${selectedSaveAction}`) }}
      </button>
      <button
        type="button"
        class="btn btn-outline-primary btn-sm dropdown-toggle dropdown-toggle-split"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <span class="sr-only">{{ $t('generic.toggleDropdown') }}</span>
      </button>
      <div class="dropdown-menu">
        <a
          v-for="action in saveActions"
          :key="action"
          class="dropdown-item"
          href="javascript:void(0)"
          @click="selectedSaveAction = action"
        >
          <i :class="SaveActionData[action].icon" />
          {{ $t(`annotationCard.editor.saveActions.${action}`) }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import {ACT, GET} from '@/store/types';
import {mapActions, mapGetters} from 'vuex';
import {Annotation} from '@/types/annotation';
import {AnnotationVisibility, AnnotationVisibilityData} from '@/config/constants';
import autosize from 'autosize';
import {invert, mapKeys} from 'lodash';

const SaveActions = Object.freeze({PUBLISH: 'publish', PUBLISH_ANONYMOUSLY: 'publishAnonymously', SAVE: 'save'});

export const VisibilityToSaveActionMapping = Object.freeze({
  [AnnotationVisibility.PRIVATE]: SaveActions.SAVE,
  [AnnotationVisibility.PUBLIC]: SaveActions.PUBLISH,
  [AnnotationVisibility.ANONYMOUS]: SaveActions.PUBLISH_ANONYMOUSLY,
});

const SaveActionToVisibilityMapping = Object.freeze(invert(VisibilityToSaveActionMapping));

const SaveActionData = mapKeys(AnnotationVisibilityData, (_, key) => VisibilityToSaveActionMapping[key]);

export default {
  name: 'PostForm',
  props: {
    annotation: {type: Annotation, required: true},
  },
  data() {
    return {
      SaveActionData,
    };
  },
  computed: {
    annotationUpdate() {
      return this[GET.ANNOTATIONS_IN_EDIT].find(annotation => annotation.id === this.annotation.id);
    },
    saveActions() {
      return Object.values(SaveActions);
    },
    selectedSaveAction: {
      get() {
        return VisibilityToSaveActionMapping[this.annotationUpdate.visibility];
      },
      set(selectedSaveAction) {
        this.annotationUpdate.visibility = SaveActionToVisibilityMapping[selectedSaveAction];
      }
    },
    ...mapGetters([GET.ANNOTATIONS_IN_EDIT]),
  },
  watch: {
    annotationUpdate: {
      handler(value) {
        if (value) {
          this.$nextTick(
              () => this.$refs.annotationEditor.focus()
          );
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.$nextTick(
        () => autosize(this.$refs.annotationEditor)
    );
  },
  beforeUnmount() {
    autosize.destroy(this.$refs.annotationEditor);
  },
  methods: {
    closeEditor() {
      this[ACT.STOP_EDITING_ANNOTATION](this.annotation);
    },
    async updateAnnotation() {
      await this[ACT.UPDATE_ANNOTATION](this.annotationUpdate);
      this.closeEditor();
    },
    ...mapActions([
      ACT.STOP_EDITING_ANNOTATION,
      ACT.UPDATE_ANNOTATION
    ]),
  }
};
</script>
