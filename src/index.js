import React from './react'
import ReactDom from './react-dom'

function Counter() {
  const [number, setNumber] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNumber(number => number + 1)
      console.log('开启一个定时器')

      return () => {
        console.log('关闭一个定时器')
        clearInterval(timer)
      }
    }, 1000)
  }, [])
  return <p>{number}</p>
}

ReactDom.render(<Counter />, document.getElementById('root'))
