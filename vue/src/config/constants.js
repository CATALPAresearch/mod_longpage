export const AnnotationType = Object.freeze({
    HIGHLIGHT: 0,
    POST: 1,
});

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

export const THREAD_CONTAINER_ID = 'thread-container';
export const LONGPAGE_APP_CONTAINER_ID = 'longpage-app-container';
export const LONGPAGE_APP_ID = 'longpage-app';
export const LONGPAGE_CONTENT_ID = 'longpage-content';
export const LONGPAGE_MAIN_ID = 'longpage-main';

export const MoodleWSMethods = Object.freeze({
    CREATE_ANNOTATION: 'mod_page_create_annotation',
    CREATE_POST: 'mod_page_create_post',
    DELETE_ANNOTATION: 'mod_page_delete_annotation',
    GET_ANNOTATIONS: 'mod_page_get_annotations',
    GET_ENROLLED_USERS: 'core_course_get_enrolled_users_by_cmid',
    UPDATE_ANNOTATION: 'mod_page_update_annotation',
});

export const SidebarTabKeys = Object.freeze({
    POSTS: 'posts',
    TOC: 'toc'
});

export const SCROLL_INTO_VIEW_OPTIONS = {
    behavior: 'smooth',
    block: 'start',
};

export const SelectorType = Object.freeze({
    TEXT_POSITION_SELECTOR: 'TextPositionSelector',
    TEXT_QUOTE_SELECTOR: 'TextQuoteSelector',
    RANGE_SELECTOR: 'RangeSelector',
});

export const MOODLE_NAVBAR_HEIGHT_IN_PX = 50;
