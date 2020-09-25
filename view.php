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
$PAGE->requires->css( '/mod/page/styles.css', true );

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

if (access_control()) {
    
    if (!isset($options['printheading']) || !empty($options['printheading'])) {
        echo '<longpage-container></longpage-container>';
    }

    echo '<div class="rowx w-100">';
    $content = file_rewrite_pluginfile_urls($page->content, 'pluginfile.php', $context->id, 'mod_page', 'content', $page->revision);
    $formatoptions = new stdClass;
    $formatoptions->noclean = true;
    $formatoptions->context = $context;
    $content = format_text($content, $page->contentformat, $formatoptions);

    // output content
    echo '<div class="w-100 m-auto longpage-container" lang="de">';

    echo $OUTPUT->box($content, "generalbox center clearfix");
    echo '</div>';
    echo '</div>'; // end row

    echo '<div id="top-of-site-pixel-anchor"></div>';
    $PAGE->requires->js_call_amd('mod_page/page', 'init', array($cm->id, format_string($page->name)));

} else {
    echo '<div class="alert alert-danger w-75" role="alert">';
    echo '<h4>Kein Zugang</h4><br/>Wir können Ihnen zu dieser Ressource leider keinen Zugang gewähren, da Sie den Untersuchungen im Rahmen des Forschungsprojekt APLE nicht zugestimmt haben.';
    $limit = new DateTime("2020-10-31 23:59:59");
    $now = new DateTime();
    if ($now < $limit) {
        echo '<br/><br/><button class="btn btn-primary">Nachträglich der Teilnahme am Forschungsprojekt zustimmen</button><button class="btn btn-link" style="float:right;">Zurück zum Kurs</button>';
    }
    echo '</div>';
}




function access_control()
{
    global $DB, $USER;
    $version = 3;
    $transaction = $DB->start_delegated_transaction();
    $res = $DB->get_record("tool_policy_acceptances", array("policyversionid" => $version, "userid" => (int)$USER->id ), "timemodified");
    $transaction->allow_commit();
    if (isset($res->timemodified) && $res->timemodified > 1000) {
        return true;
    }
    return false;
}

$strlastmodified = get_string("lastmodified");
echo "<div class=\"col-12\" lang=\"de\"><div class=\"last-modified modified\">$strlastmodified: ".userdate($page->timemodified)."</div></div>";

echo $OUTPUT->footer();