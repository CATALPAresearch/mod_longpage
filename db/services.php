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
 * Page external functions and service definitions.
 *
 * @package    mod_page
 * @category   external
 * @copyright  2015 Juan Leyva <juan@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      Moodle 3.0
 */

defined('MOODLE_INTERNAL') || die;

$functions = array(
    'mod_page_log' => array(
        'classname'     => 'mod_page_external',
        'methodname'    => 'log',
        'description'   => 'Writes logdata to database',
        'type'          => 'write',
        'capabilities'  => 'mod/page:view',
        //'services'      => array(MOODLE_OFFICIAL_MOBILE_SERVICE),
        'ajax'        => true
    ),
     'mod_page_getreadingprogress' => array(
        'classname'     => 'mod_page_external',
        'methodname'    => 'getreadingprogress',
        'description'   => 'Get readingprogress for a page and user',
        'type'          => 'read',
        'capabilities'  => 'mod/page:view',
        'ajax'        => true
    ),
    'mod_page_reading' => array(
        'classname'     => 'mod_page_external',
        'methodname'    => 'reading',
        'description'   => 'Writes reading and scroll data to database',
        'type'          => 'write',
        'capabilities'  => 'mod/page:view',
        'ajax'        => true
    ),
    'mod_page_view_page' => array(
        'classname'     => 'mod_page_external',
        'methodname'    => 'view_page',
        'description'   => 'Simulate the view.php web interface page: trigger events, completion, etc...',
        'type'          => 'write',
        'capabilities'  => 'mod/page:view',
        'services'      => array(MOODLE_OFFICIAL_MOBILE_SERVICE)
    ),
    'mod_page_create_annotation' => array(
        'classname'     => 'mod_page_external',
        'methodname'    => 'create_page_annotation',
        'description'   => 'Create an annotation',
        'type'          => 'write',
        'capabilities'  => 'mod/page:view',
        'ajax'          => true
    ),
    'mod_page_delete_annotation' => array(
        'classname'     => 'mod_page_external',
        'methodname'    => 'delete_page_annotation',
        'description'   => 'Delete an annotation',
        'type'          => 'write',
        'capabilities'  => 'mod/page:view',
        'ajax'          => true
    ),
    'mod_page_update_annotation_body' => array(
        'classname'     => 'mod_page_external',
        'methodname'    => 'update_page_annotation_body',
        'description'   => 'Update an annotation',
        'type'          => 'write',
        'capabilities'  => 'mod/page:view',
        'ajax'          => true
    ),
    'mod_page_get_annotations_by_page_and_user' => array(
        'classname'     => 'mod_page_external',
        'methodname'    => 'get_annotations_by_page_and_user',
        'description'   => 'Get annotations by page and user',
        'type'          => 'read',
        'capabilities'  => 'mod/page:view',
        'ajax'          => true
    ),
    'mod_page_get_pages_by_courses' => array(
        'classname'     => 'mod_page_external',
        'methodname'    => 'get_pages_by_courses',
        'description'   => 'Returns a list of pages in a provided list of courses, if no list is provided all pages that the user
                            can view will be returned.',
        'type'          => 'read',
        'capabilities'  => 'mod/page:view',
        'services'      => array(MOODLE_OFFICIAL_MOBILE_SERVICE),
    ),
);
