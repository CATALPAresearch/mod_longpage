<template>
  <div v-if="sliderOptions && sliderOptions">
    <span class="mr-3">{{ sliderOptions.formatter(sliderOptions.value[0]) }}</span>
    <input
      :id="inputId"
      ref="input"
      type="text"
    >
    <span class="ml-3">{{ sliderOptions.formatter(sliderOptions.value[1]) }}</span>
  </div>
</template>

<script>
  import Slider from 'bootstrap-slider';
  import {uniqueId} from 'lodash';
  import {toIdSelector} from '@/util/style';

  export default {
    name: 'Slider',
    props: {
      sliderOptions: {type: Object},
    },
    data() {
      return {
        inputId: uniqueId('slider-input-'),
        sliderId: uniqueId('slider-'),
        slider: null,
        initSliderPromise: null,
      };
    },
    watch: {
      async sliderOptions() {
        await this.destroySlider();
        this.initSlider();
      }
    },
    async mounted() {
      this.initSlider();
    },
    methods: {
      async destroySlider() {
        await this.initSliderPromise;
        this.slider.destroy();
        return new Promise((resolve) => {
          const mutationObserver = new MutationObserver(() => {
            if (!document.querySelector(toIdSelector(this.sliderId))) {
              mutationObserver.disconnect();
              resolve();
            }
          });
          mutationObserver.observe(document, {
            attributes: false,
            childList: true,
            characterData: false,
            subtree: true,
          });
        });
      },
      initSlider() {
        this.initSliderPromise = new Promise((resolve) => {
          const mutationObserver = new MutationObserver(() => {
            if (this.$refs.input && this.$refs.input.id === this.inputId) {
              mutationObserver.disconnect();
              this.slider = new Slider(toIdSelector(this.inputId), {
                id: this.sliderId,
                range: true,
                ...(this.sliderOptions || {}),
              });
              resolve();
            }
          });
          mutationObserver.observe(document, {
            attributes: true,
            childList: true,
            characterData: false,
            subtree: true,
            attributeFilter: ['id'],
          });
        });
      },
    }
  };
</script>

<style lang="scss">
  @import '~bootstrap-slider/dist/css/bootstrap-slider.min.css';

  .slider-selection {
    background: #036fa5;
  }
</style>
