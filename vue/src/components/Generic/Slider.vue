<template>
  <div>
    <span class="mr-3">
      {{ sliderOptions.formatter ? sliderOptions.formatter(sliderOptions.min) : sliderOptions.min }}
    </span>
    <input
      :id="inputId"
      ref="input"
      type="text"
    >
    <span class="ml-3">
      {{ sliderOptions.formatter ? sliderOptions.formatter(sliderOptions.max) : sliderOptions.max }}
    </span>
  </div>
</template>

<script>
  import Slider from 'bootstrap-slider';
  import {uniqueId} from 'lodash';
  import {toIdSelector} from '@/util/style';

  export default {
    name: 'Slider',
    props: {
      sliderOptions: {type: Object, required: true},
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
      async sliderOptions(options) {
        await this.initSliderPromise;
        Object.entries(options).forEach(([key, value]) => {
          this.slider.setAttribute(key, value);
        });
        this.slider.refresh({useCurrentValue: true});
      }
    },
    async mounted() {
      this.initSlider();
    },
    methods: {
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
