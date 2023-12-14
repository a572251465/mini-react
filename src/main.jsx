import { createRoot } from "react-dom/client";
import * as React from "react";

const reducer = (state, action) => {
  if (action.type === "add") return state + 1;
  return state;
};

const App = () => {
  const [number, setNumber] = React.useReducer(reducer, 0);

  return (
    <div
      className="test"
      style={{ color: "red" }}
      onClick={() => console.log("parent click")}
      onClickCapture={() => console.log("parent capture click")}
    >
      <span
        onClick={() => console.log("child click")}
        onClickCapture={() => console.log("child capture click")}
        style={{ background: "red" }}
      >
        1111
        <br />
        state: {number}
      </span>
      <button onClick={() => setNumber({ type: "add" })}>添加</button>
    </div>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
