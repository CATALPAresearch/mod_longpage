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
import {FilterBase} from '@/util/filters/filter-base';
import {PostFilter} from '@/util/filters/post-filter';
import {Thread} from '@/types/thread';

export class ThreadFilter extends FilterBase {
    constructor(filterParams = {}) {
        super();
        this.postFilter = new PostFilter(filterParams.posts);
        Object.assign(this, filterParams);
    }

    _threadMatchesFilter(thread) {
        return FilterBase.bool(thread.subscribedToByUser, this.subscribedToByUser) &&
            FilterBase.bool(!thread.replyRequested || thread.replyId !== undefined, this.gotRequestedReply);
    }

    applyTo(...threads) {
        return threads.reduce((result, thread) => {
            if (!this._threadMatchesFilter(thread)) return result;

            const filteredPosts = this.postFilter.applyTo(...thread.posts);
            if (!filteredPosts.length) return result;

            return [...result, new Thread({...thread, filteredPosts})];
        }, []);
    }

    static get DEFAULT() {
        return {
            subscribedToByUser: undefined,
            gotRequestedReply: undefined,
            posts: {
                query: '',
                likedByUser: undefined,
                bookmarkedByUser: undefined,
                readByUser: undefined,
                likesCount: {min: undefined, max: undefined},
                timeCreated: {min: undefined, max: undefined},
                timeModified: {min: undefined, max: undefined},
                creator: [],
            },
        };
    }
}
