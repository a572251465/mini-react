import React from 'react'
import ReactDom from 'react-dom'

let Child = ({ data, handleClick }) => {
  console.log('child')
  return <button onClick={handleClick}>点击增加{data.number}</button>
}
Child = React.memo(Child)

function App() {
  console.log('App')

  const [name, setName] = React.useState('lihh')
  const [number, setNumber] = React.useState(0)

  const data = React.useMemo(() => ({ number }), [number])
  const handleClick = React.useCallback(() => setNumber(number + 1), [number])

  return (
    <div>
      <input
        type="text"
        value={name}
        onInput={(event) => setName(event.target.value)}
      />
      <Child data={data} handleClick={handleClick} />
    </div>
  )
}

ReactDom.render(<App />, document.getElementById('root'))
