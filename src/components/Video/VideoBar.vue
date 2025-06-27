<template>
  <div class="arc-cont">
    <iframe
      src="https://api.arclight.org/videoPlayerUrl?refId=2_529-GOJ-0-0&playerStyle=default"
      allowfullscreen
      webkitallowfullscreen
      mozallowfullscreen
    ></iframe
    >
  </div>
</template>
<style>
  .arc-cont {
    position: relative;
    display: block;
    margin: 10px auto;
    width: 100%;
  }
  .arc-cont:after {
    padding-top: 59%;
    display: block;
    content: "";
  }
  .arc-cont > iframe {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    width: 98%;
    height: 98%;
    border: 0;
  }
</style>
