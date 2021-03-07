<template>
  <div class="row no-gutters">
    <div class="col col-auto p-0">
      <user-avatar
        :user="creator"
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
            :href="creator.profileLink"
          >{{ creator.fullName }}</a>
          <span v-else>{{ $t('avatar.nameAnonymous') }}</span>
          <span
            v-for="role in creatorRoles"
            :key="role.id"
            class="badge badge-info ml-2"
          >{{ role.localName || role.shortName }}</span>
        </div>
        <div class="col text-right">
          <!--          <i class="icon fa fa-question-circle-o fa-fw" />-->
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
        <div class="col col-auto p-0 border-left border-secondary pl-2 cursor-pointer">
          <expandable-highlight-excerpt
            :annotation-target="annotation.target"
            @highlight-clicked="scrollInText"
          />
        </div>
      </div>
      <div class="row no-gutters my-1">
        <div class="col col-12 p-0">
          <span
            v-show="!showForm"
            ref="annotationBody"
            class="annotation-body"
          >{{ post.highlighted.content || post.content }}</span>
          <post-form
            v-model:show="showForm"
            :post="post"
            :thread="thread"
          />
        </div>
      </div>
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
import UserAvatar from '@/components/Generic/UserAvatar';
import scrollIntoView from 'scroll-into-view-if-needed';
import ExpandableHighlightExcerpt from '@/components/Generic/ExpandableHighlightExcerpt';
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
    ...mapGetters([GET.ANNOTATION, GET.USER_ROLES, GET.USER]),
    annotation() {
      return this[GET.ANNOTATION](this.thread.annotationId);
    },
    creator() {
      return this.post.creatorId ? this[GET.USER](this.post.creatorId) : null;
    },
    creatorRoles() {
      return this.creator ? this[GET.USER_ROLES](this.creator.id) : [];
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
    scrollInText() {
      scrollIntoView(getHighlightByAnnotationId(this.annotation.id), SCROLL_INTO_VIEW_OPTIONS);
    },
  }
};
</script>
