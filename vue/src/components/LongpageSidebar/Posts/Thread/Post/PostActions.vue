<template>
  <div
    v-if="show"
    class="post-actions"
  >
    <div class="float-left">
      <a
        href="javascript:void(0)"
        role="button"
        :class="{'disabled': userIsCreator}"
        @click="togglePostLike"
      >
        <i
          class="icon fa fa-fw mr-1"
          :class="[postIntern.likedByUser ? 'fa-thumbs-up' : 'fa-thumbs-o-up']"
        />
      </a>
      <span
        class="mr-1"
        :class="{'font-weight-bold': postIntern.likedByUser, 'text-primary': postIntern.likedByUser}"
      >{{ postIntern.likesCount }}</span>
    </div>
    <div
      v-if="post === thread.root && post.isPublic"
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
        @click="toggleBookmark"
      >
        <i
          class="icon fa fa-fw m-0"
          :class="[post.bookmarkedByUser ? 'fa-star' : 'fa-star-o']"
        />
      </a>
    </div>
    <div
      v-if="thread.root.id === post.id && thread.isPublic"
      class="float-left ml-3"
    >
      <a
        href="javascript:void(0)"
        class="text-dark"
        role="button"
        @click="toggleThreadSubscription"
      >
        <i
          class="icon fa fa-fw m-0"
          :class="[thread.subscribedToByUser ? 'fa-bell' : 'fa-bell-o']"
        />
      </a>
    </div>
    <div
      v-if="dropdownMenuItems && dropdownMenuItems.length"
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
import {ACT, GET} from '@/store/types';
import {mapActions, mapGetters} from 'vuex';
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
  computed: {
    ...mapGetters([GET.USER]),
    dropdownMenuItems() {
      const items = [];
      if (this.post.id !== this.thread.root.id) {
        if (this.thread.subscribedToByUser) {
          items.push({
            iconClasses: ['fa', 'fa-bell-o', 'fa-fw'],
            handler: this.toggleThreadSubscription,
            text: this.$i18n.t('post.action.unsubscribe'),
          });
        } else {
          items.push({
            iconClasses: ['fa', 'fa-bell', 'fa-fw'],
            handler: this.toggleThreadSubscription,
            text: this.$i18n.t('post.action.subscribe'),
          });
        }
      }
      if (this.userIsCreator) {
        items.push({
          iconClasses: ['fa', 'fa-pencil', 'fa-fw'],
          handler: this.openEditor,
          text: this.$i18n.t('post.action.edit'),
        });

        if (this.postIsLastPostInThread) {
          items.push({
            iconClasses: ['fa', 'fa-trash', 'fa-fw'],
            handler: this.deletePost,
            text: this.$i18n.t('post.action.delete'),
          });
        }
      } else {
        items.push({
          iconClasses: ['fa', this.post.readByUser ? 'fa-eye-slash' : 'fa-eye', 'fa-fw'],
          handler: this.togglePostReading,
          text: this.$i18n.t(`post.action.${this.post.readByUser ? 'markAsUnread' : 'markAsRead'}`),
        });
      }

      return items;
    },
    postIntern() {
      return this.post;
    },
    postIsLastPostInThread() {
      return this.thread.lastPost.id === this.post.id;
    },
    userIsCreator() {
      return this[GET.USER]() && this[GET.USER]().id === this.post.creatorId;
    }
  },
  methods: {
    ...mapActions([
      ACT.CREATE_POST,
      ACT.DELETE_POST,
      ACT.TOGGLE_POST_BOOKMARK,
      ACT.TOGGLE_POST_LIKE,
      ACT.TOGGLE_POST_READING,
      ACT.TOGGLE_THREAD_SUBSCRIPTION,
    ]),
    deletePost() {
      this[ACT.DELETE_POST](this.post);
    },
    openEditor() {
      this.$emit('edit-clicked');
    },
    toggleBookmark() {
      this[ACT.TOGGLE_POST_BOOKMARK]({postId: this.post.id, threadId: this.post.threadId});
    },
    togglePostLike() {
      if (!this.userIsCreator) this[ACT.TOGGLE_POST_LIKE]({postId: this.post.id, threadId: this.post.threadId});
    },
    togglePostReading() {
      this[ACT.TOGGLE_POST_READING]({postId: this.post.id, threadId: this.post.threadId});
    },
    toggleRepliesOrReply() {
      this.$emit('toggle-replies');
      if (!this.thread.replyCount) this[ACT.CREATE_POST]({threadId: this.thread.id});
    },
    toggleThreadSubscription() {
      this[ACT.TOGGLE_THREAD_SUBSCRIPTION](this.post.threadId);
    },
  }
};
</script>
