import {set} from 'lodash';

export const mapResultToHighlightedDoc = ({item, matches}, hlStartTag = '<b>', hlEndTag = '</b>') => ({
    ...item,
    ...matches.reduce((itemHighlighted, {indices, value, key}) => {
        let currentValueIndex = 0;
        return set(itemHighlighted, key, indices.reduce((highlight, [startIdx, endIdx], i) => {
            const result = [
                highlight,
                value.slice(currentValueIndex, startIdx),
                hlStartTag,
                value.slice(startIdx, endIdx + 1),
                hlEndTag,
            ].join('');
            currentValueIndex = endIdx + 1;
            return i === indices.length - 1 ? [result, value.slice(currentValueIndex)].join('') : result;
        }, ''));
    }, {}),
});
