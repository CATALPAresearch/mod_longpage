<template>
  <span>
    {{ $t('timestamps.created') }}
    <date-time-text :date-time="timeCreated" />
    <span v-if="timeCreated.getTime() !== timeModified.getTime()">
      <span class="font-italic">
        ({{ $t('timestamps.modified') }}
        <date-time-text :date-time="timeModified" />)
      </span>
    </span>
  </span>
</template>

<script>
  import DateTimeText from '@/components/DateTimeText';

  export default {
    name: 'PostDateTimes',
    components: {
      DateTimeText
    },
    props: {
      timeCreated: {type: Date, required: true},
      timeModified: {type: Date, required: true},
    },
  };
</script>
