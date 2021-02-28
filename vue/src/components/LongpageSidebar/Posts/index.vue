<template>
  <div class="h-100 bg-light">
    <div class="h-100 d-flex flex-column">
      <div class="p-3 bg-white">
        <div class="row">
          <h3
            id="posts-sidebar-heading"
            class="col m-0"
          >
            {{ $t('sidebar.tabs.posts.heading') }}
          </h3>
          <div class="col text-right">
            <a
              href="javascript:void(0)"
              @click="toggleFilterForm"
            >
              <i class="fa fa-filter fa-fw fa-2x" />
            </a>
          </div>
        </div>
        <hr
          v-show="filterFormShown"
          class="my-3"
        >
        <filter-form
          v-show="filterFormShown"
        />
        <active-filters-bar />
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
import Thread from './Thread';
import {mapGetters} from 'vuex';
import {GET} from '@/store/types';
import {THREAD_CONTAINER_ID} from '@/config/constants';
import ActiveFiltersBar from '@/components/LongpageSidebar/Posts/ActiveFiltersBar';
import FilterForm from '@/components/LongpageSidebar/Posts/FilterForm/';

export default {
  name: 'Posts',
  components: {
    FilterForm,
    ActiveFiltersBar,
    Thread
  },
  data() {
    return {
      filterFormShown: false,
      THREAD_CONTAINER_ID,
    };
  },
  computed: {
    ...mapGetters({
      threads: GET.THREADS,
    }),
  },
  methods: {
    toggleFilterForm() {
      this.filterFormShown = !this.filterFormShown;
    },
  }
};
</script>
