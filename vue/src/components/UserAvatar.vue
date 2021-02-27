<template>
  <a>
    <img
      :src="avatar.src"
      class="userpicture avatar"
      height="35"
      width="35"
      :alt="avatar.alt"
      :title="avatar.alt"
    >
  </a>
</template>

<script>
  export default {
  name: 'UserAvatar',
    props: {
      user: {type: Object},
    },
    computed: {
      avatar() {
        return this.user ? {
          src: this.user.profileimage,
          alt: this.$i18n.tc('avatar.alt', 2, {fullName: this.user.fullname})
        } : {
          alt: this.$i18n.tc('avatar.alt', 1),
          src: M.util.image_url('user-secret-avatar', 'mod_page'),
        };
      },
    }
  };
</script>
