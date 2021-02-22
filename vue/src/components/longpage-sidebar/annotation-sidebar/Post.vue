<template>
  <div class="row no-gutters">
    <div class="col col-auto p-0">
      <user-avatar
        :user="author"
      />
    </div>
    <div class="col p-0">
      <div
        v-if="annotation.created || !annotation.target.annotationId"
        class="row no-gutters mb-1 align-items-center"
      >
        <div
          class="col p-0"
        >
          <a
            v-if="author"
            class="mr-1 align-middle"
            href="#"
          >{{ author.fullname }}</a>
          <span v-else>{{ $t('avatar.nameAnonymous') }}</span>
          <user-role-button
            v-if="author && author.role"
            :role="author.role"
            :href="author.roleOverview"
          />
        </div>
        <div class="col text-right">
          <i class="icon fa fa-question-circle-o fa-fw" />
          <i
            class="icon fa fa-star-o fa-fw"
          />
          <i
            class="icon fa fa-bell-o fa-fw"
          />
          <i class="icon fa fa-eye-slash fa-fw" />
        </div>
      </div>
      <div
        v-if="annotation.created"
        class="row no-gutters my-1"
      >
        <div
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
        <div
          v-if="userIsAuthor(annotation)"
          class="col col-auto mx-1 p-0 text-small font-weight-boldest"
        >
          ·
        </div>
        <div
          v-if="userIsAuthor(annotation)"
          class="col col-auto p-0 text-small"
        >
          <i :class="AnnotationVisibilityData[annotation.visibility].icon" />
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
            v-show="!editorOpened"
            ref="annotationBody"
            class="annotation-body"
          >{{ annotation.body }}</span>
          <post-form
            v-if="editorOpened"
            :annotation="annotation"
          />
        </div>
      </div>
      <div class="my-1 text-muted text-small">
        Von Ihnen und 124 Personen gelesen
      </div>
      <post-actions
        :annotation="annotation"
        class="my-1"
      />
    </div>
  </div>
</template>

<script>
import {ACT, GET} from '@/store/types';
import {Annotation} from '@/types/annotation';
import DateTimeText from '@/components/DateTimeText';
import {
  AnnotationVisibility,
  AnnotationVisibilityData,
  HighlightingConfig,
  SCROLL_INTO_VIEW_OPTIONS,
  SelectorType
} from '@/config/constants';
import {mapActions, mapGetters} from 'vuex';
import UserAvatar from '@/components/UserAvatar';
import UserRoleButton from '@/components/UserRoleButton';
import scrollIntoView from 'scroll-into-view-if-needed';
import ExpandableHighlightExcerpt from '@/components/longpage-sidebar/annotation-sidebar/ExpandableHighlightExcerpt';
import PostForm from '@/components/longpage-sidebar/annotation-sidebar/PostForm';
import PostActions from '@/components/longpage-sidebar/annotation-sidebar/PostActions';

export default {
  name: 'Post',
  components: {
    PostActions,
    PostForm,
    DateTimeText,
    ExpandableHighlightExcerpt,
    UserAvatar,
    UserRoleButton,
  },
  props: {
    annotation: {type: Annotation, required: true},
  },
  data() {
    return {
      AnnotationVisibilityData,
    };
  },
  computed: {
    editorOpened() {
      return this[GET.ANNOTATIONS_IN_EDIT].findIndex(annotation => annotation.id === this.annotation.id) > -1;
    },
    annotationTarget() {
      return this.annotation.target;
    },
    author() {
      return this.authorAnonymous ? null : this[GET.USER](this.annotation.userId);
    },
    authorAnonymous() {
      return this.annotation.visibility === AnnotationVisibility.ANONYMOUS && !this.userIsAuthor(this.annotation);
    },
    highlightedText() {
      return this.textQuoteSelector && this.textQuoteSelector.exact;
    },
    textQuoteSelector() {
      return this.annotationTarget.selectors.find(sel => sel.type === SelectorType.TEXT_QUOTE_SELECTOR);
    },
    ...mapGetters([GET.ANNOTATIONS_IN_EDIT, GET.USER]),
    ...mapGetters({userIsAuthor: GET.USER_IS_AUTHOR}),
  },
  watch: {
    'annotation.body': {
      handler() {
       this.applyMathjaxFilterToBody();
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
    deleteAnnotation() {
      this[ACT.DELETE_ANNOTATION](this.annotation);
    },
    openEditor() {
      this[ACT.START_EDITING_ANNOTATION](this.annotation);
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
    ]),
  }
};
</script>
