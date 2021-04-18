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
 * @package    mod_page
 * @copyright  2021 Adrian Stritzinger <Adrian.Stritzinger@studium.fernuni-hagen.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import {SelectorType} from '@/config/constants';

export const AnnotationCompareFunction = Object.freeze({
    BY_POSITION: (annotationA, annotationB) => {
        const {start: startA = 0} = annotationA.target.selectors.find(s => s.type === SelectorType.TEXT_POSITION_SELECTOR) || {};
        const {start: startB = 0} = annotationB.target.selectors.find(s => s.type === SelectorType.TEXT_POSITION_SELECTOR) || {};
        return startA - startB;
    }
});
