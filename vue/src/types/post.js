export class Post {
    static preliminaryIdsAssignedCount = 0;

    static _getPreliminaryId() {
        return `new-post-${Post.preliminaryIdsAssignedCount++}`
    }

    constructor({
        id = Post._getPreliminaryId(),
        creatorId,
        threadId,
        anonymous = false,
        content = '',
        isPublic = false,
        likedByUser = false,
        likesCount = 0,
        markedByUser = false,
        readByUser = false,
        readingsCount = 0,
        timeCreated,
        timeModified,
    } = {}) {
        this.id = id;
        this.creatorId = creatorId;
        this.threadId = threadId;

        this._likedByUser = likedByUser;
        this._readByUser = readByUser;
        this.anonymous = anonymous;
        this.content = content;
        this.isPublic = isPublic;
        this.likesCount = likesCount;
        this.markedByUser = markedByUser;
        this.readingsCount = readingsCount;
        this.timeCreated = timeCreated;
        this.timeModified = timeModified;
    }

    get created() {
        return Boolean(this.timeCreated);
    }

    get likedByUser() {
        return this._likedByUser;
    }

    set likedByUser(value) {
        if (this._likedByUser !== value) this.likesCount += (value ? 1 : -1)
        this._likedByUser = value
    }

    get readByUser() {
        return this._readByUser;
    }

    set readByUser(value) {
        if (this._readByUser !== value) this.readingsCount += (value ? 1 : -1)
        this._readByUser = value
    }
}
