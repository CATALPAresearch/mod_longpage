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
 * @package mod_longpage
 * @copyright  2009 Petr Skoda (http://skodak.org)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require('../../config.php');
require_once($CFG->dirroot.'/mod/longpage/lib.php');
require_once($CFG->dirroot.'/mod/longpage/locallib.php');
require_once($CFG->libdir.'/completionlib.php');
require_once("$CFG->libdir/formslib.php");
//header("Access-Control-Allow-Origin: *");

$id      = optional_param('id', 0, PARAM_INT); // Course Module ID
$p       = optional_param('p', 0, PARAM_INT);  // Page instance ID
$inpopup = optional_param('inpopup', 0, PARAM_BOOL);

if ($p) {
    if (!$page = $DB->get_record('longpage', array('id'=>$p))) {
        print_error('invalidaccessparameter');
    }
    $cm = get_coursemodule_from_instance('longpage', $page->id, $page->course, false, MUST_EXIST);

} else {
    if (!$cm = get_coursemodule_from_id('longpage', $id)) {
        print_error('invalidcoursemodule');
    }
    $page = $DB->get_record('longpage', array('id'=>$cm->instance), '*', MUST_EXIST);
}

$course = $DB->get_record('course', array('id'=>$cm->course), '*', MUST_EXIST);

require_course_login($course, true, $cm);
$context = context_module::instance($cm->id);
require_capability('mod/longpage:view', $context);

$scrolltop = $DB->get_field_sql("SELECT scrolltop FROM {longpage_reading_progress} WHERE userid = :userid AND longpageid = :longpageid ORDER BY timemodified DESC LIMIT 1",
    ['userid' => $USER->id, 'longpageid' => $page->id]
);

// Completion and trigger events.
longpage_view($page, $course, $cm, $context);

$PAGE->set_url('/mod/longpage/view.php', array('id' => $cm->id));
$PAGE->requires->css('/mod/longpage/styles.css', true);

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
    $content = file_rewrite_pluginfile_urls($page->content, 'pluginfile.php', $context->id, 'mod_longpage', 'content', $page->revision);
    $formatoptions = new stdClass;
    $formatoptions->noclean = true;
    $formatoptions->context = $context;
    return format_text($content, $page->contentformat, $formatoptions);
}

if (mod_longpage\blocking::tool_policy_accepted() == true) {
    $content = get_formatted_page_content($page, $context);

    if (!isset($options['printheading']) || !empty($options['printheading'])) {
        echo '<h2 style="display:inline;">'.format_string($page->name).'</h2>';
    }
    if (!isset($options['printintro']) || !empty($options['printintro'])) {
        echo $OUTPUT->box(format_module_intro('longpage', $page, $cm->id), 'generalbox', 'intro');
    }
    echo '<div class="dropdown" style="display: inline;">
            <button class="btn btm-sm dropdown-toggle" type="button" id="dropdownPages" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="padding: 0; background: none;"></button>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownPages" style="width: 300px;">';
    $pages = get_all_instances_in_courses("longpage", array($course->id => $course));
    foreach ($pages as $p) {
        $pcm = get_coursemodule_from_instance('longpage', $p->id, $course->id);
        $cxt = context_module::instance($cm->id);
        if (!has_capability('mod/longpage:view', $cxt)) {
            continue;
        }
        if ($pcm->id != $cm->id)
        {
            echo '<a class="dropdown-item" href="/mod/longpage/view.php?id='.$pcm->id.'" target="_blank">'.$p->name.'</a>';
        }
    }    
            
    echo    '</div>
        </div>';
    //hidden form needed for embedding questions
    $embedform = new MoodleQuickForm("embedform", 'POST', "", "", array("style" => "width: 0; height: 0; overflow: hidden"));
    $embedform->addElement('editor', 'embedform', "embedform", null, longpage_get_editor_options($context));
    $embedform->display();
    echo '<div id="longpage-app-container" class="border-top border-bottom">';
    echo '<div class="row no-gutters vh-50">';
    echo '<div class="spinner-border m-auto " role="status"><span class="sr-only">'.get_string('loading').'</span></div>';
    echo '</div></div>';
    echo '<div id="longpage-tmp" style="display:none;" lang="de">';
    echo $page->content;
    echo '</div>';

    $PAGE->requires->js_call_amd(
        'mod_longpage/app-lazy',
        'init',
        [
            $course->id,
            $page->id,
            format_string($page->name),
            $USER->id,
            $content,
            $scrolltop,
            !empty($page->showreadingprogress),
            !empty($page->showreadingcomprehension), //$USER->id % 2 == 1 || has_capability('mod/longpage:addinstance', $context), //hardcoded for WS2023
            !empty($page->showsearch),
            !empty($page->showtableofcontents),
            !empty($page->showposts),
            !empty($page->showhighlights),
            !empty($page->showbookmarks),
        ]
    );
} else {
    echo "Umleitung";
    $url = new moodle_url('/mod/longpage/blocking-redirect.php');
    redirect($url);
}

// echo '<p class="mt-3 text-center text-xs" lang="de">'.get_string('lastmodified').': '.userdate($page->timemodified).'</p>';

echo $OUTPUT->footer();

