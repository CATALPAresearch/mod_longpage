<template>
  <div class="row no-gutters align-items-center">
    <div class="col col-auto p-0">
      <user-avatar
        :name="respondent.name"
        :picture="respondent.picture"
        :profile="respondent.profile"
      />
    </div>
    <div class="col p-0">
      <div class="input-group">
        <textarea
          :id="inputId"
          v-model="responseBody"
          class="form-control"
          placeholder="Antworte"
          rows="1"
          @keydown.enter.meta="onSubmit"
        />
        <div class="input-group-append">
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="onSubmit"
          >
            <font-awesome-icon icon="paper-plane" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ACT, GET} from '@/store/types';
import {Annotation} from '@/lib/annotation/types/annotation';
import autosize from 'autosize';
import {mapActions, mapGetters} from 'vuex';
import {toIdSelector} from '@/util/style';
import UserAvatar from '@/components/UserAvatar';
import {TargetAnnotationReference} from '@/lib/annotation/types/target-annotation-reference';

export default {
  name: 'ResponseForm',
  components: {
    UserAvatar,
  },
  props: {
    annotationId: {type: Number, required: true},
    respondent: {type: Object, required: true},
  },
  data() {
    return {
      responseBody: '',
    };
  },
  computed: {
    inputId() {
      return `annotation-response-input-${this.annotationId}`;
    },
    textareaHTMLElement() {
      return document.querySelector(toIdSelector(this.inputId));
    },
    ...mapGetters([GET.LONGPAGE_CONTEXT]),
  },
  mounted() {
    autosize(this.textareaHTMLElement);
  },
  beforeUnmount() {
    autosize.destroy(this.textareaHTMLElement);
  },
  methods: {
    createResponse() {
      const response = new Annotation({
        body: this.responseBody,
        pageId: this[GET.LONGPAGE_CONTEXT].pageId,
        target: [new TargetAnnotationReference({annotationId: this.annotationId})],
        userId: this[GET.LONGPAGE_CONTEXT].userId,
      });
      this[ACT.CREATE_ANNOTATION](response);
    },
    onSubmit() {
      this.createResponse();
      this.reset();
    },
    reset() {
      this.responseBody = '';
    },
    ...mapActions([ACT.CREATE_ANNOTATION]),
  }
};
</script>
