import React from './react'
import ReactDom from './react-dom'

class ClassComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = { number: 0 }
  }

  addNumber = () => {
    this.setState(
      (state) => ({
        number: state.number + 1
      }),
      () => {
        console.log('获取到最新的值了')
      }
    )
  }

  render() {
    return (
      <div style={{ color: 'red' }}>
        <span>我是</span>李浩浩
        <p>{this.props.title}</p>
        <p>{this.state.number}</p>
        <button onClick={this.addNumber}>递增按钮</button>
      </div>
    )
  }
}

ReactDom.render(
  <ClassComponent title="我是类组件" />,
  document.getElementById('root')
)
