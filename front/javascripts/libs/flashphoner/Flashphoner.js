function Flashphoner() {
    if (arguments.callee.instance) {
        return arguments.callee.instance;
    }
    arguments.callee.instance = this;

    this.clientVersion = "928.1838-b2ca6ba9bc51d8015894e251a46072ba6e6e3507";

    this.webRtcMediaManager = undefined;
    this.webRtcCallSessionId = undefined;
    this.flashMediaManager = undefined;
    this.swfLoaded = undefined;
    this.wsPlayerMediaManager = undefined;
    this.connection = null;
    this.configuration = new Configuration();
    this.calls = new DataMap();
    this.publishStreams = new DataMap();
    this.playStreams = new DataMap();
    this.messages = {};
    this.isOpened = false;
    this.listeners = {};
    this.version = undefined;
    this.mediaProviders = new DataMap();
    this.intervalId = -1;
    this.firefoxCodecReplaicer = {"pcma": "PCMA", "pcmu": "PCMU", "g722": "G722", "OPUS": "opus", "SHA-256": "sha-256"};
    this.firefoxScreenSharingExtensionInstalled = false;
}

Flashphoner.getInstance = function () {
    return new Flashphoner();
};

Flashphoner.prototype = {

    isChrome: function(){
        return (navigator.userAgent.indexOf("Chrome") > -1) && (navigator.userAgent.indexOf("Edge") == -1);
    },

    isFF: function(){
        return (navigator.userAgent.indexOf("Mozilla") > -1) && (navigator.userAgent.indexOf("Firefox") > -1) && (navigator.userAgent.indexOf("Edge") == -1);
    },

    initFlash: function (elementId, pathToSWF) {

        var me = this;

        if ( (me.isChrome() || me.isFF()) && !me.configuration.forceFlashForWebRTCBrowser ) {
            //Don't init Flash player for Chrome browser because it has some bugs in version 46 (Flash no longer detects webcam in Chrome)
            //Once Flash is not loaded, WebRTC will be used everywhere in Chrome until the Flash Player bug is not resolved
            //https://productforums.google.com/forum/#!topic/chrome/QjT1GR2IYzM;context-place=forum/chrome
            trace("Flash won't be initialized for Chrome");
            return;
        }

        if (typeof swfobject != 'undefined') {
            var params = {};
            params.menu = "true";
            params.swliveconnect = "true";
            params.allowfullscreen = "true";
            params.allowscriptaccess = "always";
            params.bgcolor = (Object.keys(me.configuration.swfParams).length === 0) ? "000000" : me.configuration.swfParams.bgcolor;
            //in case of Safari wmode should be "window"
            if ((navigator.userAgent.indexOf("Safari") > -1) && !(navigator.userAgent.indexOf("Chrome") > -1)) {
                params.wmode = (Object.keys(me.configuration.swfParams).length === 0) ? "window" : me.configuration.swfParams.wmode;
                //workaround for safari browser, FPNR-403
                swfobject.switchOffAutoHideShow();
            } else if ((navigator.userAgent.indexOf("Mozilla") > -1) && (navigator.userAgent.indexOf("Firefox") > -1)) {
                params.wmode = (Object.keys(me.configuration.swfParams).length === 0) ? "window" : me.configuration.swfParams.wmode;
            } else {
                params.wmode = (Object.keys(me.configuration.swfParams).length === 0) ? "transparent" : me.configuration.swfParams.wmode;
            }
            var attributes = {};
            var flashvars = {};
            if (swfobject.hasFlashPlayerVersion("11.2")) {
                swfobject.embedSWF(pathToSWF, elementId, "100%", "100%", "11.2.202", "expressInstall.swf", flashvars, params, attributes, function (e) {
                    me.flashMediaManager = e.ref;
                    me.swfLoaded = true;
                    me.mediaProviders.add(MediaProvider.Flash, me.flashMediaManager);
                });
            } else {
                trace("Problem: Flash not found")
            }
        } else {
            trace("Warning: swfobject.js does not include and flash does not load");
        }
    },

    initFlashMediaManager: function () {
        if (isFlashphonerAPILoaded && this.userData) {
            this.flashMediaManager.connect(this.configuration.urlFlashServer, this.userData, this.configuration);
        }
    },

    initWSPlayerMediaManager: function () {
        if (this.userData && this.wsPlayerMediaManager) {
            var config = {};
            config.token = this.userData.authToken;
            config.urlWsServer = this.connection.urlServer;
            config.receiverPath = this.configuration.wsPlayerReceiverPath;
            config.decoderPath = this.configuration.wsPlayerDecoderPath;
            config.videoWidth = this.configuration.videoWidth;
            config.videoHeight = this.configuration.videoHeight;
            config.startWithVideoOnly = this.configuration.wsPlayerStartWithVideoOnly;
            this.wsPlayerMediaManager.initLogger(0);
            this.wsPlayerMediaManager.init(config);
        }
    },

    checkMediaDevices: function() {
        return !(navigator.mediaDevices === undefined || navigator.mediaDevices.getUserMedia === undefined);
    },

    initWebRTC: function () {
        var me = this;
        if (navigator.mozGetUserMedia) {
            trace("This appears to be Firefox");

            if (typeof(mozRTCPeerConnection) === undefined) {
                trace("Please, update your browser to use WebRTC");
            } else {
                me.webRtcMediaManager = new WebRtcMediaManager();
                me.mediaProviders.add(MediaProvider.WebRTC, me.webRtcMediaManager);

                webrtcDetectedBrowser = "firefox";

                RTCPeerConnection = mozRTCPeerConnection;

                RTCSessionDescription = mozRTCSessionDescription;

                RTCIceCandidate = mozRTCIceCandidate;

                getUserMedia = navigator.mozGetUserMedia.bind(navigator);

                attachMediaStream = function (element, stream) {
                    element.mozSrcObject = stream;
                    element.play();
                };

                reattachMediaStream = function (to, from) {
                    to.mozSrcObject = from.mozSrcObject;
                    to.play();
                };

                //MediaStream.prototype.getVideoTracks = function () {
                //    return [];
                //};
                //
                //MediaStream.prototype.getAudioTracks = function () {
                //    return [];
                //};
            }
        } else if (navigator.webkitGetUserMedia) {
            trace("This appears to be Chrome");

            if (typeof(webkitRTCPeerConnection) === undefined) {
                trace("Please, update your browser to use WebRTC");
            } else {
                me.webRtcMediaManager = new WebRtcMediaManager();
                me.mediaProviders.add(MediaProvider.WebRTC, me.webRtcMediaManager);

                webrtcDetectedBrowser = "chrome";

                RTCPeerConnection = webkitRTCPeerConnection;

                getUserMedia = navigator.webkitGetUserMedia.bind(navigator);

                attachMediaStream = function (element, stream) {
                    var URL = window.URL || window.webkitURL;
                    element.src = URL.createObjectURL(stream);
                    element.play();
                };

                reattachMediaStream = function (to, from) {
                    to.src = from.src;
                    element.play();
                };

                //if (!webkitMediaStream.prototype.getVideoTracks) {
                //    webkitMediaStream.prototype.getVideoTracks = function () {
                //        return this.videoTracks;
                //    };
                //}
                //
                //if (!webkitMediaStream.prototype.getAudioTracks) {
                //    webkitMediaStream.prototype.getAudioTracks = function () {
                //        return this.audioTracks;
                //    };
                //}
            }
        } else {
            trace("Browser does not appear to be WebRTC-capable");
        }

        var MediaStream = window.MediaStream;

        if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
            MediaStream = webkitMediaStream;
        }

        /*global MediaStream:true */
        if (typeof MediaStream !== 'undefined' && !('stop' in MediaStream.prototype)) {
            MediaStream.prototype.stop = function() {
                this.getAudioTracks().forEach(function(track) {
                    track.stop();
                });

                this.getVideoTracks().forEach(function(track) {
                    track.stop();
                });
            };
        }

        if (this.webRtcMediaManager) {
            this.webRtcMediaManager.onLocalScreenMediaStreamEnded = function(mediaSessionId) {
                var streams = me.publishStreams.array();
                streams.some(function(stream) {
                    if (stream.mediaSessionId == mediaSessionId) {
                        stream.status = StreamStatus.LocalStreamStopped;
                        me.invokeListener(WCSEvent.StreamStatusEvent, [
                            stream
                        ]);

                        //stop stream
                        me.unPublishStream(stream);
                        return true;
                    }
                });
            }
        }
    },

    addListener: function (event, listener, thisArg) {
        this.listeners[event] = {func: listener, thisArg: thisArg};
    },

    invokeListener: function (event, argsArray) {
        var listener = this.listeners[event];
        if (listener) {
            listener.func.apply(listener.thisArg ? listener.thisArg : window, argsArray);
        }
    },

    addOrUpdateCall: function (call) {
        var me = this;
        if (me.calls.get(call.callId)) {
            me.calls.update(call.callId, call);
        } else {
            me.calls.add(call.callId, call);

            if (!call.mediaProvider) {
                call.mediaProvider = Object.keys(Flashphoner.getInstance().mediaProviders.getData())[0];
            }

            if ((!this.webRtcCallSessionId) && MediaProvider.WebRTC == call.mediaProvider) {
                this.webRtcCallSessionId = call.callId;
                me.webRtcMediaManager.newConnection(call.callId, new WebRtcMediaConnection(me.webRtcMediaManager, me.configuration.stunServer, me.configuration.useDTLS, me.configuration.remoteMediaElementId, call.callId));
            }

            if (call.incoming || call.parentCallId !== undefined) {
                me.invokeListener(WCSEvent.OnCallEvent, [
                    call
                ]);
            }
        }
    },

    init: function (configuration) {
        var me = this;
        if (!configuration) {
            configuration = new Configuration();
        }
        if (!configuration.remoteMediaElementId) {
            configuration.remoteMediaElementId = 'remoteMediaElement';
            var _body = document.getElementsByTagName('body') [0];
            var remoteMediaElement = document.createElement('audio');
            remoteMediaElement.id = configuration.remoteMediaElementId;
            _body.appendChild(remoteMediaElement);
        }

        if (!configuration.pathToSWF) {
            configuration.pathToSWF = '../../../dependencies/flash/MediaManager.swf';
        }

        if (!configuration.elementIdForSWF && typeof swfobject != 'undefined') {
            configuration.elementIdForSWF = 'flashVideoDiv';
            var _body = document.getElementsByTagName('body') [0];
            var flashVideoDiv = document.createElement('div');
            flashVideoDiv.style.width = '322px';
            flashVideoDiv.style.height = '176px';
            flashVideoDiv.innerHTML = '<div id="' + configuration.elementIdForSWF + '"></div>';
            _body.appendChild(flashVideoDiv);

        }


        me.configuration = configuration;
        me.initWebRTC();
        if (me.configuration.elementIdForSWF && me.configuration.pathToSWF) {
            me.initFlash(me.configuration.elementIdForSWF, me.configuration.pathToSWF);
        }
        if (me.configuration.wsPlayerCanvas) {
            me.wsPlayerMediaManager = new WSPlayer(me.configuration.wsPlayerCanvas, me);
            me.mediaProviders.add(MediaProvider.WSPlayer, me.wsPlayerMediaManager);
        }

        if (me.configuration.localMediaElementId) {
            try {
                getElement(me.configuration.localMediaElementId).volume = 0;
            }catch(err) {
                console.info("This browser may not support video.volume: "+err);
            }
        }

        this.callbacks = {
            ping: function () {
                me.webSocket.send("pong");
            },

            getUserData: function (userData) {
                me.userData = userData;
                if (me.flashMediaManager) {
                    me.initFlashMediaManager();
                }
                if (me.wsPlayerMediaManager) {
                    me.initWSPlayerMediaManager();
                }
                for (var prop in userData) {
                    me.connection[prop] = me.userData[prop];
                }
                me.connection.status = ConnectionStatus.Established;
                me.invokeListener(WCSEvent.ConnectionStatusEvent, [
                    me.connection
                ]);
            },

            getVersion: function (version) {
                me.version = version;
            },

            registered: function (event) {
                me.invokeListener(WCSEvent.RegistrationStatusEvent, [
                    event
                ]);
            },

            notifyIncomingCall: function (call) {
                trace("notifyIncomingCall call.callId:" + call.callId);
                me.addOrUpdateCall(call);
            },

            notifyTransferEvent: function (call) {
                trace("notifyTransferEvent " + call.status);
                if (call.status == "PENDING") {
                    me.invokeListener(WCSEvent.OnTransferEvent, [
                        call
                    ]);
                } else {
                    me.invokeListener(WCSEvent.TransferStatusEvent, [
                        call
                    ]);
                }
            },

            notifyTryingResponse: function (call) {
                trace("notifyTryingResponse call.callId:" + call.callId);
                me.addOrUpdateCall(call);
                me.invokeListener(WCSEvent.CallStatusEvent, [
                    call
                ]);
            },

            ring: function (call) {
                trace("ring call.status: " + call.status + " call.callId: " + call.callId);
                me.addOrUpdateCall(call);
                me.invokeListener(WCSEvent.CallStatusEvent, [
                    call
                ]);
            },

            sessionProgress: function (call) {
                trace("sessionProgress call.state: " + call.state + " call.callId: " + call.callId);
                me.addOrUpdateCall(call);
                me.invokeListener(WCSEvent.CallStatusEvent, [
                    call
                ]);
            },

            setRemoteSDP: function (id, sdp, isInitiator) {
                //if (sdp.search("a=recvonly") != -1) {
                //    sdp = me.handleVideoSSRC(sdp);
                //}
                console.log("setRemoteSDP: " + sdp);
                if (me.webRtcMediaManager) {
                    if (navigator.mozGetUserMedia) {
                        for (var c in me.firefoxCodecReplaicer) {
                            sdp = sdp.split(c).join(me.firefoxCodecReplaicer[c]);
                        }
                    }

                    if (me.configuration.stripCodecs && me.configuration.stripCodecs.length > 0) {
                        sdp = me.stripCodecsSDP(sdp, false);
                        console.log("Apply strip codecs");
                    }
                    me.webRtcMediaManager.setRemoteSDP(id, sdp, isInitiator);
                }
            },

            notifyAudioCodec: function (id, codec) {
                var call = me.calls.get(id);
                if (me.flashMediaManager && call && MediaProvider.Flash == call.mediaProvider) {
                    me.flashMediaManager.setAudioCodec(id, codec);
                }
            },

            binaryData: function (data) {
                me.invokeListener(WCSEvent.OnBinaryEvent, [
                    data
                ]);
            },

            base64BinaryData: function (data) {
                var result = {};
                var raw = window.atob(data);
                var rawLength = raw.length;
                var array = new Uint8Array(new ArrayBuffer(rawLength));

                for (i = 0; i < rawLength; i++) {
                    array[i] = raw.charCodeAt(i);
                }
                result.data = array;
                console.log("received data length " + result.data.length);
                me.invokeListener(WCSEvent.OnBinaryEvent, [
                    result
                ]);
            },

            notifyVideoFormat: function (videoFormat) {
                me.invokeListener(WCSEvent.OnVideoFormatEvent, [videoFormat]);
            },

            talk: function (call) {
                me.addOrUpdateCall(call);
                if (!call.isMsrp) {
                    me.mediaProviders.get(call.mediaProvider).talk(call.callId, call.hasVideo);
                }
                me.invokeListener(WCSEvent.CallStatusEvent, [
                    call
                ]);
            },

            hold: function (call) {
                me.addOrUpdateCall(call);
                me.mediaProviders.get(call.mediaProvider).hold(call.callId);
                me.invokeListener(WCSEvent.CallStatusEvent, [
                    call
                ]);
            },

            callbackHold: function (callId, isHold) {
                trace("callbackHold " + isHold);
            },

            finish: function (call) {
                me.finish(call);
            },

            busy: function (call) {
                me.addOrUpdateCall(call);
                me.invokeListener(WCSEvent.CallStatusEvent, [
                    call
                ]);
            },

            fail: function (event) {
                if (event.hasOwnProperty("apiMethod")) {
                    var actualEvent = WCSEvent[event.apiMethod];
                    //Finish Call before raising of FAILED event to close resources properly such as peer connection
                    if (event.apiMethod == "CallStatusEvent") {
                        var call = me.calls.get(event.id);
                        if (call) {
                            call.status = CallStatus.FINISH;
                            me.finish(call);
                        }
                    }
                    delete event.apiMethod;
                    me.invokeListener(actualEvent, [
                        event
                    ]);
                } else {
                    me.invokeListener(WCSEvent.ErrorStatusEvent, [
                        event
                    ]);
                }
            },

            notifyBugReport: function (filename) {
                me.invokeListener(WCSEvent.BugReportStatusEvent, [
                    {filename: filename}
                ]);
            },

            notifyMessage: function (message, notificationResult) {
                var sentMessage = me.messages[message.id];
                if (sentMessage != null) {
                    sentMessage.status = message.status;
                }
                if (message.status == MessageStatus.RECEIVED) {
                    //here we will choose what to display on multiple contacts in "from".
                    if (message.from.indexOf(",") != -1) {
                        var fromList = message.from.split(",");
                        message.from = fromList[0];
                    }
                    notificationResult.status = "OK";
                    me.notificationResult(notificationResult);
                    me.invokeListener(WCSEvent.OnMessageEvent, [
                        message
                    ]);
                } else {
                    if (message.status == MessageStatus.ACCEPTED) {
                        if (!sentMessage.isImdnRequired) {
                            me.removeSentMessage(sentMessage);
                        }
                    } else if (message.status == MessageStatus.FAILED) {
                        me.removeSentMessage(sentMessage);
                    } else if (message.status == MessageStatus.IMDN_NOTIFICATION_SENT && sentMessage == null) {
                        me.messages[message.id] = message;
                    } else if (message.status == MessageStatus.IMDN_DELIVERED) {
                        me.removeSentMessage(sentMessage);
                        notificationResult.status = "OK";
                        me.notificationResult(notificationResult);
                    } else if (message.status == MessageStatus.IMDN_FAILED || message.status == MessageStatus.IMDN_FORBIDDEN || message.status == MessageStatus.IMDN_ERROR) {
                        me.removeSentMessage(sentMessage);
                        notificationResult.status = "OK";
                        me.notificationResult(notificationResult);
                    }
                    me.invokeListener(WCSEvent.MessageStatusEvent, [
                        message
                    ]);
                }
            },

            notifyRecordComplete: function (recordReport) {
                me.invokeListener(WCSEvent.RecordingStatusEvent, [
                    recordReport
                ]);
            },

            notifySubscription: function (subscription, sipObject) {
                me.invokeListener(WCSEvent.SubscriptionStatusEvent, [
                    subscription
                ]);
            },

            notifyXcapResponse: function (xcapResponse) {
                me.invokeListener(WCSEvent.XcapStatusEvent, [
                    xcapResponse
                ]);
            },

            notifyStreamStatusEvent: function (stream) {
                //clean resources if status is failed
                if (stream.status == StreamStatus.Failed) {
                    var removedStream;
                    if (stream.published) {
                        removedStream = me.publishStreams.remove(stream.name);
                    } else {
                        removedStream = me.playStreams.remove(stream.name);
                    }
                    if (removedStream) {
                        me.releaseMediaManagerStream(removedStream);
                    }
                } else {
                    if (stream.mediaProvider == MediaProvider.Flash) {
                        if (stream.status == StreamStatus.Publishing) {
                            me.flashMediaManager.publishStream(stream.mediaSessionId, true, stream.hasVideo);
                        }
                        if (stream.status == StreamStatus.Playing) {
                            me.flashMediaManager.playStream(stream.mediaSessionId);
                        }
                    }
                    if (stream.published) {
                        me.publishStreams.update(stream.id, stream);
                    } else {
                        me.playStreams.update(stream.id, stream);
                    }
                }
                me.invokeListener(WCSEvent.StreamStatusEvent, [
                    stream
                ]);
            },

            OnDataEvent: function (data) {
                me.invokeListener(WCSEvent.OnDataEvent, [
                    data
                ]);
                me.webSocket.send("DataStatusEvent", {status: "ACCEPTED", operationId: data.operationId});
            },

            DataStatusEvent: function (status) {
                me.invokeListener(WCSEvent.DataStatusEvent, [
                    status
                ]);
            }
        };
    },

    removeSentMessage: function (sentMessage) {
        var me = this;
        setTimeout(function () {
            me.messages[sentMessage.id] = null;
        }, 5000);
    },


    connect: function (connection) {
        var me = this;
        me.connection = connection;
        if (me.connection.sipRegisterRequired == undefined) {
            me.connection.sipRegisterRequired = me.configuration.sipRegisterRequired;
        }
        me.connection.sipContactParams = me.connection.sipContactParams | me.configuration.sipContactParams;
        for (var item in me.connection) {
            if (me.connection[item] != null && me.connection[item] != undefined && !Array.isArray(me.connection[item])) {
                me.connection[item] = $.trim(me.connection[item]);
            }
        }

        if (!me.connection.mediaProviders || me.connection.mediaProviders.length == 0) {
            me.connection.mediaProviders = Object.keys(me.mediaProviders.getData());
        }
        me.connection.urlServer = me.connection.urlServer || me.configuration.urlWsServer;
        me.connection.width = me.connection.width || me.configuration.videoWidth;
        me.connection.height = me.connection.height || me.configuration.videoHeight;
        me.connection.clientVersion = me.clientVersion;
        //workaround for old Safari (5.X)
        if ((navigator.userAgent.indexOf("Safari") > -1) && !(navigator.userAgent.indexOf("Chrome") > -1)) {
            me.connection.urlServer = me.connection.urlServer.slice(-1) == "/" ? me.connection.urlServer + "websocket" : me.connection.urlServer + "/websocket";
        }

        var getLocation = function (href) {
            var l = document.createElement("a");
            l.href = href;
            return l;
        };
        var l = getLocation(me.connection.urlServer);

        if (!me.configuration.urlFlashServer) {
            me.configuration.urlFlashServer = "rtmfp://" + l.hostname + ":1935";
        }

        me.webSocket = $.websocket(me.connection.urlServer, {
            open: function () {
                me.isOpened = true;
                me.webSocket.send("connection", me.connection);
            },
            close: function (event) {
                me.isOpened = false;
                if (!event.originalEvent.wasClean) {
                    me.connection.status = ConnectionStatus.Failed;
                } else {
                    me.connection.status = ConnectionStatus.Disconnected;
                }
                me.invokeListener(WCSEvent.ConnectionStatusEvent, [
                    me.connection, event.originalEvent
                ]);
                if (me.webRtcMediaManager) {
                    me.webRtcMediaManager.disconnect();
                }
                if (me.flashMediaManager) {
                    me.flashMediaManager.disconnect();
                }
                me.webRtcCallSessionId = undefined;
                me.calls = new DataMap();
                me.publishStreams = new DataMap();
                me.playStreams = new DataMap();
            },
            error: function () {
                me.connection.status = ConnectionStatus.Failed;
                me.invokeListener(WCSEvent.ConnectionStatusEvent, [
                    me.connection
                ]);
            },
            context: me,
            events: me.callbacks
        });
        return 0;
    },

    invokeProblem: function (status) {
        this.invokeListener(WCSEvent.ErrorStatusEvent, [
            status
        ]);
    },

    disconnect: function () {
        trace("WebSocketManager - disconnect");
        this.webSocket.close();
    },

    subscribe: function (subscribeObject) {
        this.webSocket.send("subscribe", subscribeObject);
    },

    sendXcapRequest: function (xcapObject) {
        this.webSocket.send("sendXcapRequest", xcapObject);
    },

    call: function (call) {
        var me = this;

        call.callId = createUUID();
        call.incoming = false;
        if (!call.isMsrp) {
            call.isMsrp = false;
        }
        if (call.hasAudio == undefined) {
            call.hasAudio = true;
        }
        if (!call.hasVideo) {
            call.hasVideo = false;
        }

        if (!call.receiveVideo) {
            call.receiveVideo = false;
        }

        me.addOrUpdateCall(call);

        var internalCall = function () {
            if (MediaProvider.WebRTC == call.mediaProvider) {
                me.webRtcMediaManager.createOffer(call.callId, function (sdp) {
                    //here we will strip codecs from SDP if requested
                    if (me.configuration.stripCodecs && me.configuration.stripCodecs.length > 0) {
                        sdp = me.stripCodecsSDP(sdp, true);
                        console.log("New SDP: " + sdp);
                    }
                    sdp = me.removeCandidatesFromSDP(sdp);
                    call.sdp = sdp;
                    me.webSocket.send("call", call);
                }, call.hasAudio, call.hasVideo, call.receiveVideo);
            } else if (MediaProvider.Flash == call.mediaProvider) {
                me.webSocket.send("call", call);
            }
        };
        if (call.hasAudio) {
            me.checkAndGetAccess(call.mediaProvider, call.hasVideo, internalCall, []);
        } else {
            internalCall();
        }
        return call;
    },

    msrpCall: function (callRequest) {
        var me = this;
        callRequest.callId = createUUID();
        me.webSocket.send("call", callRequest);
        return callRequest;
    },

    answer: function (call) {
        var me = this;
        me.checkAndGetAccess(call.mediaProvider, call.hasVideo, function () {
            if (MediaProvider.WebRTC == call.mediaProvider) {
                /**
                 * If we receive INVITE without SDP, we should send answer with SDP based on webRtcMediaManager.createOffer because we do not have remoteSdp here
                 */
                if (me.webRtcMediaManager.receivedEmptyRemoteSDP(call.callId)) {
                    me.webRtcMediaManager.createOffer(call.callId, function (sdp) {
                        //here we will strip codecs from SDP if requested
                        if (me.configuration.stripCodecs && me.configuration.stripCodecs.length > 0) {
                            sdp = me.stripCodecsSDP(sdp, true);
                            console.log("New SDP: " + sdp);
                        }
                        call.sdp = me.removeCandidatesFromSDP(sdp);
                        me.webSocket.send("answer", call);
                    }, true, call.hasVideo);
                } else {
                    /**
                     * If we receive a normal INVITE with SDP we should create answering SDP using normal createAnswer method because we already have remoteSdp here.
                     */
                    me.webRtcMediaManager.createAnswer(call.callId, function (sdp) {
                        call.sdp = sdp;
                        me.webSocket.send("answer", call);
                    }, call.hasVideo);
                }
            } else if (MediaProvider.Flash == call.mediaProvider) {
                me.webSocket.send("answer", call);
            }
        }, []);
    },

    changeVideoState: function (call, enable) {
        var me = this;
        if (MediaProvider.Flash == call.mediaProvider) {
            if (!call.hasVideo) {
                me.webSocket.send("updateCallToVideo", call.callId);
                call.hasVideo = true;
            }
            me.flashMediaManager.changeVideoState(call.callId, enable);
        } else {
            //todo uncomment after firefox implement reoffer
            //this.webRtcMediaManager.createOffer(call.callId, function (sdp) {
            //    me.webSocket.send("changeVideoState", {callId: call.callId, sdp: sdp});
            //}, true, call.hasVideo);
        }
        return 0;
    },

    hangup: function (call) {
        if (call) {
            this.webSocket.send("hangup", {callId: call.callId});
        }
    },

    finish: function (call) {
        this.calls.remove(call.callId);
        if (this.calls.getSize() == 0 && MediaProvider.WebRTC == call.mediaProvider) {
            var sessionId = this.webRtcCallSessionId;
            this.webRtcCallSessionId = undefined;
            this.mediaProviders.get(call.mediaProvider).close(sessionId);
        }
        if (MediaProvider.Flash == call.mediaProvider) {
            this.mediaProviders.get(call.mediaProvider).close(call.callId);
        }
        this.invokeListener(WCSEvent.CallStatusEvent, [
            call
        ]);
    },

    hold: function (call) {
        this.webSocket.send("hold", {callId: call.callId});
    },

    holdForTransfer: function (call) {
        this.webSocket.send("hold", {callId: call.callId, holdForTransfer: true});
    },

    unhold: function (call) {
        this.webSocket.send("unhold", {callId: call.callId});
    },

    transfer: function (transferObj) {
        this.webSocket.send("transfer", transferObj);
    },

    sendDTMF: function (dtmfObj) {
        if (!dtmfObj.type) {
            dtmfObj.type = DtmfType.rfc2833;
        }
        this.webSocket.send("sendDtmf", dtmfObj);
    },

    getCallStatistics: function (call, callbackFn) {
        if (MediaProvider.Flash == call.mediaProvider) {
            this.getStreamStatistics(call.callId, call.mediaProvider, callbackFn)
        } else {
            this.getStreamStatistics(this.webRtcCallSessionId, call.mediaProvider, callbackFn);
        }
    },

    getStreamStatistics: function (mediaSessionId, mediaProvider, callbackFn) {
        var me = this;
        if (MediaProvider.Flash == mediaProvider) {
            var statistics = this.flashMediaManager.getStatistics(mediaSessionId);
            var param;
            for (param in statistics.incomingStreams.info) {
                if (param.indexOf("audio") > -1) {
                    statistics.incomingStreams.audio[param] = statistics.incomingStreams.info[param];
                }
                if (param.indexOf("video") > -1) {
                    statistics.incomingStreams.video[param] = statistics.incomingStreams.info[param];
                }
            }
            delete statistics.incomingStreams.info;
            for (param in statistics.outgoingStreams.info) {
                if (param.indexOf("audio") > -1) {
                    statistics.outgoingStreams.audio[param] = statistics.outgoingStreams.info[param];
                }
                if (param.indexOf("video") > -1) {
                    statistics.outgoingStreams.video[param] = statistics.outgoingStreams.info[param];
                }
            }
            delete statistics.outgoingStreams.info;

            statistics.type = "flash";
            callbackFn(statistics);
        } else {
            this.webRtcMediaManager.getStatistics(mediaSessionId, callbackFn);
        }
    },

    getWSPlayerStatistics: function (type) {
        return this.wsPlayerMediaManager.getStreamStatistics(type);
    },

    setUseProxy: function (useProxy) {
        if (this.isOpened) {
            this.webSocket.send("setUseProxy", useProxy);
        }
    },

    pushLogs: function (logsObject) {
        if (this.isOpened) {
            this.webSocket.send("pushLogs", logsObject);
            return true;
        } else {
            return false;
        }
    },

    submitBugReport: function (reportObject) {
        if (this.isOpened) {
            this.webSocket.send("submitBugReport", reportObject);
            return true;
        } else {
            return false;
        }
    },

    setLTState: function (state) {
        trace("setLTState: " + state);
        this.webSocket.send("setLTState", {state: state});
    },

    getAccess: function (mediaProvider, hasVideo) {
        var me = this;
        setTimeout(function () {
            if (hasVideo) {
                if (!me.mediaProviders.get(mediaProvider).getAccessToAudioAndVideo()) {
                    me.invokeProblem({
                        status: WCSError.MIC_CAM_ACCESS_PROBLEM,
                        info: "Failed to get access to microphone or not found"
                    });
                }
            } else {
                if (!me.mediaProviders.get(mediaProvider).getAccessToAudio()) {
                    me.invokeProblem({
                        status: WCSError.MIC_ACCESS_PROBLEM,
                        info: "Failed to get access to microphone and camera or not found"
                    });
                }
            }
        }, 50);

    },

    hasAccess: function (mediaProvider, hasVideo) {
        var mp = this.mediaProviders.get(mediaProvider);
        if (hasVideo) {
            return mp.hasAccessToAudioAndVideo && mp.hasAccessToAudioAndVideo();
        } else {
            return mp.hasAccessToAudio && mp.hasAccessToAudio();
        }
    },

    releaseCameraAndMicrophone: function (mediaProvider) {
        this.mediaProviders.get(mediaProvider).releaseCameraAndMicrophone();
    },

    getVolume: function (call) {
        if (MediaProvider.Flash == call.mediaProvider) {
            this.mediaProviders.get(call.mediaProvider).setVolume(call.callId, value);
        } else {
            this.mediaProviders.get(call.mediaProvider).setVolume(this.webRtcCallSessionId, value);
        }
    },

    getVolumeOnStreaming: function(provider) {
        if(provider == MediaProvider.WebRTC) {
            return getElement(this.configuration.remoteMediaElementId).volume;
        } else {
            return this.mediaProviders.get(provider).getVolume();
        }
    },

    setVolume: function (call, value) {
        if (MediaProvider.Flash == call.mediaProvider) {
            this.mediaProviders.get(call.mediaProvider).setVolume(call.callId, value);
        } else {
            this.mediaProviders.get(call.mediaProvider).setVolume(this.webRtcCallSessionId, value);
        }
    },

    setVolumeOnStreaming: function (provider, value) {
        if (provider == MediaProvider.WSPlayer) {
            this.mediaProviders.get(provider).setVolume(value/100);
        } else if (provider == MediaProvider.Flash) {
            this.mediaProviders.get(provider).setVolume(0, value);
        } else {
           getElement(this.configuration.remoteMediaElementId).volume = value/100;
        }
    },

    muteVideo: function (mediaProvider) {
        if (!mediaProvider) {
            mediaProvider = Object.keys(Flashphoner.getInstance().mediaProviders.getData())[0];
        }
        this.mediaProviders.get(mediaProvider).muteVideo();

    },

    unmuteVideo: function (mediaProvider) {
        if (!mediaProvider) {
            mediaProvider = Object.keys(Flashphoner.getInstance().mediaProviders.getData())[0];
        }
        this.mediaProviders.get(mediaProvider).unmuteVideo();
    },

    isVideoMuted: function (mediaProvider) {
        if (!mediaProvider) {
            mediaProvider = Object.keys(Flashphoner.getInstance().mediaProviders.getData())[0];
        }
        return this.mediaProviders.get(mediaProvider).isVideoMuted();

    },

    mute: function (mediaProvider) {
        if (!mediaProvider) {
            mediaProvider = Object.keys(Flashphoner.getInstance().mediaProviders.getData())[0];
        }
        this.mediaProviders.get(mediaProvider).mute();
    },

    unmute: function (mediaProvider) {
        if (!mediaProvider) {
            mediaProvider = Object.keys(Flashphoner.getInstance().mediaProviders.getData())[0];
        }
        this.mediaProviders.get(mediaProvider).unmute();
    },

    //works only for WSPlayer
    playFirstSound: function () {
        if (this.wsPlayerMediaManager) {
            this.wsPlayerMediaManager.playFirstSound();
        }
    },

    sendMessage: function (message) {
        var id = createUUID();
        message.id = id;
        message.from = this.userData.sipLogin;
        message.contentType = message.contentType || this.configuration.msgContentType;
        message.isImdnRequired = message.isImdnRequired || this.configuration.imdnEnabled;
        this.messages[id] = message;
        this.webSocket.send("sendMessage", message);
    },

    notificationResult: function (result) {
        this.webSocket.send("notificationResult", result);
    },

    sendData: function (data) {
        this.webSocket.send("sendData", data);
    },

    publishStream: function (stream) {
        var me = this;
        var mediaSessionId = createUUID();

        stream.mediaSessionId = mediaSessionId;
        stream.published = true;
        if (stream.record == undefined) {
            stream.record = false;
        }
        if (stream.hasVideo == undefined) {
            stream.hasVideo = true;
        }
        if (!stream.mediaProvider) {
            stream.mediaProvider = Object.keys(Flashphoner.getInstance().mediaProviders.getData())[0];
        }

        me.checkAndGetAccess(stream.mediaProvider, stream.hasVideo, function () {
            if (MediaProvider.WebRTC == stream.mediaProvider) {
                me.webRtcMediaManager.newConnection(mediaSessionId, new WebRtcMediaConnection(me.webRtcMediaManager, me.configuration.stunServer, me.configuration.useDTLS, undefined, mediaSessionId));

                me.webRtcMediaManager.createOffer(mediaSessionId, function (sdp) {
                    trace("Publish name " + stream.name);
                    if (me.configuration.stripCodecs && me.configuration.stripCodecs.length > 0) {
                        sdp = me.stripCodecsSDP(sdp, true);
                        console.log("New SDP: " + sdp);
                    }
                    stream.sdp = me.removeCandidatesFromSDP(sdp);
                    me.webSocket.send("publishStream", stream);
                    me.publishStreams.add(stream.name, stream);
                }, true, stream.hasVideo);
            } else if (MediaProvider.Flash == stream.mediaProvider) {
                //todo add pcma/pcmu
                //Priority codec is important because of mediamanager initialize microphone with alaw by default
                stream.sdp = "v=0\r\n" +
                    "o=- 1988962254 1988962254 IN IP4 0.0.0.0\r\n" +
                    "c=IN IP4 0.0.0.0\r\n" +
                    "t=0 0\r\n" +
                    "a=sdplang:en\r\n" +
                    "m=video 0 RTP/AVP 112\r\n" +
                    "a=rtpmap:112 H264/90000\r\n" +
                    "a=fmtp:112 packetization-mode=1; profile-level-id=420020\r\n" +
                    "a=sendonly\r\n" +
                    "m=audio 0 RTP/AVP 8 0 100\r\n" +
                    "a=rtpmap:0 PCMU/8000\r\n" +
                    "a=rtpmap:8 PCMA/8000\r\n" +
                    "a=rtpmap:100 SPEEX/16000\r\n" +
                    "a=sendonly\r\n";
                me.webSocket.send("publishStream", stream);
                me.publishStreams.add(stream.name, stream);

            }
        }, []);

    },

    unPublishStream: function (stream) {
        console.log("Unpublish stream " + stream.name);
        var me = this;
        var removedStream = me.publishStreams.remove(stream.name);
        if (removedStream) {
            if (MediaProvider.WebRTC == removedStream.mediaProvider) {
                me.webRtcMediaManager.close(removedStream.mediaSessionId);
            } else if (MediaProvider.Flash == removedStream.mediaProvider) {
                me.flashMediaManager.unPublishStream(removedStream.mediaSessionId);
            }
            me.webSocket.send("unPublishStream", removedStream);
        }
    },

    shareScreen: function (stream, extensionId) {
        console.log("Share screen with name " + stream.name);
        var me = this;
        var mediaSessionId = createUUID();

        stream.mediaSessionId = mediaSessionId;
        stream.published = true;
        if (stream.record == undefined) {
            stream.record = false;
        }
        if (stream.hasVideo == undefined) {
            stream.hasVideo = true;
        }

        stream.mediaProvider = MediaProvider.WebRTC;
        me.getScreenAccess(extensionId, function(response) {
            if (response.success) {
                me.webRtcMediaManager.newConnection(mediaSessionId, new WebRtcMediaConnection(me.webRtcMediaManager, me.configuration.stunServer, me.configuration.useDTLS, undefined, mediaSessionId));

                me.webRtcMediaManager.createOffer(mediaSessionId, function (sdp) {
                    trace("Publish name for screen sharing " + stream.name);
                    if (me.configuration.stripCodecs && me.configuration.stripCodecs.length > 0) {
                        sdp = me.stripCodecsSDP(sdp, true);
                        console.log("New SDP: " + sdp);
                    }
                    stream.sdp = me.removeCandidatesFromSDP(sdp);
                    me.webSocket.send("publishStream", stream);
                    me.publishStreams.add(stream.name, stream);
                }, true, stream.hasVideo, false, true);
            }
        });
    },

    playStream: function (stream) {
        var me = this;
        var streamObj = me.playStreams.get(stream.name);
        if (streamObj) {
            console.log("Request resume for stream " + stream.name);
            if (streamObj.mediaProvider == MediaProvider.WSPlayer) {
                me.wsPlayerMediaManager.resume();
            }
            me.webSocket.send("playStream", streamObj);
            return;
        }
        var mediaSessionId = createUUID();
        stream.mediaSessionId = mediaSessionId;
        stream.published = false;
        if (stream.record == undefined) {
            stream.record = false;
        }
        if (!stream.mediaProvider) {
            stream.mediaProvider = Object.keys(Flashphoner.getInstance().mediaProviders.getData())[0];
        }


        if (MediaProvider.WebRTC == stream.mediaProvider) {

            me.webRtcMediaManager.newConnection(mediaSessionId, new WebRtcMediaConnection(me.webRtcMediaManager, me.configuration.stunServer, me.configuration.useDTLS, stream.remoteMediaElementId || me.configuration.remoteMediaElementId, mediaSessionId));


            if (stream.hasVideo == undefined) {
                stream.hasVideo = true;
            }

            me.webRtcMediaManager.createOffer(mediaSessionId, function (sdp) {
                console.log("playStream name " + stream.name);
                if (me.configuration.stripCodecs && me.configuration.stripCodecs.length > 0) {
                    sdp = me.stripCodecsSDP(sdp, true);
                    console.log("New SDP: " + sdp);
                }
                stream.sdp = me.removeCandidatesFromSDP(sdp);
                me.webSocket.send("playStream", stream);

                me.playStreams.add(stream.name, stream);
            }, false, false, stream.hasVideo);
            //!stream.sdp is for wsPlayer backward compatibility
        } else if (MediaProvider.Flash == stream.mediaProvider && !stream.sdp){
            //todo add pcma/pcmu
            stream.sdp = "v=0\r\n" +
                "o=- 1988962254 1988962254 IN IP4 0.0.0.0\r\n" +
                "c=IN IP4 0.0.0.0\r\n" +
                "t=0 0\r\n" +
                "a=sdplang:en\r\n"+
                "m=video 0 RTP/AVP 112\r\n" +
                "a=rtpmap:112 H264/90000\r\n" +
                "a=fmtp:112 packetization-mode=1; profile-level-id=420020\r\n" +
                "a=recvonly\r\n" +
                "m=audio 0 RTP/AVP 0 8 100\r\n" +
                "a=rtpmap:0 PCMU/8000\r\n" +
                "a=rtpmap:8 PCMA/8000\r\n" +
                "a=rtpmap:100 SPEEX/16000\r\n" +
                "a=recvonly\r\n";
            me.webSocket.send("playStream", stream);
            me.playStreams.add(stream.name, stream);
        } else if (MediaProvider.WSPlayer == stream.mediaProvider) {
            stream.sdp = "v=0\r\n" +
                "o=- 1988962254 1988962254 IN IP4 0.0.0.0\r\n" +
                "c=IN IP4 0.0.0.0\r\n" +
                "t=0 0\r\n" +
                "a=sdplang:en\r\n" +
                "m=video 0 RTP/AVP 32\r\n" +
                "a=rtpmap:32 MPV/90000\r\n" +
                "a=recvonly\r\n" +
                "m=audio 0 RTP/AVP 0\r\n" +
                "a=rtpmap:0 PCMU/8000\r\n" +
                "a=recvonly\r\n";
            me.webSocket.send("playStream", stream);
            me.playStreams.add(stream.name, stream);
            me.wsPlayerMediaManager.play(stream);
        } else {
            console.log("playStream name " + stream.name);
            me.webSocket.send("playStream", stream);
            me.playStreams.add(stream.name, stream);
        }
        return stream;
    },

    stopStream: function (stream) {
        console.log("unSubscribe stream " + stream.name);
        var me = this;
        var removedStream = me.playStreams.remove(stream.name);
        if (removedStream) {
            me.releaseMediaManagerStream(removedStream);
            me.webSocket.send("stopStream", removedStream);
        }
    },

    //Works only with websocket streams
    pauseStream: function (stream) {
        console.log("Pause stream " + stream.name);
        if (MediaProvider.WSPlayer == stream.mediaProvider && this.wsPlayerMediaManager) {
            this.wsPlayerMediaManager.pause();
        }
        this.webSocket.send("pauseStream", stream);
    },

    releaseMediaManagerStream: function (stream) {
        var me = this;
        if (MediaProvider.WebRTC == stream.mediaProvider && me.webRtcMediaManager) {
            me.webRtcMediaManager.close(stream.mediaSessionId);
        } else if (MediaProvider.Flash == stream.mediaProvider && me.flashMediaManager) {
            if (stream.published) {
                me.flashMediaManager.unPublishStream(stream.mediaSessionId);
            } else {
                me.flashMediaManager.stopStream(stream.mediaSessionId);
            }
        } else if (MediaProvider.WSPlayer == stream.mediaProvider && me.wsPlayerMediaManager) {
            me.wsPlayerMediaManager.stop();
        }
    },

    removeCandidatesFromSDP: function (sdp) {
        var sdpArray = sdp.split("\n");

        for (i = 0; i < sdpArray.length; i++) {
            if (sdpArray[i].search("a=candidate:") != -1) {
                sdpArray[i] = "";
            }
        }

        //normalize sdp after modifications
        var result = "";
        for (i = 0; i < sdpArray.length; i++) {
            if (sdpArray[i] != "") {
                result += sdpArray[i] + "\n";
            }
        }

        return result;
    },

    notifyMediaProviderEvent: function (e) {
        if (e.mediaProvider == MediaProvider.WSPlayer) {
            switch (e.status) {
                case "failed":
                    if (this.connection.status != ConnectionStatus.Disconnected) {
                        this.invokeListener(WCSEvent.MediaProviderStatusEvent, [
                            {mediaProvider: MediaProvider.WSPlayer, status: ConnectionStatus.Failed}
                        ]);
                        this.initWSPlayerMediaManager();
                    }
                    break;
                case "closed":
                    if (this.connection.status != ConnectionStatus.Disconnected) {
                        this.invokeListener(WCSEvent.MediaProviderStatusEvent, [
                            {mediaProvider: MediaProvider.WSPlayer, status: ConnectionStatus.Disconnected}
                        ]);
                    }
                    break;
                case "connected":
                    var playStreamsArray = this.playStreams.array();
                    var i;
                    //check if we have active stream
                    for (i = 0; i < playStreamsArray.length; i++) {
                        if (playStreamsArray[i].mediaProvider == MediaProvider.WSPlayer &&
                            playStreamsArray[i].status == StreamStatus.Playing ||
                            playStreamsArray[i].status == StreamStatus.Paused) {
                            this.wsPlayerMediaManager.play(playStreamsArray[i]);
                            break;
                        }
                    }
                    this.invokeListener(WCSEvent.MediaProviderStatusEvent, [
                        {mediaProvider: MediaProvider.WSPlayer, status: ConnectionStatus.Established}
                    ]);
                    break;
            }
        }
    },

    stripCodecsSDP: function (sdp, removeCandidates) {
        var sdpArray = sdp.split("\n");

        //search and delete codecs line
        var pt = [];
        var i;
        for (p = 0; p < this.configuration.stripCodecs.length; p++) {
            console.log("Searching for codec " + this.configuration.stripCodecs[p]);
            for (i = 0; i < sdpArray.length; i++) {
                if (sdpArray[i].search(this.configuration.stripCodecs[p]) != -1 && sdpArray[i].indexOf("a=rtpmap") == 0) {
                    console.log(this.configuration.stripCodecs[p] + " detected");
                    pt.push(sdpArray[i].match(/[0-9]+/)[0]);
                    sdpArray[i] = "";
                }
            }
        }

        if (removeCandidates) {
            for (i = 0; i < sdpArray.length; i++) {
                if (sdpArray[i].search("a=candidate:") != -1) {
                    sdpArray[i] = "";
                }
            }
        }

        if (pt.length) {
            //searching for fmtp
            for (p = 0; p < pt.length; p++) {
                for (i = 0; i < sdpArray.length; i++) {
                    if (sdpArray[i].search("a=fmtp:" + pt[p]) != -1) {
                        console.log("PT " + pt[p] + " detected");
                        sdpArray[i] = "";
                    }
                }
            }

            //delete entries from m= line
            for (i = 0; i < sdpArray.length; i++) {
                if (sdpArray[i].search("m=audio") != -1) {
                    console.log("m line detected " + sdpArray[i]);
                    var mLineSplitted = sdpArray[i].split(" ");
                    var newMLine = "";
                    for (m = 0; m < mLineSplitted.length; m++) {
                        if (pt.indexOf(mLineSplitted[m]) == -1 || m <= 2) {
                            newMLine += mLineSplitted[m];
                            if (m < mLineSplitted.length - 1) {
                                newMLine = newMLine + " ";
                            }
                        }
                    }
                    sdpArray[i] = newMLine;
                    console.log("Resulting m= line is: " + sdpArray[i]);
                    break;
                }
            }
        }

        //normalize sdp after modifications
        var result = "";
        for (i = 0; i < sdpArray.length; i++) {
            if (sdpArray[i] != "") {
                result += sdpArray[i] + "\n";
            }
        }

        return result;
    },

    handleVideoSSRC: function (sdp) {
        var sdpArray = sdp.split("\n");
        var videoPart = false;
        var recvonly = false;
        var ssrcPos = -1;
        for (i = 0; i < sdpArray.length; i++) {
            if (sdpArray[i].search("m=video") != -1) {
                videoPart = true;
            }
            if (sdpArray[i].search("a=ssrc") != -1 && videoPart) {
                ssrcPos = i;
            }
            if (sdpArray[i].search("a=recvonly") != -1 && videoPart) {
                recvonly = true;
            }
            if (sdpArray[i].search("m=audio") != -1 && videoPart) {
                break;
            }
        }

        if (recvonly && ssrcPos != -1) {
            sdpArray[ssrcPos] = "";
        }

        //normalize sdp after modifications
        var result = "";
        for (i = 0; i < sdpArray.length; i++) {
            if (sdpArray[i] != "") {
                result += sdpArray[i] + "\n";
            }
        }

        return result;
    },

    getScreenAccess: function (extensionId, callback) {
        this.webRtcMediaManager.getScreenAccess(extensionId, callback);
    },

    isScreenSharingExtensionInstalled: function(extensionId, callback) {
        if (this.isChrome()) {
            chrome.runtime.sendMessage(extensionId, {type: "isInstalled"}, function (response) {
                if (response) {
                    callback(true);
                } else {
                    callback(false);
                }
            });
        } else if (this.isFF()) {
            callback(this.firefoxScreenSharingExtensionInstalled);
        }
    },

    checkAndGetAccess: function (mediaProvider, hasVideo, func, args) {
        var me = this;
        if (args === undefined) {
            args = [];
        }
        if (!this.hasAccess(mediaProvider, hasVideo)) {
            if (this.intervalId == -1) {
                var checkAccessFunc = function () {
                    if (me.hasAccess(mediaProvider, hasVideo)) {
                        clearInterval(me.intervalId);
                        me.intervalId = -1;
                        me.checkAndGetAccess(mediaProvider, hasVideo, func, args);
                    }
                };
                this.intervalId = setInterval(checkAccessFunc, 500);
            }
            this.getAccess(mediaProvider, hasVideo);
        } else if (this.hasAccess(mediaProvider, hasVideo)) {
            func.apply(this, args);
        } else {
            trace("Microphone is not plugged in");
        }
    },

    getCookie: function (c_name) {
        var i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            x = x.replace(/^\s+|\s+$/g, "");
            if (x == c_name) {
                return ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            }
        }
        return "";
    },

    setCookie: function (c_name, value) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + 100);
        var c_value = escape(value) + "; expires=" + exdate.toUTCString();
        document.cookie = c_name + "=" + c_value;
        return value;
    }
};

var isFlashphonerAPILoaded = false;
function notifyFlashphonerAPILoaded() {
    isFlashphonerAPILoaded = true;
    Flashphoner.getInstance().initFlashMediaManager();
}

var RTCPeerConnection = null;
var getUserMedia = null;
var attachMediaStream = null;
var reattachMediaStream = null;
var webrtcDetectedBrowser = null;

var WebRtcMediaManager = function () {
    this.webRtcMediaConnections = new DataMap();
    this.audioMuted = 1;
    this.videoMuted = 1;
    this.remoteSDP = {};
    this.onLocalScreenMediaStreamEnded = null;
};

WebRtcMediaManager.prototype.getVolume = function (id) {
    var webRtcMediaConnection = this.webRtcMediaConnections.get(id);
    return webRtcMediaConnection.remoteMediaElement.volume;
};

WebRtcMediaManager.prototype.setVolume = function (id, volume) {
    var webRtcMediaConnection = this.webRtcMediaConnections.get(id);
    webRtcMediaConnection.remoteMediaElement.volume = volume / 100;
};

WebRtcMediaManager.prototype.isVideoMuted = function () {
    if (this.localAudioVideoStream) {
        return !this.localAudioVideoStream.getVideoTracks()[0].enabled;
    } else {
        return true;
    }
};

WebRtcMediaManager.prototype.muteVideo = function () {
    if (this.localAudioVideoStream) {
        this.localAudioVideoStream.getVideoTracks()[0].enabled = false;
    }
};

WebRtcMediaManager.prototype.unmuteVideo = function () {
    if (this.localAudioVideoStream && this.localAudioVideoStream.getVideoTracks().length > 0) {
        this.localAudioVideoStream.getVideoTracks()[0].enabled = true;
    }
};

WebRtcMediaManager.prototype.mute = function () {
    if (this.localAudioStream) {
        this.localAudioStream.getAudioTracks()[0].enabled = false;
    }
    if (this.localAudioVideoStream) {
        this.localAudioVideoStream.getAudioTracks()[0].enabled = false;
    }
};

WebRtcMediaManager.prototype.unmute = function () {
    if (this.localAudioStream) {
        this.localAudioStream.getAudioTracks()[0].enabled = true;
    }
    if (this.localAudioVideoStream) {
        this.localAudioVideoStream.getAudioTracks()[0].enabled = true;
    }
};

WebRtcMediaManager.prototype.hasAccessToAudio = function () {
    return this.audioMuted == -1;
};

WebRtcMediaManager.prototype.hasAccessToAudioAndVideo = function () {
    return this.videoMuted == -1;
};

WebRtcMediaManager.prototype.newConnection = function (id, webRtcMediaConnection) {
    if (this.remoteSDP[id] || this.remoteSDP[id] == "") {
        webRtcMediaConnection.setRemoteSDP(this.remoteSDP[id], false);
        delete this.remoteSDP[id];
    }
    this.webRtcMediaConnections.add(id, webRtcMediaConnection);
};

WebRtcMediaManager.prototype.receivedEmptyRemoteSDP = function (id) {
    var webRtcMediaConnection = this.webRtcMediaConnections.get(id);
    return !webRtcMediaConnection || webRtcMediaConnection.lastReceivedSdp == "";
};

WebRtcMediaManager.prototype.createOffer = function (id, callback, hasAudio, hasVideo, receiveVideo, screenCapture) {
    var webRtcMediaConnection = this.webRtcMediaConnections.get(id);
    webRtcMediaConnection.createOffer(callback, hasAudio, hasVideo, receiveVideo, screenCapture);
};

WebRtcMediaManager.prototype.createAnswer = function (id, callback, hasVideo) {
    var webRtcMediaConnection = this.webRtcMediaConnections.get(id);
    webRtcMediaConnection.createAnswer(callback, hasVideo);
};

WebRtcMediaManager.prototype.setRemoteSDP = function (id, sdp, isInitiator) {
    var webRtcMediaConnection = this.webRtcMediaConnections.get(id);
    if (webRtcMediaConnection) {
        webRtcMediaConnection.setRemoteSDP(sdp, isInitiator);
    } else {
        this.remoteSDP[id] = sdp;
    }
};

WebRtcMediaManager.prototype.getStatistics = function (callId, callbackFn) {
    var webRtcMediaConnection = this.webRtcMediaConnections.get(callId);
    webRtcMediaConnection.getStatistics(callbackFn);
};


WebRtcMediaManager.prototype.setAudioCodec = function (id, codec) {
};

WebRtcMediaManager.prototype.talk = function (callId, hasVideo) {

};

WebRtcMediaManager.prototype.hold = function (callId) {
};

WebRtcMediaManager.prototype.close = function (id) {
    var connection = this.webRtcMediaConnections.remove(id);
    if (connection) {
        connection.close();
        this.unmute();
        this.unmuteVideo();
    }
};

WebRtcMediaManager.prototype.disconnect = function () {
    for (var id in this.webRtcMediaConnections.getData()) {
        this.webRtcMediaConnections.remove(id).close();
    }
};

WebRtcMediaManager.prototype.getAccessToAudioAndVideo = function () {
    var me = this;
    if (!me.localAudioVideoStream) {
        var requestedMedia = {};
        requestedMedia.audio = true;
        requestedMedia.video = {};
        //FF differs from Chrome
        if (webrtcDetectedBrowser == "firefox") {
            requestedMedia.video.width = Flashphoner.getInstance().configuration.videoWidth;
            requestedMedia.video.height = Flashphoner.getInstance().configuration.videoHeight;
        } else {
            requestedMedia.video = {
                mandatory: {
                    maxWidth: Flashphoner.getInstance().configuration.videoWidth,
                    maxHeight: Flashphoner.getInstance().configuration.videoHeight
                },
                optional: []
            };

            if (Flashphoner.getInstance().configuration.forceResolution) {
                requestedMedia.video.mandatory.minWidth = Flashphoner.getInstance().configuration.videoWidth;
                requestedMedia.video.mandatory.minHeight = Flashphoner.getInstance().configuration.videoHeight;
            }
        }
        var mediaStream = function (stream) {
            var localMediaElement = getElement(Flashphoner.getInstance().configuration.localMediaElementId);
            if (localMediaElement) {
                attachMediaStream(localMediaElement, stream);
            }
            me.localAudioVideoStream = stream;
            if (webrtcDetectedBrowser != "firefox") {
                me.audioMuted = -1;
            }
            me.videoMuted = -1;
        };
        var error = function (error) {
            trace("Failed to get access to local media. Error code was " + error.code + ".");
            me.audioMuted = 1;
            me.videoMuted = 1;
            var status = {
                status: WCSError.MIC_CAM_ACCESS_PROBLEM,
                info: "Failed to get access to microphone and camera. Error code was " + error.code + "."
            };
            Flashphoner.getInstance().invokeProblem(status);
        };
        if (Flashphoner.getInstance().checkMediaDevices()) {
            navigator.mediaDevices.getUserMedia(requestedMedia)
                .then(mediaStream)
                .catch(error);
        } else {
            getUserMedia(requestedMedia, mediaStream, error);
        }
    }
    return true;
};

WebRtcMediaManager.prototype.getScreenAccess = function (extensionId, callback) {
    var me = this;
    if (Flashphoner.getInstance().isChrome()) {
        chrome.runtime.sendMessage(extensionId, {type: "isInstalled"}, function (response) {
            if (response) {
                chrome.runtime.sendMessage(extensionId, {type: "getSourceId"}, function (response) {
                    if (response.error) {
                        var status = {
                            status: WCSError.SCREEN_ACCESS_PROBLEM,
                            info: "Permission denied"
                        };
                        Flashphoner.getInstance().invokeProblem(status);
                    } else {
                        var screen_constraints = {
                            audio: false,
                            video: {
                                mandatory: {
                                    maxWidth: Flashphoner.getInstance().configuration.screenSharingVideoWidth,
                                    maxHeight: Flashphoner.getInstance().configuration.screenSharingVideoHeight,
                                    chromeMediaSourceId: response.sourceId,
                                    chromeMediaSource: "desktop"
                                },
                                optional: []
                            }
                        };
                        if (Flashphoner.getInstance().configuration.screenSharingVideoFps) {
                            screen_constraints.video.mandatory.maxFrameRate = Flashphoner.getInstance().configuration.screenSharingVideoFps;
                        }
                        var mediaStream = function (stream) {
                            var localMediaElement2 = getElement(Flashphoner.getInstance().configuration.localMediaElementId2);
                            if (localMediaElement2) {
                                attachMediaStream(localMediaElement2, stream);
                            }
                            me.localScreenCaptureStream = stream;
                            callback({success: true});
                        };
                        var error = function (error) {
                            trace("Failed to get access to screen capture. Error code was " + error.code + ".");
                            callback({success: false});
                            var status = {
                                status: WCSError.SCREEN_ACCESS_PROBLEM,
                                info: "Failed to get access to screen capture. Error code was " + error.code + "."
                            };
                            Flashphoner.getInstance().invokeProblem(status);
                        };
                        if (Flashphoner.getInstance().checkMediaDevices()) {
                            navigator.mediaDevices.getUserMedia(screen_constraints)
                                .then(mediaStream)
                                .catch(error);
                        } else {
                            getUserMedia(screen_constraints, mediaStream, error);
                        };
                    }
                });
            } else {
                var status = {
                    status: WCSError.SCREEN_EXTENSION_UNAVAILABLE,
                    info: "Screen sharing extension not available!"
                };
                Flashphoner.getInstance().invokeProblem(status);
            }
        });
    } else if (Flashphoner.getInstance().isFF()) {
        if (Flashphoner.getInstance().firefoxScreenSharingExtensionInstalled) {
            var constraints = {
                video: {
                    //can be screen, window or application
                    //todo add to method arguments
                    mediaSource: 'window',
                    mandatory: {
                        maxWidth: Flashphoner.getInstance().configuration.screenSharingVideoWidth,
                        maxHeight: Flashphoner.getInstance().configuration.screenSharingVideoHeight
                    }
                }
            };
            if (Flashphoner.getInstance().configuration.screenSharingVideoFps) {
                constraints.video.mandatory.maxFrameRate = Flashphoner.getInstance().configuration.screenSharingVideoFps;
            }
            var mediaStream = function (stream) {
                var localMediaElement2 = getElement(Flashphoner.getInstance().configuration.localMediaElementId2);
                if (localMediaElement2) {
                    attachMediaStream(localMediaElement2, stream);
                }
                me.localScreenCaptureStream = stream;
                callback({success: true});
            };
            var error = function (error) {
                trace("Failed to get access to screen capture. Error code was " + error.code + ".");
                callback({success: false});
                var status = {
                    status: WCSError.SCREEN_ACCESS_PROBLEM,
                    info: "Failed to get access to screen capture. Error code was " + error.code + "."
                };
                Flashphoner.getInstance().invokeProblem(status);
            };
            if (Flashphoner.getInstance.checkMediaDevices()) {
                trace("");
                navigator.mediaDevices.getUserMedia(constraints)
                    .then(mediaStream)
                    .catch(error);
            } else {
                getUserMedia(constraints, mediaStream, error);
            }
        } else {
            var status = {
                status: WCSError.SCREEN_EXTENSION_UNAVAILABLE,
                info: "Screen sharing extension not available!"
            };
            Flashphoner.getInstance().invokeProblem(status);
        }
    } else {
        var status = {
            status: WCSError.SCREEN_EXTENSION_UNAVAILABLE,
            info: "Screen sharing is not supported in this browser!"
        };
        Flashphoner.getInstance().invokeProblem(status);
    }
};

WebRtcMediaManager.prototype.getAccessToAudio = function () {
    var me = this;
    if (!me.localAudioStream) {
        var mediaStream = function (stream) {
            me.localAudioStream = stream;
            me.audioMuted = -1;
        };
        var error = function (error) {
            var status = {
                status: WCSError.MIC_ACCESS_PROBLEM,
                info: "Failed to get access to microphone. Error code was " + error.code + "."
            };
            Flashphoner.getInstance().invokeProblem(status);
            me.audioMuted = 1;
        };
        if (Flashphoner.getInstance().checkMediaDevices()) {
            navigator.mediaDevices.getUserMedia({audio: true})
                .then(mediaStream)
                .catch(error);
        } else {
            getUserMedia({audio: true}, mediaStream, error);
        }
    }
    return true;
};

WebRtcMediaManager.prototype.releaseCameraAndMicrophone = function () {
    if (this.localAudioStream) {
        this.localAudioStream.stop();
        this.localAudioStream = null;
    }
    if (this.localAudioVideoStream) {
        this.localAudioVideoStream.stop();
        this.localAudioVideoStream = null;
    }
    if (this.localScreenCaptureStream) {
        this.localScreenCaptureStream.stop();
        this.localScreenCaptureStream = null;
    }
    this.audioMuted = 1;
    this.videoMuted = 1;
};

var WebRtcMediaConnection = function (webRtcMediaManager, stunServer, useDTLS, remoteMediaElementId, id) {
    var me = this;
    me.webRtcMediaManager = webRtcMediaManager;
    me.peerConnection = null;
    me.peerConnectionState = 'new';
    me.remoteAudioVideoMediaStream = null;
    if (remoteMediaElementId) {
        me.remoteMediaElement = getElement(remoteMediaElementId);
    }
    me.stunServer = stunServer;

    //If we set false immediately, we use false, if it is undefined
    if (useDTLS===false || useDTLS==='false'){
        me.useDTLS = false;
    }else{
        me.useDTLS = true;
    }

    me.lastReceivedSdp = null;
    me.id = id;
    //stun server by default
    //commented to speedup WebRTC call establishment
    //me.stunServer = "stun.l.google.com:19302";
};

WebRtcMediaConnection.prototype.init = function () {
    trace("WebRtcMediaConnection - init");
    this.hasVideo = false;
    this.peerConnection = null;
    this.peerConnectionState = 'new';
    this.remoteAudioVideoMediaStream = null;
};

WebRtcMediaConnection.prototype.close = function () {
    //Commented to prevent termination of rtcMediaManager after MSRP call
    trace("WebRtcMediaConnection - close()");
    if (this.peerConnectionState != 'finished') {
        this.peerConnectionState = 'finished';
        if (this.peerConnection) {
            trace("WebRtcMediaConnection - PeerConnection will be closed");
            if (this.remoteMediaElement) {
                this.remoteMediaElement.pause();
            }
            //check if this was screen sharing media and close it
            if (this.webRtcMediaManager.localScreenCaptureStream) {
                //todo use this.peerConnection.getStreamById() when available in firefox
                var localStreams = this.peerConnection.getLocalStreams();
                var me = this;
                localStreams.some(function (mediaStream) {
                    if (me.webRtcMediaManager.localScreenCaptureStream.id == mediaStream.id) {
                        me.webRtcMediaManager.localScreenCaptureStream.getVideoTracks()[0].stop();
                        me.webRtcMediaManager.localScreenCaptureStream = null;
                        return true;
                    }
                })
            }
            this.peerConnection.close();
        }
    } else {
        console.log("peerConnection already closed, do nothing!");
    }
};


WebRtcMediaConnection.prototype.createPeerConnection = function () {
    trace("WebRtcMediaConnection - createPeerConnection()");
    var application = this;
    if (application.stunServer !== undefined && application.stunServer.length > 0) {
        pc_config = {
            "iceServers": [
                {"url": "stun:" + application.stunServer}
            ]
        };
    } else {
        pc_config = {"iceServers": []};
    }
    this.peerConnection = new RTCPeerConnection(pc_config, {
        "optional": [
            {"DtlsSrtpKeyAgreement": application.useDTLS}
        ]
    });

    this.peerConnection.onaddstream = function (event) {
        application.onOnAddStreamCallback(event);
    };


    this.peerConnection.onremovestream = function (event) {
        application.onOnRemoveStreamCallback(event);
    };
};

WebRtcMediaConnection.prototype.onOnAddStreamCallback = function (event) {
    trace("WebRtcMediaConnection - onOnAddStreamCallback(): event=" + event);
    trace("WebRtcMediaConnection - onOnAddStreamCallback(): event=" + event.stream);
    trace("WebRtcMediaConnection - onOnAddStreamCallback(): event=" + this.remoteMediaElement);
    if (this.peerConnection != null) {
        this.remoteAudioVideoMediaStream = event.stream;
        if (this.remoteMediaElement) {
            attachMediaStream(this.remoteMediaElement, this.remoteAudioVideoMediaStream);
        }
    }
    else {
        console.warn("SimpleWebRtcSipPhone:onOnAddStreamCallback(): this.peerConnection is null, bug in state machine!, bug in state machine!");
    }
};

WebRtcMediaConnection.prototype.onOnRemoveStreamCallback = function (event) {
    trace("WebRtcMediaConnection - onOnRemoveStreamCallback(): event=" + event);
    if (this.peerConnection != null) {
        this.remoteAudioVideoMediaStream = null;
        if (this.remoteMediaElement) {
            this.remoteMediaElement.pause();
        }
    } else {
        console.warn("SimpleWebRtcSipPhone:onOnRemoveStreamCallback(): this.peerConnection is null, bug in state machine!");
    }
};

WebRtcMediaConnection.prototype.waitGatheringIce = function () {
    var me = this;
    if (me.peerConnection != null) {
        sendSdp = function () {
            if (me.peerConnection != null) {
                trace("WebRtcMediaConnection - waitGatheringIce() iceGatheringState=" + me.peerConnection.iceGatheringState);
                if (me.peerConnection.iceGatheringState == "complete") {
                    trace("WebRtcMediaConnection - setLocalSDP: sdp=" + me.peerConnection.localDescription.sdp);
                    if (me.peerConnectionState == 'preparing-offer') {
                        me.peerConnectionState = 'offer-sent';
                        me.createOfferCallback(me.peerConnection.localDescription.sdp);// + this.candidates);
                    }
                    else if (me.peerConnectionState == 'preparing-answer') {
                        me.peerConnectionState = 'established';
                        me.createAnswerCallback(me.peerConnection.localDescription.sdp);// + this.candidates);
                    }
                    else if (me.peerConnectionState == 'established') {
                    }
                    else {
                        console.log("WebRtcMediaConnection - onIceCandidateCallback(): RTCPeerConnection bad state!");
                    }
                    clearInterval(me.iceIntervalId);
                }
            } else {
                clearInterval(me.iceIntervalId);
            }
        };
        me.iceIntervalId = setInterval(sendSdp, 500);

    }
    else {
        console.warn("WebRtcMediaConnection - onIceCandidateCallback(): this.peerConnection is null, bug in state machine!");
    }
};

WebRtcMediaConnection.prototype.getConstraints = function (receiveVideo, screenCapture) {
    var constraints = {};
    if (webrtcDetectedBrowser == "firefox") {
        constraints = {offerToReceiveAudio: !screenCapture, offerToReceiveVideo: receiveVideo};
    } else {
        constraints = {optional: [], mandatory: {OfferToReceiveAudio: true, OfferToReceiveVideo: receiveVideo}};
    }
    return constraints;
};

WebRtcMediaConnection.prototype.createOffer = function (createOfferCallback, hasAudio, hasVideo, receiveVideo, screenCapture) {
    trace("WebRtcMediaConnection - createOffer()");
    var me = this;
    try {
        if (me.getConnectionState() != "established") {
            trace("Connection state is not established. Initializing...");
            me.init();
        }
        var mandatory = {};
        if (me.peerConnection == null) {
            trace("peerConnection is null");
            me.createPeerConnection();
            if (screenCapture) {
                if (me.webRtcMediaManager.localScreenCaptureStream) {
                    me.peerConnection.addStream(me.webRtcMediaManager.localScreenCaptureStream);
                    mandatory = me.getConstraints(receiveVideo, screenCapture);
                    me.webRtcMediaManager.localScreenCaptureStream.onended = function(event) {
                        if (me.peerConnectionState != 'finished') {
                            me.webRtcMediaManager.onLocalScreenMediaStreamEnded(me.id);
                        }
                    }
                }
            } else if (hasAudio && hasVideo) {
                if (me.webRtcMediaManager.videoTrack) {
                    me.webRtcMediaManager.localAudioVideoStream.addTrack(me.webRtcMediaManager.videoTrack);
                    me.webRtcMediaManager.videoTrack = null;
                }
                me.peerConnection.addStream(me.webRtcMediaManager.localAudioVideoStream);
            } else if (hasAudio) {
                if (me.webRtcMediaManager.localAudioStream) {
                    me.peerConnection.addStream(me.webRtcMediaManager.localAudioStream);
                } else {
                    var localAudioVideoStream = me.webRtcMediaManager.localAudioVideoStream;
                    if (localAudioVideoStream.getVideoTracks().length > 0) {
                        me.webRtcMediaManager.videoTrack = localAudioVideoStream.getVideoTracks()[0];
                        localAudioVideoStream.removeTrack(me.webRtcMediaManager.videoTrack);
                    }
                    me.peerConnection.addStream(me.webRtcMediaManager.localAudioVideoStream);
                }
                mandatory = me.getConstraints(receiveVideo);
            } else {
                if (receiveVideo == undefined) {
                    receiveVideo = true;
                }
                mandatory = me.getConstraints(receiveVideo);
            }
        }
        me.createOfferCallback = createOfferCallback;
        me.peerConnection.createOffer(function (offer) {
            me.onCreateOfferSuccessCallback(offer);
        }, function (error) {
            me.onCreateOfferErrorCallback(error);
        }, mandatory);

    }
    catch (exception) {
        console.error("WebRtcMediaConnection - createOffer(): catched exception:" + exception);
    }
};

WebRtcMediaConnection.prototype.createAnswer = function (createAnswerCallback, hasVideo) {
    var me = this;
    trace("WebRtcMediaConnection - createAnswer() me.getConnectionState(): " + me.getConnectionState() + " me.hasVideo: " + me.hasVideo);
    if (me.getConnectionState() != "established") {
        me.init();
    }
    try {

        if (me.peerConnection == null) {
            me.createPeerConnection();
            if (hasVideo) {
                if (me.webRtcMediaManager.videoTrack) {
                    me.webRtcMediaManager.localAudioVideoStream.addTrack(me.webRtcMediaManager.videoTrack);
                    me.webRtcMediaManager.videoTrack = null;
                }
                me.peerConnection.addStream(me.webRtcMediaManager.localAudioVideoStream);
            } else {
                if (me.webRtcMediaManager.localAudioStream) {
                    me.peerConnection.addStream(me.webRtcMediaManager.localAudioStream);
                } else {
                    var localAudioVideoStream = me.webRtcMediaManager.localAudioVideoStream;
                    if (localAudioVideoStream.getVideoTracks().length > 0) {
                        me.webRtcMediaManager.videoTrack = localAudioVideoStream.getVideoTracks()[0];
                        localAudioVideoStream.removeTrack(me.webRtcMediaManager.videoTrack);
                    }
                    me.peerConnection.addStream(me.webRtcMediaManager.localAudioVideoStream);
                }
            }
        }
        me.createAnswerCallback = createAnswerCallback;

        var sdpOffer = new RTCSessionDescription({
            type: 'offer',
            sdp: me.lastReceivedSdp
        });
        me.peerConnectionState = 'offer-received';
        me.peerConnection.setRemoteDescription(sdpOffer, function () {
            me.onSetRemoteDescriptionSuccessCallback();
        }, function (error) {
            me.onSetRemoteDescriptionErrorCallback(error);
        });
    }
    catch (exception) {
        console.error("WebRtcMediaConnection - createAnswer(): catched exception:" + exception);
    }
};

WebRtcMediaConnection.prototype.onCreateOfferSuccessCallback = function (offer) {
    trace("WebRtcMediaConnection - onCreateOfferSuccessCallback this.peerConnection: " + this.peerConnection + " this.peerConnectionState: " + this.peerConnectionState);
    if (this.peerConnection != null) {
        if (this.peerConnectionState == 'new' || this.peerConnectionState == 'established') {
            var application = this;
            this.peerConnectionState = 'preparing-offer';
            this.peerConnection.setLocalDescription(offer, function () {
                application.onSetLocalDescriptionSuccessCallback(offer.sdp);
            }, function (error) {
                application.onSetLocalDescriptionErrorCallback(error);
            });
        }
        else {
            console.error("WebRtcMediaConnection - onCreateOfferSuccessCallback(): RTCPeerConnection bad state!");
        }
    }
    else {
        console.warn("SimpleWebRtcSipPhone:onCreateOfferSuccessCallback(): this.peerConnection is null, bug in state machine!");
    }
};

WebRtcMediaConnection.prototype.onSetLocalDescriptionSuccessCallback = function (sdp) {
    trace("WebRtcMediaConnection - onSetLocalDescriptionSuccessCallback");
    if (webrtcDetectedBrowser == "firefox") {
        trace("WebRtcMediaConnection - onSetLocalDescriptionSuccessCallback: sdp=" + sdp);
        if (this.peerConnectionState == 'preparing-offer') {
            trace("Current PeerConnectionState is 'preparing-offer' sending offer...");
            this.peerConnectionState = 'offer-sent';
            this.createOfferCallback(sdp);
        }
        else if (this.peerConnectionState == 'preparing-answer') {
            trace("Current PeerConnectionState is 'preparing-answer' going to established...");
            this.peerConnectionState = 'established';
            this.createAnswerCallback(sdp);
        }
    } else {
        this.waitGatheringIce();
    }
};

WebRtcMediaConnection.prototype.getConnectionState = function () {
    return this.peerConnectionState;
};

WebRtcMediaConnection.prototype.setRemoteSDP = function (sdp, isInitiator) {
    if (webrtcDetectedBrowser == "chrome" && (Flashphoner.getInstance().configuration.maxBitRate != null || Flashphoner.getInstance().configuration.minBitRate != null)) {
        // Search VP8 payload in SDP
        var a = sdp.split("\r\n");
        var attr = "a=fmtp:";
        for (var i=0; i< a.length; i++) {
            if (/a=rtpmap:\d+ VP8.*/gi.test(a[i])) {
                attr += a[i].replace(/(a=rtpmap:)(\d+)( VP8.*)/,'$2');
            }
        }
        if (Flashphoner.getInstance().configuration.minBitRate != null) {
            attr += " x-google-min-bitrate=" + Flashphoner.getInstance().configuration.minBitRate + ";";
        }
        if (Flashphoner.getInstance().configuration.maxBitRate != null) {
            attr += " x-google-max-bitrate=" + Flashphoner.getInstance().configuration.maxBitRate + ";";
        }
        attr += "\r\n";
        trace("Appending bitrate limit: " + attr);
        sdp = sdp.replace(/(a=rtpmap:100 .*\r\n)/g, '$1'+attr);
    }
    trace("WebRtcMediaConnection - setRemoteSDP: isInitiator: " + isInitiator + " sdp=" + sdp);
    if (isInitiator) {
        var sdpAnswer = new RTCSessionDescription({
            type: 'answer',
            sdp: sdp
        });
        var application = this;
        this.peerConnectionState = 'answer-received';
        this.peerConnection.setRemoteDescription(sdpAnswer, function () {
            application.onSetRemoteDescriptionSuccessCallback();
        }, function (error) {
            application.onSetRemoteDescriptionErrorCallback(error);
        });
    } else {
        this.lastReceivedSdp = sdp;
    }
};

WebRtcMediaConnection.prototype.onSetRemoteDescriptionSuccessCallback = function () {
    trace("onSetRemoteDescriptionSuccessCallback");
    if (this.peerConnection != null) {
        if (this.peerConnectionState == 'answer-received') {
            trace("Current PeerConnectionState is 'answer-received' changing the PeerConnectionState to 'established'");
            this.peerConnectionState = 'established';
        }
        else if (this.peerConnectionState == 'offer-received') {
            trace("Current PeerConnectionState is 'offer-received' creating appropriate answer...");
            var application = this;
            this.peerConnection.createAnswer(function (answer) {
                application.onCreateAnswerSuccessCallback(answer);
            }, function (error) {
                application.onCreateAnswerErrorCallback(error);
            });
        }
        else {
            console.log("WebRtcMediaConnection - onSetRemoteDescriptionSuccessCallback(): RTCPeerConnection bad state!");
        }
    }
    else {
        console.warn("SimpleWebRtcSipPhone:onSetRemoteDescriptionSuccessCallback(): this.peerConnection is null, bug in state machine!");
    }
};


WebRtcMediaConnection.prototype.onCreateAnswerSuccessCallback = function (answer) {
    trace("onCreateAnswerSuccessCallback " + this.peerConnection);
    if (this.peerConnection != null) {
        if (this.peerConnectionState == 'offer-received') {
            trace("Current PeerConnectionState is 'offer-received', preparing answer...");
            // Prepare answer.
            var application = this;
            this.peerConnectionState = 'preparing-answer';
            this.peerConnection.setLocalDescription(answer, function () {
                application.onSetLocalDescriptionSuccessCallback(answer.sdp);
            }, function (error) {
                application.onSetLocalDescriptionErrorCallback(error);
            });
        }
        else {
            console.log("WebRtcMediaConnection - onCreateAnswerSuccessCallback(): RTCPeerConnection bad state!");
        }
    }
    else {
        console.warn("SimpleWebRtcSipPhone:onCreateAnswerSuccessCallback(): this.peerConnection is null, bug in state machine!");
    }
};

WebRtcMediaConnection.prototype.getStatistics = function (callbackFn) {
    var me = this;
    if (this.peerConnection && this.peerConnection.getRemoteStreams()[0] && webrtcDetectedBrowser == "chrome") {
        if (this.peerConnection.getStats) {
            this.peerConnection.getStats(function (rawStats) {
                var results = rawStats.result();
                var result = {type: "chrome", outgoingStreams: {}, incomingStreams: {}};
                for (var i = 0; i < results.length; ++i) {
                    var resultPart = me.processGoogRtcStatsReport(results[i]);
                    if (resultPart != null) {
                        if (resultPart.type == "googCandidatePair") {
                            result.activeCandidate = resultPart;
                        } else if (resultPart.type == "ssrc") {
                            if (resultPart.transportId.indexOf("audio") > -1) {
                                if (resultPart.id.indexOf("send") > -1) {
                                    result.outgoingStreams.audio = resultPart;
                                } else {
                                    result.incomingStreams.audio = resultPart;
                                }

                            } else {
                                if (resultPart.id.indexOf("send") > -1) {
                                    result.outgoingStreams.video = resultPart;
                                } else {
                                    result.incomingStreams.video = resultPart;
                                }

                            }
                        }
                    }
                }
                callbackFn(result);
            }, function (error) {
                console.log("Error received " + error);
            });

        }
    } else if (this.peerConnection && this.peerConnection.getRemoteStreams()[0] && webrtcDetectedBrowser == "firefox") {
        if (this.peerConnection.getStats) {
            this.peerConnection.getStats(null, function (rawStats) {
                var result = {type: "firefox", outgoingStreams: {}, incomingStreams: {}};
                for (var k in rawStats) {
                    if (rawStats.hasOwnProperty(k)) {
                        var resultPart = me.processRtcStatsReport(rawStats[k]);
                        if (resultPart != null) {
                            if (resultPart.type == "outboundrtp") {
                                if (resultPart.id.indexOf("audio") > -1) {
                                    result.outgoingStreams.audio = resultPart;
                                } else {
                                    result.outgoingStreams.video = resultPart;
                                }
                            } else if (resultPart.type == "inboundrtp") {
                                if (resultPart.id.indexOf("audio") > -1) {
                                    result.incomingStreams.audio = resultPart;
                                } else {
                                    result.incomingStreams.video = resultPart;
                                }
                            }
                        }
                    }
                }
                callbackFn(result);
            }, function (error) {
                console.log("Error received " + error);
            });
        }
    }
};

WebRtcMediaConnection.prototype.processRtcStatsReport = function (report) {
    /**
     * RTCStatsReport http://mxr.mozilla.org/mozilla-central/source/dom/webidl/RTCStatsReport.webidl
     */
    var result = null;
    if (report.type && (report.type == "outboundrtp" || report.type == "inboundrtp") && report.id.indexOf("rtcp") == -1) {
        result = {};
        for (var k in report) {
            if (report.hasOwnProperty(k)) {
                result[k] = report[k];
            }
        }
    }

    return result;
};

WebRtcMediaConnection.prototype.processGoogRtcStatsReport = function (report) {
    /**
     * Report types: googComponent, googCandidatePair, googCertificate, googLibjingleSession, googTrack, ssrc
     */
    var gotResult = false;
    var result = null;
    if (report.type && report.type == "googCandidatePair") {
        //check if this is active pair
        if (report.stat("googActiveConnection") == "true") {
            gotResult = true;
        }
    }

    if (report.type && report.type == "ssrc") {
        gotResult = true;
    }

    if (gotResult) {
        //prepare object
        result = {};
        result.timestamp = report.timestamp;
        result.id = report.id;
        result.type = report.type;
        if (report.names) {
            var names = report.names();
            for (var i = 0; i < names.length; ++i) {
                var attrName = names[i];
                result[attrName] = report.stat(attrName);
            }
        }
    }
    return result;
};

WebRtcMediaConnection.prototype.onCreateAnswerErrorCallback = function (error) {
    console.error("WebRtcMediaConnection - onCreateAnswerErrorCallback(): error: " + error);
};
WebRtcMediaConnection.prototype.onCreateOfferErrorCallback = function (error) {
    console.error("WebRtcMediaConnection - onCreateOfferErrorCallback(): error: " + error);
};
WebRtcMediaConnection.prototype.onSetLocalDescriptionErrorCallback = function (error) {
    console.error("WebRtcMediaConnection - onSetLocalDescriptionErrorCallback(): error: " + error);
};
WebRtcMediaConnection.prototype.onSetRemoteDescriptionErrorCallback = function (error) {
    console.error("WebRtcMediaConnection - onSetRemoteDescriptionErrorCallback(): error: " + error);
};

Configuration = function () {
    this.remoteMediaElementId = null;
    this.localMediaElementId = null;
    this.localMediaElementId2 = null;
    this.elementIdForSWF = null;
    this.pathToSWF = null;
    this.swfParams = {};
    this.urlWsServer = null;
    this.urlFlashServer = null;
    this.forceFlashForWebRTCBrowser = null;
    this.sipRegisterRequired = true;
    this.sipContactParams = null;

    this.wsPlayerCanvas = null;
    this.wsPlayerReceiverPath = null;
    this.wsPlayerStartWithVideoOnly = false;

    this.videoWidth = 640;
    this.videoHeight = 480;
    this.screenSharingVideoWidth = 1920;
    this.screenSharingVideoHeight = 1080;
    this.screenSharingVideoFps = 10;
    this.forceResolution = false;
    this.audioReliable = false;
    this.videoReliable = false;
    this.flashBufferTime = null;

    // kbps (ex. minBitRate=200 means 200kbps)
    this.minBitRate = null;
    this.maxBitRate = null;

    this.stunServer = "";

    this.stripCodecs = [];

    this.imdnEnabled = false;
    this.msgContentType = "text/plain";

    this.pushLogEnabled = false;
};

var Connection = function () {
    this.urlServer = undefined;
    this.sipLogin = "";
    this.sipPassword = "";
    this.sipAuthenticationName = "";
    this.sipDomain = "";
    this.sipOutboundProxy = "";
    this.sipPort = 5060;
    this.sipRegisterRequired = true;
    this.appKey = "defaultApp";
    this.status = ConnectionStatus.Pending;
    this.mediaProviders = [];
    this.width = "";
    this.height = "";
};

var ConnectionStatus = function () {
};
ConnectionStatus.Pending = "PENDING";
ConnectionStatus.Registered = "REGISTERED";
ConnectionStatus.Established = "ESTABLISHED";
ConnectionStatus.Disconnected = "DISCONNECTED";
ConnectionStatus.Failed = "FAILED";

var RegistrationStatus = function () {
};
RegistrationStatus.Registered = "REGISTERED";
RegistrationStatus.Unregistered = "UNREGISTERED";
RegistrationStatus.Failed = "FAILED";

var Call = function () {
    this.callId = "";
    this.status = "";
    this.caller = "";
    this.callee = "";
    this.incoming = false;
    this.receiveVideo = false;
    this.visibleName = "";
    this.inviteParameters = {};
    this.mediaProvider = undefined;
};

MediaProvider = function () {
};
MediaProvider.WebRTC = "WebRTC";
MediaProvider.Flash = "Flash";
MediaProvider.WSPlayer = "WSPlayer";

var CallStatus = function () {
};
CallStatus.RING = "RING";
CallStatus.RING_MEDIA = "RING_MEDIA";
CallStatus.HOLD = "HOLD";
CallStatus.ESTABLISHED = "ESTABLISHED";
CallStatus.FINISH = "FINISH";
CallStatus.BUSY = "BUSY";
CallStatus.SESSION_PROGRESS = "SESSION_PROGRESS";
CallStatus.FAILED = "FAILED";

var DtmfType = function () {
};

DtmfType.info = "INFO";
DtmfType.info_relay = "INFO_RELAY";
DtmfType.rfc2833 = "RFC2833";

var Message = function () {
    this.from = "";
    this.to = "";
    this.visibleName = undefined;
    this.body = "";
    this.contentType = "";
    this.isImdnRequired = false;
};

var MessageStatus = function () {
};
MessageStatus.SENT = "SENT";
MessageStatus.ACCEPTED = "ACCEPTED";
MessageStatus.FAILED = "FAILED";
MessageStatus.IMDN_NOTIFICATION_SENT = "IMDN_NOTIFICATION_SENT";
MessageStatus.IMDN_DELIVERED = "IMDN_DELIVERED";
MessageStatus.IMDN_FAILED = "IMDN_FAILED";
MessageStatus.IMDN_FORBIDDEN = "IMDN_FORBIDDEN";
MessageStatus.IMDN_ERROR = "IMDN_ERROR";
MessageStatus.RECEIVED = "RECEIVED";

var Stream = function () {
    this.mediaSessionId = null;
    this.name = "";
    this.published = false;
    this.hasVideo = false;
    this.status = StreamStatus.Pending;
    this.sdp = "";
    this.info = null;
    this.remoteMediaElementId = null;
    this.record = false;
};

var StreamStatus = function () {
};
StreamStatus.Pending = "PENDING";
StreamStatus.Publishing = "PUBLISHING";
StreamStatus.Playing = "PLAYING";
StreamStatus.Paused = "PAUSED";
StreamStatus.Unpublished = "UNPUBLISHED";
StreamStatus.Stoped = "STOPPED";
StreamStatus.Failed = "FAILED";
StreamStatus.LocalStreamStopped = "LOCAL_STREAM_STOPPED";
StreamStatus.PlaybackProblem = "PLAYBACK_PROBLEM";

var WCSEvent = function () {
};
WCSEvent.ErrorStatusEvent = "ERROR_STATUS_EVENT";
WCSEvent.ConnectionStatusEvent = "CONNECTION_STATUS_EVENT";
WCSEvent.MediaProviderStatusEvent = "MEDIA_PROVIDER_STATUS_EVENT";
WCSEvent.RegistrationStatusEvent = "REGISTRATION_STATUS_EVENT";
WCSEvent.OnCallEvent = "ON_CALL_EVENT";
WCSEvent.CallStatusEvent = "CALL_STATUS_EVENT";
WCSEvent.OnMessageEvent = "ON_MESSAGE_EVENT";
WCSEvent.MessageStatusEvent = "MESSAGE_STATUS_EVENT";
WCSEvent.RecordingStatusEvent = "RECORDING_STATUS_EVENT";
WCSEvent.SubscriptionStatusEvent = "SUBSCRIPTION_STATUS_EVENT";
WCSEvent.StreamStatusEvent = "ON_STREAM_STATUS_EVENT";
WCSEvent.XcapStatusEvent = "XCAP_STATUS_EVENT";
WCSEvent.BugReportStatusEvent = "BUG_REPORT_STATUS_EVENT";
WCSEvent.OnDataEvent = "ON_DATA_EVENT";
WCSEvent.DataStatusEvent = "DATA_STATUS_EVENT";
WCSEvent.TransferStatusEvent = "TRANSFER_STATUS_EVENT";
WCSEvent.OnTransferEvent = "ON_TRANSFER_EVENT";
WCSEvent.OnBinaryEvent = "ON_BINARY_EVENT";
WCSEvent.OnVideoFormatEvent = "ON_VIDEO_FORMAT_EVENT";

var WCSError = function () {
};
WCSError.MIC_ACCESS_PROBLEM = "MIC_ACCESS_PROBLEM";
WCSError.MIC_CAM_ACCESS_PROBLEM = "MIC_CAM_ACCESS_PROBLEM";
WCSError.SCREEN_ACCESS_PROBLEM = "SCREEN_ACCESS_PROBLEM";
WCSError.SCREEN_EXTENSION_UNAVAILABLE = "SCREEN_EXTENSION_UNAVAILABLE";
WCSError.AUTHENTICATION_FAIL = "AUTHENTICATION_FAIL";
WCSError.USER_NOT_AVAILABLE = "USER_NOT_AVAILABLE";
WCSError.TOO_MANY_REGISTER_ATTEMPTS = "TOO_MANY_REGISTER_ATTEMPTS";
WCSError.LICENSE_RESTRICTION = "LICENSE_RESTRICTION";
WCSError.LICENSE_NOT_FOUND = "LICENSE_NOT_FOUND";
WCSError.INTERNAL_SIP_ERROR = "INTERNAL_SIP_ERROR";
WCSError.CONNECTION_ERROR = "CONNECTION_ERROR";
WCSError.REGISTER_EXPIRE = "REGISTER_EXPIRE";
WCSError.SIP_PORTS_BUSY = "SIP_PORTS_BUSY";
WCSError.MEDIA_PORTS_BUSY = "MEDIA_PORTS_BUSY";
WCSError.WRONG_SIPPROVIDER_ADDRESS = "WRONG_SIPPROVIDER_ADDRESS";
WCSError.CALLEE_NAME_IS_NULL = "CALLEE_NAME_IS_NULL";
WCSError.WRONG_FLASHPHONER_XML = "WRONG_FLASHPHONER_XML";
WCSError.PAYMENT_REQUIRED = "PAYMENT_REQUIRED";
WCSError.REST_AUTHORIZATION_FAIL = "REST_AUTHORIZATION_FAIL";
WCSError.REST_FAIL = "REST_FAIL";


var DataMap = function () {
    this.data = {};
};

DataMap.prototype = {

    add: function (id, data) {
        this.data[id] = data;
    },

    update: function (id, data) {
        this.data[id] = data;
    },

    get: function (id) {
        return this.data[id];
    },

    remove: function (id) {
        var data = this.data[id];
        delete this.data[id];
        return data;
    },

    getSize: function () {
        return Object.size(this.data);
    },

    getData: function () {
        return this.data;
    },

    array: function () {
        var callArray = [];
        for (var o in this.data) {
            callArray.push(this.data[o]);
        }
        return callArray;
    }
};

function getElement(str) {
    return document.getElementById(str);
}

var isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function escapeXmlTags(stringXml) {
    return stringXml.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function createUUID() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");

    return uuid.substring(0, 18);
}


function trace(logMessage) {

    var today = new Date();
    // get hours, minutes and seconds
    var hh = today.getUTCHours().toString();
    var mm = today.getUTCMinutes().toString();
    var ss = today.getUTCSeconds().toString();
    var ms = today.getUTCMilliseconds().toString();

    // Add leading '0' to see 14:08:06.001 instead of 14:8:6.1
    hh = hh.length == 1 ? "0" + hh : hh;
    mm = mm.length == 1 ? "0" + mm : mm;
    ss = ss.length == 1 ? "0" + ss : ss;
    ms = ms.length == 1 ? "00" + ms : ms.length == 2 ? "0" + ms : ms;

    // set time
    var time = "UTC " + hh + ':' + mm + ':' + ss + '.' + ms;

    var logMessage = time + ' - ' + logMessage;

    var console = $("#console");

    if (console.length > 0) {

        // Check if console is scrolled down? Or may be you are reading previous messages.
        var isScrolled = (console[0].scrollHeight - console.height() + 1) / (console[0].scrollTop + 1 + 37);
        console.append(logMessage + '<br>');
    }
    //check if push_log enabled
    if (Flashphoner.getInstance().configuration.pushLogEnabled) {
        var result = Flashphoner.getInstance().pushLogs({logs: logs + logMessage + '\n'});
        if (!result) {
            logs += logMessage + '\n';
        } else {
            logs = "";
        }
    } else {
        logs = "";
    }

    try {
        window.console.debug(logMessage);
    } catch (err) {
        //Not supported. For example IE
    }

    //Autoscroll cosole if you are not reading previous messages
    if (isScrolled < 1) {
        console[0].scrollTop = console[0].scrollHeight;
    }
}
//LICENSE! This Code can be used and executed as a part of Flashphoner Web Call Server platform and having an appropriate Web Call Server license. You shall not use this code separately from Web Call Server platform. Contacts: http://flashphoner.com, support@flashphoner.com.
var requestAnimFrame=(function(){return function(callback){window.setTimeout(callback,33.333333333333336);};})();function WSPlayer(canvas,A7){this.canvas=canvas;this.f=N.Aa;this.AZ=false;this.A7=A7;}WSPlayer.prototype.init=function(K,audioContext){this.K=K;this.l();try{this.T=new AudioPlayer(audioContext);}catch(e){wsLogger.error("Failed to init audio player "+e);return;}try{this.M=new VideoRenderer(this.canvas,false,"yuv");this.M.init();}catch(e){wsLogger.error("Failed to init video renderer "+e);return;}try{if(this.j){this.j.terminate();}this.j=new Worker(K.receiverPath);this.j.addEventListener("message",(function(e){switch(e.data.message){case"connection":if(e.data.status=="failed"||e.data.status=="closed"){this.stop();this.AZ=false;}this.A7.notifyMediaProviderEvent({mediaProvider:MediaProvider.WSPlayer,status:e.data.status});break;case"AVData":var C;if(e.data.audioLength>0){this.BU=true;for(C=0;C<e.data.audio.length;C++){this.T.B9(e.data.audio[C]);}}if(e.data.videoLength>0){this.BN=true;for(C=0;C<e.data.video.length;C++){this.AC.push(e.data.video[C]);}this.B2=e.data.videoLength/e.data.video.length;}var B0=this.T.BA();if(this.AC.length>0){if(this.f==N.AX){if(this.M.AT){this.R.length=0;this.q.length=0;while(this.AC.length>0){if(this.AC[0].ts<B0+50){this.AA();}else{break;}}}else if(this.q.length<2){this.AA();}}else{while(this.AA()){}}}this.j.postMessage({message:"ack",data:{seq:e.data.seq,time:Date.now(),audioReceivedLength:e.data.audioLength,videoReceivedLength:e.data.videoLength,audioCurrentTime:B0,audioBufferTimeLength:this.T.getBufferTimeLength(),videoBufferTimeLength:(this.AC.length+this.q.length+this.R.length)*this.B2}});break;default:wsLogger.error("Unknown request");}}).bind(this),false);var conf={};conf.audioChunkLength=this.T.internalBufferSize;conf.audioContextSampleRate=this.T.O.sampleRate;conf.videoWidth=K.videoWidth;conf.videoHeight=K.videoHeight;conf.urlWsServer=K.urlWsServer;conf.token=K.token;conf.audioBufferWaitFor=K.audioBufferWaitFor;conf.videoBufferWaitFor=K.videoBufferWaitFor;conf.dropDelayMultiplier=K.dropDelayMultiplier;this.j.postMessage({message:"init",data:conf});}catch(e){wsLogger.error("Failed to init stream receiver "+e);return;}try{if(this.AL){this.AL.terminate();}this.AL=new Worker(K.decoderPath);this.AL.onmessage=(function(e){if(this.q.length==0){wsLogger.warn("No timestamp available for decoded picture, discarding");return;}e.data.sync=this.q.shift();this.R.push(e.data);if(this.f!=N.AX){if(this.R.length<5){if(this.R.length>1&&this.T.Z.length>0){if(this.T.Z[0].sync>this.R[0].sync){this.R[0]=null;this.R.shift();}}this.AA();}else{this.f=N.AX;this.T.start();requestAnimFrame(this.A9.bind(this));}}else{if(this.q.length<2){this.AA();}}}).bind(this);this.AL.postMessage({message:"init",width:K.videoWidth,height:K.videoHeight,outputGl:true});}catch(e){wsLogger.error("Failed to init video decoder "+e);return;}this.CH=0;this.CO=0;this.BI=0;this.DC=false;this.DA=0;this.AZ=true;};WSPlayer.prototype.l=function(){this.BU=false;this.BN=false;if(this.AC){this.AC.length=0;}else{this.AC=[];}if(this.q){this.q.length=0;}else{this.q=[];}if(this.R){this.R.length=0;}else{this.R=[];}this.Be=false;};WSPlayer.prototype.AA=function(){if(this.AC.length>0){if(this.Be||this.AC[0].kframe){this.Be=true;if(!this.M.AT){this.q.push(this.AC[0].ts);}this.AL.postMessage({message:"decode",skip:this.M.AT,data:this.AC[0].payload},[this.AC[0].payload.buffer]);this.AC[0]=null;this.AC.shift();return true;}this.AC[0]=null;this.AC.shift();}};WSPlayer.prototype.play=function(stream){if(!this.AZ){wsLogger.error("Can't play stream, player not initialized!");return;}this.l();this.j.postMessage({message:"play"});this.stream=stream;this.unmute();this.f=N.BY;};WSPlayer.prototype.pause=function(){this.mute();this.j.postMessage({message:"pause"});this.f=N.CR;};WSPlayer.prototype.mute=function(){if(this.T){this.T.mute(true);}if(this.M){this.M.mute(true);}};WSPlayer.prototype.unmute=function(){if(this.T){this.T.mute(false);}if(this.M){this.M.mute(false);}};WSPlayer.prototype.resume=function(){this.l();this.f=N.BY;this.j.postMessage({message:"resume"});this.unmute();};WSPlayer.prototype.stop=function(){this.f=N.Aa;if(this.j){this.j.postMessage({message:"stop"});}if(this.T){this.T.stop();}if(this.M){this.M.stop();}this.CH=0;this.CO=0;this.BI=0;};WSPlayer.prototype.A9=function(CQ){if(this.f!=N.AX){return;}if(this.R.length>0){var Af=this.T.BA();if(Af==-1){requestAnimFrame(this.A9.bind(this));return;}wsLogger.trace("requestVideoFrameCallback, audio player time "+Af+" callback timestamp "+CQ);if(Af-this.R[0].sync>100&&this.R.length>1){this.R.shift();}if(this.R[0].sync<=Af){this.M.CT(this.R.shift());this.BI++;if(this.BI==1){this.stream.status=StreamStatus.Playing;this.stream.info="FIRST_FRAME_RENDERED";this.A7.invokeListener(WCSEvent.StreamStatusEvent,[this.stream]);this.stream.info="";}}}if(this.q.length<3){this.AA();}requestAnimFrame(this.A9.bind(this));};WSPlayer.prototype.DN=function(message){if(this.Bb){if(Date.now()-this.Bb<1000){return;}}this.stream.status=StreamStatus.PlaybackProblem;this.stream.info=message;this.A7.invokeListener(WCSEvent.StreamStatusEvent,[this.stream]);this.Bb=Date.now();};WSPlayer.prototype.Bv=function(text){var U=this.M.V;if(U){var textSize=U.measureText(text);U.fillStyle="white";var rectHeight=30;U.fillRect(0,this.canvas.height/2-rectHeight/2,this.canvas.width,rectHeight);U.fillStyle="black";U.font="30pt";U.textAlign="center";U.fillText(text,this.canvas.width/2,this.canvas.height/2);}else{}};WSPlayer.prototype.DB=function(text){var U=this.M.V;if(U){U.fillStyle="red";U.font="40pt";U.fillText(text,20,this.canvas.height-20);}else{}};WSPlayer.prototype.initLogger=function(verbosity){this.verbosity=verbosity||0;var G=this;if(window.wsLogger==undefined){window.wsLogger={log:function(){if(G.verbosity>=2){window.console.log.apply(window.console,arguments);}},warn:function(){if(G.verbosity>=1){window.console.warn.apply(window.console,arguments);}},error:function(){if(G.verbosity>=0){window.console.error.apply(window.console,arguments);}},debug:function(){if(G.verbosity>=3){window.console.log.apply(window.console,arguments);}},trace:function(){if(G.verbosity>=4){window.console.log.apply(window.console,arguments);}}};}if(window.wsLogger.debug==undefined){window.wsLogger.debug=function(){if(G.verbosity>=3){window.console.log.apply(window.console,arguments);}};}if(window.wsLogger.trace==undefined){window.wsLogger.trace=function(){if(G.verbosity>=4){window.console.log.apply(window.console,arguments);}};}};WSPlayer.prototype.getStreamStatistics=function(type){if(type=="audio"){return this.BU;}else if(type=="video"){return this.BN;}};var VideoRenderer=function(canvas,Am,Ak){this.canvas=canvas;this.width=canvas.width;this.height=canvas.height;this.AB=null;this.V=null;this.Am=Am;this.Ak=Ak;this.gl=null;this.program=null;this.buffer=null;this.YTexture=null;this.CBTexture=null;this.CRTexture=null;this.RGBTexture=null;this.AM=null;this.Aq=null;this.AK=null;this.AW=null;this.AT=false;this.CG=["precision mediump float;","uniform sampler2D YTexture;","uniform sampler2D CBTexture;","uniform sampler2D CRTexture;","varying vec2 texCoord;","void main() {","float y = texture2D(YTexture, texCoord).r;","float cr = texture2D(CRTexture, texCoord).r - 0.5;","float cb = texture2D(CBTexture, texCoord).r - 0.5;","gl_FragColor = vec4(","y + 1.4 * cr,","y + -0.343 * cb - 0.711 * cr,","y + 1.765 * cb,","1.0",");","}"].join("\n");this.CI=["attribute vec2 vertex;","varying vec2 texCoord;","void main() {","texCoord = vertex;","gl_Position = vec4((vertex * 2.0 - 1.0) * vec2(1, -1), 0.0, 1.0);","}"].join("\n");this.CL=["attribute vec4 vertex;","varying vec2 tc;","void main(){","gl_Position = vertex;","tc = vertex.xy*0.5+0.5;","}"].join("\n");this.CY=["precision mediump float;","uniform sampler2D RGBTexture;","varying vec2 tc;","void main(){","gl_FragColor = texture2D(RGBTexture, tc);","}"].join("\n");};VideoRenderer.prototype.init=function(){if(!this.Am){try{var gl=this.gl=this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl");}catch(e){wsLogger.error("Failed to get webgl context, error "+e);}}if(gl){if(this.Ak=="rgba"){this.CK(gl);}else{this.CN(gl);}}else{this.V=this.canvas.getContext("2d");this.AB=this.Ay;}this.l();};VideoRenderer.prototype.CN=function(gl){this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,0,1,1,0,1,1]),gl.STATIC_DRAW);this.program=gl.createProgram();gl.attachShader(this.program,this.compileShader(gl.VERTEX_SHADER,this.CI));gl.attachShader(this.program,this.compileShader(gl.FRAGMENT_SHADER,this.CG));gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS)){wsLogger.error("Failed to init WebGL! Message "+gl.getProgramInfoLog(this.program));this.V=this.canvas.getContext("2d");this.AB=this.Ay;return;}gl.useProgram(this.program);this.YTexture=this.createTexture(0,"YTexture");this.CRTexture=this.createTexture(1,"CRTexture");this.CBTexture=this.createTexture(2,"CBTexture");var vertexAttr=gl.getAttribLocation(this.program,"vertex");gl.enableVertexAttribArray(vertexAttr);gl.vertexAttribPointer(vertexAttr,2,gl.FLOAT,false,0,0);this.AB=this.CJ;};VideoRenderer.prototype.CK=function(gl){this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,1,1,-1,1,-1,-1]),gl.STATIC_DRAW);this.program=gl.createProgram();gl.attachShader(this.program,this.compileShader(gl.VERTEX_SHADER,this.CL));gl.attachShader(this.program,this.compileShader(gl.FRAGMENT_SHADER,this.CY));gl.bindAttribLocation(this.program,0,"vertex");gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS)){wsLogger.error("Failed to init WebGL! Message "+gl.getProgramInfoLog(this.program));this.V=this.canvas.getContext("2d");this.AB=this.Ay;return;}gl.useProgram(this.program);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);this.RGBTexture=this.createTexture(0,"RGBTexture");this.AB=this.CA;};VideoRenderer.prototype.l=function(){this.width=this.canvas.width;this.height=this.canvas.height;this.Aq=parseInt(this.width)+15>>4;this.AK=this.Aq<<4;this.AW=this.Aq<<3;var MaybeClampedUint8Array;if(typeof Uint8ClampedArray!=="undefined"){MaybeClampedUint8Array=Uint8ClampedArray;}else{MaybeClampedUint8Array=Uint8Array;}if(this.V){this.AM=new MaybeClampedUint8Array(this.canvas.width*this.canvas.height*4);for(var C=0,length=this.AM.length;C<length;C++){this.AM[C]=255;}}else if(this.gl){this.gl.viewport(0,0,this.width,this.height);}};VideoRenderer.prototype.stop=function(){if(this.V){var data=this.V.createImageData(this.width,this.height);this.V.putImageData(data,0,0);}else if(this.gl){this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);}};VideoRenderer.prototype.createTexture=function(index,name){var gl=this.gl;var BM=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,BM);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(gl.getUniformLocation(this.program,name),index);return BM;};VideoRenderer.prototype.compileShader=function(type,source){var gl=this.gl;var shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){throw new Error(gl.getShaderInfoLog(shader));}return shader;};VideoRenderer.prototype.isUsingWebGL=function(){return(this.gl!==null||this.gl!==undefined)&&(this.V==null||this.V==undefined);};VideoRenderer.prototype.CJ=function(frame){var gl=this.gl;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.YTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,this.AK,this.height,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,frame.y);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.CRTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,this.AW,this.height/2,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,frame.cr);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,this.CBTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,this.AW,this.height/2,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,frame.cb);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);};VideoRenderer.prototype.CA=function(data){var gl=this.gl;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.RGBTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,data.width,data.height,0,gl.RGBA,gl.UNSIGNED_BYTE,data.data);gl.drawArrays(gl.TRIANGLES,0,6);};VideoRenderer.prototype.Ay=function(frame){var data=this.V.createImageData(frame.width,frame.height);if(frame.type=="yuv"){this.By(frame);data.data.set(this.AM);}else{data.data.set(frame.data);}this.V.putImageData(data,0,0);};VideoRenderer.prototype.CT=function(frame){if(!this.AT){if(this.canvas.width!=frame.width||this.canvas.height!=frame.height){wsLogger.log("Changing canvas resolution from "+this.canvas.width+"x"+this.canvas.height+" to "+frame.width+"x"+frame.height);this.canvas.width=frame.width;this.canvas.height=frame.height;this.l();}this.AB(frame);}this.Bl=Date.now();};VideoRenderer.prototype.By=function(frame){var Ae=frame.y;var Bo=frame.cb;var Bn=frame.cr;var W=this.AM;var A4=0;var Av=this.AK;var BK=this.AK+(this.AK-frame.width);var Ah=0;var Bj=this.AW-(frame.width>>1);var p=0;var m=frame.width*4;var Ba=frame.width*4;var B8=frame.width>>1;var rows=frame.height>>1;var y,cb,cr,AO,AR,AP;for(var BH=0;BH<rows;BH++){for(var BQ=0;BQ<B8;BQ++){cb=Bo[Ah];cr=Bn[Ah];Ah++;AO=cr+(cr*103>>8)-179;AR=(cb*88>>8)-44+(cr*183>>8)-91;AP=cb+(cb*198>>8)-227;var A2=Ae[A4++];var Ap=Ae[A4++];W[p]=A2+AO;W[p+1]=A2-AR;W[p+2]=A2+AP;W[p+4]=Ap+AO;W[p+5]=Ap-AR;W[p+6]=Ap+AP;p+=8;var A1=Ae[Av++];var Az=Ae[Av++];W[m]=A1+AO;W[m+1]=A1-AR;W[m+2]=A1+AP;W[m+4]=Az+AO;W[m+5]=Az-AR;W[m+6]=Az+AP;m+=8;}A4+=BK;Av+=BK;p+=Ba;m+=Ba;Ah+=Bj;}};VideoRenderer.prototype.Cz=function(){return this.Bl;};VideoRenderer.prototype.mute=function(mute){if(mute){this.AT=true;}else{this.AT=false;}};function AudioPlayer(audioContext){var G=this;this.l();this.Aw=false;this.O=audioContext;this.o=audioContext.createGain();this.o.connect(audioContext.destination);this.mute(true);wsLogger.log("Sample rate "+this.O.sampleRate);var AN=[];var C;for(C=256;C<=16384;C=C*2){AN.push(C);}var BC=this.O.sampleRate/1;var AV=AN[0];var Ag=Math.abs(BC-AV);for(C=0;C<AN.length;C++){var BL=Math.abs(BC-AN[C]);if(BL<Ag){Ag=BL;AV=AN[C];}}wsLogger.log("Audio node buffer size "+AV);this.internalBufferSize=AV;this.v=this.internalBufferSize/this.O.sampleRate*1000;try{this.O.createScriptProcessor=this.O.createScriptProcessor||this.O.createJavaScriptNode;this.Aj=this.O.createScriptProcessor(this.internalBufferSize,1,1);}catch(e){wsLogger.error("JS Audio Node is not supported in this browser"+e);}this.Aj.onaudioprocess=function(event){var output=event.outputBuffer.getChannelData(0);var C;if(G.Z.length>0){var Al=G.Z.shift();for(C=0;C<output.length;C++){output[C]=Al.payload[C];}if(!G.z){G.BS=Al.sync;}else{G.BS=G.z;}G.z=Al.sync;if(!G.d){G.BW=event.playbackTime*1000;}else{G.BW=G.d;}G.d=event.playbackTime*1000;G.CV=false;}else{for(C=0;C<output.length;C++){output[C]=0;}G.CV=true;if(G.o.gain.value!=0){wsLogger.debug("No audio in audio buffer!");}}};}AudioPlayer.prototype.start=function(){if(!this.Aw){this.Aj.connect(this.o);this.Aw=true;}this.mute(false);};AudioPlayer.prototype.stop=function(){this.Aj.disconnect();this.Aw=false;this.z=undefined;this.d=undefined;this.Z=[];this.mute(true);};AudioPlayer.prototype.l=function(){if(this.Z){this.Z.length=0;}else{this.Z=[];}};AudioPlayer.prototype.C4=function(){this.l();};AudioPlayer.prototype.B9=function(CU){this.Z.push(CU);};AudioPlayer.prototype.Cy=function(){return this.Z.length;};AudioPlayer.prototype.BA=function(){if(this.z&&this.d){var time=this.O.currentTime*1000;if(time>=this.d){if(time-this.d>this.v){wsLogger.debug("No audio! "+(time-this.v-this.d));return this.z+this.v;}return time-this.d+this.z;}else{return time-this.BW+this.BS;}}return-1;};AudioPlayer.prototype.getBufferTimeLength=function(){var CW=this.O.currentTime*1000-this.d;var BZ=this.v-CW;return BZ>0?this.v*this.Z.length+BZ:this.v*this.Z.length;};AudioPlayer.prototype.C1=function(){return this.d;};AudioPlayer.prototype.mute=function(mute){if(mute){wsLogger.log("Audio player mute");this.o.gain.value=0;}else{wsLogger.log("Audio player resume");this.o.gain.value=1;}};AudioPlayer.prototype.setVolume=function(value){this.o.gain.value=value;};AudioPlayer.prototype.getVolume=function(){return this.o.gain.value;};var N=function(){};N.Aa="STOPPED";N.AX="PLAYING";N.CR="PAUSED";N.BY="STARTUP";
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();



function addLogMessage(message) {
    trace("Flash - " + message);
}
