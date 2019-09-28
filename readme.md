

Longpage is a moodle plugin for representing longer HTML pages. It provides a table of content, a full-text search and comes with a reading-friendly design. 

The plugin ist based on the page module which is delivered with every moodle.

# Features
- generates a table of content frome the HTML strcture (headings)
- enables a full-text search by using *lunr*
- tracks scrolling events using the (InteractionObserver)[https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API]
- measure reading time for a page

# Installation
* clone the repository and rename the folder to 'page'.
* copy the page folder in your moodle inside the 'mod' folder
* Have a look at the administration area unter 'Notification' and follow the update procedure
* Inside a course you can add a long page as an activity called 'Page'

# Dependencies
* vue.js
* elasticlunr http://elasticlunr.com/docs/index.html, https://github.com/weixsong/lunr-languages
* d3.js

# Roadmap
- measure reading time for sections and subsections
- determine readability
- hightlight current section in the table of content, http://localhost/active-menu-link/example/index.html#first
- enabled text highlighting: 
 - https://github.com/s010s/vue-text-selection
 - http://annotatorjs.org/
- enable social media support, e.g. send with WhatsApp
- visualize paragraphs that have been read already
- make font-size, line-height, contrast configurable
- adaptively present recomonadations for related courses by considering past enrolments and semantic textual similarity

# Alternatives
- Search: https://fusejs.io/