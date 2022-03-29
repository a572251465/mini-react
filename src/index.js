import React from './react'
import ReactDom from './react-dom'

const ThemeContext = React.createContext()
const { Provider, Consumer } = ThemeContext
console.log(Provider, Consumer, ThemeContext)
const commonStyle = {
  margin: '5px',
  padding: '5px'
}

function Content() {
  return (
    <Consumer>
      {(contextValue) => (
        <div
          style={{ ...commonStyle, border: `5px solid ${contextValue.color}` }}>
          Context
          <button
            style={{ color: 'red' }}
            onClick={() => contextValue.changeColor('red')}>
            变红
          </button>
          <button
            style={{ color: 'green' }}
            onClick={() => contextValue.changeColor('green')}>
            变绿
          </button>
        </div>
      )}
    </Consumer>
  )
}

class Main extends React.Component {
  static contextType = ThemeContext
  render() {
    return (
      <div
        style={{
          ...commonStyle,
          border: `5px solid ${this.context.color}`
        }}>
        Main
        <Content />
      </div>
    )
  }
}

class Page extends React.Component {
  constructor(props) {
    super(props)
    this.state = { color: 'black' }
  }

  changeColor = (color) => {
    this.setState({ color })
  }

  render() {
    const contextValue = {
      color: this.state.color,
      changeColor: this.changeColor
    }
    return (
      <Provider value={contextValue}>
        <div
          style={{
            ...commonStyle,
            width: '250px',
            border: `5px solid ${this.state.color}`
          }}>
          <Main />
        </div>
      </Provider>
    )
  }
}

ReactDom.render(<Page />, document.getElementById('root'))
