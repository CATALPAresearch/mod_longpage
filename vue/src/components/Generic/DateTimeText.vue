<template>
  <span>{{ $d(dateTime, dateTimeFormat) }}</span>
</template>

<script>
import {getDateTimeFormat} from '@/config/i18n/date-time-utils';

export default {
  name: 'DateTimeText',
  props: {
    dateTime: {type: Date, required: true}
  },
  computed: {
    dateTimeFormat() {
      return getDateTimeFormat(this.dateTime);
    }
  }
};
</script>
