# aframe-client-controls-component

*(In Progress)* Client controls via WebRTC datastream, for A-Frame VR.

## Description

When using a mobile device / Google Cardboard for WebVR, needing to design the UI around a single button is an obstacle. This component provides an (experimental) way to proxy user input events (keyboard, with possible support for Leap coming later) from a keyboard-connected device to the mobile viewer.

For performance, WebRTC DataStreams are used to minimize latency between the devices. [Browser support for this standard is limited](http://caniuse.com/#feat=rtcpeerconnection) - notably, Safari (including all iPhone browsers) does not support it. I will consider adding fallback support via WebSockets in the future, if the latency is bearable.

## Usage

This component should be used in the *viewer* application, to receive UI events from a remote application. A reusable remote application example will be available soon, but the API is simple enough that you can easily build your own.
