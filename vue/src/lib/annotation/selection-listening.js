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
