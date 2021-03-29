import {HighlightingConfig} from '@/config/constants';

const domIdOfPostRegExp = new RegExp('post-\\d+');
export const getDOMIdOfPost = postId => `post-${postId}`;
export const isDOMIdOfPost = string => domIdOfPostRegExp.test(string);
export const getPostIdFromItsDOMId = domId => Number(domId.split('-')[1]);

const domIdOfThreadRegExp = new RegExp('thread-\\d+');
export const getDOMIdOfThread = threadId => `thread-${threadId}`;
export const isDOMIdOfThread = string => domIdOfThreadRegExp.test(string);
export const getThreadIdFromItsDOMId = domId => Number(domId.split('-')[1]);

export const getHighlightByAnnotationId = annotationId => Array
    .from(document.getElementsByTagName(HighlightingConfig.HL_TAG_NAME))
    .find(element => element._annotation.id === annotationId);
