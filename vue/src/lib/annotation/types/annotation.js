export class Annotation {
    constructor({
        $orphan = false,
        anonymous = false,
        body = '',
        id,
        isPrivate = false,
        pageId,
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
        this.tags = tags;
        this.target = target;
        this.timecreated = timecreated;
        this.timemodified = timemodified;
        this.userId = userId;
    }
}
