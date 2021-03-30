<template>
  <div
    :id="id"
    class="thread border-secondary card d-block"
  >
    <post
      :post="thread.root"
      :thread="thread"
      class="card-body text-dark thread-root"
      @toggle-replies="toggleReplies"
    />
    <div
      v-if="showReplies && thread.replies.length"
      class="card-footer"
    >
      <post
        v-for="reply in thread.replies"
        :key="reply.id"
        class="my-3"
        :thread="thread"
        :post="reply"
      />
      <reply-form
        v-if="thread.lastReply.created"
        class="my-3"
        :thread="thread"
      />
    </div>
  </div>
</template>

<script>
import {SCROLL_INTO_VIEW_OPTIONS, SidebarTabKeys} from '@/config/constants';
import {EventBus} from '@/lib/event-bus';
import {getDOMIdOfThread} from '@/util/annotation';
import {MUTATE} from '@/store/types';
import {mapMutations} from 'vuex';
import Post from './Post';
import ReplyForm from '@/components/LongpageSidebar/Posts/Thread/ReplyForm';
import {Thread} from '@/types/thread';
import scrollIntoView from 'scroll-into-view-if-needed';

export default {
  name: 'Thread',
  components: {
    ReplyForm,
    Post,
  },
  props: {
    thread: {type: Thread, required: true},
  },
  data() {
    return {
      showReplies: false,
    };
  },
  computed: {
    id() {
      return getDOMIdOfThread(this.thread.id);
    },
  },
  mounted() {
    EventBus.subscribe('post-selected-by-url-hash', ({postId, postDOMId}) => {
      if (this.thread.posts.findIndex(post => post.id === postId) < 0) return;

      this.setTabOpened(SidebarTabKeys.POSTS);
      this.showReplies = true;
      this.$nextTick(() => {
        scrollIntoView(
          document.getElementById(postDOMId),
          {...SCROLL_INTO_VIEW_OPTIONS, boundary: document.getElementById('sidebar-tab-posts')}
        );
      });
    });

    EventBus.subscribe('thread-selected-by-url-hash', ({threadId, threadDOMId}) => {
      if (this.thread.id !== threadId) return;

      this.setTabOpened(SidebarTabKeys.POSTS);
      this.showReplies = true;
      this.$nextTick(() => {
        scrollIntoView(
            document.getElementById(threadDOMId),
            {...SCROLL_INTO_VIEW_OPTIONS, boundary: document.getElementById('sidebar-tab-posts')}
        );
      });
    });

    this.showReplies = this.thread.includesUnreadReply;
  },
  methods: {
    ...mapMutations([MUTATE.REMOVE_POSTS_FROM_THREAD]),
    ...mapMutations({setTabOpened: MUTATE.RESET_SIDEBAR_TAB_OPENED_KEY}),
    toggleReplies() {
      if (this.showReplies && !this.thread.lastReply.created && !this.thread.lastReply.content.trim()) {
        this[MUTATE.REMOVE_POSTS_FROM_THREAD]({threadId: this.thread.id, posts: [this.thread.lastReply]});
      }
      this.showReplies = !this.showReplies;
    }
  }
};
</script>
