;(function () {
  var choice = 'dark'
  try {
    choice = localStorage.getItem('helm.theme') || 'dark'
  } catch (e) {
    choice = 'dark'
  }
  var light = choice === 'light'
  if (choice === 'system' && window.matchMedia) {
    light = window.matchMedia('(prefers-color-scheme: light)').matches
  }
  document.documentElement.dataset.theme = light ? 'light' : 'dark'
  var meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', light ? '#F4F0E8' : '#0E0D0B')
  var inner = window.innerHeight || 0
  var visual = window.visualViewport && window.visualViewport.height ? window.visualViewport.height : 0
  var height = Math.max(inner, visual)
  if (height) {
    document.documentElement.style.setProperty('--vv-height', height + 'px')
    document.documentElement.style.setProperty('--vv-top', '0px')
  }
})()
