<template>
  <highlights-tab
    :highlights="highlights"
    :type="type"
  />
</template>

<script>
import '@/lib/annotation/highlight-selection-listening';
import {AnnotationType} from '@/config/constants';
import {EventBus} from '@/lib/event-bus';
import {GET} from '@/store/types';
import HighlightsTab from '../HighlightsTab';
import {mapGetters} from 'vuex';

export default {
  name: 'Highlights',
  components: {HighlightsTab},
  data() {
    return {
      selectedHighlights: [],
    };
  },
  computed: {
    ...mapGetters([GET.HIGHLIGHTS]),
    highlights() {
      return this.selectedHighlights.length ? this.selectedHighlights : this[GET.HIGHLIGHTS];
    },
    type() {
      return AnnotationType.HIGHLIGHT;
    }
  },
  mounted() {
    EventBus.subscribe('highlights-selected', highlights => {
      this.selectedHighlights = highlights;
    });
  }
};
</script>
