export const AnnotationType = Object.freeze({
    HIGHLIGHT: 0,
    POST: 1,
    BOOKMARK: 2,
});

export const AnnotationTypeIcon = Object.freeze({
    [AnnotationType.BOOKMARK]: 'fa-bookmark-o',
    [AnnotationType.HIGHLIGHT]: 'fa-pencil',
    [AnnotationType.POST]: 'fa-comment-o',
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
    CREATE_POST_BOOKMARK: 'mod_page_create_post_bookmark',
    CREATE_POST_LIKE: 'mod_page_create_post_like',
    CREATE_POST_READING: 'mod_page_create_post_reading',
    CREATE_THREAD_SUBSCRIPTION: 'mod_page_create_thread_subscription',
    DELETE_ANNOTATION: 'mod_page_delete_annotation',
    DELETE_POST_BOOKMARK: 'mod_page_delete_post_bookmark',
    DELETE_POST: 'mod_page_delete_post',
    DELETE_POST_LIKE: 'mod_page_delete_post_like',
    DELETE_POST_READING: 'mod_page_delete_post_reading',
    DELETE_THREAD_SUBSCRIPTION: 'mod_page_delete_thread_subscription',
    GET_ANNOTATIONS: 'mod_page_get_annotations',
    GET_ENROLLED_USERS: 'mod_page_get_enrolled_users_with_roles_by_pageid',
    GET_USER_ROLES_FOR_MODULE: 'mod_page_get_user_roles_by_pageid',
    UPDATE_POST: 'mod_page_update_post',
    UPDATE_ANNOTATION: 'mod_page_update_annotation',
});

export const SidebarTabKeys = Object.freeze({
    BOOKMARKS: 'bookmarks',
    HIGHLIGHTS: 'highlights',
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
