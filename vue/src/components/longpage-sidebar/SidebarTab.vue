<template>
  <div class="h-100 bg-white">
    <div class="h-100 d-flex flex-column">
      <div
        v-if="title"
        class="p-3 bg-white"
      >
        <h3
          class="m-0 tab-title"
        >
          {{ title }}
        </h3>
      </div>
      <hr
        v-if="title"
        class="my-0 mx-3"
      >
      <div
        class="p-3 flex-shrink-1 flex-grow-1 overflow-y-auto overflow-x-hidden"
      >
        <slot name="body" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarTab',
  props: {
    title: {type: String}
  },
};
</script>
