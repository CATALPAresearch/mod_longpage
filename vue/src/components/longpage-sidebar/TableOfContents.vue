<template>
  <div>
    <div class="pt-3 px-3 bg-white sticky-top">
      <h3>
        {{ $t('sidebar.tabs.tableOfContents.heading') }}
      </h3>
      <hr>
    </div>
    <div
      class="pb-3 px-3"
    >
      <nav
        class="nav flex-column nav-pills"
        aria-orientation="vertical"
      >
        <a
          v-for="(entry, index) in tocEntries"
          :key="entry.hId"
          class="nav-link"
          :class="{active: index === activeTOCEntryIndex}"
          :href="`#${entry.hId}`"
          data-toggle="pill"
          :style="`margin-left: ${entry.hLvl*2}rem`"
          @click="scrollIntoView(entry.hEl)"
        >{{ entry.text }}</a>
      </nav>
    </div>
  </div>
</template>

<script>
import {LONGPAGE_CONTENT_ID, LONGPAGE_MAIN_ID, SCROLL_INTO_VIEW_OPTIONS} from '@/config/constants';
import scrollIntoView from 'scroll-into-view-if-needed';
import {toIdSelector} from '@/util/style';
import {findLast} from 'lodash';

export default {
    name: 'TableOfContents',
    props: {
      contentsContainerSelector: {type: String, default: toIdSelector(LONGPAGE_CONTENT_ID)},
      headingSelectors: {
        type: Array,
        default: () => [
          'h3',
          'h4',
        ]
      }
    },
    data() {
        return {
            hClass: 'in-toc',
            tocEntries: [],
            activeTOCEntryIndex: 0,
        };
    },
    computed: {
      allHeadingsSelector() {
        return this.headingSelectors.map(hSelector => [this.contentsContainerSelector, hSelector].join(' ')).join(', ');
      }
    },
    mounted() {
        this.initTOC();
        this.initHIntersectionObserver();
    },
    methods: {
        initHIntersectionObserver() {
          const root = document.getElementById(LONGPAGE_MAIN_ID);
          const intersectionObserver = new IntersectionObserver(entries => {
            const lastIntersectingEntry = findLast(entries, e => e.isIntersecting);
            if (lastIntersectingEntry) {
             this.activeTOCEntryIndex = this.tocEntries.findIndex(e => e.hId === lastIntersectingEntry.target.id);
             return;
            }

            const lastEntry = entries[entries.length - 1];
            if (lastEntry.boundingClientRect.y > root.getBoundingClientRect().y) {
              this.activeTOCEntryIndex = this.tocEntries.findIndex(e => e.hId === lastEntry.target.id) - 1;
            }
          }, {root});
          this.tocEntries.map(entry => entry.hEl).forEach(targetEl => intersectionObserver.observe(targetEl));
        },
        initTOC() {
            $(this.allHeadingsSelector).each((index, el) => {
              const hId = `h-in-toc-${index}`;
              const hLvl = this.headingSelectors.findIndex(selector => $(el).is(selector));
              this.tocEntries.push({hEl: el, hId, hLvl, text: $(el).text()});
              $(el).attr('id', hId);
              $(el).attr('class', this.hClass);
            });
        },
        scrollIntoView(el) {
          scrollIntoView(el, {...SCROLL_INTO_VIEW_OPTIONS, boundary: document.getElementById(LONGPAGE_MAIN_ID)});
        },
    },
};
</script>
