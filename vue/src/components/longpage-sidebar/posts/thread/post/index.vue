<template>
  <div class="row no-gutters">
    <div class="col col-auto p-0">
      <user-avatar
        :user="user"
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
            v-if="creator"
            class="mr-1 align-middle"
            href="#"
          >{{ creator.fullname }}</a>
          <span v-else>{{ $t('avatar.nameAnonymous') }}</span>
          <user-role-button
            v-if="creator && creator.role"
            :role="creator.role"
            :href="creator.roleOverview"
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
          v-if="creator === user"
          class="col col-auto mx-1 p-0 text-small font-weight-boldest"
        >
          ·
        </div>
        <div
          v-if="creator === user"
          class="col col-auto p-0 text-small"
        >
          <post-visibility-indicator :post="post" />
        </div>
      </div>
      <div
        v-if="highlightedText"
        class="row no-gutters my-1"
      >
        <div class="col col-auto p-0">
          <expandable-highlight-excerpt
            :highlighted-text="highlightedText"
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
import DateTimeText from '@/components/DateTimeText';
import {
  SCROLL_INTO_VIEW_OPTIONS,
  SelectorType
} from '@/config/constants';
import {mapActions, mapGetters} from 'vuex';
import {applyMathjaxFilterToNodes} from '@/util/moodle';
import {getHighlightByAnnotationId} from '@/util/annotation';
import UserAvatar from '@/components/UserAvatar';
import UserRoleButton from '@/components/UserRoleButton';
import scrollIntoView from 'scroll-into-view-if-needed';
import ExpandableHighlightExcerpt from '@/components/longpage-sidebar/posts/thread/post/ExpandableHighlightExcerpt';
import PostForm from '@/components/longpage-sidebar/posts/thread/PostForm';
import PostActions from '@/components/longpage-sidebar/posts/thread/post/PostActions';
import {Post} from '@/types/post';
import {Thread} from '@/types/thread';
import PostVisibilityIndicator from '@/components/longpage-sidebar/posts/thread/post/PostVisibilityIndicator';

export default {
  name: 'Post',
  components: {
    PostVisibilityIndicator,
    PostActions,
    PostForm,
    DateTimeText,
    ExpandableHighlightExcerpt,
    UserAvatar,
    UserRoleButton,
  },
  props: {
    thread: {type: Thread, required: true},
    post: {type: Post, required: true}, // TODO Rename to "annotation" to "post"
  },
  computed: {
    ...mapGetters([GET.ANNOTATION, GET.ANNOTATIONS_IN_EDIT, GET.USER]),
    annotation() {
      return this[GET.ANNOTATION](this.thread.annotationId);
    },
    creator() {
      return this[GET.USER](this.post.creatorId);
    },
    editorOpened() {
      return this[GET.ANNOTATIONS_IN_EDIT].findIndex(annotation => annotation.id === this.annotation.id) > -1;
    },
    highlightedText() {
      const textQuoteSelector = this.annotation.target.selectors.find(sel => sel.type === SelectorType.TEXT_QUOTE_SELECTOR);
      return textQuoteSelector && textQuoteSelector.exact;
    },
    user() {
      return this[GET.USER]();
    },

  },
  watch: {
    'annotation.body': {
      handler() {
        this.$nextTick(() => {
          applyMathjaxFilterToNodes(this.$refs.annotationBody);
        });
      },
      immediate: true,
    },
  },
  methods: {
    deleteAnnotation() {
      this[ACT.DELETE_ANNOTATION](this.annotation);
    },
    openEditor() {
      this[ACT.START_EDITING_ANNOTATION](this.annotation);
    },
    selectAnnotation() {
      scrollIntoView(getHighlightByAnnotationId(this.annotation.id), SCROLL_INTO_VIEW_OPTIONS);
    },
    ...mapActions([
        ACT.DELETE_ANNOTATION,
        ACT.START_EDITING_ANNOTATION,
    ]),
  }
};
</script>
