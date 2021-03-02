import {FilterBase} from '@/util/filters/filter-base';
import {ThreadFilter} from '@/util/filters/thread-filter';
import {AnnotationType} from '@/config/constants';
import {Annotation} from '@/types/annotation';

export class AnnotationFilter extends FilterBase {
    constructor(filterParams = {}) {
        super();
        this.threadFilter = new ThreadFilter(filterParams.body);
        Object.assign(this, filterParams);
    }

    applyTo(...annotations) {
        return annotations.reduce((result, annotation) => {
            if (annotation.type !== AnnotationType.POST) return [...result, annotation];

            const [filteredThread] = this.threadFilter.applyTo(annotation.body);
            if (filteredThread) return [...result, new Annotation({...annotation, body: filteredThread})];

            return result;
        }, []);
    }

    static get DEFAULT() {
        return {
            body: {
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
                }
            }
        };
    }
}
