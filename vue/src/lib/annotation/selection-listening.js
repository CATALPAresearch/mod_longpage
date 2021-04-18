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
import * as rangeUtil from './hypothesis/range-util';
import selections from './hypothesis/selections';

export class SelectionListener {
    subscribe(onSelection, onClearSelection) {
        this.selections = selections(document).subscribe({
            next: range => {
                if (range) {
                    const {focusRect, isBackwards} = this._getSelectionProps(range);
                    onSelection(range, focusRect, isBackwards);
                } else {
                    onClearSelection();
                }
            }
        });
    }

    unsubscribe() {
        this.selections.unsubscribe();
    }

    /**
     *
     * @returns {{focusRect: (DOMRect|null), isBackwards: boolean}}
     * @private
     */
    _getSelectionProps() {
        const selection = /** @type {Selection} */ (document.getSelection());
        const isBackwards = rangeUtil.isSelectionBackwards(selection);
        const focusRect = rangeUtil.selectionFocusRect(selection);
        return {focusRect, isBackwards};
    }
}
