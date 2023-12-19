import { createRoot } from "react-dom/client";
import { useReducer, useState } from "react/src/React";

const App = () => {
  const [state, setState] = useState(0);

  return state === 0 ? (
    <div
      key="a1"
      onClick={() => {
        debugger;
        setState(() => state + 1);
      }}
    >
      {state}
    </div>
  ) : (
    <span key="a1">{state}</span>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
