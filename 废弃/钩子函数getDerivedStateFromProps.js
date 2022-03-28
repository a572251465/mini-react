/**
 * @description 表示react新的生命钩子函数
 */
import React from './react'
import ReactDom from './react-dom'

class CounterSub extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      number: 0
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { number } = nextProps
    return number % 2 === 0 ? { number: number * 2 } : { number: number * 3 }
  }

  render() {
    return (
      <div>
        <h1>子类：{this.state.number}</h1>
      </div>
    )
  }
}

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      number: 0
    }
  }

  handleClick = () => {
    this.setState({
      number: this.state.number + 1
    })
  }

  render() {
    return (
      <React.Fragment>
        <p>{this.state.number}</p>
        <CounterSub number={this.state.number} />
        <button onClick={this.handleClick}>点击添加按钮</button>
      </React.Fragment>
    )
  }
}

ReactDom.render(<Counter />, document.getElementById('root'))
