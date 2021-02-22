<template>
  <div
    :id="id"
    class="thread border-secondary card d-block"
  >
    <post
      :post="thread.root"
      :thread="thread"
      class="card-body text-dark thread-root"
    />
    <div
      v-if="thread.replies.length"
      class="card-footer"
    >
      <post
        v-for="reply in thread.replies"
        :key="reply.id"
        class="my-2"
        :thread="thread"
        :post="reply"
      />
      <reply-form
        :thread-id="thread.id"
      />
    </div>
  </div>
</template>

<script>
import Post from './post';
import ReplyForm from '@/components/longpage-sidebar/posts/thread/ReplyForm';
import {getThreadElementId} from '@/lib/annotation/utils';
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
  computed: {
    id() {
      return getThreadElementId(this.thread.id);
    },
  },
};
</script>
