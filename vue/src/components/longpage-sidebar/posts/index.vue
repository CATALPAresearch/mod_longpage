<template>
  <div class="h-100 bg-light">
    <div class="h-100 d-flex flex-column">
      <div class="p-3 bg-white">
        <h3
          id="posts-sidebar-heading"
          class="m-0"
        >
          {{ $t('sidebar.tabs.posts.heading') }}
        </h3>
        <post-filter />
      </div>
      <hr class="my-0 mx-3">
      <div
        v-if="threads.length"
        :id="THREAD_CONTAINER_ID"
        class="p-3 flex-shrink-1 flex-grow-1 overflow-y-auto overflow-x-hidden"
      >
        <thread
          v-for="thread in threads"
          :key="thread.id"
          :thread="thread"
          class="mb-3"
        />
      </div>
      <p
        v-else
        class="p-3"
      >
        {{ $t('annotationSidebar.notYetCreatedAnnotations') }}
      </p>
    </div>
  </div>
</template>

<script>
import Thread from './thread';
import {mapGetters} from 'vuex';
import {GET} from '@/store/types';
import {THREAD_CONTAINER_ID} from '@/config/constants';
import PostFilter from '@/components/longpage-sidebar/posts/PostFilter';


export default {
  name: 'AnnotationSidebar',
  components: {
    PostFilter,
    Thread
  },
  data() {
    return {
      THREAD_CONTAINER_ID,
    };
  },
  computed: {
    ...mapGetters({
      threads: GET.THREADS,
    }),
  },
};
</script>
