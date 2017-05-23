'use strict';
var socket = io(API_SOCKET);
var playAudioTrack;
var isTrackPlay = false;
var __s_oSoundtrack_loop;

var limitAudioDuration = 600; // in sec
// app to send the contact forms
//var conductorApp = angular.module('app', [ "ngRoute", "restangular",'conductorAppControllers'] );
//conductorApp.config( AppRouteProvider ).run( AppRunner );

angular.module('app', [ "ngRoute", "restangular", "rzModule"] );
angular.module('app').config( AppRouteProvider ).run( AppRunner );

//conductorApp.config(['$routeProvider',
//    function($routeProvider) {
//        $routeProvider
//            .when( '/groups/:code',     { templateUrl: './html/conductor/groups-list.html',     controller: 'GroupController' })
//            .when( '/songs',      { templateUrl: './html/conductor/songs-list.html',      controller: 'SongController' } )
//            .when( '/songs/:id',  { templateUrl: './html/conductor/songs-details.html',      controller: 'SongDetailsController' } )
//            .when( '/recordings', { templateUrl: './html/conductor/recordings-list.html', controller: 'RecordController' } )
//            .when( '/recordings/:rid', { templateUrl: './html/conductor/recordings-details.html', controller: 'RecordDetailsController' } )
//            .otherwise({
//                redirectTo: '/songs'
//            });
//    }]);
//var conductorAppControllers = angular.module('conductorAppControllers', []);
//
//conductorAppControllers.factory('Instrument',      ['Restangular', InstrumentModel ]  );
//conductorAppControllers.factory('Group',     ['Restangular', GroupModel ]  );
//conductorAppControllers.factory('Song',      ['Restangular', SongModel ]  );
//conductorAppControllers.factory('Member',    ['Restangular', MemberModel ]  );
//conductorAppControllers.factory('Recording', ['Restangular', RecordingModel ]  );
//
//conductorAppControllers.controller('GroupController',     ['$scope','$routeParams', '$rootScope', '$http', 'Group', 'Instrument', GroupController]  );
//conductorAppControllers.controller('RecordController',    ['$scope', '$rootScope', '$http', 'Recording',    RecordController ] );
//conductorAppControllers.controller('RecordDetailsController',    ['$scope',  '$routeParams', '$rootScope', '$http', 'Recording', RecordDetailsController ] );
//conductorAppControllers.controller('SongController',      ['$scope', '$rootScope', '$http', 'Group', 'Song', SongController ] );
//conductorAppControllers.controller('SongDetailsController', ['$scope', '$routeParams', '$rootScope', '$http', 'Group', 'Song', 'Member', 'Recording', SongDetailsController ] );

angular.module('app').factory('Instrument',      ['Restangular', InstrumentModel ]  );
angular.module('app').factory('Group',     ['Restangular', GroupModel ]  );
angular.module('app').factory('Song',      ['Restangular', SongModel ]  );
angular.module('app').factory('Member',    ['Restangular', MemberModel ]  );
angular.module('app').factory('Recording', ['Restangular', RecordingModel ]  );


angular.module('app').controller('GroupLoginController',     ['$location', '$scope','$routeParams', '$rootScope', '$http', 'Group', 'Instrument', GroupLoginController]  );
angular.module('app').controller('GroupController',     ['$location', '$scope','$routeParams', '$rootScope', '$http', 'Group', 'Instrument', GroupController]  );
angular.module('app').controller('RecordController',    ['$location', '$scope', '$rootScope', '$http', 'Recording',    RecordController ] );
angular.module('app').controller('RecordDetailsController',    ['$location', '$scope',  '$routeParams', '$rootScope', '$http', 'Recording', RecordDetailsController ] );
angular.module('app').controller('SongController',      ['$location', '$scope', '$rootScope', '$http', 'Group', 'Song', SongController ] );
angular.module('app').controller('SongDetailsController', ['$location', '$scope', '$routeParams', '$rootScope', '$http', 'Group', 'Song', 'Member', 'Recording', SongDetailsController ] );

function __log  ( x ) {
    console.log( x );
    var d = new Date();
    var pad3 = function(x) { return (( x > 100 ) ? x : "0" + ( x >= 10 ? x : "0" + x )); };
    jQuery("#output").prepend( d.toUTCString() + "." + pad3( d.getMilliseconds()) + " - " + JSON.stringify( x ) + "\n" );
};


function supportsAudio() {
    var a = document.createElement('audio');
    return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
}


function GroupModel( Restangular ) {
    this.promise = {
        to : {
            get : function ( params ) {
                console.log( "Geting group #" + params );
                return Restangular.all('groups').getList( params );
            },
            read : function ( id ) {
                console.log( "Reading group #" + id );
                return Restangular.one('groups', id).get();
            },
            destroy : function( id ) {
                return Restangular.one('groups', id).remove();
            },
            put : function( form ) {
                return Restangular.all('groups').put( form );
            },
            save : function( id, form ) {
                return Restangular.one('groups', id).customPOST( form );
            }
        }
    };
    return this;
}

function SongModel( Restangular ) {

    this.promise = {
        to : {
            get : function ( params ) {
                var sGroupId = localStorage.getItem("selectedGroup");
                return Restangular.one( 'groups', sGroupId ).all('songs').getList( params );
            },
            read : function ( id ) {
                var sGroupId = localStorage.getItem("selectedGroup");
                return Restangular.one( 'groups', sGroupId ).one('songs', id).get();
            },
            destroy : function( id ) {
                var sGroupId = localStorage.getItem("selectedGroup");
                return Restangular.one( 'groups', sGroupId ).one('songs', id).remove();
            },
            put : function( form ) {
                var sGroupId = localStorage.getItem("selectedGroup");
                return Restangular.one( 'groups', sGroupId ).all('songs').post( form );
            },
            save : function( id, form ) {
                var sGroupId = localStorage.getItem("selectedGroup");
                return Restangular.one( 'groups', sGroupId ).one('songs', id).customPOST( form );
            }
        }
    };
    return this;
}

function MemberModel( Restangular ) {
    this.promise = {
        to : {
            get : function ( params ) {
                var sGroupId = localStorage.getItem("selectedGroup");
                return Restangular.one( 'groups', sGroupId ).all('members').getList( params );
            },
            read : function ( id ) {
                var sGroupId = localStorage.getItem("selectedGroup");
                return Restangular.one( 'groups', sGroupId ).one('members', id).get();
            },
            destroy : function( id ) {
                var sGroupId = localStorage.getItem("selectedGroup");
                return Restangular.one( 'groups', sGroupId ).one('members', id).remove();
            },
            put : function( form ) {
                var sGroupId = localStorage.getItem("selectedGroup");
                return Restangular.one( 'groups', sGroupId ).all('members').post( form );
            },
            save : function( id, form ) {
                var sGroupId = localStorage.getItem("selectedGroup");
                return Restangular.one( 'groups', sGroupId ).one('members', id).customPOST( form );
            }
        }
    };
    return this;
}

function InstrumentModel( Restangular ) {
    this.promise = {
        to : {
            get : function ( params ) {
                return Restangular.all('instruments').getList( params );
            }
        }
    };
    return this;
}


function RecordingModel( Restangular ) {

    this.promise = {
        to : {
            get : function ( params ) {
                var sGroupId = localStorage.getItem("selectedGroup");
                return Restangular.one( 'groups', sGroupId ).all('recordings').getList( params );
            },
            read : function ( id ) {
                var sGroupId = localStorage.getItem("selectedGroup");
                return Restangular.one( 'groups', sGroupId ).one('recordings',id).get();
            },
            destroy : function( id ) {
                var sGroupId = localStorage.getItem("selectedGroup");
                return Restangular.one( 'groups', sGroupId ).one('recordings',id).remove();
            },
            start : function ( sSongId ) {
                var sGroupId = localStorage.getItem("selectedGroup");
                return Restangular.one( 'groups', sGroupId ).one('songs', sSongId ).all('recordings').post( {} );
            },
            stop : function( sRecordingId ) {
                var sGroupId = localStorage.getItem("selectedGroup");
                return Restangular.one( 'groups', sGroupId ).one('recordings', sRecordingId ).customPOST( { Status : "Stopped" });
            }
        }
    };
    return this;
}


function GroupLoginController( $location, $scope, $routeParams, $rootScope, $http, Group, Instrument ) {
    var hash = window.location.hash.substring(2);
    if (hash !== "recordings"){
        if (playAudioTrack){
            $rootScope.pauseAudio()
        }
    }
    $rootScope.PauseAudio = isTrackPlay;
    $rootScope.loading = false;
    $scope.loading = false;
    $scope.error = "";
    $scope.form = {};
    $rootScope.ConductorLogin = false;
    console.log('LoginConductorController init');
    jQuery(".app-content").show();
    $scope.logOut =  function() {
        console.log('logOut');
        $rootScope.ConductorLogin = false;
        localStorage.removeItem("groupCode");
        localStorage.removeItem("selectedGroup");
        localStorage.removeItem("selectedGroupName");
        $location.path('/login');
    };
    $rootScope.pauseAudio =  function() {
        console.log('pause');
        $('.pause-audio').hide();
        $rootScope.PauseAudio = isTrackPlay = false;
        playAudioTrack.pause();
    };

    $scope.canBeSubmitted = function() {
        return $scope.form.logincode;
    };

    $scope.submit = function ( loginCode ) {
        console.log('click');
        console.log(loginCode ? loginCode : $scope.form.logincode);
        $scope.loading = true;
        $scope.error = '';
        $http({
            method: 'POST',
            url: API_ROOT + "/oauthGroup/token",
            data: $.param( {
                "logincode": loginCode ? loginCode : $scope.form.logincode
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
            .success(function (data, status, headers, config) {
                console.log(data);
                $rootScope.ConductorLogin = true;
                if ( data.LoginCode ) {
                    var sHref = 'index.html#/groups';
                    setTimeout( function() { window.location.href = sHref+'/'+ data.LoginCode; }, 200 );
                } else {
                    $scope.loading = false;
                }
            })
            .error(function (data, status, headers, config) {
                if ( data.error ) { $scope.error = data.error; }
                else if ( data.errors ) { $scope.error = data.errors.message; }
                else if ( data.status === 'failure') {
                    $scope.error = "LoginCode is not valid";
                }
                if ( typeof( $scope.error ) === "string" ) {
                    $scope.errors = [ $scope.error ];
                }
                $scope.loading = false;
            });
    };
    var mi = localStorage.getItem("groupCode");
    if (mi !== undefined && mi !== "undefined" && mi !== "" && mi !== null && mi !== "null") {
        console.log('groupCode');
        $scope.submit($rootScope.groupCode);
    }

}

function GroupController( $location, $scope, $routeParams, $rootScope, $http, Group, Instrument ) {
    var hash = window.location.hash.substring(2);
    if (hash !== "recordings"){
        if (playAudioTrack){
            $rootScope.pauseAudio()
        }
    }
    $rootScope.PauseAudio = isTrackPlay;
    $rootScope.loading = false;
console.log('$routeParams:',$routeParams);
    $rootScope.groupCode = $routeParams.code;
    $('a[href="#/groups"]').attr('href','#/groups/'+$rootScope.groupCode);
    localStorage.setItem( "groupCode", $routeParams.code);
    $scope.logOut =  function() {
        console.log('logOut');
        $('#modalByLogout').modal('hide');
        $rootScope.ConductorLogin = false;
        localStorage.removeItem("groupCode");
        localStorage.removeItem("selectedGroup");
        localStorage.removeItem("selectedGroupName");
        $location.path('/login');
    };
    $rootScope.pauseAudio =  function() {
        console.log('pause');
        $('.pause-audio').hide();
        $rootScope.PauseAudio = isTrackPlay = false;
        playAudioTrack.pause();
    };

    $scope.select = function( g ) {
        $rootScope.selectedGroup = g._id;
        $rootScope.selectedGroupName = g.Name;
        localStorage.setItem( "selectedGroup", $rootScope.selectedGroup );
        localStorage.setItem( "selectedGroupName", $rootScope.selectedGroupName );
    };
    $scope.update = function( g, field ) {
        var form = {};
        form[ field ] = g[ field ];
        Group.promise.to.save( $rootScope.selectedGroup, form );
    };
    $scope.newInvitationCode = function( g ) {
        var form = {};
        g.InvitationCode = Math.random().toFixed(6).replace( "0.", "" );
        form.InvitationCode = g.InvitationCode;
        Group.promise.to.save( $rootScope.selectedGroup, form );
    };
    Group.promise.to.get({LoginCode:$rootScope.groupCode}).then( function( data ) {
        console.log(data);
        $scope.groups = data;
        console.log($routeParams.code);
        console.log(data);
        if ( $rootScope.selectedGroup === undefined && $scope.groups.length> 0 ) {
            $scope.select( $scope.groups[0] );
        }
    } );

    Instrument.promise.to.get().then( function( data ) { $scope.instruments = data; });
}

function RecordController( $location, $scope, $rootScope, $http, Recording ) {
    var hash = window.location.hash.substring(2);
    if (hash !== "recordings"){
        if (playAudioTrack){
            $rootScope.pauseAudio()
        }
    }
    $rootScope.PauseAudio = isTrackPlay;
    $scope.formatDate = function(data) {
        var CurrentDate = new Date();
        var differenceDate = CurrentDate.getTime() - new Date(data).getTime();
        if ( differenceDate <= 1000*60*60 || differenceDate < 0) {
            return  jQuery.format.prettyDate(data);
        }else if (differenceDate > 1000*60*60 && differenceDate <= 1000*60*60*24) {
            return $.format.date(data, 'H:mm')
        }else{
            return $.format.date(data, 'd MMM. yyyy, H:mm');
        }
    };
    $scope.logOut =  function() {
        console.log('logOut');
        $rootScope.ConductorLogin = false;
        localStorage.removeItem("groupCode");
        localStorage.removeItem("selectedGroup");
        localStorage.removeItem("selectedGroupName");
        $location.path('/login');
    };
    $rootScope.pauseAudio =  function() {
        console.log('pause');
        $('.pause-audio').hide();
        $rootScope.PauseAudio = isTrackPlay = false;
        playAudioTrack.pause();
    };
    $rootScope.loading = true;
    $('a[href="#/groups"]').attr('href','#/groups/'+ $rootScope.groupCode );
    Recording.promise.to.get().then( function( data ) {
       $scope.recordings = data;
       $rootScope.loading = false;
    });
}


function RecordDetailsController( $location, $scope, $routeParams, $rootScope, $http, Recording ) {
    var hash = window.location.hash.substring(2);
    if (hash !== "recordings"){
        if (playAudioTrack){
            $rootScope.pauseAudio()
        }
    }
    $rootScope.PauseAudio = isTrackPlay;
    $rootScope.loading = true;
    $('a[href="#/groups"]').attr('href','#/groups/'+ $rootScope.groupCode );
    Recording.promise.to.read( $routeParams.rid ).then( function( data ) {
        $scope.object = data;
        $rootScope.loading = false;
    } );
    $scope.logOut =  function() {
        console.log('logOut');
        $rootScope.ConductorLogin = false;
        localStorage.removeItem("groupCode");
        localStorage.removeItem("selectedGroup");
        localStorage.removeItem("selectedGroupName");
        $location.path('/login');
    };
    $rootScope.pauseAudio =  function() {
        console.log('pause');
        $('.pause-audio').hide();
        $rootScope.PauseAudio = isTrackPlay = false;
        playAudioTrack.pause();
    };
    $scope.filesVisible = false;
    $scope.tableStyle = {'width':$('body').width()};

    $scope.nice_audio =  function(track) {
        if (playAudioTrack){
            playAudioTrack.pause();
        }
        console.log(track);
            var basepath = '';
            if ( typeof( track.mp3 ) !== "undefined" ) {
                basepath = track.mp3.substring( track.mp3.indexOf( "/public" )  +  "/public".length );
                if ( typeof( API_STORAGE_ROOT ) !== "undefined" ) {
                    basepath = API_STORAGE_ROOT.substring( 0, API_STORAGE_ROOT.length - 1 ) + basepath;
                }
            } else {

                if ( typeof( track.wav ) === "undefined" ) return basepath;
                basepath = track.wav.substring( track.wav.indexOf( "/public" )  +  "/public".length );
                if ( typeof( API_STORAGE_ROOT ) !== "undefined" ) {
                    basepath = API_STORAGE_ROOT.substring( 0, API_STORAGE_ROOT.length - 1 ) + basepath;
                }
            }
        console.log(basepath);
            if ( typeof( Media ) !== "undefined" ) {
                playAudioTrack = new Media( basepath,
                    function () { console.log("playAudio(): Audio Success"); },
                    function (err) { console.log("playAudio(): Audio Error: " + err); },
                    __s_oSoundtrack_loop
                );
                console.log( "media loaded " + basepath );

                playAudioTrack.setVolume( 1 );
                $('.pause-audio').show();
                $rootScope.PauseAudio = isTrackPlay = true;
                setTimeout( function() {
                    playAudioTrack.play();
                    console.log( "Media: Playing sound "+basepath);
                }, 1000 );

            } else if ( supportsAudio() ) {
                playAudioTrack = new Audio(basepath);
                $('.pause-audio').show();
                $rootScope.PauseAudio = isTrackPlay = true;
                setTimeout( function() {
                    playAudioTrack.play();
                    console.log( "Audio: Playing sound "+basepath);
                }, 1000 );

                console.log( "using Web Api audio" );
            }
    };
    $scope.toggleFiles = function() {
        $scope.filesVisible = !$scope.filesVisible;
        if ( $scope.filesVisible ) {
          setTimeout( function() {
            var copyTextarea = document.querySelector('#files');
            copyTextarea.select();
            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log( "copy to clipboard - " + msg );
            } catch (err) {
                console.log('Oops, unable to copy');
            }
          }, 500 );
        }
    };

    $scope.getFiles = function() {
        var arr = [];
        if ( typeof( $scope.object.tracks ) !== "undefined") {
          for ( var l = 0; l<$scope.object.tracks.length; l ++  ) {
            var t =  $scope.object.tracks[ l ];
            var url = "";
            if ( typeof( t.mp3 ) !== "undefined" ) {
                url = t.mp3;
            } else if ( typeof( t.wav ) !== "undefined" ) {
                url = t.wav;
            }
            if ( url ) {

              var basepath = url.substring( url.indexOf( "/public" )  +  "/public".length );
              if ( typeof( API_STORAGE_ROOT ) !== "undefined" ) {
                  basepath = API_STORAGE_ROOT.substring( 0, API_STORAGE_ROOT.length - 1 ) + basepath;
              } else {
                  basepath = "http://"  + location.hostname  + basepath;
              }
              arr.push( basepath );
            }
          }
        }
        return arr.join("\r\n");
    };

    $scope.downloadFiles = function() {
        var link = document.createElement('a');
        link.download = "channels" + $scope.object._id + ".txt";
        link.href = "data:text/csv," + encodeURIComponent( $scope.getFiles() );
        link.click();
    };

    $scope.destroy = function(){
        $('#modalByDelete').modal('hide');
        Recording.promise.to.destroy( $routeParams.rid ).then( function() {
           location.href = "#/recordings";
        });
    };
    setTimeout( function() {
        switch(window.orientation)
        {
            case -90:
            case 90:
                console.log('landscape');
                $(".col-md-12.table-recording").css('width',$('.ng-scope:nth-child(4)').width()-30);
                break;
            default:
                console.log('portrait');
                $(".col-md-12.table-recording").css('width',$('.ng-scope:nth-child(4)').width()-18);
                break;
        }
    }, 100 );

}


function SongController( $location, $scope, $rootScope, $http, Group, Song ) {
    var hash = window.location.hash.substring(2);
    if (hash !== "recordings"){
        if (playAudioTrack){
            $rootScope.pauseAudio()
        }
    }
    $rootScope.PauseAudio = isTrackPlay;
    $rootScope.loading = false;
    $('a[href="#/groups"]').attr('href','#/groups/'+ $rootScope.groupCode );
    var sGroupId = localStorage.getItem("selectedGroup");
   // if ( !sGroupId ) { window.location.href="#/groups"; return; }
     $scope.group = Group.promise.to.read( sGroupId ).$object;

    $scope.logOut =  function() {
        console.log('logOut');
        $rootScope.ConductorLogin = false;
        localStorage.removeItem("groupCode");
        localStorage.removeItem("selectedGroup");
        localStorage.removeItem("selectedGroupName");
        $location.path('/login');
    };
    $rootScope.pauseAudio =  function() {
        console.log('pause');
        $('.pause-audio').hide();
        $rootScope.PauseAudio = isTrackPlay = false;
        playAudioTrack.pause();
    };
    $scope.select = function( song ) {
        window.location.href="#/songs/" + song._id;
    };
    $scope.object = { newSongs : "" };

    $scope.destroy = function( s ) {
        Song.promise.to.destroy( s._id ).then( function() {
            Song.promise.to.get().then( function( data ) { $scope.songs = data; } );
        });
    };

    $scope.editor = {
      _visible : false,
      isVisible: function() {
        return $scope.editor._visible;
      },
      hide: function() {
        $scope.editor._visible =  false;
        $rootScope.errors = [];
      },
      show: function() {
        $scope.editor._visible = true;
        $rootScope.errors = [];
      },
      submit: function() {
         console.log( { "Name" : $scope.object.newSongs } );
         Song.promise.to.put( { "Name" : $scope.object.newSongs } ).then( function( data ) {
             $scope.object = { newSongs : "" };
             Song.promise.to.get().then( function( data ) { $scope.songs = data; } );
             $scope.editor.hide();
         } );
      }
    };

    Song.promise.to.get().then( function( data ) { $scope.songs = data; } );
}

function SongDetailsController( $location, $scope, $routeParams, $rootScope, $http, Group, Song, Member, Recording) {
    //Slider with selection bar
    var hash = window.location.hash.substring(2);
    if (hash !== "recordings"){
        if (playAudioTrack){
            $rootScope.pauseAudio()
        }
    }
    setTimeout(function(){
        $('.rec-button').sticky({ topSpacing: 30 });
    },250);
    $scope.sliderTime = {
        value: limitAudioDuration,
        options: {
            showSelectionBar: true,
            ceil: 3600,
            floor: 300,
            translate: function (value) {
                    var pad2 = function(x) { return ( x >= 10 ? x : "0" + x ); };
                    var s = value % 60;
                    var m = parseInt( value / 60, 10 );
                    var h = parseInt( m / 60, 10 ); m = m % 60;
                    return pad2( h ) + ":" + pad2(m) + ":" + pad2(s) ;
            },
            onStart: function () {
                $scope.limitAudioDuration = limitAudioDuration = $scope.sliderTime.value;
                var sGroupId = localStorage.getItem("selectedGroup");
                socket.emit("record-start", {"RecordDuration": limitAudioDuration,GroupId:sGroupId} );
            },
            onChange: function () {
                $scope.limitAudioDuration = limitAudioDuration = $scope.sliderTime.value;
                var sGroupId = localStorage.getItem("selectedGroup");
                socket.emit("record-start", {"RecordDuration": limitAudioDuration,GroupId:sGroupId} );
            },
            onEnd: function () {
                $scope.limitAudioDuration = limitAudioDuration = $scope.sliderTime.value;
                var sGroupId = localStorage.getItem("selectedGroup");
                socket.emit("record-start", {"RecordDuration": limitAudioDuration,GroupId:sGroupId} );
            }
        }
    };


    $rootScope.PauseAudio = isTrackPlay;
    $rootScope.loading = false;
    $('a[href="#/groups"]').attr('href','#/groups/'+ $rootScope.groupCode );
    var sGroupId = localStorage.getItem("selectedGroup");
    //if ( !sGroupId ) { window.location.href="#/groups"; return; }
    $scope.group = Group.promise.to.read( sGroupId ).$object;

    $scope.logOut =  function() {
        console.log('logOut');
        $rootScope.ConductorLogin = false;
        localStorage.removeItem("groupCode");
        localStorage.removeItem("selectedGroup");
        localStorage.removeItem("selectedGroupName");
        $location.path('/login');
        this.stop();
    };
    $rootScope.pauseAudio =  function() {
        console.log('pause');
        $('.pause-audio').hide();
        $rootScope.PauseAudio = isTrackPlay = false;
        playAudioTrack.pause();
    };
    Song.promise.to.read( $routeParams.id ).then( function( data ) {
        $scope.object = data;
    } );

    $scope.beep =  function() {
      try {
        if ( typeof( Media ) !== "undefined" ) {

            var url = "sounds/iconic.mp3";
            if (device.platform.toLowerCase() == 'android' ) {
                url = "/android_asset/www/" + url;
            }
            var media = new Media( url,
                function () { console.log("playAudio(): Audio Success"); },
                function (err) { console.log("playAudio(): Audio Error: " + err); }
            );
            __log( "media loaded " + url );

            media.setVolume( 1 );
            setTimeout( function() {
               media.play();
               __log( "Media: Playing sound sounds/iconic.mp3");
            }, 2000 );

        } else if ( supportsAudio() ) {
            var snd = new Audio("./sounds/iconic.mp3"); // buffers automatically when created
            setTimeout( function() {
               snd.play();
               __log( "Audio: Playing sound sounds/iconic.mp3");
            }, 2000 );

            __log( "using Web Api audio" );
        } else {
            __log( "ERROR: on playing sound, audio not supported" );
        }
      } catch ( e ) {
        __log( e );
      }
    };

    $scope.start = function() {
        var nSongId = $scope.object._id;
        __log( "start recording of the song " + nSongId );
        var sGroupId = localStorage.getItem("selectedGroup");
        socket.emit("record-start", {"RecordDuration": limitAudioDuration,GroupId:sGroupId} );
        $scope.limitAudioDuration = limitAudioDuration;
        Recording.promise.to.start( nSongId ).then( function( data ) {
             console.log( data );
             $scope.recording = data._id;
            setTimeout(function(){
                $('.rec-button').sticky({ topSpacing: 30 });
            },250);
             $scope.beep();


              $scope.recordingDuration=0;
              clearInterval( $scope.timer );

            $scope.timer = setInterval( function() {
                $scope.recordingDuration++;
                if ($scope.recordingDuration >= limitAudioDuration) {
                    $scope.stop();
                }
                $scope.$apply();
            }, 1000 );

        });
    };

    $scope.stop = function() {
        console.log('SongDetailsController stop');
        if ( $scope.recording ) {
          clearInterval( $scope.timer );

          Recording.promise.to.stop( $scope.recording ).then( function( data ) {
              setTimeout(function(){
                  $('.rec-button').sticky({ topSpacing: 30 });
              },250);
               $scope.recording = 0;
          } );
        }
    };

    $scope.refresh = function() { Member.promise.to.get().then( function( data ) { $scope.members = data; }); };
    $scope.refresh();
    socket.on( "members-refresh", $scope.refresh );
}

function AppRouteProvider( RestangularProvider, $routeProvider, $locationProvider) {
        // $locationProvider.hashPrefix('!');


        RestangularProvider.setBaseUrl( API_ROOT );
        RestangularProvider.setRestangularFields({ id: "_id" });

        $routeProvider
            .when( '/login',     { templateUrl: './html/conductor/group-login.html',     controller: 'GroupLoginController' } )
            .when( '/groups/:code',     { templateUrl: './html/conductor/groups-list.html',     controller: 'GroupController' } )
            .when( '/songs',      { templateUrl: './html/conductor/songs-list.html',      controller: 'SongController' } )
            .when( '/songs/:id',  { templateUrl: './html/conductor/songs-details.html',      controller: 'SongDetailsController' } )
            .when( '/recordings', { templateUrl: './html/conductor/recordings-list.html', controller: 'RecordController' } )
            .when( '/recordings/:rid', { templateUrl: './html/conductor/recordings-details.html', controller: 'RecordDetailsController' } )
            .otherwise( { "redirectTo" : "/login" } )
        ;
}
AppRouteProvider.$inject = ['RestangularProvider', '$routeProvider', '$locationProvider' ];

/* @ngInject */
function AppRunner($rootScope,  Restangular, $timeout, $window, $location /*, $templateCache*/) {
    console.log('AppRunner');
    $rootScope.logOut =  function() {
        console.log('logOut');
        $('#modalByLogout').modal('hide');
        $rootScope.ConductorLogin = false;
        localStorage.removeItem("groupCode");
        localStorage.removeItem("selectedGroup");
        localStorage.removeItem("selectedGroupName");
        $location.path('/login');
        setTimeout(function(){
            window.location.reload();
        },250);

    };
    $rootScope.pauseAudio =  function() {
        console.log('pause');
        $('.pause-audio').hide();
        $rootScope.PauseAudio = isTrackPlay = false;
        playAudioTrack.pause();
    };
    $rootScope.s_oSoundtrack_loop = function (status) {
        console.log(status);
        if (status === Media.MEDIA_STOPPED) {
            console.log('MEDIA_STOPPED');
            //playAudioTrack.play();
            $('.pause-audio').hide();
            $rootScope.PauseAudio = isTrackPlay = false;
        }
    };
    __s_oSoundtrack_loop = $rootScope.s_oSoundtrack_loop;
      //$rootScope.$on( '$viewContentLoaded', function() { $templateCache.removeAll(); });

      $rootScope.$on( '$routeChangeStart',  function(event, toState, toParams, fromState, fromParams) {
          $rootScope.errors = [];
          $rootScope.back = function() {
              $window.history.back();
          };
      });

      $rootScope.$on('$routeChangeSuccess', function () {
          $timeout(function () {
              // $window.scrollTo(0,0);
              jQuery('html, body').animate({scrollTop:0}, 'slow');
          }, 1 );

          if ( typeof( ga ) !== "undefined" ) {
              ga('send', 'event', 'Page Change', location.hash );
          }
      });
      //localStorage.clear();
    localStorage.removeItem("selectedGroup");
    localStorage.removeItem("selectedGroupName");

      if ( localStorage.getItem( "selectedGroup") ) {
          $rootScope.selectedGroup = localStorage.getItem( "selectedGroup");
          $rootScope.selectedGroupName = localStorage.getItem( "selectedGroupName");
      }
      if ( localStorage.getItem( "groupCode") ) {
          $rootScope.groupCode = localStorage.getItem( "groupCode");
      }
      // RESTANGULAR INTERCEPTION
     /* Restangular.setResponseInterceptor(function(response, operation, what) {
          console.log('response',response);
          // console.log( "ResponseInterceptor" );
          $rootScope.loading = false;
          return response;
      });

      Restangular.setRequestInterceptor(function(elem, operation, what, url) {
          // console.log( "RequestInterceptor" );
          $rootScope.errors = [];
          $rootScope.loading = true;

          var objHeaders = {
              'X-Group':  localStorage.getItem( "selectedGroup"),
              'X-Device':  localStorage.getItem( "device" )
          };
          if ( typeof( window.device ) !== undefined ) {
              objHeaders[ 'X-Device'] = JSON.stringify( window.device );
          }
          Restangular.setDefaultHeaders( objHeaders );
          // delete elem.extraInfo;
          return elem;
      });

      Restangular.setErrorInterceptor(function(response) {
          console.log('response',response);
          __log( "ErrorInterceptor " + response.status );
          $rootScope.loading = false;
          if ( response.data !== undefined ) {
              if ( response.data === null && response.status === 0 ) {
                  $rootScope.errors.push( "Unable to connect to the server. " +
                      "Please refresh the page when internet connection will be restored" );
              } else if ( response.status === 401 ) {
                  $rootScope.errors = response.data.errors;
              } else  {
                  __log( response.data.errors );
                  $rootScope.errors = response.data.errors;
                  if ( $rootScope.errors.length === 0 ) {
                      $rootScope.errors.push( "Server response status: " + response.status );
                  }
              }
          }
      });*/

}
AppRunner.$inject = ['$rootScope', 'Restangular', '$timeout', '$window', '$location'/*, '$templateCache'*/];

    angular.module('app')
        .filter('nice_datetime', function() {
          return function( strIso ) {
              if ( strIso ) {
                  var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
                    "Aug", "Sep", "Oct", "Nov", "Dec");

                  var date = new Date( strIso.replace( /\-/g, "/" ).replace("T", " ").replace( /\..+$/, '' ) );

                  var hours = date.getHours();
                  var minutes = date.getMinutes();
                  var ampm = hours >= 12 ? 'pm' : 'am';
                  hours = hours % 12;
                  hours = hours ? hours : 12; // the hour '0' should be '12'
                  minutes = minutes < 10 ? '0'+ minutes : minutes;

                  var y = "";
                  if ( date.getUTCFullYear() != (new Date()).getUTCFullYear() ) {
                     y = date.getUTCFullYear() + ", ";
                  }
                  return y + m_names[ date.getUTCMonth() ] + " " + (date.getUTCDate()) +
                     ' ' + hours + ':' + minutes + ' ' + ampm;
              }
              return "";
          };
    });
    angular.module('app')
        .filter('nice_duration', function() {
            return function( t ) {
                var pad2 = function(x) { return ( x >= 10 ? x : "0" + x ); };
                var s = t % 60;
                var m = parseInt( t / 60, 10 );
                var h = parseInt( m / 60, 10 ); m = m % 60;
                return pad2( h ) + ":" + pad2(m) + ":" + pad2(s) ;
            };
        });

    angular.module('app')
        .filter('nice_track_name', function() {
            return function( t ) {
                // console.log( t.original );
                var basename = t.original.substring( t.original.lastIndexOf( "/" ) + 1 );
                var arrParts = basename.substring( 0, basename.length - 4 ).split("_");
                return arrParts[0] + " " + arrParts[ 1 ] + " " + arrParts[ 2 ];
            };
        });
    angular.module('app')
        .filter('before_eq', function() {
            return function( t ) {
                return t.substr( 0, t.indexOf( "=" ) - 1 );
            };
        });
    angular.module('app')
        .filter('before_dot', function() {
            return function( t ) {
                return t.substr( 0, t.indexOf( "." ));
            };
        });
    angular.module('app')
        .filter('nice_png', function() {
            return function( png ) {
                var basepath = png.substring( png.indexOf( "/public" )  +  "/public".length );
                if ( typeof( API_STORAGE_ROOT ) !== "undefined" ) {
                    basepath = API_STORAGE_ROOT.substring( 0, API_STORAGE_ROOT.length - 1 ) + basepath;
                }
                return basepath;
            };
        });


    angular.module('app')
        .filter('encoded_file', function() {
            return function( contents ) {
               return 'data:text/plain;charset=utf-8,' + encodeURIComponent( contents );
            };
        });


    angular.module('app')
        .filter('date_euro', function() {
            return function( strIso ) {
                if ( strIso ) {
                    var arrDate = strIso.replace( /\s.+$/, '' ).split("-");
                    var y = arrDate[0], m = arrDate[1], d = arrDate[2];
                    if ( parseInt( d, 10 ) === 0 || parseInt( m, 10 ) === 0 ) { return ''; }

                    return d + '.' + m + '.' + y  + ' ' + strIso.replace( /^.+\s/, '' ).replace( /:\d\d$/, '' );
                }
                return "";
            };
        });



    angular.module('app')
        .filter('nice_date', function() {
            return function( strIso ) {
                if ( strIso ) {
                    var arrDate = strIso.replace( 'T', ' ').replace( /\s.+$/, '' ).split("-");
                    var y = arrDate[0], m = arrDate[1], d = arrDate[2];
                    if ( parseInt( d, 10 ) === 0 || parseInt( m, 10 ) === 0 ) { return ''; }
                    return  m + '/' +  d + '/' + y;
                }
                return "";
            };
        });


    angular.module('app')
        .filter('nice_error', function() {
            return function( x ) {
                var out = [];
                if ( typeof( x ) === "string" )  {
                    out.push( x );
                } else if ( typeof( x ) === "array" )  {
                    out = x;
                } else if ( typeof( x ) === "object" ) {
                    for ( var k in x ) out.push( x[k] );
                }
                return  out.join("\n");
            };
        });

    angular.module('app')
        .filter('nice_audio', function() {
            return function( track ) {
                var basepath = '';
                if ( typeof( track.mp3 ) !== "undefined" ) {
                    basepath = track.mp3.substring( track.mp3.indexOf( "/public" )  +  "/public".length );
                    if ( typeof( API_STORAGE_ROOT ) !== "undefined" ) {
                        basepath = API_STORAGE_ROOT.substring( 0, API_STORAGE_ROOT.length - 1 ) + basepath;
                    }
                } else {

                    if ( typeof( track.wav ) === "undefined" ) return basepath;
                    basepath = track.wav.substring( track.wav.indexOf( "/public" )  +  "/public".length );
                    if ( typeof( API_STORAGE_ROOT ) !== "undefined" ) {
                        basepath = API_STORAGE_ROOT.substring( 0, API_STORAGE_ROOT.length - 1 ) + basepath;
                    }
                }
                return basepath;
            };
        });
function doOnOrientationChange() {
        console.log(window.orientation);
        switch(window.orientation)
        {
            case -90:
            case 90:
                console.log('landscape');
                screen.lockOrientation('landscape');
                screen.unlockOrientation();
                $(".col-md-12.table-recording").css('width',$('.ng-scope:nth-child(4)').width()-30);
                break;
            default:
                console.log('portrait');
                screen.lockOrientation('portrait');
                screen.unlockOrientation();
                $(".col-md-12.table-recording").css('width',$('.ng-scope:nth-child(4)').width()-18);
                break;
        }
}
function doOnOrientationChangeWeb() {
    console.log(window.orientation);
    switch(window.orientation)
    {
        case -90:
        case 90:
            console.log('landscape');
            $(".col-md-12.table-recording").css('width',$('.ng-scope:nth-child(4)').width()-30);
            break;
        default:
            console.log('portrait');
            $(".col-md-12.table-recording").css('width',$('.ng-scope:nth-child(4)').width()-18);
            break;
    }
}
$(document).on('DOMContentLoaded', function() {
    console.log('init DOMContentLoaded');
    window.addEventListener('orientationchange', doOnOrientationChangeWeb);
});
$(document).on('deviceready', function() {
    console.log('init deviceready');
    window.addEventListener('orientationchange', doOnOrientationChange);

    if (window.plugins.insomnia){
        window.plugins.insomnia.keepAwake(function(msg){console.log(msg);})
    } else {
        console.log('plugin insomnia not install');
    }

});