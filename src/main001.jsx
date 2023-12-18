import { createRoot } from "react-dom/client";
import { useReducer, useState } from "react/src/React";

const App = () => {
  const [state, setState] = useState(0);

  return (
    <button
      onClick={() => {
        setState((state) => state + 1);
      }}
    >
      {state}
    </button>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
