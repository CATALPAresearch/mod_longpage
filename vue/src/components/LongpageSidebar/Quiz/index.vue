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
import ajax from "core/ajax";

export default {
  name: "Quiz",
  components: { SidebarTab },
  computed: {
    ...mapGetters({
      highlights: GET.QUIZ,
      context: GET.LONGPAGE_CONTEXT
    }),
    type() {
      return AnnotationType.QUIZ;
    }
  },
  mounted() 
  {
    let longpageid = this.context.longpageid;
    let questions = {};

    $(document).ready(function() 
    {
      
      ajax.call([
      {
        methodname: "mod_longpage_get_questions_by_page_id",
        args: {
          longpageid: longpageid
        },
        done: function (reads)
        {
          questions = reads["questions"].reduce(function(rv, x) {
            (rv[x["tagname"]] = rv[x["tagname"]] || []).push(x);
            return rv;
          }, {});
        }
      }]); 
      
      $("#longpage-main").scroll(_.debounce(function()
      {
        
        function elementScrolled(elem)
        {
          var docViewTop = $(window).scrollTop();
          var docViewBottom = docViewTop + $(window).height();
          var elemTop = $(elem).offset().top;
          return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
        }

        $("p,span,div,h1,h2,h3,h4,h5,h6","#longpage-content .wrapper").each(function(i, el)
        {
          if(elementScrolled(el) )
          {
            var id = $(el).attr("id");
            if(id in questions)
            {
                var question = questions[id][0]
                var html = question.html;
                var tag = $("<div></div>");
                $(tag).html(html);
                $(tag).find("script").remove();
                $(tag).find(".questionflag").remove();
                $("#question").html($(tag).html());  
                $("#question").next(".submitbtns").show();
                return false;
            }     
          }
          $("#question").html("");
          $("#question").next(".submitbtns").hide();
        });

      }, 1000));
    });
  }
};
</script>

