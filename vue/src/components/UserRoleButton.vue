<template>
  <a
    :href="href"
    class="btn btn-outline-primary btn-sm"
    role="button"
    aria-disabled="true"
  >{{ role }}</a>
</template>

<script>
  export default {
  name: 'UserRoleButton',
    props: {
      role: {type: String, required: true},
      href: {type: String},
    }
  };
</script>
