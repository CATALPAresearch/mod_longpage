// TODO: Rename 'target' to 'targets' and 'target.selector' to 'target.selectors', only keep API the same to comply to W3C Recommendation
// TODO: Allow only one target per annotation

export class Annotation {
    /**
     * @param {AnnotationTarget[]} target
     * @param body
     * @param userId
     */
    constructor({ body = '', id, target = [], timecreated = Date.now(), timemodified = Date.now(), userId }) {
        this.body = body;
        this.id = id;
        this.target = target;
        this.timecreated = timecreated;
        this.timemodified = timemodified;
        this.userId = userId;
    }
}
