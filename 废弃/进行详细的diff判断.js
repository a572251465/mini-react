import React from './react'
import ReactDom from './react-dom'

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: ['A', 'B', 'C', 'D', 'E', 'F']
    }
  }

  handleClick = () => {
    this.setState({
      list: ['A', 'C', 'E', 'B', 'G']
    })
  }

  render() {
    return (
      <React.Fragment>
        <ul>
          {this.state.list.map((item, key) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <button onClick={this.handleClick}>变化</button>
      </React.Fragment>
    )
  }
}

ReactDom.render(<Counter />, document.getElementById('root'))
