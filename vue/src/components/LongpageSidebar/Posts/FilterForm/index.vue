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
        <div
          v-for="input in stateInputs"
          :key="input.id"
          class="form-check form-check-inline mr-3"
        >
          <input
            :id="input.id"
            v-model="input.value"
            class="form-check-input"
            type="checkbox"
          >
          <label
            class="form-check-label"
            :for="input.id"
          >
            {{ input.label }}
            <i
              class="icon fa fa-fw"
              :class="input.iconClasses"
            />
          </label>
        </div>
      </div>
    </div>
    <div
      v-if="likesCountSliderOptions"
      class="mb-2 row"
    >
      <h6 class="d-inline mr-3 col-auto">
        Likes
      </h6>
      <slider :slider-options="likesCountSliderOptions" />
    </div>
    <div>
      <h6 class="d-inline mr-3 col-auto">
        AutorIn
      </h6>
      <multi-select-input />
    </div>
    <div
      v-if="datesCreatedSliderOptions"
      class="mb-2 row"
    >
      <h6 class="d-inline mr-3 col-auto">
        Erstellt zwischen
      </h6>
      <slider :slider-options="datesCreatedSliderOptions" />
    </div>
    <div
      v-if="datesModifiedSliderOptions"
      class="mb-2 row"
    >
      <h6 class="d-inline mr-3 col-auto">
        Zuletzt bearbeitet zwischen
      </h6>
      <slider :slider-options="datesModifiedSliderOptions" />
    </div>
  </div>
</template>

<script>
  import {GET} from '@/store/types';
  import {isEmpty} from 'lodash';
  import {mapGetters} from 'vuex';
  import Slider from '@/components/Generic/Slider';
  import {getDateFormat} from '@/config/i18n/date-time-utils';
  import MultiSelectInput from '@/components/LongpageSidebar/Posts/FilterForm/MultiSelectInput';

  const Timestamp = Object.freeze({
    CREATED: 'timeCreated',
    MODIFIED: 'timeModified'
  });

  export default {
    name: 'FilterForm',
    components: {MultiSelectInput, Slider},
    data() {
      return {
        stateInputs: [
          {
            id: 'posts-filter-checkbox-read',
            label: this.$i18n.t('post.state.unread'),
            iconClasses: ['fa-eye-slash'],
            value: true
          },
          {
            id: 'posts-filter-checkbox-unread',
            label: this.$i18n.t('post.state.read'),
            iconClasses: ['fa-eye'],
            value: true
          },
          {
            id: 'posts-filter-checkbox-bookmarked',
            label: this.$i18n.t('post.state.bookmarked'),
            iconClasses: ['fa-star'],
            value: true
          },
          {
            id: 'posts-filter-checkbox-subscribed-to-thread',
            label: this.$i18n.t('post.state.subscribedToThread'),
            iconClasses: ['fa-bell'],
            value: true
          },
        ],
      };
    },
    computed: {
      ...mapGetters([GET.POSTS]),
      likesCountSliderOptions() {
        const likesCounts = this[GET.POSTS].map(({likesCount}) => likesCount);
        if (isEmpty(likesCounts)) return;

        const [min, max] = [Math.min(...likesCounts), Math.max(...likesCounts)];
        if (min === max) return;

        return {min, max, value: [min, max]};
      },
      datesCreatedSliderOptions() {
        const timestamps = this.mapPostsToTimestamps(this[GET.POSTS]);
        if (isEmpty(timestamps)) return;

        const [min, max] = [Math.min(...timestamps), Math.max(...timestamps)];
        if (min === max) return;

        return this.getDateSliderOptions(min, max);
      },
      datesModifiedSliderOptions() {
        const timestamps = this.mapPostsToTimestamps(this[GET.POSTS], Timestamp.MODIFIED);
        if (isEmpty(timestamps)) return;

        const [min, max] = [Math.min(...timestamps), Math.max(...timestamps)];
        if (min === max) return;

        return this.getDateSliderOptions(min, max);
      },
    },
    methods: {
      mapPostsToTimestamps(posts, timestamp = Timestamp.CREATED) {
        return posts.filter(p => p.created).map(p => p[timestamp].getTime()) || [];
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

