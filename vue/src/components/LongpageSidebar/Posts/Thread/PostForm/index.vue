<template>
  <div
    v-if="show"
    class="text-right"
  >
    <post-form-input
      v-model="postUpdate.content"
      @cancel="cancel"
      @submit="createOrUpdatePost"
    />
    <button
      type="button"
      class="btn btn-sm btn-secondary ml-2 my-2"
      @click="cancel"
    >
      <i class="icon fa fa-fw fa-times m-0" />
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
          @click="selectedSaveAction = action; createOrUpdatePost()"
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
import {mapActions, mapGetters, mapMutations} from 'vuex';
import {cloneDeep} from 'lodash';
import {Post} from '@/types/post';
import PostFormInput from '@/components/LongpageSidebar/Posts/Thread/PostForm/PostFormInput';
import {SAVE_ACTIONS} from '@/config/constants';
import {Thread} from '@/types/thread';

export default {
  name: 'PostForm',
  components: {PostFormInput},
  props: {
    show: {type: Boolean, default: false},
    post: {type: Post, required: true},
    thread: {type: Thread, required: true},
  },
  emits: ['update:show'],
  data() {
    return {
      postUpdate: null,
      selectedSaveActionInternal: SAVE_ACTIONS[0],
    };
  },
  computed: {
    ...mapGetters([GET.ANNOTATION]),
    saveActions() {
      return SAVE_ACTIONS.filter(
          ({key}) => key !== 'save' || this.post === this.thread.root && (!this.post.created || !this.post.isPublic)
      );
    },
    selectedSaveAction: {
      get() {
        if (this.postUpdate.anonymous) return this.saveActions[1];
        if (this.postUpdate.isPublic) return this.saveActions[0];
        return this.saveActions[2];
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
    this.postUpdate.isPublic = this.thread.isPublic;
  },
  methods: {
    ...mapActions([
      ACT.CREATE_ANNOTATION,
      ACT.CREATE_POST,
      ACT.UPDATE_POST,
    ]),
    ...mapMutations([
      MUTATE.REMOVE_ANNOTATIONS,
      MUTATE.REMOVE_POSTS_FROM_THREAD,
      MUTATE.REMOVE_THREADS,
    ]),
    cancel() {
      if (!this.thread.created) {
        this[MUTATE.REMOVE_THREADS]([this.thread]);
        this[MUTATE.REMOVE_ANNOTATIONS]([this[GET.ANNOTATION](this.thread.annotationId)]);
      } else if (!this.post.created) {
        this[MUTATE.REMOVE_POSTS_FROM_THREAD]({threadId: this.thread.id, posts: [this.post]});
      }
      this.closeForm();
    },
    closeForm() {
      this.$emit('update:show');
    },
    async createOrUpdatePost() {
      if (!this.postUpdate.content) return;

      if (this.post.created) this[ACT.UPDATE_POST](this.postUpdate);
      else this[ACT.CREATE_POST](this.postUpdate);
      this.closeForm();
    },
  }
};
</script>
