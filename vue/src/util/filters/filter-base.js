export class FilterBase {
    static bool(value, bool) {
        return value === undefined || bool === undefined || bool === value;
    }

    static include(value, include) {
        return !include.length || include.includes(value);
    }

    static minMax(value, min, max) {
        return value === undefined || ((min === undefined || min <= value) && (max === undefined || value <= max));
    }
}
