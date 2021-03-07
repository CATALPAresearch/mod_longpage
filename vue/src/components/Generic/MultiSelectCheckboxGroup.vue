<template>
  <div
    v-for="option in options"
    :key="option.id"
    class="form-check form-check-inline mr-3"
  >
    <input
      :id="option.id"
      class="form-check-input"
      type="checkbox"
      :value="modelValue.includes(option.value)"
      @input="toggleOption(option.value)"
    >
    <label
      class="form-check-label"
      :for="option.id"
    >
      <i
        class="icon fa fa-fw m-0"
        :class="option.iconClasses"
      />
      {{ option.text }}
    </label>
  </div>
</template>

<script>
  export default {
    name: 'MultiSelectCheckboxGroup',
    props: {
      modelValue: {type: Array, default: () => []},
      options: {type: Array, default: () => []},
    },
    emits: ['update:modelValue'],
    methods: {
      toggleOption(value) {
        this.$emit(
            'update:modelValue',
            this.modelValue.includes(value) ? this.modelValue.filter(mv => mv !== value) : [...this.modelValue, value],
        );
      }
    },
  };
</script>
