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
import {getThreadElementId} from '@/lib/annotation/utils';
import {MUTATE} from '@/store/types';
import {mapMutations} from 'vuex';
import Post from './Post';
import ReplyForm from '@/components/LongpageSidebar/Posts/Thread/ReplyForm';
import {Thread} from '@/types/thread';

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
      return getThreadElementId(this.thread.id);
    },
  },
  methods: {
    ...mapMutations([MUTATE.REMOVE_POSTS_FROM_THREAD]),
    toggleReplies() {
      if (this.showReplies && !this.thread.lastReply.created && !this.thread.lastReply.content.trim()) {
        this[MUTATE.REMOVE_POSTS_FROM_THREAD]({threadId: this.thread.id, posts: [this.thread.lastReply]});
      }
      this.showReplies = !this.showReplies;
    }
  }
};
</script>
