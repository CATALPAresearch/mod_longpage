import deepRenameKeys from 'deep-rename-keys';

// TODO: Replace dirty key mapping for mapping service or similar
export const deepLowerCaseKeys = object => deepRenameKeys(object, key => key === 'start' ? 'startposition' : key === 'end' ? 'endposition' : key.toLowerCase());
