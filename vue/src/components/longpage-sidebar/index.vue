<template>
  <div
    id="longpage-sidebar"
    class="h-100 row"
  >
    <div
      id="longpage-sidebar-tab-content"
      class="tab-content col"
    >
      <div
        v-for="item in items"
        :id="item.id"
        :key="item.key"
        class="tab-pane fade show"
        role="tabpanel"
      >
        Tab content
      </div>
    </div>
    <div
      id="lonpage-sidebar-tab"
      class="col-auto border-left p-0 h-100 nav flex-column nav-pills"
      role="tablist"
      aria-orientation="vertical"
    >
      <a
        v-for="item in items"
        :key="item.key"
        class="nav-link"
        data-toggle="pill"
        role="tab"
        :href="`#${item.id}`"
      >
        <i :class="item.icon" />
      </a>
    </div>
  </div>
</template>

<script>
// Aria-labelledby, active

export default {
  name: 'LongpageSidebar',
  data() {
    return {
      items: [
        {key: 'annotations', id: 'tab-annotations', icon: ['fa', 'fa-comment']},
        {key: 'tableOfContent', id: 'tab-table-of-contents', icon: ['fa', 'fa-list']},
        {key: 'search', id: 'tab-search', icon: ['fa', 'fa-search']},
      ]
    };
  }
};
</script>
