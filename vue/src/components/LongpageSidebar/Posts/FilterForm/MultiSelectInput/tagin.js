import {flattenDeep} from 'lodash';

export const tagin = (el, option = {}) => { // Use comma as seperator
    const classElement = 'tagin';
    const classWrapper = 'tagin-wrapper';
    const classTag = 'tagin-tag';
    const classRemove = 'tagin-tag-remove';
    const classInput = 'tagin-input';
    const classInputHidden = 'tagin-input-hidden';
    const defaultSeparator = ',';
    const defaultPlaceholder = '';
    const separator = el.dataset.separator || option.separator || defaultSeparator;
    const placeholder = el.dataset.placeholder || option.placeholder || defaultPlaceholder;

    const getOptions = () => el._selectOptions;
    const mapValueToText = value => getOptions().find(({value: v}) => v === Number(value)).text;

    const templateTag =
            v => `<span class="${classTag}" data-value="${v}">${mapValueToText(v)}<span class="${classRemove}"></span></span>`;

    const getValue = () => el.value;
    const getValues = () => getValue().split(separator);

    // Create
    (function() {
        const className = classWrapper + ' ' + el.className.replace(classElement, '').trim();
        const tags = getValue().trim() === '' ? '' : getValues().map(templateTag).join('');
        const template =
            `<div class="${className}">${tags}<input type="text" class="${classInput}" placeholder="${placeholder}"></div>`;
        el.insertAdjacentHTML('afterend', template); // Insert template after element
    })();

    const wrapper = el.nextElementSibling;
    listenToClickOnRemoveButtons();
    const input = wrapper.getElementsByClassName(classInput)[0];
    const getTags = () => [...wrapper.getElementsByClassName(classTag)].map(tag => tag.dataset.value);
    const getTag = () => getTags().join(separator);

    // Focus to input
    wrapper.addEventListener('click', () => input.focus());

    // Toggle focus class
    input.addEventListener('focus', () => wrapper.classList.add('focus'));
    input.addEventListener('blur', () => wrapper.classList.remove('focus'));

    input.addEventListener('input', e => {
        autowidth();
        el.dispatchEvent(new CustomEvent('queryinput', {detail: {value: e.target.value}}));
    });
    el.addEventListener('update-query', e => {
       input.value = e.detail.value;
       input.focus();
    });
    input.addEventListener('blur', () => {
        autowidth();
    });

    // AUTOWIDTH

    autowidth();

    function autowidth() {
        const fakeEl = document.createElement('div');
        fakeEl.classList.add(classInput, classInputHidden);
        const string = input.value || input.getAttribute('placeholder') || '';
        fakeEl.innerHTML = string.replace(/ /g, '&nbsp;');
        document.body.appendChild(fakeEl);
        input.style.setProperty('width', Math.ceil(window.getComputedStyle(fakeEl).width.replace('px', '')) + 1 + 'px');
        fakeEl.remove();
    }


    // SYNCHRONIZE WITH PARENT

    function updateTag() {
        if (getValue() !== getTag()) {
            [...wrapper.getElementsByClassName(classTag)].map(tag => tag.remove());
            if (getValue().trim() !== '') input.insertAdjacentHTML('beforebegin', getValues().map(templateTag).join(''));
        }
    }

    el.addEventListener('update-tags', () => {
     updateTag();
    });


    // REMOVAL OF TAGS

    const updateValue = () => {
        el.value = getTag();
        el.dispatchEvent(new Event('change'));
    };

    // Remove by click
    function listenToClickOnRemoveButtons() {
        [...document.getElementsByClassName(classRemove)].forEach(removeButton => {
            removeButton.addEventListener('click', e => {
                e.target.parentNode.remove();
                updateValue();
            });
        });
        const mutationObserver = new MutationObserver(mutations => {
            const addedNodes = flattenDeep(mutations.filter(m => m.addedNodes.length).map(m => [...m.addedNodes]));
            addedNodes.forEach(n => {
                const removeButton = [...n.children].find(c => c.classList.contains(classRemove));
                removeButton.addEventListener('click', e => {
                    e.target.parentNode.remove();
                    updateValue();
                });
            });
        });
        mutationObserver.observe(wrapper, {childList: true, subtree: true});
    }

    // Remove with backspace
    input.addEventListener('keydown', e => {
        if (input.selectionStart === 0 && e.keyCode === 8 && wrapper.getElementsByClassName(classTag).length) {
            wrapper.querySelector('.' + classTag + ':last-of-type').remove();
            updateValue();
        }
    });
};
