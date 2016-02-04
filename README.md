# A-Frame `proxy-controls` Component

*(In Progress)* A-Frame component to proxy keyboard/gamepad controls between devices over WebRTC.

## Overview

With a mobile device / Google Cardboard for WebVR, designing the UI around a single button is an obstacle. This component provides an *experimental* way to proxy user input events (keyboard, perhaps Leap Motion later) from a keyboard-connected device to the mobile viewer.

For performance, WebRTC DataStreams are used to minimize latency between the devices. [Browser support for this standard is limited](http://caniuse.com/#feat=rtcpeerconnection) - notably, Safari (including all iPhone browsers) does not support it. I will consider adding fallback support via WebSockets in the future, if the latency is bearable.

## Usage

This component should be used in the *viewer* application, to receive UI events from a remote application. A reusable remote application example will be available soon, but the API is simple enough that you can also build your own.

## Options

Options are assigned with A-Frame's entity/component/property pattern:

```html
<a-entity camera proxy-controls="enabled: true;
                                 debug: true;
                                 pairCode: 'my-secret-code';
                                 enableOverlay: false;"></a-entity>
```


Property            | Default  | Description
--------------------|----------|-------------
enabled             | true     | Enables/disables event updates from the host.
debug               | false    | Enables/disables logging in the console.
proxyUrl            | `'https://proxy-controls.donmccurdy.com'` | URL of the remote proxy server / signaling server.
pairCode            | <random> | Pair code that should be used to match with the remote host. If not provided, a random pair code is assigned.
enableOverlay       | true | Enables/disables the overlay UI showing the pair code.
enableOverlayStyles | true | Enables/disables the CSS used to style the pair code overlay.

## Events

When the pair code is available, a `proxycontrols.paircode` event is fired. If you want to hide the default overlay, use this to show the pair code to the user as needed:

```javascript
scene.addEventListener('proxycontrols.paircode', function (e) {
  console.log(e.detail.pairCode);
});
```
