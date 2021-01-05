import {Annotation} from '@/lib/annotation/types/annotation';
import {deepLowerCaseKeys} from '@/util/misc';
import {MoodleWSMethods, SelectorType} from '@/config/constants';
import {invert, omit, pick} from 'lodash';
import {PageSegment} from '@/lib/annotation/types/page-segment';

const SELECTOR_TYPE_MAPPING_CLIENT_TO_SERVER = {
    [SelectorType.TEXT_QUOTE_SELECTOR]: 0,
    [SelectorType.TEXT_POSITION_SELECTOR]: 1,
    [SelectorType.RANGE_SELECTOR]: 2,
};

const SELECTOR_TYPE_MAPPING_SERVER_TO_CLIENT = invert(SELECTOR_TYPE_MAPPING_CLIENT_TO_SERVER);

const AnnotationTargetType = {
    PAGE_SEGMENT: 0,
    ANNOTATION: 1,
};

const MappingService = {
    [MoodleWSMethods.CREATE_ANNOTATION](annotation) {
        return deepLowerCaseKeys({
            annotation: {
                ...omit(annotation, ['id', 'isPrivate']),
                private: annotation.isPrivate,
                target: annotation.target.map(target => (target instanceof PageSegment ? {
                    selector: this._mapSelectorsClientToServer(target.selector),
                    styleclass: target.styleclass,
                } : {
                    annotationid: target.id,
                })),
            },
        });
    },
    [MoodleWSMethods.GET_ANNOTATIONS](response) {
        return JSON.parse(response).map(annotation => new Annotation({
            ...pick(annotation, ['body', 'tags', 'motivation']),
            id: Number(annotation.id),
            rating: Number(annotation.rating),
            anonymous: Boolean(Number(annotation.anonymous)),
            isPrivate: Boolean(Number(annotation.private)),
            pageId: Number(annotation.pageid),
            target: annotation.target.map(t => {
                switch (Number(t.type)) {
                    case AnnotationTargetType.PAGE_SEGMENT:
                        return new PageSegment({
                            ...pick(t, ['styleclass']),
                            selector: t.selector.map(s => {
                                const type = this._mapSelectorTypeServerToClient(Number(s.type));
                                switch (type) {
                                    case SelectorType.RANGE_SELECTOR:
                                        return {
                                            type,
                                            endContainer: s.endcontainer,
                                            endOffset: Number(s.endoffset),
                                            startContainer: s.startcontainer,
                                            startOffset: Number(s.startoffset),
                                        };
                                    case SelectorType.TEXT_POSITION_SELECTOR:
                                        return {
                                            type,
                                            end: Number(s.endposition),
                                            start: Number(s.startposition),
                                        };
                                    default:
                                        return {
                                            ...s,
                                            type,
                                        };
                                }
                            }),
                        });
                    case AnnotationTargetType.ANNOTATION:
                        return {annotationId: t.annotationid};
                }
            }),
            timecreated: new Date(Number(annotation.timecreated)),
            timemodified: new Date(Number(annotation.timemodified)),
            userId: Number(annotation.userid),
        }));
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
};

export default MappingService;
