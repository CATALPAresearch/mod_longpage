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
 * Post Preference Calculation Task
 *
 * @package    mod_page
 * @copyright  2020 Adrian Stritzinger <adrian.stritzinger@web.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_page\local\post_recommendation;

defined('MOODLE_INTERNAL') || die();


/**
 * Post Preference Calculation Task
 *
 * @copyright  2020 Adrian Stritzinger <adrian.stritzinger@web.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class post_recommendation_calculation_task extends \core\task\adhoc_task {
    public function execute() {
        $data = $this->get_custom_data();
        $pageid = $data->pageid;
        mtrace('Started calculating recommendations for posts on page '.$pageid.'.');

        mtrace('Started calculating absolute preferences for posts on page '.$pageid.'.');
        post_preference_calculator::calculate_and_save_absolute_preferences($pageid);
        mtrace('Calculation of absolute preferences for posts on page '.$pageid.' successfully finished.');

        mtrace('Started calculating preference profiles of users on page '.$pageid.'.');
        post_preference_calculator::calculate_and_save_preference_profiles($pageid);
        mtrace('Calculation of preference profiles of users on page '.$pageid.' successfully finished.');

        mtrace('Started calculating relative preferences for posts on page '.$pageid.'.');
        post_preference_calculator::calculate_and_save_relative_preferences($pageid);
        mtrace('Calculation of relative preferences for posts on page '.$pageid.' successfully finished.');

        mtrace('Started deleting absolute preferences for posts on page '.$pageid.'.');
        post_preference_calculator::delete_absolute_preferences($pageid);
        mtrace('Deletion of absolute preferences for posts on page '.$pageid.' successfully finished.');

        mtrace('Started calculating similarities of posts on page '.$pageid.'.');
        post_similarity_calculator::calculate_and_save_post_similarities($pageid);
        mtrace('Calculation of similarities of posts on page '.$pageid.' successfully finished.');

        mtrace('Started deleting recommendations of posts on page '.$pageid.'.');
        post_recommendation_calculator::delete_recommendations($pageid);
        mtrace('Deletion of recommendations of posts on page '.$pageid.' successfully finished.');

        mtrace('Started calculating recommendations of posts on page '.$pageid.'.');
        post_recommendation_calculator::calculate_and_save_recommendations($pageid);
        mtrace('Calculation of recommendations of posts on page '.$pageid.' successfully finished.');

        mtrace('Started deleting similarities of posts on page '.$pageid.'.');
        post_similarity_calculator::delete_similarities($pageid);
        mtrace('Deletion of similarities of posts on page '.$pageid.' successfully finished.');

        mtrace('Started deleting relative preferences for posts on page '.$pageid.'.');
        post_preference_calculator::delete_relative_preferences($pageid);
        mtrace('Deletion of relative preferences for posts on page '.$pageid.' successfully finished.');

        mtrace('Started deleting preference profiles of users on page '.$pageid.'.');
        post_preference_calculator::delete_preference_profiles($pageid);
        mtrace('Deletion of preferences profiles of users on page '.$pageid.' successfully finished.');

        mtrace('Calculation of recommendations for posts on page '.$pageid.' successfully finished.');
    }

    public static function create_from_pageid_and_queue($pageid) {
        $postrecommcalctask = new post_recommendation_calculation_task();
        $postrecommcalctask->set_custom_data(['pageid' => $pageid]);
        $postrecommcalctask->set_next_run_time(self::get_next_task_run_time());
        \core\task\manager::queue_adhoc_task($postrecommcalctask, true);
    }

    private static function get_next_task_run_time() {
        $time = new \DateTime("now", \core_date::get_server_timezone_object());
        $time->add(new \DateInterval("P1D"));
        $time->setTime(3, 0, 0);
        return $time->getTimestamp();
    }
}
