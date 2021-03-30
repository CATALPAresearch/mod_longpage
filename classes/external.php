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

use mod_page\local\constants\annotation_type as annotation_type;
use mod_page\local\constants\selector as selector;
use mod_page\local\post_recommendation\post_recommendation_calculation_task as post_recommendation_calculation_task;
use mod_page\local\thread_subscriptions\manage_thread_subscriptions_task as manage_thread_subscriptions_task;
use mod_page\local\thread_subscriptions\post_action as post_action;

require_once("$CFG->libdir/accesslib.php");
require_once("$CFG->libdir/externallib.php");
require_once("$CFG->dirroot/course/externallib.php");
require_once("$CFG->dirroot/user/externallib.php");
require_once("$CFG->dirroot/mod/page/locallib.php");

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
    private static function add_recommendations_to_post($post) {
        global $DB, $USER;

        if ($post->readbyuser) return;

        $post->recommendation = $DB->get_field('page_post_recommendations', 'value', ['postid' => $post->id, 'userid' => $USER->id]) ?:
            $DB->get_field('page', 'avgpostpreference', ['id' => $post->pageid]);
    }

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
            self::create_thread($annotation['body'], $id, $annotation['pageid']);
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
        global $DB, $USER;

        $post = $DB->get_record('page_posts', ['id' => $id]);
        $DB->delete_records('page_post_likes', ['postid' => $id]);
        $DB->delete_records('page_post_readings', ['postid' => $id]);
        $DB->delete_records('page_post_bookmarks', ['postid' => $id]);
        $DB->delete_records('page_posts', ['id' => $id]);

        self::update_annotation_by_thread($post->threadid);

        manage_thread_subscriptions_task::create_manage_thread_subscriptions_task(
            get_coursemodule_by_pageid($post->pageid)->id,
            $id,
            $post->threadid,
            $USER->id,
            post_action::DELETE,
            $post->content,
        );
    }

    private static function get_annotation_by_thread_id($threadid) {
        global $DB;

        $thread = $DB->get_record('page_threads', ['id' => $threadid]);
        return $DB->get_record('page_annotations', ['id' => $thread->annotationid]);
    }

    private static function get_annotation_by_post_id($id) {
        global $DB;

        $post = $DB->get_record('page_posts', ['id' => $id]);
        return self::get_annotation_by_thread_id($post->threadid);
    }

    public static function create_post($postparameters) {
        global $DB, $USER;

        self::validate_parameters(self::create_post_parameters(), ['post' => $postparameters]);
        $postparameters = (object) $postparameters;
        self::validate_cm_context($postparameters->pageid);

        $transaction = $DB->start_delegated_transaction();
        $id = $DB->insert_record(
            'page_posts',
            object_merge($postparameters, ['creatorid' => $USER->id, 'timecreated' => time(), 'timemodified' => time()]),
        );
        $transaction->allow_commit();

        self::update_annotation_by_thread($postparameters->threadid, $postparameters->ispublic);
        self::create_post_reading($id);
        post_recommendation_calculation_task::create_from_pageid_and_queue($postparameters->pageid);

        $posts = self::get_posts($postparameters->threadid, [$id]);

        manage_thread_subscriptions_task::create_manage_thread_subscriptions_task(
            get_coursemodule_by_pageid($postparameters->pageid)->id,
            $id,
            $postparameters->threadid,
            $USER->id,
            post_action::CREATE,
            $postparameters->content,
        );

        return ['post' => array_shift($posts)];
    }

    public static function create_post_like($postid) {
        self::validate_post_write($postid);

        self::create_post_reaction('page_post_likes', $postid);
    }

    private static function create_post_reaction($table, $postid) {
        global $DB, $USER;

        $post = $DB->get_record('page_posts', ['id' => $postid]);

        $keyconditions = ['postid' => $postid, 'userid' => $USER->id];
        $transaction = $DB->start_delegated_transaction();
        if (!$DB->record_exists($table, $keyconditions)) {
            $DB->insert_record($table, array_merge($keyconditions, ['timecreated' => time()]));
        }
        $transaction->allow_commit();

        post_recommendation_calculation_task::create_from_pageid_and_queue($post->pageid);
    }

    public static function create_post_like_parameters() {
        return new external_function_parameters([
            'postid' => new external_value(PARAM_INT),
        ]);
    }

    public static function create_post_like_returns() {
        return null;
    }

    public static function create_post_bookmark($postid) {
        self::validate_post_write($postid);

        self::create_post_reaction('page_post_bookmarks', $postid);
    }

    public static function create_post_bookmark_parameters() {
        return self::create_post_like_parameters();
    }

    public static function create_post_bookmark_returns() {
        return null;
    }

    public static function create_post_parameters() {
        return new external_function_parameters([
            'post' => new external_single_structure(
                array_merge(omit_keys(self::post_parameters(), ['creatorid']), ['pageid' => new external_value(PARAM_INT)])
            ),
        ]);
    }

    public static function create_post_reading($postid) {
        self::validate_post_write($postid);

        self::create_post_reaction('page_post_readings', $postid);
    }

    public static function create_post_reading_parameters() {
        return self::create_post_like_parameters();
    }

    public static function create_post_reading_returns() {
        return null;
    }

    public static function create_post_returns() {
        return new external_function_parameters([
            'post' => self::get_post_returns(),
        ]);
    }

    private static function create_selectors($selectors, $annotationtargetid): void {
        global $DB;

        foreach ($selectors as $selector) {
            $selectorid = $DB->insert_record('page_selectors', ['annotationtargetid' => $annotationtargetid, 'type' => $selector['type']]);
            $DB->insert_record(selector::map_type_to_table_name($selector['type']),
                array_merge(omit_keys($selector, ['type']), ['selectorid' => $selectorid]));
        }
    }

    public static function create_thread($threadparameters, $annotationid, $pageid) {
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
        $postparameters['pageid'] = $pageid;
        $postparameters['threadid'] = $id;
        self::create_post($postparameters);
        self::create_thread_subscription($id);
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

    public static function create_thread_subscription($threadid) {
        global $DB, $USER;

        self::validate_parameters(self::create_thread_subscription_parameters(), ['threadid' => $threadid]);
        $annotation = self::get_annotation_by_thread($threadid);
        self::validate_cm_context($annotation->pageid);

        $table = 'page_thread_subscriptions';
        $keyconditions = ['threadid' => $threadid, 'userid' => $USER->id];
        $transaction = $DB->start_delegated_transaction();
        if (!$DB->record_exists($table, $keyconditions)) {
            $DB->insert_record($table, array_merge($keyconditions, ['timecreated' => time()]));
        }
        $transaction->allow_commit();

        post_recommendation_calculation_task::create_from_pageid_and_queue($annotation->pageid);
    }

    public static function create_thread_subscription_parameters() {
        return new external_function_parameters([
            'threadid' => new external_value(PARAM_INT),
        ]);
    }

    public static function create_thread_subscription_returns() {
        return null;
    }

    private static function delete_thread($thread, $pageid) {
        global $DB;

        self::delete_post_from_db(self::get_posts($thread->id)[0]->id);
        $DB->delete_records('page_thread_subscriptions', ['threadid' => $thread->id]);
        $DB->delete_records('page_threads', ['id' => $thread->id]);

        post_recommendation_calculation_task::create_from_pageid_and_queue($pageid);
    }

    public static function delete_annotation($id): void {
        global $DB;

        self::validate_parameters(self::delete_annotation_parameters(), ['id' => $id]);
        $annotation = $DB->get_record('page_annotations', ['id' => $id]);
        self::validate_cm_context($annotation->pageid);

        // TODO validate that user can delete annotation and that annotation can be deleted (not part of a thread that others depend on), can be merged with validation of highlight & post

        $transaction = $DB->start_delegated_transaction();
        self::delete_annotation_target($id);
        if ($annotation->type == annotation_type::POST) {
            $thread = $DB->get_record('page_threads', ['annotationid' => $annotation->id]);
            self::delete_thread($thread, $annotation->pageid);
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

    /**
     * @param $DB
     * @param $threadid
     * @return mixed
     */
    private static function get_annotation_by_thread($threadid) {
        global $DB;

        $thread = $DB->get_record('page_threads', ['id' => $threadid]);
        return $DB->get_record('page_annotations', ['id' => $thread->annotationid]);
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

        post_recommendation_calculation_task::create_from_pageid_and_queue($post->pageid);
    }

    public static function delete_post_like($postid) {
        global $DB, $USER;

        self::validate_post_write($postid);

        $transaction = $DB->start_delegated_transaction();
        $DB->delete_records('page_post_likes', ['postid' => $postid, 'userid' => $USER->id]);
        $transaction->allow_commit();

        self::schedule_post_recommendation_calculation_task_for_page_with_post($postid);
    }

    public static function delete_post_like_parameters() {
        return self::create_post_like_parameters();
    }

    public static function delete_post_like_returns() {
        return null;
    }

    public static function delete_post_bookmark($postid) {
        global $DB, $USER;

        self::validate_post_write($postid);

        $transaction = $DB->start_delegated_transaction();
        $DB->delete_records('page_post_bookmarks', ['postid' => $postid, 'userid' => $USER->id]);
        $transaction->allow_commit();

        self::schedule_post_recommendation_calculation_task_for_page_with_post($postid);
    }

    public static function delete_post_bookmark_parameters() {
        return self::create_post_like_parameters();
    }

    public static function delete_post_bookmark_returns() {
        return null;
    }

    public static function delete_post_parameters() {
        return new external_function_parameters(self::id_parameter());
    }

    public static function delete_post_reading($postid) {
        global $DB, $USER;

        self::validate_post_write($postid);

        $transaction = $DB->start_delegated_transaction();
        $DB->delete_records('page_post_readings', ['postid' => $postid, 'userid' => $USER->id]);
        $transaction->allow_commit();

        self::schedule_post_recommendation_calculation_task_for_page_with_post($postid);
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
            $tablename = selector::map_type_to_table_name($pageselector->type);
            $DB->delete_records($tablename, ['selectorid' => $pageselector->id]);
        }
        $DB->delete_records('page_selectors', $conditions);
    }

    public static function get_user_roles_by_pageid($pageid) {
        $context = self::get_cm_context_by_pageid($pageid);
        return ['userroles' => role_get_names($context)];
    }

    public static function get_user_roles_by_pageid_parameters() {
        return new external_function_parameters([
            'pageid' => new external_value(PARAM_INT),
        ]);
    }

    public static function get_user_roles_by_pageid_returns() {
        return new external_function_parameters([
            'userroles' => new external_multiple_structure(
              new external_single_structure([
                  'id' => new external_value(PARAM_INT),
                  'localname' => new external_value(PARAM_TEXT),
                  'shortname' => new external_value(PARAM_TEXT),
              ]),
            ),
        ]);
    }

    private static function get_user_roles_ids($context, $userid) {
        $result = [];
        $roles = get_user_roles($context, $userid);
        foreach ($roles as $role) {
            array_push($result, $role->roleid);
        }
        return $result;
    }

    /**
     * Get the link to the users's profile page.
     *
     * @return string
     */
    public function get_profile_link($userid, $courseid) {
        $queryparams = ['id' => $userid, 'course' => $courseid];
        $link = new \moodle_url('/user/view.php', $queryparams);
        return $link->out(false);
    }

    public static function get_enrolled_users_with_roles_by_pageid($pageid) {
        $cm = get_coursemodule_by_pageid($pageid);
        $get_enrolled_users_returns = core_course_external::get_enrolled_users_by_cmid($cm->id);
        foreach ($get_enrolled_users_returns['users'] as $user) {
            $user->roles = self::get_user_roles_ids(context_module::instance($cm->id), $user->id);
            $user->profilelink = self::get_profile_link($user->id, $cm->course);
        }
        return $get_enrolled_users_returns;
    }

    public static function get_enrolled_users_with_roles_by_pageid_parameters() {
        return self::get_user_roles_by_pageid_parameters();
    }

    public static function get_enrolled_users_with_roles_by_pageid_returns() {
        return new external_single_structure([
            'users' => new external_multiple_structure(self::user_description()),
            'warnings' => new external_warnings(),
        ]);
    }

    private static function schedule_post_recommendation_calculation_task_for_page_with_post($postid) {
        global $DB;

        $post = $DB->get_record('page_posts', ['id' => $postid], 'pageid');

        post_recommendation_calculation_task::create_from_pageid_and_queue($post->pageid);
    }

    private static function update_annotation_by_thread($threadid, $ispublic = null) {
        global $DB;

        $annotation = self::get_annotation_by_thread_id($threadid);
        $update = ['id' => $annotation->id, 'timemodified' => time()];
        if (isset($ispublic)) {
            $update['ispublic'] = $ispublic;
        }

        $transaction = $DB->start_delegated_transaction();
        $DB->update_record('page_annotations', $update);
        $transaction->allow_commit();
    }

    /**
     * Create user return value description.
     *
     * @return external_description
     */
    public static function user_description() {
        $userfields = [
            'id'    => new external_value(core_user::get_property_type('id'), 'ID of the user'),
            'profileimage' => new external_value(PARAM_URL, 'The location of the users larger image', VALUE_OPTIONAL),
            'profilelink' => new external_value(PARAM_URL),
            'imagealt' => new external_value(PARAM_TEXT, '', VALUE_OPTIONAL),
            'fullname' => new external_value(PARAM_TEXT, 'The full name of the user', VALUE_OPTIONAL), # TODO: Handle users without name in frontend
            'firstname'   => new external_value(
                core_user::get_property_type('firstname'),
                'The first name(s) of the user',
                VALUE_OPTIONAL),
            'lastname'    => new external_value(
                core_user::get_property_type('lastname'),
                'The family name of the user',
                VALUE_OPTIONAL),
            'roles' => new external_multiple_structure(
                new external_value(PARAM_INT),
            ),
        ];
        return new external_single_structure($userfields);
    }

    public static function delete_thread_subscription($threadid) {
        global $DB, $USER;

        self::validate_parameters(self::create_thread_subscription_parameters(), ['threadid' => $threadid]);
        $annotation = self::get_annotation_by_thread($threadid);
        self::validate_cm_context($annotation->pageid);

        $transaction = $DB->start_delegated_transaction();
        $DB->delete_records('page_thread_subscriptions', ['threadid' => $threadid, 'userid' => $USER->id]);
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
            if ($annotation->type == annotation_type::POST) {
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
                'recommendation' => new external_value(PARAM_FLOAT, '', VALUE_OPTIONAL),
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
            'bookmarkedbyuser' => new external_value(PARAM_BOOL),
            'readingscount' => new external_value(PARAM_INT),
            'readbyuser' => new external_value(PARAM_BOOL),
        ];
    }

    private static function get_posts($threadid, $postids = []) {
        global $DB, $USER;

        $select = 'threadid = ? AND (ispublic = 1 OR creatorid = ?)';
        $params = [$threadid, $USER->id];
        if ($postids) {
            list($inpostidssql, $inpostidsparams) = $DB->get_in_or_equal($postids);
            $select .= " AND id $inpostidssql";
            $params = array_merge($params, $inpostidsparams);
        }

        $posts = $DB->get_records_select('page_posts', $select, $params, 'timemodified ASC');

        return array_map(function ($post) {
            self::anonymize_post($post);
            self::add_reactions_to_post($post);
            self::add_recommendations_to_post($post);
            return $post;
        }, array_values($posts));
    }

    private static function add_reactions_to_post($post) {
        global $DB, $USER;

        $post->likescount = $DB->count_records('page_post_likes', ['postid' => $post->id]);
        $post->likedbyuser = $DB->record_exists('page_post_likes', ['postid' => $post->id, 'userid' => $USER->id]);

        $post->readingscount = $DB->count_records('page_post_readings', ['postid' => $post->id]);
        $post->readbyuser = $DB->record_exists('page_post_readings', ['postid' => $post->id, 'userid' => $USER->id]);

        $post->bookmarkedbyuser =
            $DB->record_exists('page_post_bookmarks', ['postid' => $post->id, 'userid' => $USER->id]);

        return $post;
    }

    private static function get_selectors($annotationtargetid) {
        global $DB;

        $selectors = $DB->get_records('page_selectors', ['annotationtargetid' => $annotationtargetid]);
        return array_values(array_map(function ($selector) use ($DB) {
            $result = $DB->get_record(
                selector::map_type_to_table_name($selector->type),
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

    private static function id_parameter() {
        return ['id' => new external_value(PARAM_INT)];
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
        global $DB, $USER;

        self::validate_parameters(self::update_post_parameters(), ['postupdate' => $postupdateparams]);
        $postupdate = (object) $postupdateparams;
        $post = $DB->get_record('page_posts', ['id' => $postupdate->id]);
        self::validate_cm_context($post->pageid);

        $transaction = $DB->start_delegated_transaction();
        self::validate_post_can_be_updated($postupdate);
        $DB->update_record('page_posts', array_merge((array) $postupdate, ['timemodified' => time()]));
        if (isset($postupdate->content) && $post->content !== $postupdate->content) {
            $DB->delete_records('page_post_readings', ['postid' => $post->id]);
            $DB->insert_record('page_post_readings', ['postid' => $post->id, 'userid' => $USER->id, 'timecreated' => time()]);
        }
        self::update_annotation_by_thread($post->threadid, isset($postupdate->ispublic) ? $postupdate->ispublic : $post->ispublic);
        $transaction->allow_commit();

        post_recommendation_calculation_task::create_from_pageid_and_queue($post->pageid);
        if (isset($postupdate->content) && $post->content !== $postupdate->content) {
            manage_thread_subscriptions_task::create_manage_thread_subscriptions_task(
                get_coursemodule_by_pageid($post->pageid)->id,
                $post->id,
                $post->threadid,
                $USER->id,
                post_action::UPDATE,
                $postupdate->content,
                $post->content,
            );
        }

        $posts = self::get_posts($post->threadid, [$postupdate->id]);
        return ['post' => array_shift($posts)];
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

    public static function update_reading_progress($pageid, $scrolltop) {
        global $DB, $USER;

        self::validate_parameters(
            self::update_reading_progress_parameters(),
            ['pageid' => $pageid, 'scrolltop' => $scrolltop],
        );
        self::validate_cm_context($pageid);

        $transaction = $DB->start_delegated_transaction();
        self::update_or_create(
            'page_reading_progress',
            ['pageid' => $pageid, 'userid' => $USER->id],
            ['pageid' => $pageid, 'scrolltop' => $scrolltop, 'userid' => $USER->id, 'timemodified' => time()]
        );
        $transaction->allow_commit();
    }

    public static function update_reading_progress_parameters() {
        return new external_function_parameters([
            'pageid' => new external_value(PARAM_INT),
            'scrolltop' => new external_value(PARAM_FLOAT),
        ]);
    }

    public static function update_reading_progress_returns() {
        return null;
    }

    private static function update_or_create($table, $conditions, $dataobject) {
        global $DB;

        $record = $DB->get_record($table, $conditions);
        if ($record) {
            $DB->update_record($table, array_merge($dataobject, ['id' => $record->id]));
        } else {
            $DB->insert_record($table, $dataobject);
        }
    }

    private static function get_cm_context_by_pageid($pageid) {
        $cm = get_coursemodule_by_pageid($pageid);
        return context_module::instance($cm->id);
    }

    private static function validate_cm_context($pageid) {
        self::validate_context(self::get_cm_context_by_pageid($pageid));
    }

    private static function validate_highlight_can_be_deleted_and_updated($highlight): void {
        global $USER;

        if ($USER->id !== $highlight->creatorid) {
            throw new invalid_parameter_exception('Highlight cannot be updated by user other than its creator.');
        }
        if ($highlight->type !== annotation_type::HIGHLIGHT) {
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
        //if ($post->markedasrequestedreply) {
        //    throw new invalid_parameter_exception('Post is marked as the reply requested.
        //        It cannot be deleted/updated since others might depend on it.');
        //}

        self::validate_post_not_referenced_by_other_post($post);

        $isliked = $DB->record_exists('page_post_likes', ['postid' => $post->id]);
        if ($isliked) {
            throw new invalid_parameter_exception('Post is liked by others. 
                It cannot be deleted/updated since others might depend on it.');
        }

        $isbookmarked = $DB->record_exists_select(
            'page_post_bookmarks',
            'postid = ? AND userid != ?',
            ['postid' => $post->id, 'userid' => $post->creatorid]
        );
        if ($isbookmarked) {
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
