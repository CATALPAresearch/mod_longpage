import {camelCase, flow, upperFirst} from 'lodash';

import deepRenameKeys from 'deep-rename-keys';

export const deepLowerCaseKeys = object => deepRenameKeys(object, key => key.toLowerCase());

export {snakeCase} from 'lodash';

export const capitalize = flow(camelCase, upperFirst);

export const createElement = (tag, attributes) => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([attrKey, attrValue]) => { element.setAttribute(attrKey, attrValue) });
    return element;
}
