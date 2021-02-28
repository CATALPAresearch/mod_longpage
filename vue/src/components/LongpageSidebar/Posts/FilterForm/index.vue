<template>
  <div>
    <h4 class="mb-2">
      Filter
    </h4>
    <div class="mb-2">
      <div class="input-group">
        <input
          type="text"
          class="form-control"
          placeholder="Anmerkungstext durchsuchen"
        >
        <div class="input-group-append">
          <button
            class="btn btn-secondary"
            type="button"
          >
            <i class="icon fa fa-search fa-fw mr-1" />
          </button>
        </div>
      </div>
    </div>
    <div class="mb-2 row">
      <h6 class="d-inline col-auto">
        Status
      </h6>
      <div class="col-auto">
        <div class="form-check form-check-inline mr-3">
          <input
            id="defaultCheck1"
            class="form-check-input"
            type="checkbox"
          >
          <label
            class="form-check-label"
            for="defaultCheck1"
          >
            Gelesen
            <i
              class="icon fa fa-eye fa-fw"
            />
          </label>
        </div>
        <div class="form-check form-check-inline mr-3">
          <input
            id="defaultCheck2"
            class="form-check-input"
            type="checkbox"
          >
          <label
            class="form-check-label"
            for="defaultCheck2"
          >
            Noch nicht gelesen
            <i
              class="icon fa fa-eye-slash fa-fw"
            />
          </label>
        </div>
      </div>
    </div>
    <div
      class="mb-2 row"
    >
      <h6 class="d-inline mr-3 col-auto">
        Erstellt zwischen
      </h6>
      <slider :slider-options="timesCreatedSliderOptions" />
    </div>
    <div class="mb-2">
      <h5>AutorIn</h5>
      <input>
    </div>
  </div>
</template>

<script>
  import {isEmpty, last} from 'lodash';
  import {GET} from '@/store/types';
  import {mapGetters} from 'vuex';
  import Slider from '@/components/Generic/Slider';
  import {getDateFormat} from '@/config/i18n/date-time-utils';

  export default {
    name: 'FilterForm',
    components: {Slider},
    computed: {
      ...mapGetters([GET.POSTS]),
      timesCreatedMinMax() {
        const timesCreated =
            this[GET.POSTS].filter(p => p.created).map(({timeCreated}) => timeCreated.getTime()).sort((tA, tB) => tA - tB) || [];
        return isEmpty(timesCreated) ? [0, Date.now()] : [timesCreated[0], last(timesCreated)];
      },
      timesCreatedSliderOptions() {
        if (isEmpty(this[GET.POSTS])) return;

        const [min, max] = this.timesCreatedMinMax;
        const format = time => this.$i18n.d.call(this.$i18n, time, getDateFormat(time));
        return {
          min,
          max,
          value: [min, max],
          formatter: value => Array.isArray(value) ? value.map(v => format(v)) : format(value),
        };
      },
    },
  };
</script>~

