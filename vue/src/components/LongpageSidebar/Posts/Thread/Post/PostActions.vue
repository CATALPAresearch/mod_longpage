<template>
  <div
    v-if="show"
    class="post-actions"
  >
    <div class="float-left">
      <a
        href="javascript:void(0)"
        role="button"
        @click="togglePostLike"
      >
        <i
          class="icon fa  fa-fw mr-1"
          :class="[postIntern.likedByUser ? 'fa-thumbs-up' : 'fa-thumbs-o-up']"
        />
      </a>
      <span
        :class="{'font-weight-bold': postIntern.likedByUser}"
      >{{ postIntern.likesCount }}</span>
    </div>
    <div
      v-if="post === thread.root"
      class="float-left ml-3"
      role="button"
      @click="toggleRepliesOrReply"
    >
      <a
        href="javascript:void(0)"
        class="text-dark"
      >
        <i class="icon fa fa-comment-o fa-fw mr-1" />
      </a>
      <span v-if="thread.replyCount">{{ thread.replyCount }}</span>
    </div>
    <div
      class="float-left ml-3"
    >
      <a
        href="javascript:void(0)"
        class="text-dark"
        role="button"
        @click="toggleMark"
      >
        <i
          v-if="postIntern.markedByUser"
          class="icon fa fa-star fa-fw m-0"
        />
        <i
          v-else
          class="icon fa fa-star-o fa-fw m-0"
        />
      </a>
    </div>
    <div
      class="float-left ml-3"
    >
      <a
        href="javascript:void(0)"
        class="text-dark"
        role="button"
        @click="toggleSubscription"
      >
        <i
          v-if="postIntern.subscribedByUser"
          class="icon fa fa-bell fa-fw m-0"
        />
        <i
          v-else
          class="icon fa fa-bell-o fa-fw m-0"
        />
      </a>
    </div>
    <div
      class="dropdown"
      style="float: right;"
    >
      <a
        href="javascript:void(0)"
        class="text-dark"
        role="button"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <i class="icon fa fa-ellipsis-h fa-fw m-0" />
      </a>
      <div class="dropdown-menu">
        <a
          v-for="item in dropdownMenuItems"
          :key="item.text"
          class="dropdown-item"
          href="javascript:void(0)"
          role="button"
          @click="item.handler"
        >
          <i
            v-if="item.iconClasses && item.iconClasses.length"
            :class="item.iconClasses"
            class="icon"
          />
          {{ item.text }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import {ACT} from '@/store/types';
import {mapActions} from 'vuex';
import {Post} from '@/types/post';
import {Thread} from '@/types/thread';

export default {
  name: 'PostActions',
  props: {
    post: {type: Post, required: true},
    thread: {type: Thread, required: true},
    show: {type: Boolean, default: true},
  },
  emits: ['edit-clicked', 'toggle-replies'],
  data() {
    return {
      ipost: {
        replyCount: 20,
        markedByUser: true,
        subscribedByUser: false,
      }
    };
  },
  computed: {
    dropdownMenuItems() {
      return [
        {
          iconClasses: ['fa', this.post.readByUser ? 'fa-eye-slash' : 'fa-eye', 'fa-fw'],
          handler: this.togglePostReading,
          text: this.$i18n.t(`post.action.${this.post.readByUser ? 'markAsUnread' : 'markAsRead'}`),
        },
        {iconClasses: ['fa', 'fa-pencil', 'fa-fw'], handler: this.openEditor, text: this.$i18n.t('post.action.edit')},
        {iconClasses: ['fa', 'fa-trash', 'fa-fw'], handler: this.deletePost, text: this.$i18n.t('post.action.delete')},
      ];
    },
    postIntern() {
      return this.post;
    },
  },
  methods: {
    ...mapActions([
      ACT.CREATE_POST,
      ACT.DELETE_POST,
      ACT.TOGGLE_POST_LIKE,
      ACT.TOGGLE_POST_READING,
    ]),
    deletePost() {
      this[ACT.DELETE_POST](this.post);
    },
    openEditor() {
      this.$emit('edit-clicked');
    },
    toggleMark() {
      this.ipost.markedByUser = !this.ipost.markedByUser;
    },
    togglePostLike() {
      this[ACT.TOGGLE_POST_LIKE]({postId: this.post.id, threadId: this.post.threadId});
    },
    togglePostReading() {
      this[ACT.TOGGLE_POST_READING]({postId: this.post.id, threadId: this.post.threadId});
    },
    toggleRepliesOrReply() {
      this.$emit('toggle-replies');
      if (!this.thread.replyCount) this[ACT.CREATE_POST]({threadId: this.thread.id});
    },
    toggleSubscription() {
      this.ipost.subscribedByUser = !this.ipost.subscribedByUser;
    },
  }
};
</script>
