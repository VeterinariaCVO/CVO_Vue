<template>
  <RouterView />
</template>

<style>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  width: 100%;
  height: 100%;
}

body {
  width: 100%;
  min-height: 100vh;
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: hidden;
}

#app {
  width: 100%;
  min-height: 100vh;
  margin: 0 !important;
  padding: 0 !important;
}
</style>