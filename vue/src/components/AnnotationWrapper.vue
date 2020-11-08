<template>
  <annotation-toolbar-popover
      v-bind="annotationToolbarPopoverProps"
      @highlight="createAnnotation"
      ref="annotationToolbarPopover"
      class="longpage-highlights-always-on"
  />
</template>

<script>
import {ACT, GET} from "../store/types";
import AnnotationToolbarPopover from "./annotation/AnnotationToolbarPopover.vue";
import { AnnotationToolbarPopoverPositioner } from "../lib/annotation/annotation-toolbar-popover-positioner";
import { ArrowDirection } from "../config/constants";
import { SelectionListener } from "../lib/annotation/selection-listener";
import { describe } from "../lib/annotation/hypothesis/anchoring/html";
import { Annotation } from "../lib/annotation/types/annotation";
import { AnnotationTarget } from "../lib/annotation/types/annotation-target";
import {Anchoring} from "../lib/annotation/anchoring";
import {mapGetters} from "vuex";
import {setHighlightsVisible} from "../lib/annotation/highlighting";

export default {
  name: "AnnotationWrapper",
  components: {
    AnnotationToolbarPopover
  },
  data() {
    return {
      anchoring: null,
      annotationToolbarPopoverProps: {
        arrowDirection: ArrowDirection.UP,
        highlightingOptions: [
          "bg-yellow",
          "bg-blue",
          "bg-magenta",
          "bg-green",
        ],
        left: 0,
        showDelete: false,
        top: 0,
        visible: false,
        zIndex: undefined,
      },
      targetRoot: null,
      selectionListener: new SelectionListener(),
      selectedRanges: [],
    }
  },
  computed: {
    annotationToolbarPopover() {
      return this.$refs.annotationToolbarPopover;
    },
    annotationToolbarPopoverPositioner() {
      return new AnnotationToolbarPopoverPositioner(
          this.targetRoot,
          this.annotationToolbarPopover.height.bind(this.annotationToolbarPopover),
          this.annotationToolbarPopover.width.bind(this.annotationToolbarPopover),
          this.annotationToolbarPopover.arrowHeight.bind(this.annotationToolbarPopover),
      );
    },
    ...mapGetters({
      annotations: GET.ANNOTATIONS,
    }),
  },
  watch: {
    annotations(annotations) {
      annotations.forEach(annotation => {
        this.anchoring.anchor(annotation);
      })
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.targetRoot = document.body;
      this.selectionListener.subscribe(
          this.onSelection.bind(this),
          this.onClearSelection.bind(this),
      );
      this.anchoring = new Anchoring(this.targetRoot);
      setHighlightsVisible(this.targetRoot, true);
      this.$store.dispatch(ACT.FETCH_ANNOTATIONS);
    });
  },
  beforeDestroy() {
    this.selectionListener.unsubscribe();
  },
  methods: {
    createAnnotation(styleClass) {
      Promise.all(this.selectedRanges.map(this.getSelectors)).then(selectors => {
        const annotation = new Annotation(
          this.$store.getters[GET.USER_ID],
          selectors.map(selectors => (new AnnotationTarget(
            selectors,
            this.$store.getters[GET.PAGE_ID],
            styleClass
          )))
        );
        this.anchoring.anchor(annotation, styleClass).then(() => {
          this.$store.dispatch(ACT.CREATE_ANNOTATION, annotation);
        });
      });
    },
    getSelectors(range) {
      return describe(this.targetRoot, range);
    },
    onClearSelection() {
      this.selectedRanges = [];
      this.annotationToolbarPopoverProps.visible = false;
    },
    onSelection(range, focusRect, isBackwards) {
      if (!focusRect) this.onClearSelection();
      this.selectedRanges = [range];
      this.setPositionProps(this.annotationToolbarPopoverPositioner.calculatePositionProps(focusRect, isBackwards));
      this.annotationToolbarPopoverProps.visible = true;
    },
    setPositionProps({arrowDirection, left, top, zIndex}) {
      this.annotationToolbarPopoverProps.arrowDirection = arrowDirection;
      this.annotationToolbarPopoverProps.left = left;
      this.annotationToolbarPopoverProps.top = top;
      this.annotationToolbarPopoverProps.zIndex = zIndex;
    }
  },
};
</script>
