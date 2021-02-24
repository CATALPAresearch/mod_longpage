<template>
  <highlights-tab :highlights="highlights" />
</template>

<script>
import {GET} from '@/store/types';
import HighlightsTab from '../HighlightsTab';
import {mapGetters} from 'vuex';

export default {
  name: 'Bookmarks',
  components: {HighlightsTab},
  computed: {
    ...mapGetters({
      highlights: GET.BOOKMARKS,
    }),
  },
};
</script>

