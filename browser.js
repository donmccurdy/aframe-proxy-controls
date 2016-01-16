// Browser distrubution of the A-Frame component.
(function (AFRAME) {
  if (!AFRAME) {
    console.error('Component attempted to register before AFRAME was available.');
    return;
  }

  (AFRAME.aframeCore || AFRAME).registerComponent('proxy-controls', require('./proxy-controls'));

}(window.AFRAME));
