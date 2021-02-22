export class Thread {
    constructor({
        id,
        annotationId,
        replyId,
        replyRequested = false,
        posts = []
    }) {
        this.id = id;
        this.annotationId = annotationId;
        this.replyId = replyId;
        this.replyRequested = replyRequested;
        this.posts = posts;
    }
}
