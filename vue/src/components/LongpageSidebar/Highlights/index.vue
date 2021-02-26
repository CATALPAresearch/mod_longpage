<template>
  <highlights-tab :highlights="highlights" />
</template>

<script>
import {GET} from '@/store/types';
import HighlightsTab from '../HighlightsTab';
import {mapGetters} from 'vuex';

export default {
  name: 'Highlights',
  components: {HighlightsTab},
  computed: {
    ...mapGetters({
      highlights: GET.HIGHLIGHTS,
    }),
  },
};
</script>
