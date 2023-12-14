import { createRoot } from "react-dom/client";
import { useReducer } from "react/src/React";

const reducer = (state, action) => {
  if (action.type === "add") return state + 1;
  return state;
};

const App = () => {
  const [number, setNumber] = useReducer(reducer, 0);

  return (
    <button
      onClick={() => {
        setNumber({ type: "add" });
        setNumber({ type: "add" });
        setNumber({ type: "add" });
      }}
    >
      {number}
    </button>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
