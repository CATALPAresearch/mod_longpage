<template>
  <div
    :id="postDOMId"
    class="row no-gutters"
  >
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
        class="row no-gutters my-2"
      >
        <div class="col col-auto p-0 border-left border-secondary pl-2 cursor-pointer">
          <expandable-highlight-excerpt
            :annotation-target="annotation.target"
            @highlight-clicked="scrollTextElementIntoView"
          />
        </div>
      </div>
      <div class="row no-gutters my-2">
        <div class="col col-12 p-0">
          <post-content
            v-show="!showForm"
            :post="post"
          />
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
import {getDOMIdOfPost, getHighlightByAnnotationId} from '@/util/annotation';
import {GET} from '@/store/types';
import {mapGetters} from 'vuex';
import UserAvatar from '@/components/Generic/UserAvatar';
import ExpandableHighlightExcerpt from '@/components/Generic/ExpandableHighlightExcerpt';
import PostForm from '@/components/LongpageSidebar/Posts/Thread/PostForm';
import PostActions from '@/components/LongpageSidebar/Posts/Thread/Post/PostActions';
import {Post} from '@/types/post';
import {Thread} from '@/types/thread';
import PostVisibilityIndicator from '@/components/LongpageSidebar/Posts/Thread/Post/PostVisibilityIndicator';
import PostDateTimes from '@/components/LongpageSidebar/DateTimes';
import PostContent from '@/components/LongpageSidebar/Posts/Thread/Post/PostContent';
import {scrollTextElementIntoView} from '@/util/misc';

export default {
  name: 'Post',
  components: {
    PostContent,
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
    postDOMId() {
      return getDOMIdOfPost(this.post.id);
    },
    showPostVisibilityIndicator() {
      return this.user === this.creator;
    },
    user() {
      return this[GET.USER]();
    },
  },
  mounted() {
    if (!this.post.created) this.showForm = true;
  },
  methods: {
    scrollTextElementIntoView() {
      scrollTextElementIntoView(getHighlightByAnnotationId(this.annotation.id));
    },
  }
};
</script>
