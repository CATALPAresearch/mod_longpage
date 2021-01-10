/**
 * The preferred gap between the end of the text selection and the
 * arrow position of the annotation toolbar popover.
 */
export const ARROW_H_MARGIN = 20;

export const ArrowDirection = Object.freeze({
    DOWN: 0,
    UP: 1
});

export const HighlightingConfig = Object.freeze({
    HL_TAG_NAME: 'longpage-highlight',
    HL_CLASS_NAME: 'longpage-highlight',
    SHOW_HLS_CLASS_NAME: 'longpage-highlights-always-on',
});

export const LANGUAGE = 'de';

export const LONGPAGE_MAIN_ID = 'longpage-main';
export const LONGPAGE_TEXT_CONTAINER_ID = 'longpage-text-container';
export const LONGPAGE_TEX_OVERLAY_ID = 'longpage-text-overlay';

export const MoodleWSMethods = Object.freeze({
    GET_ANNOTATIONS: 'mod_page_get_annotations',
    CREATE_ANNOTATION: 'mod_page_create_annotation',
    DELETE_ANNOTATION: 'mod_page_delete_annotation',
    UPDATE_ANNOTATION_BODY: 'mod_page_update_annotation_body',
});

export const SelectorType = Object.freeze({
    TEXT_POSITION_SELECTOR: 'TextPositionSelector',
    TEXT_QUOTE_SELECTOR: 'TextQuoteSelector',
    RANGE_SELECTOR: 'RangeSelector',
});
