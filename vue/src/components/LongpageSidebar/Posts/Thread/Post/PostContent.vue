<template>
  <div>
    <div
      ref="postTopIndicator"
      data-position="top"
      :data-post-id="post.id"
      :data-thread-id="post.threadId"
    />
    <div
      ref="postContent"
    >
      {{ post.highlighted.content || post.content }}
    </div>
    <div
      ref="postBottomIndicator"
      data-position="bottom"
      :data-post-id="post.id"
      :data-thread-id="post.threadId"
    />
  </div>
</template>

<script>
import {applyMathjaxFilterToNodes} from '@/util/moodle';
import {Post} from '@/types/post';
import {PostReadingStatusEstimator} from '@/lib/annotation/post-reading-status-estimator';
import {THREAD_CONTAINER_ID} from '@/config/constants';

export default {
  name: 'PostContent',
  props: {
    post: {type: Post, required: true}
  },
  data() {
    return {
      stopEstimating: undefined,
    };
  },
  watch: {
    'post.content': {
      handler() {
        this.$nextTick(() => {
          applyMathjaxFilterToNodes(this.$refs.postContent);
        });
      },
      immediate: true,
    },
    'post.readByUser': {
      handler(readByUser) { // TODO You can't mark something as unread
        if (!readByUser) {
          let scrolledOut = false;
          new IntersectionObserver((entries, observer) => {
            if (scrolledOut) {
              this.stopEstimating = PostReadingStatusEstimator.startEstimating(
                  this.$store, // TODO Init once with $store instead of multiple times
                  this.$refs.postTopIndicator,
                  this.$refs.postBottomIndicator,
              );
              observer.disconnect();
            }
            scrolledOut = true;
          }, {root: document.getElementById(THREAD_CONTAINER_ID)}).observe(this.$refs.postContent);
        } else if (this.stopEstimating) this.stopEstimating();
      },
    },
  },
  mounted() {
    if (!this.post.readByUser) {
      this.stopEstimating = PostReadingStatusEstimator.startEstimating(
          this.$store,
          this.$refs.postTopIndicator,
          this.$refs.postBottomIndicator,
      );
    }
  },
  unmounted() {
    if (this.stopEstimating) this.stopEstimating();
  }
};
</script>
