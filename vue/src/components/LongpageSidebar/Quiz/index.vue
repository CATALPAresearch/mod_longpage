<template>
  <sidebar-tab :title="$t('sidebar.tabs.quiz.heading')">
    <template #append-header> </template>
    <template #body> 
      <div id="question"></div>     
      <div class="submitbtns" style="float: right; display: none;">
        <input type="submit" value="Submit" class="mod_quiz-next-nav btn btn-primary">
        </div>
    </template>
  </sidebar-tab>
</template>

<script>
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
import { AnnotationType } from "@/config/constants";
import { GET } from "@/store/types";
import { mapGetters } from "vuex";
import SidebarTab from "@/components/LongpageSidebar/SidebarTab";

$(document).ready(function() {
  window.questions = null;
  window.quizzes = null;
  
  $.post(window.location.origin + "/webservice/rest/server.php", 
  {
    wstoken: "279655fc72c378cbf120a1b6e68a0cf8", 
    wsfunction: "mod_quiz_get_quizzes_by_courses",
    moodlewsrestformat: "json",
    courseids: [2]
  }, function (data) {
    window.quizzes = {};
    data["quizzes"].forEach((el, index) => window.quizzes[el.intro] = el);
  });

  $.post(window.location.origin + "/webservice/rest/server.php", 
  {
    wstoken: "279655fc72c378cbf120a1b6e68a0cf8", 
    wsfunction: "mod_quiz_get_attempt_data",
    moodlewsrestformat: "json",
    attemptid: 5,
    page: 0
  }, function (data) {
    window.questions = {};
    var quizid = data["attempt"]["quiz"];
    if (!(quizid in  window.questions))
    {
      window.questions[quizid] = [];
    }
    data["questions"].forEach((el, index) => window.questions[quizid].push(el));
  });

  $("#longpage-main").scroll(_.debounce(function()
  {
    function elementScrolled(elem)
    {
      var docViewTop = $(window).scrollTop();
      var docViewBottom = docViewTop + $(window).height();
      var elemTop = $(elem).offset().top;
      return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
    }

    $("#longpage-content .wrapper p").each(function(i, el)
    {
      if(elementScrolled(el) )
      {
        var id = $(el).attr("id");
        if(id in window.quizzes)
        {
          var questions = window.questions[window.quizzes[id].id]
          var html = questions[0].html;
          var tag = $("<div></div>");
          $(tag).html(html);
          $(tag).find("script").remove();
          $(tag).find(".questionflag").remove();
          $("#question").html($(tag).html());  
          $("#question .submitbtns").show();
          return false;
        }     
      }
      $("#question").html("");
    });

  }, 1000));
});

export default {
  name: "Quiz",
  components: { SidebarTab },
  computed: {
    ...mapGetters({
      highlights: GET.QUIZ,
    }),
    type() {
      return AnnotationType.QUIZ;
    },
  },
};
</script>

