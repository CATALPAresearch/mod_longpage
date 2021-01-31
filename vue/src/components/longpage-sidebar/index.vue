<template>
  <div
    id="longpage-sidebar"
    class="row no-gutters vh-100-wo-nav mw-75"
  >
    <div
      id="longpage-sidebar-tab-content"
      class="tab-content col h-100"
    >
      <component
        :is="components[item.key]"
        v-for="item in items"
        :id="item.id"
        :key="item.key"
        class="tab-pane fade show"
        role="tabpanel"
      />
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
import AnnotationSidebar from '@/components/annotation/AnnotationSidebar';

export default {
  name: 'LongpageSidebar',
  data() {
    return {
      items: [
        {key: 'annotations', id: 'tab-annotations', icon: ['fa', 'fa-comment']},
        {key: 'tableOfContent', id: 'tab-table-of-contents', icon: ['fa', 'fa-list']},
        {key: 'search', id: 'tab-search', icon: ['fa', 'fa-search']},
      ],
      components: {
        annotations: AnnotationSidebar,
      },
    };
  }
};
</script>
