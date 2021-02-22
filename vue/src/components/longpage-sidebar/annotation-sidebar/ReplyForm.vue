<template>
  <div
    v-if="!editing"
    class="row no-gutters align-items-center reply-form"
  >
    <div class="col col-auto p-0">
      <user-avatar
        :user="respondent"
      />
    </div>
    <div class="col p-0">
      <input
        class="form-control"
        :placeholder="$t('responseForm.placeholder')"
        @focus="startEditingAnnotation"
      >
    </div>
  </div>
</template>

<script>
import {ACT, GET} from '@/store/types';
import {mapActions, mapGetters} from 'vuex';
// Import {Annotation} from '@/lib/annotation/types/annotation';
import UserAvatar from '@/components/UserAvatar';

export default {
  name: 'ReplyForm',
  components: {
    UserAvatar,
  },
  props: {
    annotationId: {type: Number, required: true},
  },
  computed: {
    editing() {
      return this[GET.ANNOTATIONS_IN_EDIT].find(annotation => annotation.target.annotationId === this.annotationId);
    },
    respondent() {
      return this[GET.USER]();
    },
    ...mapGetters([GET.ANNOTATIONS_IN_EDIT, GET.USER]),
  },
  methods: {
    // StartEditingAnnotation() {
    //   this.provisionalAnnotationId = this[ACT.START_EDITING_ANNOTATION](new Annotation({
    //     target: [new TargetAnnotationReference({annotationId: this.annotationId})],
    //   }));
    // },
    ...mapActions([ACT.CREATE_ANNOTATION, ACT.START_EDITING_ANNOTATION]),
  }
};
</script>
