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
$PAGE->requires->css( '/mod/page/css/page.css', true );

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


if (!isset($options['printheading']) || !empty($options['printheading'])) {
    //echo $OUTPUT->heading(format_string($page->name), 2);
    echo '
<nav class="page-navbar navbar navbar-light bg-light justify-content-between fixed-top-nav">
    <a class="navbar-brand">'. format_string($page->name) .'</a>
    <a class="btn btn-link longpage-nav-btn" data-toggle="collapse" role="button" href="#table-of-content">Inhalt</a>
    <form id="longpage-search-form" class="form-inline">
        <input id="search-string" class="form-control mr-sm-2" type="search" placeholder="Suche" aria-label="Search">
        <button id="search-full-text" class="btn btn-outline-success my-2 my-sm-0" type="button">Suchen</button>
    </form>
    <div class="collapse" id="search-results-panel">
        <div class="card card-body col-xs-12 col-md-12 col-xl-4 col-lg-6">
            <ul id="search-results" class=""></ul>
        </div>
    </div>
    <div class="collapse" id="table-of-content">
        <div class="card card-body col-md-2 longpage-nav">
            <ul id="tocList" class="nav nav-pills"></ul>
        </div>
    </div>
</nav>
';
}

/*
if (!empty($options['printintro'])) {
    if (trim(strip_tags($page->intro))) {
        echo $OUTPUT->box_start('mod_introbox', 'pageintro');
        echo format_module_intro('page', $page, $cm->id);
        echo $OUTPUT->box_end();
    }
}
*/

echo '<ul id="nav-app"></ul><div class="row">';
$content = file_rewrite_pluginfile_urls($page->content, 'pluginfile.php', $context->id, 'mod_page', 'content', $page->revision);
$formatoptions = new stdClass;
$formatoptions->noclean = true;
//$formatoptions->overflowdiv = true;
$formatoptions->context = $context;
$content = format_text($content, $page->contentformat, $formatoptions);
// output content
echo '<div class="col-12" lang="de">';
echo $OUTPUT->box($content, "generalbox center clearfix");
echo '</div>';
echo '</div>'; // end row

echo '<div id="top-of-site-pixel-anchor"></div>';

/*
$transaction = $DB->start_delegated_transaction(); 
$query ='SELECT * FROM ' . $CFG->prefix . 'page WHERE id=' . $cm->instance .';';
$data = $DB->get_records_sql($query);//($table, array('userid'=>'2', 'component'=>'mod_glossary'));//, '','*',0,100);
$transaction->allow_commit();
*/



//$PAGE->requires->js_amd_inline("require(['mod_page/page']);");
$PAGE->requires->js_call_amd('mod_page/page', 'init', array(json_encode($el)));
//$PAGE->requires->js('https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js',true);

$strlastmodified = get_string("lastmodified");
echo "<div class=\"last-modified modified\">$strlastmodified: ".userdate($page->timemodified)."</div>";

echo $OUTPUT->footer();
