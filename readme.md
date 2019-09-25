

Longpage is a moodle plugin for representing longer HTML pages. It provides a table of content, a full-text search and comes with a reading-friendly design. 

The plugin ist based on the page module which is delivered with every moodle.

# Features
- generates a table of content frome the HTML strcture (headings)
- enables a full-text search by using *lunr*
- tracks scrolling events and saves them in the database

# Installation
* clone the repository and rename the folder to 'page'.
* copy the page folder in your moodle inside the 'mod' folder
* Have a look at the administration area unter 'Notification' and follow the update procedure
* Inside a course you can add a long page as an activity called 'Page'

# Dependencies
* vue.js
* elasticlunr
* d3.js

# Roadmap
- measure reading time for sections and subsections
- enabled text highlighting
- enable social media support, e.g. send with WhatsApp
- visualize paragraphs that have been read already
- make font-size, line-height, contrast configurable
- adaptively present recomonadations for related courses by considering past enrolments and semantic textual similarity