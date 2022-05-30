<template>
  <div></div>
</template>

<script>
import ajax from "core/ajax";

export default {
  name: "ReadingProgress",
  props: ["context"],

  data: function () {
    return {
      debug: false,
    };
  },

  mounted: function () {
    this.enableScrollLogging();

    this.visualizeReadingProgress();

    // if (
    //   "IntersectionObserver" in window &&
    //   "IntersectionObserverEntry" in window &&
    //   "intersectionRatio" in window.IntersectionObserverEntry.prototype
    // ) {
    //   var observer = new IntersectionObserver((entries) => {
    //     if (entries[0].boundingClientRect.y < 0) {
    //       document
    //         .getElementById("longpage-navbar")
    //         .classList.add("header-not-at-top");
    //       //document.getElementById('table-of-content').classList.add("header-not-at-top");
    //     } else {
    //       document
    //         .getElementById("longpage-navbar")
    //         .classList.remove("header-not-at-top");
    //       //document.getElementById('table-of-content').classList.remove("header-not-at-top");
    //     }
    //   });
    //   observer.observe(document.querySelector("#top-of-site-pixel-anchor"));
    // }
  },

  methods: {
    enableScrollLogging: function () {
      let _this = this;
      if (
        "IntersectionObserver" in window &&
        "IntersectionObserverEntry" in window &&
        "intersectionRatio" in window.IntersectionObserverEntry.prototype &&
        document.querySelector("#longpage-app")
      ) {
        var measuredElement = document.querySelector("#longpage-app");
        var scrollHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        var scrollWidth =
          document.documentElement.scrollWidth - window.innerWidth;
        var yPadding, xPadding;
        if (window.getComputedStyle && measuredElement) {
          var computedStyle = window.getComputedStyle(measuredElement);
          yPadding =
            parseFloat(computedStyle.paddingTop) +
            parseFloat(computedStyle.paddingBottom);
          xPadding =
            parseFloat(computedStyle.paddingLeft) +
            parseFloat(computedStyle.paddingRight);
        }
        //offsetHeight includes border, padding and margin, but clinetHeight includes onle the padding
        var containerHeight = measuredElement.clientHeight - yPadding;
        var containerWidth = measuredElement.clientWidth - xPadding;

        var scrollXDistance = 0;
        var scrollYDistance = 0;
        var topPadding = 0;
        let last_entry = {};

        // See: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
        var handleScrolling = function (entries) {
          if (entries[0].boundingClientRect.y < topPadding) {
            //document.getElementById('table-of-content').classList.add("scrollDown");//header-not-at-top
          } else {
            //document.getElementById('table-of-content').classList.remove("scrollDown");
          }

          let time_diff = 0;
          // iterate over all entries that are within the viewport at the same time.
          for (var entry of entries) {
            // feature detection
            if (typeof entry.isVisible === "undefined") {
              // The browser doesn't support Intersection Observer v2, falling back to v1 behavior.
              entry.isVisible = true;
            }

            if (entry.isIntersecting && entry.isVisible) {
              var now = new Date();
              let word_count = $("#" + entry.target.id)
                .text()
                .split(" ").length;
              // TODO: Determine portion of visible text
              // _this.get($('#' + entry.target.id).get(0)).visibility

              //
              scrollXDistance =
                window.pageXOffset ||
                (
                  document.documentElement ||
                  document.body.parentNode ||
                  document.body
                ).scrollRight;
              scrollYDistance =
                window.pageYOffset ||
                (
                  document.documentElement ||
                  document.body.parentNode ||
                  document.body
                ).scrollTop;

              var logentry = {
                utc: now.getTime(),
                longpageid: _this.context.longpageid,
                courseid: _this.context.courseId,
                relativeTime: entry.time, // ??
                targetID: entry.target.id,
                targetTag: entry.target.localName,
                targetClasses: entry.target.className,
                targetWordCount: word_count,
                scrollXDistance:
                  scrollXDistance === undefined ? 0 : scrollXDistance,
                scrollYDistance:
                  scrollYDistance === undefined ? 0 : scrollYDistance,
                scrollHeight: scrollHeight,
                scrollWidth: scrollWidth,
                scrolltop: scrollYDistance === undefined ? 0 : scrollYDistance,
                containerHeight: containerHeight,
                containerWidth: containerWidth,
                behavior: null, // read, scroll, inactive
              };

              // reading detection
              time_diff = (now.getTime() - last_entry.utc) / 1000; // in seconds
              time_diff = time_diff === 0 ? 1 : time_diff;
              let ratio = last_entry.targetWordCount / time_diff;
              if (ratio < 0.1) {
                last_entry.behavior = "idle";
              } else if (ratio >= 0.1 && ratio <= 3.6) {
                last_entry.behavior = "reading";
              } else {
                last_entry.behavior = "scrolling";
              }

              // output
              //console.log(last_entry.targetID + '\t', time_diff + '\t', last_entry.targetWordCount + '\t', ratio.toFixed(1) + '\t', last_entry.behavior, _this.percentageSeen(entry.target.id));
              //_this.$emit("log", "scroll", last_entry);
              // ajax.call([
              //   {
              //     methodname: "mod_longpage_log",
              //     args: {
              //       data: {
              //         entry: JSON.stringify(logentry),
              //         action: "scroll",
              //         utc: Math.ceil(now.getTime() / 1000),
              //         courseid: _this.context.courseId
              //       },
              //     },
              //     done: function (reads) {
              //       console.log(reads);
              //     },
              //     fail: function (e) {
              //       console.error("fail", e);
              //     },
              //   },
              // ]);
              var hashCode = function (s) {
                return s.split("").reduce(function (a, b) {
                  a = (a << 5) - a + b.charCodeAt(0);
                  return a & a;
                }, 0);
              };
              ajax.call([
                {
                  methodname: "mod_longpage_update_reading_progress",
                  args: {
                    longpageid: _this.context.longpageid,
                    courseid: _this.context.courseId,
                    scrolltop:
                      scrollYDistance === undefined ? 0 : scrollYDistance,
                    section: entry.target.id,
                    sectionhash: hashCode(entry.target.id),
                  },
                  done: function (reads) {
                  },
                  fail: function (e) {
                    console.error("fail", e);
                  },
                },
              ]);

              last_entry = logentry;
            }
          }
        };

        var options = {
          root: null,
          rootMargin: "0px",
          threshold: [1.0],
          trackVisibility: true,
          delay: 100,
        };

        var observer = new IntersectionObserver(handleScrolling, options);
        var pCounter = 0;
        //
        const observedSelectors = [
          "#longpage-app h2",
          "#longpage-app h3",
          "#longpage-app pre",
          "#longpage-app img",
          "div.longpage-image-block",
          "div.longpage-assignment",
          "#longpage-app p",
          "#longpage-app .longpage-assignment",
          "#longpage-app ol",
          "#longpage-app ul",
          "#longpage-app h2",
          "#longpage-app h3",
          "#longpage-app h4",
        ];
        $(observedSelectors.join(", ")).each(function (i, val) {
          let attr = $(this).attr("id");
          if (typeof attr === typeof undefined || attr === false) {
            $(this)
              .attr("id", "paragraph-" + pCounter)
              .addClass("longpage-paragraph");
            pCounter++;
          }
          observer.observe(document.querySelector("#" + $(this).attr("id")));
        });
      }
    },

    percentageSeen: function (id) {
      let element = document.getElementById(id);
      // Get the relevant measurements and positions
      const viewportHeight = window.innerHeight;
      const scrollTop = window.scrollY;
      const elementOffsetTop = element.offsetTop;
      const elementHeight = element.offsetHeight;

      // Calculate percentage of the element that's been seen
      const distance = scrollTop + viewportHeight - elementOffsetTop;
      const percentage = Math.round(
        distance / ((viewportHeight + elementHeight) / 100)
      );

      // Restrict the range to between 0 and 100
      return Math.min(100, Math.max(0, percentage));
    },

    /** Detailed but slow method to estimate the portion of an element that is visble with the viewport. */
    get: function (element) {
      if (typeof element !== "object" || !(element instanceof HTMLElement))
        throw new Error("No valid HTMLElement.");
      const b = element.getBoundingClientRect();
      const vpw = window.innerWidth || document.documentElement.clientWidth;
      const vph = window.innerHeight || document.documentElement.clientHeight;
      let e = {
        element: element,
        dimensions: {
          height: b.height,
          width: b.width,
        },
        viewport: {
          width: vpw,
          height: vph,
        },
        position: {
          top: b.top,
          left: b.left,
          right: b.right,
          bottom: b.bottom,
          centerX: b.right + b.width / 2,
          centerY: b.top + b.height / 2,
        },
        fullyInsideVP:
          b.top >= 0 && b.bottom <= vph && b.left >= 0 && b.right <= vpw
            ? true
            : false,
        isHidden: false, //this._isHidden(),
        visibility: 0,
      };

      if (!e.isHidden) {
        let px = 0;
        for (let y = 0; y < Math.floor(b.height); y++) {
          const posY = b.top + y;
          for (let x = 0; x < Math.floor(b.width); x++) {
            const posX = b.left + x;
            if (posX >= 0 && posX <= vpw && posY >= 0 && posY <= vph) {
              let elem = document.elementFromPoint(posX, posY);
              if (elem !== null && elem === element) px++;
            }
          }
        }
        e.visibility = px / (Math.floor(b.width) * Math.floor(b.height));
        e.visibility = Number(e.visibility.toFixed(2));
      }
      return e;
    },

    visualizeReadingProgress: function () {
      let _this = this;
      ajax.call([
        {
          methodname: "mod_longpage_get_reading_progress",
          args: {
            courseid: _this.context.courseId,
            longpageid: _this.context.longpageid,
          },
          done: function (reads) {
            try {
              let data = Object.values(JSON.parse(reads.response));
              let max_arr = data.map(function (d) {
                return d.count;
              });
              let max = max_arr.reduce((a, b) => Math.max(a, b), -Infinity);
              for (var i = 0; i < data.length; i++) {
                //console.log(...$("#" + data[i].section).contents());
                if ($("#" + data[i].section)) {
                  // let arr = new Array();

                  // arr.push(...$("#" + data[i].section).contents());
                  // let store = [...$("#"+data[i].section).contents()];
                  // console.log(arr);

                  $("#longpage-main #" + data[i].section).wrap("<div class='wrapper'></div>");
                  // $(".wrapper").find("#" + data[i].section).append($("<span></span>")
                  //     .attr(
                  //       "title",
                  //       "Der Abschnitt wurde bislang " +
                  //         data[i].count +
                  //         " mal gelesen"
                  //     )
                  //     .addClass(
                  //       "reading-progress progress-" +
                  //         Math.ceil((data[i].count / max) * 5)
                  //     ))
                  $("#longpage-main #" + data[i].section).parent().append(
                    $("<span></span>")
                      .attr(
                        "title",
                        "Der Abschnitt wurde bislang " +
                          data[i].count +
                          " mal gelesen"
                      )
                      .addClass(
                        "reading-progress progress-" +
                          Math.ceil((data[i].count / max) * 5)
                      )
                  );
                  if (_this.debug) {
                    $("#longpage-main #" + data[i].section).append(
                      $(
                        '<span style="position:absolute; right:-40px; font-size:8px; background-color:red; padding:1px 2px; color:#fff;">' +
                          data[i].section.replace("longpage-paragraph-", "") +
                          "</span>"
                      )
                    );
                  }
                } else {
                  console.log("Section not found", data[i].section);
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
    },
    // visualizeReadingProgress: function () {
    //     let _this = this;
    //     ajax.call([{
    //         methodname: 'mod_longpage_get_reading_progress',
    //         args: { data: { courseid: this.context.courseid, pageid: this.context.pageid } },
    //         done: function (reads) {
    //             try {
    //                 let data = Object.values(JSON.parse(reads.response));
    //                 let max_arr = data.map(function (d) { return d.count; });
    //                 let max = max_arr.reduce((a, b) => Math.max(a, b), -Infinity);

    //                 for (var i = 0; i < data.length; i++) {
    //                     if ($('#' + data[i].section)) {
    //                         // console.log('section', data[i])
    //                         $('#' + data[i].section).append(
    //                             $('<span></span>')
    //                                 .attr('title', 'Der Abschnitt wurde bislang ' + data[i].count + ' mal gelesen')
    //                                 .addClass('reading-progress progress-' + Math.ceil(data[i].count / max * 5))
    //                         );
    //                         if (_this.debug) {
    //                             $('#' + data[i].section).append(
    //                                 $('<span style="position:absolute; right:-40px; font-size:8px; background-color:red; padding:1px 2px; color:#fff;">' + data[i].section.replace('longpage-paragraph-', '') + '</span>')
    //                             );
    //                         }

    //                     } else {
    //                         console.log('Section not found', data[i].section)
    //                     }

    //                 }
    //             } catch (e) { console.log(e) }
    //         },
    //         fail: function (e) { console.error('fail', e); }
    //     }]);
    // },
  },
};
</script>

<style>
</style>