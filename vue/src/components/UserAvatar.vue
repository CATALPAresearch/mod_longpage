<template>
  <a
    :href="profile"
  >
    <img
      :src="profileImage"
      class="userpicture"
      width="35"
      height="35"
      :alt="$t('annotationCard.authorPictureAlt', {fullname})"
      :title="$t('annotationCard.authorPictureAlt', {fullname})"
    >
  </a>
</template>

<script>
  export default {
  name: 'Avatar',
    props: {
      profile: {type: String, default: '#'},
      profileImage: {type: String, required: true},
      fullname: {type: String, required: true},
    }
  };
</script>
