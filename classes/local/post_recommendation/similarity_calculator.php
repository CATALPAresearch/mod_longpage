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
 * Similarity Calculator
 *
 * @package    mod_page
 * @copyright  2020 Adrian Stritzinger <adrian.stritzinger@web.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_page\local\post_recommendation;

defined('MOODLE_INTERNAL') || die();

/**
 * Similarity Calculator
 *
 * @copyright  2020 Adrian Stritzinger <adrian.stritzinger@web.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class similarity_calculator {
    static public function cosine($a, $b) {
        return self::dot_product($a, $b) / (self::magnitude($a) * self::magnitude($b));
    }

    static private function dot_product($a, $b) {
        $products = array_map(function($a, $b) { return $a * $b; }, $a, $b);
        return array_sum($products);
    }

    static private function magnitude($point) {
        $squares = array_map(function($x) { return pow($x, 2); }, $point);
        return sqrt(array_sum($squares));
    }
}
