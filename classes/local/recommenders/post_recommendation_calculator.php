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

require_once("$CFG->dirroot/mod/page/locallib.php");

/**
 * Post Recommendation Calculator
 *
 * @copyright  2020 Adrian Stritzinger <adrian.stritzinger@web.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class post_recommendation_calculator {
    const MIN_PREFERENCES = 2;
    const MIN_NEIGHBOURHOOD = 2;

    public static function calculate_and_save_recommendations($pageid, $batchsize = 100) {
        $limitfrom = 0;
        while (true) {
            $userids = \get_page_users_ids($pageid, $limitfrom, $batchsize);
            foreach ($userids as $userid) {
                self::calculate_and_save_recommendations_for_user($userid, $pageid);
            }
            if (count($userids) < $batchsize) {
                break;
            }
            $limitfrom += $batchsize;
        }
    }

    /**
     * Only posts that the user has not yet a preference for are recommended
     *
     * @param $userid
     * @param $pageid
     * @param int $batchsize
     */
    private static function calculate_and_save_recommendations_for_user($userid, $pageid, $batchsize = 100) {
        global $DB;

        $preferences = $DB->get_records(
            'page_relative_preferences', ['pageid' => $pageid, 'userid' => $userid], 'postid, value'
        );
        if (count($preferences) < self::MIN_PREFERENCES) {
            return;
        }

        $prefprofile = $DB->get_record('page_preference_profiles', ['pageid' => $pageid, 'userid' => $userid]);

        $limitfrom = 0;
        $idsofpostswithprefs = array_map(function($pref) {
            (int) $pref->postid;
        }, $preferences);
        list($select, $conditions) = self::get_select_and_conditions_for_posts_to_calc_rec_for($idsofpostswithprefs, $DB, $pageid);
        $fields = 'id';
        while (true) {
            $posts = $DB->get_records_select($select, $conditions, 'timecreated ASC', $fields, $limitfrom, $batchsize);
            $postids = array_map(function ($post) { return (int) $post->id; }, $posts);
            foreach ($postids as $postid) {
                self::calculate_and_save_recommendation_for_user_for_post(
                    $userid, $postid, $preferences, $idsofpostswithprefs, $prefprofile->avg, $pageid
                );
            }

            if (count($posts) < $batchsize) {
                break;
            }

            $limitfrom += $batchsize;
        }
    }

    private static function calculate_and_save_recommendation_for_user_for_post
        ($userid, $postid, $preferences, $idsofpostswithprefs, $avgpref, $pageid) {
        global $DB;

        $recommendation = self::get_recommendation_base($pageid, $postid, $userid);

        list($inpostidssql, $inpostidsparams) = $DB->get_in_or_equal($idsofpostswithprefs);
        $select = "postaid $inpostidssql AND postbid = :postid OR postaid = :postid AND postbid $inpostidssql";
        $relevantneighbourhood = $DB->get_records_select(
            'page_post_similarities', $select, array_merge($inpostidsparams, ['postid' => $postid]),
        );
        $recommendation->value = count($relevantneighbourhood) < self::MIN_NEIGHBOURHOOD ? $avgpref :
            self::calculate_recommenation_from_preferences_and_neighbourhood($preferences, $relevantneighbourhood);
        $DB->insert_record('page_post_recommendations', $recommendation, false, true);
    }

    private static function calculate_recommenation_from_preferences_and_neighbourhood($preferences, $neighbourhood) {
        $dividend = 0;
        $divisor = 0;
        $prefssortedbypostid = uasort($preferences, 'cmppostid');
        $neighbourhoodsortedbypostid = uasort($neighbourhood, 'cmppostid');
        foreach ($neighbourhoodsortedbypostid as $similarity) {
            $divisor += (float) $similarity->value;
            $dividend += ((float) $similarity->value) *
                ((float) self::shift_until_match_and_return_match($prefssortedbypostid, $similarity->postid));
        }
        return $dividend / $divisor;
    }

    private static function shift_until_match_and_return_match($prefssortedbypostid, $postid) {
        $preference = array_shift($prefssortedbypostid);
        while (isset($preference)) {
            if ($preference->postid == $postid) {
                return $preference;
            }
            $preference = array_shift($prefssortedbypostid);
        }
    }

    private static function get_recommendation_base($pageid, $postid, $userid): \stdClass {
        $recommendation = new \stdClass();
        $recommendation->pageid = $pageid;
        $recommendation->postid = $postid;
        $recommendation->userid = $userid;
        $recommendation->timecreated = time();
        return $recommendation;
    }

    private static function get_select_and_conditions_for_posts_to_calc_rec_for($idsofpostswithprefs, $pageid) {
        global $DB;

        list($insql, $inparams) = $DB->get_in_or_equal($idsofpostswithprefs);
        $select = "postid NOT $insql AND pageid = :pageid AND ispublic = :ispublic";
        $conditions = array_merge($inparams, ['pageid' => $pageid, 'ispublic' => true]);
        return array($select, $conditions);
    }

}
