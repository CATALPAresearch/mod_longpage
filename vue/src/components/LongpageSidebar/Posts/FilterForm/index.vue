<template>
  <div>
    <div class="mb-2 row">
      <div class="input-group col-auto">
        <div class="input-group-prepend">
          <span class="input-group-text bg-transparent border-0 py-0 pl-0 pr-2">
            <i class="fa fa-search fa-fw fa-2x text-secondary" />
          </span>
        </div>
        <input
          id="content-filter-input"
          type="text"
          class="form-control"
          placeholder="Nach Anmerkungstext filtern"
          @input="debouncedUpdateActiveFilter('body.posts.query', $event.target.value)"
        >
      </div>
    </div>
    <div class="mb-2 row align-items-center">
      <h6 class="d-inline m-0 col-auto">
        Gelesen-Status
      </h6>
      <div class="col-auto">
        <multi-select-checkbox-group
          v-model="selectedReadingStateOptions"
          :options="readingStateOptions"
        />
      </div>
    </div>
    <div class="mb-2 row align-items-center">
      <h6 class="d-inline m-0 col-auto">
        Status
      </h6>
      <div class="col-auto">
        <multi-select-checkbox-group
          v-model="selectedStateOptions"
          :options="stateOptions"
        />
      </div>
    </div>
    <div
      v-if="likesCountSliderOptions"
      class="mb-2 row align-items-center"
    >
      <h6 class="d-inline m-0 col-auto">
        Gefällt
      </h6>
      <slider
        class="col"
        :slider-options="likesCountSliderOptions"
      />
    </div>
    <div class="mb-2 row align-items-center">
      <multi-select-input
        class="col-auto w-100"
        placeholder="Autor:innen"
        :options="creatorOptions"
        :model-value="activeFilter.body.posts.creator"
        not-found-message="Keine gefunden"
        @update:model-value="updateActiveFilter('body.posts.creator', $event)"
      />
    </div>
    <div
      v-if="datesCreatedSliderOptions"
      class="mb-2 row align-items-center"
    >
      <h6 class="d-inline m-0 col-auto">
        Erstellt
      </h6>
      <slider
        class="col"
        :slider-options="datesCreatedSliderOptions"
      />
    </div>
    <div
      v-if="datesModifiedSliderOptions"
      class="mb-2 row align-items-center"
    >
      <h6 class="d-inline m-0 col-auto">
        Zuletzt bearbeitet
      </h6>
      <slider
        class="col"
        :slider-options="datesModifiedSliderOptions"
      />
    </div>
  </div>
</template>

<script>
import {GET, MUTATE} from '@/store/types';
  import {getDateFormat} from '@/config/i18n/date-time-utils';
  import {debounce, isEmpty, set} from 'lodash';
  import MultiSelectInput from '@/components/Generic/MultiSelectInput/index';
  import {mapGetters, mapMutations} from 'vuex';
  import Slider from '@/components/Generic/Slider';
import MultiSelectCheckboxGroup from '@/components/Generic/MultiSelectCheckboxGroup';

  const Timestamp = Object.freeze({
    CREATED: 'timeCreated',
    MODIFIED: 'timeModified'
  });

  export default {
    name: 'FilterForm',
    components: {MultiSelectCheckboxGroup, MultiSelectInput, Slider},
    data() {
      return {
        selectedReadingStateOptions: [],
        selectedStateOptions: [],
        readingStateOptions: [
          {
            id: 'posts-filter-checkbox-read',
            text: this.$i18n.t('post.state.unread'),
            iconClasses: ['fa-eye-slash'],
            value: false
          },
          {
            id: 'posts-filter-checkbox-unread',
            text: this.$i18n.t('post.state.read'),
            iconClasses: ['fa-eye'],
            value: false
          },
        ],
        stateOptions: [
          {
            id: 'posts-filter-checkbox-liked',
            text: this.$i18n.t('post.state.liked'),
            iconClasses: ['fa-thumbs-up'],
            value: false
          },
          {
            id: 'posts-filter-checkbox-bookmarked',
            text: this.$i18n.t('post.state.bookmarked'),
            iconClasses: ['fa-star'],
            value: false
          },
          {
            id: 'posts-filter-checkbox-subscribed-to-thread',
            text: this.$i18n.t('post.state.subscribedToThread'),
            iconClasses: ['fa-bell'],
            value: false
          },
        ],
      };
    },
    computed: {
      ...mapGetters([GET.ANNOTATION_FILTER, GET.POSTS, GET.USER_ROLES, GET.USERS]),
      activeFilter: {
        get() {
          return this[GET.ANNOTATION_FILTER];
        },
        set(filter) {
          this[MUTATE.SET_ANNOTATION_FILTER](filter);
        }
      },
      creatorOptions() {
        return this[GET.USERS]
            .flatMap(u => this[GET.USER_ROLES](u.id).map(r => ({text: u.fullName, value: u.id, category: r.localName})))
            .sort((oA, oB) => oA.category.localeCompare(oB.category) || oA.text.localeCompare(oB.text));
      },
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
      ...mapMutations([MUTATE.SET_ANNOTATION_FILTER]),
      mapPostsToTimestamps(posts, timestamp = Timestamp.CREATED) {
        return posts.filter(p => p.created).map(p => p[timestamp].getTime()) || [];
      },
      debouncedUpdateActiveFilter: debounce(function(path, value) {
        // eslint-disable-next-line no-invalid-this
        this.updateActiveFilter(path, value);
      }, 500),
      getDateSliderOptions(timeMin, timeMax) {
        const format = time => this.$i18n.d.call(this.$i18n, time, getDateFormat(time));
        return {
          min: timeMin,
          max: timeMax,
          value: [timeMin, timeMax],
          formatter: value => Array.isArray(value) ? value.map(v => format(v)) : format(value),
        };
      },
      updateActiveFilter(path, value) {
        const updatedActiveFilter = set({...this.activeFilter}, path, value);
        this.activeFilter = updatedActiveFilter;
      }
    }
  };
</script>~

