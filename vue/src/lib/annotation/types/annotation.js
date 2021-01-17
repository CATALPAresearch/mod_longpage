export class Annotation {
    constructor({
        $orphan = false,
        anonymous = false,
        body = '',
        id,
        isPrivate = false,
        pageId,
        rating,
        ratingByUser,
        tags = [],
        target = [],
        timecreated = new Date(),
        timemodified = new Date(),
        userId
    }) {
        this.$orphan = $orphan;
        this.anonymous = anonymous;
        this.body = body;
        this.id = id;
        this.isPrivate = isPrivate;
        this.pageId = pageId;
        this.rating = rating;
        this.ratingByUser = ratingByUser;
        this.tags = tags;
        this.target = target;
        this.timecreated = timecreated;
        this.timemodified = timemodified;
        this.userId = userId;
    }

    get hasBody() {
        return Boolean(this.body) || this.tags.length > 0;
    }
}
