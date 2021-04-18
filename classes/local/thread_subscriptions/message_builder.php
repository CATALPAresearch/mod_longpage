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
 * Message Builder
 *
 * @package    mod_page
 * @copyright  2021 Adrian Stritzinger <adrian.stritzinger@studium.fernuni-hagen.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_page\local\thread_subscriptions;

require_once($CFG->dirroot.'/mod/page/locallib.php');

defined('MOODLE_INTERNAL') || die();

/**
 * Message Builder
 *
 * @copyright  2021 Adrian Stritzinger <adrian.stritzinger@studium.fernuni-hagen.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class message_builder {
    public static function build_message($data) {
        switch($data->action) {
            case post_action::CREATE: return self::build_post_in_thread_created_message($data);
            case post_action::DELETE: return self::build_post_in_thread_deleted_message($data);
            case post_action::UPDATE: return self::build_post_in_thread_updated_message($data);
            default: return null;
        }
    }

    private static function build_post_in_thread_created_message($data) {
        $message = self::get_message_base($data->subscriberid);
        $message->subject = get_string('messagesubjectpostcreated', 'page');
        $substitutions = self::get_string_substitutions($data);
        $message->fullmessage = get_string('messagefullpostcreated', 'page', $substitutions);
        $message->fullmessagehtml = get_string('messagehtmlpostcreated', 'page', $substitutions);
        $message->smallmessage = get_string('messagesmallpostcreated', 'page', $substitutions);
        $message->contexturl = (new \moodle_url('/mod/page/view.php', ['id' => $data->cmid], "post-{$data->postid}"))->out(false);
        $message->contexturlname = get_string('messagecontexturlnamepostcreated', 'page');
        return $message;
    }

    private static function build_post_in_thread_deleted_message($data) {
        $message = self::get_message_base($data->subscriberid);
        $message->subject = get_string('messagesubjectpostdeleted', 'page');
        $substitutions = self::get_string_substitutions($data);
        $message->fullmessage = get_string('messagefullpostdeleted', 'page', $substitutions);
        $message->fullmessagehtml = get_string('messagehtmlpostdeleted', 'page', $substitutions);
        $message->smallmessage = get_string('messagesmallpostdeleted', 'page', $substitutions);
        $message->contexturl = (new \moodle_url('/mod/page/view.php', ['id' => $data->cmid], "thread-{$data->threadid}"))->out(false);
        $message->contexturlname = get_string('messagecontexturlnamepostdeleted', 'page');
        return $message;
    }

    private static function build_post_in_thread_updated_message($data) {
        $message = self::get_message_base($data->subscriberid);
        $message->subject = get_string('messagesubjectpostupdated', 'page');
        $substitutions = self::get_string_substitutions($data);
        $message->fullmessage = get_string('messagefullpostupdated', 'page', $substitutions);
        $message->fullmessagehtml = get_string('messagehtmlpostupdated', 'page', $substitutions);
        $message->smallmessage = get_string('messagesmallpostupdated', 'page', $substitutions);
        $message->contexturl = (new \moodle_url('/mod/page/view.php', ['id' => $data->cmid], "post-{$data->postid}"))->out(false);
        $message->contexturlname = get_string('messagecontexturlnamepostupdated', 'page');
        return $message;
    }

    private static function get_message_base($userid) {
        $message = new \core\message\message();
        $message->component = 'mod_page';
        $message->name = 'posts';
        $message->userfrom = \core_user::get_noreply_user();
        $message->userto = \core_user::get_user($userid);
        $message->fullmessageformat = \FORMAT_MOODLE;
        $message->notification = 1;
        return $message;
    }

    private static function get_string_substitutions($data) {
        $actor = \core_user::get_user($data->actorid);
        $substitutions = [
            'firstname' => $actor->firstname,
            'lastname' => $actor->lastname,
            'content' => $data->content,
            'oldcontent' => $data->oldcontent,
        ];
        return $substitutions;
    }
}
