<template>
  <div
    id="longpage-sidebar"
    class="row no-gutters vh-100-wo-nav mw-75"
  >
    <div
      v-show="tabOpenedKey"
      id="longpage-sidebar-tab-content"
      class="col h-100"
    >
      <component
        :is="tab.key"
        v-for="tab in tabs"
        v-show="tab.key === tabOpenedKey"
        :id="tab.id"
        :key="tab.key"
        class="fade show h-100"
      />
    </div>
    <div
      id="lonpage-sidebar-tab"
      class="col-auto border-left p-0 h-100 nav flex-column nav-pills"
      aria-orientation="vertical"
    >
      <a
        v-for="tab in tabs"
        :key="tab.key"
        class="nav-link text-center"
        href="javascript:void(0)"
        :class="{active: tab.key === tabOpenedKey}"
        @click="toggleTab(tab.key)"
      >
        <i :class="tab.icon" />
      </a>
    </div>
  </div>
</template>

<script>
import AnnotationSidebar from '@/components/longpage-sidebar/AnnotationSidebar';
import {GET, MUTATE} from '@/store/types';
import {mapGetters, mapMutations} from 'vuex';
import {SidebarTabKeys} from '@/config/constants';
import TableOfContents from '@/components/longpage-sidebar/TableOfContents';

export default {
  name: 'LongpageSidebar',
  components: {
    [SidebarTabKeys.ANNOTATIONS]: AnnotationSidebar,
    [SidebarTabKeys.TOC]: TableOfContents,
  },
  data() {
    return {
      tabs: [
        {key: SidebarTabKeys.ANNOTATIONS, id: 'sidebar-tab-annotations', icon: ['fa', 'fa-comment']},
        {key: SidebarTabKeys.TOC, id: 'sidebar-tab-table-of-contents', icon: ['fa', 'fa-list']},
      ],
    };
  },
  computed: {
    ...mapGetters({tabOpenedKey: GET.SIDEBAR_TAB_OPENED_KEY}),
  },
  methods: {
    toggleTab(tab) {
      if (tab === this.tabOpenedKey) this.setTabOpened(undefined);
      else this.setTabOpened(tab);
    },
    ...mapMutations({setTabOpened: MUTATE.RESET_SIDEBAR_TAB_OPENED_KEY})
  },
};
</script>
