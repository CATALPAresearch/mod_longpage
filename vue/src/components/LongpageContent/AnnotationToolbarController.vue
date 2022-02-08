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
import { ACT, GET, MUTATE } from "@/store/types";
import {
  AnnotationType,
  ArrowDirection,
  LONGPAGE_APP_ID,
  LONGPAGE_CONTENT_ID,
  SidebarTabKeys,
} from "@/config/constants";
import { AnnotationTarget } from "@/types/annotation-target";
import AnnotationToolbar from "./AnnotationToolbar.vue";
import { AnnotationToolbarPopoverPositioner } from "@/lib/annotation/annotation-toolbar-popover-positioner"; // Interesting for architecture
import { SelectionListener } from "@/lib/annotation/selection-listening"; // Interesting for architecture
import { describe } from "@/lib/annotation/hypothesis/anchoring/html"; // Interesting for architecture
import { Anchoring } from "@/lib/annotation/anchoring"; // Interesting for architecture
import { mapActions, mapGetters, mapMutations } from "vuex";
import { setHighlightsVisible } from "@/lib/annotation/highlighting";

export default {
  name: "AnnotationToolbarController",
  components: {
    AnnotationToolbar,
  },
  data() {
    return {
      anchoring: null,
      annotationToolbarPopoverProps: {
        arrowDirection: ArrowDirection.UP,
        highlightingOptions: [
          "bg-yellow",
          "bg-green",
          "bg-orange",
          "bg-pink",
          "underline",
          "underline-red",
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
        this.annotationToolbarPopover.height.bind(
          this.annotationToolbarPopover
        ),
        this.annotationToolbarPopover.width.bind(this.annotationToolbarPopover),
        this.annotationToolbarPopover.arrowHeight.bind(
          this.annotationToolbarPopover
        )
      );
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.targetRoot = document.getElementById(LONGPAGE_CONTENT_ID);
      this.selectionListener.subscribe(
        this.onSelection.bind(this),
        this.onClearSelection.bind(this)
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
        target: await this.getAnnotationTarget(),
        type: AnnotationType.BOOKMARK,
      });
    },
    createPost() {
      this[MUTATE.RESET_SIDEBAR_TAB_OPENED_KEY](SidebarTabKeys.POSTS);
      this.$nextTick(async () => {
        this[ACT.CREATE_ANNOTATION]({
          target: await this.getAnnotationTarget(),
          type: AnnotationType.POST,
        });
      });
    },
    async createHighlight(styleClass) {
      this[ACT.CREATE_ANNOTATION]({
        target: await this.getAnnotationTarget(styleClass),
        styleClass,
        type: AnnotationType.HIGHLIGHT,
      });
    },
    async getAnnotationTarget(styleClass) {
      const selectorsInSelectors = await Promise.all(
        this.selectedRanges.map(this.getSelectors)
      );
      //console.log(this.selectedRanges);
      this.cleanUpAnnotationText(selectorsInSelectors, this.selectedRanges[0]);
      //console.log(selectorsInSelectors, this.selectedRanges);
      return new AnnotationTarget({
        selectors: selectorsInSelectors[0],
        styleClass,
      });
    },
    getSelectors(range) {
      return describe(this.targetRoot, range);
    },
    // workaround method to clean up double Mathjax elements
    // why? Mathjax filter creates 2 elements: span and script element
    // hypothesis.js (for creating highlights and annotations) extracts all available text
    // example: ...\(n-1\)... -> annotation then contains ...n-1n-1...
    cleanUpAnnotationText(selectors, range) {
      //console.log(document.getSelection().toString());
      let mathjaxcontents = [];
      let tempElement;
      let preAncestorStartContainer, preAncestorEndContainer;
      let walkingSiblings;
      let replacedExact = 0;
      //console.log(range);
      preAncestorStartContainer = range.startContainer; //.parentElement
      preAncestorEndContainer = range.endContainer;
      let i = 0;

      // range.commonAncestorContainer can sometimes contain all contents of longpage or is otherwise really large
      // so we try to find all elements between start and end container and look for class "MathJax_Preview"
      // startcontainer not already common ancestor ?
      if (preAncestorStartContainer !== range.commonAncestorContainer) {
        // find beginning edge of common ancestor
        while (
          preAncestorStartContainer.parentElement !==
          range.commonAncestorContainer
        ) {
          preAncestorStartContainer = preAncestorStartContainer.parentElement;
          i++;
          if (i > 10) break;
        }
      } else {
        preAncestorStartContainer = range.commonAncestorContainer;
      }

      i = 0;
      if (preAncestorEndContainer !== range.commonAncestorContainer) {
        // endcontainer not already common ancestor ?
        while (
          preAncestorEndContainer.parentElement !==
          range.commonAncestorContainer
        ) {
          preAncestorEndContainer = preAncestorEndContainer.parentElement;
          i++;
          if (i > 10) break;
        }
      } else {
        preAncestorEndContainer = range.commonAncestorContainer;
      }

      walkingSiblings = preAncestorStartContainer;
      i = 0;

      //console.dir(preAncestorStartContainer);
      //console.dir(preAncestorEndContainer);

      do {
        // nodeType 3 is a textnode
        if (walkingSiblings.nodeType != 3) {
          tempElement =
            walkingSiblings.getElementsByClassName("MathJax_Preview");

          // do an extra check and reset if walkingSiblings didnt have an element with that class
          if (tempElement.length != 0) {
            mathjaxcontents.push(tempElement);
          }
        }
        // have we already reached the end ?
        if (walkingSiblings == preAncestorEndContainer) {
          break;
        }
        ////console.log(walkingSiblings);
        // nextElementSibling: ignores non-element nodes (text or comment nodes)
        //  text nodes dont have other typical element methods, like getElementsbyClassName
        // UPDATE: changed it back to nextSibling because sometimes preAncestorEndContainer is a text node
        //  and thus we would miss our exit condition
        if (walkingSiblings.nextSibling) {
          walkingSiblings = walkingSiblings.nextSibling;
        }

        tempElement = 0;
        i++;
        if (i > 50) {
          //console.log("emergency break");
          break;
        }
        // end of tree
      } while (walkingSiblings.nextSibling != null);

      let patternfound = 0;
      //console.log(mathjaxcontents);

      // we have collected mathjax elements, now we extract their text contents and look for their appearance in
      //  selectors[0][2].exact, which contains the default extracted strings from which we remove the double mathjax

      // mathjaxcontents is an array containing HTMLCollections which themselves are also arrays...or objects
      for (let i = 0; i < mathjaxcontents.length; i++) {
        for (let j = 0; j < mathjaxcontents[i].length; j++) {
          selectors[0][0].endOffset += 10;
          selectors[0][1].end += 10;
          //console.log(mathjaxcontents[i][j].innerText + " " +
                  mathjaxcontents[i][j].nextSibling.innerText);
          if (
            mathjaxcontents[i][j].nextSibling &&
            mathjaxcontents[i][j].nextSibling.nodeName == "SCRIPT"
          ) {
          }
          if (mathjaxcontents[i][j].innerText.length > 1) {
            if (
              (patternfound =
                selectors[0][2].exact.indexOf(
                  mathjaxcontents[i][j].innerText +
                    mathjaxcontents[i][j].nextSibling.innerText
                ) != -1)
            ) {
              selectors[0][2].exact = selectors[0][2].exact.replace(
                mathjaxcontents[i][j].innerText +
                  mathjaxcontents[i][j].nextSibling.innerText,
                mathjaxcontents[i][j].innerText // + this.fillerspace(mathjaxcontents[i][j].nextSibling.innerText.length)
              );
            }

            // special case for mathjax with length = 1
          } else {
            if (
              (patternfound =
                selectors[0][2].exact.indexOf(
                  mathjaxcontents[i][j].innerText +
                    mathjaxcontents[i][j].nextSibling.innerText
                ) != -1)
            ) {
              selectors[0][2].exact = selectors[0][2].exact.replace(
                mathjaxcontents[i][j].innerText +
                  mathjaxcontents[i][j].innerText,
                mathjaxcontents[i][j].innerText  //+ this.fillerspace(mathjaxcontents[i][j].nextSibling.innerText.length)
              );
            }
          }
          if (patternfound != -1) {
            //console.log(mathjaxcontents[i][j].nextSibling.innerText.length);
            // selectors[0][2].exact += this.fillerspace(
            //   mathjaxcontents[i][j].nextSibling.innerText.length
            // );
          }
          patternfound = 0;
        }
      }
    },
    fillerspace(size) {
      let fillerspace = " ";
      let returnstring = "";
      for (let i = 0; i < size; i++) {
        returnstring += fillerspace;
      }
      //console.log(returnstring.length);
      return returnstring;
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
      this.setPositionProps(
        this.annotationToolbarPopoverPositioner.calculatePositionProps(
          focusRect,
          isBackwards
        )
      );
      this.annotationToolbarPopoverProps.visible = true;
    },
    setPositionProps({ arrowDirection, left, top, zIndex }) {
      this.annotationToolbarPopoverProps.arrowDirection = arrowDirection;
      this.annotationToolbarPopoverProps.left = left;
      this.annotationToolbarPopoverProps.top = top;
      this.annotationToolbarPopoverProps.zIndex = zIndex;
    },
  },
};
</script>
