import {AnnotationVisibility} from '@/config/constants';

export class Annotation {
    constructor({
        $orphan = false,
        body = '',
        id,
        pageId,
        rating,
        ratingByUser,
        tags = [],
        target = [],
        timecreated = new Date(),
        timemodified = new Date(),
        userId,
        visibility = AnnotationVisibility.PRIVATE,
    }) {
        this.$orphan = $orphan;
        this.body = body;
        this.id = id;
        this.pageId = pageId;
        this.rating = rating;
        this.ratingByUser = ratingByUser;
        this.tags = tags;
        this.target = target;
        this.timecreated = timecreated;
        this.timemodified = timemodified;
        this.userId = userId;
        this.visibility = visibility;
    }

    get hasBody() {
        return Boolean(this.body) || this.tags.length > 0;
    }

    get created() {
        return typeof this.id === 'number';
    }
}
