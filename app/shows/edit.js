function(doc, req) {
   // !json templates
   var Mustache = require("lib/mustache");
log(templates);
  // we only show html
  return Mustache.render(templates.edit, doc, templates.partials);
}