'use strict';


// Declare app level module which depends on filters, and services
angular.module('metadata', ['ui.event', 'metadata.controllers', 'metadata.directives','elasticjs.service','ui.bootstrap','$strap.directives','bootstrap']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/:instance/home', {templateUrl: 'partials/home.html', controller: 'home'});
    $routeProvider.when('/:instance/details/:frame/:id', {templateUrl: 'partials/new.html', controller: 'details'});
	$routeProvider.when('/:instance/new', {templateUrl: 'partials/new.html', controller: 'new'});
    $routeProvider.otherwise({redirectTo: '/metadata_data/home'});
  }]);

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.com/#x15.4.4.19
if (!Array.prototype.map) {
  Array.prototype.map = function(callback, thisArg) {
 
    var T, A, k;
 
    if (this == null) {
      throw new TypeError(" this is null or not defined");
    }
 
    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);
 
    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;
 
    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }
 
    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (thisArg) {
      T = thisArg;
    }
 
    // 6. Let A be a new array created as if by the expression new Array(len) where Array is
    // the standard built-in constructor with that name and len is the value of len.
    A = new Array(len);
 
    // 7. Let k be 0
    k = 0;
 
    // 8. Repeat, while k < len
    while(k < len) {
 
      var kValue, mappedValue;
 
      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {
 
        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[ k ];
 
        // ii. Let mappedValue be the result of calling the Call internal method of callback
        // with T as the this value and argument list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);
 
        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor {Value: mappedValue, : true, Enumerable: true, Configurable: true},
        // and false.
 
        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });
 
        // For best browser support, use the following:
        A[ k ] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }
 
    // 9. return A
    return A;
  };      
}

if ( !Array.prototype.forEach ) {
  Array.prototype.forEach = function(fn, scope) {
    for(var i = 0, len = this.length; i < len; ++i) {
      fn.call(scope, this[i], i, this);
    }
  }
}
Object.keys = Object.keys || (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !{toString:null}.propertyIsEnumerable("toString"),
        DontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
        ],
        DontEnumsLength = DontEnums.length;
  
    return function (o) {
        if (typeof o != "object" && typeof o != "function" || o === null)
            throw new TypeError("Object.keys called on a non-object");
     
        var result = [];
        for (var name in o) {
            if (hasOwnProperty.call(o, name))
                result.push(name);
        }
     
        if (hasDontEnumBug) {
            for (var i = 0; i < DontEnumsLength; i++) {
                if (hasOwnProperty.call(o, DontEnums[i]))
                    result.push(DontEnums[i]);
            }   
        }
     
        return result;
    };
})();
(function() {

var d = window.Date,
    //regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})(?:Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;
	regexIso8601 =/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;

/*if (d.parse('2011-11-29T15:52:30.5') !== 1322581950500 ||
    d.parse('2011-11-29T15:52:30.52') !== 1322581950520 ||
    d.parse('2011-11-29T15:52:18.867') !== 1322581938867 ||
    d.parse('2011-11-29T15:52:18.867Z') !== 1322581938867 ||
    d.parse('2011-11-29T15:52:18.867-03:30') !== 1322594538867 ||
    d.parse('2011-11-29') !== 1322524800000 ||
    d.parse('2011-11') !== 1320105600000 ||
    d.parse('2011') !== 1293840000000) {
		*/
    d.__parse = d.parse;

    d.parse = function(v) {

        var m = regexIso8601.exec(v);

        if (m) {
            return Date.UTC(/*
                m[1],
                (m[2] || 1) - 1,
                m[3] || 1,
                m[4] - (m[8] ? m[8] + m[9] : 0) || 0,
                m[5] - (m[8] ? m[8] + m[10] : 0) || 0,
                m[6] || 0,
                ((m[7] || 0) + '00').substr(0, 3)*/
				+m[1], +m[2] - 1, +m[3], +m[4],+m[5], +m[6]
            );
        }

        return d.__parse.apply(this, arguments);

    };
	//}

d.__fromString = d.fromString;

d.fromString = function(v) {

    if (!d.__fromString || regexIso8601.test(v)) {
        return new d(d.parse(v));
    }

    return d.__fromString.apply(this, arguments);
};

})();