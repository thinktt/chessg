
let styleString = ''
let hasRendered = false

// html`..` will render the same as `..` 
// We just want to be able to add html in front of string literals to enable 
// highlighting using lit-html vscode plugin.
function html() {
  arguments[0] = { raw: arguments[0] };
  return String.raw(...arguments);
}

const css = html

function addStyle(styleText) {
  styleString += styleText
}

function renderCss() {
  if (hasRendered) {
    console.error('cssLoder: render can only be run once')
    return 
  }

  const styleEl = `
    <style> 
      ${styleString}
    </style>
  
  `
  const node = document.querySelector('head')
  node.insertAdjacentHTML('beforeend', styleEl)
  hasRendered = true
}

const cssLoader = {
  addStyle,
  render: renderCss,
}

export  {
  html,
  css,
  cssLoader,
}