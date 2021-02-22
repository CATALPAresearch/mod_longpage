<template>
  <textarea
    ref="contentInput"
    :value="modelValue"
    class="form-control"
    :placeholder="$t('post.form.bodyTextareaPlaceholder')"
    rows="3"
    @click.stop=""
    @input="$emit('update:modelValue', $event.target.value)"
    v-on="$attrs"
  />
</template>

<script>
import autosize from 'autosize';

export default {
  name: 'PostFormInput',
  inheritAttrs: false,
  props: {
    modelValue: {type: String, required: true},
  },
  emits: ['update:modelValue'],
  mounted() {
    this.$nextTick(
        () => {
          this.$refs.contentInput.focus();
          autosize(this.$refs.contentInput);
        }
    );
  },
  beforeUnmount() {
    autosize.destroy(this.$refs.contentInput);
  },
};
</script>
