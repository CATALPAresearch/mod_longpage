import {capitalize, deepLowerCaseKeys, snakeCase} from "@/util/misc";
import {MoodleWSMethods, SelectorType} from "@/config/constants";

const MappingService = {
    [MoodleWSMethods.CREATE_ANNOTATION]: (annotation) => ({
        annotation: {
            target: annotation.target.map(target => ({
                ...target,
                selector: target.selector.map(selector => {
                    const type = snakeCase(selector.type);
                    if (selector.type === SelectorType.TEXT_POSITION_SELECTOR) return {
                        endPosition: selector.end,
                        startPosition: selector.start,
                        type,
                    };
                    return {...selector, type};
                }).map(deepLowerCaseKeys),
            })),
            timecreated: annotation.timecreated,
            timemodified: annotation.timemodified,
            userid: annotation.userid,
        },
    }),
    [MoodleWSMethods.GET_ANNOTATIONS]: (response) => {
        const result = JSON.parse(response).map(annotation => ({
            ...annotation,
            target: annotation.target.map(t => ({
                ...t,
                selector: t.selector.map(s => {
                    const type = capitalize(s.type);
                    switch (type) {
                        case SelectorType.RANGE_SELECTOR:
                            return {
                                type,
                                endContainer: s.endcontainer,
                                endOffset: s.endoffset,
                                startContainer: s.startcontainer,
                                startOffset: s.startoffset,
                            }
                        case SelectorType.TEXT_POSITION_SELECTOR:
                            return {
                                type,
                                end: s.endposition,
                                start: s.startposition,
                            }
                        default:
                            return {
                                ...s,
                                type,
                            }
                    }
                }),
            })),
        }));
        console.log(result);
        return result;
    },
};

export default MappingService;
