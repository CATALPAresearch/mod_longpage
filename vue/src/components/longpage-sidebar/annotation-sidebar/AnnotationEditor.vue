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
        <i :class="saveActionOptions.find(({value}) => value === selectedSaveAction).icon" />
        {{ $t(`annotationCard.editor.saveActions.${selectedSaveAction}`) }}
      </button>
      <button
        type="button"
        class="btn btn-primary btn-sm dropdown-toggle dropdown-toggle-split"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <span class="sr-only">{{ $t('generic.toggleDropdown') }}</span>
      </button>
      <div class="dropdown-menu">
        <a
          v-for="saveActionOpt in saveActionOptions"
          :key="saveActionOpt.value"
          class="dropdown-item"
          href="javascript:void(0)"
          @click="selectedSaveAction = saveActionOpt.value"
        >
          <i :class="saveActionOpt.icon" />
          {{ $t(`annotationCard.editor.saveActions.${saveActionOpt.value}`) }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import {ACT, GET} from '@/store/types';
import {mapActions, mapGetters} from 'vuex';
import {Annotation} from '@/lib/annotation/types/annotation';

export default {
  name: 'AnnotationEditor',
  props: {
    annotation: {type: Annotation, required: true},
  },
  computed: {
    annotationUpdate() {
      return this[GET.ANNOTATIONS_IN_EDIT].find(annotation => annotation.id === this.annotation.id);
    },
    saveActionOptions() {
      return [
        {value: 'publish', icon: ['fa', 'fa-users']},
        {value: 'publishAnonymously', icon: ['fa', 'fa-user-secret']},
        {value: 'save', icon: ['fa', 'fa-lock']},
      ];
    },
    selectedSaveAction: {
      get() {
        if (this.annotationUpdate.isPrivate) return 'save';

        return this.annotationUpdate.anonymous ? 'publishAnonymously' : 'publish';
      },
      set(selectedSaveAction) {
        this.annotationUpdate.isPrivate = selectedSaveAction === 'save';
        this.annotationUpdate.anonymous = selectedSaveAction === 'publishAnonymously';
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
