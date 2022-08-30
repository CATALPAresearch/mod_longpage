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
 * Page module upgrade code
 *
 * This file keeps track of upgrades to
 * the resource module
 *
 * Sometimes, changes between versions involve
 * alterations to database structures and other
 * major things that may break installations.
 *
 * The upgrade function in this file will attempt
 * to perform all the necessary actions to upgrade
 * your older installation to the current version.
 *
 * If there's something it cannot do itself, it
 * will tell you what you need to do.
 *
 * The commands in here will all be database-neutral,
 * using the methods of database_manager class
 *
 * Please do not forget to use upgrade_set_timeout()
 * before any action that may take longer time to finish.
 *
 * @package mod_page
 * @copyright  2009 Petr Skoda (http://skodak.org)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

function xmldb_longpage_upgrade($oldversion) {
    global $CFG;

    $dbman = $DB->get_manager();
    
    if ($oldversion < 2021082511) {
        
        // longpage_posts
        // add: <FIELD NAME="islocked" TYPE="int" LENGTH="1" NOTNULL="true" DEFAULT="0" SEQUENCE="false"/>
        $table = new xmldb_table('longpage_posts');
        // $name, $type=null, $precision=null, $unsigned=null, $notnull=null, $sequence=null, $default=null, $previous=null
        $field = new xmldb_field('islocked', XMLDB_TYPE_INTEGER, '1', XMLDB_UNSIGNED, null, null, 0, null);
        if (!$dbman->field_exists($table, $field)) {
            $dbman->add_field($table, $field);
        }

        // longpage_reading_progress
        // add field <FIELD NAME="section" TYPE="text" LENGTH="255" NOTNULL="true" SEQUENCE="false"/>
        // add field <FIELD NAME="sectionhash" TYPE="int" LENGTH="10" NOTNULL="true" SEQUENCE="false"/>
        $table = new xmldb_table('longpage_reading_progress');
        $field1 = new xmldb_field('section', XMLDB_TYPE_CHAR, '255', null, XMLDB_NOTNULL, null, null, null);
        $field2 = new xmldb_field('sectionhash', XMLDB_TYPE_INT, '10', null, XMLDB_NOTNULL, null, null, null);
        if (!$dbman->field_exists($table, $field1)) {
            $dbman->add_field($table, $field1);
        }
        if (!$dbman->field_exists($table, $field2)) {
            $dbman->add_field($table, $field2);
        }

    /*    
        $table = new xmldb_table('enrol_flatfile');
        // Adding fields to table enrol_flatfile
        $table->add_field('id', XMLDB_TYPE_INTEGER, '10', XMLDB_UNSIGNED, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
        $table->add_field('action', XMLDB_TYPE_CHAR, '30', null, XMLDB_NOTNULL, null, null);
        $table->add_field('roleid', XMLDB_TYPE_INTEGER, '10', XMLDB_UNSIGNED, XMLDB_NOTNULL, null, null);
        $table->add_field('userid', XMLDB_TYPE_INTEGER, '10', XMLDB_UNSIGNED, XMLDB_NOTNULL, null, null);
        $table->add_field('courseid', XMLDB_TYPE_INTEGER, '10', XMLDB_UNSIGNED, XMLDB_NOTNULL, null, null);
        $table->add_field('timestart', XMLDB_TYPE_INTEGER, '10', XMLDB_UNSIGNED, XMLDB_NOTNULL, null, '0');
        $table->add_field('timeend', XMLDB_TYPE_INTEGER, '10', XMLDB_UNSIGNED, XMLDB_NOTNULL, null, '0');
        $table->add_field('timemodified', XMLDB_TYPE_INTEGER, '10', XMLDB_UNSIGNED, XMLDB_NOTNULL, null, '0');
        // Adding keys to table enrol_flatfile
        $table->add_key('id', XMLDB_KEY_PRIMARY, array('id'));
        $table->add_key('courseid-id', XMLDB_KEY_FOREIGN, array('courseid'), 'course', array('id'));
        $table->add_key('userid-id', XMLDB_KEY_FOREIGN, array('userid'), 'user', array('id'));
        $table->add_key('roleid-id', XMLDB_KEY_FOREIGN, array('roleid'), 'role', array('id'));
        // Conditionally launch create table for enrol_flatfile
        if (!$dbman->table_exists($table)) {
            $dbman->create_table($table);
        }
        */
        upgrade_plugin_savepoint(true, 2021082511, 'mod', 'longpage');
        
    }
    

    return true;
}