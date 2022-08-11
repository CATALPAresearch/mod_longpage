<template>
  <sidebar-tab>
  <template #body> 
    <div class="row pr-3">
      <h3
          class="col m-0 tab-title" style="width: 70%"
        >
          {{$t('sidebar.tabs.quiz.heading')}}
        </h3>
      <div class="col-auto px-0">
        <p id="total-reading-comprehension" title="Ihr geschätztes Leseverständnis für die ganze Seite" style="display: inline;"></p>
      </div>
      <div class="col-auto px-0">
        <a href="javascript:void(0)" id="nextQuestion" title="Nächste Frage"><i class="fa fa-arrow-down fa-fw fa-2x" /></a>
      </div>
      <div class="col-auto px-0">
        <a href="javascript:void(0)" id="prevQuestion" title="Vorherige Frage"><i class="fa fa-arrow-up fa-fw fa-2x" /></a> 
      </div>
    </div> 
    <hr class="my-3">
    
        <p id="quiz-placeholder" class="p-3">Zu diesem Abschnitt gibt es keine Fragen.</p>
        <div id="carousel" class="carousel slide" data-interval="false" style="display:none">
          <ol id="carousel-indicators" class="carousel-indicators">
          </ol>
          <div id="question" class="carousel-inner"></div>     
          <a class="carousel-control-prev" href="#carousel" role="button" data-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="sr-only">&lt;-</span>
          </a>
          <a class="carousel-control-next" href="#carousel" role="button" data-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="sr-only">-&gt;</span>
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

#carousel
{
  display: none;
}

#question
{
  min-height: 400px;
  text-align: center;
}

.carousel-indicators li
{
  background-color: #ccc;
}

.carousel-control-prev, .carousel-control-next 
{
  width: 18px;
  filter: invert(100%);
}

.carousel-control-prev:focus, .carousel-control-next:focus
{
  box-shadow: none;
}

.carousel-item
{
  padding-left: 15px;
  padding-right: 15px;
}

.reading-comprehension
{
  background-color: green !important;
  cursor: pointer;
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

              var sum = 0;
              var len = 0;

              $(".wrapper").each(function(index, paragraph)
              {
                if($(paragraph).attr("data-reading-comprehension-count"))
                {
                  var progress = $(paragraph).find(".reading-progress");
                  var value = parseFloat($(paragraph).attr("data-reading-comprehension-sum"))/parseInt($(paragraph).attr("data-reading-comprehension-count"));
                  sum += value;
                  len += 1;
                  $(progress)
                    .attr(
                      "title",
                      $(progress).attr("title").substr(0, $(progress).attr("title").indexOf("gelesen")+7) + ".\nIhr geschätztes Leseverständnis beträgt " +
                        (100*value).toFixed(2) +
                        "%."
                    ).css("opacity", value).addClass("reading-comprehension");
                    $(paragraph).attr("data-reading-comprehension-count", "");
                }
              });
              
              var rc = 0;
              if (len > 0)
              {
                rc = (100 * sum / len).toFixed(0);
              }

              $("#sidebar-tab-quiz #total-reading-comprehension").text(rc + " %");
   
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

    function isElementInViewport(element, index, array)
    {
      // Special bonus for those using jQuery
      if (typeof jQuery === "function" && element instanceof jQuery) {
          element = element[0];
      }

      var rectEl = element.getBoundingClientRect();
      var rectApp = document.querySelector('#longpage-app').getBoundingClientRect();
 
      return (
          rectEl.top >= rectApp.top &&
          rectEl.left >= rectApp.left &&
          rectEl.bottom <= rectApp.bottom &&
          rectEl.right <= rectApp.right
      );
    } 

    $(document).ready(function() 
    {
      if ($("body").hasClass("drawer-open-left"))
      {
        $("button[data-action='toggle-drawer']").click();
      }

      $(".fa-dashboard").click();

      var readfun = _.debounce(function()
      {
        get_reading_comprehension();
      }, 5000);

      readfun();
        
      var observer = new IntersectionObserver(function(entries) 
      {
        var added = {};
        for (var i = 0; i < entries.length; i++)
        {
          var entry = entries[i];
                
          if (entry.isIntersecting === true)
          {
            $("#longpage-main .filter_embedquestion-iframe").removeClass("last-visible");
            var idFixed = "#" + entry.target.id.replace("/", "\\/");
            entry.target.classList.add("last-visible");
            added[idFixed] = 1;
                        
            var div = $(`<div class="carousel-item"></div>`);            
            $($("#longpage-main " + idFixed)[0]).clone().appendTo(div);
            $(div).appendTo("#question");
            
            $("#question iframe").on("load", function () {
              readfun();
            });
          }          
        }

        var found = false;
        var visible = {};
        $("#longpage-main .filter_embedquestion-iframe").each(function (i, el)
        {
          var idFixed = "#" + el.id.replace("/", "\\/");
          visible[idFixed] = (idFixed in visible && visible[idFixed]) || isElementInViewport(el);
        });
         
        $("#longpage-main .filter_embedquestion-iframe").each(function (i, el)
        {
          var idFixed = "#" + el.id.replace("/", "\\/");

          if (!(idFixed in added) && !visible[idFixed])
          {
            $("#question").find(idFixed).parents(".carousel-item").remove();
          }
          else
          {
            found = true;
          }
        });

        if (!found)
        {
          $("#question").children().remove();  
          $("#carousel-indicators").children().remove(); 
        }

        if($("#question").children().length > 0)
        {
          $("#quiz-placeholder").hide();
          $("#carousel").show();
          $("#question .carousel-item").removeClass("active");
          $("#question .carousel-item:first").addClass("active");
          $("#carousel-indicators").children().remove();
          $(".carousel-control-prev, .carousel-control-next").hide();

          if ($("#question").children().length > 1)
          {
            $(".carousel-control-prev, .carousel-control-next").show();
            for (var i = 0; i < $("#question").children().length; i++)
            {
              var div = $(`<li data-target="#carousel" data-slide-to="${i}" class="${i == 0 ? "active" : ""}"></li>`);
              $(div).appendTo("#carousel-indicators");
            }
          }  
        }
        else
        {
          $("#carousel").hide();
          $("#quiz-placeholder").show();
          $("#carousel-indicators").children().remove();
        }
    
      }, { threshold: [0.1], root: document.querySelector('#longpage-main') });


      $("#longpage-main .filter_embedquestion-iframe").each(function(i,el) 
      {
        
        $(el).data("paragraph", $(el).parent().prev().attr("id"));
        
        observer.observe(el);
      });

      $(".filter_embedquestion-iframe").on("load", function()
      {
        $(this).contents().find(".que .outcome").hide();
      });

      $("#nextQuestion").click(function()
      {
        var t = $("#longpage-main").scrollTop();
        $("#longpage-main .filter_embedquestion-iframe").each(function (i, el)
        {
          if ($(el).position().top > t+300)
          {
            $("#longpage-main").animate({ scrollTop: $(el).position().top - 200 }, 'fast');
            return false;
          }
        })
      });

      $("#prevQuestion").click(function()
      {
        var t = $("#longpage-main").scrollTop();
        $($("#longpage-main .filter_embedquestion-iframe").get().reverse()).each(function (i, el)
        {
          if ($(el).position().top < t)
          {
            $("#longpage-main").animate({ scrollTop: $(el).position().top - 200 }, 'fast');
            return false;
          }
        })
      });


      $(document).on("click", ".reading-comprehension", function()
      {
        $(".fa-dashboard").trigger("click");
      });
    });
  }
};
</script>

