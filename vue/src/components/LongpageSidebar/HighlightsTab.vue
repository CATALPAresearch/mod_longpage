<template>
  <sidebar-tab :title="areHighlights ? $t('sidebar.tabs.highlights.heading') : $t('sidebar.tabs.bookmarks.heading')">
    <template #append-header>
      <div
        v-show="selectedHighlights === allHighlightsOrSelection"
        class="mt-2"
      >
        <p class="mb-1">
          {{ $t(`sidebar.tabs.${areHighlights ? 'highlights' : 'bookmarks'}.message.onlySelectedShown`) }}
        </p>
        <a
          role="button"
          class="btn btn-sm btn-secondary"
          @click.stop="resetSelection"
        >
          {{ $t(`sidebar.tabs.${areHighlights ? 'highlights' : 'bookmarks'}.message.showAll`) }}
        </a>
      </div>
    </template>
    <template #body>
      <div
        v-if="allHighlightsOrSelection.length"
      >
        <div
          v-for="(highlight, index) in allHighlightsOrSelection"
          :key="highlight.id"
          class="mb-1"
        >
          <expandable-highlight-excerpt
            :annotation-target="highlight.target"
            class="mx-2 cursor-pointer"
            @highlight-clicked="scrollTextElementIntoView(highlight.id)"
          />
          <div
            class="text-muted text-small mt-1 mx-2 row justify-content-between"
          >
            <div class="col-auto p-0">
              <date-times
                :time-created="highlight.timeCreated"
                :time-modified="highlight.timeModified"
              />
            </div>
            <div
              v-if="highlight.created"
              class="col-auto p-0"
            >
              <a
                v-for="action in actions"
                :key="action.text"
                href="javascript:void(0)"
                class="text-dark"
                role="button"
                @click="action.handler(highlight)"
              >
                <i
                  class="icon fa fa-fw text-dark"
                  :class="action.iconClasses"
                  :aria-label="action.text"
                  :title="action.text"
                />
              </a>
            </div>
          </div>
          <hr
            v-if="index !== allHighlightsOrSelection.length - 1"
            class="mt-1 mb-0"
          >
        </div>
      </div>
      <p
        v-else
        class="p-3"
      >
        {{ areHighlights ? $t('sidebar.tabs.highlights.message.noneCreated') : $t('sidebar.tabs.bookmarks.message.noneCreated') }}
      </p>
    </template>
  </sidebar-tab>
</template>

<script>
import {ACT} from '@/store/types';
import {AnnotationType} from '@/config/constants';
import DateTimes from '@/components/LongpageSidebar/DateTimes';
import ExpandableHighlightExcerpt from '@/components/Generic/ExpandableHighlightExcerpt';
import {EventBus} from '@/lib/event-bus';
import {getHighlightByAnnotationId} from '@/util/annotation';
import {mapActions} from 'vuex';
import SidebarTab from '@/components/LongpageSidebar/SidebarTab';
import {scrollTextElementIntoView} from '@/util/misc';

export default {
  name: 'HighlightsTab',
  components: {DateTimes, ExpandableHighlightExcerpt, SidebarTab},
  props: {
    type: {type: Number, default: AnnotationType.HIGHLIGHT},
    highlights: {type: Array, default: () => []},
  },
  data() {
    return {
      selectedHighlights: [],
    };
  },
  computed: {
    actions() {
      const text = this.areHighlights ? this.$i18n.t('highlight.action.delete') : this.$i18n.t('bookmark.action.delete');
      return [
        {iconClasses: ['fa-trash'], handler: this[ACT.DELETE_ANNOTATION], text}
      ];
    },
    allHighlightsOrSelection() {
      return this.selectedHighlights.length &&
        this.selectedHighlights.some(shl => Boolean(this.highlights.find(hl => hl.id === shl.id))) ?
          this.selectedHighlights : this.highlights;
    },
    areHighlights() {
      return this.type === AnnotationType.HIGHLIGHT;
    },
  },
  methods: {
    ...mapActions([ACT.DELETE_ANNOTATION]),
    resetSelection() {
      this.selectedHighlights = [];
    },
    scrollTextElementIntoView(id) {
      scrollTextElementIntoView(getHighlightByAnnotationId(id));
    },
  },
  mounted() {
    EventBus.subscribe('annotations-selected', ({type, selection}) => {
      this.selectedHighlights = this.type === type ? selection : [];
    });
  },
};
</script>
