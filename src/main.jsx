import { createRoot } from "react-dom/client";
import { useReducer, useState } from "react/src/React";

const App = () => {
  const [state, setState] = useState(0);

  return (
    <button
      onClick={() => {
        setState((state) => state + 1);
        setState((state) => state + 2);
        setState((state) => state + 3);
      }}
    >
      {state}
    </button>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
