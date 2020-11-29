import {capitalize, deepLowerCaseKeys, snakeCase} from "@/util/misc";
import {MoodleWSMethods, SelectorType} from "@/config/constants";
import {Annotation} from "@/lib/annotation/types/annotation";
import {AnnotationTarget} from "@/lib/annotation/types/annotation-target";

const MappingService = {
    [MoodleWSMethods.CREATE_ANNOTATION]: (annotation) => ({
        annotation: {
            body: annotation.body,
            target: annotation.target.map(target => ({
                pageid: target.pageId,
                selector: target.selector.map(selector => {
                    const type = snakeCase(selector.type);
                    if (selector.type === SelectorType.TEXT_POSITION_SELECTOR) return {
                        endPosition: selector.end,
                        startPosition: selector.start,
                        type,
                    };
                    return {...selector, type};
                }).map(deepLowerCaseKeys),
                styleclass: target.styleclass,
            })),
            timecreated: annotation.timecreated,
            timemodified: annotation.timemodified,
            userid: annotation.userId,
        },
    }),
    [MoodleWSMethods.GET_ANNOTATIONS]: (response) => JSON.parse(response).map(annotation => new Annotation({
        ...annotation,
        target: annotation.target.map(t => new AnnotationTarget({
            pageId: t.pageid,
            selector: t.selector.map(s => {
                const type = capitalize(s.type);
                switch (type) {
                    case SelectorType.RANGE_SELECTOR:
                        return {
                            type,
                            endContainer: s.endcontainer,
                            endOffset: Number(s.endoffset),
                            startContainer: s.startcontainer,
                            startOffset: Number(s.startoffset),
                        }
                    case SelectorType.TEXT_POSITION_SELECTOR:
                        return {
                            type,
                            end: Number(s.endposition),
                            start: Number(s.startposition),
                        }
                    default:
                        return {
                            ...s,
                            type,
                        }
                }
            }),
            styleclass: t.styleclass,
        })),
        userId: annotation.userid,
    })),
};

export default MappingService;
