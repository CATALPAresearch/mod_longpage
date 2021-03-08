<template>
  <highlights-tab
    :highlights="highlights"
    :type="type"
  />
</template>

<script>
import '@/lib/annotation/highlight-selection-listening';
import {AnnotationType} from '@/config/constants';
import {GET} from '@/store/types';
import HighlightsTab from '../HighlightsTab';
import {mapGetters} from 'vuex';

export default {
  name: 'Highlights',
  components: {HighlightsTab},
  computed: {
    ...mapGetters({highlights: GET.HIGHLIGHTS}),
    type() {
      return AnnotationType.HIGHLIGHT;
    }
  },
};
</script>
