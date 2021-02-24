<template>
  <div class="h-100 bg-white">
    <div class="h-100 d-flex flex-column">
      <div class="p-3 bg-white">
        <h3
          id="highlights-sidebar-heading"
          class="m-0"
        >
          {{ $t('sidebar.tabs.highlights.heading') }}
        </h3>
      </div>
      <hr class="my-0 mx-3">
      <div
        v-if="highlights.length"
        :id="THREAD_CONTAINER_ID"
        class="p-3 flex-shrink-1 flex-grow-1 overflow-y-auto overflow-x-hidden"
      >
        <div
          v-for="(highlight, index) in highlights"
          :key="highlight.id"
          class="mb-2 mx-3"
        >
          <expandable-highlight-excerpt
            :annotation-target="highlight.target"
            class="mx-1"
          />
          <div class="text-muted text-small mt-1 mx-1">
            <date-times
              :time-created="highlight.timeCreated"
              :time-modified="highlight.timeModified"
            />
          </div>
          <hr
            v-if="index !== highlights.length - 1"
            class="mt-2 mb-0"
          >
        </div>
      </div>
      <p
        v-else
        class="p-3"
      >
        {{ $t('sidebar.tabs.highlights.message.noneCreated') }}
      </p>
    </div>
  </div>
</template>

<script>
import ExpandableHighlightExcerpt from '@/components/longpage-sidebar/ExpandableHighlightExcerpt';
import {GET} from '@/store/types';
import {mapGetters} from 'vuex';
import DateTimes from '@/components/longpage-sidebar/DateTimes';

export default {
  name: 'Highlights',
  components: {DateTimes, ExpandableHighlightExcerpt},
  computed: {
    ...mapGetters({
      highlights: GET.HIGHLIGHTS,
    }),
  },
};
</script>
