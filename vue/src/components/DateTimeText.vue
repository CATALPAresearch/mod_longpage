<template>
  <span>{{ $d(dateTime, dateTimeFormat) }}</span>
</template>

<script>
const NOW = new Date();

const StartDateTime = Object.freeze({
  TODAY: new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate()),
  THIS_YEAR: new Date(NOW.getFullYear()),
  THIS_DECADE: new Date(Math.floor(NOW.getFullYear() / 10) * 10),
});

export default {
  name: 'DateTimeText',
  props: {
    dateTime: {type: Date, required: true}
  },
  computed: {
    dateTimeFormat() {
      if (this.dateTime < StartDateTime.THIS_DECADE) {
 return 'dateTime';
}
      if (this.dateTime < StartDateTime.THIS_YEAR) {
 return 'dateTimeWithoutCentury';
}
      if (this.dateTime < StartDateTime.TODAY) {
 return 'dateTimeWithoutYear';
}
      return 'time';
    }
  }
};
</script>
