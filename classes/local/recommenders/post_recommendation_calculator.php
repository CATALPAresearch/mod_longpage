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
 * Post Recommendation Calculator
 *
 * @package    mod_page
 * @copyright  2020 Adrian Stritzinger <adrian.stritzinger@web.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_page\local\recommenders;

defined('MOODLE_INTERNAL') || die();

/**
 * Post Recommendation Calculator
 *
 * @copyright  2020 Adrian Stritzinger <adrian.stritzinger@web.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class post_recommendation_calculator {
    const MIN_PREFERENCES = 3;
    const MIN_NEIGHBOURHOOD = 3;

    public static function calculate_and_save_recommendations($pageid, $batchsize = 100) {
        $limitfrom = 0;
        while (true) {
            $userids = \get_page_users_ids($pageid, $limitfrom, $batchsize);
            foreach ($userids as $userid) {
                self::calculate_and_save_recommendations_for_users($userid, $pageid);
            }
            if (count($userids) < $batchsize) {
                break;
            }
            $limitfrom += $batchsize;
        }
    }

    private static function calculate_and_save_recommendations_for_user($userid, $pageid, $batchsize = 100) {
        global $DB;

        $limitfrom = 0;
        $fields = 'id';
        while (true) {
            $posts = $DB->get_records('page_posts', ['pageid' => $pageid], 'timecreated ASC', $fields, $limitfrom, $batchsize);
            $postids = array_map(function ($post) { return (int) $post->id; }, $posts);
            foreach ($postids as $postid) {
                self::calculate_and_save_recommendation_for_user_for_post($userid, $postid, $pageid);
            }
            if (count($posts) < $batchsize) {
                break;
            }

            $limitfrom += $batchsize;
        }
    }

    private static function calculate_and_save_recommendation_for_user_for_post($userid, $postid, $pageid) {
        global $DB;

        $recommendation = new \stdClass();
        $recommendation->pageid = $pageid;
        $recommendation->postid = $postid;
        $recommendation->userid = $userid;
        $recommendation->timecreated = time();

        // TODO Only calculate preferences for unknown posts

        $relpreferences = $DB->get_records('page_relative_preferences', ['userid' => $userid, 'pageid' => $pageid]);
        if (count($relpreferences) < self::MIN_PREFERENCES) {
            $recommendation->value = self::get_avg_preference($pageid);
            $DB->insert_record('page_post_recommendations', $recommendation, false, true);
            return;
        }

        $postidswithpref = array_map(function ($relpref) { return (int) $relpref->postid; }, $relpreferences);
        list($inpostidssql, $inpostidsparams) = $DB->get_in_or_equal($postidswithpref);
        $select = "postaid $inpostidssql OR postbid $inpostidssql";
        $similarities = $DB->get_records_select('page_post_similarities', $select, array_merge($inpostidsparams, $inpostidsparams));

        if (count($similarities) < self::MIN_NEIGHBOURHOOD) {
            $recommendation->value = self::get_avg_preference_of_user($userid, $pageid);
            $DB->insert_record('page_post_recommendations', $recommendation, false, true);
            return;
        }


    }

    private static function get_avg_preference_of_user($userid, $pageid) {
        global $DB;

        $sql = 'SELECT AVG(value) AS avg FROM {page_relative_preferences} WHERE pageid = :pageid AND userid = :userid';
        return (float) $DB->get_record_sql($sql, ['pageid' => $pageid, 'userid' => $userid])->avg;
    }

    private static function get_avg_preference($pageid) {
        global $DB;

        $sql = 'SELECT AVG(value) AS avg FROM {page_relative_preferences} WHERE pageid = :pageid';
        return (float) $DB->get_record_sql($sql, ['pageid' => $pageid])->avg;
    }

    //public static function calculate_and_save_recommendations($pageid, $batchsize = 100) {
    //    global $DB;
    //
    //    $limitfrom = 0;
    //    $fields = 'id';
    //    while (true) {
    //        $posts = $DB->get_records('page_posts', ['pageid' => $pageid], 'timecreated ASC', $fields, $limitfrom, $batchsize);
    //        $postids = array_map(function ($post) { return (int) $post->id; }, $posts);
    //        self::calculate_and_save_recommendations_for_posts($postids);
    //        if (count($posts) < $batchsize) {
    //            break;
    //        }
    //
    //        $limitfrom += $batchsize;
    //    }
    //}

    //private static function calculate_and_save_recommenations_for_posts($postids) {
    //    global $DB;
    //
    //    foreach ($postids as $postid) {
    //        $similarities = $DB->get_records('page_post_similarities', );
    //        self::calculate_and_save_recommenations_for_post($postid, $similarities);
    //    }
    //
    //    // get similarities for page
    //    /*        -- Ich hol mir zunächst die (15) ähnlichsten Posts über die Similarity
    //            -- Anschließend hol ich mir die Preferences des Users für diese Posts und berechne Bewertung und speichere das raus
    //            -- Ggf. muss ich dafür nochmal auf DB*/
    //}
    //
    //private static function calculate_and_save_recommenations_for_post($postid, $similarities) {
    //    $DB
    //}


}
