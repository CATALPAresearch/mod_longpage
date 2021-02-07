export const GET = Object.freeze({
  ANNOTATION_FILTER: 'ANNOTATION_FILTER',
  ANNOTATION_WITH_CONTEXT: 'ANNOTATION_WITH_CONTEXT',
  ANNOTATIONS: 'ANNOTATIONS',
  ANNOTATIONS_IN_EDIT: 'ANNOTATIONS_IN_EDIT',
  ANNOTATIONS_TARGETING_PAGE_SEGMENT: 'ANNOTATIONS_TARGETING_PAGE_SEGMENT',
  ANNOTATIONS_TARGETING_PAGE_SEGMENT_FILTERED: 'ANNOTATIONS_TARGETING_PAGE_SEGMENT_FILTERED',
  ANNOTATIONS_TARGETING_ANNOTATION: 'ANNOTATIONS_TARGETING_ANNOTATION',
  ENROLLED_USERS: 'ENROLLED_USERS',
  LONGPAGE_CONTEXT: 'LONGPAGE_CONTEXT',
  PROVISIONAL_ANNOTATION_ID: 'PROVISIONAL_ANNOTATION_ID',
  RESPONSES_TO: 'RESPONSES_TO',
  SIDEBAR_TAB_OPENED_KEY: 'SIDEBAR_TAB_OPENED_KEY',
  USER: 'USER',
});

export const ACT = Object.freeze({
  CREATE_ANNOTATION: 'CREATE_ANNOTATION',
  DELETE_ANNOTATION: 'DELETE_ANNOTATION',
  FETCH_ANNOTATIONS: 'FETCH_ANNOTATIONS',
  FETCH_ENROLLED_USERS: 'FETCH_ENROLLED_USERS',
  FILTER_ANNOTATIONS: 'FILTER_ANNOTATIONS',
  SELECT_ANNOTATIONS: 'SELECT_ANNOTATIONS',
  START_EDITING_ANNOTATION: 'START_EDITING_ANNOTATION',
  STOP_EDITING_ANNOTATION: 'STOP_EDITING_ANNOTATION',
  UPDATE_ANNOTATION: 'UPDATE_ANNOTATION',
});

export const MUTATE = Object.freeze({
  ADD_ANNOTATIONS: 'ADD_ANNOTATIONS',
  ADD_ANNOTATION_IN_EDIT: 'ADD_ANNOTATION_IN_EDIT',
  REMOVE_ANNOTATION_BY_ID: 'REMOVE_ANNOTATION_BY_ID',
  REMOVE_ANNOTATION_IN_EDIT_BY_ID: 'REMOVE_ANNOTATION_IN_EDIT_BY_ID',
  REMOVE_ANNOTATIONS: 'REMOVE_ANNOTATIONS',
  SET_ANNOTATIONS: 'SET_ANNOTATIONS',
  RESET_ANNOTATION_FILTER: 'RESET_ANNOTATION_FILTER',
  SET_ENROLLED_USERS: 'SET_ENROLLED_USERS',
  RESET_SIDEBAR_TAB_OPENED_KEY: 'RESET_SIDEBAR_TAB_OPENED_KEY',
  UPDATE_ANNOTATION: 'UPDATE_ANNOTATION',
});
