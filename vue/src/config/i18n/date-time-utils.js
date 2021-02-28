const NOW = new Date();

const StartDateTime = Object.freeze({
    TODAY: new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate()),
    THIS_YEAR: new Date(NOW.getFullYear(), 0),
    THIS_DECADE: new Date(Math.floor(NOW.getFullYear() / 10) * 10, 0),
});

export const getDateTimeFormat = (dateTime) => {
    if (dateTime < StartDateTime.THIS_DECADE) return 'dateTime';

    if (dateTime < StartDateTime.THIS_YEAR) return 'dateTimeWithoutCentury';

    if (dateTime < StartDateTime.TODAY) return 'dateTimeWithoutYear';

    return 'time';
};

export const getDateFormat = (dateTime) => {
    if (dateTime < StartDateTime.THIS_DECADE) return 'date';

    if (dateTime < StartDateTime.THIS_YEAR) return 'dateWithoutCentury';

    return 'dateWithoutYear';
};
