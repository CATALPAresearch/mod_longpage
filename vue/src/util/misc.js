import {camelCase, flow, upperFirst} from 'lodash';

import deepRenameKeys from 'deep-rename-keys';

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
