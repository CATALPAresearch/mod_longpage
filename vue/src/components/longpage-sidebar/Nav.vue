<template />

<script>
// Active class, aria-controls="v-pills-home", aria-selected="true", fa-1-5, fontawesome-icon for comment
// Required

export default {
  name: 'LongpageSidebarNav',
  props: {
    items: {
      type: Array,
      default: () => [
        {key: 'annotations', href: '#', icon: ['fa', 'fa-comment']},
        {key: 'tableOfContent', href: '#', icon: ['fa', 'fa-list']},
        {key: 'search', href: '#', icon: ['fa', 'fa-search']},
      ]
    }
  }
};
</script>
