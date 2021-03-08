<template>
  <i
    class="icon fa fa-fw m-0"
    :class="iconClasses"
  />
</template>

<script>
import {Post} from '@/types/post';

export default {
  name: 'PostVisibilityIndicator',
  props: {
    post: {type: Post, required: true},
  },
  computed: {
    iconClasses() {
      if (!this.post.isPublic) return ['fa-lock'];
      if (this.post.anonymous) return ['fa-user-secret'];
      return ['fa-users'];
    }
  }
};
</script>
