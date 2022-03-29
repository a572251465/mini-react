import React from './react'
import ReactDom from './react-dom'

class ClassCounter extends React.PureComponent {
  render() {
    return <div>ClassCounter:{this.props.count}</div>
  }
}

function FunctionCounter(props) {
  console.log('functionCounter')
  return <div>function: {props.count}</div>
}

const MemoFunctionCounter = React.memo(FunctionCounter)

class App extends React.Component {
  state = { number: 0 }
  amountRef = React.createRef()

  handleClick = () => {
    const nextNumber =
      this.state.number + parseInt(this.amountRef.current.value)
    this.setState({
      number: nextNumber
    })
  }

  render() {
    console.log('app render')
    return (
      <div>
        <MemoFunctionCounter count={this.state.number} />
        <ClassCounter count={this.state.number} />
        <input ref={this.amountRef} />
        <button onClick={this.handleClick}>+</button>
      </div>
    )
  }
}

ReactDom.render(<App />, document.getElementById('root'))
