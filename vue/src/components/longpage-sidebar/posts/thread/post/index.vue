<template>
  <div class="row no-gutters">
    <div class="col col-auto p-0">
      <user-avatar
        :user="user"
      />
    </div>
    <div class="col p-0">
      <div
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
          <!--          <user-role-button-->
          <!--            v-if="creator && creator.role"-->
          <!--            :role="creator.role"-->
          <!--            :href="creator.roleOverview"-->
          <!--          />-->
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
        v-if="post.created"
        class="row no-gutters my-1"
      >
        <div
          class="col col-auto p-0 text-small"
        >
          <post-date-times
            :time-created="post.timeCreated"
            :time-modified="post.timeModified"
          />
        </div>
        <div
          v-if="showPostVisibilityIndicator"
          class="col col-auto mx-1 p-0 text-small font-weight-boldest"
        >
          ·
        </div>
        <div
          v-if="showPostVisibilityIndicator"
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
            v-show="!showForm"
            ref="annotationBody"
            class="annotation-body"
          >{{ post.content }}</span>
          <post-form
            v-model:show="showForm"
            :post="post"
            :thread="thread"
          />
        </div>
      </div>
      <!--      <div class="my-1 text-muted text-small">
        Von Ihnen und 124 Personen gelesen
      </div>-->
      <post-actions
        :show="!showForm"
        :post="post"
        class="my-1"
        @edit-clicked="showForm = true"
      />
    </div>
  </div>
</template>

<script>
import {GET} from '@/store/types';
import {
  SCROLL_INTO_VIEW_OPTIONS,
  SelectorType
} from '@/config/constants';
import {mapGetters} from 'vuex';
import {applyMathjaxFilterToNodes} from '@/util/moodle';
import {getHighlightByAnnotationId} from '@/util/annotation';
import UserAvatar from '@/components/UserAvatar';
import scrollIntoView from 'scroll-into-view-if-needed';
import ExpandableHighlightExcerpt from '@/components/longpage-sidebar/posts/thread/post/ExpandableHighlightExcerpt';
import PostForm from '@/components/longpage-sidebar/posts/thread/PostForm';
import PostActions from '@/components/longpage-sidebar/posts/thread/post/PostActions';
import {Post} from '@/types/post';
import {Thread} from '@/types/thread';
import PostVisibilityIndicator from '@/components/longpage-sidebar/posts/thread/post/PostVisibilityIndicator';
import PostDateTimes from '@/components/longpage-sidebar/posts/thread/post/PostDateTimes';

export default {
  name: 'Post',
  components: {
    PostDateTimes,
    PostVisibilityIndicator,
    PostActions,
    PostForm,
    ExpandableHighlightExcerpt,
    UserAvatar,
  },
  props: {
    thread: {type: Thread, required: true},
    post: {type: Post, required: true},
  },
  data() {
    return {
      showForm: false,
    };
  },
  computed: {
    ...mapGetters([GET.ANNOTATION, GET.USER]),
    annotation() {
      return this[GET.ANNOTATION](this.thread.annotationId);
    },
    creator() {
      return this[GET.USER](this.post.creatorId);
    },
    highlightedText() {
      const textQuoteSelector = this.annotation.target.selectors.find(sel => sel.type === SelectorType.TEXT_QUOTE_SELECTOR);
      return textQuoteSelector && textQuoteSelector.exact;
    },
    showPostVisibilityIndicator() {
      return this.user === this.creator;
    },
    user() {
      return this[GET.USER]();
    },
  },
  watch: {
    'post.content': {
      handler() {
        this.$nextTick(() => {
          applyMathjaxFilterToNodes(this.$refs.annotationBody);
        });
      },
      immediate: true,
    },
  },
  mounted() {
    if (!this.post.created) this.showForm = true;
  },
  methods: {
    selectAnnotation() {
      scrollIntoView(getHighlightByAnnotationId(this.annotation.annotationId), SCROLL_INTO_VIEW_OPTIONS);
    },
  }
};
</script>
