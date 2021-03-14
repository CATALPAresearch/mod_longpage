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
 * Private page module utility functions
 *
 * @package mod_page
 * @copyright  2009 Petr Skoda (http://skodak.org)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

require_once("$CFG->libdir/filelib.php");
require_once("$CFG->libdir/resourcelib.php");
require_once("$CFG->dirroot/mod/page/lib.php");

function get_coursemodule_by_pageid($pageid) {
    global $DB;

    $page = $DB->get_record('page', ['id' => $pageid], '*', MUST_EXIST);
    return get_coursemodule_from_instance('page', $page->id, $page->course, false, MUST_EXIST);
}

function pick_keys($arrOrObj, $keys, $inplace = false) {
    if (!$inplace) {
        $result = array_intersect_key((array) $arrOrObj, array_fill_keys($keys, 1));
        return gettype($arrOrObj) == 'array' ? $result : (object) $result;
    }

    foreach (array_keys((array) $arrOrObj) as $key) {
        if (in_array($key, $keys, false)) {
            continue;
        }
        if (gettype($arrOrObj) == 'array') {
            unset($arrOrObj[$key]);
        } else {
            unset($arrOrObj->{$key});
        }
    }
    return $arrOrObj;
}

function omit_keys($arrOrObj, $keys, $inplace = false) {
    if (!$inplace) {
        $result = array_diff_key((array) $arrOrObj, array_fill_keys($keys, 1));
        return gettype($arrOrObj) == 'array' ? $result : (object) $result;
    }

    foreach ($keys as $key) {
        if (gettype($arrOrObj) == 'array') {
            unset($arrOrObj[$key]);
        } else {
            unset($arrOrObj->{$key});
        }
    }
    return $arrOrObj;
}

function array_map_merge($arrays, $tomerge) {
    return array_map(static function($array) use ($tomerge) {
        return array_merge($array, $tomerge);
    }, $arrays);
}

function object_merge(...$objects) {
    $result = [];
    foreach ($objects as $object) {
        $result = array_merge($result, (array) $object);
    }
    return (object) $result;
}

/**
 * File browsing support class
 */
class page_content_file_info extends file_info_stored {
    public function get_parent() {
        if ($this->lf->get_filepath() === '/' and $this->lf->get_filename() === '.') {
            return $this->browser->get_file_info($this->context);
        }
        return parent::get_parent();
    }
    public function get_visible_name() {
        if ($this->lf->get_filepath() === '/' and $this->lf->get_filename() === '.') {
            return $this->topvisiblename;
        }
        return parent::get_visible_name();
    }
}

function page_get_editor_options($context) {
    global $CFG;
    return array('subdirs'=>1, 'maxbytes'=>$CFG->maxbytes, 'maxfiles'=>-1, 'changeformat'=>1, 'context'=>$context, 'noclean'=>1, 'trusttext'=>0);
}
