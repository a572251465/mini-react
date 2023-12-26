import { createRoot } from "react-dom/client";
import { useState } from "react/src/React";

function Counter() {
  const [state, setState] = useState(0);

  return (
    <button onClick={() => setState((state) => state + 1)}>{state}</button>
  );
}
let element = <Counter />;

const root = createRoot(document.getElementById("root"));
root.render(element);
