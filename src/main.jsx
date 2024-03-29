import { createRoot } from "react-dom/client";
import { createContext, useState } from "react/src/React";

const Context = createContext();

function Button() {
  const [number, setNumber] = useState(0);
  return (
    <Context.Consumer>
      {(text) => (
        <div>
          <p>{number}</p>
          <button onClick={() => setNumber(number + 1)}>{text}</button>
        </div>
      )}
    </Context.Consumer>
  );
}

function FunctionComponent() {
  return (
    <Context.Provider value="这是通过createContext，渲染出来的按钮">
      <Button />
    </Context.Provider>
  );
}
let element = <FunctionComponent />;

const root = createRoot(document.getElementById("root"));
root.render(element);
