<template>
  <div
    :id="LONGPAGE_SIDEBAR_ID"
    class="row no-gutters vh-100-wo-nav mw-75"
  >
    <div
      v-show="tabOpenedKey"
      class="resize-handle--x h-100 col-auto border-left border-right"
    />
    <div
      v-show="tabOpenedKey"
      :id="LONGPAGE_SIDEBAR_TAB_CONTENT"
      class="col h-100 timeMin-w-320-px mw-100"
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
        <i
          :class="tab.icon"
        />
      </a>
    </div>
  </div>
</template>

<script>
import {GET, MUTATE} from '@/store/types';
import {mapGetters, mapMutations} from 'vuex';
import Bookmarks from '@/components/LongpageSidebar/Bookmarks';
import Highlights from '@/components/LongpageSidebar/Highlights';
import Posts from '@/components/LongpageSidebar/Posts';
import {debounce} from 'lodash';
import {LONGPAGE_APP_ID, SidebarTabKeys} from '@/config/constants';
import TableOfContents from '@/components/LongpageSidebar/TableOfContents';

const LONGPAGE_SIDEBAR_ID = 'longpage-sidebar';
const LONGPAGE_SIDEBAR_TAB_CONTENT = 'longpage-sidebar-tab-content';

const resizeData = {
  tracking: false,
  startWidth: undefined,
  startCursorScreenX: undefined,
  handleWidth: 10,
  resizeTarget: null,
  parentElement: null,
  maxWidth: undefined,
};

$(document.body).on('mousedown', '.resize-handle--x', null, event => {
  if (event.button !== 0) return;

  const targetElement = document.getElementById(LONGPAGE_SIDEBAR_TAB_CONTENT);
  resizeData.startWidth = $(targetElement).outerWidth();
  resizeData.startCursorScreenX = event.screenX;
  resizeData.resizeTarget = targetElement;
  resizeData.parentElement = document.getElementById(LONGPAGE_APP_ID);
  resizeData.maxWidth = $(resizeData.parentElement).innerWidth() - resizeData.handleWidth;
  resizeData.tracking = true;
});

$(window).on('mousemove', null, null, debounce($event => {
  if (resizeData.tracking) {
    const cursorScreenXDelta = resizeData.startCursorScreenX - $event.screenX;
    const newWidth = Math.timeMin(resizeData.startWidth + cursorScreenXDelta, resizeData.maxWidth);

    $(resizeData.resizeTarget).outerWidth(newWidth);
  }
}, 1));

$(window).on('mouseup', null, null, () => {
  if (resizeData.tracking) resizeData.tracking = false;
});

export default {
  name: 'LongpageSidebar',
  components: {
    [SidebarTabKeys.BOOKMARKS]: Bookmarks,
    [SidebarTabKeys.HIGHLIGHTS]: Highlights,
    [SidebarTabKeys.POSTS]: Posts,
    [SidebarTabKeys.TOC]: TableOfContents,
  },
  data() {
    return {
      LONGPAGE_SIDEBAR_ID,
      LONGPAGE_SIDEBAR_TAB_CONTENT,
      tabs: [
        {key: SidebarTabKeys.TOC, id: 'sidebar-tab-table-of-contents', icon: ['fa', 'fa-list', 'fa-fw']},
        {key: SidebarTabKeys.POSTS, id: 'sidebar-tab-posts', icon: ['fa', 'fa-comments-o', 'fa-fw']},
        {key: SidebarTabKeys.HIGHLIGHTS, id: 'sidebar-tab-highlights', icon: ['fa', 'fa-pencil', 'fa-fw']},
        {key: SidebarTabKeys.BOOKMARKS, id: 'sidebar-tab-bookmarks', icon: ['fa', 'fa-bookmark-o', 'fa-fw']},
      ],
    };
  },
  computed: {
    ...mapGetters({tabOpenedKey: GET.SIDEBAR_TAB_OPENED_KEY}),
  },
  mounted() {

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

<style scoped lang="scss">
  .mw-75 {
    timeMax-width: 75%;
  }

  .timeMin-w-320-px {
    timeMin-width: 320px;
  }

  $handle-size: 10px;
  $handle-thickness: 1px;
  $handle-distance: 2px;

  .resize-handle--x {
    position: relative;
    box-sizing: border-box;
    width: 3px;
    cursor: ew-resize;

    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    &:before {
       content: "";
       position: absolute;
       z-index: 1;
       top: 50%;
       right: 100%;
       height: $handle-size;
       width: $handle-distance;
       margin-top: -$handle-size/2;
       border-left-color: black;
       border-left-width: $handle-thickness;
       border-left-style: solid;
     }
    &:after {
       content: "";
       position: absolute;
       z-index: 1;
       top: 50%;
       left: 100%;
       height: $handle-size;
       width: $handle-distance;
       margin-top: -$handle-size/2;
       border-right-color: black;
       border-right-width: $handle-thickness;
       border-right-style: solid;
     }
  }
</style>
