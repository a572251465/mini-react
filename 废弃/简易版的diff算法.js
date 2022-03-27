import React from './react'
import ReactDom from './react-dom'

class Sub extends React.Component {
  componentWillMount() {
    console.log(`Sub 1. componentWillMount`)
  }

  componentDidMount() {
    console.log(`Sub 3. componentDidMount`)
  }

  render() {
    console.log(`Sub 2. render`)
    return <div>我是子类{this.props.number}</div>
  }

  componentWillUnmount() {
    console.log(`Sub 4. componentWillUnmount`)
  }
}

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      number: 1
    }
    console.log(`counter 1. constructor`)
  }

  componentWillMount() {
    console.log(`counter 2. componentWillMount`)
  }

  componentDidMount() {
    console.log(`counter 4. componentDidMount`)
  }

  componentWillUpdate() {
    console.log(`counter 6. componentWillUpdate`)
  }

  shouldComponentUpdate() {
    return true
  }

  componentDidUpdate() {
    console.log(`counter 7. componentDidUpdate`)
  }

  add = () => {
    this.setState({
      number: this.state.number + 1
    })
  }

  render() {
    console.log(`counter 3. render`)
    return (
      <div>
        <p>测试类的声明周期</p>
        <p>{this.state.number}</p>
        <button onClick={this.add}>变化按钮</button>
        {this.state.number % 2 === 0 ? null : (
          <Sub number={this.state.number} />
        )}
      </div>
    )
  }
}

ReactDom.render(<Counter />, document.getElementById('root'))
