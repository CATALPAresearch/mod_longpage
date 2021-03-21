import {camelCase, flow, upperFirst} from 'lodash';
import {LONGPAGE_MAIN_ID, SCROLL_INTO_VIEW_OPTIONS} from '@/config/constants';
import deepRenameKeys from 'deep-rename-keys';
import scrollIntoView from 'scroll-into-view-if-needed';

export const deepLowerCaseKeys = object => deepRenameKeys(object, key => key.toLowerCase());

export {snakeCase} from 'lodash';

export const capitalize = flow(camelCase, upperFirst);

export const createDiv = (attributes, style = {}) => createElement('div', attributes, style);

export const createElement = (tag, attributes, style = {}) => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([attrKey, attrValue]) => {
     element.setAttribute(attrKey, attrValue);
    });
    Object.entries(style).forEach(([attrKey, attrValue]) => {
        element.style[attrKey] = attrValue;
    });
    return element;
};

export const scrollTextElementIntoView = el => {
    scrollIntoView(el, {...SCROLL_INTO_VIEW_OPTIONS, boundary: document.getElementById(LONGPAGE_MAIN_ID)});
};
