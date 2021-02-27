<?php
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
 * Page external API
 *
 * @package    mod_page
 * @category   external
 * @copyright  2015 Juan Leyva <juan@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      Moodle 3.0
 */

defined('MOODLE_INTERNAL') || die;

require_once("$CFG->libdir/externallib.php");

function pick_keys($arrOrObj, $keys, $inplace = false) {
    if (!$inplace) {
        $result = array_intersect_key((array) $arrOrObj, array_fill_keys($keys, 1));
        return gettype($arrOrObj) == 'array' ? $result : (object) $result;
    }

    foreach (array_keys((array) $arrOrObj) as $key) {
        if (in_array($key, $keys, false)) {
            continue;
        }
        if (gettype($arrOrObj) == 'array') {
            unset($arrOrObj[$key]);
        } else {
            unset($arrOrObj->{$key});
        }
    }
    return $arrOrObj;
}

function omit_keys($arrOrObj, $keys, $inplace = false) {
    if (!$inplace) {
        $result = array_diff_key((array) $arrOrObj, array_fill_keys($keys, 1));
        return gettype($arrOrObj) == 'array' ? $result : (object) $result;
    }

    foreach ($keys as $key) {
        if (gettype($arrOrObj) == 'array') {
            unset($arrOrObj[$key]);
        } else {
            unset($arrOrObj->{$key});
        }
    }
    return $arrOrObj;
}

function array_map_merge($arrays, $tomerge) {
    return array_map(static function($array) use ($tomerge) {
        return array_merge($array, $tomerge);
    }, $arrays);
}

function object_merge(...$objects) {
    $result = [];
    foreach ($objects as $object) {
        $result = array_merge($result, (array) $object);
    }
    return (object) $result;
}

abstract class mod_page_annotation_type {
    const HIGHLIGHT = 0;
    const POST = 1;
    const BOOKMARK = 2;
}

abstract class mod_page_selector {
    const TYPE_TEXT_QUOTE_SELECTOR = 0;
    const TYPE_TEXT_POSITION_SELECTOR = 1;
    const TYPE_RANGE_SELECTOR = 2;

    const TABLE_NAME_TEXT_QUOTE_SELECTOR = 'page_text_quote_selectors';
    const TABLE_NAME_TEXT_POSITION_SELECTOR = 'page_text_position_selectors';
    const TABLE_NAME_RANGE_SELECTOR = 'page_range_selectors';

    private static $TYPE_TO_TABLE_NAME_MAPPING = array(
        self::TYPE_TEXT_QUOTE_SELECTOR => self::TABLE_NAME_TEXT_QUOTE_SELECTOR,
        self::TYPE_TEXT_POSITION_SELECTOR => self::TABLE_NAME_TEXT_POSITION_SELECTOR,
        self::TYPE_RANGE_SELECTOR => self::TABLE_NAME_RANGE_SELECTOR,
    );

    private static $TABLE_NAME_TO_TYPE_MAPPING;

    static function map_table_name_to_type($table_name) {
        if (!isset(self::$TABLE_NAME_TO_TYPE_MAPPING)) {
            self::$TABLE_NAME_TO_TYPE_MAPPING = array_flip(self::$TYPE_TO_TABLE_NAME_MAPPING);
        }
        return self::$TABLE_NAME_TO_TYPE_MAPPING[$table_name];
    }

    static function map_type_to_table_name($type) {
        return self::$TYPE_TO_TABLE_NAME_MAPPING[$type];
    }
}

/**
 * Page external functions
 *
 * @package    mod_page
 * @category   external
 * @copyright  2015 Juan Leyva <juan@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      Moodle 3.0
 */
class mod_page_external extends external_api {
    private static function annotation_target_parameters_base() {
        return [
            'selectors' => new external_multiple_structure(
                new external_single_structure([
                    'type' => new external_value(PARAM_INT),
                    'startposition' => new external_value(PARAM_INT, '', VALUE_OPTIONAL),
                    'startcontainer' => new external_value(PARAM_TEXT, '', VALUE_OPTIONAL),
                    'startoffset' => new external_value(PARAM_INT, '', VALUE_OPTIONAL),
                    'endposition' => new external_value(PARAM_INT, '', VALUE_OPTIONAL),
                    'endcontainer' => new external_value(PARAM_TEXT, '', VALUE_OPTIONAL),
                    'endoffset' => new external_value(PARAM_INT, '', VALUE_OPTIONAL),
                    'exact' => new external_value(PARAM_TEXT, '', VALUE_OPTIONAL),
                    'prefix' => new external_value(PARAM_TEXT, '', VALUE_OPTIONAL),
                    'suffix' => new external_value(PARAM_TEXT, '', VALUE_OPTIONAL),
                ]), '', VALUE_OPTIONAL
            ),
            'styleclass' => new external_value(PARAM_TEXT, '', VALUE_OPTIONAL),
        ];
    }

    /**
     * @param $post
     */
    private static function anonymize_post($post): void {
        global $USER;

        if ($post->anonymous && $USER->id !== $post->creatorid) {
            unset($post->creatorid);
        }
    }

    public static function create_annotation($annotation) {
        global $DB, $USER;

        self::validate_parameters(self::create_annotation_parameters(), ['annotation' => $annotation]);
        self::validate_cm_context($annotation['pageid']);

        $transaction = $DB->start_delegated_transaction();
        $id = $DB->insert_record('page_annotations', array_merge(
            pick_keys($annotation, ['pageid', 'type']),
            [
                'timecreated' => time(),
                'timemodified' => time(),
                'creatorid' => $USER->id,
                'ispublic' => isset($annotation['ispublic']) && $annotation['ispublic'],
            ]
        ));
        self::create_annotation_target($annotation['target'], $id);
        if(isset($annotation['body'])) {
            self::create_thread($annotation['body'], $id);
        }
        $transaction->allow_commit();

        return [
            'annotation' => self::get_annotations(['pageid' => $annotation['pageid'], 'annotationid' => $id])['annotations'][0]
        ];
    }

    /**
     * Returns description of method parameters
     *
     * @return external_function_parameters
     * @since Moodle 3.0
     */
    public static function create_annotation_parameters() {
        return new external_function_parameters([
            'annotation' => new external_single_structure([
                'pageid' => new external_value(PARAM_INT),
                'target' => self::create_annotation_target_parameters(),
                'type' => new external_value(PARAM_INT),
                'body' => new external_single_structure(self::create_thread_parameters_base(), '', VALUE_OPTIONAL),
                'ispublic' => new external_value(PARAM_BOOL, '', VALUE_DEFAULT, ),
            ]),
        ]);
    }

    /**
     * Returns description of method parameters
     *
     * @return external_single_structure
     * @since Moodle 3.0
     */
    public static function create_annotation_returns() {
        return new external_single_structure(['annotation' => self::get_annotation_returns()]);
    }

    private static function create_annotation_target($target, $annotationid) {
        global $DB;

        $targetid = $DB->insert_record(
            'page_annotation_targets',
            ['annotationid' => $annotationid, 'styleclass' => $target['styleclass'] ?? null]
        );
        self::create_selectors($target['selectors'], $targetid);
    }

    public static function create_annotation_target_parameters() {
        return new external_single_structure(self::annotation_target_parameters_base());
    }

    /**
     * @param $post
     */
    private static function delete_post_from_db($id): void {
        global $DB;

        $DB->delete_records('page_post_likes', ['postid' => $id]);
        $DB->delete_records('page_post_readings', ['postid' => $id]);
        $DB->delete_records('page_post_marks', ['postid' => $id]);
        $DB->delete_records('page_posts', ['id' => $id]);
    }

    private static function get_annotation_by_post($post) {
        global $DB;

        $thread = $DB->get_record('page_threads', ['id' => $post->threadid]);
        return $DB->get_record('page_annotations', ['id' => $thread->annotationid]);
    }

    private static function get_annotation_by_post_id($id) {
        global $DB;

        $post = $DB->get_record('page_posts', ['id' => $id]);
        return self::get_annotation_by_post($post);
    }

    public static function create_post($postparameters) {
        global $DB, $USER;

        self::validate_parameters(self::create_post_parameters(), ['post' => $postparameters]);
        $post = (object) $postparameters;
        $annotation = self::get_annotation_by_post($post);
        self::validate_cm_context($annotation->pageid);

        $transaction = $DB->start_delegated_transaction();
        $id = $DB->insert_record(
            'page_posts',
            object_merge($post, ['creatorid' => $USER->id, 'timecreated' => time(), 'timemodified' => time()]),
        );
        $transaction->allow_commit();

        return ['post' => $DB->get_record('page_posts', ['id' => $id])];
    }

    public static function create_post_like($postid) {
        global $DB, $USER;

        self::validate_post_write($postid);

        $transaction = $DB->start_delegated_transaction();
        $DB->insert_record('page_post_likes', ['postid' => $postid, 'timecreated' => time(), 'userid' => $USER->id]);
        $transaction->allow_commit();
    }

    public static function create_post_like_parameters() {
        return new external_function_parameters([
            'postid' => new external_value(PARAM_INT),
        ]);
    }

    public static function create_post_like_returns() {
        return null;
    }

    public static function create_post_mark($parameters) {
        global $DB;

        $transaction = $DB->start_delegated_transaction();
        $DB->insert_record('page_post_marks', array_merge($parameters, ['timecreated' => time()]));
        $transaction->allow_commit();
    }

    public static function create_post_mark_parameters() {
        return self::create_post_like_parameters();
    }

    public static function create_post_mark_returns() {
        return null;
    }

    public static function create_post_parameters() {
        return new external_function_parameters([
            'post' => new external_single_structure(omit_keys(self::post_parameters(), ['creatorid'])),
        ]);
    }

    public static function create_post_reading($parameters) {
        global $DB;

        $transaction = $DB->start_delegated_transaction();
        $DB->insert_record('page_post_readings', array_merge($parameters, ['timecreated' => time()]));
        $transaction->allow_commit();
    }

    public static function create_post_reading_parameters() {
        return self::create_post_like_parameters();
    }

    public static function create_post_reading_returns() {
        return null;
    }

    public static function create_post_returns() {
        return new external_function_parameters([
            'post' => new external_single_structure(array_merge(
                self::post_parameters(),
                self::id_parameter(),
                self::timestamp_parameters(),
            )),
        ]);
    }

    private static function create_selectors($selectors, $annotationtargetid): void {
        global $DB;

        foreach ($selectors as $selector) {
            $selectorid = $DB->insert_record('page_selectors', ['annotationtargetid' => $annotationtargetid, 'type' => $selector['type']]);
            $DB->insert_record(mod_page_selector::map_type_to_table_name($selector['type']),
                array_merge(omit_keys($selector, ['type']), ['selectorid' => $selectorid]));
        }
    }

    public static function create_thread($threadparameters, $annotationid) {
        global $DB, $USER;

        $id = $DB->insert_record(
            'page_threads',
            [
                'annotationid' => $annotationid,
                'creatorid' => $USER->id,
                'replyrequested' => isset($threadparameters['replyrequested']) && $threadparameters['replyrequested'],
            ],
        );
        $postparameters = omit_keys($threadparameters, ['replyrequested']);
        $postparameters['threadid'] = $id;
        self::create_post($postparameters);
    }

    public static function create_thread_parameters() {

    }

    private static function create_thread_parameters_base() {
        return [
            'anonymous' => new external_value(PARAM_BOOL),
            'content' => new external_value(PARAM_TEXT, ''),
            'ispublic' => new external_value(PARAM_BOOL, '', VALUE_OPTIONAL),
            'replyrequested' => new external_value(PARAM_BOOL, '', VALUE_OPTIONAL),
        ];
    }

    public static function create_thread_returns() {

    }

    public static function create_thread_subscription($parameters) {
        global $DB;

        $transaction = $DB->start_delegated_transaction();
        $DB->insert_record('page_thread_subscriptions', array_merge($parameters, ['timecreated' => time()]));
        $transaction->allow_commit();
    }

    public static function create_thread_subscription_parameters() {
        return new external_function_parameters([
            'threadid' => new external_value(PARAM_INT),
            'userid' => new external_value(PARAM_INT),
        ]);
    }

    public static function create_thread_subscription_returns() {
        return null;
    }

    private static function delete_thread($thread) {
        global $DB;

        self::delete_post_from_db(self::get_posts($thread->id)[0]->id);
        $DB->delete_records('page_thread_subscriptions', ['threadid' => $thread->id]);
        $DB->delete_records('page_threads', ['id' => $thread->id]);
    }

    public static function delete_annotation($id): void {
        global $DB;

        self::validate_parameters(self::delete_annotation_parameters(), ['id' => $id]);
        $annotation = $DB->get_record('page_annotations', ['id' => $id]);
        self::validate_cm_context($annotation->pageid);

        // TODO validate that user can delete annotation and that annotation can be deleted (not part of a thread that others depend on), can be merged with validation of highlight & post

        $transaction = $DB->start_delegated_transaction();
        self::delete_annotation_target($id);
        if ($annotation->type == mod_page_annotation_type::POST) {
            $thread = $DB->get_record('page_threads', ['annotationid' => $annotation->id]);
            self::delete_thread($thread);
        }
        $DB->delete_records('page_annotations', ['id' => $id]);
        $transaction->allow_commit();
    }

    public static function delete_annotation_parameters() {
        return new external_function_parameters([
            'id' => new external_value(PARAM_INT),
        ]);
    }

    public static function delete_annotation_returns() {
        return null;
    }

    private static function delete_annotation_target($annotationid): void {
        global $DB;

        $conditions = ['annotationid' => $annotationid];
        $target = $DB->get_record('page_annotation_targets', $conditions);
        self::delete_selectors($target->id);
        $DB->delete_records('page_annotation_targets', $conditions);
    }

    public static function delete_highlight($id) {
        global $DB;




        self::delete_annotation($id);
    }

    public static function delete_highlight_parameters() {
        return new external_function_parameters([
            'id' => new external_value(PARAM_INT),
        ]);
    }

    public static function delete_highlight_returns() {
        return null;
    }

    private static function is_post_thread_root($post) {
        global $DB;

        $postsinthreadcount = $DB->count_records('page_posts', ['threadid' => $post->threadid]);
        return $postsinthreadcount === 1;
    }

    public static function delete_post($id) {
        global $DB;

        self::validate_parameters(self::delete_post_parameters(), ['id' => $id]);
        $annotation = self::get_annotation_by_post_id($id);
        self::validate_cm_context($annotation->pageid);

        $post = $DB->get_record('page_posts', ['id' => $id]);
        // TODO Move getting the thread into validation
        $postisthreadroot = self::is_post_thread_root($post);

        self::validate_post_can_be_deleted_and_udpated($post, $postisthreadroot);

        $transaction = $DB->start_delegated_transaction();
        self::delete_post_from_db($id);
        $transaction->allow_commit();
    }

    public static function delete_post_like($postid) {
        global $DB, $USER;

        self::validate_post_write($postid);

        $transaction = $DB->start_delegated_transaction();
        $DB->delete_records('page_post_likes', ['postid' => $postid, 'userid' => $USER->id]);
        $transaction->allow_commit();
    }

    public static function delete_post_like_parameters() {
        return self::create_post_like_parameters();
    }

    public static function delete_post_like_returns() {
        return null;
    }

    public static function delete_post_mark($parameters) {
        global $DB;

        $transaction = $DB->start_delegated_transaction();
        $DB->delete_records('page_post_marks', $parameters);
        $transaction->allow_commit();
    }

    public static function delete_post_mark_parameters() {
        return self::create_post_like_parameters();
    }

    public static function delete_post_mark_returns() {
        return null;
    }

    public static function delete_post_parameters() {
        return new external_function_parameters(self::id_parameter());
    }

    public static function delete_post_reading($parameters) {
        global $DB;

        $transaction = $DB->start_delegated_transaction();
        $DB->delete_records('page_post_readings', $parameters);
        $transaction->allow_commit();
    }

    public static function delete_post_reading_parameters() {
        return self::create_post_like_parameters();
    }

    public static function delete_post_reading_returns() {
        return null;
    }

    public static function delete_post_returns() {
        return null;
    }

    private static function delete_selectors($annotationtargetid) {
        global $DB;

        $conditions = ['annotationtargetid' => $annotationtargetid];
        $pageselectors = $DB->get_records('page_selectors', $conditions);
        foreach ($pageselectors as $pageselector) {
            $tablename = mod_page_selector::map_type_to_table_name($pageselector->type);
            $DB->delete_records($tablename, ['selectorid' => $pageselector->id]);
        }
        $DB->delete_records('page_selectors', $conditions);
    }

    public static function delete_thread_subscription($parameters) {
        global $DB;

        $transaction = $DB->start_delegated_transaction();
        $DB->delete_records('page_thread_subscriptions', $parameters);
        $transaction->allow_commit();
    }

    public static function delete_thread_subscription_parameters() {
        return self::create_thread_subscription_parameters();
    }

    public static function delete_thread_subscription_returns() {
        return null;
    }

    private static function get_annotation_returns() {
        return new external_single_structure(array_merge(
            [
                'id' => new external_value(PARAM_INT),
                'body' => self::get_thread_returns(),
                'creatorid' => new external_value(PARAM_INT),
                'ispublic' => new external_value(PARAM_INT),
                'pageid' => new external_value(PARAM_INT),
                'target' => self::get_annotation_target_parameters(),
                'type' => new external_value(PARAM_INT),
            ],
            self::timestamp_parameters(),
        ));
    }

    /**
     * @param object $targetid
     * @return array
     */
    private static function get_annotation_target($annotationid) {
        global $DB;

        $target = $DB->get_record('page_annotation_targets', ['annotationid' => $annotationid]);
        $target->selectors = self::get_selectors($target->id);

        return omit_keys($target, ['annotationid']);
    }

    public static function get_annotation_target_parameters() {
        return new external_single_structure(array_merge(
            ['id' => new external_value(PARAM_INT)],
            self::annotation_target_parameters_base(),
        ));
    }

    public static function get_annotations($parameters) {
        self::validate_parameters(self::get_annotations_parameters(), ['parameters' => $parameters]);
        self::validate_cm_context($parameters['pageid']);

        $annotations =
            isset($parameters['annotationid']) ?
                self::get_annotations_by_annotation_id($parameters['annotationid']) :
                self::get_annotations_by_page_id($parameters['pageid']);

        foreach ($annotations as $annotation) {
            $annotation->target = self::get_annotation_target($annotation->id);
            if ($annotation->type == mod_page_annotation_type::POST) {
                $annotation->body = self::get_thread($annotation->id);
            }
        }

        return ['annotations' => array_values($annotations)];
    }

    private static function get_annotations_by_annotation_id($annotationid) {
        global $DB, $USER;

        return $DB->get_records_select(
            'page_annotations',
            'id = ? AND (creatorid = ? OR ispublic = 1)',
            ['id' => $annotationid, 'creatorid' => $USER->id],
        );
    }

    private static function get_annotations_by_page_id($pageid) {
        global $DB, $USER;

        return $DB->get_records_select(
            'page_annotations',
            'pageid = ? AND (creatorid = ? OR ispublic = 1)',
            ['pageid' => $pageid, 'creatorid' => $USER->id],
        );
    }

    /**
     * Describes the parameters for get_annotations.
     *
     * @return external_function_parameters
     * @since Moodle 3.3
     */
    public static function get_annotations_parameters() {
        return new external_function_parameters([
            'parameters' => new external_single_structure([
                'pageid' => new external_value(PARAM_INT),
                'annotationid' => new external_value(PARAM_INT, '', VALUE_OPTIONAL),
            ]),
        ]);
    }

    /**
     * Returns description of method result value
     *
     * @return external_function_parameters
     * @since Moodle 3.0
     */
    public static function get_annotations_returns() {
        return new external_function_parameters([
            'annotations' => new external_multiple_structure(self::get_annotation_returns()),
        ]);
    }

    /**
     * Returns a list of pages in a provided list of courses.
     * If no list is provided all pages that the user can view will be returned.
     *
     * @param array $courseids course ids
     * @return array of warnings and pages
     * @since Moodle 3.3
     */
    public static function get_pages_by_courses($courseids = array()) {
        $warnings = array();
        $returnedpages = array();

        $params = array(
            'courseids' => $courseids,
        );
        $params = self::validate_parameters(self::get_pages_by_courses_parameters(), $params);

        $mycourses = array();
        if (empty($params['courseids'])) {
            $mycourses = enrol_get_my_courses();
            $params['courseids'] = array_keys($mycourses);
        }

        // Ensure there are courseids to loop through.
        if (!empty($params['courseids'])) {
            list($courses, $warnings) = external_util::validate_courses($params['courseids'], $mycourses);

            // Get the pages in this course, this function checks users visibility permissions.
            // We can avoid then additional validate_context calls.
            $pages = get_all_instances_in_courses("page", $courses);
            foreach ($pages as $page) {
                $context = context_module::instance($page->coursemodule);
                // Entry to return.
                $page->name = external_format_string($page->name, $context->id);

                list($page->intro, $page->introformat) = external_format_text(
                    $page->intro,
                    $page->introformat,
                    $context->id,
                    'mod_page',
                    'intro',
                    null
                );
                $page->introfiles = external_util::get_area_files($context->id, 'mod_page', 'intro', false, false);

                $options = array('noclean' => true);
                list($page->content, $page->contentformat) = external_format_text(
                    $page->content,
                    $page->contentformat,
                    $context->id,
                    'mod_page',
                    'content',
                    $page->revision,
                    $options
                );
                $page->contentfiles = external_util::get_area_files($context->id, 'mod_page', 'content');

                $returnedpages[] = $page;
            }
        }

        $result = array(
            'pages' => $returnedpages,
            'warnings' => $warnings
        );
        return $result;
    }

    /**
     * Describes the parameters for get_pages_by_courses.
     *
     * @return external_function_parameters
     * @since Moodle 3.3
     */
    public static function get_pages_by_courses_parameters() {
        return new external_function_parameters(
            array(
                'courseids' => new external_multiple_structure(
                    new external_value(PARAM_INT, 'Course id'),
                    'Array of course ids',
                    VALUE_DEFAULT,
                    array()
                ),
            )
        );
    }

    /**
     * Describes the get_pages_by_courses return value.
     *
     * @return external_single_structure
     * @since Moodle 3.3
     */
    public static function get_pages_by_courses_returns() {
        return new external_single_structure(
            array(
                'pages' => new external_multiple_structure(
                    new external_single_structure(
                        array(
                            'id' => new external_value(PARAM_INT, 'Module id'),
                            'coursemodule' => new external_value(PARAM_INT, 'Course module id'),
                            'course' => new external_value(PARAM_INT, 'Course id'),
                            'name' => new external_value(PARAM_RAW, 'Page name'),
                            'intro' => new external_value(PARAM_RAW, 'Summary'),
                            'introformat' => new external_format_value('intro', 'Summary format'),
                            'introfiles' => new external_files('Files in the introduction text'),
                            'content' => new external_value(PARAM_RAW, 'Page content'),
                            'contentformat' => new external_format_value('content', 'Content format'),
                            'contentfiles' => new external_files('Files in the content'),
                            'legacyfiles' => new external_value(PARAM_INT, 'Legacy files flag'),
                            'legacyfileslast' => new external_value(PARAM_INT, 'Legacy files last control flag'),
                            'display' => new external_value(PARAM_INT, 'How to display the page'),
                            'displayoptions' => new external_value(PARAM_RAW, 'Display options (width, height)'),
                            'revision' => new external_value(PARAM_INT, 'Incremented when after each file changes, to avoid cache'),
                            'timemodified' => new external_value(PARAM_INT, 'Last time the page was modified'),
                            'section' => new external_value(PARAM_INT, 'Course section id'),
                            'visible' => new external_value(PARAM_INT, 'Module visibility'),
                            'groupmode' => new external_value(PARAM_INT, 'Group mode'),
                            'groupingid' => new external_value(PARAM_INT, 'Grouping id'),
                        )
                    )
                ),
                'warnings' => new external_warnings(),
            )
        );
    }

    /**
     * @return external_single_structure
     */
    private static function get_post_returns(): external_single_structure {
        return new external_single_structure(array_merge(
            [
                'id' => new external_value(PARAM_INT),
                'creatorid' => new external_value(PARAM_INT, '', VALUE_OPTIONAL),
            ],
            omit_keys(self::post_parameters(), ['creatorid']),
            self::get_reactions_to_post_returns(),
            self::timestamp_parameters()
        ));
    }

    private static function get_reactions_to_post_returns() {
        return [
            'likescount' => new external_value(PARAM_INT),
            'likedbyuser' => new external_value(PARAM_BOOL),
            'markedbyuser' => new external_value(PARAM_BOOL),
            'markedasrequestedreply' => new external_value(PARAM_BOOL),
            'readingscount' => new external_value(PARAM_INT),
            'readbyuser' => new external_value(PARAM_BOOL),
        ];
    }

    private static function get_posts($threadid) {
        global $DB, $USER;

        $posts = $DB->get_records_select(
            'page_posts',
            'threadid = ? AND (ispublic = 1 OR creatorid = ?)',
            ['threadid' => $threadid, 'creatorid' => $USER->id],
            'timemodified'
        );

        return array_map(function ($post) {
            self::anonymize_post($post);
            self::add_reactions_to_post($post);
            return $post;
        }, array_values($posts));
    }

    private static function add_reactions_to_post($post) {
        global $DB, $USER;

        $post->likescount = $DB->count_records('page_post_likes', ['postid' => $post->id]);
        $post->likedbyuser = $DB->record_exists('page_post_likes', ['postid' => $post->id, 'userid' => $USER->id]);

        $post->readingscount = $DB->count_records('page_post_readings', ['postid' => $post->id]);
        $post->readbyuser = $DB->record_exists('page_post_readings', ['postid' => $post->id, 'userid' => $USER->id]);

        $post->markedbyuser =
            $DB->record_exists('page_post_marks', ['postid' => $post->id, 'userid' => $USER->id]);

        return $post;
    }

    private static function get_selectors($annotationtargetid) {
        global $DB;

        $selectors = $DB->get_records('page_selectors', ['annotationtargetid' => $annotationtargetid]);
        return array_values(array_map(function ($selector) use ($DB) {
            $result = $DB->get_record(
                mod_page_selector::map_type_to_table_name($selector->type),
                ['selectorid' => $selector->id]
            );
            $result->type = $selector->type;
            return omit_keys($result, ['id', 'selectorid']);
        }, $selectors));
    }

    public static function get_thread($annotationid) {
        global $DB, $USER;

        $thread = $DB->get_record('page_threads', ['annotationid' => $annotationid]);
        $thread->posts = self::get_posts($thread->id);
        $thread->subscribedtobyuser =
            $DB->record_exists('page_thread_subscriptions', ['threadid' => $thread->id, 'userid' => $USER->id]);

        return $thread;
    }

    public static function get_thread_returns() {
        return new external_single_structure([
            'id' => new external_value(PARAM_INT),
            'annotationid' => new external_value(PARAM_INT),
            'posts' => new external_multiple_structure(self::get_post_returns()),
            'replyid' => new external_value(PARAM_INT, '', VALUE_OPTIONAL),
            'replyrequested' => new external_value(PARAM_BOOL),
            'subscribedtobyuser' => new external_value(PARAM_BOOL),
        ], '', VALUE_OPTIONAL);
    }

    public static function getreadingprogress($data) {
        global $CFG, $DB, $USER;

        $r = new stdClass();
        $r->userid = $USER->id;
        $r->courseid = $data['courseid'];
        $r->pageid = $data['pageid'];

        $query = '
            SELECT section, count(section) as count
            FROM (SELECT * FROM ' . $CFG->prefix . 'page_reading AS m WHERE userid=? AND courseid=? AND pageid=?) as mm
            GROUP by section
            ';

        $transaction = $DB->start_delegated_transaction();
        $res = $DB->get_records_sql($query, array($USER->id, $data['courseid'], $data['pageid']));
        $transaction->allow_commit();

        return array('response' => json_encode($res));
    }

    public static function getreadingprogress_is_allowed_from_ajax() {
        return true;
    }

    // TODO: Add returns for create and update

    /**
     * Get readingprogress
     */
    public static function getreadingprogress_parameters() {
        return new external_function_parameters(
            array(
                'data' =>
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, '', VALUE_OPTIONAL),
                            'pageid' => new external_value(PARAM_INT, '', VALUE_OPTIONAL)
                        )
                    )
            )
        );
    }

    public static function getreadingprogress_returns() {
        return new external_single_structure(
            array('response' => new external_value(PARAM_RAW, 'All bookmarks of an user'))
        );
    }

    private static function id_parameter() {
        return ['id' => new external_value(PARAM_INT)];
    }

    public static function log($data) {
        global $CFG, $DB, $USER;

        $r = new stdClass();
        $r->name = 'mod_page';
        $r->component = 'mod_page';
        $r->eventname = '\mod_page\event\course_module_' . $data['action'];
        $r->action = $data['action'];
        $r->target = 'course_module';
        $r->objecttable = 'page';
        $r->objectid = 0;
        $r->crud = 'r';
        $r->edulevel = 2;
        $r->contextid = 120;
        $r->contextlevel = 70;
        $r->contextinstanceid = 86;
        $r->userid = $USER->id;
        $r->courseid = (int) $data['courseid'];

        //$r->relateduserid=NULL;
        $r->anonymous = 0;
        $r->other = $data['entry'];
        $r->timecreated = $data['utc'];
        $r->origin = 'web';
        $r->ip = $_SERVER['REMOTE_ADDR'];
        //$r->realuserid=NULL;

        $transaction = $DB->start_delegated_transaction();
        $res = $DB->insert_record("logstore_standard_log", (array) $r);
        $transaction->allow_commit();

        if ($data['action'] == "scroll") {
            $d = json_decode($data['entry']);
            $s = new stdClass();
            $s->section = $d->value->targetID;
            $s->sectionoffset = (int) $d->value->scrollYDistance;
            $s->userid = (int) $USER->id;
            $s->courseid = (int) $data['courseid'];
            $s->pageid = (int) $d->value->pageid;
            $s->creationdate = (int) $d->utc;

            $transaction = $DB->start_delegated_transaction();
            $res2 = $DB->insert_record("page_reading", (array) $s);
            $transaction->allow_commit();
        }
        return array('response' => json_encode($res));
    }

    public static function log_is_allowed_from_ajax() {
        return true;
    }

    /**
     * Takes Longpage log data form the client
     */
    public static function log_parameters() {
        return new external_function_parameters(
            array(
                'data' =>
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL),
                            'utc' => new external_value(PARAM_INT, '...utc time', VALUE_OPTIONAL),
                            'action' => new external_value(PARAM_TEXT, '..action', VALUE_OPTIONAL),
                            'entry' => new external_value(PARAM_RAW, 'log data', VALUE_OPTIONAL)
                        )
                    )
            )
        );
    }

    public static function log_returns() {
        return new external_single_structure(
            array('response' => new external_value(PARAM_RAW, 'Server respons to the incomming log'))
        );
    }

    private static function post_parameters() {
        return [
            'threadid' => new external_value(PARAM_INT),
            'creatorid' => new external_value(PARAM_INT),
            'anonymous' => new external_value(PARAM_BOOL),
            'content' => new external_value(PARAM_TEXT, ''),
            'ispublic' => new external_value(PARAM_BOOL, '', VALUE_OPTIONAL),
        ];
    }

    private static function timestamp_parameters() {
        return ['timecreated' => new external_value(PARAM_INT), 'timemodified' => new external_value(PARAM_INT)];
    }

    private static function update_annotation_tags($tags, $annotationid) {
        global $DB;

        $DB->delete_records('page_annotation_tags', ['annotationid' => $annotationid]);
        $DB->insert_records('page_annotation_tags', array_map_merge($tags, ['annotationid' => $annotationid]));
    }

    public static function update_highlight($id, $styleclass) {
        global $DB;

        self::validate_parameters(self::create_annotation_parameters(), ['id' => $id, 'styleclass' => $styleclass]);
        $annotation = $DB->get_record('page_annotations', ['id' => $id]);
        self::validate_cm_context($annotation->pageid);

        self::validate_highlight_can_be_deleted_and_updated($annotation);

        $transaction = $DB->start_delegated_transaction();
        $DB->update_record('page_annotation_targets', ['annotationid' => $id, 'styleclass' => $styleclass]);
        $DB->update_record('page_annotations', ['id' => $id, 'timemodified' => time()]);
        $transaction->allow_commit();

        return [
            'annotation' => self::get_annotations(['pageid' => $annotation->pageid, 'annotationid' => $id])['annotations'][0]
        ];
    }

    public static function update_highlight_parameters() {
        return new external_function_parameters([
            'id' => new external_value(PARAM_INT),
            'styleclass' => new external_value(PARAM_TEXT),
        ]);
    }

    public static function update_highlight_returns() {
        return self::create_annotation_returns();
    }

    public static function update_post($postupdateparams) {
        global $DB;

        self::validate_parameters(self::update_post_parameters(), ['postupdate' => $postupdateparams]);
        $postupdate = (object) $postupdateparams;
        $annotation = self::get_annotation_by_post_id($postupdate->id);
        self::validate_cm_context($annotation->pageid);

        $transaction = $DB->start_delegated_transaction();
        self::validate_post_can_be_updated($postupdate);
        $DB->update_record('page_posts', array_merge((array) $postupdate, ['timemodified' => time()]));
        $transaction->allow_commit();

        return ['post' => $DB->get_record('page_posts', pick_keys((array) $postupdate, ['id']))];
    }

    public static function update_post_parameters() {
        return new external_function_parameters([
            'postupdate' =>  new external_single_structure(array_merge(
                self::id_parameter(),
                pick_keys(self::post_parameters(), ['anonymous', 'ispublic']),
                [
                    'content' => new external_value(PARAM_TEXT, '', VALUE_OPTIONAL),
                    'markedasrequestedreply' => new external_value(PARAM_BOOL, '', VALUE_OPTIONAL),
                ],
            )),
        ]);
    }

    public static function update_post_returns() {
        return self::create_post_returns();
    }

    private static function validate_cm_context($pageid) {
        global $DB;

        $page = $DB->get_record('page', ['id' => $pageid], '*', MUST_EXIST);
        $cm = get_coursemodule_from_instance('page', $page->id, $page->course, false, MUST_EXIST);
        $modcontext = context_module::instance($cm->id);
        self::validate_context($modcontext);
    }

    private static function validate_highlight_can_be_deleted_and_updated($highlight): void {
        global $USER;

        if ($USER->id !== $highlight->creatorid) {
            throw new invalid_parameter_exception('Highlight cannot be updated by user other than its creator.');
        }
        if ($highlight->type !== mod_page_annotation_type::HIGHLIGHT) {
            throw new invalid_parameter_exception('Annotation is no highlight. 
                Only highlights can be updated by using this method.');
        }
    }

    private static function validate_post_can_be_deleted_and_udpated($post, $postisthreadroot) {
        global $DB;

        // TODO: validate that post is not root of thread
        // TODO: markasrequestedreply
        //if ($postIntern->creatorid !== $USER->id) {
        //    throw new invalid_parameter_exception('Post can only be deleted or updated by user that created it.');
        //}
        if ($post->markedasrequestedreply) {
            throw new invalid_parameter_exception('Post is marked as the reply requested. 
                It cannot be deleted/updated since others might depend on it.');
        }

        self::validate_post_not_referenced_by_other_post($post);

        $isliked = $DB->record_exists('page_post_likes', ['postid' => $post->id]);
        if ($isliked) {
            throw new invalid_parameter_exception('Post is liked by others. 
                It cannot be deleted/updated since others might depend on it.');
        }

        $ismarked = $DB->record_exists_select(
            'page_post_marks',
            'postid = ? AND userid != ?',
            ['postid' => $post->id, 'userid' => $post->creatorid]
        );
        if ($ismarked) {
            throw new invalid_parameter_exception('Post is marked by others. 
                It cannot be deleted/updated since others might depend on it.');
        }

        // TODO: Validation
/*        $threadhassubscription = $DB->record_exists_select(
            'page_thread_subscriptions',
            'threadid = ? AND userid != ?',
            ['threadid' => $post->threadid, 'userid' => $post->creatorid]
        );
        if ($threadhassubscription && $postisthreadroot) {
            throw new invalid_parameter_exception('Thread that postIntern belongs to is subscribed to by others.
                The postIntern cannot be deleted/updated since it is the root of the thread and others might depend on the thread and,
                therefore, the postIntern.');
        }*/
    }

    private static function validate_post_can_be_updated($postupdate) {
        global $DB, $USER;

        // TODO: Check if user has capability to update postIntern without validation and return if so
        // TODO: Check if user has capability for updating postIntern
        // TODO: Enable validation again

        //$post = $DB->get_record('page_posts', ['id' => $postupdate->id]);
        //$thread = $DB->get_record('page_threads', ['id' => $post->threadid]);
        //$rootpost = $DB->get_record('page_posts', ['id' => $thread->rootid]);
        //$postisthreadroot = $post->threadid === $thread->rootid;
        //if (($post->ispublic && !$postupdate->ispublic) || $post->content !== $postupdate->content) {
        //    self::validate_post_can_be_deleted_and_udpated($post, $postisthreadroot);
        //}
        //if ($postupdate->markedasrequestedreply) {
        //    if ($rootpost->creatorid !== $USER->id) {
        //        throw new invalid_parameter_exception('The postIntern can only be marked as the reply requested by the user who requested
        //            the reply.');
        //    }
        //    if (!$thread->requestedreply) {
        //        throw new invalid_parameter_exception('The postIntern cannot be marked as the reply requested since no reply was requested
        //        for thread.');
        //    }
        //    if ($thread->rootid === $postupdate->id) {
        //        throw new invalid_parameter_exception('The postIntern cannot be marked as the reply requested since it is the root of the
        //        thread were the reply has been requested.');
        //    }
        //}
    }

    /**
     * @param $post
     */
    private static function validate_post_not_referenced_by_other_post($post) {
        global $DB;

        $islastpost = !($DB->record_exists_select(
            'page_posts',
            'threadid = ? AND timecreated > ?',
            ['threadid' => $post->threadid, 'timecreated' => $post->timecreated]
        ));
        if (!$islastpost) {
            throw new invalid_parameter_exception('Only the last postIntern in a thread can be deleted/updated as postIntern could be referenced
                by other posts.');
        }
    }

    /**
     * @param $postid
     */
    private static function validate_post_write($postid): void {
        self::validate_parameters(self::create_post_like_parameters(), ['postid' => $postid]);
        $annotation = self::get_annotation_by_post_id($postid);
        self::validate_cm_context($annotation->pageid);
    }

    /**
     * Simulate the page/view.php web interface page: trigger events, completion, etc...
     *
     * @param int $pageid the page instance id
     * @return array of warnings and status result
     * @throws moodle_exception
     * @since Moodle 3.0
     */
    public static function view_page($pageid) {
        global $DB, $CFG;
        require_once($CFG->dirroot . "/mod/page/lib.php");

        $params = self::validate_parameters(
            self::view_page_parameters(),
            array(
                'pageid' => $pageid
            )
        );
        $warnings = array();

        // Request and permission validation.
        $page = $DB->get_record('page', array('id' => $params['pageid']), '*', MUST_EXIST);
        list($course, $cm) = get_course_and_cm_from_instance($page, 'page');

        $context = context_module::instance($cm->id);
        self::validate_context($context);

        require_capability('mod/page:view', $context);

        // Call the page/lib API.
        page_view($page, $course, $cm, $context);

        $result = array();
        $result['status'] = true;
        $result['warnings'] = $warnings;
        return $result;
    }

    /**
     * Returns description of method parameters
     *
     * @return external_function_parameters
     * @since Moodle 3.0
     */
    public static function view_page_parameters() {
        return new external_function_parameters(
            array(
                'pageid' => new external_value(PARAM_INT, 'page instance id')
            )
        );
    }

    /**
     * Returns description of method result value
     *
     * @return external_description
     * @since Moodle 3.0
     */
    public static function view_page_returns() {
        return new external_single_structure(
            array(
                'status' => new external_value(PARAM_BOOL, 'status: true if success'),
                'warnings' => new external_warnings()
            )
        );
    }
}
