<template>
  <a
    :href="profile"
  >
    <img
      :src="picture"
      class="userpicture"
      width="35"
      height="35"
      :alt="$t('annotationCard.authorPictureAlt', {name})"
      :title="$t('annotationCard.authorPictureAlt', {name})"
    >
  </a>
</template>

<script>
  export default {
  name: 'Avatar',
    props: {
      profile: {type: String},
      picture: {type: String},
      name: {type: String},
    }
  };
</script>
