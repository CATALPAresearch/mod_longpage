<template>
  <div
    :id="id"
    class="annotation-card border-secondary card d-block"
  >
    <post
      :annotation="annotation"
      class="card-body text-dark thread-root"
    />
    <div
      v-if="replies.length"
      class="card-footer"
    >
      <post
        v-for="reply in replies"
        :key="reply.id"
        class="my-2"
        :annotation="reply"
      />
      <reply-form
        :annotation-id="annotation.id"
      />
    </div>
  </div>
</template>

<script>
import {Annotation} from '@/types/annotation';
import Post from './Post';
import {GET} from '@/store/types';
import {mapGetters} from 'vuex';
import ReplyForm from '@/components/longpage-sidebar/annotation-sidebar/ReplyForm';
import {getAnnotationCardId} from '@/lib/annotation/utils';

export default {
  name: 'Thread',
  components: {
    ReplyForm,
    Post,
  },
  props: {
    annotation: {type: Annotation, required: true},
  },
  computed: {
    ...mapGetters([GET.RESPONSES_TO]),
    id() {
      return getAnnotationCardId(this.annotation.id);
    },
    replies() {
      return this[GET.RESPONSES_TO](this.annotation.id);
    },
  },
};
</script>
