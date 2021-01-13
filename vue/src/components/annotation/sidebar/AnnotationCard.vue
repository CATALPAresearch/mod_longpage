<template>
  <div
    :id="`annotation-card-${annotation.id}`"
    class="annotation-card border-secondary card"
    @click.stop="selectAnnotation"
  >
    <div class="card-body text-dark">
      <annotation-component :annotation="annotation" />
    </div>
    <div class="card-footer">
      <annotation-component
        v-for="response in responses"
        :key="response.id"
        class="my-2"
        :annotation="response"
      />
      <response-form
        :annotation-id="annotation.id"
      />
    </div>
  </div>
</template>

<script>
import {Annotation} from '@/lib/annotation/types/annotation';
import AnnotationComponent from './AnnotationComponent';
import {GET, MUTATE} from '@/store/types';
import {mapGetters, mapMutations} from 'vuex';
import ResponseForm from '@/components/annotation/sidebar/ResponseForm';
import scrollIntoView from 'scroll-into-view-if-needed';
import {HighlightingConfig, SCROLL_INTO_VIEW_OPTIONS} from '@/config/constants';

export default {
  name: 'AnnotationCard',
  components: {
    ResponseForm,
    AnnotationComponent,
  },
  props: {
    annotation: {type: Annotation, required: true},
  },
  computed: {
    responses() {
      return this[GET.RESPONSES_TO](this.annotation.id);
    },
    ...mapGetters([GET.RESPONSES_TO]),
    author() {
      return {
        name: 'Jens-Christian Dobbert',
        picture: 'https://moodle-wrm.fernuni-hagen.de/pluginfile.php/4462/user/icon/feu_clean/f2?rev=577610',
        profile: 'https://moodle-wrm.fernuni-hagen.de/user/view.php?id=92&amp;course=2435',
        role: 'Betreuer/in',
        roleOverview: 'https://moodle-wrm.fernuni-hagen.de/user/index.php?contextid=195391&roleid=3',
      };
    },
  },
  methods: {
    getHighlightHTMLElement() {
      return Array
          .from(document.getElementsByTagName(HighlightingConfig.HL_TAG_NAME))
          .find(element => element._annotation.id === this.annotation.id);
    },
    selectAnnotation() {
      this[MUTATE.SET_SELECTED_ANNOTATIONS]([this.annotation]);
      scrollIntoView(this.getHighlightHTMLElement(), SCROLL_INTO_VIEW_OPTIONS);
      // Document.getElementById(LONGPAGE_TEXT_OVERLAY_ID).style.display = 'block';
      // TODO: Reintroduce and fix overlay (overlays every highlight) or introduce other form of highlighting annotation selected
    },
    ...mapMutations([MUTATE.SET_SELECTED_ANNOTATIONS]),
  }
};
</script>

<style lang="scss" scoped>
  .card {
    display: block;
  }
</style>
