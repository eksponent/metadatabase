/*jshint globalstrict:true */
/*global angular:true */
/*global Modernizr:true */
'use strict';
angular.module('metadata.directives', [])

.directive('placeholder', ['$timeout',
    function($timeout) {

        if (Modernizr.input.placeholder === true) return {};
        return {
            link: function(scope, elm, attrs) {
                if (attrs.type === 'password') return;
                elm.addClass('placeholder');
                $timeout(function() {
                    elm.val(attrs.placeholder).bind('focus', function() {
                        elm.removeClass('placeholder');
                        if (elm.val() == elm.attr('placeholder')) {
                            elm.val('');

                        } else {

                        }
                    }).bind('blur', function() {
                        if (elm.val() === '') {
                            elm.val(elm.attr('placeholder'));
                            elm.addClass('placeholder');
                        } else {
                            elm.removeClass('placeholder');


                        }
                    });
                });
            }
        };
    }
]);