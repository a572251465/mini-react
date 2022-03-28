/**
 * @description 钩子函数getSnapshotBeforeUpdate实现
 */
import React from './react'
import ReactDom from './react-dom'

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      messages: []
    }
    this.wrapper = React.createRef()
  }

  addMessage() {
    this.setState((state) => ({
      messages: [`${state.messages.length}`, ...this.state.messages]
    }))
  }

  getSnapshotBeforeUpdate() {
    return {
      prevScrollTop: this.wrapper.current.scrollTop,
      preScrollHeight: this.wrapper.current.scrollHeight
    }
  }

  componentDidUpdate(prevProps, prevState, { prevScrollTop, preScrollHeight }) {
    this.wrapper.current.scrollTop =
      prevScrollTop + (this.wrapper.current.scrollHeight - preScrollHeight)
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.addMessage()
    }, 1000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  render() {
    const styles = {
      height: '100px',
      width: '200px',
      border: '1px solid red',
      overflow: 'auto'
    }

    return (
      <div ref={this.wrapper} style={styles}>
        {this.state.messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
    )
  }
}

ReactDom.render(<Counter />, document.getElementById('root'))
