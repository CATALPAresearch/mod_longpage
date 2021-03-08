<template>
  <span>
    <span v-if="timeCreated && timeModified">
      {{ $t('timestamps.created') }}
      <date-time-text :date-time="timeCreated" />
      <span v-if="timeCreated.getTime() !== timeModified.getTime()">
        <span class="font-italic">
          ({{ $t('timestamps.modified') }}
          <date-time-text :date-time="timeModified" />)
        </span>
      </span>
    </span>
    <loading-indicator-dots
      v-else
      :text="timeCreated ? $t('generic.loadingIndicator.updating') : $t('generic.loadingIndicator.creating')"
    />
  </span>
</template>

<script>
  import DateTimeText from '@/components/Generic/DateTimeText';
  import LoadingIndicatorDots from '@/components/Generic/LoadingIndicatorDots';

  export default {
    name: 'DateTimes',
    components: {
      DateTimeText,
      LoadingIndicatorDots,
    },
    props: {
      timeCreated: {type: Date},
      timeModified: {type: Date},
    },
  };
</script>
