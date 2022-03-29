import React from './react'
import ReactDom from './react-dom'

function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return { number: state.number + 1 }
    case 'delete':
      return { number: state.number - 1 }
    default:
      return state
  }
}

function App() {
  const [state, dispatch] = React.useReducer(reducer, { number: 0 })
  return (
    <div>
      <h1>显示内容：{state.number}</h1>
      <button onClick={() => dispatch({ type: 'add' })}>添加</button>
      <button onClick={() => dispatch({ type: 'delete' })}>删除</button>
    </div>
  )
}

ReactDom.render(<App />, document.getElementById('root'))
