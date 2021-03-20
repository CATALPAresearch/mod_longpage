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
 * Post Preference Calculator
 *
 * @package    mod_page
 * @copyright  2020 Adrian Stritzinger <adrian.stritzinger@web.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_page\local\post_recommendation;

defined('MOODLE_INTERNAL') || die();

require_once("$CFG->dirroot/mod/page/locallib.php");

/**
 * Post Preference Calculator
 *
 * Calculates (all current) preferences of users for posts in batches of users and posts.
 *
 * @copyright  2020 Adrian Stritzinger <adrian.stritzinger@web.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class post_preference_calculator {
    const MIN_PREFERENCES = 3;

    public static function calculate_and_save_relative_preferences($pageid, $batchsize = 100) {
        global $DB;

        $limitfrom = 0;
        $fields = 'userid, avg, count';
        while (true) {
            $prefprofiles = $DB->get_records(
                'page_post_pref_profiles', ['pageid' => $pageid], 'id ASC', $fields, $limitfrom, $batchsize
            );
            if (!count($prefprofiles)) {
                break;
            }

            foreach ($prefprofiles as $profile) {
                self::calculate_and_save_relative_preferences_for_user_with_profile($profile, $pageid);
            }
            if (count($prefprofiles) < $batchsize) {
                break;
            }

            $limitfrom += $batchsize;
        }
    }

    private static function calculate_and_save_relative_preferences_for_user_with_profile($prefprofile, $pageid, $batchsize = 100) {
        global $DB;

        $fields = 'postid, value';
        $conditions = ['pageid' => $pageid, 'userid' => $prefprofile->userid];
        $limitfrom = 0;
        while (true) {
            $abspreferences = $DB->get_records(
                'page_absolute_post_prefs', $conditions, 'id ASC', $fields, $limitfrom, $batchsize,
            );
            if (count($abspreferences) < self::MIN_PREFERENCES) {
                break;
            }

            $relpreferences = self::map_abs_prefs_to_rel_prefs($prefprofile, $pageid, $abspreferences);

            $table = 'page_relative_post_prefs';
            $postids = array_map(function ($pref) {
                return (int) $pref->postid;
            }, $relpreferences);
            list($insql, $inparams) = $DB->get_in_or_equal($postids);
            $select = "postid $insql AND pageid = :pageid AND userid = :userid";
            $params = array_merge($inparams, ['pageid' => $pageid, 'userid' => $prefprofile->userid]);
            $DB->delete_records_select($table, $select, $params);
            $DB->insert_records($table, $relpreferences);
            if (count($abspreferences) < $batchsize) {
                break;
            }
        }
    }

    public static function calculate_and_save_preference_profiles($pageid, $batchsize = 100) {
        $limitfrom = 0;
        while (true) {
            $userids = \get_page_users_ids($pageid, $limitfrom, $batchsize);
            if (!count($userids)) {
                break;
            }

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

        $sql = 'SELECT AVG(value) AS avg, COUNT(*) as count
                FROM {page_post_pref_profiles} 
                WHERE userid = :userid AND pageid = :pageid';
        foreach ($userids as $userid) {
            $profile = $DB->get_records_sql($sql, ['userid' => $userid, 'pageid' => $pageid]);
            array_push($profiles, self::get_preference_profile($userid, $pageid, $profile->avg, $profile->count));
        }

        $table = 'page_post_pref_profiles';
        list($inuseridssql, $inuseridsparams) = $DB->get_in_or_equal($userids);
        $select = "userid $inuseridssql AND pageid = ".((int) $pageid);
        $DB->delete_records_select($table, $select, $inuseridsparams);
        $DB->insert_records($table, $profiles);
    }

    public static function get_preference_profile($userid, $pageid, $avg, $count) {
        $profile = new \stdClass();
        $profile->userid = $userid;
        $profile->pageid = $pageid;
        $profile->avg = $avg;
        $profile->count = $count;

        return $profile;
    }

    public static function calculate_and_save_absolute_preferences($pageid, $batchsize = 100) {
        global $DB;

        $limitfrom = 0;
        $fields = 'id, pageid, threadid, creatorid';
        while (true) {
            $posts = $DB->get_records('page_posts', ['pageid' => $pageid], 'id ASC', $fields, $limitfrom, $batchsize);
            if (!count($posts)) {
                break;
            }

            self::calculate_and_save_absolute_preferences_for_posts($posts, $pageid);
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
    public static function calculate_and_save_absolute_preferences_for_posts($posts, $pageid, $batchsize = 100) {
        $limitfrom = 0;
        while (true) {
            $userids = \get_page_users_ids($pageid, $limitfrom, $batchsize);
            if (!count($userids)) {
                break;
            }

            self::calculate_and_save_absolute_preferences_for_posts_and_users($posts, $userids, $pageid);
            if (count($userids) < $batchsize) {
                break;
            }

            $limitfrom += $batchsize;
        }
    }

    private static function calculate_and_save_absolute_preferences_for_posts_and_users($posts, $userids, $pageid) {
        global $DB;

        list($select, $params, $readings, $likes, $bookmarks) = self::get_user_reactions($posts, $DB, $userids);

        $preferences = [];
        $nextreading = array_shift($readings);
        $nextlike = array_shift($likes);
        $nextbookmark = array_shift($bookmarks);
        while ($nextreading || $nextlike || $nextbookmark) {
            $preference = self::get_absolute_preference_base($pageid, $nextreading, $nextlike, $nextbookmark);
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

        $table = 'page_absolute_post_prefs';
        $DB->delete_records_select($table, $select, $params);
        $DB->insert_records($table, $preferences);
    }

    /**
     * @param $pageid
     * @param $nextreading
     * @param $nextlike
     * @param $nextbookmark
     * @return \stdClass
     */
    private static function get_absolute_preference_base($pageid, $nextreading, $nextlike, $nextbookmark): \stdClass {
        $preference = new \stdClass();
        $preference->pageid = $pageid;
        $preference->postid = min(
            array_map(function($next) {
                return (int) $next->postid;
            }, array_filter([$nextreading, $nextlike, $nextbookmark]))
        );
        $preference->userid = min(
            array_map(function($next) {
                return (int) $next->userid;
            }, array_filter([$nextreading, $nextlike, $nextbookmark]))
        );
        return $preference;
    }

    /**
     * @param $posts
     * @param $DB
     * @param $userids
     * @return array
     */
    private static function get_user_reactions($posts, $DB, $userids): array {
        $postids = array_map(function($post) {
            return (int) $post->id;
        }, $posts);
        list($inpostidssql, $inpostidsparams) = $DB->get_in_or_equal($postids);
        list($inuseridssql, $inuseridsparams) = $DB->get_in_or_equal($userids);
        $select = "postid $inpostidssql AND userid $inuseridssql";
        $params = array_merge($inpostidsparams, $inuseridsparams);
        $sort = 'postid ASC, userid ASC';
        $readings = $DB->get_records_select('page_post_readings', $select, $params, $sort);
        $likes = $DB->get_records_select('page_post_likes', $select, $params, $sort);
        $bookmarks = $DB->get_records_select('page_post_bookmarks', $select, $params, $sort);
        return array($select, $params, $readings, $likes, $bookmarks);
    }

    /**
     * @param $prefprofile
     * @param $pageid
     * @param $abspreferences
     * @return void[]
     */
    private static function map_abs_prefs_to_rel_prefs($prefprofile, $pageid, $abspreferences): array {
        $relpreferences = array_map(function($abspreference) use ($prefprofile, $pageid) {
            $relpreference = new \stdClass();
            $relpreference->pageid = $pageid;
            $relpreference->postid = $abspreference->postid;
            $relpreference->userid = $abspreference->userid;
            $relpreference->value = (float) $abspreference->value - (float) $prefprofile->avg;
        }, $abspreferences);
        return $relpreferences;
    }
}
