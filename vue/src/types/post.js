export class Post {
    static preliminaryIdsAssignedCount = 0;

    static _getPreliminaryId() {
        return `new-post-${Annotation.preliminaryIdsAssignedCount++}`
    }

    constructor({
        id = Post._getPreliminaryId(),
        creatorId,
        threadId,
        anonymous = false,
        content = '',
        isPublic = false,
        timeCreated,
        timeModified,
    }) {
        this.id = id;
        this.creatorId = creatorId;
        this.threadId = threadId;
        this.anonymous = anonymous;
        this.content = content;
        this.isPublic = isPublic;
        this.timeCreated = timeCreated;
        this.timeModified = timeModified;
    }
}
