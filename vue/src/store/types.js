export const GET = Object.freeze({
  ANNOTATIONS: 'Get Annotations',
  LONGPAGE_CONTEXT: 'Get Longpage Context',
  SELECTED_ANNOTATIONS: 'Get Selected Annotations',
  SELECTED_HIGHLIGHTS: 'Get Selected Highlights',
});

export const ACT = Object.freeze({
  SELECT_ANNOTATIONS: 'Select Annotations',
  CREATE_ANNOTATION: 'Create Annotation',
  DELETE_ANNOTATION: 'Delete Annotation',
  EDIT_ANNOTATION: 'Edit Annotation',
  FETCH_ANNOTATIONS: 'Fetch Annotations',
  UPDATE_ANNOTATION_BODY: 'Update Annotation Body',
});

export const MUTATE = Object.freeze({
  ADD_ANNOTATIONS: 'Add Annotations',
  REMOVE_ANNOTATIONS: 'Remove Annotations by Id',
  SET_ANNOTATIONS: 'Set Annotations',
  SET_SELECTED_ANNOTATIONS: 'Set Selected Annotations',
  UPDATE_ANNOTATION: 'Update Annotation',
});
