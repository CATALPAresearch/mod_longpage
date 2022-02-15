<template>
  <sidebar-tab :title="$t('sidebar.tabs.quiz.heading')">
    <template #append-header> </template>
    <template #body> 
      <div id="question"></div>     
    </template>
  </sidebar-tab>
</template>
<style>
#longpage-main .filter_embedquestion-iframe
{
  height: 0 !important;
}
</style>
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
    let _this = this;

    function waitForElm(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector));
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    waitForElm('.reading-progress').then((elm) => {
      ajax.call([
        {
          methodname: "mod_longpage_get_reading_comprehension",
          args: {
            longpageid: _this.context.longpageid,
          },
          done: function (reads) {
            try {
              let data = JSON.parse(reads.response);

              for (const [id, value] of Object.entries(data)) {
                var idFixed = id.replace("/", "\\/");
                if ($("#" + idFixed)) {
                  $("#longpage-content #" + idFixed).parents(".wrapper").prev().prepend(
                    $("<span></span>")
                      .attr(
                        "title",
                        "Das geschätzte Leseverständnis beträgt " +
                          100*value.toFixed(2) +
                          "%"
                      )
                      .addClass(
                        "reading-progress progress-" +
                          Math.round(value) * 5
                      ).css("background-color", "green").css("opacity", value)
                  );
                } else {
                  console.log("Section not found", id);
                }
              }
            } catch (e) {
              console.log(e);
            }
          },
          fail: function (e) {
            console.error("fail", e);
          },
        },
      ]);
    });

    $(document).ready(function() 
    {
      var observer = new IntersectionObserver(function(entries) 
      {
        if(entries[0].isIntersecting === true)
        {
          $("#question").html("");
          $(entries[0].target).clone().appendTo("#question"); 
          return;
        }

        $("#question").html("");
      }, { threshold: [0.1] });

      $("#longpage-main .filter_embedquestion-iframe").each(function(i,el) 
      {
        $(el).data("paragraph", $(el).parent().prev().attr("id"))
        observer.observe(el);
      });
     
        
      $("#longpage-main").scroll(_.debounce(function()
      {
          //
      }, 1000));
    });
  }
};
</script>

