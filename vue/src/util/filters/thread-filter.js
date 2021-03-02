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
