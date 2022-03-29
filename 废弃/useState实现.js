import React from 'react'
import ReactDom from 'react-dom'

function App() {
  const [number, setNumber] = React.useState(0)
  const [count, setCount] = React.useState(10)
  return (
    <div>
      <h1>显示数字:{number}</h1>
      <button onClick={() => setNumber(number + 1)}>添加按钮</button>
      <h2>显示计数:{count}</h2>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  )
}

ReactDom.render(<App />, document.getElementById('root'))
