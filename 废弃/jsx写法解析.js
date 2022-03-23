import React from './react'
import ReactDom from './react-dom'

const jsx = <div style={{color: 'red'}}><span>我是</span>李浩浩</div>

ReactDom.render(jsx, document.getElementById('root'))
