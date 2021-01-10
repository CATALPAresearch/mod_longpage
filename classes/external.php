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

function pick_keys($arrOrObj, $keys) {
    $result = array_intersect_key((array) $arrOrObj, array_fill_keys($keys, 1));
    return gettype($arrOrObj) == 'array' ? $result : (object) $result;
}

function omit_keys($arrOrObj, $keys) {
    $result = array_diff_key((array) $arrOrObj, array_fill_keys($keys, 1));
    return gettype($arrOrObj) == 'array' ? $result : (object) $result;
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

const MOD_PAGE_ANNOTATION_TARGET_TYPE_SEGMENT = 0;
const MOD_PAGE_ANNOTATION_TARGET_TYPE_ANNOTATION = 1;

const MOD_PAGE_ANNOTATION_TAG_TYPE_STANDARD = 0;
const MOD_PAGE_ANNOTATION_TAG_TYPE_MOTIVATION = 1;

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

    static function map_type_to_table_name($type) {
        return self::$TYPE_TO_TABLE_NAME_MAPPING[$type];
    }

    static function map_table_name_to_type($table_name) {
        if (!isset(self::$TABLE_NAME_TO_TYPE_MAPPING)) {
            self::$TABLE_NAME_TO_TYPE_MAPPING = array_flip(self::$TYPE_TO_TABLE_NAME_MAPPING);
        }
        return self::$TABLE_NAME_TO_TYPE_MAPPING[$table_name];
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
    /**
     * Creates page annotation
     *
     * @param object annotation
     * @return array with annotation id
     * @since Moodle 3.0
     */
    public static function create_annotation($annotation) {
        global $DB;

        $transaction = $DB->start_delegated_transaction();
        $annotation['timecreated'] = time();
        $annotation['timemodified'] = time();
        $annotationid =
            $DB->insert_record('page_annotations', omit_keys($annotation, ['target', 'tags']));
        self::create_annotation_targets($annotation['target'], $annotationid);
        $DB->insert_records('page_annotation_tags', array_map_merge($annotation['tags'], ['annotationid' => $annotationid]));
        $transaction->allow_commit();

        return ['id' => $annotationid]; // TODO: Update return value - get full annotation
    }

    /**
     * Returns description of method parameters
     *
     * @return external_function_parameters
     * @since Moodle 3.0
     */
    public static function create_annotation_parameters() {
        return new external_function_parameters([
            'annotation' => new external_single_structure(array_merge([
                'pageid' => new external_value(PARAM_INT),
                'userid' => new external_value(PARAM_INT),
                'target' => new external_multiple_structure(
                    self::page_annotation_target_parameters(),
                ),
            ], self::page_annotation_parameters()))
        ]);
    }

    /**
     * Returns description of method parameters
     *
     * @return external_single_structure
     * @since Moodle 3.0
     */
    public static function create_annotation_returns() {
        return new external_single_structure(
            array('id' => new external_value(PARAM_RAW))
        );
    }

    private static function create_annotation_targets($targets, $annotationid) {
        global $DB;

        foreach ($targets as $target) {
            $target['id'] =
                $DB->insert_record('page_annotation_targets', ['annotationid' => $annotationid, 'type' => $target['type']]);
            switch ($target['type']) {
                case MOD_PAGE_ANNOTATION_TARGET_TYPE_SEGMENT:
                    self::create_segment(pick_keys($target, ['selector', 'styleclass']), $target['id']);
                    break;
                case MOD_PAGE_ANNOTATION_TARGET_TYPE_ANNOTATION:
                    $DB->insert_record('page_annot_annot_targets', ['annotationid' => $annotationid, 'targetid' => $target['id']]);
                    break;
            }

        }
    }

    /**
     * @param $segment
     * @param $targetid
     */
    private static function create_segment($segment, $targetid) {
        global $DB;

        $segmentid =
            $DB->insert_record('page_segments', ['annotationtargetid' => $targetid, 'styleclass' => $segment['styleclass']]);
        self::create_selectors($segment['selector'], $segmentid);
    }

    /**
     * @param $selectors // TODO: Correct and complete documentations of external functions
     * @param $segmentid
     */
    private static function create_selectors($selectors, $segmentid): void {
        global $DB;

        foreach ($selectors as $selector) {
            $selectorid = $DB->insert_record('page_selectors', ['segmentid' => $segmentid, 'type' => $selector['type']]);
            $DB->insert_record(mod_page_selector::map_type_to_table_name($selector['type']),
                array_merge(omit_keys($selector, ['type']), ['selectorid' => $selectorid]));
        }
    }

    public static function page_annotation_target_parameters() {
        return new external_function_parameters([
            'annotationid' => new external_value(PARAM_INT, '', VALUE_OPTIONAL), // TODO: Introduce new target to frontend
            'selector' => new external_multiple_structure(
                new external_single_structure([
                    'type' => new external_value(PARAM_INT),
                    // TODO: Introduce new type to frontend, return type with get response
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
            'type' => new external_value(PARAM_INT), // TODO: Introduce new type to frontend
        ]);
    }

    /**
     * Delete page annotation
     *
     * @param integer id
     * @return void
     * @since Moodle 3.0
     */
    public static function delete_annotation($id) {
        global $DB;
        $assocconditions = ['annotationid' => $id];

        $transaction = $DB->start_delegated_transaction();
        self::delete_annotation_targets($assocconditions);
        $DB->delete_records('page_annotation_tags', $assocconditions);
        $DB->delete_records('page_annotation_ratings', $assocconditions);
        $DB->delete_records('page_annotation_views', $assocconditions);
        $DB->delete_records('page_annotations', ['id' => $id]);
        $transaction->allow_commit();

    }

    /**
     * Returns description of method parameters
     *
     * @return external_function_parameters
     * @since Moodle 3.0
     */
    public static function delete_annotation_parameters() {
        return new external_function_parameters([
            'id' => new external_value(PARAM_INT),
        ]);
    }

    public static function delete_annotation_returns() {
        return null;
    }

    private static function delete_annotation_targets($conditions) {
        global $DB;

        $targets = $DB->get_records('page_annotation_targets', $conditions);
        foreach ($targets as $target) {
            self::delete_annotation_target($target, $conditions, $DB);
        }
        $DB->delete_records('page_annotation_targets', $conditions);
    }

    /**
     * @param $target
     */
    private static function delete_annotation_target($target): void {
        global $DB;

        $conditions = ['annotationtargetid' => $target->id];
        switch ($target->type) {
            case MOD_PAGE_ANNOTATION_TARGET_TYPE_SEGMENT:
                self::delete_segments($conditions);
                break;
            case MOD_PAGE_ANNOTATION_TARGET_TYPE_ANNOTATION:
                $DB->delete_records('page_annot_annot_targets', $conditions);
                break;
        }
    }

    private static function delete_segments($conditions) {
        global $DB;

        $pagesegments = $DB->get_records('page_segments', $conditions);
        foreach ($pagesegments as $pagesegment) {
            self::delete_selectors(['segmentid' => $pagesegment->id]);
        }
        $DB->delete_records('page_segments', $conditions);
    }

    private static function delete_selectors($conditions) {
        global $DB;

        $pageselectors = $DB->get_records('page_selectors', $conditions);
        foreach ($pageselectors as $pageselector) {
            $tablename = mod_page_selector::map_type_to_table_name($pageselector->type);
            $DB->delete_records($tablename, ['selectorid' => $pageselector->id]);
        }
        $DB->delete_records('page_selectors', $conditions);
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

    private static function get_selectors($segmentid) {
        global $DB;

        $selectors = $DB->get_records('page_selectors', ['segmentid' => $segmentid]);
        return array_values(array_map(function($selector) use ($DB) {
            $result = $DB->get_record(
                mod_page_selector::map_type_to_table_name($selector->type),
                ['selectorid' => $selector->id]
            );
            $result->type = $selector->type;
            return omit_keys($result, ['id', 'selectorid']);
        }, $selectors));
    }

    private static function get_annotation_targets($annotationid) {
        global $DB;

        $targets = $DB->get_records('page_annotation_targets', ['annotationid' => $annotationid]);
        return array_values(array_map(function($target) use ($DB) {
            $targetid = $target->id;
            $result = omit_keys($target, ['annotationid', 'id']);
            switch ($target->type) {
                case MOD_PAGE_ANNOTATION_TARGET_TYPE_SEGMENT:
                    return object_merge(self::get_page_segment($targetid), $result);
                case MOD_PAGE_ANNOTATION_TARGET_TYPE_ANNOTATION:
                    return object_merge(
                        $DB->get_record('page_annot_annot_targets', ['targetid' => $targetid], 'annotationid'),
                        $result
                    );
            }
        }, $targets));
    }

    // TODO: Return number strings as numbers
    public static function get_annotations($pageid, $userid) { // TODO: Make naming of functions consistent
        global $DB;

        $transaction = $DB->start_delegated_transaction();
        $annotations = self::get_annotations_visible_to_user($pageid, $userid);
        foreach ($annotations as $annotation) {
            self::add_assoc_to_and_anonymize_annot($annotation);
        }
        $transaction->allow_commit();

        return array_values($annotations); // TODO: Explicit return type
    }

    /**
     * Describes the parameters for get_annotations.
     *
     * @return external_function_parameters
     * @since Moodle 3.3
     */
    public static function get_annotations_parameters() {
        return new external_function_parameters([
            'pageid' => new external_value(PARAM_INT),
            'userid' => new external_value(PARAM_INT)
        ]);
    }

    /**
     * Returns description of method result value
     *
     * @return external_function_parameters
     * @since Moodle 3.0
     */
    public static function get_annotations_returns() {
        return new external_multiple_structure(
            new external_single_structure(array_merge([
                'id' => new external_value(PARAM_INT),
                'pageid' => new external_value(PARAM_INT),
                'target' => new external_multiple_structure(
                    self::page_annotation_target_parameters()
                ),
                'timecreated' => new external_value(PARAM_INT),
                'timemodified' => new external_value(PARAM_INT),
                'userid' => new external_value(PARAM_INT, '', VALUE_OPTIONAL),
            ], self::page_annotation_parameters())),
        );
    }

    // TODO: Add returns for create and update

    public static function get_annotations_is_allowed_from_ajax() {
        return true;
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

    /**
     * Updates page annotation body
     *
     * @param integer annotation_id
     * @param string value
     * @return null //TODO: What are the correct types? How do I correctly document methods?
     * @since Moodle 3.0
     */
    public static function update_annotation($annotation) {
        global $DB;

        $transaction = $DB->start_delegated_transaction();
        $annotation['timemodified'] = time();
        $DB->update_record('page_annotations', omit_keys($annotation, ['tags']));
        if (!empty($annotation['tags'])) {
            self::update_annotation_tags($annotation['tags'], $annotation['id']);
        }
        $transaction->allow_commit();
    }

    /**
     * Returns description of method parameters
     *
     * @return external_function_parameters
     * @since Moodle 3.0
     */
    public static function update_annotation_parameters() {
        return new external_function_parameters([
            'annotation' => new external_single_structure(array_merge([
                'id' => new external_value(PARAM_INT),
            ], self::page_annotation_parameters())),
        ]);
    }

    private static function page_annotation_parameters($required = false) {
        return [
            'anonymous' => new external_value(PARAM_BOOL, '', $required ? VALUE_REQUIRED : VALUE_OPTIONAL),
            'body' => new external_value(PARAM_TEXT, '', $required ? VALUE_REQUIRED : VALUE_OPTIONAL),
            'private' => new external_value(PARAM_BOOL, '', $required ? VALUE_REQUIRED : VALUE_OPTIONAL),
            'tags' => new external_multiple_structure(new external_single_structure([
                'value' => new external_value(PARAM_TEXT),
                'type' => new external_value(PARAM_TEXT, '', $required ? VALUE_REQUIRED : VALUE_OPTIONAL),
            ]), $required ? VALUE_REQUIRED : VALUE_OPTIONAL),
        ];
    }

    /**
     * Returns description of method parameters
     *
     * @return null
     * @since Moodle 3.0
     */
    public static function update_annotation_returns() {
        return new external_function_parameters([
            'id' => new external_value(PARAM_INT),
            self::page_annotation_parameters(true),
        ]);
    }

    private static function update_annotation_tags($tags, $annotationid) {
        global $DB;

        $DB->delete_records('page_annotation_tags', ['annotationid' => $annotationid]);
        $DB->insert_records('page_annotation_tags', array_map_merge($tags, ['annotationid' => $annotationid]));
    }

    /**
     * @param object $targetid
     * @return array
     */
    private static function get_page_segment($targetid) {
        global $DB;

        $segment = $DB->get_record('page_segments', ['annotationtargetid' => $targetid]);
        $segment->selector = self::get_selectors($segment->id);

        return omit_keys($segment, ['id', 'annotationtargetid']);
    }

    /**
     * @param $pageid
     * @param $userid
     * @return array
     */
    private static function get_annotations_visible_to_user($pageid, $userid) {
        global $DB;

        $select = 'pageid = ? AND (userid = ? OR private = 0)';
        $params = ['pageid' => $pageid, 'userid' => $userid];
        return $DB->get_records_select('page_annotations', $select, $params);
    }

    /**
     * @param $annotation
     */
    private static function anonymize_annotation($annotation) {
        unset($annotation->userid);
    }

    /**
     * @param $annotation
     */
    private static function add_assoc_to_and_anonymize_annot($annotation) {
        global $DB;

        $annotation->target = self::get_annotation_targets($annotation->id);
        $annotation->tags = $DB->get_records('page_annotation_tags', ['annotationid' => $annotation->id], '', 'value, type');
        if ((bool) $annotation->anonymous) {
            self::anonymize_annotation($annotation);
        }
    }
}
