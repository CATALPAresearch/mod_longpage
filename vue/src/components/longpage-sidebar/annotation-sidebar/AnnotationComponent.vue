<template>
  <div class="row no-gutters">
    <div class="col col-auto p-0">
      <user-avatar
        :fullname="author.fullname"
        :profile-image="author.profileimage"
      />
    </div>
    <div class="col p-0">
      <div class="row no-gutters mb-1 align-items-center">
        <div class="col p-0">
          <a
            class="mr-1 align-middle"
            href="#"
          >{{ author.fullname }}</a>
          <user-role-button
            v-if="author.role"
            :role="author.role"
            :href="author.roleOverview"
          />
        </div>

        <div class="col col-auto p-0">
          <!--          <font-awesome-icon icon="ellipsis-v" />-->
          <div class="annotation-actions text-right">
            <div
              v-if="!annotationUpdate"
              class="d-flex justify-content-between"
            >
              <font-awesome-icon
                class="link ml-2"
                icon="trash"
                @click="deleteAnnotation"
              />
              <font-awesome-icon
                class="link ml-2"
                icon="pen"
                @click="openEditor"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="row no-gutters my-1">
        <div
          v-if="annotation.created"
          class="col col-auto p-0 text-small"
        >
          {{ $t('annotationCard.created') }}
          <date-time-text :date-time="annotation.timecreated" />
          <span v-if="annotation.timecreated.getTime() !== annotation.timemodified.getTime()">
            <span class="font-italic">
              ({{ $t('annotationCard.modified') }}
              <date-time-text :date-time="annotation.timemodified" />)
            </span>
          </span>
        </div>
      </div>
      <div
        v-if="highlightedText"
        class="row no-gutters my-1"
      >
        <div class="col col-auto p-0">
          <expandable-highlight-excerpt
            :highlighted-text="highlightedText"
            :highlight-style-class="annotationTarget.styleClass"
            @highlight-clicked="selectAnnotation"
          />
        </div>
      </div>
      <div class="row no-gutters my-1">
        <div class="col col-12 p-0">
          <span
            v-show="!annotationUpdate"
            ref="annotationBody"
            class="annotation-body"
          >{{ annotation.body }}</span>
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
            <button
              type="button"
              class="btn btn-sm btn-primary ml-2 my-2"
              @click="updateAnnotation"
            >
              <font-awesome-icon
                class="ml-1"
                icon="save"
              />
              {{ $t('annotationCard.editor.save') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ACT, GET} from '@/store/types';
import {Annotation} from '@/lib/annotation/types/annotation';
import DateTimeText from '@/components/DateTimeText';
import {AnnotationTargetType, HighlightingConfig, SCROLL_INTO_VIEW_OPTIONS, SelectorType} from '@/config/constants';
import {mapActions, mapGetters} from 'vuex';
import UserAvatar from '@/components/UserAvatar';
import UserRoleButton from '@/components/UserRoleButton';
import scrollIntoView from 'scroll-into-view-if-needed';
import ExpandableHighlightExcerpt from '@/components/longpage-sidebar/annotation-sidebar/ExpandableHighlightExcerpt';

export default {
  name: 'AnnotationCard',
  components: {
    DateTimeText,
    ExpandableHighlightExcerpt,
    UserAvatar,
    UserRoleButton,
  },
  props: {
    annotation: {type: Annotation, required: true},
  },
  computed: {
    annotationUpdate() {
      return this[GET.ANNOTATIONS_IN_EDIT].find(annotation => annotation.id === this.annotation.id);
    },
    annotationTarget() {
      return this.annotation.target[0];
    },
    author() {
      return this[GET.USER](this.annotation.userId);
    },
    highlightedText() {
      return this.textQuoteSelector && this.textQuoteSelector.exact;
    },
    textQuoteSelector() {
      if (this.annotationTarget.type !== AnnotationTargetType.PAGE_SEGMENT) return;

      return this.annotationTarget.selector.find(sel => sel.type === SelectorType.TEXT_QUOTE_SELECTOR);
    },
    ...mapGetters([GET.ANNOTATIONS_IN_EDIT, GET.USER]),
  },
  watch: {
    'annotation.body': {
      handler() {
       this.applyMathjaxFilterToBody();
      },
      immediate: true,
    },
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
    applyMathjaxFilterToBody() {
      this.$nextTick(() => {
        Y.use('mathjax', () => {
          MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.$refs.annotationBody]);
        });
      });
    },
    closeEditor() {
      this[ACT.STOP_EDITING_ANNOTATION](this.annotation);
    },
    deleteAnnotation() {
      this[ACT.DELETE_ANNOTATION](this.annotation);
    },
    openEditor() {
      this[ACT.START_EDITING_ANNOTATION](this.annotation);
    },
    async updateAnnotation() {
      await this[ACT.UPDATE_ANNOTATION](this.annotationUpdate);
      this.closeEditor();
    },
    getHighlightHTMLElement() {
      return Array
          .from(document.getElementsByTagName(HighlightingConfig.HL_TAG_NAME))
          .find(element => element._annotation.id === this.annotation.id);
    },
    selectAnnotation() {
      scrollIntoView(this.getHighlightHTMLElement(), SCROLL_INTO_VIEW_OPTIONS);
    },
    ...mapActions([
        ACT.DELETE_ANNOTATION,
        ACT.START_EDITING_ANNOTATION,
        ACT.STOP_EDITING_ANNOTATION,
        ACT.UPDATE_ANNOTATION
    ]),
  }
};
</script>
