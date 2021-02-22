<template>
  <div
    v-if="show"
    class="text-right"
  >
    <textarea
      ref="contentInput"
      v-model="postUpdate.content"
      class="form-control"
      :placeholder="$t('post.form.bodyTextareaPlaceholder')"
      rows="3"
      @click.stop=""
      @keydown.enter.meta.exact="createOrUpdatePost"
      @keydown.esc.exact="cancel"
    />
    <button
      type="button"
      class="btn btn-sm btn-secondary ml-2 my-2"
      @click="cancel"
    >
      <font-awesome-icon
        class="ml-1"
        icon="times"
      />
      {{ $t('post.form.action.cancel') }}
    </button>
    <div
      class="btn-group ml-2 my-2"
      role="group"
    >
      <button
        type="button"
        class="btn btn-primary btn-sm"
        @click="createOrUpdatePost"
      >
        <i
          class="icon fa fa-fw m-0"
          :class="selectedSaveAction.iconClasses"
        />
        {{ $t(`post.form.action.${selectedSaveAction.key}`) }}
      </button>
      <button
        type="button"
        class="btn btn-outline-primary btn-sm dropdown-toggle dropdown-toggle-split"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <span class="sr-only">{{ $t('generic.toggleDropdown') }}</span>
      </button>
      <div class="dropdown-menu">
        <a
          v-for="action in saveActions"
          :key="action.key"
          class="dropdown-item"
          href="javascript:void(0)"
          @click="selectedSaveAction = action; createOrUpdatePost"
        >
          <i
            class="icon fa fa-fw"
            :class="action.iconClasses"
          />
          {{ $t(`post.form.action.${action.key}`) }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import {ACT, GET, MUTATE} from '@/store/types';
import autosize from 'autosize';
import {cloneDeep} from 'lodash';
import {mapActions, mapGetters, mapMutations} from 'vuex';
import {Post} from '@/types/post';
import {Thread} from '@/types/thread';

const SAVE_ACTIONS = [
  {key: 'publish', iconClasses: ['fa-users']},
  {key: 'publishAnonymously', iconClasses: ['fa-user-secret']},
  {key: 'save', iconClasses: ['fa-lock']},
];

export default {
  name: 'PostForm',
  props: {
    show: {type: Boolean, default: false},
    post: {type: Post, required: true},
    thread: {type: Thread, required: true},
  },
  data() {
    return {
      postUpdate: null,
      saveActions: SAVE_ACTIONS,
      selectedSaveActionInternal: SAVE_ACTIONS[0],
    };
  },
  emit: ['update:show'],
  computed: {
    ...mapGetters([GET.ANNOTATION]),
    selectedSaveAction: {
      get() {
        return this.selectedSaveActionInternal;
      },
      set(action) {
        this.postUpdate.anonymous = action.key === 'publishAnonymously';
        this.postUpdate.isPublic = action.key !== 'save';
        this.selectedSaveActionInternal = action;
      }
    },
  },
  mounted() {
    this.postUpdate = cloneDeep(this.post);
    this.$nextTick(
        () => {
          this.$refs.contentInput.focus();
          autosize(this.$refs.contentInput);
        }
    );
  },
  beforeUnmount() {
    autosize.destroy(this.$refs.contentInput);
  },
  methods: {
    ...mapActions([
      ACT.CREATE_ANNOTATION,
      ACT.CREATE_POST,
      ACT.UPDATE_POST,
    ]),
    ...mapMutations([
      MUTATE.REMOVE_ANNOTATIONS,
      MUTATE.REMOVE_THREADS,
    ]),
    cancel() {
      this[MUTATE.REMOVE_THREADS]([this.thread]);
      this[MUTATE.REMOVE_ANNOTATIONS]([this[GET.ANNOTATION](this.thread.annotationId)]);
      this.closeForm();
    },
    closeForm() {
      this.$emit('update:show');
    },
    async createOrUpdatePost() {
      if (this.post.created) this[ACT.UPDATE_POST](this.postUpdate);
      this[ACT.CREATE_POST](this.postUpdate);
      this.closeForm();
    },
  }
};
</script>
