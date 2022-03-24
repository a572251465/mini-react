import React from 'react'
import ReactDom from 'react-dom'

class ClassComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = { number: 0 }
  }

  addNumber = (event) => {
    console.log('我是子类')
    this.setState({
      number: this.state.number + 1
    })
    this.setState({
      number: this.state.number + 1
    })
    event.stopPropagation()
  }

  parentClick = () => {
    console.log('我是冒泡的父类')
  }

  render() {
    return (
      <div style={{ color: 'red' }} onClick={this.parentClick}>
        <h1>标题内容</h1>
        <p>{this.state.number}</p>
        <button onClick={this.addNumber}>递增按钮</button>
      </div>
    )
  }
}

ReactDom.render(<ClassComponent />, document.getElementById('root'))
