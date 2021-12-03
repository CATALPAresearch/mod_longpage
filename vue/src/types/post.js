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
        highlighted = {},
        isPublic = false,
        islocked = false,
        likedByUser = false,
        likesCount = 0,
        bookmarkedByUser = false,
        readByUser = true,
        readingsCount = 0,
        recommendation,
        timeCreated = new Date(),
        timeModified = new Date(),
    } = {}) {
        this.id = id;
        this.creatorId = creatorId;
        this.threadId = threadId;

        this._likedByUser = likedByUser;
        this._readByUser = readByUser;
        this.anonymous = anonymous;
        this.content = content;
        this.highlighted = highlighted;
        this.isPublic = isPublic;
        this.islocked = islocked;
        this.likesCount = likesCount;
        this.bookmarkedByUser = bookmarkedByUser;
        this.readingsCount = readingsCount;
        this.recommendation = recommendation;
        this.timeCreated = timeCreated;
        this.timeModified = timeModified;
    }

    get created() {
        return Number(this.id);
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
