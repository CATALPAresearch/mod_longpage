export const GET = Object.freeze({
  ANNOTATION: 'ANNOTATION',
  ANNOTATION_FILTER: 'ANNOTATION_FILTER',
  ANNOTATION_WITH_CONTEXT: 'ANNOTATION_WITH_CONTEXT',
  ANNOTATIONS: 'ANNOTATIONS',
  BOOKMARKS: 'BOOKMARKS',
  ENROLLED_USERS: 'ENROLLED_USERS',
  FILTERED_ANNOTATIONS: 'FILTERED_ANNOTATIONS',
  HIGHLIGHTS: 'HIGHLIGHTS',
  LONGPAGE_CONTEXT: 'LONGPAGE_CONTEXT',
  NEW_ANNOTATION: 'NEW_ANNOTATION',
  NEW_POST: 'NEW_POST',
  NEW_THREAD: 'NEW_THREAD',
  POST: 'POST',
  SIDEBAR_TAB_OPENED_KEY: 'SIDEBAR_TAB_OPENED_KEY',
  THREAD: 'THREAD',
  THREADS: 'THREADS',
  THREADS_SORTED_BY_ANNOTATION_POSITION: 'THREADS_SORTED_BY_ANNOTATION_POSITION',
  USER: 'USER',
});

export const ACT = Object.freeze({
  CREATE_ANNOTATION: 'CREATE_ANNOTATION',
  CREATE_POST: 'CREATE_POST',
  DELETE_ANNOTATION: 'DELETE_ANNOTATION',
  DELETE_POST: 'DELETE_POST',
  FETCH_ANNOTATIONS: 'FETCH_ANNOTATIONS',
  FETCH_ENROLLED_USERS: 'FETCH_ENROLLED_USERS',
  FILTER_ANNOTATIONS: 'FILTER_ANNOTATIONS',
  REPLACE_OR_ADD_ANNOTATION: 'REPLACE_OR_ADD_ANNOTATION',
  REPLACE_OR_ADD_POST: 'REPLACE_OR_ADD_POST',
  REPLACE_OR_ADD_THREAD: 'REPLACE_OR_ADD_THREAD',
  SELECT_ANNOTATIONS: 'SELECT_ANNOTATIONS',
  TOGGLE_POST_LIKE: 'TOGGLE_POST_LIKE',
  UPDATE_ANNOTATION: 'UPDATE_ANNOTATION',
  UPDATE_POST: 'UPDATE_POST',
});

export const MUTATE = Object.freeze({
  ADD_ANNOTATIONS: 'ADD_ANNOTATIONS',
  ADD_POSTS_TO_THREAD: 'ADD_POST_TO_THREAD',
  ADD_THREADS: 'ADD_THREADS',
  REMOVE_ANNOTATIONS: 'REMOVE_ANNOTATIONS',
  REMOVE_POSTS_FROM_THREAD: 'REMOVE_POST',
  REMOVE_THREADS: 'REMOVE_THREADS',
  REPLACE_POST: 'REPLACE_POST',
  RESET_ANNOTATION_FILTER: 'RESET_ANNOTATION_FILTER',
  SET_ANNOTATIONS: 'SET_ANNOTATIONS',
  SET_ENROLLED_USERS: 'SET_ENROLLED_USERS',
  SET_THREADS: 'SET_THREADS',
  RESET_SIDEBAR_TAB_OPENED_KEY: 'RESET_SIDEBAR_TAB_OPENED_KEY',
  UPDATE_ANNOTATION: 'UPDATE_ANNOTATION',
  UPDATE_POST: 'UPDATE_POST',
  UPDATE_THREAD: 'UPDATE_THREAD',
});
