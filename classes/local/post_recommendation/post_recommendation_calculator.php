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

namespace mod_page\local\post_recommendation;

defined('MOODLE_INTERNAL') || die();

require_once("$CFG->dirroot/mod/page/locallib.php");

/**
 * Post Recommendation Calculator
 *
 * @copyright  2020 Adrian Stritzinger <adrian.stritzinger@web.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class post_recommendation_calculator {
    public const MIN_PREFERENCES_PER_USER_IN_NBH = 2;
    public const MIN_NEIGHBOURHOOD_SIZE = 2;

    public static function delete_recommendations($pageid) {
        global $DB;

        $transaction = $DB->start_delegated_transaction();
        $DB->delete_records('page_post_recommendations', ['pageid' => $pageid]);
        $transaction->allow_commit();
    }

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
            'page_relative_post_prefs', ['pageid' => $pageid, 'userid' => $userid], 'postid, value'
        );
        if (count($preferences) < self::MIN_PREFERENCES_PER_USER_IN_NBH) {
            return;
        }

        $prefprofile = $DB->get_record('page_post_pref_profiles', ['pageid' => $pageid, 'userid' => $userid], 'avg');

        $limitfrom = 0;
        $idsofpostswithprefs = array_map(function($pref) {
            return (int) $pref->postid;
        }, $preferences);
        list($select, $params) = self::get_select_and_params_for_posts_to_calc_rec_for($idsofpostswithprefs, $pageid);
        while (true) {
            $posts = $DB->get_records_select('page_posts', $select, $params, 'timecreated ASC', 'id', $limitfrom, $batchsize);
            $idsofpostswithoutprefs = array_map(function ($post) { return (int) $post->id; }, $posts);
            foreach ($idsofpostswithoutprefs as $postid) {
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
        $select = "(postaid $inpostidssql AND postbid = ?) OR (postaid = ? AND postbid $inpostidssql)";
        $relevantneighbourhood = $DB->get_records_select(
            'page_post_similarities', $select, array_merge($inpostidsparams, [$postid, $postid], $inpostidsparams),
        );
        $recommendation->value = count($relevantneighbourhood) < self::MIN_NEIGHBOURHOOD_SIZE ? (float) $avgpref :
            self::calculate_recommenation_from_preferences_and_neighbourhood($postid, $preferences, $relevantneighbourhood);

        $transaction = $DB->start_delegated_transaction();
        $DB->insert_record('page_post_recommendations', $recommendation, false, true);
        $transaction->allow_commit();
    }

    private static function calculate_recommenation_from_preferences_and_neighbourhood($postid, $preferences, $neighbourhood) {
        $dividend = 0.0;
        $divisor = 0.0;
        uasort($preferences, ['self', 'cmppostid']);
        $normalizedneighbourhood = array_map(function ($similarity) use ($postid) {
            $sim = new \stdClass();
            $sim->postid =
                ((int) $postid) == ((int) $similarity->postaid) ? (int) $similarity->postbid : (int) $similarity->postaid;
            $sim->value = $similarity->value;
            return $sim;
        }, $neighbourhood);
        uasort($normalizedneighbourhood, ['self', 'cmppostid']);
        foreach ($normalizedneighbourhood as $similarity) {
            $divisor += (float) $similarity->value;
            $dividend += ((float) $similarity->value) *
                self::shift_until_match_and_return_match($preferences, $similarity->postid);
        }
        return $dividend / $divisor;
    }

    private static function shift_until_match_and_return_match($prefssortedbypostid, $postid) {
        $preference = array_shift($prefssortedbypostid);
        while (isset($preference)) {
            if ($preference->postid == $postid) {
                return (float) $preference->value;
            }
            $preference = array_shift($prefssortedbypostid);
        }
    }

    private static function get_recommendation_base($pageid, $postid, $userid): \stdClass {
        $recommendation = new \stdClass();
        $recommendation->pageid = $pageid;
        $recommendation->postid = $postid;
        $recommendation->userid = $userid;
        return $recommendation;
    }

    private static function get_select_and_params_for_posts_to_calc_rec_for($idsofpostswithprefs, $pageid) {
        global $DB;

        list($insql, $inparams) = $DB->get_in_or_equal($idsofpostswithprefs);
        $select = "NOT (id $insql) AND pageid = ? AND ispublic = ?";
        $params = array_merge($inparams, [$pageid, 1]);
        return array($select, $params);
    }

    private static function cmppostid($a, $b) {
        $apostid = (int) $a->postid;
        $bpostid = (int) $b->postid;
        if ($apostid == $bpostid) {
            return 0;
        }
        return ($apostid < $bpostid) ? -1 : 1;
    }
}
