export const GET = Object.freeze({
  ANNOTATIONS: 'Get Annotations',
  ANNOTATIONS_TARGETING_PAGE_SEGMENT: 'Get Annotations Targeting Page Segment',
  ANNOTATIONS_TARGETING_ANNOTATION: 'Get Annotations Targeting Annotation',
  ENROLLED_USERS: 'Get Enrolled Users',
  LONGPAGE_CONTEXT: 'Get Longpage Context',
  RESPONSES_TO: 'Get Responses To {annotationId}',
  SELECTED_ANNOTATIONS: 'Get Selected Annotations',
  SELECTED_HIGHLIGHTS: 'Get Selected Highlights',
  USER: 'Get User',
});

export const ACT = Object.freeze({
  SELECT_ANNOTATIONS: 'Select Annotations',
  CREATE_ANNOTATION: 'Create Annotation',
  DELETE_ANNOTATION: 'Delete Annotation',
  EDIT_ANNOTATION: 'Edit Annotation',
  FETCH_ANNOTATIONS: 'Fetch Annotations',
  FETCH_ENROLLED_USERS: 'Fetch Enrolled Users',
  UPDATE_ANNOTATION: 'Update Annotation',
});

export const MUTATE = Object.freeze({
  ADD_ANNOTATIONS: 'Add Annotations',
  REMOVE_ANNOTATIONS: 'Remove Annotations by Id',
  SET_ANNOTATIONS: 'Set Annotations',
  SET_ENROLLED_USERS: 'Set Enrolled Users',
  SET_SELECTED_ANNOTATIONS: 'Set Selected Annotations',
  UPDATE_ANNOTATION: 'Update Annotation',
});
