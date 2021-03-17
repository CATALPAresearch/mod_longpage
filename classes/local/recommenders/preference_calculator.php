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
 * Preference Calculator
 *
 * @package    mod_page
 * @copyright  2020 Adrian Stritzinger <adrian.stritzinger@web.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_page\local\recommenders;

defined('MOODLE_INTERNAL') || die();

require_once("$CFG->libdir/accesslib.php");
require_once("$CFG->libdir/externallib.php");
require_once("$CFG->dirroot/course/externallib.php");
require_once("$CFG->dirroot/user/externallib.php");
require_once("$CFG->dirroot/mod/page/locallib.php");
require_once("$CFG->dirroot/mod/page/lib.php");

/**
 * Preference Calculator
 *
 * Calculates (all current) preferences of users for posts in batches of users and posts.
 *
 * @copyright  2020 Adrian Stritzinger <adrian.stritzinger@web.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class preference_calculator {
    public static function calculate_and_save_preference_profiles($pageid, $batchsize = 100) {
        $limitfrom = 0;
        while (true) {
            $userids = self::get_page_users_ids($pageid, $limitfrom, $batchsize);
            self::calculate_and_save_preference_profiles_for_users($userids, $pageid);
            if (count($userids) < $batchsize) {
                break;
            }
            $limitfrom += $batchsize;
        }
    }

    public static function calculate_and_save_preference_profiles_for_users($userids, $pageid) {
        global $DB;

        $profiles = [];
        foreach ($userids as $userid) {
            $preferences = $DB->get_records('page_absolute_preferences', ['userid' => $userid, 'pageid' => $pageid]);
            array_push($profiles, self::calculate_preference_profile($userid, $pageid, $preferences));
        }

        $table = 'page_preference_profiles';
        list($inuseridssql, $inuseridsparams) = $DB->get_in_or_equal($userids);
        $select = "userid $inuseridssql AND pageid = ".((int) $pageid);
        $DB->delete_records_select($table, $select, $inuseridsparams);
        $DB->insert_records($table, $profiles);
    }

    public static function calculate_preference_profile($userid, $pageid, $preferences) {
        $profile = new \stdClass();
        $profile->userid = $userid;
        $profile->pageid = $pageid;
        $profile->timecreated = time();

        $count = count($preferences);
        $values = array_map(function ($preference) { return (float) $preference->value; }, $preferences);
        $profile->count = $count;
        $profile->avg = (bool) $count ? array_sum($values) / $count : 0.0;

        return $profile;
    }

    public static function calculate_and_save_preferences($pageid, $batchsize = 100) {
        global $DB;

        $limitfrom = 0;
        $fields = 'id, pageid, threadid, creatorid';
        while (true) {
            $posts = $DB->get_records('page_posts', ['pageid' => $pageid], 'timecreated ASC', $fields, $limitfrom, $batchsize);
            if (!count($posts)) break;

            self::calculate_and_save_preferences_for_posts($posts, $pageid);
            if (count($posts) < $batchsize) {
                break;
            }

            $limitfrom += $batchsize;
        }
    }

    /**
     * IMPORTANT: Posts must belong to the same page.
     *
     * @param $posts
     * @param int $batchsize
     */
    public static function calculate_and_save_preferences_for_posts($posts, $pageid, $batchsize = 100) {
        $limitfrom = 0;
        while (true) {
            $userids = self::get_page_users_ids($pageid, $limitfrom, $batchsize);
            if (!count($userids)) break;

            self::calculate_and_save_preferences_for_posts_and_users($posts, $userids, $pageid);
            if (count($userids) < $batchsize) {
                break;
            }

            $limitfrom += $batchsize;
        }
    }

    private static function calculate_and_save_preferences_for_posts_and_users($posts, $userids, $pageid) {
        global $DB;

        $postids = array_map(function ($post) { return $post->id; }, $posts);

        list($inpostidssql, $inpostidsparams) = $DB->get_in_or_equal($postids);
        list($inuseridssql, $inuseridsparams) = $DB->get_in_or_equal($userids);
        $select = "postid $inpostidssql AND userid $inuseridssql";
        $params = array_merge($inpostidsparams, $inuseridsparams);
        $sort = 'postid ASC, userid ASC';
        $readings = $DB->get_records_select('page_post_readings', $select, $params, $sort);
        $likes = $DB->get_records_select('page_post_likes', $select, $params, $sort);
        $bookmarks = $DB->get_records_select('page_post_bookmarks', $select, $params, $sort);

        $preferences = [];
        $nextreading = array_shift($readings);
        $nextlike = array_shift($likes);
        $nextbookmark = array_shift($bookmarks);
        while ($nextreading || $nextlike || $nextbookmark) {
            $preference = new \stdClass();
            $preference->timecreated = \time();
            $preference->pageid = $pageid;
            $preference->postid = min(
                array_map(function ($next) { return (int) $next->postid; }, array_filter([$nextreading, $nextlike, $nextbookmark]))
            );
            $preference->userid = min(
                array_map(function ($next) { return (int) $next->userid; }, array_filter([$nextreading, $nextlike, $nextbookmark]))
            );
            if (isset($nextreading) && $nextreading->postid == $preference->postid && $nextreading->userid == $preference->userid) {
                $preference->value = 0;
                $nextreading = array_shift($readings);
            }
            if (isset($nextlike) && $nextlike->postid == $preference->postid && $nextlike->userid == $preference->userid) {
                $preference->value = 1;
                $nextlike = array_shift($likes);
            }
            if (isset($nextbookmark) && $nextbookmark->postid == $preference->postid && $nextbookmark->userid == $preference->userid) {
                $preference->value = 1;
                $nextbookmark = array_shift($bookmarks);
            }
            array_push($preferences, $preference);
        }

        $table = 'page_absolute_preferences';
        $DB->delete_records_select($table, $select, $params);
        $DB->insert_records($table, $preferences);
    }

    private static function get_page_users_ids($pageid, $limitfrom = 0, $limitnum = 100) {
        $cm = get_coursemodule_by_pageid($pageid);
        $context = \context_module::instance($cm->id);
        $users = get_enrolled_users($context, '', 0, 'u.id', 'timecreated ASC', null, $limitfrom, $limitnum);
        return array_map(function ($user) { return (int) $user->id; }, $users);
    }
}
