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
        <div
          v-if="selectedThreads.length"
          class="row mt-2"
        >
          <div class="col">
            <p class="mb-1">
              {{ $t('sidebar.tabs.posts.message.onlySelectedShown') }}
            </p>
            <a
              role="button"
              class="btn btn-sm btn-secondary"
              @click.stop="resetSelection"
            >
              {{ $t('sidebar.tabs.posts.message.showAllFiltered') }}
            </a>
          </div>
        </div>
        <div
          v-else-if="threadsFiltered && !filterFormShown"
          class="row mt-2"
        >
          <div class="col">
            <p class="mb-1">
              {{ $t('sidebar.tabs.posts.message.filtered') }}
            </p>
            <a
              role="button"
              class="btn btn-sm btn-secondary"
              @click.stop="resetFilter"
            >
              {{ $t('sidebar.tabs.posts.message.showAll') }}
            </a>
          </div>
        </div>
      </div>
      <hr class="my-0 mx-3">
      <div
        v-if="threads.length"
        :id="THREAD_CONTAINER_ID"
        class="p-3 flex-shrink-1 flex-grow-1 overflow-y-auto overflow-x-hidden"
      >
        <thread
          v-for="thread in allThreadsOrSelection"
          :key="thread.id"
          :thread="thread"
          class="mb-3"
        />
      </div>
      <p
        v-else-if="threadsFiltered"
        class="p-3"
      >
        {{ $t('sidebar.tabs.posts.message.noneFilteredShown') }}
      </p>
      <p
        v-else
        class="p-3"
      >
        {{ $t('sidebar.tabs.posts.message.noneShown') }}
      </p>
    </div>
  </div>
</template>

<script>
import {AnnotationType, THREAD_CONTAINER_ID} from '@/config/constants';
import {GET, MUTATE} from '@/store/types';
import {mapGetters, mapMutations} from 'vuex';
import {AnnotationFilter} from '@/util/filters/annotation-filter';
import {EventBus} from '@/lib/event-bus';
import FilterForm from '@/components/LongpageSidebar/Posts/FilterForm/';
import Thread from './Thread';

export default {
  name: 'Posts',
  components: {
    FilterForm,
    Thread
  },
  data() {
    return {
      filterFormShown: false,
      selectedThreads: [],
      THREAD_CONTAINER_ID,
    };
  },
  computed: {
    ...mapGetters({
      threads: GET.THREADS,
      threadsFiltered: GET.THREADS_FILTERED,
    }),
    allThreadsOrSelection() {
      return this.selectedThreads.length ? this.selectedThreads : this.threads;
    },
  },
  mounted() {
    EventBus.subscribe('annotations-selected', ({type, selection}) => {
      this.selectedThreads = type === AnnotationType.POST ?
          this.threads.filter(t => selection.findIndex(annotation => annotation.id === t.annotationId) >= 0) : [];
    });
  },
  methods: {
    ...mapMutations([MUTATE.SET_ANNOTATION_FILTER]),
    resetFilter() {
      this[MUTATE.SET_ANNOTATION_FILTER](AnnotationFilter.DEFAULT);
    },
    resetSelection() {
      this.selectedThreads = [];
    },
    toggleFilterForm() {
      this.filterFormShown = !this.filterFormShown;
    },
  },
};
</script>
