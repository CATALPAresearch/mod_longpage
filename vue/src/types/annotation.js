import {AnnotationType} from '@/config/constants';

export class Annotation {
    constructor({
        $orphan = false,
        id,
        target,
        timecreated,
        timemodified,
        type = AnnotationType.HIGHLIGHT,
    }) {
        this.$orphan = $orphan;
        this.id = id;
        this.target = target;
        this.timecreated = timecreated;
        this.timemodified = timemodified;
        this.type = type;
    }

    get created() {
        return typeof this.id === 'number';
    }
}
