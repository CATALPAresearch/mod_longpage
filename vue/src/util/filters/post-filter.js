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
import {FilterBase} from "@/util/filters/filter-base";
import Fuse from 'fuse.js';
import {mapResultToHighlightedDoc} from "@/util/fuse";
import {pick} from 'lodash';
import {Post} from "@/types/post";

export class PostFilter extends FilterBase {
    static FUSE_OPTIONS = Object.freeze({
        includeMatches: true,
        keys: ['content'],
        threshold: 0.1,
    });

    constructor(filterParams) {
        super();
        Object.assign(this, filterParams);
    }

    _postMatchesFilter(post) {
        return FilterBase.bool(post.bookmarkedByUser, this.bookmarkedByUser) &&
            FilterBase.bool(post.likedByUser, this.likedByUser) &&
            FilterBase.bool(post.readByUser, this.readByUser) &&
            FilterBase.minMax(post.likesCount, this.likesCount.min, this.likesCount.max) &&
            FilterBase.minMax(post.timeCreated, this.timeCreated.min, this.timeCreated.max) &&
            FilterBase.minMax(post.timeModified, this.timeModified.min, this.timeModified.max) &&
            FilterBase.include(post.creatorId, this.creator);
    }

    applyTo(...posts) {
        const filteredPosts = posts.filter(post => this._postMatchesFilter(post));
        if (!this.query) return filteredPosts;

        return new Fuse(filteredPosts, PostFilter.FUSE_OPTIONS).search(this.query).map(searchResult => new Post({
            ...searchResult.item,
            highlighted: pick(mapResultToHighlightedDoc(searchResult), ['content']),
        }));
    }

    static get DEFAULT() {
        return {
            query: '',
            likedByUser: undefined,
            bookmarkedByUser: undefined,
            readByUser: undefined,
            likesCount: {min: undefined, max: undefined},
            timeCreated: {min: undefined, max: undefined},
            timeModified: {min: undefined, max: undefined},
            creator: [],
        };
    }
}
