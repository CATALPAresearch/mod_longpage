<template>
  <sidebar-tab>
  <template #body> 
    <div class="row pr-3">
      <h3
          class="col m-0 tab-title" style="width: 70%"
        >
          {{$t('sidebar.tabs.quiz.heading')}}
        </h3>
      
        <button class="btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i class="fa fa-cog fa-fw fa-lg" /> 
        </button>
        <div class="dropdown-menu dropdown-menu-right" style="min-width: 15rem;">
          <a class="dropdown-item" id="createQuestion" href="javascript:void(0)"><i class="fa fa-plus-square fa-fw" /> Neue Frage einbetten</a>
          <a class="dropdown-item" id="addQuestion" href="javascript:void(0)"><i class="fa fa-plus fa-fw" /> Vorhandene Frage einbetten</a>
          <a class="dropdown-item" id="editQuestion" href="javascript:void(0)"><i class="fa fa-pencil fa-fw" /> Frage editieren</a>
          <a class="dropdown-item" id="changeQuestion" href="javascript:void(0)"><i class="fa fa-cog fa-fw" /> Einbettung editieren</a>
          <a class="dropdown-item" id="removeQuestion" href="javascript:void(0)"><i class="fa fa-minus-square fa-fw" />Einbettung entfernen</a>
        </div>
      
      <div class="col-auto px-0 offset-md-1">
        <a href="javascript:void(0)" id="total-reading-comprehension" title="Frage oben halten"><i class="fa fa-battery-0 fa-fw fa-lg" /></a>
      </div>
      <div class="col-auto px-0">
        <a href="javascript:void(0)" id="pinQuestion" title="Frage oben halten"><i class="fa fa-thumb-tack fa-fw fa-lg" /></a>
      </div>
      <div class="col-auto px-0">
        <a href="javascript:void(0)" id="prevQuestion" title="Vorherige Frage"><i class="fa fa-arrow-up fa-fw fa-lg" /></a> 
      </div>
      <div class="col-auto px-0">
        <a href="javascript:void(0)" id="nextQuestion" title="Nächste Frage"><i class="fa fa-arrow-down fa-fw fa-lg" /></a>
      </div>
    </div> 
    <hr class="my-3">    
    <p id="quiz-placeholder" class="p-3">Zu diesem Abschnitt gibt es keine Aufgaben.</p>
    <div id="carousel" class="carousel slide" data-interval="false" style="display:none">
      <ol id="carousel-indicators" class="carousel-indicators">
      </ol>
      <div id="question" class="carousel-inner"></div>     
      <a class="carousel-control-next" href="#carousel" role="button" data-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="sr-only">-&gt;</span>
      </a>
      <a class="carousel-control-prev" href="#carousel" role="button" data-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="sr-only">&lt;-</span>
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

#quiz-spinner
{
  position: absolute;
  top: 50px;
  width: 100%;
}

#quiz-spinner .spinner-border
{
  display: block;
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
  margin-left: 40%;
  margin-right: 40%;
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

#pinQuestion {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: bottom center;
  display: block;
}

#pinQuestion.active {
  color: #0f6cbf !important;
  -webkit-transform: scale3d(1.3, 1.3, 1);
  transform: scale3d(1.3);
}

.reading-comprehension
{
  background-color: green !important;
  cursor: pointer;
}

.reading-progress, #total-reading-comprehension
{
  display: none;
}

.embedQuestion
{
  margin-left: 20px;
}

</style>
<script>

import { AnnotationType, SidebarEvents, SidebarTabKeys } from "@/config/constants";
import { GET, MUTATE } from "@/store/types";
import { mapActions, mapGetters, mapMutations } from "vuex";
import SidebarTab from "@/components/LongpageSidebar/SidebarTab";
import ajax from "core/ajax";
import Fragment from "core/fragment";
import { EventBus } from "@/lib/event-bus"; 

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
  emits: [SidebarEvents.TOGGLE_TABS, SidebarEvents.CHANGE_BADGES],
  methods: {
    ...mapMutations([MUTATE.RESET_SIDEBAR_TAB_OPENED_KEY]),
    toggleTab()
    {
      EventBus.publish(SidebarEvents.TOGGLE_TABS, SidebarTabKeys.QUIZ);
    }
  },
  mounted() 
  {
    let _this = this;
    const _ = require('lodash');

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
                    $(p).attr("data-reading-comprehension-count", level);
                    $(p).attr("data-reading-comprehension-sum", level*value);
                  }
                  else
                  {
                    $(p).attr("data-reading-comprehension-count", parseInt($(p).attr("data-reading-comprehension-count"))+level);
                    $(p).attr("data-reading-comprehension-sum", parseFloat($(p).attr("data-reading-comprehension-sum"))+(level*value));
                  }
                });

                $(paragraph).find(".reading-progress").attr("data-embedid", idFixed);
                $(paragraph).find(".reading-progress").attr("data-questionid", entry["id"]);                
              }

              var sum = 0; 
              var len = 0;
              var repeat = 0;

              $(".wrapper[data-reading-comprehension-count]").each(function (index, paragraph) {
                var progress = $(paragraph).find(".reading-progress");
                var value = parseFloat($(paragraph).attr("data-reading-comprehension-sum")) / parseInt($(paragraph).attr("data-reading-comprehension-count"));
                repeat += (value < 0.5 ? 1 : 0);
                sum += value;
                len += 1;
                $(progress).attr("title", $(progress).attr("data-original-title"));
                $(progress)
                  .attr(
                    "title",
                    (_this.context.showreadingprogress ? ($(progress).attr("title").substr(0, $(progress).attr("title").indexOf("gelesen.") + 8) + "<br>") : "") +
                    "Ihr geschätztes Leseverständnis beträgt " +
                      (100*value).toFixed(2) +
                      "%."
                  ).css("opacity", Math.max(0.1, value)).addClass("reading-comprehension");
                  $(paragraph).attr("data-reading-comprehension-count", "");
              });

              $(".reading-progress").tooltip("dispose").tooltip({ "placement": "auto", "html": true });
              
              var rc = 0;
              if (len > 0)
              {
                rc = (100 * sum / len).toFixed(0);
              }

              if(rc <= 50)
              {
                EventBus.publish(SidebarEvents.CHANGE_BADGES, { type: SidebarTabKeys.QUIZ, count: repeat, title: "Ihr geschätztes Leseverständnis für die ganze Seite \nund " + repeat + " Fragen beträgt weniger als 50%." });
              }             

              $("#sidebar-tab-quiz #total-reading-comprehension").attr("title", "Ihr geschätztes Leseverständnis für die ganze Seite <br>beträgt: " + rc + " %.<br>Klicken Sie für eine Übersicht der Fragen.").tooltip({"placement":"auto", "html":true, "title":""}).attr("title", "");
              $("#sidebar-tab-quiz #total-reading-comprehension i").attr("class", "fa fa-fw fa-lg fa-battery-" + Math.floor(rc / 25));
              $("#sidebar-tab-quiz #total-reading-comprehension").show();
              
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

    function isElementBottomInViewport(element)
    {
      // Special bonus for those using jQuery
      if (typeof jQuery === "function" && element instanceof jQuery) {
          element = element[0];
      }

      var rectEl = element.getBoundingClientRect();
      var rectApp = document.querySelector('#longpage-app').getBoundingClientRect();
 
      return (
        rectEl.bottom >= rectApp.top &&
          rectEl.left >= rectApp.left &&
          rectEl.bottom <= rectApp.bottom &&
          rectEl.right <= rectApp.right
      );
    } 

    $(document).ready(function () {
      var readfun = _.debounce(function () {
        get_reading_comprehension();
      }, 2000);

      get_reading_comprehension();

      $(".reading-progress").not($(".filter_embedquestion-iframe ").parent().next()).append('<a href="javascript:void(0)" class="embedQuestion" title="Vorhandene Frage einbetten"><i class="fa fa-plus fa-fw" /></a>');

      //let previousY = 0;
      let directionUp = false;
      //let currentY = 0;

      var observerStates = {};

      function observerCall(entries = []) {
        if ($("#pinQuestion").hasClass("active")) {
          for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            observerStates["#" + $(entry.target).find(".reading-comprehension").attr("data-embedid")] = entry;
          }
          return;
        }

        var added = {};
        for (const entry of entries) {
          //currentY = entry.boundingClientRect.y
          // if (currentY < previousY) {
          //   directionUp = false;
          // }
          // else {
          //   directionUp = true;
          // }
          $(entry.target).next().find("iframe").each(function (idx, target) {
            if (entry.isIntersecting === true) {
              $("#longpage-main .filter_embedquestion-iframe").removeClass("last-visible");
              var idFixed = "#" + target.id.replace("/", "\\/");
              target.classList.add("last-visible");
              added[idFixed] = 1;

              var div = $(`<div class="carousel-item"></div>`);
              var iframeCloned = $($("#longpage-main " + idFixed)[0]).clone(true);
              var src = $(iframeCloned).attr("src");
              $(iframeCloned).attr("src", "");
              $(iframeCloned).appendTo(div);

              let questionid = $(entry.target).find(".reading-comprehension").attr("data-questionid");
              $(iframeCloned).attr("data-questionid", questionid);

              var obs = new IntersectionObserver((entries, o) => {
                var spinner = `<div id="quiz-spinner" class="row no-gutters vh-50">
                <div class="spinner-border m-auto" role="status">
                  <span class="sr-only" />
                </div>
                </div>`;

                entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                    o.unobserve(entry.target);
                    $("#question").css("opacity", 0.2);
                    $("#quiz-spinner").remove();
                    $(spinner).appendTo("#sidebar-tab-quiz");
                    $(entry.target).attr("src", src);
                  }
                });
              });

              obs.observe($(iframeCloned)[0]);

              if (directionUp) {
                $(div).prependTo("#question");
              }
              else {
                (div).appendTo("#question");
              }

              $("#question iframe" + idFixed).on("load", function () {
                if ($("#pinQuestion").hasClass("autopin")) {
                  $("#pinQuestion").click();
                }
                var cssLink = document.createElement("link");
                cssLink.href = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + "/vue/src/styles/tasks.css";
                cssLink.rel = "stylesheet";
                cssLink.type = "text/css";
                $("#question iframe" + idFixed).contents().find("head").append(cssLink);

                var jsLink = document.createElement("script");
                jsLink.src = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + "/vue/src/components/LongpageSidebar/Quiz/tasks.js";
                jsLink.type = "text/javascript";
                $("#question iframe" + idFixed).contents().find("head").append(jsLink);

                readfun();

                function waitPending() {
                  if (M.util.js_pending()) {
                    setTimeout(waitPending, 500);
                  }
                  else {
                    $("#quiz-spinner").remove();
                    $("#question").css("opacity", 1);
                  }
                }

                waitPending();

                $(this).contents().find("body").on('click', function (ev) {
                  if (!$("#pinQuestion").hasClass("active")) {
                    $("#pinQuestion").addClass("autopin");
                    $("#pinQuestion").click();
                  }
                  var logentry = {
                    longpageid: _this.context.longpageid,
                    pageX: ev.pageX,
                    pageY: ev.pageY,
                    embedid: target.id,
                    questionid: questionid
                  };
                  ajax.call([
                    {
                      methodname: "mod_longpage_log",
                      args: {
                        data: {
                          entry: JSON.stringify(logentry),
                          action: "clicked",
                          utc: Math.ceil(new Date().getTime() / 1000),
                          courseid: _this.context.courseId
                        },
                      },
                      done: function (reads) {
                      },
                      fail: function (e) {
                        console.error("fail", e);
                      },
                    },
                  ]);
                });

                var autosavefun = _.debounce(function () {
                  ajax.call([
                    {
                      methodname: "mod_longpage_autosave",
                      args: {
                        data: {
                          qubaid: new URLSearchParams($(this).contents().find("form").attr("action")).get("qubaid"),
                          form: JSON.stringify(Object.fromEntries(new FormData($(this).contents().find("form")[0])))
                        },
                      },
                      done: function (reads) {
                      },
                      fail: function (e) {
                        console.error("fail", e);
                        alert(e);
                      },
                    },
                  ]);
                }, 2000);

                $(this).contents().find("body").on('click keyup', autosavefun);

                $(this).contents().find("body").on('dblclick', function () {
                  var el = $("#" + $("#question iframe" + idFixed).data("paragraph"));
                  $(el)[0].scrollIntoView({ "behavior": "smooth", "block": "start" });
                });
              });
            }
            else {
              //TODO: hiermit arbeiten, nicht isElementInViewport
              var idFixed = "#" + target.id.replace("/", "\\/");
              $("#question").find(idFixed).parents(".carousel-item").remove();
            }

          });
        }

        //previousY = currentY; 
        var found = false;
        var visible = {};
        $("#longpage-main .filter_embedquestion-iframe").each(function (i, el) {
          var idFixed = "#" + el.id.replace("/", "\\/");
          visible[idFixed] = (idFixed in visible && visible[idFixed]) || isElementInViewport(el);
        });

        $("#longpage-main .filter_embedquestion-iframe").each(function (i, el) {
          var idFixed = "#" + el.id.replace("/", "\\/");

          if (!(idFixed in added) && !visible[idFixed]) {
            //$("#question").find(idFixed).parents(".carousel-item").remove();
          }
          else {
            found = true;
          }
        });

        if (!found) {
          $("#question").children().remove();
        }

        if ($("#question").children().length > 0) {
          $("#quiz-placeholder").hide();
          $("#carousel").show();
          $("#question .carousel-item").removeClass("active");
          $("#question .carousel-item:first").addClass("active");
          $("#carousel-indicators").children().remove();
          $(".carousel-control-prev, .carousel-control-next").hide();

          if ($("#question").children().length > 1) {
            $(".carousel-control-prev, .carousel-control-next").show();
            for (var i = 0; i < $("#question").children().length; i++) {
              var div = `<li data-target="#carousel" data-slide-to="${i}" class="${i == 0 ? "active" : ""}">${i + 1}</li>`;
              $(div).appendTo("#carousel-indicators");
            }
          }
        }
        else {
          $("#carousel").hide();
          $("#quiz-spinner").remove();
          $("#quiz-placeholder").show();
          $("#carousel-indicators").children().remove();
        }
      }

      var observer = new IntersectionObserver(observerCall, { rootMargin: "-100px 0px -100px 0px", threshold: 0, root: document.querySelector('#longpage-main') });


      $("#longpage-main .filter_embedquestion-iframe").each(function (i, el) {
        var paragraph = $(el).parents(".wrapper").prev();
        $(el).data("paragraph", $(paragraph).children().first().attr("id"));
        observer.observe($(paragraph)[0]);
      });

      $("#question").on("mouseover", "iframe", function () {
        var el = $("#" + $(this).data("paragraph"));
        $(el).css("background-color", "#eee");
        setTimeout(function () {
          $(el).css("background-color", "#fff");
        }, 1000);
      });

      $("#nextQuestion").click(function () {
        var t = $("#longpage-main").scrollTop();
        $("#longpage-main .filter_embedquestion-iframe").each(function (i, el) {
          if (el.offsetTop > t + 500) {
            $("#longpage-main").animate({ scrollTop: el.offsetTop - 500 }, 'fast');
            return false;
          }
        })
      });

      $("#prevQuestion").click(function () {
        var t = $("#longpage-main").scrollTop();
        $($("#longpage-main .filter_embedquestion-iframe").get().reverse()).each(function (i, el) {
          if (el.offsetTop < t) {
            $("#longpage-main").animate({ scrollTop: el.offsetTop - 500 }, 'fast');
            return false;
          }
        })
      });

      $("#pinQuestion").on("click", function () {
        $(this).toggleClass("active");
        if (!$(this).hasClass("active")) {
          $("#pinQuestion").removeClass("autopin");
          observerCall(Object.values(observerStates));
        }
        observerStates = {};
      });

      $("#id_embedform").on("change", function () {
        //alert($("#id_embedformeditable").text());
      }); 

      $(".embedQuestion").on("click", function () {
        alert($(this).index(".embedQuestion"));
        $("#id_embedform").val("");
        $("#id_embedformeditable").text("");
        $(".atto_embedquestion_button").click();
        
        // Fragment.loadFragment('atto_embedquestion', 'questionselector', 16,
        //         {contextId: 16, embedCode: ""}
        //         ).done(function(html, js) {
        //           var last = $("#longpage-content .wrapper").filter(function (i, el)
        //           {
        //             return isElementBottomInViewport(el);
        //           }).last().children().first();

        //           var tag = $(last).prop("tagName").toLowerCase();

                 
  
        //           const blob = new Blob([html], { type: 'text/html' });
        //           let iframe = document.createElement('iframe');
        //           $(iframe).on("load", function () {
        //             var jsLink = $('<script>').attr('type', 'text/javascript').html(js);
        //             $(this).contents().find("head").append(jsLink);
        //           });
        //           iframe.src = window.URL.createObjectURL(blob);
        //           $(iframe).attr("id", "add/question").addClass('filter_embedquestion-iframe');
        //           //Templates.replaceNodeContents(iframe, html, js);

                  
        //           $(iframe).wrap("<div class='carousel-item'/>").prependTo($("#question"));
                 
        //           // $(iframe).insertAfter(last.parent(".wrapper"));
        //           // $(iframe).wrap("<div class='wrapper'/>")
        //           // $(iframe).wrap("<div/>");

        //           // observer.observe(last.parent(".wrapper")[0]);

        //         }).fail(Notification.exception);
      });

      $("#changeQuestion").on("click", function () {
        Fragment.loadFragment('atto_embedquestion', 'questionselector', "contextid",
                {contextId: "contextid", embedCode: "existingCode"}
                ).done(function(html, js) {
                  console.log(html, js);
                }
                ).fail(Notification.exception);
      });

      $("#editQuestion").on("click", function () {
        let questionid = $("#question .carousel-item.active iframe").attr("data-questionid");
        window.open(window.location.href.replace("mod/longpage/view.php", "question/bank/editquestion/question.php").replace("id", "cmid") + "&id=" + questionid, '_blank');
      });

      $("#carousel").parent().removeClass("overflow-y-auto").css("overflow-y", "hidden");


      $(document).on("click", ".reading-comprehension", function()
      {
        _this.toggleTab();
        $("#carousel").carousel($("#carousel").find("#" + $(this).attr("data-embedid")).parent(".carousel-item").index()) 
      });

      $("#total-reading-comprehension").on("click", function () {
        window.open(window.location.href.replace("mod/longpage/view.php", "report/embedquestion/activity.php").replace("id", "cmid"), '_blank');
      });
    });
  }
};
</script>

