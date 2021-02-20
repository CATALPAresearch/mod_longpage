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
      <textarea
        class="form-control"
        :placeholder="$t('responseForm.placeholder')"
        rows="1"
        @focus="startEditingAnnotation"
      />
    </div>
  </div>
</template>

<script>
import {ACT, GET} from '@/store/types';
import {mapActions, mapGetters} from 'vuex';
import {Annotation} from '@/lib/annotation/types/annotation';
import {TargetAnnotationReference} from '@/lib/annotation/types/target-annotation-reference';
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
      return this[GET.ANNOTATIONS_IN_EDIT].find(annotation => annotation.target[0].annotationId === this.annotationId);
    },
    respondent() {
      return this[GET.USER]();
    },
    ...mapGetters([GET.ANNOTATIONS_IN_EDIT, GET.USER]),
  },
  methods: {
    startEditingAnnotation() {
      this.provisionalAnnotationId = this[ACT.START_EDITING_ANNOTATION](new Annotation({
        target: [new TargetAnnotationReference({annotationId: this.annotationId})],
      }));
    },
    ...mapActions([ACT.CREATE_ANNOTATION, ACT.START_EDITING_ANNOTATION]),
  }
};
</script>
