import React from './react'
import ReactDom from './react-dom'

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
    console.log(`counter 5. shouldComponentUpdate`)
    return this.state.number % 2 === 0
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
      </div>
    )
  }
}

ReactDom.render(<Counter />, document.getElementById('root'))
