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
      <slider :slider-options="datesCreatedSliderOptions" />
    </div>
    <div
      class="mb-2 row"
    >
      <h6 class="d-inline mr-3 col-auto">
        Zuletzt bearbeitet zwischen
      </h6>
      <slider :slider-options="datesModifiedSliderOptions" />
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

  const Timestamp = Object.freeze({
    CREATED: 'timeCreated',
    MODIFIED: 'timeModified'
  });

  export default {
    name: 'FilterForm',
    components: {Slider},
    computed: {
      ...mapGetters([GET.POSTS]),
      datesCreatedSliderOptions() {
        const timestampsAsc = this.mapPostsToTimestampsAsc(this[GET.POSTS]);
        const minMax = isEmpty(timestampsAsc) ? [0, Date.now()] : [timestampsAsc[0], last(timestampsAsc)];
        return this.getDateSliderOptions(...minMax);
      },
      datesModifiedSliderOptions() {
        const timestampsAsc = this.mapPostsToTimestampsAsc(this[GET.POSTS], Timestamp.MODIFIED);
        const minMax = isEmpty(timestampsAsc) ? [0, Date.now()] : [timestampsAsc[0], last(timestampsAsc)];
        return this.getDateSliderOptions(...minMax);
      },
    },
    methods: {
      mapPostsToTimestampsAsc(posts, timestamp = Timestamp.CREATED) {
        return posts.filter(p => p.created).map(p => p[timestamp].getTime()).sort((tA, tB) => tA - tB) || [];
      },
      getDateSliderOptions(timeMin, timeMax) {
        const format = time => this.$i18n.d.call(this.$i18n, time, getDateFormat(time));
        return {
          min: timeMin,
          max: timeMax,
          value: [timeMin, timeMax],
          formatter: value => Array.isArray(value) ? value.map(v => format(v)) : format(value),
        };
      }
    }
  };
</script>~

