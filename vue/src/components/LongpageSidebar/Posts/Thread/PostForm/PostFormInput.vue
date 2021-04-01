<template>
  <textarea
    ref="contentInput"
    :value="modelValue"
    class="form-control"
    :placeholder="$t('post.form.bodyTextareaPlaceholder')"
    rows="3"
    @click.stop=""
    @input="$emit('update:modelValue', $event.target.value)"
    @keydown.enter.ctrl.exact.prevent="$emit('submit')"
    @keydown.esc.exact.prevent="$emit('submit')"
  />
</template>

<script>
import autosize from 'autosize';

export default {
  name: 'PostFormInput',
  props: {
    modelValue: {type: String, required: true},
  },
  emits: ['update:modelValue', 'submit'],
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
