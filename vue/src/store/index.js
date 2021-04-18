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
import AnnotationModule from './modules/annotation-module';
import PostModule from './modules/post-module';
import UIModule from './modules/ui-module';
import UserModule from './modules/user-module';
import {createStore} from 'vuex';
import {GET} from './types';

export const initStore = (longpageContext) => createStore({
    modules: {
        AnnotationModule,
        PostModule,
        UIModule,
        UserModule,
    },
    state: {
        longpageContext,
    },
    getters: {
        [GET.LONGPAGE_CONTEXT]: ({longpageContext}) => longpageContext,
    }
});
