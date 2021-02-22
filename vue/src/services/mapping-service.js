import {Annotation} from '@/types/annotation';
import {deepLowerCaseKeys} from '@/util/misc';
import {MoodleWSMethods, SelectorType} from '@/config/constants';
import {invert, omit, pick} from 'lodash';
import {AnnotationTarget} from '@/types/annotation-target';
import {Thread} from '@/types/thread';
import {Post} from '@/types/post';

const SELECTOR_TYPE_ARGS_MAPPING = {
    [SelectorType.TEXT_QUOTE_SELECTOR]: 0,
    [SelectorType.TEXT_POSITION_SELECTOR]: 1,
    [SelectorType.RANGE_SELECTOR]: 2,
};

const SELECTOR_TYPE_RESPONSE_MAPPING = invert(SELECTOR_TYPE_ARGS_MAPPING);

const MappingService = {
    _mapSelectorsArgs(selectors) {
        return selectors.map(selector => {
            const type = this._mapSelectorTypeArgs(selector.type);
            if (selector.type === SelectorType.TEXT_POSITION_SELECTOR) {
                return {
                    endposition: selector.end,
                    startposition: selector.start,
                    type,
                };
            }
            return {...selector, type};
        });
    },
    _mapSelectorTypeArgs(selectorType) {
        return SELECTOR_TYPE_ARGS_MAPPING[selectorType];
    },
    _mapSelectorTypeResponse(selectorType) {
        return SELECTOR_TYPE_RESPONSE_MAPPING[selectorType];
    },
    _mapTimeResponse(timeInS) {
        const timeInMs = timeInS * 1000;
        return new Date(timeInMs);
    },
    mapThreadToArgs(thread) {
        return deepLowerCaseKeys({
            ...pick(thread.root, ['content', 'anonymous']),
            ...pick(thread, ['replyRequested']),
            ispublic: thread.isPublic,
        });
    },
    mapAnnotationToArgs(annotation) {
        return deepLowerCaseKeys({
            annotation: {
                ...pick(annotation, ['pageId', 'type', 'isPublic']),
                target: {
                    selectors: this._mapSelectorsArgs(annotation.target.selectors),
                    styleClass: annotation.target.styleClass,
                },
                body: annotation.body && this.mapThreadToArgs(annotation.body),
            },
        });
    },
    mapResponseToAnnotation(response) {
        return new Annotation({
            ...pick(response, ['id', 'type']),
            creatorId: response.creatorid,
            isPublic: response.ispublic,
            pageId: response.pageid,
            target: this.mapResponseToAnnotationTarget(response.target),
            timeCreated: this._mapTimeResponse(response.timecreated),
            timeModified: this._mapTimeResponse(response.timemodified),
            body: response.body && this.mapResponseToThread(response.body),
        });
    },
    mapResponseToAnnotations(response) {
        return response.map(this.mapResponseToAnnotation.bind(this));
    },
    mapResponseToAnnotationTarget(response) {
        return new AnnotationTarget({
            id: response.id,
            selectors: response.selectors.map(s => {
                const type = this._mapSelectorTypeResponse(s.type);
                switch (type) {
                    case SelectorType.RANGE_SELECTOR:
                        return {
                            type,
                            endContainer: s.endcontainer,
                            endOffset: s.endoffset,
                            startContainer: s.startcontainer,
                            startOffset: s.startoffset,
                        };
                    case SelectorType.TEXT_POSITION_SELECTOR:
                        return {
                            type,
                            end: s.endposition,
                            start: s.startposition,
                        };
                    default: return {...s, type};
                }
            }),
            styleClass: response.styleclass,
        });
    },
    mapResponseToPosts(response) {
        return new Post({
            ...pick(response, ['id', 'anonymous', 'content']),
            creatorId: response.creatorid,
            isPublic: response.ispublic,
            threadId: response.threadid,
            timeCreated: this._mapTimeResponse(response.timecreated),
            timeModified: this._mapTimeResponse(response.timemodified),
        });
    },
    mapResponseToThread(response) {
        return new Thread({
            ...pick(response, ['id']),
            annotationId: response.annotationid,
            posts: this.mapResponseToPosts(response.posts),
            replyId: response.replyid,
            replyRequested: response.replyrequested,
        });
    },
    [MoodleWSMethods.UPDATE_ANNOTATION](annotation) {
        return deepLowerCaseKeys({
            annotation: {
                ...omit(annotation, [
                    '$orphan', 'pageId', 'ratingByUser', 'target', 'timecreated', 'timemodified', 'userId'
                ]),
            },
        });
    },
};

export default MappingService;
