<template>
  <div class="dropdown">
    <div
      class="input-group"
      data-toggle="dropdown"
    >
      <input
        id="multi-select-input"
        v-model="query"
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
    <div class="dropdown-menu px-2 overflow-auto">
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
            v-model="value"
            class="form-check-input"
            type="checkbox"
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
import Fuse from 'fuse.js';
import {set, without} from 'lodash';

const mapResultToHighlightedDoc = ({item, matches}, hlStartTag = '<b>', hlEndTag = '</b>') => ({
  ...item,
  ...matches.reduce((itemHighlighted, {indices, value, key}) => {
    let currentValueIndex = 0;
    return set(itemHighlighted, key, indices.reduce((highlight, [startIdx, endIdx], i) => {
      const result = [
        highlight,
        value.slice(currentValueIndex, startIdx),
        hlStartTag,
        value.slice(startIdx, endIdx + 1),
        hlEndTag,
      ].join('');
      currentValueIndex = endIdx + 1;
      return i === indices.length - 1 ? [result, value.slice(currentValueIndex)].join('') : result;
    }, ''));
  }, {}),
});

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
    modelValue: {type: Array, default: () => []},
    options: {type: Array, default: () => [
        {value: 0, text: 'Ann Kathrin', category: 'Lehrer'},
        {value: 1, text: 'Jens', category: 'Student'},
        {value: 2, text: 'Jürgen', category: 'Student'},
        {value: 3, text: 'Jochen', category: 'Lehrer'},
        {value: 4, text: 'Jana', category: 'Student'},
        {value: 5, text: 'A'},
      ]},
  },
  data() {
    return {
      mounted: false,
      fuse: null,
      query: '',
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
        this.$emit(
            'update:modelValue',
            this.modelValue.includes(value) ? without(this.modelValue, value) : [...this.modelValue, value],
        );
      }
    },
  },
  watch: {
    options: {
      handler(value) {
        if (!value || !value.length) return;

        this.fuse = new Fuse(value, FUSE_OPTIONS);
      },
      immediate: true,
    },
  },
  mounted() {
    this.mounted = true;
  },
};
</script>
