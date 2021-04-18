// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * @package    mod_page
 * @copyright  2021 Adrian Stritzinger <Adrian.Stritzinger@studium.fernuni-hagen.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
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
        subscribedToByUser = true,
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

    getIndexOfPost(postId) {
        return this.posts.findIndex(p => p.id === postId)
    }

    get includesUnreadReply() {
        return this.replies.findIndex(reply => !reply.readByUser) >= 0
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

    getPostsAfter(postId) {
        const postIndex = this.getIndexOfPost(postId);
        return this.posts.filter((_, index) => index > postIndex)
    }

    get recommendation() {
        const recommendations = this.posts.filter(({recommendation}) => Boolean(recommendation)).map(({recommendation}) => recommendation)
        return recommendations.length ? Math.max(...recommendations) : 0
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
        return this.lastPost.timeModified
    }
}
