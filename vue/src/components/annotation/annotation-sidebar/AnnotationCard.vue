<template>
  <div
    :id="`annotation-card-${annotation.id}`"
    class="annotation-card border-secondary card"
  >
    <div class="card-body text-dark">
      <annotation-component :annotation="annotation" />
    </div>
    <div class="card-footer">
      <annotation-component
        v-for="response in responses"
        :key="response.id * 17"
        class="my-2"
        :annotation="response"
      />
      <form-response :respondent="author" />
    </div>
  </div>
</template>

<script>
import {Annotation} from '@/lib/annotation/types/Annotation';
import AnnotationComponent from './AnnotationComponent';
import {GET} from '@/store/types';
import {mapGetters} from 'vuex';
import FormResponse from '@/components/annotation/annotation-sidebar/FormResponse';

export default {
  name: 'AnnotationCard',
  components: {
    FormResponse,
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
  }
};
</script>

<style lang="scss" scoped>
  .card {
    display: block;
  }
</style>
