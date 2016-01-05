# A-Frame `proxy-controls` Component

*(In Progress)* A-Frame VR component to proxy keyboard/gamepad controls between devices over WebRTC.

## Overview

With a mobile device / Google Cardboard for WebVR, designing the UI around a single button is an obstacle. This component provides an *experimental* way to proxy user input events (keyboard, perhaps Leap Motion later) from a keyboard-connected device to the mobile viewer.

For performance, WebRTC DataStreams are used to minimize latency between the devices. [Browser support for this standard is limited](http://caniuse.com/#feat=rtcpeerconnection) - notably, Safari (including all iPhone browsers) does not support it. I will consider adding fallback support via WebSockets in the future, if the latency is bearable.

## Usage

This component should be used in the *viewer* application, to receive UI events from a remote application. A reusable remote application example will be available soon, but the API is simple enough that you can also build your own.
