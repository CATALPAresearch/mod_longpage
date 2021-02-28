<template>
  <sidebar-tab :title="areHighlights ? $t('sidebar.tabs.highlights.heading') : $t('sidebar.tabs.bookmarks.heading')">
    <template #body>
      <div
        v-if="highlights.length"
      >
        <div
          v-for="(highlight, index) in highlights"
          :key="highlight.id"
          class="mb-1"
        >
          <expandable-highlight-excerpt
            :annotation-target="highlight.target"
            class="mx-2"
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
            v-if="index !== highlights.length - 1"
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
import ExpandableHighlightExcerpt from '@/components/Generic/ExpandableHighlightExcerpt';
import {ACT} from '@/store/types';
import {mapActions} from 'vuex';
import DateTimes from '@/components/LongpageSidebar/DateTimes';
import SidebarTab from '@/components/LongpageSidebar/SidebarTab';
import {AnnotationType} from '@/config/constants';

export default {
  name: 'HighlightsTab',
  components: {DateTimes, ExpandableHighlightExcerpt, SidebarTab},
  props: {
    type: {type: Number, default: AnnotationType.HIGHLIGHT},
    highlights: {type: Array, default: () => []}
  },
  computed: {
    actions() {
      const text = this.areHighlights ? this.$i18n.t('highlight.action.delete') : this.$i18n.t('bookmark.action.delete');
      return [
        {iconClasses: ['fa-trash'], handler: this[ACT.DELETE_ANNOTATION], text}
      ];
    },
    areHighlights() {
      return this.type === AnnotationType.HIGHLIGHT;
    },
  },
  methods: {
    ...mapActions([ACT.DELETE_ANNOTATION])
  }
};
</script>
