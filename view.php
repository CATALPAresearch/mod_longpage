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
 * Page module version information
 *
 * @package mod_page
 * @copyright  2009 Petr Skoda (http://skodak.org)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require('../../config.php');
require_once($CFG->dirroot.'/mod/page/lib.php');
require_once($CFG->dirroot.'/mod/page/locallib.php');
require_once($CFG->libdir.'/completionlib.php');
//header("Access-Control-Allow-Origin: *");

$id      = optional_param('id', 0, PARAM_INT); // Course Module ID
$p       = optional_param('p', 0, PARAM_INT);  // Page instance ID
$inpopup = optional_param('inpopup', 0, PARAM_BOOL);

if ($p) {
    if (!$page = $DB->get_record('page', array('id'=>$p))) {
        print_error('invalidaccessparameter');
    }
    $cm = get_coursemodule_from_instance('page', $page->id, $page->course, false, MUST_EXIST);

} else {
    if (!$cm = get_coursemodule_from_id('page', $id)) {
        print_error('invalidcoursemodule');
    }
    $page = $DB->get_record('page', array('id'=>$cm->instance), '*', MUST_EXIST);
}

$course = $DB->get_record('course', array('id'=>$cm->course), '*', MUST_EXIST);

require_course_login($course, true, $cm);
$context = context_module::instance($cm->id);
require_capability('mod/page:view', $context);

// Completion and trigger events.
page_view($page, $course, $cm, $context);

$PAGE->set_url('/mod/page/view.php', array('id' => $cm->id));
$PAGE->requires->css('/mod/page/styles.css', true);

$options = empty($page->displayoptions) ? array() : unserialize($page->displayoptions);

if ($inpopup and $page->display == RESOURCELIB_DISPLAY_POPUP) {
    $PAGE->set_pagelayout('popup');
    $PAGE->set_title($course->shortname.': '.$page->name);
    $PAGE->set_heading($course->fullname);
} else {
    $PAGE->set_title($course->shortname.': '.$page->name);
    $PAGE->set_heading($course->fullname);
    //$PAGE->set_activity_record($page);
}

echo $OUTPUT->header();

/**
 * @param $page
 * @param $context
 * @return content
 */
function get_formatted_page_content($page, $context) {
    $content = file_rewrite_pluginfile_urls($page->content, 'pluginfile.php', $context->id, 'mod_page', 'content', $page->revision);
    $formatoptions = new stdClass;
    $formatoptions->noclean = true;
    $formatoptions->context = $context;
    return format_text($content, $page->contentformat, $formatoptions);
}

if (mod_page\blocking::tool_policy_accepted() == true) {
    $content = get_formatted_page_content($page, $context);

    if (!isset($options['printheading']) || !empty($options['printheading'])) {
        echo $OUTPUT->heading(format_string($page->name));
    }
    if (!isset($options['printintro']) || !empty($options['printintro'])) {
        echo $OUTPUT->box(format_module_intro('page', $page, $cm->id), 'generalbox', 'intro');
    }
    echo '<div id="longpage-app-container" class="border-top border-bottom">';
    echo '<div class="row no-gutters vh-50">';
    echo '<div class="spinner-border m-auto " role="status"><span class="sr-only">'.get_string('loading').'</span></div>';
    echo '</div></div>';

    $PAGE->requires->js_call_amd(
        'mod_page/app-lazy',
        'init',
        [$course->id, $page->id, format_string($page->name), $USER->id, $content]
    );
} else {
    echo "Umleitung";
    $url = new moodle_url('/mod/page/blocking-redirect.php');
    redirect($url);
}

echo '<p class="mt-3 text-center text-xs" lang="de">'.get_string('lastmodified').': '.userdate($page->timemodified).'</p>';

echo $OUTPUT->footer();

