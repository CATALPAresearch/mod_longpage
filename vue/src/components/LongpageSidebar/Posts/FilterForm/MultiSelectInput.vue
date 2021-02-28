<template>
  <div class="dropdown">
    <div
      class="input-group"
      data-toggle="dropdown"
    >
      <input
        id="multi-select-input"
        type="text"

        class="form-control"
      >
      <div
        class="input-group-append"
      >
        <button
          type="button"
          class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <span class="sr-only">{{ $t('generic.toggleDropdown') }}</span>
        </button>
      </div>
    </div>
    <div class="dropdown-menu">
      <div
        v-for="(options, category) in optionsByCategory"
        :key="category"
      >
        <h6 class="dropdown-header">
          {{ category }}
        </h6>
        <a
          v-for="option in options"
          :key="option.value"
          class="dropdown-item"
          href="#"
        >{{ option.text }}</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MultiSelectInput',
  props: {
    value: [],
    options: {type: Array, default: () => [
        {value: 0, text: 'Ann Kathrin', category: 'Lehrer'},
        {value: 1, text: 'Jens', category: 'Student'},
        {value: 2, text: 'Jürgen', category: 'Student'},
        {value: 3, text: 'Jochen', category: 'Lehrer'},
        {value: 4, text: 'Jana', category: 'Student'},
        {value: 5, text: 'A'},
      ]}, // Value, category, text
  },
  data() {
    return {
      mounted: false,
    };
  },
  computed: {
    defaultCategory() {
      return this.$i18n.t('generic.defaultSelectOptionsCategory');
    },
    optionsByCategory() {
      return this.options.reduce((result, option) => {
        const category = option.category || this.defaultCategory;
        if (!result[category]) result[category] = [];
        result[category].push(option);
        return result;
      }, {});
    },
    refMultiSelectInput() {
      console.log(this.$refs.multiSelectInput);
      console.log(this.$refs);
      return this.mounted ? this.$refs.multiSelectInput : undefined;
    }
  },
  watch: {

  },
  mounted() {
    this.mounted = true;
  },
  methods: {

  }
};
</script>
