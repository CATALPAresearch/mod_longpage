// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * @package    mod_page
 * @copyright  2021 Adrian Stritzinger <Adrian.Stritzinger@studium.fernuni-hagen.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
export class UserRole {
    constructor({
        id,
        localName = '',
        shortName = '',
    } = {}) {
        this.id = id;
        this.localName = localName;
        this.shortName = shortName;
    }
}
/**
 * Type definitions for objects passed between the annotator and sidebar.
 */

/**
 * @typedef {import("../lib/annotation/api").Selector} Selector
 * @typedef {import("./annotation-target").AnnotationTarget} AnnotationTarget
 */

/**
 * An object representing an annotation in the document.
 *
 * @typedef AnnotationData
 * @prop {string} uri
 * @prop {Target[]} target
 * @prop {string} $tag
 * @prop {boolean} [$highlight] -
 *   Flag indicating that this annotation was created using the "Highlight" button,
 *   as opposed to "Annotate".
 * @prop {boolean} [$orphan] -
 *   Flag indicating that this annotation was not found in the document.
 *   It is initially `undefined` while anchoring is in progress and then set to
 *   `true` if anchoring failed or `false` if it succeeded.
 * @prop {DocumentMetadata} document
 */

/**
 * An object representing the location in a document that an annotation is
 * associated with.
 *
 * @typedef Anchor
 * @prop {Annotation} annotation
 * @prop {HTMLElement[]} [highlights]
 * @prop {Range} [range]
 * @prop {AnnotationTarget} target
 */

// Make TypeScript treat this file as a module.
export const unused = {};
export class User {
    constructor({
        id,
        firstName = '',
        fullName = '',
        lastName = '',
        imageAlt = '',
        profileImage = '',
        profileLink = '',
        roles = [],
    } = {}) {
        this.id = id;
        this.firstName = firstName;
        this.fullName = fullName;
        this.lastName = lastName;
        this.imageAlt = imageAlt;
        this.profileImage = profileImage;
        this.profileLink = profileLink;
        this.roles = roles;
    }
}
import {AnnotationType} from '@/config/constants';
import {AnnotationTarget} from '@/types/annotation-target';

export class Annotation {
    static preliminaryIdsAssignedCount = 0;

    static _getPreliminaryId() {
        return `new-annotation-${Annotation.preliminaryIdsAssignedCount++}`
    }

    constructor({
        $orphan = false,
        id = Annotation._getPreliminaryId(),
        body,
        creatorId,
        isPublic = false,
        pageId,
        target = new AnnotationTarget({}),
        timeCreated,
        timeModified,
        type = AnnotationType.HIGHLIGHT,
    }) {
        this.$orphan = $orphan;
        this.id = id;
        this.body = body;
        this.creatorId = creatorId;
        this.isPublic = isPublic;
        this.pageId = pageId;
        this.target = target;
        this.timeCreated = timeCreated;
        this.timeModified = timeModified;
        this.type = type;
    }

    get created() {
        return Boolean(this.timeCreated);
    }
}
export class Post {
    static preliminaryIdsAssignedCount = 0;

    static _getPreliminaryId() {
        return `new-post-${Post.preliminaryIdsAssignedCount++}`
    }

    constructor({
        id = Post._getPreliminaryId(),
        creatorId,
        threadId,
        anonymous = false,
        content = '',
        highlighted = {},
        isPublic = false,
        likedByUser = false,
        likesCount = 0,
        bookmarkedByUser = false,
        readByUser = true,
        readingsCount = 0,
        recommendation,
        timeCreated = new Date(),
        timeModified = new Date(),
    } = {}) {
        this.id = id;
        this.creatorId = creatorId;
        this.threadId = threadId;

        this._likedByUser = likedByUser;
        this._readByUser = readByUser;
        this.anonymous = anonymous;
        this.content = content;
        this.highlighted = highlighted;
        this.isPublic = isPublic;
        this.likesCount = likesCount;
        this.bookmarkedByUser = bookmarkedByUser;
        this.readingsCount = readingsCount;
        this.recommendation = recommendation;
        this.timeCreated = timeCreated;
        this.timeModified = timeModified;
    }

    get created() {
        return Number(this.id);
    }

    get likedByUser() {
        return this._likedByUser;
    }

    set likedByUser(value) {
        if (this._likedByUser !== value) this.likesCount += (value ? 1 : -1)
        this._likedByUser = value
    }

    get readByUser() {
        return this._readByUser;
    }

    set readByUser(value) {
        if (this._readByUser !== value) this.readingsCount += (value ? 1 : -1)
        this._readByUser = value
    }
}
export class Thread {
    static preliminaryIdsAssignedCount = 0;

    static _getPreliminaryId() {
        return `new-thread-${Thread.preliminaryIdsAssignedCount++}`
    }

    constructor({
        id = Thread._getPreliminaryId(),
        annotationId,
        filteredPosts = [],
        posts = [],
        replyId,
        replyRequested = false,
        subscribedToByUser = true,
    }) {
        this.id = id;
        this.annotationId = annotationId;
        this.filteredPosts = filteredPosts;
        this.posts = posts;
        this.replyId = replyId;
        this.replyRequested = replyRequested;
        this.subscribedToByUser = subscribedToByUser;
    }

    get created() {
        return this.root.created;
    }

    getIndexOfPost(postId) {
        return this.posts.findIndex(p => p.id === postId)
    }

    get includesUnreadReply() {
        return this.replies.findIndex(reply => !reply.readByUser) >= 0
    }

    get isPublic() {
        return this.root.isPublic;
    }

    get lastPost() {
        return this.posts[this.posts.length - 1];
    }

    get lastReply() {
        return this.replies[this.replies.length -1];
    }

    get participantIds() {
        return this.posts.map(({creatorId}) => creatorId);
    }

    getPostsAfter(postId) {
        const postIndex = this.getIndexOfPost(postId);
        return this.posts.filter((_, index) => index > postIndex)
    }

    get recommendation() {
        const recommendations = this.posts.filter(({recommendation}) => Boolean(recommendation)).map(({recommendation}) => recommendation)
        return recommendations.length ? Math.max(...recommendations) : 0
    }

    get replyCount() {
        return this.replies.length
    }

    get replies() {
        return this.posts.slice(1);
    }

    get requestedReply() {
        return this.posts.find(({id}) => id === this.replyId);
    }

    get root() {
        return this.posts[0];
    }

    get timeCreated() {
        return this.root.timeCreated;
    }

    get timeModified() {
        return this.lastPost.timeModified
    }
}
import {SelectorType} from "@/config/constants";

export class AnnotationTarget {
    static preliminaryIdsAssignedCount = 0;

    static _getPreliminaryId() {
        return `new-annotation-target-${AnnotationTarget.preliminaryIdsAssignedCount++}`
    }

    constructor({id = AnnotationTarget._getPreliminaryId(), selectors = [], styleClass}) {
        this.id = id;
        this.selectors = selectors;
        this.styleClass = styleClass;
    }

    get text() {
        const textQuoteSelector = this.selectors.find(sel => sel.type === SelectorType.TEXT_QUOTE_SELECTOR);
        return textQuoteSelector && textQuoteSelector.exact;
    }
}
import {FilterBase} from '@/util/filters/filter-base';
import {ThreadFilter} from '@/util/filters/thread-filter';
import {AnnotationType} from '@/config/constants';
import {Annotation} from '@/types/annotation';

export class AnnotationFilter extends FilterBase {
    constructor(filterParams = {}) {
        super();
        this.threadFilter = new ThreadFilter(filterParams.body);
        Object.assign(this, filterParams);
    }

    applyTo(...annotations) {
        return annotations.reduce((result, annotation) => {
            if (annotation.type !== AnnotationType.POST) return [...result, annotation];

            const [filteredThread] = this.threadFilter.applyTo(annotation.body);
            if (filteredThread) return [...result, new Annotation({...annotation, body: filteredThread})];

            return result;
        }, []);
    }

    static get DEFAULT() {
        return {
            body: {
                subscribedToByUser: undefined,
                gotRequestedReply: undefined,
                posts: {
                    query: '',
                    likedByUser: undefined,
                    bookmarkedByUser: undefined,
                    readByUser: undefined,
                    likesCount: {min: undefined, max: undefined},
                    timeCreated: {min: undefined, max: undefined},
                    timeModified: {min: undefined, max: undefined},
                    creator: [],
                }
            }
        };
    }
}
export class FilterBase {
    static bool(value, bool) {
        return value === undefined || bool === undefined || bool === value;
    }

    static include(value, include) {
        return !include.length || include.includes(value);
    }

    static minMax(value, min, max) {
        return value === undefined || ((min === undefined || min <= value) && (max === undefined || value <= max));
    }
}
import {FilterBase} from '@/util/filters/filter-base';
import {PostFilter} from '@/util/filters/post-filter';
import {Thread} from '@/types/thread';

export class ThreadFilter extends FilterBase {
    constructor(filterParams = {}) {
        super();
        this.postFilter = new PostFilter(filterParams.posts);
        Object.assign(this, filterParams);
    }

    _threadMatchesFilter(thread) {
        return FilterBase.bool(thread.subscribedToByUser, this.subscribedToByUser) &&
            FilterBase.bool(!thread.replyRequested || thread.replyId !== undefined, this.gotRequestedReply);
    }

    applyTo(...threads) {
        return threads.reduce((result, thread) => {
            if (!this._threadMatchesFilter(thread)) return result;

            const filteredPosts = this.postFilter.applyTo(...thread.posts);
            if (!filteredPosts.length) return result;

            return [...result, new Thread({...thread, filteredPosts})];
        }, []);
    }

    static get DEFAULT() {
        return {
            subscribedToByUser: undefined,
            gotRequestedReply: undefined,
            posts: {
                query: '',
                likedByUser: undefined,
                bookmarkedByUser: undefined,
                readByUser: undefined,
                likesCount: {min: undefined, max: undefined},
                timeCreated: {min: undefined, max: undefined},
                timeModified: {min: undefined, max: undefined},
                creator: [],
            },
        };
    }
}
import {FilterBase} from "@/util/filters/filter-base";
import Fuse from 'fuse.js';
import {mapResultToHighlightedDoc} from "@/util/fuse";
import {pick} from 'lodash';
import {Post} from "@/types/post";

export class PostFilter extends FilterBase {
    static FUSE_OPTIONS = Object.freeze({
        includeMatches: true,
        keys: ['content'],
        threshold: 0.1,
    });

    constructor(filterParams) {
        super();
        Object.assign(this, filterParams);
    }

    _postMatchesFilter(post) {
        return FilterBase.bool(post.bookmarkedByUser, this.bookmarkedByUser) &&
            FilterBase.bool(post.likedByUser, this.likedByUser) &&
            FilterBase.bool(post.readByUser, this.readByUser) &&
            FilterBase.minMax(post.likesCount, this.likesCount.min, this.likesCount.max) &&
            FilterBase.minMax(post.timeCreated, this.timeCreated.min, this.timeCreated.max) &&
            FilterBase.minMax(post.timeModified, this.timeModified.min, this.timeModified.max) &&
            FilterBase.include(post.creatorId, this.creator);
    }

    applyTo(...posts) {
        const filteredPosts = posts.filter(post => this._postMatchesFilter(post));
        if (!this.query) return filteredPosts;

        return new Fuse(filteredPosts, PostFilter.FUSE_OPTIONS).search(this.query).map(searchResult => new Post({
            ...searchResult.item,
            highlighted: pick(mapResultToHighlightedDoc(searchResult), ['content']),
        }));
    }

    static get DEFAULT() {
        return {
            query: '',
            likedByUser: undefined,
            bookmarkedByUser: undefined,
            readByUser: undefined,
            likesCount: {min: undefined, max: undefined},
            timeCreated: {min: undefined, max: undefined},
            timeModified: {min: undefined, max: undefined},
            creator: [],
        };
    }
}
import {camelCase, flow, upperFirst} from 'lodash';
import {LONGPAGE_MAIN_ID, SCROLL_INTO_VIEW_OPTIONS} from '@/config/constants';
import deepRenameKeys from 'deep-rename-keys';
import scrollIntoView from 'scroll-into-view-if-needed';

export const deepLowerCaseKeys = object => deepRenameKeys(object, key => key.toLowerCase());

export {snakeCase} from 'lodash';

export const capitalize = flow(camelCase, upperFirst);

export const createDiv = (attributes, style = {}) => createElement('div', attributes, style);

export const createElement = (tag, attributes, style = {}) => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([attrKey, attrValue]) => {
     element.setAttribute(attrKey, attrValue);
    });
    Object.entries(style).forEach(([attrKey, attrValue]) => {
        element.style[attrKey] = attrValue;
    });
    return element;
};

export const scrollTextElementIntoView = el => {
    scrollIntoView(el, {...SCROLL_INTO_VIEW_OPTIONS, boundary: document.getElementById(LONGPAGE_MAIN_ID)});
};
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
export const toClassSelector = className => `.${className}`;
export const toIdSelector = id => `#${id}`;
export const toNumber = px => Number(px.match(/^\d+/)[0]);
export const toPx = number => `${number}px`;
export const applyMathjaxFilterToNodes = (...nodes) => {
    nodes.forEach(node => {
        Y.use('mathjax', () => {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, node]);
        });
    });
};
import {SelectorType} from '@/config/constants';

export const AnnotationCompareFunction = Object.freeze({
    BY_POSITION: (annotationA, annotationB) => {
        const {start: startA = 0} = annotationA.target.selectors.find(s => s.type === SelectorType.TEXT_POSITION_SELECTOR) || {};
        const {start: startB = 0} = annotationB.target.selectors.find(s => s.type === SelectorType.TEXT_POSITION_SELECTOR) || {};
        return startA - startB;
    }
});
import {set} from 'lodash';

const hlStartTag = '<b>';
const hlEndTag = '</b>';

export const mapResultToHighlightedDoc = ({item, matches}) => {
    return {...item,
    ...matches.reduce((itemHighlighted, {indices, value, key}) => {
            let currentValueIndex = 0;
            return set(itemHighlighted, key, indices.reduce((highlight, [startIdx, endIdx], i) => {
                const result = [
                    highlight,
                    value.slice(currentValueIndex, startIdx),
                    hlStartTag,
                    value.slice(startIdx, endIdx + 1),
                    hlEndTag,
                ].join('');
                currentValueIndex = endIdx + 1;
                return i === indices.length - 1 ? [result, value.slice(currentValueIndex)].join('') : result;
            }, ''));
        }, {}),
    };
};
/* eslint-disable valid-jsdoc, no-console, max-len */
/**
 * Javascript utils for the Moodle videodatabase
 *
 * @module     mod_videodatabase/videodatabase
 * @package    mod_videodatabase
 * @class      Utils
 * @copyright  2018 Niels Seidel, info@social-machinables.com
 * @license    MIT
 * @since      3.1
 */

import ajax from 'core/ajax';

export default function () {
    /**
     * Obtains data from a moodle webservice
     * @param {*} ws: Name of the web service
     * @param {*} params: Parameter to transfer
     * @param {*} cb: Callback function
     */
    this.get_ws = function (ws, params, cb, external) {
        external = external === undefined ? false : external;
        ajax.call([{
            methodname: external ? ws : 'mod_page_' + ws,
            args: params,
            done: function (msg) {
                if (msg.hasOwnProperty('exception')) {
                    console.error('Die Prozedur ' + ws + ' konnte nicht als Webservice geladen werden.<br>');
                    console.error(JSON.stringify(msg));
                } else {
                    cb(msg);
                }
            },
            fail: function (e) {
                console.log(params, ws);
                console.error(e);
            }
        }]);
    };

    /*
            this.germanFormatters = d3.timeFormatDefaultLocale({
                "decimal": ",",
                "thousands": ".",
                "grouping": [3],
                "currency": ["€", ""],
                "dateTime": "%a %b %e %X %Y",
                "date": "%d.%m.%Y",
                "time": "%H:%M:%S",
                "periods": ["AM", "PM"],
                "days": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
                "shortDays": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
                "months": ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
                "shortMonths": ["Jän", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
            });

            this.customTimeFormat = function (date) {//this.germanFormatters.timeFormat.multi([
                if (date.getMinutes()) return d3.timeFormat("%I:%M")(date);
                if (date.getMilliseconds()) return d3.timeFormat(".%L")(date);
                if (date.getSeconds()) return d3.timeFormat(":%S")(date);
                if (date.getHours()) return d3.timeFormat("%Hh")(date);
                if (date.getDay()) return d3.timeFormat("%a %e.%m.")(date); // Mo 8.02.
                if (date.getMonth()) return d3.timeFormat("%B")(date); //7.12.
                return d3.getDate("%Y");
            };
    */
    this.numberToWord = function (num, postfix) {
        postfix = postfix === undefined ? '' : postfix;
        switch (num) {
            case 0: return 'kein' + postfix;
            case 1: return 'ein' + postfix;
            case 2: return 'zwei' + postfix;
            case 3: return 'drei' + postfix;
            case 4: return 'vier' + postfix;
            case 5: return 'fünf' + postfix;
            case 6: return 'sechs' + postfix;
            case 7: return 'sieben' + postfix;
            case 8: return 'acht' + postfix;
            case 9: return 'neun' + postfix;
            case 10: return 'zehn' + postfix;
            case 11: return 'elf' + postfix;
            default: return num + ' ' + postfix;
        }
    };

    this.mergeObjects = function (obj1, obj2) {
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    };
}
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
    UPDATE_ANNOTATION: 'mod_page_update_annotation',
    UPDATE_POST: 'mod_page_update_post',
    UPDATE_READING_PROGRESS: 'mod_page_update_reading_progress',
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

export const SAVE_ACTIONS = [
    {key: 'publish', iconClasses: ['fa-users']},
    {key: 'publishAnonymously', iconClasses: ['fa-user-secret']},
    {key: 'save', iconClasses: ['fa-lock']},
];export {i18n} from './vue-i18n';
import de from './locale-messages/de.json';
import {LANGUAGE} from '@/config/constants';
import {createI18n} from 'vue-i18n';
import datetimeFormats from './date-time-formats.json';

export const i18n = createI18n({
    datetimeFormats,
    locale: LANGUAGE,
    fallbackLocale: LANGUAGE,
    messages: {de},
    silentTranslationWarn: true,
});
const NOW = new Date();

const StartDateTime = Object.freeze({
    TODAY: new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate()),
    THIS_YEAR: new Date(NOW.getFullYear(), 0),
    THIS_DECADE: new Date(Math.floor(NOW.getFullYear() / 10) * 10, 0),
});

export const getDateTimeFormat = (dateTime) => {
    if (dateTime < StartDateTime.THIS_DECADE) return 'dateTime';

    if (dateTime < StartDateTime.THIS_YEAR) return 'dateTimeWithoutCentury';

    if (dateTime < StartDateTime.TODAY) return 'dateTimeWithoutYear';

    return 'time';
};

export const getDateFormat = (dateTime) => {
    if (dateTime < StartDateTime.THIS_DECADE) return 'date';

    if (dateTime < StartDateTime.THIS_YEAR) return 'dateWithoutCentury';

    return 'dateWithoutYear';
};
import './components/LongpageContent/Footnote';
import './lib/hashchange-listening';
import './lib/page-ready-listening';
import './lib/scroll-snapping';
import App from './App.vue';
import {createApp} from 'vue';
import {initStore} from '@/store';
import {LONGPAGE_APP_CONTAINER_ID} from '@/config/constants';
import {toIdSelector} from '@/util/style';
import {i18n} from '@/config/i18n';

export const init = (courseId, pageId, pageName, userId, content, scrollTop) => {
    try {
        const store = initStore({courseId: Number(courseId), pageId: Number(pageId), pageName, userId: Number(userId)});
        createApp(App, {content, scrollTop: Number(scrollTop)})
            .use(store)
            .use(i18n)
            .mount(toIdSelector(LONGPAGE_APP_CONTAINER_ID));
    } catch (e) {
        /* eslint-disable no-console */
        console.error(e);
    }
};
import $ from 'jquery';

$(() => {
    $('.longpage-footnote button').popover({
        html: true,
        trigger: 'focus',
        content() {
            const content = $(this).attr("data-popover-content");
            return $(content).children(".popover-body").html();
        },
    });
});
import {flattenDeep} from 'lodash';

export const tagin = (el, option = {}) => { // Use comma as seperator
    const classElement = 'tagin';
    const classWrapper = 'tagin-wrapper';
    const classTag = 'tagin-tag';
    const classRemove = 'tagin-tag-remove';
    const classInput = 'tagin-input';
    const classInputHidden = 'tagin-input-hidden';
    const defaultSeparator = ',';
    const defaultPlaceholder = '';
    const separator = el.dataset.separator || option.separator || defaultSeparator;
    const placeholder = el.dataset.placeholder || option.placeholder || defaultPlaceholder;

    const getOptions = () => el._selectOptions;
    const mapValueToText = value => {
        const option = getOptions().find(({value: v}) => v === Number(value));
        if (!option) {
            throw new Error(
                'MultiSelectInput has a value but no options from which the selection of the value could be made.'
            );
        }

        return option.text;
    };

    const templateTag =
            v => `<span class="${classTag}" data-value="${v}">${mapValueToText(v)}<span class="${classRemove}"></span></span>`;

    const getValue = () => el.value;
    const getValues = () => getValue().split(separator);

    // Create
    (function() {
        const className = classWrapper + ' ' + el.className.replace(classElement, '').trim();
        const tags = getValue().trim() === '' ? '' : getValues().map(templateTag).join('');
        const template =
            `<div class="${className}">${tags}<input type="text" class="${classInput}" placeholder="${placeholder}"></div>`;
        el.insertAdjacentHTML('afterend', template); // Insert template after element
    })();

    const wrapper = el.nextElementSibling;
    listenToClickOnRemoveButtons();
    const input = wrapper.getElementsByClassName(classInput)[0];
    const getTags = () => [...wrapper.getElementsByClassName(classTag)].map(tag => tag.dataset.value);
    const getTag = () => getTags().join(separator);

    // Focus to input
    wrapper.addEventListener('click', () => input.focus());

    // Toggle focus class
    input.addEventListener('focus', () => wrapper.classList.add('focus'));
    input.addEventListener('blur', () => wrapper.classList.remove('focus'));

    input.addEventListener('input', e => {
        autowidth();
        el.dispatchEvent(new CustomEvent('queryinput', {detail: {value: e.target.value}}));
    });
    el.addEventListener('update-query', e => {
       input.value = e.detail.value;
       input.focus();
    });
    input.addEventListener('blur', () => {
        autowidth();
    });

    // AUTOWIDTH

    autowidth();

    function autowidth() {
        const fakeEl = document.createElement('div');
        fakeEl.classList.add(classInput, classInputHidden);
        const string = input.value || input.getAttribute('placeholder') || '';
        fakeEl.innerHTML = string.replace(/ /g, '&nbsp;');
        document.body.appendChild(fakeEl);
        input.style.setProperty('width', Math.ceil(window.getComputedStyle(fakeEl).width.replace('px', '')) + 1 + 'px');
        fakeEl.remove();
    }


    // SYNCHRONIZE WITH PARENT

    function updateTag() {
        if (getValue() !== getTag()) {
            [...wrapper.getElementsByClassName(classTag)].map(tag => tag.remove());
            if (getValue().trim() !== '') input.insertAdjacentHTML('beforebegin', getValues().map(templateTag).join(''));
        }
    }

    el.addEventListener('update-tags', () => {
     updateTag();
    });


    // REMOVAL OF TAGS

    const updateValue = () => {
        el.value = getTag();
        el.dispatchEvent(new Event('change'));
    };

    // Remove by click
    function listenToClickOnRemoveButtons() {
        [...document.getElementsByClassName(classRemove)].forEach(removeButton => {
            removeButton.addEventListener('click', e => {
                e.target.parentNode.remove();
                updateValue();
            });
        });
        const mutationObserver = new MutationObserver(mutations => {
            const addedNodes = flattenDeep(mutations.filter(m => m.addedNodes.length).map(m => [...m.addedNodes]));
            addedNodes.forEach(n => {
                const removeButton = [...n.children].find(c => c.classList.contains(classRemove));
                removeButton.addEventListener('click', e => {
                    e.target.parentNode.remove();
                    updateValue();
                });
            });
        });
        mutationObserver.observe(wrapper, {childList: true, subtree: true});
    }

    // Remove with backspace
    input.addEventListener('keydown', e => {
        if (input.selectionStart === 0 && e.keyCode === 8 && wrapper.getElementsByClassName(classTag).length) {
            wrapper.querySelector('.' + classTag + ':last-of-type').remove();
            updateValue();
        }
    });
};
/* eslint-disable max-len, no-console, no-loop-func, no-undef, no-unused-vars, no-bitwise */
/**
 * TODO
 *
 * ---
 * - counting images does not work
 * - the estimation by certain types of headings should be abstracted
 * - language support / language detection
 * - separate display and calculation
 * - make calculation more generic (not bound to headings as delimiters)
 * - localization of strings in display
 */
import {toClassSelector} from '@/util/style';

export class ReadingTimeEstimator {
    constructor(textContainerSelector) {
        this.textContainerSel = textContainerSelector;
        this.language = 'de';
        this.readingSpeedPerLanguage = {
            // 200 word per Minute https://de.wikipedia.org/wiki/Lesegeschwindigkeit
            // add 12 seconds for each inline image. Boom, read time.
            de: {
                cpm: 250, variance: 50
            }
        };
        this.slowSum = 0;
        this.fastSum = 0;
    }

    calcAndDisplay(headingTag) {
        const dummyHeadingClass = `dummy-heading-${headingTag}`;
        const tmpMarkerClass = `tmp-marked-${headingTag}`;
        let noOfHeadings = $(`${this.textContainerSel} ${headingTag}`).length;
        $(this.textContainerSel).append(`<${headingTag} style="display: inline; color: #fff;" class="${dummyHeadingClass}"></${headingTag}>`);
        for (let i = 0; i < noOfHeadings; i++) {
            let numberOfImages = 0;
            const from = $(`${this.textContainerSel} ${headingTag}:nth(${i})`);
            const to = $(`${this.textContainerSel} ${headingTag}:nth(${i + 1})`);
            const a = $(from).nextUntil(to);

            a.addClass(tmpMarkerClass);
            // Concat text from DOM
            let out = '';
            $(toClassSelector(tmpMarkerClass)).each(function() {
                out = `${out} ${$(this).text()}`;
                if ($(this).prop('tagName') === 'IMG') {
                    numberOfImages++;
                }
                $(this).removeClass(tmpMarkerClass);
            });
            let output = $('<div></div>')
                .addClass('mx-0 my-1 p-0')
                .attr('style', ' font-size: 0.8em; color: #333333;')
                .html(this.estimateTime(out, numberOfImages));
            from.after(output);
            $(toClassSelector(dummyHeadingClass)).remove();
        }
    }

    estimateTime(text, numImg) {
        let textlength = text.match(/([\s]+)/g).length;
        numImg = parseInt(numImg, 10) === 0 || typeof (numImg) !== 'number' ? 1 : numImg;
        let readingSpeed = this.readingSpeedPerLanguage[this.language];
        let readingTimeSlow = Math.ceil(textlength / (readingSpeed.cpm - readingSpeed.variance) + numImg * 0.3);
        let readingTimeFast = Math.ceil(textlength / (readingSpeed.cpm + readingSpeed.variance) + numImg * 0.3);
        this.slowSum += readingTimeSlow;
        this.fastSum += readingTimeFast;
        return 'Geschätzte Lesezeit ' + this.convertToReadableTime(readingTimeFast, readingTimeSlow);// + ' (' + textlength+' Wörter)';
    }

    convertToReadableTime(fasttime, slowtime) {
        // Return time;
        let time = slowtime;
        if (slowtime < 60) {
            return fasttime + '-' + slowtime + ' Minuten';// '0:' + (time < 10 ? '0' + time : time);
        } else if (slowtime > 59 && fasttime < 3600) {
            let slowhours = Math.ceil(slowtime / 60);
            let slowminutes = slowtime % 60;
            let fasthours = Math.ceil(fasttime / 60);
            let fastminutes = fasttime % 60;

            return fasthours + ':' + (fastminutes < 10 ? '0' + fastminutes : fastminutes) + ' &ndash; ' + slowhours + ':' + (slowminutes < 10 ? '0' + slowminutes : slowminutes) + ' Stunden';
        }
        return time; // Should be a rar case, but needs to be treated in some way

    }
}
/* eslint-disable valid-jsdoc */
/**
 * name: Logging
 * author: 2019 Niels Seidel, niels.seidel@fernuni-hagen.de
 * license: MIT License
 * description: Logs user behavior data inclunding informations about the client system, browser, and time.
 * todo:
 */
import ajax from 'core/ajax';

export default function (utils, courseId, options) {
    this.utils = utils;
    this.courseId = courseId;
    this.name = 'log_page';
    this.options = utils.mergeObjects({
        outputType: 1, // -1: no logging, 0: console.log(), 1: server log,
        prefix: '',
        loggerServiceUrl: null,
        loggerServiceParams: { "data": {} },
        context: 'default-context'
    }, options);

    this.ip = '';

    /**
     * Adds a message to the log by constructing a log entry
     */
    this.add = function(action, msg) {
        if (typeof msg === 'string') {
            console.log('warning: uncaptured log entry: ' + msg);
            return;
        }
        var time = this.getLogTime();
        var logEntry = {
            utc: time.utc,
            //date: time.date,
            //time: time.time,
            location: {
                //protocol: window.location.protocol,
                //port: window.location.port,
                host: window.location.host,
                pathname: window.location.href,
                hash: window.location.hash,
                tabId: window.name.split('=')[0] === "APLE-MOODLE" ? window.name.split('=')[1] : "unknown"
            },
            context: this.options.context,
            action: action,
            value: msg,
            userAgent: {
                cpu: navigator.oscpu,
                platform: navigator.platform,
                engine: navigator.product,
                browser: navigator.appCodeName,
                browserVersion: navigator.appVersion,
                userAgent: navigator.userAgent.replace(/,/gm, ';'),
                screenHeight: screen.height, // document.body.clientHeight
                screenWidth: screen.width // document.body.clientWidth
                // retina
            }
        };
        this.output(logEntry);
    };

    /**
     * Validates the msg against illegal characters etc.
     */
    this.validate = function(msg) {
        return msg;
    };

    /**
     * Returs structured time information
     */
    this.getLogTime = function() {
        var date = new Date();
        var s = date.getSeconds();
        var mi = date.getMinutes();
        var h = date.getHours();
        var d = date.getDate();
        var m = date.getMonth() + 1;
        var y = date.getFullYear();

        return {
            utc: date.getTime(),
            date: y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d),
            time: (h <= 9 ? '0' + h : h) + ':' + (mi <= 9 ? '0' + mi : mi) + ':' + (s <= 9 ? '0' + s : s) + ':' + date.getMilliseconds()
        };
    };

    /**
     * Interface for handling the output of the generated log entry
     */
    this.output = function(logEntry) {
        switch (this.options.outputType) {
            case 0:
                console.log(logEntry);
                break;
            case 1:
                this.sendLog(logEntry);
                //console.log(logEntry.value);
                break;
            default:
                // Do nothing
        }
    };

    /**
     * Makes an AJAX call to send the log data set to the server
     */
    this.sendLog = function (entry) {
        let _this = this;
        ajax.call([{
            methodname: 'mod_page_log',
            args: {
                data: {
                    courseid: _this.courseId,
                    action: entry.action,
                    utc: Math.ceil(entry.utc / 1000),
                    entry: JSON.stringify(entry)
                }
            },
            done: function (msg) {
                // console.log('ok', msg);
            },
            fail: function (e) {
                console.error('fail', e);
            }
        }]);
    };
};
import * as rangeUtil from './hypothesis/range-util';
import selections from './hypothesis/selections';

export class SelectionListener {
    subscribe(onSelection, onClearSelection) {
        this.selections = selections(document).subscribe({
            next: range => {
                if (range) {
                    const {focusRect, isBackwards} = this._getSelectionProps(range);
                    onSelection(range, focusRect, isBackwards);
                } else {
                    onClearSelection();
                }
            }
        });
    }

    unsubscribe() {
        this.selections.unsubscribe();
    }

    /**
     *
     * @returns {{focusRect: (DOMRect|null), isBackwards: boolean}}
     * @private
     */
    _getSelectionProps() {
        const selection = /** @type {Selection} */ (document.getSelection());
        const isBackwards = rangeUtil.isSelectionBackwards(selection);
        const focusRect = rangeUtil.selectionFocusRect(selection);
        return {focusRect, isBackwards};
    }
}
import {AnnotationType, HighlightingConfig} from '../../config/constants';

/**
 * Return the annotations associated with any highlights that contain a given
 * DOM node.
 *
 * @param {Node} node
 * @return {AnnotationData[]}
 */
const getAnnotationsAnchoredAt = (node) => {
    const items = getHighlightsContainingNode(node)
        .map(h => /** @type {AnnotationHighlight} */ (h)._annotation)
        .filter(ann => ann !== undefined);

    return /** @type {AnnotationData[]} */ (items);
};

/**
 * Return the highlights associated that contain a given
 * DOM node.
 *
 * @param {Node} node
 * @return {AnnotationData[]}
 */
export const getHighlightsAnchoredAt = (node) => {
    return getAnnotationsAnchoredAt(node)
        .filter(annotation => annotation.type === AnnotationType.HIGHLIGHT);
};

/**
 * Get the highlight elements that contain the given node.
 *
 * @param {Node} node
 * @return {HighlightElement[]}
 */
const getHighlightsContainingNode = (node) => {
    let el =
        node.nodeType === Node.ELEMENT_NODE
            ? /** @type {Element} */ (node)
            : node.parentElement;
    const highlights = [];
    while (el) {
        if (el.classList.contains(HighlightingConfig.HL_CLASS_NAME)) {
            highlights.push(/** @type {HighlightElement} */ (el));
        }
        el = el.parentElement;
    }
    return highlights;
};
/*
  TODO: Use our css class, tag, _annotation (data) for annotation
    - Remove dependencies on hypothesis styles or include them in project
 */
/**
 * Based on Hypothesis client's modules (see https://github.com/hypothesis/client):
 *   - src/annotator/highlighter.js
 */
import {HighlightingConfig} from '../../config/constants';

/**
 * Subset of the `NormalizedRange` class defined in `range.js` that this
 * module currently uses.
 *
 * @typedef NormalizedRange
 * @prop {() => Node[]} textNodes
 */

/**
 * Wraps the DOM Nodes within the provided range with a highlight
 * element of the specified class and returns the highlight Elements.
 *
 * @param {NormalizedRange} normedRange - Range to be highlighted.
 * @param {string} cssClass - A CSS class to use for the highlight
 * @return {HighlightElement[]} - Elements wrapping text in `normedRange` to add a highlight effect
 */
export function highlightRange(normedRange, cssClass) {
  const white = /^\s*$/;

  // Find text nodes within the range to highlight.
  const textNodes = normedRange.textNodes();

  // Group text nodes into spans of adjacent nodes. If a group of text nodes are
  // adjacent, we only need to create one highlight element for the group.
  let textNodeSpans = [];
  let prevNode = null;
  let currentSpan = null;

  textNodes.forEach(node => {
    if (prevNode && prevNode.nextSibling === node) {
      currentSpan.push(node);
    } else {
      currentSpan = [node];
      textNodeSpans.push(currentSpan);
    }
    prevNode = node;
  });

  // PostFilter out text node spans that consist only of white space. This avoids
  // inserting highlight elements in places that can only contain a restricted
  // subset of nodes such as table rows and lists.
  textNodeSpans = textNodeSpans.filter(span =>
    // Check for at least one text node with non-space content.
    span.some(node => !white.test(node.nodeValue))
  );

  // Wrap each text node span with a `<{{ Config.HL_TAG_NAME }}>` element.
  const highlights = [];
  textNodeSpans.forEach(nodes => {
    // A custom element name is used here rather than `<span>` to reduce the
    // likelihood of highlights being hidden by page styling.

    /** @type {HighlightElement} */
    const highlightEl = document.createElement(HighlightingConfig.HL_TAG_NAME);
    highlightEl.className = [HighlightingConfig.HL_CLASS_NAME, cssClass].join(' ');

    nodes[0].parentNode.replaceChild(highlightEl, nodes[0]);
    nodes.forEach(node => highlightEl.appendChild(node));

    highlights.push(highlightEl);
  });

  return highlights;
}

/**
 * Replace a child `node` with `replacements`.
 *
 * nb. This is like `ChildNode.replaceWith` but it works in older browsers.
 *
 * @param {ChildNode} node
 * @param {Node[]} replacements
 */
function replaceWith(node, replacements) {
  const parent = /** @type {Node} */ (node.parentNode);
  replacements.forEach(r => parent.insertBefore(r, node));
  node.remove();
}

/**
 * Remove all highlights under a given root element.
 *
 * @param {HTMLElement} root
 */
export function removeAllHighlights(root) {
  const highlights = Array.from(root.querySelectorAll(HighlightingConfig.HL_TAG_NAME));
  removeHighlights(/** @type {HighlightElement[]} */ (highlights));
}

/**
 * Remove highlights from a range previously highlighted with `highlightRange`.
 *
 * @param {HighlightElement[]} highlights - The highlight elements returned by `highlightRange`
 */
export function removeHighlights(highlights) {
  for (let h of highlights) {
    if (h.parentNode) {
      const children = Array.from(h.childNodes);
      replaceWith(h, children);
    }

    if (h.svgHighlight) {
      h.svgHighlight.remove();
    }
  }
}

/**
 * Set whether highlights under the given root element should be visible.
 *
 * @param {HTMLElement} root
 * @param {boolean} visible
 */
export function setHighlightsVisible(root, visible) {
  const showHighlightsClass = HighlightingConfig.SHOW_HLS_CLASS_NAME;
  root.classList.toggle(showHighlightsClass, visible);
}

/**
 * Get the highlight elements that contain the given node.
 *
 * @param {Node} node
 * @return {HighlightElement[]}
 */
export function getHighlightsContainingNode(node) {
  let el =
    node.nodeType === Node.ELEMENT_NODE
      ? /** @type {Element} */ (node)
      : node.parentElement;

  const highlights = [];

  while (el) {
    if (el.classList.contains(HighlightingConfig.HL_CLASS_NAME)) {
      highlights.push(/** @type {HighlightElement} */ (el));
    }
    el = el.parentElement;
  }

  return highlights;
}/*
* TODO:
*  - Improve on readability
*/

/**
 * Based on Hypothesis client's modules (see https://github.com/hypothesis/client):
 *   - src/annotator/guest.js
 */
import {debounce, remove} from 'lodash';
import {highlightRange, removeHighlights} from './highlighting';
import {anchor} from './hypothesis/anchoring/html';
import emitter from 'tiny-emitter/instance';
import {GET} from '@/store/types';
import {sniff} from './hypothesis/anchoring/range';

const emitAnchorsUpdate = debounce((anchors) => {
    emitter.emit('anchors-updated', anchors);
}, 500);

export class Anchoring {
    /**
     * @param {HTMLElement} root
     * @param {Anchor[]} anchors
     */
    constructor(root, store, anchors = []) {
        this.anchoring = {anchor};
        this.root = root;
        this.anchors = anchors;
        this.anchoringPromise = Promise.resolve();
        this.unsubscribe = store.watch(
            (_, getters) => getters[GET.FILTERED_ANNOTATIONS] || getters[GET.ANNOTATIONS],
            (newAnnotations) => {
                this.detachAllAnnotations();
                this.anchorAnnotations(newAnnotations);
            });
    }

    _chainToAnchoringPromise(onFulfilled) {
        this.anchoringPromise = this.anchoringPromise.then(onFulfilled).then(() => {
            this.sync();
        });
    }

    /**
     * Anchor (locate) an annotation's selectors in the document.
     * Used after new annotation have been loaded & after new annotation has been created.
     *
     * @param {Annotation} annotation
     * @return {Promise<Anchor[]>}
     */
    anchorAnnotation(annotation) {
        this._chainToAnchoringPromise(() => {
            let anchor;

            // Anchors for all annotations are in the `anchors` instance property. These
            // are anchors for this annotation only. After all the targets have been
            // processed these will be appended to the list of anchors known to the
            // instance. Anchors hold an annotation, a target of that annotation, a
            // document range for that target and an Array of highlights.
            const anchors = [];

            // The targets that are already anchored. This function consults this to
            // determine which targets can be left alone.
            const anchoredTargets = [];

            // These are the highlights for existing anchors of this annotation with
            // targets that have since been removed from the annotation. These will
            // be removed by this function.
            let deadHighlights = [];

            /**
             * Locate the region of the current document that the annotation refers to.
             *
             * @param {Target} target
             */
            const locate = target => {
                // Check that the anchor has a TextQuoteSelector -- without a
                // TextQuoteSelector we have no basis on which to verify that we have
                // reanchored correctly and so we shouldn't even try.
                //
                // Returning an anchor without a range will result in this annotation being
                // treated as an orphan (assuming no other targets anchor).
                if (
                    !target.selectors ||
                    !target.selectors.some(s => s.type === 'TextQuoteSelector')
                ) {
                    return Promise.resolve({annotation, target});
                }

                // Find a target using the anchoring module.
                return this.anchoring.anchor(this.root, target.selectors)
                    .then(range => ({
                        annotation,
                        target,
                        range,
                    }))
                    .catch(() => ({
                        annotation,
                        target,
                    }));
            };

            /**
             * Highlight the range for an anchor.
             *
             * @param {Anchor} anchor
             */
            const highlight = anchor => {
                if (!anchor.range) {
                    return anchor;
                }
                const range = sniff(anchor.range);
                const normedRange = range.normalize(this.root);
                const highlights = /** @type {AnnotationHighlight[]} */ (highlightRange(
                    normedRange,
                    anchor.target.styleClass
                ));
                // You need to put some information on the highlight so when it is clicked later on we can identify the annotation
                highlights.forEach(h => {
                    h._annotation = anchor.annotation;
                });
                anchor.highlights = highlights;
                return anchor;
            };

            const getAnnotationsAnchoringState = anchors => {
                let hasAnchorableTargets = false;
                let hasAnchoredTargets = false;
                for (let anchor of anchors) {
                    if (anchor.target.selectors) {
                        hasAnchorableTargets = true;
                        if (anchor.range) {
                            hasAnchoredTargets = true;
                            break;
                        }
                    }
                }
                return {hasAnchorableTargets, hasAnchoredTargets};
            };

            const markOrphans = anchors => {
                // An annotation is considered to be an orphan if it has at least one
                // target with selectors, and all targets with selectors failed to anchor
                // (i.e. we didn't find it in the page and thus it has no range).
                let {hasAnchorableTargets, hasAnchoredTargets} = getAnnotationsAnchoringState(anchors);
                annotation.$orphan = hasAnchorableTargets && !hasAnchoredTargets;
                return anchors;
            };

            // Remove all the anchors for this annotation from the instance storage.
            for (anchor of this.anchors.splice(0, this.anchors.length)) {
                if (anchor.annotation === annotation || anchor.annotation.id === annotation.id) {
                    // Anchors are valid as long as they still have a range and their target
                    // is still in the list of targets for this annotation.
                    if (anchor.range && (annotation.target === anchor.target || annotation.target.id === anchor.target.id)) {
                        anchors.push(anchor);
                        anchoredTargets.push(anchor.target);
                    } else if (anchor.highlights) {
                        // These highlights are no longer valid and should be removed.
                        deadHighlights = deadHighlights.concat(anchor.highlights);
                        delete anchor.highlights;
                        delete anchor.range;
                    }
                } else {
                    // These can be ignored, so push them back onto the new list.
                    this.anchors.push(anchor);
                }
            }

            // Remove all the highlights that have no corresponding target anymore.
            requestAnimationFrame(() => removeHighlights(deadHighlights));

            // Actual work going on
            // Anchor the target of this annotation that is not anchored already.
            if (!anchoredTargets.includes(annotation.target) || !anchoredTargets.map(({id}) => id).includes(annotation.target.id)) {
                anchor = locate(annotation.target).then(highlight);
                anchors.push(anchor);
            }
            return Promise.all(anchors).then(markOrphans).then(anchors => {
                this.anchors.push(...anchors);
            });
        });
    }

    anchorAnnotations(annotations) {
        annotations.forEach(a => {
            this.anchorAnnotation(a);
        });
    }

    detachAllAnnotations() {
        this._chainToAnchoringPromise(() => {
            this.removeHighlights(this.getAllHighlights());
            this.anchors = [];
        });
    }

    /**
     * Remove the anchors and associated highlights for an annotation from the document.
     *
     * @param {Annotation} annotation
     */
    detachAnnotation(annotation) {
        this._chainToAnchoringPromise(() => {
            const anchorsOfAnnotation = remove(this.anchors, anchor => {
                return anchor.annotation.id === annotation.id;
            });
            const highlightsOfAnnotation = anchorsOfAnnotation.reduce(
                (highlights, anchor) => highlights.concat(anchor.highlights || []), [],
            );
            this.removeHighlights(highlightsOfAnnotation);
        });
    }

    detachAnnotations(annotations) {
        annotations.forEach(annotation => {
            this.detachAnnotation(annotation);
        });
    }

    getAllHighlights() {
        return this.anchors.reduce((highlights, anchor) => {
            highlights.push(...(anchor.highlights || []));
            return highlights;
        }, []);
    }

    removeHighlights(highlights) {
        requestAnimationFrame(() => {
            removeHighlights(highlights);
        });
    }

    /**
     * Inform other parts of the application about
     * the results of anchoring.
     */
    sync() {
        emitAnchorsUpdate([...this.anchors]);
    }
}
import {remove} from 'lodash';
import {THREAD_CONTAINER_ID} from "@/config/constants";
import {ACT} from "@/store/types";

const entryIntersecting = (entry, root) => entry.isIntersecting || elementsIntersecting(entry.target, root)

const elementsIntersecting = (element, root) => rectsIntersecting(element.getBoundingClientRect(), root.getBoundingClientRect())

const rectsIntersecting =
    (r1, r2) => !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top)

const isHidden = (el) => el.offsetParent === null

export class PostReadingStatusEstimator {
    static initialized = false
    static intersectionLogs = []
    static intersectionObserver = null
    static root = null

    static init() {
        this.root = document.getElementById(THREAD_CONTAINER_ID)
        this.intersectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const isIntersecting = entryIntersecting(entry, this.root)
                const {target} = entry
                const {dataset} = target
                const log = {
                    postId: Number(dataset.postId),
                    threadId: Number(dataset.threadId),
                    isTop: dataset.position === 'top',
                }
                if (isIntersecting && !isHidden(target)) {
                    const logOfOtherEnd = this.intersectionLogs.find(({postId, isTop}) => postId === log.postId && isTop !== log.isTop)
                    if (logOfOtherEnd) this.createPostReading(log);
                    else this.intersectionLogs.push(log)
                } else {
                    const contentElement = log.isTop ? target.nextSibling : target.previousSibling
                    if (!elementsIntersecting(contentElement, this.root)) remove(this.intersectionLogs, ({postId}) => postId === log.postId)
                }
            })
        }, {root: this.root})
        this.initialized = true
    }

    static createPostReading(log) {
        this.toggleReadingStatus(log.postId, log.threadId); // TODO: Await this, so no new logs for the post trigger in the meanwhile
        remove(this.intersectionLogs, ({postId}) => postId === log.postId); // TODO Is it dangerous manipulating the array asynchronously?
    }

    // TODO Replace by setting instead of toggling
    static toggleReadingStatus(postId, threadId) {
        this.store.dispatch(ACT.TOGGLE_POST_READING, {postId, threadId})
    }

    static startEstimating(store, postTopIndicator, postBottomIndicator) {
        if (!this.store) this.store = store
        if (!this.initialized) this.init() // TODO Handle async to omit multiple init
        this.intersectionObserver.observe(postTopIndicator)
        this.intersectionObserver.observe(postBottomIndicator)
        return this.stopEstimating.bind(this, postTopIndicator, postBottomIndicator)
    }

    static stopEstimating(postTopIndicator, postBottomIndicator) {
        this.intersectionObserver.unobserve(postTopIndicator)
        this.intersectionObserver.unobserve(postBottomIndicator)
    }
}
import {ArrowDirection, ARROW_H_MARGIN} from '../../config/constants';

/**
 * @typedef Target
 * @prop {number} left - Offset from left edge of viewport.
 * @prop {number} top - Offset from top edge of viewport.
 * @prop {ArrowDirection} arrowDirection - Direction of the AnnotationToolbar's arrow.
 */

/**
 * Return the closest ancestor of `el` which has been positioned.
 *
 * If no ancestor has been positioned, returns the root element.
 *
 * @param {Element} el
 * @return {Element}
 */
function nearestPositionedAncestor(el) {
  let parentEl = /** @type {Element} */ (el.parentElement);
  while (parentEl.parentElement) {
    if (getComputedStyle(parentEl).position !== 'static') {
      break;
    }
    parentEl = parentEl.parentElement;
  }
  return parentEl;
}

/**
 * Container for the 'AnnotationToolbar' toolbar which provides controls for the user to
 * annotate and highlight the selected text.
 *
 * The toolbar implementation is split between this class, which is
 * the container for the toolbar that positions it on the page and isolates
 * it from the page's styles using shadow DOM, and the `AnnotationToolbarPopoverToolbar` Preact
 * component which actually renders the toolbar.
 */
export class AnnotationToolbarPopoverPositioner {
  /**
   * Create the toolbar's container and hide it.
   *
   * The AnnotationToolbar is initially hidden.
   *
   * @param {HTMLElement} container - The DOM element into which the AnnotationToolbar will be created
   * TODO
   */
  constructor(container, height, width, arrowHeight) {
    this._container = container;
    this._view = /** @type {Window} */ (container.ownerDocument.defaultView);
    this._height = height;
    this._width = width;
    this._arrowHeight = arrowHeight;
  }

  calculatePositionProps(selectionRect, isRTLselection) {
    const {left, top, arrowDirection} = this._calculateTarget(selectionRect, isRTLselection);
    const zIndex = this._findZindex(left, top);
    return {
      left,
      top,
      arrowDirection,
      zIndex
    };
  }

  /**
   *  Determine the best position for the AnnotationToolbar and its pointer-arrow.
   * - Position the pointer-arrow near the end of the selection (where the user's
   *   cursor/input is most likely to be)
   * - Position the AnnotationToolbar to center horizontally on the pointer-arrow
   * - Position the AnnotationToolbar below the selection (arrow pointing up) for LTR selections
   *   and above (arrow down) for RTL selections
   *
   * @param {DOMRect} selectionRect - The rect of text to target, in viewport
   *        coordinates.
   * @param {boolean} isRTLselection - True if the selection was made
   *        rigth-to-left, such that the focus point is mosty likely at the
   *        top-left edge of `targetRect`.
   * @return {Target}
   */
  _calculateTarget(selectionRect, isRTLselection) {
    // Set the initial arrow direction based on whether the selection was made
    // forwards/upwards or downwards/backwards.
    /** @type {ArrowDirection} */ let arrowDirection;
    if (isRTLselection) {
      arrowDirection = ArrowDirection.DOWN;
    } else {
      arrowDirection = ArrowDirection.UP;
    }
    let top;
    let left;

    // Position the AnnotationToolbar such that the arrow it is above or below the selection
    // and close to the end.
    const hMargin = Math.min(ARROW_H_MARGIN, selectionRect.width);
    if (isRTLselection) {
      left = selectionRect.left - this._width() / 2 + hMargin;
    } else {
      left =
        selectionRect.left + selectionRect.width - this._width() / 2 - hMargin;
    }

    // Flip arrow direction if AnnotationToolbar would appear above the top or below the
    // bottom of the viewport.
    if (
      selectionRect.top - this._height() < 0 &&
      arrowDirection === ArrowDirection.DOWN
    ) {
      arrowDirection = ArrowDirection.UP;
    } else if (selectionRect.top + this._height() > this._view.innerHeight) {
      arrowDirection = ArrowDirection.DOWN;
    }

    if (arrowDirection === ArrowDirection.UP) {
      top = selectionRect.top + selectionRect.height + this._arrowHeight();
    } else {
      top = selectionRect.top - this._height() - this._arrowHeight();
    }
    const {left: constrainedLeft, top: constrainedTop} = this.constrainPositionToViewport(left, top);
    return {left: constrainedLeft, top: constrainedTop, arrowDirection};
  }

  constrainPositionToViewport(left, top) {
    left = Math.max(left, 0);
    left = Math.min(left, this._view.innerWidth - this._width());

    top = Math.max(top, 0);
    top = Math.min(top, this._view.innerHeight - this._height());
    return {left, top};
  }

  /**
   * Find a Z index value that will cause the AnnotationToolbar to appear on top of any
   * content in the document when the AnnotationToolbar is shown at (left, top).
   *
   * @param {number} left - Horizontal offset from left edge of viewport.
   * @param {number} top - Vertical offset from top edge of viewport.
   * @return {number} - greatest zIndex (default value of 1)
   */
  _findZindex(left, top) {
    if (document.elementsFromPoint === undefined) {
      // In case of not being able to use `document.elementsFromPoint`,
      // default to the large arbitrary number (2^15)
      return 32768;
    }

    // Find the Z index of all the elements in the screen for five positions
    // around the AnnotationToolbar (left-top, left-bottom, middle-center, right-top,
    // right-bottom) and use the greatest.

    // Unique elements so `getComputedStyle` is called the minimum amount of times.
    const elements = new Set([
      ...document.elementsFromPoint(left, top),
      ...document.elementsFromPoint(left, top + this._height()),
      ...document.elementsFromPoint(
        left + this._width() / 2,
        top + this._height() / 2
      ),
      ...document.elementsFromPoint(left + this._width(), top),
      ...document.elementsFromPoint(left + this._width(), top + this._height()),
    ]);

    const zIndexes = [...elements]
      .map(element => +getComputedStyle(element).zIndex)
      .filter(Number.isInteger);

    // Make sure the array contains at least one element,
    // otherwise `Math.max(...[])` results in +Infinity
    zIndexes.push(0);

    return Math.max(...zIndexes) + 1;
  }

  /**
   * Translate the (left, top) viewport coordinates into positions relative to
   * the AnnotationToolbar's nearest positioned ancestor (NPA).
   *
   * Typically the AnnotationToolbar is a child of the `<body>` and the NPA is the root
   * `<html>` element. However page styling may make the `<body>` positioned.
   * See https://github.com/hypothesis/client/issues/487.
   *
   * @param {number} left - Horizontal offset from left edge of viewport.
   * @param {number} top - Vertical offset from top edge of viewport.
   */
  _toCoordsRelativeToNPA(left, top) {
    const positionedAncestor = nearestPositionedAncestor(this._container);
    const parentRect = positionedAncestor.getBoundingClientRect();
    return {
      left: left - parentRect.left,
      top: top - parentRect.top,
    };
  }
}
import * as observable from './util/observable';

/** Returns the selected `DOMRange` in `document`. */
function selectedRange(document) {
  const selection = document.getSelection();
  if (!selection.rangeCount) return null;

  let index = 0;
  const range = selection.getRangeAt(index);
  while (++index < selection.rangeCount) {
    const nextRange = selection.getRangeAt(index);
    range.setEnd(nextRange.endContainer, nextRange.endOffset);
  }
  return range.collapsed ? null : range;
}

/**
 * Returns an Observable stream of text selections in the current document.
 *
 * New values are emitted when the user finishes making a selection
 * (represented by a `DOMRange`) or clears a selection (represented by `null`).
 *
 * A value will be emitted with the selected range at the time of subscription
 * on the next tick.
 *
 * @return Observable<DOMRange|null>
 */
export default function selections(document) {
  // Get a stream of selection changes that occur whilst the user is not
  // making a selection with the mouse.
  let isMouseDown;
  const selectionEvents = observable
    .listen(document, ['mousedown', 'mouseup', 'selectionchange'])
    .filter(function(event) {
      if (event.type === 'mousedown' || event.type === 'mouseup') {
        isMouseDown = event.type === 'mousedown';
        return false;
      } else {
        return !isMouseDown;
      }
    });

  const events = observable.merge([
    // Add a delay before checking the state of the selection because
    // the selection is not updated immediately after a 'mouseup' event
    // but only on the next tick of the event loop.
    observable.buffer(10, observable.listen(document, ['mouseup'])),

    // Buffer selection changes to avoid continually emitting events whilst the
    // user drags the selection handles on mobile devices
    observable.buffer(100, selectionEvents),

    // Emit an initial event on the next tick
    observable.delay(0, observable.Observable.of({})),
  ]);

  return events.map(function() {
    return selectedRange(document);
  });
}
/**
 * Functions (aka. 'operators') for generating and manipulating streams of
 * values using the Observable API.
 */

import Observable from 'zen-observable';

/**
 * Returns an observable of events emitted by a DOM event source
 * (eg. an Element, Document or Window).
 *
 * @param {EventTarget} src - The event source.
 * @param {Array<string>} eventNames - List of events to subscribe to
 */
export function listen(src, eventNames) {
  return new Observable(function (observer) {
    const onNext = function (event) {
      observer.next(event);
    };

    eventNames.forEach(function (event) {
      src.addEventListener(event, onNext);
    });

    return function () {
      eventNames.forEach(function (event) {
        src.removeEventListener(event, onNext);
      });
    };
  });
}

/**
 * Delay events from a source Observable by `delay` ms.
 */
export function delay(delay, src) {
  return new Observable(function (obs) {
    let timeouts = [];
    const sub = src.subscribe({
      next: function (value) {
        const t = setTimeout(function () {
          timeouts = timeouts.filter(function (other) {
            return other !== t;
          });
          obs.next(value);
        }, delay);
        timeouts.push(t);
      },
    });
    return function () {
      timeouts.forEach(clearTimeout);
      sub.unsubscribe();
    };
  });
}

/**
 * Buffers events from a source Observable, waiting for a pause of `delay`
 * ms with no events before emitting the last value from `src`.
 *
 * @template T
 * @param {number} delay
 * @param {Observable<T>} src
 * @return {Observable<T>}
 */
export function buffer(delay, src) {
  return new Observable(function (obs) {
    let lastValue;
    let timeout;

    function onNext() {
      obs.next(lastValue);
    }

    const sub = src.subscribe({
      next: function (value) {
        lastValue = value;
        clearTimeout(timeout);
        timeout = setTimeout(onNext, delay);
      },
    });

    return function () {
      sub.unsubscribe();
      clearTimeout(timeout);
    };
  });
}

/**
 * Merges multiple streams of values into a single stream.
 *
 * @param {Array<Observable>} sources
 * @return Observable
 */
export function merge(sources) {
  return new Observable(function (obs) {
    const subs = sources.map(function (src) {
      return src.subscribe({
        next: function (value) {
          obs.next(value);
        },
      });
    });

    return function () {
      subs.forEach(function (sub) {
        sub.unsubscribe();
      });
    };
  });
}

/** Drop the first `n` events from the `src` Observable. */
export function drop(src, n) {
  let count = 0;
  return src.filter(function () {
    ++count;
    return count > n;
  });
}

export { Observable };
/**
 * Return a normalized version of a URI.
 *
 * This makes it absolute and strips the fragment identifier.
 *
 * @param {string} uri - Relative or absolute URL
 * @param {string} [base] - Base URL to resolve relative to. Defaults to
 *   the document's base URL.
 */
export function normalizeURI(uri, base = document.baseURI) {
  const absUrl = new URL(uri, base).href;

  // Remove the fragment identifier.
  // This is done on the serialized URL rather than modifying `url.hash` due to
  // a bug in Safari.
  // See https://github.com/hypothesis/h/issues/3471#issuecomment-226713750
  return absUrl.toString().replace(/#.*/, '');
}
/**
 * Returns true if the start point of a selection occurs after the end point,
 * in document order.
 *
 * @param {Selection} selection
 */
export function isSelectionBackwards(selection) {
  if (selection.focusNode === selection.anchorNode) {
    return selection.focusOffset < selection.anchorOffset;
  }

  const range = selection.getRangeAt(0);
  return range.startContainer === selection.focusNode;
}

/**
 * Returns true if `node` lies within a range.
 *
 * This is a simplified version of `Range.isPointInRange()` for compatibility
 * with IE.
 *
 * @param {Range} range
 * @param {Node} node
 */
export function isNodeInRange(range, node) {
  if (node === range.startContainer || node === range.endContainer) {
    return true;
  }

  const nodeRange = /** @type {Document} */ (node.ownerDocument).createRange();
  nodeRange.selectNode(node);
  const isAtOrBeforeStart =
    range.compareBoundaryPoints(Range.START_TO_START, nodeRange) <= 0;
  const isAtOrAfterEnd =
    range.compareBoundaryPoints(Range.END_TO_END, nodeRange) >= 0;
  nodeRange.detach();
  return isAtOrBeforeStart && isAtOrAfterEnd;
}

/**
 * Iterate over all Node(s) in `range` in document order and invoke `callback`
 * for each of them.
 *
 * @param {Range} range
 * @param {(n: Node) => any} callback
 */
function forEachNodeInRange(range, callback) {
  const root = range.commonAncestorContainer;

  // The `whatToShow`, `filter` and `expandEntityReferences` arguments are
  // mandatory in IE although optional according to the spec.
  const nodeIter = /** @type {Document} */ (root.ownerDocument).createNodeIterator(
    root,
    NodeFilter.SHOW_ALL
  );

  let currentNode;
  while ((currentNode = nodeIter.nextNode())) {
    // eslint-disable-line no-cond-assign
    if (isNodeInRange(range, currentNode)) {
      callback(currentNode);
    }
  }
}

/**
 * Returns the bounding rectangles of non-whitespace text nodes in `range`.
 *
 * @param {Range} range
 * @return {Array<DOMRect>} Array of bounding rects in viewport coordinates.
 */
export function getTextBoundingBoxes(range) {
  const whitespaceOnly = /^\s*$/;
  const textNodes = [];
  forEachNodeInRange(range, function (node) {
    if (
      node.nodeType === Node.TEXT_NODE &&
      !(/** @type {string} */ (node.textContent).match(whitespaceOnly))
    ) {
      textNodes.push(node);
    }
  });

  let rects = [];
  textNodes.forEach(function (node) {
    const nodeRange = node.ownerDocument.createRange();
    nodeRange.selectNodeContents(node);
    if (node === range.startContainer) {
      nodeRange.setStart(node, range.startOffset);
    }
    if (node === range.endContainer) {
      nodeRange.setEnd(node, range.endOffset);
    }
    if (nodeRange.collapsed) {
      // If the range ends at the start of this text node or starts at the end
      // of this node then do not include it.
      return;
    }

    // Measure the range and translate from viewport to document coordinates
    const viewportRects = Array.from(nodeRange.getClientRects());
    nodeRange.detach();
    rects = rects.concat(viewportRects);
  });
  return rects;
}

/**
 * Returns the rectangle, in viewport coordinates, for the line of text
 * containing the focus point of a Selection.
 *
 * Returns null if the selection is empty.
 *
 * @param {Selection} selection
 * @return {DOMRect|null}
 */
export function selectionFocusRect(selection) {
  if (selection.isCollapsed) {
    return null;
  }
  const textBoxes = getTextBoundingBoxes(selection.getRangeAt(0));
  if (textBoxes.length === 0) {
    return null;
  }
  if (isSelectionBackwards(selection)) {
    return textBoxes[0];
  } else {
    return textBoxes[textBoxes.length - 1];
  }
}

/**
 * Retrieve a set of items associated with nodes in a given range.
 *
 * An `item` can be any data that the caller wishes to compute from or associate
 * with a node. Only unique items, as determined by `Object.is`, are returned.
 *
 * @template T
 * @param {Range} range
 * @param {(n: Node) => T} itemForNode - Callback returning the item for a given node
 * @return {T[]} items
 */
export function itemsForRange(range, itemForNode) {
  const checkedNodes = new Set();
  const items = new Set();

  forEachNodeInRange(range, node => {
    /** @type {Node|null} */
    let current = node;
    while (current) {
      if (checkedNodes.has(current)) {
        break;
      }
      checkedNodes.add(current);

      const item = itemForNode(current);
      if (item) {
        items.add(item);
      }

      current = current.parentNode;
    }
  });

  return [...items];
}
import {RangeAnchor, TextPositionAnchor, TextQuoteAnchor} from './types';

/**
 * @typedef {import("./types").AnyRangeType} AnyRangeType
 * @typedef {import('../../api').Selector} Selector
 */

/**
 * @param {RangeAnchor|TextPositionAnchor|TextQuoteAnchor} anchor
 * @param {Object} [options]
 *  @param {number} [options.hint]
 */
async function querySelector(anchor, options = {}) {
  return anchor.toRange(options);
}

/**
 * Anchor a set of selectors.
 *
 * This function converts a set of selectors into a document range.
 * It encapsulates the core anchoring algorithm, using the selectors alone or
 * in combination to establish the best anchor within the document.
 *
 * @param {Node} root - The root element of the anchoring context.
 * @param {Selector[]} selectors - The selectors to try.
 * @param {Object} [options]
 *   @param {number} [options.hint]
 */
export function anchor(root, selectors, options = {}) {
  let position = null;
  let quote = null;
  let range = null;

  // Collect all the selectors
  for (let selector of selectors) {
    switch (selector.type) {
      case 'TextPositionSelector':
        position = selector;
        options.hint = position.start; // TextQuoteAnchor hint
        break;
      case 'TextQuoteSelector':
        quote = selector;
        break;
      case 'RangeSelector':
        range = selector;
        break;
    }
  }

  /**
   * Assert the quote matches the stored quote, if applicable
   * @param {Range} range
   */
  const maybeAssertQuote = range => {
    if (quote && quote.exact && range.toString() !== quote.exact) {
      throw new Error('quote mismatch');
    } else {
      return range;
    }
  };

  // From a default of failure, we build up catch clauses to try selectors in
  // order, from simple to complex.
  /** @type {Promise<Range>} */
  let promise = Promise.reject('unable to anchor');

  if (range) {
    promise = promise.catch(() => {
      let anchor = RangeAnchor.fromSelector(root, range);
      return querySelector(anchor, options).then(maybeAssertQuote);
    });
  }

  if (position) {
    promise = promise.catch(() => {
      let anchor = TextPositionAnchor.fromSelector(root, position);
      return querySelector(anchor, options).then(maybeAssertQuote);
    });
  }

  if (quote) {
    promise = promise.catch(() => {
      let anchor = TextQuoteAnchor.fromSelector(root, quote);
      return querySelector(anchor, options);
    });
  }

  return promise;
}

/**
 * @param {Node} root
 * @param {Range} range
 */
export function describe(root, range) {
  const types = [RangeAnchor, TextPositionAnchor, TextQuoteAnchor];
  const result = [];
  for (let type of types) {
    try {
      const anchor = type.fromRange(root, range);
      result.push(anchor.toSelector());
    } catch (error) {
      continue;
    }
  }
  return result;
}
/**
 * Get the node name for use in generating an xpath expression.
 *
 * @param {Node} node
 */
function getNodeName(node) {
  const nodeName = node.nodeName.toLowerCase();
  let result = nodeName;
  if (nodeName === '#text') {
    result = 'text()';
  }
  return result;
}

/**
 * Get the index of the node as it appears in its parent's child list
 *
 * @param {Node} node
 */
function getNodePosition(node) {
  let pos = 0;
  /** @type {Node|null} */
  let tmp = node;
  while (tmp) {
    if (tmp.nodeName === node.nodeName) {
      pos += 1;
    }
    tmp = tmp.previousSibling;
  }
  return pos;
}

function getPathSegment(node) {
  const name = getNodeName(node);
  const pos = getNodePosition(node);
  return `${name}[${pos}]`;
}

/**
 * A simple XPath generator which can generate XPaths of the form
 * /tag[index]/tag[index].
 *
 * @param {Node} node - The node to generate a path to
 * @param {Node} root - Root node to which the returned path is relative
 */
export function xpathFromNode(node, root) {
  let xpath = '';

  /** @type {Node|null} */
  let elem = node;
  while (elem !== root) {
    if (!elem) {
      throw new Error('Node is not a descendant of root');
    }
    xpath = getPathSegment(elem) + '/' + xpath;
    elem = elem.parentNode;
  }
  xpath = '/' + xpath;
  xpath = xpath.replace(/\/$/, ''); // Remove trailing slash

  return xpath;
}

/**
 * Return all text node descendants of `parent`.
 *
 * @param {Node} parent
 * @return {Text[]}
 */
export function getTextNodes(parent) {
  const nodes = [];
  for (let node of Array.from(parent.childNodes)) {
    // We test `nodeType` here rather than using `instanceof` because we have
    // tests where `node` comes from a different iframe.
    if (node.nodeType === Node.TEXT_NODE) {
      nodes.push(/** @type {Text} */ (node));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      nodes.push(...getTextNodes(/** @type {Element} */ (node)));
    }
  }
  return nodes;
}

/**
 * Determine the last text node inside or before the given node.
 */
export function getLastTextNodeUpTo(node) {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      return node; // We have found our text node.
    case Node.ELEMENT_NODE:
      // This is an element, we need to dig in
      if (node.lastChild) {
        // Does it have children at all?
        const result = getLastTextNodeUpTo(node.lastChild);
        if (result) {
          return result;
        }
      }
  }
  // Could not find a text node in current node, go backwards
  const prev = node.previousSibling;
  if (prev) {
    // eslint-disable-next-line no-unused-vars
    return getLastTextNodeUpTo(prev);
  } else {
    return null;
  }
}

/**
 * Determine the first text node in or after the given node.
 */
export function getFirstTextNodeNotBefore(node) {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      return node; // We have found our text node.
    case Node.ELEMENT_NODE:
      // This is an element, we need to dig in
      if (node.firstChild) {
        // Does it have children at all?
        const result = getFirstTextNodeNotBefore(node.firstChild);
        if (result) {
          return result;
        }
      }
  }
  // Could not find a text node in current node, go forward
  const next = node.nextSibling;
  if (next) {
    // eslint-disable-next-line no-unused-vars
    return getFirstTextNodeNotBefore(next);
  } else {
    return null;
  }
}
import { xpathFromNode, nodeFromXPath } from './xpath';
import {
  getFirstTextNodeNotBefore,
  getLastTextNodeUpTo,
  getTextNodes,
} from './xpath-util';

/**
 * Return ancestors of `node`.
 *
 * @param {Node} node
 */
function parents(node) {
  const parents = [];
  while (node.parentElement) {
    parents.push(node.parentElement);
    node = node.parentElement;
  }
  return parents;
}

/**
 * Creates a wrapper around a range object obtained from a DOMSelection.
 */
export class BrowserRange {
  /**
   * Creates an instance of BrowserRange.
   *
   * object - A range object obtained via DOMSelection#getRangeAt().
   *
   * Examples
   *
   *   selection = window.getSelection()
   *   range = new Range.BrowserRange(selection.getRangeAt(0))
   *
   * Returns an instance of BrowserRange.
   */
  constructor(obj) {
    this.commonAncestorContainer = obj.commonAncestorContainer;
    this.startContainer = obj.startContainer;
    this.startOffset = obj.startOffset;
    this.endContainer = obj.endContainer;
    this.endOffset = obj.endOffset;
    this.tainted = false;
  }

  /**
   * normalize works around the fact that browsers don't generate
   * ranges/selections in a consistent manner. Some (Safari) will create
   * ranges that have (say) a textNode startContainer and elementNode
   * endContainer. Others (Firefox) seem to only ever generate
   * textNode/textNode or elementNode/elementNode pairs.
   *
   * Returns an instance of NormalizedRange
   */
  normalize() {
    if (this.tainted) {
      throw new Error('You may only call normalize() once on a BrowserRange!');
    } else {
      this.tainted = true;
    }
    const range = {};

    // Look at the start
    if (this.startContainer.nodeType === Node.ELEMENT_NODE) {
      // We are dealing with element nodes
      if (this.startOffset < this.startContainer.childNodes.length) {
        range.start = getFirstTextNodeNotBefore(
          this.startContainer.childNodes[this.startOffset]
        );
      } else {
        range.start = getFirstTextNodeNotBefore(this.startContainer);
      }
      range.startOffset = 0;
    } else {
      // We are dealing with simple text nodes
      range.start = this.startContainer;
      range.startOffset = this.startOffset;
    }

    // Look at the end
    if (this.endContainer.nodeType === Node.ELEMENT_NODE) {
      // Get specified node.
      let node = this.endContainer.childNodes[this.endOffset];
      // Does that node exist?
      if (node) {
        // Look for a text node either at the immediate beginning of node
        let n = node;
        while (n && n.nodeType !== Node.TEXT_NODE) {
          n = n.firstChild;
        }
        // Did we find a text node at the start of this element?
        if (n) {
          range.end = n;
          range.endOffset = 0;
        }
      }

      if (!range.end) {
        // We need to find a text node in the previous sibling of the node at the
        // given offset, if one exists, or in the previous sibling of its container.
        if (this.endOffset) {
          node = this.endContainer.childNodes[this.endOffset - 1];
        } else {
          node = this.endContainer.previousSibling;
        }
        range.end = getLastTextNodeUpTo(node);
        range.endOffset = range.end.nodeValue.length;
      }
    } else {
      // We are dealing with simple text nodes
      range.end = this.endContainer;
      range.endOffset = this.endOffset;
    }

    // We have collected the initial data.
    // Now let's start to slice & dice the text elements!
    const normalRange = {};

    if (range.startOffset > 0) {
      // Do we really have to cut?
      if (
        !range.start.nextSibling ||
        range.start.nodeValue.length > range.startOffset
      ) {
        // Yes. Cut.
        normalRange.start = range.start.splitText(range.startOffset);
      } else {
        // Avoid splitting off zero-length pieces.
        normalRange.start = getFirstTextNodeNotBefore(range.start.nextSibling);
      }
    } else {
      normalRange.start = range.start;
    }

    // Is the whole selection inside one text element?
    if (range.start === range.end) {
      if (
        normalRange.start.nodeValue.length >
        range.endOffset - range.startOffset
      ) {
        normalRange.start.splitText(range.endOffset - range.startOffset);
      }
      normalRange.end = normalRange.start;
    } else {
      // No, the end of the selection is in a separate text element
      // does the end need to be cut?
      if (range.end.nodeValue.length > range.endOffset) {
        range.end.splitText(range.endOffset);
      }
      normalRange.end = range.end;
    }

    // Make sure the common ancestor is an element node.
    normalRange.commonAncestor = this.commonAncestorContainer;
    while (normalRange.commonAncestor.nodeType !== Node.ELEMENT_NODE) {
      normalRange.commonAncestor = normalRange.commonAncestor.parentNode;
    }

    // Circular dependency. Remove this once *Range classes are refactored
    // eslint-disable-next-line no-use-before-define
    return new NormalizedRange(normalRange);
  }

  /**
   * Creates a range suitable for storage.
   *
   * root           - A root Element from which to anchor the serialization.
   *
   * Returns an instance of SerializedRange.
   */
  serialize(root) {
    return this.normalize().serialize(root);
  }
}

/**
 * A normalized range is most commonly used throughout the annotator.
 * its the result of a deserialized SerializedRange or a BrowserRange without
 * browser inconsistencies.
 */
export class NormalizedRange {
  /**
   * Creates an instance of a NormalizedRange.
   *
   * This is usually created by calling the .normalize() method on one of the
   * other Range classes rather than manually.
   *
   * obj - An Object literal. Should have the following properties.
   *       commonAncestor: A Element that encompasses both the start and end nodes
   *       start:          The first TextNode in the range.
   *       end             The last TextNode in the range.
   *
   * Returns an instance of NormalizedRange.
   */
  constructor(obj) {
    this.commonAncestor = obj.commonAncestor;
    this.start = obj.start;
    this.end = obj.end;
  }

  /**
   * For API consistency.
   *
   * Returns itself.
   */
  normalize() {
    return this;
  }

  /**
   * Limits the nodes within the NormalizedRange to those contained
   * withing the bounds parameter. It returns an updated range with all
   * properties updated. NOTE: Method returns null if all nodes fall outside
   * of the bounds.
   *
   * bounds - An Element to limit the range to.
   *
   * Returns updated self or null.
   */
  limit(bounds) {
    const nodes = this.textNodes().filter(node =>
      bounds.contains(node.parentNode)
    );
    if (!nodes.length) {
      return null;
    }

    this.start = nodes[0];
    this.end = nodes[nodes.length - 1];

    const startParents = parents(this.start);

    for (let parent of parents(this.end)) {
      if (startParents.indexOf(parent) !== -1) {
        this.commonAncestor = parent;
        break;
      }
    }
    return this;
  }

  /**
   * Convert this range into an object consisting of two pairs of (xpath,
   * character offset), which can be easily stored in a database.
   *
   * root -           The root Element relative to which XPaths should be calculated
   *
   * Returns an instance of SerializedRange.
   */
  serialize(root) {
    const serialization = (node, isEnd) => {
      const origParent = node.parentElement;
      const xpath = xpathFromNode(origParent, root || document);
      const textNodes = getTextNodes(origParent);
      // Calculate real offset as the combined length of all the
      // preceding textNode siblings. We include the length of the
      // node if it's the end node.
      const nodes = textNodes.slice(0, textNodes.indexOf(node));
      let offset = 0;
      for (let n of nodes) {
        offset += n.data.length;
      }

      if (isEnd) {
        return [xpath, offset + node.nodeValue.length];
      } else {
        return [xpath, offset];
      }
    };

    const start = serialization(this.start);
    const end = serialization(this.end, true);

    // Circular dependency. Remove this once *Range classes are refactored
    // eslint-disable-next-line no-use-before-define
    return new SerializedRange({
      // XPath strings
      start: start[0],
      end: end[0],
      // Character offsets (integer)
      startOffset: start[1],
      endOffset: end[1],
    });
  }

  /**
   * Creates a concatenated String of the contents of all the text nodes
   * within the range.
   *
   * Returns a String.
   */
  text() {
    return this.textNodes()
      .map(node => node.nodeValue)
      .join('');
  }

  /**
   * Fetches only the text nodes within the range.
   *
   * Returns an Array of TextNode instances.
   */
  textNodes() {
    const textNodes = getTextNodes(this.commonAncestor);
    const start = textNodes.indexOf(this.start);
    const end = textNodes.indexOf(this.end);
    // Return the textNodes that fall between the start and end indexes.
    return textNodes.slice(start, +end + 1 || undefined);
  }

  /**
   * Converts the Normalized range to a native browser range.
   *
   * See: https://developer.mozilla.org/en/DOM/range
   *
   * Examples
   *
   *   selection = window.getSelection()
   *   selection.removeAllRanges()
   *   selection.addRange(normedRange.toRange())
   *
   * Returns a Range object.
   */
  toRange() {
    const range = document.createRange();
    range.setStartBefore(this.start);
    range.setEndAfter(this.end);
    return range;
  }
}

/**
 * A range suitable for storing in local storage or serializing to JSON.
 */
export class SerializedRange {
  /**
   * Creates a SerializedRange
   *
   * obj - The stored object. It should have the following properties.
   *       start:       An xpath to the Element containing the first TextNode
   *                    relative to the root Element.
   *       startOffset: The offset to the start of the selection from obj.start.
   *       end:         An xpath to the Element containing the last TextNode
   *                    relative to the root Element.
   *       startOffset: The offset to the end of the selection from obj.end.
   *
   * Returns an instance of SerializedRange
   */
  constructor(obj) {
    this.start = obj.start;
    this.startOffset = obj.startOffset;
    this.end = obj.end;
    this.endOffset = obj.endOffset;
  }

  /**
   * Creates a NormalizedRange.
   *
   * root - The root Element from which the XPaths were generated.
   *
   * Returns a NormalizedRange instance.
   */
  normalize(root) {
    const range = {};

    for (let p of ['start', 'end']) {
      let node;
      try {
        node = nodeFromXPath(this[p], root);
        if (!node) {
          throw new Error('Node not found');
        }
      } catch (e) {
        throw new RangeError(`Error while finding ${p} node: ${this[p]}: ` + e);
      }
      // Unfortunately, we *can't* guarantee only one textNode per
      // elementNode, so we have to walk along the element's textNodes until
      // the combined length of the textNodes to that point exceeds or
      // matches the value of the offset.
      let length = 0;
      let targetOffset = this[p + 'Offset'];

      // Range excludes its endpoint because it describes the boundary position.
      // Target the string index of the last character inside the range.
      if (p === 'end') {
        targetOffset--;
      }

      for (let tn of getTextNodes(node)) {
        if (length + tn.data.length > targetOffset) {
          range[p + 'Container'] = tn;
          range[p + 'Offset'] = this[p + 'Offset'] - length;
          break;
        } else {
          length += tn.data.length;
        }
      }

      // If we fall off the end of the for loop without having set
      // 'startOffset'/'endOffset', the element has shorter content than when
      // we annotated, so throw an error:
      if (range[p + 'Offset'] === undefined) {
        throw new RangeError(
          `Couldn't find offset ${this[p + 'Offset']} in element ${this[p]}`
        );
      }
    }

    for (let parent of parents(range.startContainer)) {
      if (parent.contains(range.endContainer)) {
        range.commonAncestorContainer = parent;
        break;
      }
    }

    return new BrowserRange(range).normalize();
  }

  /**
   * Creates a range suitable for storage.
   *
   * root           - A root Element from which to anchor the serialization.
   *
   * Returns an instance of SerializedRange.
   */
  serialize(root) {
    return this.normalize(root).serialize(root);
  }

  // Returns the range as an Object literal.
  toObject() {
    return {
      start: this.start,
      startOffset: this.startOffset,
      end: this.end,
      endOffset: this.endOffset,
    };
  }
}

/**
 * Determines the type of Range of the provided object and returns
 * a suitable Range instance.
 *
 * r - A range Object.
 *
 * Examples
 *
 *   selection = window.getSelection()
 *   Range.sniff(selection.getRangeAt(0))
 *   # => Returns a BrowserRange instance.
 *
 * Returns a Range object or false.
 */
export function sniff(range) {
  if (range.commonAncestorContainer !== undefined) {
    return new BrowserRange(range);
  } else if (typeof range.start === 'string') {
    return new SerializedRange(range);
  } else if (range.start && typeof range.start === 'object') {
    return new NormalizedRange(range);
  } else {
    throw new Error('Could not sniff range type');
  }
}
/**
 * This module exports a set of classes for converting between DOM `Range`
 * objects and different types of selectors. It is mostly a thin wrapper around a
 * set of anchoring libraries. It serves two main purposes:
 *
 *  1. Providing a consistent interface across different types of anchors.
 *  2. Insulating the rest of the code from API changes in the underlying anchoring
 *     libraries.
 */
import {
  fromRange as posFromRange,
  toRange as posToRange,
} from 'dom-anchor-text-position';
import {
  fromRange as quoteFromRange,
  toRange as quoteToRange,
  toTextPosition,
} from 'dom-anchor-text-quote';

import {SerializedRange, sniff} from './range';

/**
 * @typedef {import("./range").BrowserRange} BrowserRange}
 * @typedef {import("./range").NormalizedRange} NormalizedRange}
 * @typedef {Range|BrowserRange|NormalizedRange|SerializedRange} AnyRangeType
 *
 * @typedef {import('../../api').RangeSelector} RangeSelector
 * @typedef {import('../../api').TextPositionSelector} TextPositionSelector
 * @typedef {import('../../api').TextQuoteSelector} TextQuoteSelector
 *
 * @typedef TextContentNode
 * @prop {string} textContent
 */

/**
 * Converts between `RangeSelector` selectors and `Range` objects.
 */
export class RangeAnchor {
  /**
   * @param {Node} root - A root element from which to anchor.
   * @param {AnyRangeType} range -  A range describing the anchor.
   */
  constructor(root, range) {
    this.root = root;
    this.range = sniff(range).normalize(this.root);
  }

  /**
   * @param {Node} root -  A root element from which to anchor.
   * @param {AnyRangeType} range -  A range describing the anchor.
   */
  static fromRange(root, range) {
    return new RangeAnchor(root, range);
  }

  /**
   * Create an anchor from a serialized `RangeSelector` selector.
   *
   * @param {Node} root -  A root element from which to anchor.
   * @param {RangeSelector} selector
   */
  static fromSelector(root, selector) {
    const data = {
      start: selector.startContainer,
      startOffset: selector.startOffset,
      end: selector.endContainer,
      endOffset: selector.endOffset,
    };
    const range = new SerializedRange(data);
    return new RangeAnchor(root, range);
  }

  toRange() {
    return this.range.toRange();
  }

  /**
   * @return {RangeSelector}
   */
  toSelector() {
    const range = this.range.serialize(this.root);
    return {
      type: 'RangeSelector',
      startContainer: range.start,
      startOffset: range.startOffset,
      endContainer: range.end,
      endOffset: range.endOffset,
    };
  }
}

/**
 * Converts between `TextPositionSelector` selectors and `Range` objects.
 */
export class TextPositionAnchor {
  /**
   * @param {Node|TextContentNode} root
   * @param {number} start
   * @param {number} end
   */
  constructor(root, start, end) {
    this.root = root;
    this.start = start;
    this.end = end;
  }

  /**
   * @param {Node} root
   * @param {Range} range
   */
  static fromRange(root, range) {
    const selector = posFromRange(root, range);
    return TextPositionAnchor.fromSelector(root, selector);
  }
  /**
   * @param {Node} root
   * @param {TextPositionSelector} selector
   */
  static fromSelector(root, selector) {
    return new TextPositionAnchor(root, selector.start, selector.end);
  }

  /**
   * @return {TextPositionSelector}
   */
  toSelector() {
    return {
      type: 'TextPositionSelector',
      start: this.start,
      end: this.end,
    };
  }

  toRange() {
    return posToRange(this.root, {start: this.start, end: this.end});
  }
}

/**
 * Converts between `TextQuoteSelector` selectors and `Range` objects.
 */
export class TextQuoteAnchor {
  /**
   * @param {Node|TextContentNode} root - A root element from which to anchor.
   * @param {string} exact
   * @param {Object} context
   *   @param {string} [context.prefix]
   *   @param {string} [context.suffix]
   */
  constructor(root, exact, context = {}) {
    this.root = root;
    this.exact = exact;
    this.context = context;
  }
  /**
   * @param {Node} root
   * @param {Range} range
   */
  static fromRange(root, range) {
    const selector = quoteFromRange(root, range);
    return TextQuoteAnchor.fromSelector(root, selector);
  }

  /**
   * @param {Node|TextContentNode} root
   * @param {TextQuoteSelector} selector
   */
  static fromSelector(root, selector) {
    const {prefix, suffix} = selector;
    return new TextQuoteAnchor(root, selector.exact, {prefix, suffix});
  }

  /**
   * @return {TextQuoteSelector}
   */
  toSelector() {
    return {
      type: 'TextQuoteSelector',
      exact: this.exact,
      prefix: this.context.prefix,
      suffix: this.context.suffix,
    };
  }

  /**
   * @param {Object} [options]
   *   @param {number} [options.hint] -
   *     Offset hint to disambiguate matches
   *     https://github.com/tilgovi/dom-anchor-text-quote#totextpositionroot-selector-options
   */
  toRange(options = {}) {
    const range = quoteToRange(this.root, this.toSelector(), options);
    if (range === null) {
      throw new Error('Quote not found');
    }
    return range;
  }

  /**
   * @param {Object} [options]
   *   @param {number} [options.hint] -
   *     Offset hint to disambiguate matches
   *     https://github.com/tilgovi/dom-anchor-text-quote#totextpositionroot-selector-options
   */
  toPositionAnchor(options = {}) {
    const anchor = toTextPosition(this.root, this.toSelector(), options);
    if (anchor === null) {
      throw new Error('Quote not found');
    }
    return new TextPositionAnchor(this.root, anchor.start, anchor.end);
  }
}
export { xpathFromNode } from './xpath-util';

/**
 * Return the `index`'th immediate child of `element` whose tag name is
 * `nodeName` (case insensitive).
 *
 * @param {Element} element
 * @param {string} nodeName
 * @param {number} index
 */
function nthChildOfType(element, nodeName, index) {
  nodeName = nodeName.toUpperCase();

  let matchIndex = -1;
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i];
    if (child.nodeName.toUpperCase() === nodeName) {
      ++matchIndex;
      if (matchIndex === index) {
        return child;
      }
    }
  }

  return null;
}

/**
 * Evaluate a _simple XPath_ relative to a `root` element and return the
 * matching element.
 *
 * A _simple XPath_ is a sequence of one or more `/tagName[index]` strings.
 *
 * Unlike `document.evaluate` this function:
 *
 *  - Only supports simple XPaths
 *  - Is not affected by the document's _type_ (HTML or XML/XHTML)
 *  - Ignores element namespaces when matching element names in the XPath against
 *    elements in the DOM tree
 *  - Is case insensitive for all elements, not just HTML elements
 *
 * The matching element is returned or `null` if no such element is found.
 * An error is thrown if `xpath` is not a simple XPath.
 *
 * @param {string} xpath
 * @param {Element} root
 * @return {Element|null}
 */
function evaluateSimpleXPath(xpath, root) {
  const isSimpleXPath =
    xpath.match(/^(\/[A-Za-z0-9-]+(\[[0-9]+\])?)+$/) !== null;
  if (!isSimpleXPath) {
    throw new Error('Expression is not a simple XPath');
  }

  const segments = xpath.split('/');
  let element = root;

  // Remove leading empty segment. The regex above validates that the XPath
  // has at least two segments, with the first being empty and the others non-empty.
  segments.shift();

  for (let segment of segments) {
    let elementName;
    let elementIndex;

    const separatorPos = segment.indexOf('[');
    if (separatorPos !== -1) {
      elementName = segment.slice(0, separatorPos);

      const indexStr = segment.slice(separatorPos + 1, segment.indexOf(']'));
      elementIndex = parseInt(indexStr) - 1;
      if (elementIndex < 0) {
        return null;
      }
    } else {
      elementName = segment;
      elementIndex = 0;
    }

    const child = nthChildOfType(element, elementName, elementIndex);
    if (!child) {
      return null;
    }

    element = child;
  }

  return element;
}

/**
 * Finds an element node using an XPath relative to `root`
 *
 * Example:
 *   node = nodeFromXPath('/main/article[1]/p[3]', document.body)
 *
 * @param {string} xpath
 * @param {Element} [root]
 * @return {Node|null}
 */
export function nodeFromXPath(xpath, root = document.body) {
  try {
    return evaluateSimpleXPath(xpath, root);
  } catch (err) {
    return document.evaluate(
      '.' + xpath,
      root,

      // nb. The `namespaceResolver` and `result` arguments are optional in the spec
      // but required in Edge Legacy.
      null /* namespaceResolver */,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null /* result */
    ).singleNodeValue;
  }
}
/**
 * Type definitions for objects returned from the Hypothesis API.
 *
 * The canonical reference is the API documentation at
 * https://h.readthedocs.io/en/latest/api-reference/
 */

/**
 * @typedef {import("../../types/annotation-target").AnnotationTarget} AnnotationTarget
 */

/**
 * @typedef TextQuoteSelector
 * @prop {'TextQuoteSelector'} type
 * @prop {string} exact
 * @prop {string} [prefix]
 * @prop {string} [suffix]
 */

/**
 * @typedef TextPositionSelector
 * @prop {'TextPositionSelector'} type
 * @prop {number} start
 * @prop {number} end
 */

/**
 * @typedef RangeSelector
 * @prop {'RangeSelector'} type
 * @prop {string} startContainer
 * @prop {string} endContainer
 * @prop {number} startOffset
 * @prop {number} endOffset
 */

/**
 * @typedef {TextQuoteSelector | TextPositionSelector | RangeSelector} Selector
 */

/**
 * @typedef Annotation
 * @prop {string} [id] - TODO
 *   The server-assigned ID for the annotation. This is only set once the
 *   annotation has been saved to the backend.
 * @prop {string} $tag - A locally-generated unique identifier for annotations.
 *   This is set for all annotations, whether they have been saved to the backend
 *   or not. TODO
 * @prop {string} timecreated
 * @prop {string} timemodified
 * @prop {number} userId
 * @prop {boolean} hidden TODO
 *
 * @prop {AnnotationTarget[]} target
 *
 * @prop {string[]} tags - TODO in an array of bodys
 * @prop {string} text - TODO in an array of bodys
 *
 * // Properties not present on API objects, but added by utilities in the client.
 * @prop {boolean} [$orphan]
 */

// Make TypeScript treat this file as a module.
export const unused = {};
import emitter from 'tiny-emitter/instance';

export class EventBus {
    static publish(event, payload) {
        emitter.emit(event, payload);
    }

    static subscribe(event, handler) {
        emitter.on(event, handler);
    }
}
import {toPx} from '@/util/style';
import {LONGPAGE_APP_CONTAINER_ID, MOODLE_NAVBAR_HEIGHT_IN_PX} from '@/config/constants';

if (
    'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype
) {
    const rootMarginTop = toPx(-MOODLE_NAVBAR_HEIGHT_IN_PX);
    const observer = new IntersectionObserver(entries => {
        if (entries[0].boundingClientRect.y === 50) document.body.classList.add('snapped-to-app-container');
        else document.body.classList.remove('snapped-to-app-container');
    }, {rootMargin: `${rootMarginTop} 0px 0px 0px`, threshold: 1});
    observer.observe(document.getElementById(LONGPAGE_APP_CONTAINER_ID));
}
import {getPostIdFromItsDOMId, getThreadIdFromItsDOMId, isDOMIdOfPost, isDOMIdOfThread} from '@/util/annotation';
import {EventBus} from '@/lib/event-bus';

const scrollInPost = () => {
    const hash = window.location.hash.substring(1);
    if (!isDOMIdOfPost(hash)) return;

    const postId = getPostIdFromItsDOMId(hash);

    EventBus.publish('post-selected-by-url-hash', {postId, postDOMId: hash});
};

const scrollInThread = () => {
    const hash = window.location.hash.substring(1);
    if (!isDOMIdOfThread(hash)) return;

    const threadId = getThreadIdFromItsDOMId(hash);

    EventBus.publish('thread-selected-by-url-hash', {threadId, threadDOMId: hash});
};

window.addEventListener('hashchange', () => {
    scrollInPost();
    scrollInThread();
});

EventBus.subscribe('page-ready', () => {
    scrollInPost();
    scrollInThread();
});
import {EventBus} from '@/lib/event-bus';

let timeout = null;

new MutationObserver((_, observer) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
        observer.disconnect();
        setTimeout(() => {
            EventBus.publish('page-ready');
        });
    }, 500);
}).observe(document, {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true,
});
import {Annotation} from '@/types/annotation';
import {deepLowerCaseKeys} from '@/util/misc';
import {MoodleWSMethods, SelectorType} from '@/config/constants';
import {invert, omit, pick} from 'lodash';
import {AnnotationTarget} from '@/types/annotation-target';
import {Thread} from '@/types/thread';
import {Post} from '@/types/post';
import {User} from '@/types/user';
import {UserRole} from '@/types/user-role';

const SELECTOR_TYPE_ARGS_MAPPING = {
    [SelectorType.TEXT_QUOTE_SELECTOR]: 0,
    [SelectorType.TEXT_POSITION_SELECTOR]: 1,
    [SelectorType.RANGE_SELECTOR]: 2,
};

const SELECTOR_TYPE_RESPONSE_MAPPING = invert(SELECTOR_TYPE_ARGS_MAPPING);

const MappingService = {
    _mapSelectorsArgs(selectors) {
        return selectors.map(selector => {
            const type = this._mapSelectorTypeArgs(selector.type);
            if (selector.type === SelectorType.TEXT_POSITION_SELECTOR) {
                return {
                    endposition: selector.end,
                    startposition: selector.start,
                    type,
                };
            }
            return {...selector, type};
        });
    },
    _mapSelectorTypeArgs(selectorType) {
        return SELECTOR_TYPE_ARGS_MAPPING[selectorType];
    },
    _mapSelectorTypeResponse(selectorType) {
        return SELECTOR_TYPE_RESPONSE_MAPPING[selectorType];
    },
    _mapTimeResponse(timeInS) {
        const timeInMs = timeInS * 1000;
        return new Date(timeInMs);
    },
    mapThreadToArgs(thread) {
        return deepLowerCaseKeys({
            ...pick(thread.root, ['content', 'anonymous']),
            ...pick(thread, ['replyRequested']),
            ispublic: thread.isPublic,
        });
    },
    mapAnnotationToArgs(annotation) {
        return deepLowerCaseKeys({
            annotation: {
                ...pick(annotation, ['pageId', 'type', 'isPublic']),
                target: {
                    selectors: this._mapSelectorsArgs(annotation.target.selectors),
                    styleClass: annotation.target.styleClass,
                },
                body: annotation.body && this.mapThreadToArgs(annotation.body),
            },
        });
    },
    mapPostToArgs(post) {
      return deepLowerCaseKeys({
          post: {
              ...pick(post, [
                  'threadId',
                  'anonymous',
                  'content',
                  'isPublic',
                  'pageId',
              ])
          }
      });
    },
    mapPostUpdateToArgs(postUpdate) {
        return deepLowerCaseKeys({
            postUpdate: {
                ...pick(postUpdate, [
                    'id',
                    'anonymous',
                    'content',
                    'isPublic',
                ]),
            }
        });
    },
    mapResponseToAnnotation(response) {
        return new Annotation({
            ...pick(response, ['id', 'type']),
            creatorId: response.creatorid,
            isPublic: response.ispublic,
            pageId: response.pageid,
            target: this.mapResponseToAnnotationTarget(response.target),
            timeCreated: this._mapTimeResponse(response.timecreated),
            timeModified: this._mapTimeResponse(response.timemodified),
            body: response.body && this.mapResponseToThread(response.body),
        });
    },
    mapResponseToAnnotations(response) {
        return response.map(this.mapResponseToAnnotation.bind(this));
    },
    mapResponseToAnnotationTarget(response) {
        return new AnnotationTarget({
            id: response.id,
            selectors: response.selectors.map(s => {
                const type = this._mapSelectorTypeResponse(s.type);
                switch (type) {
                    case SelectorType.RANGE_SELECTOR:
                        return {
                            type,
                            endContainer: s.endcontainer,
                            endOffset: s.endoffset,
                            startContainer: s.startcontainer,
                            startOffset: s.startoffset,
                        };
                    case SelectorType.TEXT_POSITION_SELECTOR:
                        return {
                            type,
                            end: s.endposition,
                            start: s.startposition,
                        };
                    default: return {...s, type};
                }
            }),
            styleClass: response.styleclass,
        });
    },
    mapResponseToPost(response) {
        return new Post({
            ...pick(response, ['id', 'anonymous', 'content', 'recommendation']),
            creatorId: response.creatorid,
            isPublic: response.ispublic,
            bookmarkedByUser: response.bookmarkedbyuser,
            likedByUser: response.likedbyuser,
            likesCount: response.likescount,
            readByUser: response.readbyuser,
            readingsCount: response.readingscount,
            threadId: response.threadid,
            timeCreated: this._mapTimeResponse(response.timecreated),
            timeModified: this._mapTimeResponse(response.timemodified),
        });
    },
    mapResponseToPosts(response) {
        return response.map(post => this.mapResponseToPost(post));
    },
    mapResponseToThread(response) {
        return new Thread({
            ...pick(response, ['id']),
            annotationId: response.annotationid,
            posts: this.mapResponseToPosts(response.posts),
            replyId: response.replyid,
            replyRequested: response.replyrequested,
            subscribedToByUser: response.subscribedtobyuser,
        });
    },
    mapResponseToUser(response) {
        return new User({
            id: response.id,
            firstName: response.firstname,
            fullName: response.fullname,
            lastName: response.lastname,
            imageAlt: response.imagealt,
            profileImage: response.profileimage,
            profileLink: response.profilelink,
            roles: response.roles,
        });
    },
    mapResponseToUserRole(response) {
        return new UserRole({
            id: response.id,
            localName: response.localname,
            shortName: response.shortname,
        });
    },
};

export default MappingService;
export const GET = Object.freeze({
  ANNOTATION: 'ANNOTATION',
  ANNOTATION_FILTER: 'ANNOTATION_FILTER',
  ANNOTATION_WITH_CONTEXT: 'ANNOTATION_WITH_CONTEXT',
  ANNOTATIONS: 'ANNOTATIONS',
  BOOKMARKS: 'BOOKMARKS',
  FILTERED_ANNOTATIONS: 'FILTERED_ANNOTATIONS',
  FILTERED_THREADS: 'FILTERED_THREADS',
  HIGHLIGHTS: 'HIGHLIGHTS',
  LONGPAGE_CONTEXT: 'LONGPAGE_CONTEXT',
  NEW_ANNOTATION: 'NEW_ANNOTATION',
  NEW_POST: 'NEW_POST',
  NEW_THREAD: 'NEW_THREAD',
  POST: 'POST',
  POST_LAST_MODIFIED: 'POST_LAST_MODIFIED',
  POSTS: 'POSTS',
  SCROLL_TOP: 'SCROLL_TOP',
  SELECTED_THREAD_COMP_FUNC_FOR_SORT: 'GET_SELECTED_THREAD_COMP_FUNC_FOR_SORT',
  SELECTED_THREAD_SORTING_OPTION: 'GET_SELECTED_THREAD_SORTING_OPTION',
  SIDEBAR_TAB_OPENED_KEY: 'SIDEBAR_TAB_OPENED_KEY',
  THREAD: 'THREAD',
  THREAD_FILTER: 'THREAD_FILTER',
  THREAD_SORTING_OPTIONS: 'THREAD_SORTING_OPTIONS',
  THREADS: 'THREADS',
  THREADS_FILTERED: 'THREADS_FILTERED',
  THREADS_SORTED_BY_ANNOTATION_POSITION: 'THREADS_SORTED_BY_ANNOTATION_POSITION',
  USER: 'USER',
  USER_ROLES: 'USER_ROLES',
  USERS: 'USERS',
});

export const MUTATE = Object.freeze({
  ADD_ANNOTATIONS: 'ADD_ANNOTATIONS',
  ADD_POSTS_TO_THREAD: 'ADD_POST_TO_THREAD',
  ADD_THREADS: 'ADD_THREADS',
  POST_LAST_MODIFIED: 'POST_LAST_MODIFIED',
  REMOVE_ANNOTATIONS: 'REMOVE_ANNOTATIONS',
  REMOVE_POSTS_FROM_THREAD: 'REMOVE_POST',
  REMOVE_THREADS: 'REMOVE_THREADS',
  REPLACE_POST: 'REPLACE_POST',
  RESET_SCROLL_TOP: 'RESET_SCROLL_TOP',
  SELECTED_THREAD_SORTING_OPTION: 'MUTATE_SELECTED_THREAD_SORTING_OPTION',
  SET_ANNOTATION_FILTER: 'RESET_ANNOTATION_FILTER',
  SET_ANNOTATIONS: 'SET_ANNOTATIONS',
  SET_ENROLLED_USERS: 'SET_ENROLLED_USERS',
  SET_FILTERED_ANNOTATIONS: 'SET_FILTERED_ANNOTATIONS',
  SET_FILTERED_THREADS: 'SET_FILTERED_THREADS',
  SET_THREAD_FILTER: 'SET_THREAD_FILTER',
  SET_THREADS: 'SET_THREADS',
  SET_USER_ROLES: 'SET_USER_ROLES',
  RESET_SIDEBAR_TAB_OPENED_KEY: 'RESET_SIDEBAR_TAB_OPENED_KEY',
  UPDATE_ANNOTATION: 'UPDATE_ANNOTATION',
  UPDATE_POST: 'UPDATE_POST',
  UPDATE_SCROLL_TOP: 'UPDATE_SCROLL_TOP',
  UPDATE_THREAD: 'UPDATE_THREAD',
});

export const ACT = Object.freeze({
  CREATE_ANNOTATION: 'CREATE_ANNOTATION',
  CREATE_POST: 'CREATE_POST',
  DELETE_ANNOTATION: 'DELETE_ANNOTATION',
  DELETE_POST: 'DELETE_POST',
  FETCH_ANNOTATIONS: 'FETCH_ANNOTATIONS',
  FETCH_ENROLLED_USERS: 'FETCH_ENROLLED_USERS',
  FETCH_USER_ROLES: 'FETCH_USER_ROLES',
  FILTER_ANNOTATIONS: 'FILTER_ANNOTATIONS',
  FILTER_THREADS: 'FILTER_THREADS',
  REPLACE_OR_ADD_ANNOTATION: 'REPLACE_OR_ADD_ANNOTATION',
  REPLACE_OR_ADD_POST: 'REPLACE_OR_ADD_POST',
  REPLACE_OR_ADD_THREAD: 'REPLACE_OR_ADD_THREAD',
  SELECT_ANNOTATIONS: 'SELECT_ANNOTATIONS',
  TOGGLE_POST_BOOKMARK: 'TOGGLE_POST_BOOKMARK',
  TOGGLE_POST_LIKE: 'TOGGLE_POST_LIKE',
  TOGGLE_POST_READING: 'TOGGLE_POST_READING',
  TOGGLE_THREAD_SUBSCRIPTION: 'TOGGLE_THREAD_SUBSCRIPTION',
  UPDATE_ANNOTATION: 'UPDATE_ANNOTATION',
  UPDATE_POST: 'UPDATE_POST',
  UPDATE_READING_PROGRESS: 'UPDATE_READING_PROGRESS',
});
import AnnotationModule from './modules/annotation-module';
import PostModule from './modules/post-module';
import UIModule from './modules/ui-module';
import UserModule from './modules/user-module';
import {createStore} from 'vuex';
import {GET} from './types';

export const initStore = (longpageContext) => createStore({
    modules: {
        AnnotationModule,
        PostModule,
        UIModule,
        UserModule,
    },
    state: {
        longpageContext,
    },
    getters: {
        [GET.LONGPAGE_CONTEXT]: ({longpageContext}) => longpageContext,
    }
});
import ajax from 'core/ajax';
import {MoodleWSMethods} from '@/config/constants';
import {GET, ACT, MUTATE} from '../types';
import MappingService from '@/services/mapping-service';

export default {
    state: {
        enrolledUsers: [],
        userRoles: [],
    },
    getters: {
        [GET.USER]: (_, getters) => id => getters[GET.USERS].find(
            user => user.id === (id || getters[GET.LONGPAGE_CONTEXT].userId)
        ),
        [GET.USER_ROLES]: ({userRoles}, getters) => userId => userRoles.filter(
            role => getters[GET.USER](userId).roles.includes(role.id)
        ),
        [GET.USERS]: ({enrolledUsers}) => enrolledUsers,
    },
    actions: {
        [ACT.FETCH_ENROLLED_USERS]({commit, getters}) {
            const context = getters[GET.LONGPAGE_CONTEXT];
            ajax.call([{
                methodname: MoodleWSMethods.GET_ENROLLED_USERS,
                args: {
                    pageid: context.pageId,
                },
                done: ({users}) => {
                    commit(MUTATE.SET_ENROLLED_USERS, users.map(response => MappingService.mapResponseToUser(response)));
                },
                fail: (e) => {
                    console.error(`"${MoodleWSMethods.GET_ENROLLED_USERS}" failed`, e);
                }
            }]);
        },
        [ACT.FETCH_USER_ROLES]({commit, getters}) {
            const context = getters[GET.LONGPAGE_CONTEXT];
            ajax.call([{
                methodname: MoodleWSMethods.GET_USER_ROLES_FOR_MODULE,
                args: {
                    pageid: context.pageId,
                },
                done: ({userroles}) => {
                    commit(MUTATE.SET_USER_ROLES, userroles.map(response => MappingService.mapResponseToUserRole(response)));
                },
                fail: (e) => {
                    console.error(`"${MoodleWSMethods.GET_USER_ROLES_FOR_MODULE}" failed`, e);
                }
            }]);
        },
    },
    mutations: {
        [MUTATE.SET_ENROLLED_USERS](state, enrolledUsers) {
            state.enrolledUsers = enrolledUsers;
        },
        [MUTATE.SET_USER_ROLES](state, userRoles) {
            state.userRoles = userRoles;
        },
    },
};
import {ACT, GET, MUTATE} from '../types';
import ajax from 'core/ajax';
import {MoodleWSMethods} from '@/config/constants';

export default {
    state: {
        sidebarTabOpenedKey: undefined,
        scrollTop: 0,
    },
    getters: {
        [GET.SIDEBAR_TAB_OPENED_KEY]: ({sidebarTabOpenedKey}) => sidebarTabOpenedKey,
        [GET.SCROLL_TOP]: ({scrollTop}) => scrollTop,
    },
    mutations: {
        [MUTATE.RESET_SCROLL_TOP](state, scrollTop) {
            state.scrollTop = scrollTop;
        },
        [MUTATE.RESET_SIDEBAR_TAB_OPENED_KEY](state, sidebarTabOpenedKey) {
            state.sidebarTabOpenedKey = sidebarTabOpenedKey;
        },
    },
    actions: {
        [ACT.UPDATE_READING_PROGRESS]({commit, getters}, scrollTop) {
            const oldScrollTop = getters[GET.SCROLL_TOP];
            commit(MUTATE.RESET_SCROLL_TOP, scrollTop);
            ajax.call([{
                methodname: MoodleWSMethods.UPDATE_READING_PROGRESS,
                args: {
                    pageid: getters[GET.LONGPAGE_CONTEXT].pageId,
                    scrolltop: scrollTop,
                },
                fail: (e) => {
                    console.error(`"${MoodleWSMethods.UPDATE_READING_PROGRESS}" failed`, e);
                    commit(
                        MUTATE.RESET_SCROLL_TOP,
                        oldScrollTop
                    );
                }
            }]);
        },
    }
};
import {ACT, GET, MUTATE} from '../types';
import {flatten, pick} from 'lodash';
import {AnnotationCompareFunction} from '@/util/comparing';
import ajax from 'core/ajax';
import MappingService from '@/services/mapping-service';
import {MoodleWSMethods} from '@/config/constants';
import {Post} from '@/types/post';
import {Thread} from '@/types/thread';
import {ThreadFilter} from '@/util/filters/thread-filter';

export default {
    state: {
        filteredThreads: null,
        postLastModified: null,
        selectedThreadSortingOption: 'byRecommendation',
        threadFilter: ThreadFilter.DEFAULT,
        threads: [],
    },
    getters: {
        [GET.FILTERED_THREADS]:
            ({filteredThreads}, getters) => filteredThreads &&
                filteredThreads.sort(getters[GET.SELECTED_THREAD_COMP_FUNC_FOR_SORT]),
        [GET.NEW_POST]: (_, getters) => (params = {}) => {
            const rememberablePropsOfPostLastModified = pick(getters[GET.POST_LAST_MODIFIED] || {}, ['isPublic', 'anonymous']);
            return new Post({
                creatorId: getters[GET.LONGPAGE_CONTEXT].userId,
                ...rememberablePropsOfPostLastModified,
                ...params,
            });
        },
        [GET.NEW_THREAD]: (_, getters) => (params = {}) => {
            const thread = new Thread({...params});
            if (!thread.posts.length) thread.posts.push(getters[GET.NEW_POST]({threadId: thread.id}));
            return thread;
        },
        [GET.POST]: ({threads}) => (postId, threadId) => {
            const thread = threads.find(t => t.id === threadId);
            return thread && thread.posts.find(p => p.id === postId);
        },
        [GET.POST_LAST_MODIFIED]: ({postLastModified}) => postLastModified,
        [GET.POSTS]: ({threads}) => {
            return flatten(threads.map(({posts}) => posts));
        },
        [GET.SELECTED_THREAD_SORTING_OPTION]: ({selectedThreadSortingOption}) => selectedThreadSortingOption,
        [GET.SELECTED_THREAD_COMP_FUNC_FOR_SORT]:
            (_, getters) => {
                return getters[GET.THREAD_SORTING_OPTIONS][getters[GET.SELECTED_THREAD_SORTING_OPTION]];
            },
        [GET.THREAD]: ({threads}) => id => threads.find(t => t.id === id),
        [GET.THREAD_FILTER]: ({threadFilter}) => threadFilter,
        [GET.THREAD_SORTING_OPTIONS]: (_, getters) => ({
            byNovelty: (a, b) => b.timeModified - a.timeModified,
            byPosition: (a, b) => {
                const [annotationA, annotationB] = [a, b].map(t => getters[GET.ANNOTATION](t.annotationId));
                return AnnotationCompareFunction.BY_POSITION(annotationA, annotationB);
            },
            byRecommendation: (a, b) => b.recommendation - a.recommendation,
        }),
        [GET.THREADS]: ({threads}, getters) => threads.sort(getters[GET.SELECTED_THREAD_COMP_FUNC_FOR_SORT]),
        [GET.THREADS_FILTERED]: (_, getters) => Boolean(getters[GET.FILTERED_THREADS]),
    },
    mutations: {
        [MUTATE.ADD_POSTS_TO_THREAD](state, {threadId, posts}) {
            const thread = state.threads.find(thread => thread.id === threadId);
            thread.posts = [...thread.posts, ...posts];
            if (!state.filteredThreads) return;

            const threadDuplicate = state.filteredThreads.find(thread => thread.id === threadId);
            threadDuplicate.posts = [...threadDuplicate.posts, ...posts];
        },
        [MUTATE.ADD_THREADS](state, threads) {
            state.threads.push(...threads);
        },
        [MUTATE.POST_LAST_MODIFIED](state, post) {
            state.postLastModified = post;
        },
        [MUTATE.REMOVE_POSTS_FROM_THREAD](state, {threadId, posts}) {
            const thread = state.threads.find(thread => thread.id === threadId);
            thread.posts = thread.posts.filter(p => !posts.find(post => post.id === p.id));
            if (!state.filteredThreads) return;

            const threadDuplicate = state.filteredThreads.find(thread => thread.id === threadId);
            threadDuplicate.posts = threadDuplicate.posts.filter(p => !posts.find(post => post.id === p.id));
        },
        [MUTATE.REMOVE_THREADS](state, threadsToRemove) {
            state.threads = state.threads.filter(t => !threadsToRemove.find(ttr => ttr.id === t.id));
            if (!state.filteredThreads) return;

            state.filteredThreads = state.filteredThreads.filter(t => !threadsToRemove.find(ttr => ttr.id === t.id));
        },
        [MUTATE.REPLACE_POST](state, post) {
            const thread = state.threads.find(thread => thread.id === post.threadId);
            const posts = [...thread.posts];
            posts.splice(posts.findIndex(p => p.id === post.id), 1, post);
            thread.posts = posts;
        },
        [MUTATE.SELECTED_THREAD_SORTING_OPTION](state, option) {
            state.selectedThreadSortingOption = option;
        },
        [MUTATE.SET_FILTERED_THREADS](state, filteredThreads) {
            state.filteredThreads = filteredThreads;
        },
        [MUTATE.SET_THREAD_FILTER](state, filter) {
            state.threadFilter = filter;
        },
        [MUTATE.SET_THREADS](state, threads) {
            state.threads = threads;
        },
        [MUTATE.UPDATE_POST](state, {threadId, postId, postUpdate}) {
            const thread = state.threads.find(thread => thread.id === threadId);
            const post = thread.posts.find(post => post.id === postId);
            Object.assign(post, postUpdate);
        },
        [MUTATE.UPDATE_THREAD](state, {id, threadUpdate}) {
            const thread = state.threads.find(thread => thread.id === id);
            Object.assign(thread, threadUpdate);
        }
    },
    actions: {
        async [ACT.CREATE_POST]({commit, dispatch, getters}, params = {}) {
            const post = getters[GET.POST](params.id) || getters[GET.NEW_POST](params);
            dispatch(ACT.REPLACE_OR_ADD_POST, post);
            commit(MUTATE.POST_LAST_MODIFIED, post);
            if (!post.content) return;

            const thread = getters[GET.THREAD](post.threadId);
            if (!thread.created) {
                dispatch(ACT.CREATE_ANNOTATION, getters[GET.ANNOTATION](thread.annotationId));
                return;
            }

            ajax.call([{
                methodname: MoodleWSMethods.CREATE_POST,
                args: MappingService.mapPostToArgs({...post, pageId: getters[GET.LONGPAGE_CONTEXT].pageId}),
                done: (response) => {
                    const postUpdate = MappingService.mapResponseToPost(response.post);
                    commit(MUTATE.UPDATE_POST, {threadId: thread.id, postId: post.id, postUpdate});
                },
                fail: (e) => {
                    commit(MUTATE.REMOVE_POSTS_FROM_THREAD, {threadId: thread.id, posts: [post]});
                    console.error(`"${MoodleWSMethods.CREATE_POST}" failed`, e);
                }
            }]);
        },
        [ACT.DELETE_POST]({commit, dispatch, getters}, post) {
            if (!post.created) return;

            const thread = getters[GET.THREAD](post.threadId);
            const postIsThreadRoot = thread.root.id === post.id;
            if (postIsThreadRoot) {
                dispatch(ACT.DELETE_ANNOTATION, getters[GET.ANNOTATION](thread.annotationId));
                return;
            }

            commit(MUTATE.REMOVE_POSTS_FROM_THREAD, {threadId: thread.id, posts: [post]});
            ajax.call([{
                methodname: MoodleWSMethods.DELETE_POST,
                args: {id: post.id},
                done: () => {},
                fail: (e) => {
                    commit(MUTATE.ADD_POSTS_TO_THREAD, {threadId: thread.id, posts: [post]});
                    console.error(`"${MoodleWSMethods.DELETE_POST}" failed`, e);
                }
            }]);
        },
        [ACT.FILTER_THREADS]({commit, getters}, filter = null) {
            commit(MUTATE.SET_THREAD_FILTER, filter || ThreadFilter.DEFAULT);
            const filteredThreads = filter && new ThreadFilter(filter)
                .applyTo(...getters[GET.THREADS]);
            commit(MUTATE.SET_FILTERED_THREADS, filteredThreads);
        },
        [ACT.REPLACE_OR_ADD_POST]({commit, getters}, post) {
            if (getters[GET.POST](post.id, post.threadId)) {
                commit(MUTATE.UPDATE_POST, {threadId: post.threadId, postId: post.id, postUpdate: post});
            } else {
                commit(MUTATE.ADD_POSTS_TO_THREAD, {threadId: post.threadId, posts: [post]});
            }
        },
        [ACT.REPLACE_OR_ADD_THREAD]({commit, getters}, thread) {
            if (getters[GET.THREAD](thread.id)) {
                commit(MUTATE.UPDATE_THREAD, {id: thread.id, threadUpdate: thread});
            } else {
                commit(MUTATE.ADD_THREADS, [thread]);
                if (getters[GET.THREADS_FILTERED]) {
                    commit(
                        MUTATE.SET_FILTERED_THREADS,
                        [thread, ...getters[GET.FILTERED_THREADS]]
                    );
                }
            }
        },
        [ACT.TOGGLE_POST_BOOKMARK]({commit, getters}, {postId, threadId}) {
            const post = getters[GET.POST](postId, threadId);
            commit(
                MUTATE.UPDATE_POST,
                {threadId: post.threadId, postId: post.id, postUpdate: {...post, bookmarkedByUser: !post.bookmarkedByUser}}
            );
            const methodname = post.bookmarkedByUser ? MoodleWSMethods.CREATE_POST_BOOKMARK : MoodleWSMethods.DELETE_POST_BOOKMARK;
            ajax.call([{
                methodname,
                args: {postid: post.id},
                fail: (e) => {
                    console.error(`"${methodname}" failed`, e);
                    commit(
                        MUTATE.UPDATE_POST,
                        {threadId: post.threadId, postId: post.id, postUpdate: {...post, bookmarkedByUser: !post.bookmarkedByUser}}
                    );
                }
            }]);
        },
        [ACT.TOGGLE_POST_LIKE]({commit, getters}, {postId, threadId}) {
            const post = getters[GET.POST](postId, threadId);
            commit(
                MUTATE.UPDATE_POST,
                {threadId: post.threadId, postId: post.id, postUpdate: {...post, likedByUser: !post.likedByUser}}
            );
            const methodname = post.likedByUser ? MoodleWSMethods.CREATE_POST_LIKE : MoodleWSMethods.DELETE_POST_LIKE;
            ajax.call([{
                methodname,
                args: {postid: post.id},
                fail: (e) => {
                    console.error(`"${methodname}" failed`, e);
                    commit(
                        MUTATE.UPDATE_POST,
                        {threadId: post.threadId, postId: post.id, postUpdate: {...post, likedByUser: !post.likedByUser}}
                    );
                }
            }]);
        },
        [ACT.TOGGLE_POST_READING]({commit, getters}, {postId, threadId}) {
            const post = getters[GET.POST](postId, threadId);
            commit(
                MUTATE.UPDATE_POST,
                {threadId: post.threadId, postId: post.id, postUpdate: {...post, readByUser: !post.readByUser}}
            );
            const methodname = post.readByUser ? MoodleWSMethods.CREATE_POST_READING : MoodleWSMethods.DELETE_POST_READING;
            ajax.call([{
                methodname,
                args: {postid: post.id},
                fail: (e) => {
                    console.error(`"${methodname}" failed`, e);
                    commit(
                        MUTATE.UPDATE_POST,
                        {threadId: post.threadId, postId: post.id, postUpdate: {...post, readByUser: !post.readByUser}}
                    );
                }
            }]);
        },
        [ACT.TOGGLE_THREAD_SUBSCRIPTION]({commit, getters}, threadId) {
            const thread = getters[GET.THREAD](threadId);
            commit(
                MUTATE.UPDATE_THREAD,
                {id: threadId, threadUpdate: {...thread, subscribedToByUser: !thread.subscribedToByUser}}
            );
            const methodname = thread.subscribedToByUser ?
                MoodleWSMethods.CREATE_THREAD_SUBSCRIPTION : MoodleWSMethods.DELETE_THREAD_SUBSCRIPTION;
            ajax.call([{
                methodname,
                args: {threadid: thread.id},
                fail: (e) => {
                    console.error(`"${methodname}" failed`, e);
                    commit(
                        MUTATE.UPDATE_THREAD,
                        {id: threadId, threadUpdate: {...thread, subscribedToByUser: !thread.subscribedToByUser}}
                    );
                }
            }]);
        },
        [ACT.UPDATE_POST]({commit, getters}, postUpdate) {
            const post = {...getters[GET.POST](postUpdate.id, postUpdate.threadId)};
            commit(MUTATE.UPDATE_POST, {threadId: post.threadId, postId: post.id, postUpdate});
            commit(MUTATE.POST_LAST_MODIFIED, new Post({...post, ...postUpdate}));
            ajax.call([{
                methodname: MoodleWSMethods.UPDATE_POST,
                args: MappingService.mapPostUpdateToArgs(postUpdate),
                done: (response) => {
                    const postUpdate = MappingService.mapResponseToPost(response.post);
                    commit(MUTATE.UPDATE_POST, {threadId: post.threadId, postId: post.id, postUpdate});
                },
                fail: (e) => {
                    commit(MUTATE.UPDATE_POST, {threadId: post.threadId, postId: post.id, postUpdate: post});
                    console.error(`"${MoodleWSMethods.UPDATE_POST}" failed`, e);
                }
            }]);
        },
    },
};
import {AnnotationType, MoodleWSMethods} from '@/config/constants';
import {GET, ACT, MUTATE} from '../types';
import {Annotation} from '@/types/annotation';
import {AnnotationCompareFunction} from '@/util/comparing';
import ajax from 'core/ajax';
import MappingService from '@/services/mapping-service';
import {AnnotationFilter} from '@/util/filters/annotation-filter';

export default {
    state: {
        annotations: [],
        annotationFilter: AnnotationFilter.DEFAULT,
        filteredAnnotations: null,
    },
    getters: {
        [GET.ANNOTATION]: (_, getters) => id => getters[GET.ANNOTATIONS].find(a => a.id === id),
        [GET.ANNOTATION_FILTER]: ({annotationFilter}) => annotationFilter,
        [GET.ANNOTATION_WITH_CONTEXT]: (_, getters) => annotation => ({
            ...annotation,
            pageId: getters[GET.LONGPAGE_CONTEXT].pageId,
        }),
        [GET.ANNOTATIONS]: ({annotations}) => annotations,
        [GET.BOOKMARKS]: (_, getters) => {
            return getters[GET.ANNOTATIONS]
                .filter(a => a.type === AnnotationType.BOOKMARK)
                .sort(AnnotationCompareFunction.BY_POSITION);
        },
        [GET.FILTERED_ANNOTATIONS]: ({filteredAnnotations}) => filteredAnnotations,
        [GET.HIGHLIGHTS]: (_, getters) => {
            return getters[GET.ANNOTATIONS]
                .filter(a => a.type === AnnotationType.HIGHLIGHT)
                .sort(AnnotationCompareFunction.BY_POSITION);
        },
        [GET.NEW_ANNOTATION]: (_, getters) => (params = {}) => {
            const annotation = new Annotation({
                creatorId: getters[GET.LONGPAGE_CONTEXT].userId,
                pageId: getters[GET.LONGPAGE_CONTEXT].pageId,
                ...params,
            });
            annotation.body =
                params.type === AnnotationType.POST && !params.body
                    ? getters[GET.NEW_THREAD]({annotationId: annotation.id}) : undefined;
            return annotation;
        },
    },
    mutations: {
        [MUTATE.ADD_ANNOTATIONS](state, annotations) {
            state.annotations = [...state.annotations, ...annotations];
        },
        [MUTATE.REMOVE_ANNOTATIONS](state, annotationsToRemove) {
            state.annotations = state.annotations.filter(a => !annotationsToRemove.find(atr => atr.id === a.id));
            if (state.filteredAnnotations) {
                state.filteredAnnotations = state.filteredAnnotations.filter(
                    a => !annotationsToRemove.find(atr => atr.id === a.id)
                );
            }
        },
        [MUTATE.SET_ANNOTATION_FILTER](state, filter) {
            state.annotationFilter = filter;
        },
        [MUTATE.SET_ANNOTATIONS](state, annotations) {
            state.annotations = annotations;
        },
        [MUTATE.SET_FILTERED_ANNOTATIONS](state, annotations) {
            state.filteredAnnotations = annotations;
        },
        [MUTATE.UPDATE_ANNOTATION](state, {id, annotationUpdate}) {
            const annotation = state.annotations.find(annotation => annotation.id === id);
            Object.assign(annotation, annotationUpdate);
        }
    },
    actions: {
        [ACT.REPLACE_OR_ADD_ANNOTATION]({commit, getters}, annotation) {
            if (getters[GET.ANNOTATION](annotation.id)) {
                commit(MUTATE.UPDATE_ANNOTATION, {id: annotation.id, annotationUpdate: annotation});
            } else {
                commit(MUTATE.ADD_ANNOTATIONS, [annotation]);
                if (getters[GET.FILTERED_ANNOTATIONS]) {
                    commit(
                        MUTATE.SET_FILTERED_ANNOTATIONS,
                        [annotation, ...getters[GET.FILTERED_ANNOTATIONS]].sort(AnnotationCompareFunction.BY_POSITION)
                    );
                }
            }
        },
        [ACT.CREATE_ANNOTATION]({commit, dispatch, getters}, params = {}) {
            const annotation = getters[GET.ANNOTATION](params.id) || getters[GET.NEW_ANNOTATION](params);
            dispatch(ACT.REPLACE_OR_ADD_ANNOTATION, annotation);
            if (annotation.type === AnnotationType.POST) {
                dispatch(ACT.REPLACE_OR_ADD_THREAD, annotation.body);
                annotation.isPublic = annotation.body.isPublic;
                commit(MUTATE.UPDATE_ANNOTATION, {id: annotation.id, annotationUpdate: annotation});
                if (!annotation.body.root.content) return;
            }

            ajax.call([{
                methodname: MoodleWSMethods.CREATE_ANNOTATION,
                args: MappingService.mapAnnotationToArgs(annotation),
                done: (response) => {
                    const annotationUpdate = MappingService.mapResponseToAnnotation(response.annotation);
                    if (annotationUpdate.type === AnnotationType.POST) {
                        commit(MUTATE.UPDATE_THREAD, {id: annotation.body.id, threadUpdate: annotationUpdate.body});
                    }
                    commit(MUTATE.UPDATE_ANNOTATION, {id: annotation.id, annotationUpdate});
                },
                fail: (e) => {
                    commit(MUTATE.REMOVE_THREADS, [annotation.body]);
                    commit(MUTATE.REMOVE_ANNOTATIONS, [annotation]);
                    console.error(`"${MoodleWSMethods.CREATE_ANNOTATION}" failed`, e);
                }
            }]);
        },
        [ACT.DELETE_ANNOTATION]({commit}, annotation) {
            if (!annotation.created) return;

            if (annotation.body) commit(MUTATE.REMOVE_THREADS, [annotation.body]);
            commit(MUTATE.REMOVE_ANNOTATIONS, [annotation]);

            ajax.call([{
                methodname: MoodleWSMethods.DELETE_ANNOTATION,
                args: {id: annotation.id},
                done: () => {},
                fail: (e) => {
                    commit(MUTATE.ADD_ANNOTATIONS, [annotation]);
                    if (annotation.body) commit(MUTATE.ADD_THREADS, [annotation.body]);
                    console.error(`"${MoodleWSMethods.DELETE_ANNOTATION}" failed`, e);
                }
            }]);
        },
        [ACT.FETCH_ANNOTATIONS]({commit, getters}) {
            ajax.call([{
                methodname: MoodleWSMethods.GET_ANNOTATIONS,
                args: {
                    parameters: {
                        pageid: getters[GET.LONGPAGE_CONTEXT].pageId,
                    },
                },
                done: (response) => {
                    const annotations = MappingService.mapResponseToAnnotations(response.annotations);
                    commit(MUTATE.SET_ANNOTATIONS, annotations);
                    commit(MUTATE.SET_THREADS, annotations.filter(a => Boolean(a.body)).map(a => a.body));
                },
                fail: (e) => {
                    console.error(`"${MoodleWSMethods.GET_ANNOTATIONS}" failed`, e);
                }
            }]);
        },
        [ACT.FILTER_ANNOTATIONS]({commit, dispatch, getters}, filter = null) {
           commit(MUTATE.SET_ANNOTATION_FILTER, filter || AnnotationFilter.DEFAULT);
           const filteredAnnotations = filter && new AnnotationFilter(filter)
               .applyTo(...getters[GET.ANNOTATIONS])
               .sort(AnnotationCompareFunction.BY_POSITION);
           commit(MUTATE.SET_FILTERED_ANNOTATIONS, filteredAnnotations);
           dispatch(ACT.FILTER_THREADS, filter && filter.body);
        },
    },
};
