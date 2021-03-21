<template>
  <div class="h-100">
    <div class="h-100 d-flex flex-column">
      <div class="p-3 bg-white">
        <h3 class="m-0">
          {{ $t('sidebar.tabs.tableOfContents.heading') }}
        </h3>
      </div>
      <hr class="my-0 mx-3">
      <div
        class="p-3 flex-shrink-1 flex-grow-1 overflow-y-auto overflow-x-hidden"
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
            @click="scrollTextElementIntoView(entry.hEl)"
          >{{ entry.text }}</a>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import {LONGPAGE_CONTENT_ID, LONGPAGE_MAIN_ID} from '@/config/constants';
import {findLast} from 'lodash';
import {toIdSelector} from '@/util/style';
import {scrollTextElementIntoView} from '@/util/misc';

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
        scrollTextElementIntoView,
    },
};
</script>
