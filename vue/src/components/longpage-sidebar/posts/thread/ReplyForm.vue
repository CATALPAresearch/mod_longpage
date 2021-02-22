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
        @focus="showPostForm = true"
      >
    </div>
  </div>
</template>

<script>
import {GET} from '@/store/types';
import {mapGetters} from 'vuex';
import {Thread} from '@/types/thread';
import UserAvatar from '@/components/UserAvatar';

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
};
</script>
