import {FilterBase} from "@/util/filters/filter-base";
import Fuse from 'fuse.js';
import {mapResultToHighlightedDoc} from "@/util/fuse";
import {pick} from 'lodash';
import {Post} from "@/types/post";

export class PostFilter extends FilterBase {
    static FUSE_OPTIONS = Object.freeze({
        includeMatches: true,
        keys: ['content'],
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
