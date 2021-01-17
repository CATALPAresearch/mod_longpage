<template>
  <div id="annotation-filter-container">
    <div
      v-show="annotationsFiltered"
      class="card my-3"
    >
      <div class="card-body p-2">
        <h6 class="m-0 text-center">
          {{ $t('annotationSidebar.filterByTextSelection') }}
          <a
            role="button"
            class="badge badge-secondary"
            @click.stop="resetFilter"
          >
            <font-awesome-icon icon="times" />
            {{ $t('annotationSidebar.showAll') }}
          </a>
        </h6>
      </div>
    </div>
  </div>
</template>

<script>
  import {GET, MUTATE} from '@/store/types';
  import {mapGetters, mapMutations} from 'vuex';
  import {isEmpty} from 'lodash';

  export default {
    name: 'AnnotationFilter',
    computed: {
      annotationsFiltered() {
        return !isEmpty(this[GET.ANNOTATION_FILTER]);
      },
      ...mapGetters([GET.ANNOTATION_FILTER]),
    },
    methods: {
      resetFilter() {
        this[MUTATE.SET_ANNOTATION_FILTER]({});
      },
      ...mapMutations([MUTATE.SET_ANNOTATION_FILTER]),
    }
  };
</script>
