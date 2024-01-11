import { createRoot } from "react-dom/client";
import { createContext } from "react/src/React";

const Context = createContext();

function Button() {
  return (
    <Context.Consumer>{(text) => <button>{text}</button>}</Context.Consumer>
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
