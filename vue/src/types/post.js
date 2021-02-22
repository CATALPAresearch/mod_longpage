export class Post {
    constructor({
        id,
        threadId,
        creatorId,
        content,
        isPublic = false,
        anonymous = false,
        timeCreated,
        timeModified,
    }) {
        this.id = id;
        this.threadId = threadId;
        this.creatorId = creatorId;
        this.content = content;
        this.isPublic = isPublic;
        this.anonymous = anonymous;
        this.timeCreated = timeCreated;
        this.timeModified = timeModified;
    }
}
