<template>
  <div
    class="row no-gutters align-items-center reply-form"
  >
    <div
      class="col col-auto p-0"
    >
      <user-avatar
        :user="user"
      />
    </div>
    <div class="col p-0">
      <post-form
        v-if="postFormShown"
        @canceled="postFormShown = false"
        @saved="postFormShown = false"
      />
      <input
        v-else
        class="form-control"
        :placeholder="$t('responseForm.placeholder')"
        @focus="postFormShown = true"
      >
    </div>
  </div>
</template>

<script>
import {GET} from '@/store/types';
import {mapGetters} from 'vuex';
import PostForm from '@/components/longpage-sidebar/posts/thread/PostForm';
import UserAvatar from '@/components/UserAvatar';

export default {
  name: 'ReplyForm',
  components: {
    PostForm,
    UserAvatar,
  },
  props: {
    threadId: {type: Number, required: true},
  },
  data() {
    return {
      postFormShown: false,
    };
  },
  computed: {
    ...mapGetters([GET.USER]),
    user() {
      return this[GET.USER]();
    }
  },
};
</script>
