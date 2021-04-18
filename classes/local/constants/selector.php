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
 * Author class.
 *
 * @package    mod_page
 * @copyright  2020 Adrian Stritzinger <adrian.stritzinger@studium.fernuni-hagen.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_page\local\constants;

defined('MOODLE_INTERNAL') || die();

/**
 * Author class.
 *
 * @copyright  2020 Adrian Stritzinger <adrian.stritzinger@web.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
abstract class selector {
    const TYPE_TEXT_QUOTE_SELECTOR = 0;
    const TYPE_TEXT_POSITION_SELECTOR = 1;
    const TYPE_RANGE_SELECTOR = 2;

    const TABLE_NAME_TEXT_QUOTE_SELECTOR = 'page_text_quote_selectors';
    const TABLE_NAME_TEXT_POSITION_SELECTOR = 'page_text_position_selectors';
    const TABLE_NAME_RANGE_SELECTOR = 'page_range_selectors';

    private static $TYPE_TO_TABLE_NAME_MAPPING = array(
        self::TYPE_TEXT_QUOTE_SELECTOR => self::TABLE_NAME_TEXT_QUOTE_SELECTOR,
        self::TYPE_TEXT_POSITION_SELECTOR => self::TABLE_NAME_TEXT_POSITION_SELECTOR,
        self::TYPE_RANGE_SELECTOR => self::TABLE_NAME_RANGE_SELECTOR,
    );

    private static $TABLE_NAME_TO_TYPE_MAPPING;

    static function map_table_name_to_type($table_name) {
        if (!isset(self::$TABLE_NAME_TO_TYPE_MAPPING)) {
            self::$TABLE_NAME_TO_TYPE_MAPPING = array_flip(self::$TYPE_TO_TABLE_NAME_MAPPING);
        }
        return self::$TABLE_NAME_TO_TYPE_MAPPING[$table_name];
    }

    static function map_type_to_table_name($type) {
        return self::$TYPE_TO_TABLE_NAME_MAPPING[$type];
    }
}
