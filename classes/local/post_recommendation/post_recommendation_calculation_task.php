<?php

namespace mod_page\local\post_recommendation;

class post_recommendation_calculation_task extends \core\task\adhoc_task {
    public function execute() {
        $data = $this->get_custom_data();
        $pageid = $data['pageid'];
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

        mtrace('Started calculating similarities of posts on page '.$pageid.'.');
        post_similarity_calculator::calculate_and_save_post_similarities($pageid);
        mtrace('Calculation of similarities of posts on page '.$pageid.' successfully finished.');

        mtrace('Started calculating recommendations of posts on page '.$pageid.'.');
        post_recommendation_calculator::calculate_and_save_recommendations($pageid);
        mtrace('Calculation of recommendations of posts on page '.$pageid.' successfully finished.');

        mtrace('Calculation of recommendations for posts on page '.$pageid.' successfully finished.');
    }

    public static function create_from_pageid_and_queue($pageid) {
        $postrecommcalctask = new post_recommendation_calculation_task();
        $postrecommcalctask->set_custom_data(['pageid' => $pageid]);
        $postrecommcalctask->set_next_run_time(self::get_next_run_time());
        \core\task\manager::queue_adhoc_task($postrecommcalctask, true);
    }

    private static function get_next_run_time() {
        $time = new DateTime("now", core_date::get_server_timezone_object());
        $time->add(new DateInterval("P1D"));
        $time->setTime(3, 0, 0);
        return $time->getTimestamp();
    }
}
