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
    public const MIN_OVERLAP = 3;
    public const MIN_SIM = 0.3;

    public static function delete_similarities($pageid) {
        global $DB;

        $transaction = $DB->start_delegated_transaction();
        $DB->delete_records('page_post_similarities', ['pageid' => $pageid]);
        $transaction->allow_commit();
    }

    public static function calculate_and_save_post_similarities($pageid, $batchsize = 100) {
        global $DB;

        $sql = 'SELECT pa.postid AS postaid, pb.postid AS postbid
                FROM {page_relative_post_prefs} pa JOIN {page_relative_post_prefs} pb
                ON pa.userid = pb.userid AND pa.postid != pb.postid
                WHERE pa.pageid = ? AND pb.pageid = ?
                GROUP BY pa.postid, pb.postid
                HAVING COUNT(*) >= ?';
        $limitfrom = 0;
        while (true) {
            $overlappingpostpairs =
                $DB->get_records_sql($sql, [$pageid, $pageid, self::MIN_OVERLAP], $limitfrom, $batchsize);
            if (count($overlappingpostpairs)) {
                break;
            }

            self::calculate_and_save_post_similarities_for_overlapping_posts($overlappingpostpairs);
            if (count($overlappingpostpairs) < $batchsize) {
                break;
            }

            $limitfrom += $batchsize;
        }
    }

    private static function calculate_and_save_post_similarities_for_overlapping_posts($postpairs) {
        global $DB;

        $sql = 'SELECT pa.value AS valuea, pb.value AS valueb
                FROM {page_relative_post_prefs} pa JOIN {page_relative_post_prefs} pb
                ON pa.userid = pb.userid
                WHERE pa.postid = :postaid AND pb.postid = :postbid';
        $table = 'page_post_similarities';
        foreach ($postpairs as $postpair) {
            $conditions = ['postaid' => $postpair->postaid, 'postbid' => $postpair->postbid];
            if ($DB->record_exists($table, $conditions)) {
                continue;
            }

            $preferencepairs = $DB->get_records_sql($sql, $conditions);

            list($preferencesa, $preferencesb) = array_map(function ($preferencepair) {
                return [(float) $preferencepair->valuea, (float) $preferencepair->valueb];
            }, $preferencepairs);
            $similarity = similarity_calculator::cosine($preferencesa, $preferencesb);
            if ($similarity < self::MIN_SIM) {
                continue;
            }

            $postsim = self::get_post_similarity($postpair, $similarity);

            $transaction = $DB->start_delegated_transaction();
            $DB->insert_record('page_post_similarities', $postsim, false, true);
            $transaction->allow_commit();
        }
    }

    private static function get_post_similarity($postpair, $similarity) {
        $postsim = new \stdClass();
        $postsim->postaid = $postpair->postaid;
        $postsim->postbid = $postpair->postbid;
        $postsim->value = $similarity;
        return $postsim;
    }
}
