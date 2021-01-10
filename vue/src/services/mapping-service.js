import {Annotation} from '@/lib/annotation/types/annotation';
import {deepLowerCaseKeys} from '@/util/misc';
import {AnnotationTargetType, MoodleWSMethods, SelectorType} from '@/config/constants';
import {invert, omit, pick} from 'lodash';
import {PageSegment} from '@/lib/annotation/types/page-segment';
import {TargetAnnotationReference} from '@/lib/annotation/types/target-annotation-reference';

const SELECTOR_TYPE_MAPPING_CLIENT_TO_SERVER = {
    [SelectorType.TEXT_QUOTE_SELECTOR]: 0,
    [SelectorType.TEXT_POSITION_SELECTOR]: 1,
    [SelectorType.RANGE_SELECTOR]: 2,
};

const SELECTOR_TYPE_MAPPING_SERVER_TO_CLIENT = invert(SELECTOR_TYPE_MAPPING_CLIENT_TO_SERVER);

const MappingService = {
    [MoodleWSMethods.CREATE_ANNOTATION](annotation) {
        return deepLowerCaseKeys({
            annotation: {
                ...omit(annotation, ['$orphan', 'id', 'isPrivate', 'timecreated', 'timemodified']),
                private: annotation.isPrivate,
                target: annotation.target.map(target => (target instanceof PageSegment ? {
                    type: AnnotationTargetType.PAGE_SEGMENT,
                    selector: this._mapSelectorsClientToServer(target.selector),
                    styleclass: target.styleclass,
                } : {
                    type: AnnotationTargetType.ANNOTATION,
                    annotationid: target.id,
                })),
            },
        });
    },
    [MoodleWSMethods.GET_ANNOTATIONS](annotations) {
        return annotations.map(annotation => new Annotation({
            ...pick(annotation, ['anonymous', 'body', 'id', 'rating', 'tags']),
            isPrivate: annotation.private,
            pageId: annotation.pageid,
            target: annotation.target.map(t => {
                switch (t.type) {
                    case AnnotationTargetType.PAGE_SEGMENT:
                        return new PageSegment({
                            ...pick(t, ['styleclass']),
                            selector: t.selector.map(s => {
                                const type = this._mapSelectorTypeServerToClient(s.type);
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
                        });
                    case AnnotationTargetType.ANNOTATION:
                        return new TargetAnnotationReference({annotationId: t.annotationid});
                }
            }),
            timecreated: this._mapTimeServerToClient(annotation.timecreated),
            timemodified: this._mapTimeServerToClient(annotation.timemodified),
            userId: annotation.userid,
        }));
    },
    [MoodleWSMethods.UPDATE_ANNOTATION](annotation) {
        return deepLowerCaseKeys({
            annotation: {
                ...omit(annotation, [
                    '$orphan', 'isPrivate', 'pageId', 'target', 'timecreated', 'timemodified', 'userId'
                ]),
                private: annotation.isPrivate,
            },
        });
    },
    _mapSelectorsClientToServer: function(selectors) {
        return selectors.map(selector => {
            const type = this._mapSelectorTypeClientToServer(selector.type);
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
    _mapSelectorTypeClientToServer(selectorType) {
        return SELECTOR_TYPE_MAPPING_CLIENT_TO_SERVER[selectorType];
    },
    _mapSelectorTypeServerToClient(selectorType) {
        return SELECTOR_TYPE_MAPPING_SERVER_TO_CLIENT[selectorType];
    },
    _mapTimeServerToClient(timeInS) {
        const timeInMs = timeInS * 1000;
        return new Date(timeInMs);
    }
};

export default MappingService;
