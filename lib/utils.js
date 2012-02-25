
function unifyProperties(source, dest) {
  for (var p in source) {
    eval("dest."+p+"=source."+p)
   }	
}

function getTypeName(obj) {
  var funcNameRegex = /function (.{1,})\(/
  , results = (funcNameRegex).exec(obj.constructor.toString());
  return (results && results.length > 1) ? results[1] : ""
}

exports.unifyProperties = unifyProperties
exports.getTypeName = getTypeName