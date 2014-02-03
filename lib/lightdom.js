var lightdom = {},
    attributeMap = {},
    extractAttrs,
    elements,
    excludes;

// Element names for light DOM. Syntax: name[:attr]*(,name[:attr]*)*
var elementNames = "h1,h2,h3,h4,p,ul,ol,li,img:title:src:width:height,blockquote," +
    "a:href:title,b,strong,i,em,br";
var excludeNames = "script,noscript,style,iframe";

// Extract required attributes from element name
extractAttrs = function(e) {
  var attributes = e.split(':');
  if (attributes.length > 1) {
    attributeMap[attributes[0]] = attributes.slice(1);
  }
  return attributes[0];
};

var elements = elementNames.split(',').map(extractAttrs);
var excludes = excludeNames.split(',');

/**
 * Extract a light DOM with elements and attributes of intrests
 *
 * @param {lightNode} node
 */
lightdom.build = function(node) {
  if (!node) {
    return [];
  }
  if (node.nodeType === node.TEXT_NODE) {
    if (!node.data.match(/^\s+$/)) {
      return [{type: 't', data: node.data}];
    }
    return [];
  };

  var name = node.nodeName.toLowerCase(), children = [], e;
  if (excludes.indexOf(name) >= 0) {
    return [];
  } else if (elements.indexOf(name) >= 0) {
    e = {type: 'e', name: name, children: [], attrs: {}};
    // Catch required attributes
    if (attributeMap[name]) {
      for (var i = 0, len = attributeMap[name].length; i < len; i++) {
        var a = attributeMap[name][i];
        e.attrs[a] = node.getAttribute(a);
      }
    }
  }

  // Traverse children recursivly
  for (var i = 0, len = node.childNodes.length; i < len; i++) {
    var child = lightdom.build(node.childNodes[i]);
    children = children.concat(child);
  }

  if (e) {
    e.children = e.children.concat(children);
    return [e];
  }
  return children;
};

/**
 * @param {object|Array} lightNode
 * @param {function} fn Walker function fn(lightNode). If walker function returns
 * false, the walker does not evaluate child nodes of the current node.
 */
lightdom.walk = function(lightNode, fn) {
  if (!lightNode) {
    return;
  }
  // Array iteration
  if (typeof lightNode === 'object' && 'length' in lightNode) {
    for (var i = 0, len = lightNode.length; i < len; i++) {
      lightdom.walk(lightNode[i], fn);
    }
    return;
  }
  var result = fn(lightNode);
  if (result === false || !lightNode.children) {
    return;
  }

  for (var i = 0, len = lightNode.children.length; i < len; i++) {
    lightdom.walk(lightNode.children[i], fn);
  }
};

lightdom.text = function(lightNode) {
  if (typeof lightNode === 'object' && ('length' in lightNode)) {
    var s = '';
    for (var i = 0, len = lightNode.length; i < len; i++) {
      s += lightdom.text(lightNode[i]);
    }
    return s;
  }
  if (lightNode.type === 't') {
    return lightNode.data;
  } else if (lightNode.type === 'e') {
    return lightdom.text(lightNode.children);
  }
};

lightdom.html = function(lightNode) {
  var singleNames = "br,img".split(':');
  if (typeof lightNode === 'object' && ('length' in lightNode)) {
    var s = '';
    for (var i = 0, len = lightNode.length; i < len; i++) {
      s += lightdom.html(lightNode[i]);
    }
    return s;
  }
  if (lightNode.type === 't') {
    return lightNode.data;
  } else if (lightNode.type === 'e') {
    var s = '<' + lightNode.name;
    for (var a in lightNode.attrs) {
      if (lightNode.attrs.hasOwnProperty(a) && lightNode.attrs[a]) {
        s += ' ' + a + '="' + lightNode.attrs[a] + '"';
      }
    }
    if (singleNames.indexOf(lightNode.name) >= 0) {
      return s + ' />';
    }
    return s + '>' + lightdom.html(lightNode.children) + '</' + lightNode.name + '>';
  }
  return '';
};

module.exports = lightdom;

