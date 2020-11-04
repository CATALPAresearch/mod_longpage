export class Annotation {
    /**
     * @param {AnnotationTarget[]} target
     * @param body
     * @param userid
     */
    constructor(userid, target = [], body = []) {
        this.target = target;
        this.timecreated = Date.now();
        this.timemodified = Date.now();
        this.body = body;
        this.userid = userid;
    }
}
