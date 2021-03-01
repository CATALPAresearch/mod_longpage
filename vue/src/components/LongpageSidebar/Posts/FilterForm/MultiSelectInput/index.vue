<template>
  <div class="dropdown">
    <div
      class="input-group"
      data-toggle="dropdown"
    >
      <input
        ref="multiSelectInput"
        type="text"
        class="form-control tagin"
        @change="valueAsString = $event.target.value"
        @queryinput="query = $event.detail.value"
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
    <div
      class="dropdown-menu px-2 overflow-auto"
    >
      <div
        v-for="(options, category) in optionsByCategory"
        :key="category"
      >
        <h6
          class="dropdown-header"
          v-html="category"
        />
        <div
          v-for="option in options"
          :key="option.value"
          class="form-group px-4"
        >
          <input
            id="defaultCheck1"
            :checked="value.includes(option.value)"
            class="form-check-input"
            type="checkbox"
            @change="toggleOption(option.value)"
          >
          <label
            class="form-check-label"
            for="defaultCheck1"
            v-html="option.text"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {compact, without} from 'lodash';
import Fuse from 'fuse.js';
import {mapResultToHighlightedDoc} from '@/util/fuse';
import {tagin} from './tagin';

const FUSE_OPTIONS = Object.freeze({
  includeMatches: true,
  keys: [
    'text',
    'category',
  ],
  threshold: 0.4,
});

export default {
  name: 'MultiSelectInput',
  props: {
    modelValue: {type: Array, default: () => [0, 4]},
    options: {type: Array, default: () => [
        {value: 0, text: 'Ann Kathrin', category: 'Lehrer'},
        {value: 1, text: 'Jens', category: 'Student'},
        {value: 2, text: 'Jürgen', category: 'Student'},
        {value: 3, text: 'Jochen', category: 'Lehrer'},
        {value: 4, text: 'Jana', category: 'Student'},
        {value: 5, text: 'A'},
      ]},
  },
  emits: ['update:modelValue'],
  data() {
    return {
      mounted: false,
      fuse: null,
      query: '',
      valueSeperator: ',',
    };
  },
  computed: {
    defaultCategory() {
      return this.$i18n.t('generic.defaultSelectOptionsCategory');
    },
    filteredOptions() {
      if (!this.query) return this.options;

      return this.fuse.search(this.query).map(result => mapResultToHighlightedDoc(result));
    },
    optionsByCategory() {
      return this.filteredOptions.reduce((result, option) => {
        const category = option.category || this.defaultCategory;
        if (!result[category]) result[category] = [];
        result[category].push(option);
        return result;
      }, {});
    },
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
    valueAsString: {
      get() {
        return this.value.join(this.valueSeperator);
      },
      set(value) {
        this.value = compact(value.split(this.valueSeperator)).map(Number);
      }
    },
  },
  watch: {
    options: {
      handler(value) {
        if (this.$refs.multiSelectInput) this.$refs.multiSelectInput._selectOptions = value;
        if (!value || !value.length) return;

        this.fuse = new Fuse(value, FUSE_OPTIONS);
      },
      immediate: true,
    },
    valueAsString(value) {
      this.$refs.multiSelectInput.value = value;
      this.$refs.multiSelectInput.dispatchEvent(new CustomEvent('update-tags'));
    },
  },
  mounted() {
    this.mounted = true;
    this.$refs.multiSelectInput._selectOptions = this.options;
    this.$refs.multiSelectInput.value = this.valueAsString;
    tagin(this.$refs.multiSelectInput, {separator: this.valueSeperator});
  },
  methods: {
    toggleOption(value) {
      if (this.value.includes(value)) this.value = without(this.value, value);
      else this.value = [...this.value, value];
      this.$refs.multiSelectInput.dispatchEvent(new CustomEvent('update-query', {detail: {value: ''}}));
    },
  }
};
</script>

<style lang="scss">
  @import '~tagin/dist/css/tagin.min.css';
</style>
