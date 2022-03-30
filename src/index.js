import React from './react'
import ReactDom from './react-dom'

function Animate() {
  const ref = React.useRef()
  // React.useLayoutEffect(() => {
  //   ref.current.style.transform = `translate(500px)`
  //   ref.current.style.transition = 'all 500ms'
  // })
  React.useEffect(() => {
    ref.current.style.transform = `translate(500px)`
    ref.current.style.transition = 'all 500ms'
  })
  const style = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: 'red'
  }

  return <div style={style} ref={ref}> </div>
}

ReactDom.render(<Animate />, document.getElementById('root'))
