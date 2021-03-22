<template>
  <div class="h-100 bg-light">
    <div class="h-100 d-flex flex-column">
      <div class="p-3 bg-white">
        <div class="row pr-3">
          <h3
            id="posts-sidebar-heading"
            class="col m-0"
          >
            {{ $t('sidebar.tabs.posts.heading') }}
          </h3>
          <div class="col-auto px-0">
            <a
              href="javascript:void(0)"
              @click="toggleFormShown('filter')"
            >
              <i class="fa fa-filter fa-fw fa-2x" />
            </a>
          </div>
          <div class="col-auto px-0">
            <a
              href="javascript:void(0)"
              @click="toggleFormShown('sorting')"
            >
              <i class="fa fa-sort-amount-desc fa-fw fa-2x" />
            </a>
          </div>
        </div>
        <hr
          v-show="formShown !== null"
          class="my-3"
        >
        <filter-form
          v-show="formShown === 'filter'"
        />
        <div v-show="formShown === 'sorting'">
          <select
            v-model="selectedSortingOption"
            class="custom-select"
          >
            <option>
              {{ selectedSortingOption }}
            </option>
            <option value="1">
              One
            </option>
            <option value="2">
              Two
            </option>
            <option value="3">
              Three
            </option>
          </select>
        </div>
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
          v-else-if="threadsFiltered && !formShown"
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
import {ACT, GET} from '@/store/types';
import {AnnotationType, THREAD_CONTAINER_ID} from '@/config/constants';
import {mapActions, mapGetters} from 'vuex';
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
      formShown: null,
      selectedSortingOption: 1,
      selectedThreads: [],
      THREAD_CONTAINER_ID,
    };
  },
  computed: {
    ...mapGetters([GET.FILTERED_THREADS, GET.THREADS]),
    ...mapGetters({threadsFiltered: GET.THREADS_FILTERED}),
    allThreadsOrSelection() {
      return this.selectedThreads.length ? this.selectedThreads : this.threads;
    },
    threads() {
      return this.threadsFiltered ? this[GET.FILTERED_THREADS] : this[GET.THREADS];
    }
  },
  mounted() {
    EventBus.subscribe('annotations-selected', ({type, selection}) => {
      this.selectedThreads = type === AnnotationType.POST ?
          this.threads.filter(t => selection.findIndex(annotation => annotation.id === t.annotationId) >= 0) : [];
    });
  },
  methods: {
    ...mapActions([ACT.FILTER_ANNOTATIONS]),
    resetFilter() {
      this[ACT.FILTER_ANNOTATIONS]();
    },
    resetSelection() {
      this.selectedThreads = [];
    },
    toggleFormShown(formKey = null) {
      this.formShown = this.formShown === formKey ? null : formKey;
    },
  },
};
</script>
