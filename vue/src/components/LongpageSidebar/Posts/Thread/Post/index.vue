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
            v-if="!post.readByUser"
            class="icon fa fa-eye-slash fa-fw"
          />
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
        v-if="thread.root.id === post.id"
        class="row no-gutters my-1"
      >
        <div class="col col-auto p-0">
          <expandable-highlight-excerpt
            :annotation-target="annotation.target"
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
        :thread="thread"
        class="my-1"
        @edit-clicked="showForm = true"
        @toggle-replies="$emit('toggle-replies')"
      />
    </div>
  </div>
</template>

<script>
import {GET} from '@/store/types';
import {
  SCROLL_INTO_VIEW_OPTIONS,
} from '@/config/constants';
import {mapGetters} from 'vuex';
import {applyMathjaxFilterToNodes} from '@/util/moodle';
import {getHighlightByAnnotationId} from '@/util/annotation';
import UserAvatar from '@/components/UserAvatar';
import scrollIntoView from 'scroll-into-view-if-needed';
import ExpandableHighlightExcerpt from '@/components/LongpageSidebar/ExpandableHighlightExcerpt';
import PostForm from '@/components/LongpageSidebar/Posts/Thread/PostForm';
import PostActions from '@/components/LongpageSidebar/Posts/Thread/Post/PostActions';
import {Post} from '@/types/post';
import {Thread} from '@/types/thread';
import PostVisibilityIndicator from '@/components/LongpageSidebar/Posts/Thread/Post/PostVisibilityIndicator';
import PostDateTimes from '@/components/LongpageSidebar/DateTimes';

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
  emits: ['toggle-replies'],
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
      scrollIntoView(getHighlightByAnnotationId(this.annotation.id), SCROLL_INTO_VIEW_OPTIONS);
    },
  }
};
</script>
