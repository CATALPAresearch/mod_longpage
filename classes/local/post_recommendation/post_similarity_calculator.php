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
 * Post Similarity Calculator
 *
 * @package    mod_page
 * @copyright  2020 Adrian Stritzinger <adrian.stritzinger@web.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_page\local\post_recommendation;

defined('MOODLE_INTERNAL') || die();

/**
 * Post Similarity Calculator
 *
 * @copyright  2020 Adrian Stritzinger <adrian.stritzinger@web.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class post_similarity_calculator {
    const MIN_OVERLAP = 3;
    const MIN_SIM = 0.3;

    // TODO Clean out tables before recalculation, do I really need time created, add missing tables and management class
    // Don't save similarities twice

    public static function calculate_and_save_post_similarities($pageid) {
        global $DB;

        $sql = 'SELECT pa.postid AS postaid, pb.postid AS postbid
                FROM {page_relative_preferences} pa JOIN {page_relative_preferences} pb
                ON pa.userid = pb.userid AND pa.postid != pb.postid
                WHERE pa.pageid = :pageid AND pb.pageid = :pageid
                GROUP BY pa.postid, pb.postid
                HAVING COUNT(*) >= :minoverlap';
        $overlappingpostpairs = array_values($DB->get_records_sql($sql, ['pageid' => $pageid, 'minoverlap' => self::MIN_OVERLAP]));

        self::calculate_and_save_post_similarities_for_overlapping_posts($overlappingpostpairs);
    }

    private static function calculate_and_save_post_similarities_for_overlapping_posts($postpairs) {
        global $DB;

        foreach ($postpairs as $postpair) {
            $sql = 'SELECT pa.value AS valuea, pb.value AS valueb
                FROM {page_relative_preferences} pa JOIN {page_relative_preferences} pb
                ON pa.userid = pb.userid
                WHERE pa.postid = :postaid AND pb.postid = :postbid';
            $preferencepairs = array_values(
                $DB->get_records_sql($sql, ['postaid' => $postpair->postaid, 'postbid' => $postpair->postbid])
            );

            $preferencesa = array_map(function ($preferencepair) { return $preferencepair->valuea; }, $preferencepairs);
            $preferencesb = array_map(function ($preferencepair) { return $preferencepair->valueb; }, $preferencepairs);
            $similarity = similarity_calculator::cosine($preferencesa, $preferencesb);

            if ($similarity < self::MIN_SIM) {
                break;
            }

            $postsim = new \stdClass();
            $postsim->postaid = $postpair->postaid;
            $postsim->postbid = $postpair->postbid;
            $postsim->value = $similarity;

            $DB->insert_record('page_post_similarities', $postsim, false, true);
        }
    }
}
