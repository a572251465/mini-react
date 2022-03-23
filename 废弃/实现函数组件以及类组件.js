import React from './react'
import ReactDom from './react-dom'

function FunctionComponent(props) {
  return (
    <div style={{ color: 'red' }}>
      <span>我是</span>李浩浩
      <p>{props.title}</p>
    </div>
  )
}

class ClassComponent extends React.Component {
  render() {
    return (
      <div style={{ color: 'red' }}>
        <span>我是</span>李浩浩
        <p>{this.props.title}</p>
      </div>
    )
  }
}

ReactDom.render(<ClassComponent title = '我是类组件' />, document.getElementById('root'))
