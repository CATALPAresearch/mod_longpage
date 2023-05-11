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
        <a href="javascript:void(0)" id="pinQuestion" title="Frage oben halten"><i class="fa fa-thumb-tack fa-fw fa-lg" /></a>
      </div>
      <div class="col-auto px-0">
        <p id="total-reading-comprehension" title="Ihr geschätztes Leseverständnis für die ganze Seite" style="display: inline;"></p>
      </div>
      <div class="col-auto px-0">
        <a href="javascript:void(0)" id="nextQuestion" title="Nächste Frage"><i class="fa fa-arrow-down fa-fw fa-lg" /></a>
      </div>
      <div class="col-auto px-0">
        <a href="javascript:void(0)" id="prevQuestion" title="Vorherige Frage"><i class="fa fa-arrow-up fa-fw fa-lg" /></a> 
      </div>
    </div> 
    <hr class="my-3">
    
        <p id="quiz-placeholder" class="p-3">Zu diesem Abschnitt gibt es keine Aufgaben.</p>
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
#page-content #region-main
{
  padding-right: 0 !important;
}

#longpage-main .filter_embedquestion-iframe
{
  height: 0 !important;
}

#carousel
{
  display: none;
  height: 100%;
}

#question .filter_embedquestion-iframe
{
  /* min-height: 350px; */
  height: 100% !important;
  text-align: center;
}

#question
{
  height: 100%;
}

.carousel-indicators
{
  top: -35px;
  bottom: initial;
}

.carousel-indicators li
{
  background-color: #ccc;
  height: 20px;
  text-align: center;
  text-indent: initial;
}

.carousel-control-prev, .carousel-control-next 
{
  width: 25px;
  filter: invert(100%);
  align-items: normal;
  top: 200px;
}

.carousel-control-prev:focus, .carousel-control-next:focus
{
  box-shadow: none;
}

.carousel-control-prev-icon, .carousel-control-next-icon
{
  width: 25px;
  height: 25px;
}

.carousel-item
{
  position: absolute;
  height: 100%;
}

#pinQuestion.active {
  color: #0f6cbf !important;
}

.reading-comprehension
{
  background-color: green !important;
  cursor: pointer;
}

.reading-progress
{
  display: none;
}

</style>
<script>

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
    const _ = require('lodash');

    function get_reading_comprehension()
    {
      if (!_this.context.showreadingcomprehension)
        return;

      ajax.call([
        {
          methodname: "mod_longpage_get_reading_comprehension",
          args: {
            longpageid: _this.context.longpageid,
          },
          done: function (reads) {
            try {
              let data = JSON.parse(reads.response);

              var wrapper = $("#longpage-main .filter_embedquestion-iframe").parents(".wrapper");
              $(wrapper).height("0px");
              $(wrapper).css("padding", "0px");
            
              for (const [id, entry] of Object.entries(data)) 
              {
                var value = entry["value"];
                var level = entry["level"];
                var idFixed = id.replace("/", "\\/");
                var paragraph = $("#longpage-content #" + idFixed).parents(".wrapper").prev();
                $(paragraph).each(function(index, p)
                {
                  if(!$(p).attr("data-reading-comprehension-count"))
                  {
                    $(p).attr("data-reading-comprehension-count", level)
                    $(p).attr("data-reading-comprehension-sum", level*value)
                  }
                  else
                  {
                    $(p).attr("data-reading-comprehension-count", parseInt($(p).attr("data-reading-comprehension-count"))+level);
                    $(p).attr("data-reading-comprehension-sum", parseFloat($(p).attr("data-reading-comprehension-sum"))+(level*value));
                  }
                });
                
              }

              var sum = 0;
              var len = 0;

              $(".wrapper[data-reading-comprehension-count]").each(function(index, paragraph)
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
                  ).css("opacity", Math.max(0.1, value)).addClass("reading-comprehension");
                  $(paragraph).attr("data-reading-comprehension-count", "");
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

    //needed for drag & drop task types to resize placeholder correctly
    $('#carousel').on('slid.bs.carousel', function (event) {
      resizeAllDragsAndDrops();
    })

    function getClassnameNumericSuffix(node, prefix)
    {
        var classes = node.attr('class');
        if (classes !== '') {
            var classesArr = classes.split(' ');
            for (var index = 0; index < classesArr.length; index++) {
                var patt1 = new RegExp('^' + prefix + '([0-9])+$');
                if (patt1.test(classesArr[index])) {
                    var patt2 = new RegExp('([0-9])+$');
                    var match = patt2.exec(classesArr[index]);
                    return Number(match[0]);
                }
            }
        }
        return null;
    };

    function resizeAllDragsAndDrops()
    {
      var root = $("#question .active iframe").contents().find(".ddimageortext");
      root.find('.draghomes > div').each(function(i, node) {
            resizeAllDragsAndDropsInGroup(
                    getClassnameNumericSuffix($(node), 'dragitemgroup'), root);
        });
    };

    //modified from ddimageortext / question.js
    function resizeAllDragsAndDropsInGroup(group, root)
    {
      var dragHomes = root.find('.dragitemgroup' + group + ' .draghome'),
          maxWidth = 0,
        maxHeight = 0;
           // Find the maximum size of any drag in this groups.
        dragHomes.each(function(i, drag) {
            maxWidth = Math.max(maxWidth, Math.ceil(drag.offsetWidth));
            maxHeight = Math.max(maxHeight, Math.ceil(drag.offsetHeight));
        });

        // The size we will want to set is a bit bigger than this.
        maxWidth += 10;
        maxHeight += 10;

        // Set each drag home to that size.
        dragHomes.each(function(i, drag) {
            var left = Math.round((maxWidth - drag.offsetWidth) / 2),
                top = Math.floor((maxHeight - drag.offsetHeight) / 2);
            // Set top and left padding so the item is centred.
            $(drag).css({
                'padding-left': left + 'px',
                'padding-right': (maxWidth - drag.offsetWidth - left) + 'px',
                'padding-top': top + 'px',
                'padding-bottom': (maxHeight - drag.offsetHeight - top) + 'px'
            });

            root.find('.dropzone.place' + i).width(maxWidth - 12).height(maxHeight - 12);
        });
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

    this.$nextTick(function () {
    // Code that will run only after the
    // entire view has been rendered
    if ($("body").hasClass("drawer-open-left")) {
        $("button[data-action='toggle-drawer']").trigger("click");
      }

      $(".fa-dashboard").trigger("click");
      

      if (!_this.context.showreadingcomprehension) /* TODO: remove for interBranch */
        return;

      $("#longpage-content .reading-progress").attr("style", "display: inline !important;");
    })

    $(document).ready(function() 
    {
      var readfun = _.debounce(function()
      {
        get_reading_comprehension();
      }, 2000);

      get_reading_comprehension();

      let previousY = 0;
      let directionUp = true;
      let currentY = 0;

      function observerCall(entries=[]) 
      {
        if ($("#pinQuestion").hasClass("active"))
        {
          return;
        }
        
        var added = {};
        for (var i = 0; i < entries.length; i++)
        {
          var entry = entries[i];
          currentY = entry.boundingClientRect.y
          if (currentY < previousY) {
            directionUp = false;
          }
          else {
            directionUp = true;
          }
   
          if (entry.isIntersecting === true)
          {
            $("#longpage-main .filter_embedquestion-iframe").removeClass("last-visible");
            var idFixed = "#" + entry.target.id.replace("/", "\\/");
            entry.target.classList.add("last-visible");
            added[idFixed] = 1;

            var div = $(`<div class="carousel-item"></div>`);            
            $($("#longpage-main " + idFixed)[0]).clone(true).appendTo(div);

            if (directionUp)
            {
              $(div).prependTo("#question");
            }
            else
            {
              (div).appendTo("#question");
            }
            
            $("#question iframe" + idFixed).on("load", function () {
              readfun();
            });
          }     
          else
          {
            //TODO: hiermit arbeiten, nicht isElementInViewport
            var idFixed = "#" + entry.target.id.replace("/", "\\/");
            $("#question").find(idFixed).parents(".carousel-item").remove();
          }  
          
        }
        previousY = currentY; 
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
            //$("#question").find(idFixed).parents(".carousel-item").remove();
          }
          else
          {
            found = true;
          }
        });

        if (!found)
        {
          $("#question").children().remove();  
        }

        if($("#question").children().length > 0)
        {
          $("#quiz-placeholder").hide();
          $("#carousel").show();
          $("#question .carousel-item").removeClass("active");
          $("#question .carousel-item:first").addClass("active");
          $("#carousel-indicators").children().remove();
          $(".carousel-control-prev, .carousel-control-next").hide();

          resizeAllDragsAndDrops();

          if ($("#question").children().length > 1)
          {
            $(".carousel-control-prev, .carousel-control-next").show();
            for (var i = 0; i < $("#question").children().length; i++)
            {
              var div = `<li data-target="#carousel" data-slide-to="${i}" class="${i == 0 ? "active" : ""}">${i+1}</li>`;
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
    
      }

      var observer = new IntersectionObserver(observerCall, { rootMargin: "-35% 0px 25% 0px", threshold: 1, root: document.querySelector('#longpage-main') });


      $("#longpage-main .filter_embedquestion-iframe").each(function(i,el) 
      {   
        $(el).data("paragraph", $(el).parents(".wrapper").prev().find("p").attr("id"));
        observer.observe(el);
      });

      $("#question").on("mouseover", "iframe", function () {
        var el = $("#" + $(this).data("paragraph"));
        $(el).css("background-color", "#eee");
        setTimeout(function () {
          $(el).css("background-color", "#fff");
        }, 1000);
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

      $("#pinQuestion").on( "click", function() {
        $(this).toggleClass("active");
        if (!$(this).hasClass("active"))
        {
          $("#question").children().remove();
          observerCall();  
        }
      });

      $("#carousel").parent().removeClass("overflow-y-auto").css("overflow-y", "hidden");


      $(document).on("click", ".reading-comprehension", function()
      {
        $(".fa-dashboard").trigger("click");
      });
    });
  }
};
</script>

