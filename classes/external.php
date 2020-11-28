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

function pick_keys($arrOrObj, $keys)
{
    $result = array_intersect_key((array) $arrOrObj, array_fill_keys($keys, 1));
    return gettype($arrOrObj) == 'array' ? $result : (object) $result;
}

function omit_keys($arrOrObj, $keys)
{
    $result = array_diff_key((array) $arrOrObj, array_fill_keys($keys, 1));
    return gettype($arrOrObj) == 'array' ? $result : (object) $result;
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
class mod_page_external extends external_api
{
    /**
     * Creates page annotation
     *
     * @param object annotation
     * @return array with annotation id
     * @since Moodle 3.0
     */
    public static function create_page_annotation($annotation)
    {
        global $DB;

        $transaction = $DB->start_delegated_transaction();
        $annotationid = $DB->insert_record('page_annotation', pick_keys($annotation, ['timecreated', 'timemodified', 'userid']));
        self::create_page_annotation_targets($annotation['target'], $annotationid);
        if (isset($annotation['body'])) {
            $DB->insert_record('page_annotation_body', array('annotationid' => $annotationid, 'value' => $annotation['body']));
        }
        $transaction->allow_commit();

        return array('id'=> $annotationid);
    }

    /**
     * Returns description of method parameters
     *
     * @return external_function_parameters
     * @since Moodle 3.0
     */
    public static function create_page_annotation_parameters()
    {
        return new external_function_parameters(
            array(
                'annotation' => new external_single_structure(
                    array(
                        'body' => new external_value(PARAM_TEXT, '', VALUE_OPTIONAL),
                        'target' => new external_multiple_structure(
                            new external_single_structure(
                                array(
                                    'selector' => new external_multiple_structure(
                                        new external_single_structure(
                                            array(
                                                'type' => new external_value(PARAM_TEXT, '', VALUE_REQUIRED, 'RangeSelector', false),
                                                'startposition' => new external_value(PARAM_INT, '', VALUE_OPTIONAL),
                                                'startcontainer' => new external_value(PARAM_TEXT, '', VALUE_OPTIONAL),
                                                'startoffset' => new external_value(PARAM_INT, '', VALUE_OPTIONAL),
                                                'endposition' => new external_value(PARAM_INT, '', VALUE_OPTIONAL),
                                                'endcontainer' => new external_value(PARAM_TEXT, '', VALUE_OPTIONAL),
                                                'endoffset' => new external_value(PARAM_INT, '', VALUE_OPTIONAL),
                                                'exact' => new external_value(PARAM_TEXT, '', VALUE_OPTIONAL),
                                                'prefix' => new external_value(PARAM_TEXT, '', VALUE_OPTIONAL),
                                                'suffix' => new external_value(PARAM_TEXT, '', VALUE_OPTIONAL),
                                            ), '', VALUE_OPTIONAL
                                        )
                                    ),
                                    'pageid' => new external_value(PARAM_TEXT),
                                    'styleclass' => new external_value(PARAM_TEXT),
                                ), '', VALUE_OPTIONAL
                            )
                        ),
                        'timecreated' => new external_value(PARAM_INT),
                        'timemodified' => new external_value(PARAM_INT),
                        'userid' => new external_value(PARAM_TEXT),
                    )
                )
            )
        );
    }

    /**
     * Returns description of method parameters
     *
     * @return external_single_structure
     * @since Moodle 3.0
     */
    public static function create_page_annotation_returns()
    {
        return new external_single_structure(
                array( 'id' => new external_value(PARAM_RAW) )
        );
    }

    private static function create_page_annotation_targets($targets, $annotationid)
    {
        global $DB;

        foreach ($targets as $target) {
            $targetid = $DB->insert_record('page_annotation_target', array_merge(pick_keys($target, ['pageid', 'styleclass']), array('annotationid' => $annotationid)));
            foreach ($target['selector'] as $selector) {
                $selectorid = $DB->insert_record('page_selector', array('annotationtargetid' => $targetid, 'selectortype' => $selector['type']));
                $DB->insert_record('page_' . $selector['type'], array_merge(omit_keys($selector, ['type']), array('selectorid' => $selectorid)));
            }
        }
    }

    /**
     * Delete page annotation
     *
     * @param integer id
     * @return void
     * @since Moodle 3.0
     */
    public static function delete_page_annotation($id)
    {
        global $DB;

        $transaction = $DB->start_delegated_transaction();
        $targets = $DB->get_records('page_annotation_target', array('annotationid' => $id));
        foreach ($targets as $target) {
            $selectors = $DB->get_records('page_selector', array('annotationtargetid' => $target->id));
            foreach ($selectors as $selector) {
                $DB->delete_records('page_' . $selector->selectortype, array('selectorid' => $selector->id));
                $DB->delete_records('page_selector', array('id' => $selector->id));
            }
        }
        $DB->delete_records('page_annotation_target', array('annotationid' => $id));
        $DB->delete_records('page_annotation_body', array('annotationid' => $id));
        $DB->delete_records('page_annotation', array('id' => $id));
        $transaction->allow_commit();
    }

    /**
     * Returns description of method parameters
     *
     * @return external_function_parameters
     * @since Moodle 3.0
     */
    public static function delete_page_annotation_parameters()
    {
        return new external_function_parameters(
            array(
                    'id' => new external_value(PARAM_INT),
            )
        );
    }

    public static function delete_page_annotation_returns()
    {
        return null;
    }

    /**
     * Returns description of method parameters
     *
     * @return external_function_parameters
     * @since Moodle 3.0
     */
    public static function view_page_parameters()
    {
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
     * @since Moodle 3.0
     * @throws moodle_exception
     */
    public static function view_page($pageid)
    {
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
    public static function view_page_returns()
    {
        return new external_single_structure(
            array(
                'status' => new external_value(PARAM_BOOL, 'status: true if success'),
                'warnings' => new external_warnings()
            )
        );
    }

    private static function get_selectors_by_annotation_target($target)
    {
        global $DB;

        $result = array();
        $selectors = $DB->get_records('page_selector', array('annotationtargetid' => $target->id));
        foreach ($selectors as $selector) {
            $typed_selector = $DB->get_record('page_' . $selector->selectortype, array('selectorid' => $selector->id));
            $typed_selector->type = $selector->selectortype;
            array_push($result, omit_keys($typed_selector, ['id', 'selectorid']));
        }
        return $result;
    }

    private static function get_targets_by_annotation($annotation, $pageid)
    {
        global $DB;

        $result = array();
        $targets = $DB->get_records('page_annotation_target', array('annotationid' => $annotation->id, 'pageid' => $pageid));
        foreach ($targets as $target) {
            $target->selector = self::get_selectors_by_annotation_target($target);
            array_push($result, omit_keys($target, ['id', 'annotationid']));
        }
        return $result;
    }

    public static function get_annotations_by_page_and_user($pageid, $userid)
    {
        global $DB;

        $transaction = $DB->start_delegated_transaction(); // TODO: Is transaction really necessary? Is there no eager loading?
        $annotations = array_values($DB->get_records('page_annotation', array('userid' => $userid)));
        foreach ($annotations as $annotation) {
            $annotation->target = self::get_targets_by_annotation($annotation, $pageid);
            $annotation->body = $DB->get_record('page_annotation_body', array('annotationid' => $annotation->id))->value;
        }
        $transaction->allow_commit();

        return json_encode($annotations);
    }

    /**
     * Describes the parameters for get_annotations_by_page_and_user.
     *
     * @return external_function_parameters
     * @since Moodle 3.3
     */
    public static function get_annotations_by_page_and_user_parameters()
    {
        return new external_function_parameters(
                array(
                    'pageid' => new external_value(PARAM_INT),
                    'userid' => new external_value(PARAM_INT)
                )
        );
    }

    /**
     * Returns description of method result value
     *
     * @return external_multiple_structure
     * @since Moodle 3.0
     */
    public static function get_annotations_by_page_and_user_returns()
    {
        return new external_value(PARAM_RAW, 'All annotations of a user of a page');
    }

    public static function get_annotations_by_page_and_user_is_allowed_from_ajax()
    {
        return true;
    }

    /**
     * Describes the parameters for get_pages_by_courses.
     *
     * @return external_function_parameters
     * @since Moodle 3.3
     */
    public static function get_pages_by_courses_parameters()
    {
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
    public static function get_pages_by_courses($courseids = array())
    {
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
    public static function get_pages_by_courses_returns()
    {
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
    public static function log_parameters()
    {
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
    public static function log_returns()
    {
        return new external_single_structure(
            array( 'response' => new external_value(PARAM_RAW, 'Server respons to the incomming log') )
        );
    }
    public static function log($data)
    {
        global $CFG, $DB, $USER;

        $r = new stdClass();
        $r->name='mod_page';
        $r->component='mod_page';
        $r->eventname='\mod_page\event\course_module_' . $data['action'];
        $r->action=$data['action'];
        $r->target='course_module';
        $r->objecttable='page';
        $r->objectid=0;
        $r->crud='r';
        $r->edulevel=2;
        $r->contextid=120;
        $r->contextlevel=70;
        $r->contextinstanceid=86;
        $r->userid=$USER->id;
        $r->courseid=(int)$data['courseid'];

        //$r->relateduserid=NULL;
        $r->anonymous=0;
        $r->other=$data['entry'];
        $r->timecreated=$data['utc'];
        $r->origin='web';
        $r->ip=$_SERVER['REMOTE_ADDR'];
        //$r->realuserid=NULL;

        $transaction = $DB->start_delegated_transaction();
        $res = $DB->insert_record("logstore_standard_log", (array)$r);
        $transaction->allow_commit();


        if ($data['action']=="scroll") {
            $d = json_decode($data['entry']);
            $s = new stdClass();
            $s->section = $d->value->targetID;
            $s->sectionoffset = (int)$d->value->scrollYDistance;
            $s->userid = (int)$USER->id;
            $s->courseid = (int)$data['courseid'];
            $s->pageid = (int)$d->value->pageid;
            $s->creationdate = (int)$d->utc;

            $transaction = $DB->start_delegated_transaction();
            $res2 = $DB->insert_record("page_reading", (array)$s);
            $transaction->allow_commit();
        }
        return array('response'=> json_encode($res));
    }

    public static function log_is_allowed_from_ajax()
    {
        return true;
    }

    /**
        * Get readingprogress
        */
    public static function getreadingprogress_parameters()
    {
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
    public static function getreadingprogress_returns()
    {
        return new external_single_structure(
            array( 'response' => new external_value(PARAM_RAW, 'All bookmarks of an user') )
        );
    }
    public static function getreadingprogress($data)
    {
        global $CFG, $DB, $USER;

        $r = new stdClass();
        $r->userid = $USER->id;
        $r->courseid = $data['courseid'];
        $r->pageid = $data['pageid'];

        $query = '
            SELECT section, count(section) as count
            FROM (SELECT * FROM '.$CFG->prefix.'page_reading AS m WHERE userid=? AND courseid=? AND pageid=?) as mm
            GROUP by section
            ';

        $transaction = $DB->start_delegated_transaction();
        $res = $DB->get_records_sql($query, array($USER->id, $data['courseid'], $data['pageid']));
        $transaction->allow_commit();

        return array('response'=> json_encode($res));
    }
    public static function getreadingprogress_is_allowed_from_ajax()
    {
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
    public static function update_page_annotation_body($annotation_id, $value) // TODO: This does only work as long as there is only one body per annotation.
    {
        global $DB;

        $transaction = $DB->start_delegated_transaction();
        $annotation_body = $DB->get_record('page_annotation_body', array('annotationid' => $annotation_id));
        $DB->update_record('page_annotation_body', array('id' => $annotation_body->id, 'value' => $value));
        $transaction->allow_commit();
    }

    /**
     * Returns description of method parameters
     *
     * @return external_function_parameters
     * @since Moodle 3.0
     */
    public static function update_page_annotation_body_parameters()
    {
        return new external_function_parameters(
            array(
                'annotation_id' => new external_value(PARAM_INT),
                'value' => new external_value(PARAM_TEXT),
            )
        );
    }

    /**
     * Returns description of method parameters
     *
     * @return null
     * @since Moodle 3.0
     */
    public static function update_page_annotation_body_returns()
    {
       return null;
    }
}
