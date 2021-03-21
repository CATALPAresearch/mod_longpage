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
      <input
        class="form-control"
        :placeholder="$t('responseForm.placeholder')"
        @focus="createPost"
      >
    </div>
  </div>
</template>

<script>
import {ACT, GET} from '@/store/types';
import {mapActions, mapGetters} from 'vuex';
import {Thread} from '@/types/thread';
import UserAvatar from '@/components/Generic/UserAvatar';

export default {
  name: 'ReplyForm',
  components: {
    UserAvatar,
  },
  props: {
    thread: {type: Thread, required: true},
  },
  computed: {
    ...mapGetters([GET.USER]),
    user() {
      return this[GET.USER]();
    }
  },
  methods: {
    ...mapActions([ACT.CREATE_POST]),
    createPost() {
      this[ACT.CREATE_POST]({threadId: this.thread.id});
    }
  },
};
</script>
