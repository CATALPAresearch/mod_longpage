export class Thread {
    static preliminaryIdsAssignedCount = 0;

    static _getPreliminaryId() {
        return `new-thread-${Thread.preliminaryIdsAssignedCount++}`
    }

    constructor({
        id = Thread._getPreliminaryId(),
        annotationId,
        filteredPosts = [],
        posts = [],
        replyId,
        replyRequested = false,
        subscribedToByUser = false,
    }) {
        this.id = id;
        this.annotationId = annotationId;
        this.filteredPosts = filteredPosts;
        this.posts = posts;
        this.replyId = replyId;
        this.replyRequested = replyRequested;
        this.subscribedToByUser = subscribedToByUser;
    }

    get created() {
        return this.root.created;
    }

    get isPublic() {
        return this.root.isPublic;
    }

    get lastPost() {
        return this.posts[this.posts.length - 1];
    }

    get lastReply() {
        return this.replies[this.replies.length -1];
    }

    get participantIds() {
        return this.posts.map(({creatorId}) => creatorId);
    }

    get replyCount() {
        return this.replies.length
    }

    get replies() {
        return this.posts.slice(1);
    }

    get requestedReply() {
        return this.posts.find(({id}) => id === this.replyId);
    }

    get root() {
        return this.posts[0];
    }

    get timeCreated() {
        return this.root.timeCreated;
    }

    get timeModified() {
        return this.root.timeModified;
    }
}