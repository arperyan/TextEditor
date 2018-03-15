// require.config({
//  paths: {
//    quill: "https://cdn.quilljs.com/1.3.5/quill"
//   }
// });

define( ["qlik", "angular", "qvangular", "jquery", "./quill", "css!./style.css","css!./bubble.css"],
function (qlik, angular, qvangular, $, Quill) {
  'use strict';
  var $timeout = qvangular.getService( "$timeout" );

  return {
    definition: {
      type: "items",
      component: "accordion",
      items: {
        settings: {
          uses: "settings",
          type: "items",
          items: {
            Texts: {
              ref: "quill.text",
              type: "object",
              show: false
            },
            Selection: {
              ref: "quill.selection",
              type: "object",
              show: false
            }
          }
        }
      }
    },
    snapshot: {
      canTakeSnapshot: true,
      export: true
    },
    controller: function($scope, $element){
      $scope.vm = {};
      $scope.vm.enigmaModel = $scope.component.model;
      $scope.vm.changed = false;
      $scope.vm.isEditMode = function() {
        return (qlik.navigation.getMode() === "edit");
      }
      $scope.vm.getSize = function() {
        return {
          height: $element.height(),
          width: $element.width()
        };
      }

      $element.closest(".qv-inner-object").css("overflow", "visible");

      var toolbarOptions = [
          ['bold', 'italic', 'underline'],                  // toggled buttons
          ['code-block'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          [{ 'align': [] }],                  // outdent/indent
          ['link','video','image'],
          [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'font': [] }],
          [{ 'color': [] }, { 'background': [] },'clean']          // dropdown with defaults from theme
      ];
      $scope.editor = new Quill($element[0], {
          modules: {
            toolbar: toolbarOptions
        },
        scrollingContainer: '#scrolling-container',
        placeholder: 'Compose an epic...',
        theme: 'bubble'
      });
      $scope.editor.on('text-change', function(delta, oldContents){
        //console.log('text-change', delta);
        $scope.vm.changed = true; // track change

      //   var currentContents = $scope.editor.getContents()
      //   var selection = $scope.editor.getSelection()
      //   var patchDefs = [
      //     {
      //       qOp: "replace",
      //       qPath: "/quill/text",
      //       qValue: JSON.stringify(currentContents)
      //     },
      //     {
      //       qOp: "replace",
      //       qPath: "/quill/selection",
      //       qValue: JSON.stringify(selection)
      //     }
      //   ]
      //   // if(typeof $scope.textChangeTimeoutFn !== "undefined"){
      //   //   console.log('Cancelling timeout');
      //   //   $timeout.cancel($scope.textChangeTimeoutFn)
      //   //   delete $scope.textChangeTimeoutFn;
      //   // }
      //   // console.log('setting timeout');
      //   // $scope.textChangeTimeoutFn = $timeout(function(){
      //   //   console.log('executing timeout');
      //   //   $scope.backendApi.applyPatches(patchDefs, false)
      //   // },2000)
      //   $timeout(function(){
      //     console.log('executing timeout', $scope);
      //     $scope.vm.enigmaModel.applyPatches(patchDefs, false);
      //     $scope.vm.enigmaModel.emit("changed");
      //   }, 200);

      });

      $scope.vm.saveChanges = function() {
        var currentContents = $scope.editor.getContents()
        var selection = $scope.editor.getSelection()
        //console.log('saveChanges', $scope.vm.changed, currentContents, selection);
        if ($scope.vm.changed) { // store only when text changed
          var patchDefs = [
            {
              qOp: "replace",
              qPath: "/quill/text",
              qValue: JSON.stringify(currentContents)
            },
            {
              qOp: "replace",
              qPath: "/quill/selection",
              qValue: JSON.stringify(selection)
            }
          ]        
          $scope.vm.enigmaModel.applyPatches(patchDefs, false);
          $scope.vm.changed = false;
        }
      }

      if ($scope.layout.quill.text) {
        $scope.editor.setContents($scope.layout.quill.text.ops, 'silent');
      }

      $element.on('click', function(e) {        
        if (!$scope.editor.hasFocus()) {
          $scope.editor.focus();
        }
      });


      $scope.$watch("vm.isEditMode()", function(newValue, oldValue) {
        //console.log("watch vm.isEditMode()", newValue, oldValue);
        if (newValue) {
          $scope.vm.changed = false;
          $timeout(function() {
            $element.html($scope.editor.enable());
            $scope.editor.setSelection($scope.layout.quill.selection);
            $scope.editor.focus();
          }, 200);
        } else if (oldValue === true && newValue === false) {
          $timeout(function() {
            $element.html($scope.editor.enable(false));
          }, 200);
          $scope.vm.saveChanges();
        } else {
          // in all other cases
          $timeout(function() {
            $element.html($scope.editor.enable(false));
          }, 200);
        }
      });

      $scope.$watch("vm.getSize()", function(newValue, oldValue) {
        //console.log("watch vm.getSize()", newValue, oldValue);
        if ($scope.vm.isEditMode()) {
          $timeout(function() {
            $scope.editor.focus();
          }, 200);
        }
      }, true);
     }
    
    //,
    // paint: function($element,layout) {
    //   console.log("paint");
    //   if(layout.quill.text !== "" && layout.quill.text!=null){
    //     console.log(layout.quill);
    //     this.$scope.editor.setContents(layout.quill.text.ops, 'silent')
    //   }
    //   if(layout.quill.selection !== "" && layout.quill.selection!=null){
    //     //var parentscope = angular.element($element).scope().$parent.$parent;
    //     //$element.html(parentscope.editmode ? this.$scope.editor.enable() : this.$scope.editor.enable(false));
    //     $element.html(isEditMode() ? this.$scope.editor.enable() : this.$scope.editor.enable(false));
    //     this.$scope.editor.setSelection(layout.quill.selection)
    //   }
    // }
  }
});
