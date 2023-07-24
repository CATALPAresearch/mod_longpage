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
    
function resizeAllDragsAndDrops() {
  $(".ddimageortext").find(".draghomes > div").each(function (i, node) {
    resizeAllDragsAndDropsInGroup(
      getClassnameNumericSuffix($(node), "dragitemgroup"),
      $(".ddimageortext")
    );
  });
}

//modified from ddimageortext / question.js
function resizeAllDragsAndDropsInGroup(group, root) {
  var dragHomes = root.find(".dragitemgroup" + group + " .draghome"),
    maxWidth = 0,
    maxHeight = 0;
  // Find the maximum size of any drag in this groups.
  dragHomes.each(function (i, drag) {
    maxWidth = Math.max(maxWidth, Math.ceil(drag.offsetWidth));
    maxHeight = Math.max(maxHeight, Math.ceil(drag.offsetHeight));
  });

  // The size we will want to set is a bit bigger than this.
  maxWidth += 10;
  maxHeight += 10;

  // Set each drag home to that size.
  dragHomes.each(function (i, drag) {
    var left = Math.round((maxWidth - drag.offsetWidth) / 2),
      top = Math.floor((maxHeight - drag.offsetHeight) / 2);
    // Set top and left padding so the item is centred.
      
     $(drag).css({
      "padding-left": left + "px",
      "padding-right": maxWidth - drag.offsetWidth - left + "px",
      "padding-top": top + "px",
      "padding-bottom": maxHeight - drag.offsetHeight - top + "px",
     });

    root
      .find(".dropzone.place" + i + ".group" + group)
      .width(maxWidth - 12)
      .height(maxHeight - 12);
  });
}

function resizeOnce()
{
  var observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        resizeAllDragsAndDrops();
        observer.unobserve(document.documentElement);
      }
    });
  });
  
  observer.observe(document.documentElement);
}

function moveOnce()
{
  var observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        $(".ddimageortext").find(".draghomes").prependTo($(".ddimageortext").find(".ddarea"));
        observer.unobserve(document.documentElement);
      }
    });
  });
  
  observer.observe(document.documentElement);
}

