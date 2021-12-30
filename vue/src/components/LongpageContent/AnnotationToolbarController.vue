<template>
  <annotation-toolbar
    ref="annotationToolbarPopover"
    v-bind="annotationToolbarPopoverProps"
    class="longpage-highlights-always-on"
    @bookmark-clicked="createBookmark"
    @post-clicked="createPost"
    @highlight-clicked="createHighlight"
  />
</template>

<script>
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * @package    mod_page
 * @copyright  2021 Adrian Stritzinger <Adrian.Stritzinger@studium.fernuni-hagen.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import {ACT, GET, MUTATE} from '@/store/types';
import {AnnotationType, ArrowDirection, LONGPAGE_APP_ID, LONGPAGE_CONTENT_ID, SidebarTabKeys} from '@/config/constants';
import {AnnotationTarget} from '@/types/annotation-target';
import AnnotationToolbar from './AnnotationToolbar.vue';
import {AnnotationToolbarPopoverPositioner} from '@/lib/annotation/annotation-toolbar-popover-positioner'; // Interesting for architecture
import {SelectionListener} from '@/lib/annotation/selection-listening'; // Interesting for architecture
import {describe} from '@/lib/annotation/hypothesis/anchoring/html'; // Interesting for architecture
import {Anchoring} from '@/lib/annotation/anchoring'; // Interesting for architecture
import {mapActions, mapGetters, mapMutations} from 'vuex';
import {setHighlightsVisible} from '@/lib/annotation/highlighting';

export default {
  name: 'AnnotationToolbarController',
  components: {
    AnnotationToolbar,
  },
  data() {
    return {
      anchoring: null,
      annotationToolbarPopoverProps: {
        arrowDirection: ArrowDirection.UP,
        highlightingOptions: [
          'bg-yellow',
          'bg-green',
          'bg-orange',
          'bg-pink',
          'underline',
          'underline-red',
        ],
        left: 0,
        showDelete: false,
        top: 0,
        visible: false,
        zIndex: undefined,
      },
      selectionListener: new SelectionListener(),
      selectedRanges: [],
      targetRoot: null,
    };
  },
  computed: {
    ...mapGetters([GET.NEW_ANNOTATION]),
    annotationToolbarPopover() {
      return this.$refs.annotationToolbarPopover;
    },
    annotationToolbarPopoverPositioner() {
      return new AnnotationToolbarPopoverPositioner(
          document.body,
          this.annotationToolbarPopover.height.bind(this.annotationToolbarPopover),
          this.annotationToolbarPopover.width.bind(this.annotationToolbarPopover),
          this.annotationToolbarPopover.arrowHeight.bind(this.annotationToolbarPopover),
      );
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.targetRoot = document.getElementById(LONGPAGE_CONTENT_ID);
      this.selectionListener.subscribe(
          this.onSelection.bind(this),
          this.onClearSelection.bind(this),
      );
      this.anchoring = new Anchoring(this.targetRoot, this.$store);
      setHighlightsVisible(document.getElementById(LONGPAGE_APP_ID), true);
      this.$store.dispatch(ACT.FETCH_ANNOTATIONS);
    });
  },
  beforeUnmount() {
    this.anchoring.unsubscribe();
    this.selectionListener.unsubscribe();
  },
  methods: {
    ...mapActions([ACT.CREATE_ANNOTATION]),
    ...mapMutations([MUTATE.RESET_SIDEBAR_TAB_OPENED_KEY]),
    async createBookmark() {
      this[ACT.CREATE_ANNOTATION]({
        target: await this.getAnnotationTarget(), type: AnnotationType.BOOKMARK,
      });
    },
    createPost() {
      this[MUTATE.RESET_SIDEBAR_TAB_OPENED_KEY](SidebarTabKeys.POSTS);
      this.$nextTick(async() => {
        this[ACT.CREATE_ANNOTATION]({
          target: await this.getAnnotationTarget(), type: AnnotationType.POST,
        });
      });
    },
    async createHighlight(styleClass) {
      this[ACT.CREATE_ANNOTATION]({
        target: await this.getAnnotationTarget(styleClass), styleClass, type: AnnotationType.HIGHLIGHT,
      });
    },
    async getAnnotationTarget(styleClass) {
      const selectorsInSelectors = await Promise.all(this.selectedRanges.map(this.getSelectors));
      return new AnnotationTarget({
        selectors: selectorsInSelectors[0],
        styleClass,
      });
    },
    getSelectors(range) {
      console.log(describe(this.targetRoot, range));
      return describe(this.targetRoot, range);
    },
    onClearSelection() {
      this.selectedRanges = [];
      this.annotationToolbarPopoverProps.visible = false;
    },
    isInsideTarget(range) {
      return this.targetRoot.contains(range.commonAncestorContainer);
    },
    onSelection(range, focusRect, isBackwards) {
      if (!focusRect || !this.isInsideTarget(range)) {
        this.onClearSelection();
        return;
      }
      this.selectedRanges = [range];
      this.setPositionProps(this.annotationToolbarPopoverPositioner.calculatePositionProps(focusRect, isBackwards));
      this.annotationToolbarPopoverProps.visible = true;
    },
    setPositionProps({arrowDirection, left, top, zIndex}) {
      this.annotationToolbarPopoverProps.arrowDirection = arrowDirection;
      this.annotationToolbarPopoverProps.left = left;
      this.annotationToolbarPopoverProps.top = top;
      this.annotationToolbarPopoverProps.zIndex = zIndex;
    },
  },
};
</script>
