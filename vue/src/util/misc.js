import {camelCase, flow, upperFirst} from 'lodash';

import deepRenameKeys from 'deep-rename-keys';

export const deepLowerCaseKeys = object => deepRenameKeys(object, key => key.toLowerCase());

export {snakeCase} from 'lodash';

export const capitalize = flow(camelCase, upperFirst);
