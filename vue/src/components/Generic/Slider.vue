<template>
  <div class="row">
    <div class="col-auto pr-0">
      {{ sliderOptions.formatter ? sliderOptions.formatter(sliderOptions.min) : sliderOptions.min }}
    </div>
    <div class="col">
      <input
        :id="inputId"
        ref="input"
        :style="{width: '100%'}"
        type="text"
      >
    </div>
    <div class="col-auto pl-0">
      {{ sliderOptions.formatter ? sliderOptions.formatter(sliderOptions.max) : sliderOptions.max }}
    </div>
  </div>
</template>

<script>
  import Slider from 'bootstrap-slider';
  import {debounce, uniqueId} from 'lodash';
  import {toIdSelector} from '@/util/style';

  export default {
    name: 'Slider',
    props: {
      modelValue: {type: Array, required: true},
      sliderOptions: {type: Object, required: true},
    },
    emits: ['update:modelValue'],
    data() {
      return {
        emitDebounced: () => {},
        inputId: uniqueId('slider-input-'),
        sliderId: uniqueId('slider-'),
        slider: null,
        initSliderPromise: null,
      };
    },
    watch: {
      sliderOptions: {
        async handler(options) {
          await this.initSliderPromise;
          Object.entries(options).forEach(([key, value]) => {
            this.slider.setAttribute(key, value);
          });
          this.slider.refresh({useCurrentValue: true});
          this.slider.on('change', ({newValue}) => {
            this.emitDebounced(newValue);
          });
        },
        deep: true,
      },
    },
    async mounted() {
      this.initSlider();
      this.emitDebounced = debounce(newValue => {
        this.$emit('update:modelValue', newValue);
      }, 500);
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
              this.slider.on('change', ({newValue}) => {
                this.emitDebounced(newValue);
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

  .slider.slider-horizontal {
    width: 30%;
  }
</style>
