
/**
 * TODO:
 * - cleanup server: /home/abb/Documents/proj_002_aple/Kurstextanalyse/kurstext-webservice/
 */

define([
    'jquery',
    'core/ajax',
    M.cfg.wwwroot + '/mod/page/lib/build/vue.min'
], function ($, ajax, Vue) {

        Vue.component('CourseRecommondation',
        {
            props: ['hideTabContent', 'log'],

            data: function () {
                return {
                    serverPath: 'http://127.0.0.1:8080/course-recommender',
                    courses:[],
                    blacklist: [
                        1144, 2333, 2337, 2351, 2355, 2353, 2366, 1662, 1664, 
                        1666, 1671, 1661, 1672, 1675, 1665, 1810, 1602, 1603, 1358]

}
            },

    mounted: function () {
        let _this = this;
        this.getRelatedUnits();

        // Mock
        let data = {
            ke1: [],
            ke2: [],
            ke3: [],
            ke4: []
        }
        
        // go through text passages
        $('longpage-container').each(function (e) {
            var text = $(this).text();
            //text = $(this).nextUntil('h3').text();
            /*$('p').each(function(){
                text += ' '+$(this).text();
            });*/
            //console.log(text);
            _this.getRelatedUnits('Rechnernetze', $(this));
        });
    },

    methods: {
    getRelatedUnits: function (text, selector) {
        let _this = this;

        $.ajax({
            method: "POST",
            url: this.serverPath,
            data: { text: text },
            dataType: 'jsonp',
            crossDomain: true,
            success: function (data) {
                _this.courses = _this.clean(data);
            },
            error: function (e) {
                console.error(e);
            }
        });
    },

    clean: function(data){
        let _this = this;
        let courses = [];
        let course = '';
        for (var i = 0; i < data.length; i++) {
            course = data[i][0].replace('_t.pickle', '').split('/');
            if (_this.blacklist.indexOf(parseInt(course[2].substr(0, 4), 10)) === -1) {
                let c = { course: course[2], unit: course[3], confidence: data[i][1].toFixed(2) }
                courses.push(c);
            } else {
                //console.log('blacklisted ' + course[2], course[2].substr(0, 4));
            }
        }
        return courses;
    }
},

    template: `
        <div>
            <button type="button" class="close ml-auto align-self-center d-block" aria-label="Close" v-on:click="$emit('hideTabContent')">
                <span aria-hidden="true">&times;</span>
            </button>
            <ul>
                <li v-for="course in courses">{{ course.course}}: {{course.unit}} ({{course.confidence}})</li>
            </ul>
        </div>`

        });
});

