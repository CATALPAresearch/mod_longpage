<template>
  <sidebar-tab :title="$t('sidebar.tabs.quiz.heading')">
    <template #append-header> </template>
    <template #body> 
      <div id="carouselExampleIndicators" class="carousel slide" data-interval="false">
        <ol class="carousel-indicators">
          <li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>
          <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
          <li data-target="#carouselExampleIndicators" data-slide-to="2"></li>
        </ol>
        <div id="question" class="carousel-inner"></div>     
        <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="sr-only">Previous</span>
        </a>
        <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="sr-only">Next</span>
        </a>
    </div>
    </template>
  </sidebar-tab>
</template>
<style>
#longpage-main .filter_embedquestion-iframe
{
  height: 0 !important;
}

#question
{
  height: 700px;
}

.carousel-control-prev, .carousel-control-next 
{
  width: 15px;
  filter: invert(100%);
}
.carousel-item
{
  padding-left: 15px;
  padding-right: 15px;
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
  props: ["content"],
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
  methods: {

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

    function get_reading_comprehension()
    {
      ajax.call([
        {
          methodname: "mod_longpage_get_reading_comprehension",
          args: {
            longpageid: _this.context.longpageid,
          },
          done: function (reads) {
            try {
              let data = JSON.parse(reads.response);
            
              for (const [id, value] of Object.entries(data)) 
              {
                var idFixed = id.replace("/", "\\/");
                var paragraph = $("#longpage-content #" + idFixed).parents(".wrapper").prev();
                $(paragraph).each(function(index, p)
                {
                  if(!$(p).attr("data-reading-comprehension-count"))
                  {
                    $(p).attr("data-reading-comprehension-count", 1)
                    $(p).attr("data-reading-comprehension-sum", value)
                  }
                  else
                  {
                    $(p).attr("data-reading-comprehension-count", parseInt($(p).attr("data-reading-comprehension-count"))+1);
                    $(p).attr("data-reading-comprehension-sum", parseFloat($(p).attr("data-reading-comprehension-sum"))+value);
                  }
                });
                
              }

              $(".wrapper").each(function(index, paragraph)
              {
                if($(paragraph).attr("data-reading-comprehension-count"))
                {
                  var progress = $(paragraph).find(".reading-progress");
                  var value = parseFloat($(paragraph).attr("data-reading-comprehension-sum"))/parseInt($(paragraph).attr("data-reading-comprehension-count"));
                  $(progress)
                    .attr(
                      "title",
                      $(progress).attr("title").substr(0, $(progress).attr("title").indexOf("gelesen")+7) + ".\nIhr geschätztes Leseverständnis beträgt " +
                        (100*value).toFixed(2) +
                        "%."
                    )
                    .css("background-color", "green").css("opacity", value);
                    $(paragraph).attr("data-reading-comprehension-count", "");
                }
              });
            } catch (e) {
              console.log(e);
            }
          },
          fail: function (e) {
            console.error("fail", e);
          },
        },
      ]);
    }

    $(document).ready(function() 
    {
      var observer = new IntersectionObserver(function(entries) 
      {
        for(var i=0; i<entries.length; i++)
        {
          var entry = entries[i];
          var idFixed = "#" + entry.target.id.replace("/", "\\/");
          if(entry.isIntersecting === true)
          {
            var cl = "carousel-item";
            if(i == 0)
            {
              cl += " active"
            }
            var div = $(`<div class="${cl}"></div>`);
            $($("#longpage-main " + idFixed)[0]).clone().appendTo(div);
            $(div).appendTo("#question");
          }
          else
          {
            $("#question " + idFixed).parent().remove();
          }
          
        }
    
      }, { threshold: [0.1] });

      
      $("#longpage-main .filter_embedquestion-iframe").each(function(i,el) 
      {
        
        $(el).data("paragraph", $(el).parent().prev().attr("id"));
        
        observer.observe(el);
      });

      var readfun = _.debounce(function()
        {
            get_reading_comprehension();
        }, 1000);

      $(".filter_embedquestion-iframe").on("load", function()
      {
        readfun();
        $(".filter_embedquestion-iframe").contents().find(".que .outcome").hide();
      });
    });
  }
};
</script>

