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
 * @copyright  2021 Adrian Stritzinger <adrian.stritzinger@studium.fernuni-hagen.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_page\local\post_recommendation;

defined('MOODLE_INTERNAL') || die();

require_once("$CFG->dirroot/mod/longpage/locallib.php");

/**
 * Post Preference Calculator
 *
 * Calculates (all current) preferences of users for posts in batches of users and posts.
 *
 * @copyright  2021 Adrian Stritzinger <adrian.stritzinger@studium.fernuni-hagen.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class post_preference_calculator {
    public const MIN_PREFERENCES_PER_USER = 3;

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
            if (count($abspreferences) < self::MIN_PREFERENCES_PER_USER) {
                break;
            }

            $relpreferences = self::map_abs_prefs_to_rel_prefs($prefprofile, $pageid, $abspreferences);

            $transaction = $DB->start_delegated_transaction();
            $DB->insert_records('page_relative_post_prefs', $relpreferences);
            $transaction->allow_commit();
            if (count($abspreferences) < $batchsize) {
                break;
            }
        }
    }

    public static function calculate_and_save_avg_preference($pageid) {
        global $DB;

        $sql = 'SELECT AVG(avg) AS avg
                FROM {page_post_pref_profiles} 
                WHERE pageid = ?';
        $avgpostpreference = $DB->get_field_sql($sql, ['pageid' => $pageid]);
        $transaction = $DB->start_delegated_transaction();
        $DB->update_record('page', ['id' => $pageid, 'avgpostpreference' => $avgpostpreference]);
        $transaction->allow_commit();
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
                FROM {page_absolute_post_prefs} 
                WHERE userid = ? AND pageid = ?';
        foreach ($userids as $userid) {
            $profile = $DB->get_record_sql($sql, [$userid, $pageid]);
            if (((int) $profile->count) < self::MIN_PREFERENCES_PER_USER) {
                continue;
            }

            array_push($profiles, self::get_preference_profile($userid, $pageid, $profile->avg, $profile->count));
        }

        $table = 'page_post_pref_profiles';
        $transaction = $DB->start_delegated_transaction();
        $DB->insert_records($table, $profiles);
        $transaction->allow_commit();
    }

    private static function did_user_participate_in_thread($threadid, $userid) {
        global $DB;

        $postsinthread = $DB->get_records('page_posts', ['threadid' => $threadid]);
        foreach ($postsinthread as $post) {
            if ($post->creatorid == $userid) {
                return true;
            }
        }
        return false;
    }

    public static function get_preference_profile($userid, $pageid, $avg, $count) {
        $profile = new \stdClass();
        $profile->userid = $userid;
        $profile->pageid = $pageid;
        $profile->avg = $avg;
        $profile->count = $count;

        return $profile;
    }

    public static function delete_absolute_preferences($pageid) {
        global $DB;

        $transaction = $DB->start_delegated_transaction();
        $DB->delete_records('page_absolute_post_prefs', ['pageid' => $pageid]);
        $transaction->allow_commit();
    }

    public static function delete_preference_profiles($pageid) {
        global $DB;

        $transaction = $DB->start_delegated_transaction();
        $DB->delete_records('page_post_pref_profiles', ['pageid' => $pageid]);
        $transaction->allow_commit();
    }

    public static function delete_relative_preferences($pageid) {
        global $DB;

        $transaction = $DB->start_delegated_transaction();
        $DB->delete_records('page_relative_post_prefs', ['pageid' => $pageid]);
        $transaction->allow_commit();
    }

    public static function calculate_and_save_absolute_preferences($pageid, $batchsize = 100) {
        global $DB;

        $limitfrom = 0;
        $fields = 'id, pageid, threadid, creatorid';
        $conditions = ['pageid' => $pageid, 'ispublic' => 1];
        while (true) {
            $posts = $DB->get_records('page_posts', $conditions, 'id ASC', $fields, $limitfrom, $batchsize);
            if (!count($posts)) {
                break;
            }

            foreach ($posts as $post) {
                self::calculate_and_save_absolute_preferences_for_post($post, $pageid);
            }
            if (count($posts) < $batchsize) {
                break;
            }

            $limitfrom += $batchsize;
        }
    }

    public static function calculate_and_save_absolute_preferences_for_post($post, $pageid, $batchsize = 100) {
        $limitfrom = 0;
        while (true) {
            $userids = \get_page_users_ids($pageid, $limitfrom, $batchsize);
            if (!count($userids)) {
                break;
            }

            foreach ($userids as $userid) {
                self::calculate_and_save_absolute_preferences_for_post_and_user($post, $userid, $pageid);
            }
            if (count($userids) < $batchsize) {
                break;
            }

            $limitfrom += $batchsize;
        }
    }

    private static function calculate_and_save_absolute_preferences_for_post_and_user($post, $userid, $pageid) {
        global $DB;

        $conditions = ['postid' => $post->id, 'userid' => $userid];
        $userreadpost = $DB->record_exists('page_post_readings', $conditions);
        if (!$userreadpost) {
            return;
        }

        $preference = self::get_absolute_preference($post, $userid, $pageid);

        $transaction = $DB->start_delegated_transaction();
        $DB->insert_record('page_absolute_post_prefs', (array) $preference, false, true);
        $transaction->allow_commit();
    }

    private static function get_absolute_preference($post, $userid, $pageid) {
        $preference = new \stdClass();
        $preference->pageid = $pageid;
        $preference->postid = $post->id;
        $preference->userid = $userid;
        $preference->value = self::get_post_preference_of_user($post, $userid);
        return $preference;
    }

    private static function get_post_preference_of_user($post, $userid) {
        global $DB;

        $conditions = ['postid' => $post->id, 'userid' => $userid];
        $userlikespost = $DB->record_exists('page_post_likes', $conditions);
        $userbookmarkedpost = $DB->record_exists('page_post_bookmarks', $conditions);
        $userparticipatedinthread = self::did_user_participate_in_thread($post->threadid, $userid);
        $usersubscribedtothread =
            $DB->record_exists('page_thread_subscriptions', ['threadid' => $post->threadid, 'userid' => $userid]);
        return $userlikespost || $userbookmarkedpost || $userparticipatedinthread || $usersubscribedtothread ? 1 : 0;
    }

    private static function map_abs_prefs_to_rel_prefs($prefprofile, $pageid, $abspreferences) {
        return array_map(function($abspreference) use ($prefprofile, $pageid) {
            $relpreference = new \stdClass();
            $relpreference->pageid = $pageid;
            $relpreference->postid = $abspreference->postid;
            $relpreference->userid = $prefprofile->userid;
            $relpreference->value = (float) $abspreference->value - (float) $prefprofile->avg;
            return $relpreference;
        }, $abspreferences);
    }
}
