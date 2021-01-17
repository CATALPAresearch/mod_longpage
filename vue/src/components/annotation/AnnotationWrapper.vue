<template>
  <annotation-toolbar-popover
    ref="annotationToolbarPopover"
    v-bind="annotationToolbarPopoverProps"
    class="longpage-highlights-always-on"
    @highlight="createAnnotation"
  />
</template>

<script>
import {ACT, GET} from '@/store/types';
import {ArrowDirection, LONGPAGE_MAIN_ID, LONGPAGE_TEXT_CONTAINER_ID, SCROLL_INTO_VIEW_OPTIONS} from '@/config/constants';
import AnnotationToolbarPopover from './AnnotationToolbarPopover.vue';
import {AnnotationToolbarPopoverPositioner} from '@/lib/annotation/annotation-toolbar-popover-positioner';
import {SelectionListener} from '@/lib/annotation/selection-listener';
import {describe} from '@/lib/annotation/hypothesis/anchoring/html';
import {Annotation} from '@/lib/annotation/types/annotation';
import {Anchoring} from '@/lib/annotation/anchoring';
import {mapActions, mapGetters} from 'vuex';
import {setHighlightsVisible} from '@/lib/annotation/highlighting';
import {addAnnotationSelectionListener} from '@/lib/annotation/highlight-selection-listener';
import {PageSegment} from '@/lib/annotation/types/page-segment';
import scrollIntoView from 'scroll-into-view-if-needed';

const getAnnotationCardId = annotationId => `annotation-card-${annotationId}`;

export default {
  name: 'AnnotationWrapper',
  components: {
    AnnotationToolbarPopover,
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
          'bg-violet',
          'bg-blue',
          'bg-pink',
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
    ...mapGetters({
      annotations: GET.ANNOTATIONS,
    }),
  },
  mounted() {
    this.$nextTick(() => {
      this.targetRoot = document.getElementById(LONGPAGE_TEXT_CONTAINER_ID);
      this.selectionListener.subscribe(
          this.onSelection.bind(this),
          this.onClearSelection.bind(this),
      );
      this.anchoring = new Anchoring(this.targetRoot, this.$store);
      setHighlightsVisible(document.getElementById(LONGPAGE_MAIN_ID), true);
      this.$store.dispatch(ACT.FETCH_ANNOTATIONS);
      addAnnotationSelectionListener(annotations => {
        if (annotations.length > 0) this[ACT.FILTER_ANNOTATIONS]({ids: annotations.map(annotation => annotation.id)});
      });
    });
  },
  beforeUnmount() {
    this.anchoring.unsubscribe();
    this.selectionListener.unsubscribe();
  },
  methods: {
    ...mapActions([ACT.FILTER_ANNOTATIONS]),
    createAnnotation(styleClass) {
      Promise.all(this.selectedRanges.map(this.getSelectors)).then(selectorsInSelectors => {
        const annotation = new Annotation({
          userId: this.$store.getters[GET.LONGPAGE_CONTEXT].userId,
          pageId: this.$store.getters[GET.LONGPAGE_CONTEXT].pageId,
          target: selectorsInSelectors.map(selectors => new PageSegment({
            selector: selectors,
            styleclass: styleClass,
          })),
        });
        this.$store.dispatch(ACT.CREATE_ANNOTATION, annotation);
      });
    },
    getSelectors(range) {
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
