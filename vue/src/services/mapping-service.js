import {Annotation} from '@/types/annotation';
import {deepLowerCaseKeys} from '@/util/misc';
import {MoodleWSMethods, SelectorType} from '@/config/constants';
import {invert, omit, pick} from 'lodash';
import {AnnotationTarget} from '@/types/annotation-target';

const SELECTOR_TYPE_ARGS_MAPPING = {
    [SelectorType.TEXT_QUOTE_SELECTOR]: 0,
    [SelectorType.TEXT_POSITION_SELECTOR]: 1,
    [SelectorType.RANGE_SELECTOR]: 2,
};

const SELECTOR_TYPE_RESPONSE_MAPPING = invert(SELECTOR_TYPE_ARGS_MAPPING);

const MappingService = {
    mapAnnotationResponse(annotation) {
        return new Annotation({
            ...annotation,
            target: this.mapAnnotationTargetResponse(annotation.target),
            timecreated: this._mapTimeResponse(annotation.timecreated),
            timemodified: this._mapTimeResponse(annotation.timemodified),
        });
    },
    mapAnnotationTargetResponse(target) {
        return new AnnotationTarget({
            selectors: target.selectors.map(s => {
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
            styleClass: target.styleclass,
        });
    },
    mapCreateAnnotationArgs(annotation) {
        return deepLowerCaseKeys({
            annotation: {
                ...omit(annotation, ['$orphan', 'id', 'timecreated', 'timemodified']),
                target: {
                    selectors: this._mapSelectorsResponse(annotation.target.selectors),
                    styleClass: annotation.target.styleClass,
                }
            },
        });
    },
    mapFetchAnnotationsResponse(response) {
        return response.annotations.map(this.mapAnnotationResponse.bind(this));
    },
    [MoodleWSMethods.CREATE_ANNOTATION](annotation) {
        return deepLowerCaseKeys({
            annotation: {
                ...omit(annotation, ['$orphan', 'id', 'timecreated', 'timemodified']),
                target: {
                    selectors: this._mapSelectorsResponse(annotation.target.selectors),
                    styleClass: annotation.target.styleClass,
                }
            },
        });
    },
    [MoodleWSMethods.GET_ANNOTATIONS](annotations) {
        return annotations.map(annotation => this.mapAnnotationServerToClient(annotation));
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
    _mapSelectorsResponse(selectors) {
        return selectors.map(selector => {
            const type = this._mapSelectorTypeResponse(selector.type);
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
    }
};

export default MappingService;
