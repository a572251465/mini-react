import React from './react'
import ReactDom from './react-dom'

class ClassComponent extends React.Component {
  constructor(props) {
    super(props)
    this.a = React.createRef()
    this.b = React.createRef()
    this.result = React.createRef()
  }

  addHandle = () => {
    const a = this.a.current.value
    const b = this.b.current.value
    this.result.current.value = a + b
  }

  render() {
    return (
      <div>
        <input type="text" ref={this.a} /> + <input type="text" ref={this.b} />{' '}
        <button onClick={this.addHandle}>=</button>
        <input type="text" ref={this.result} />
      </div>
    )
  }
}

ReactDom.render(<ClassComponent />, document.getElementById('root'))
