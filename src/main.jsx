import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react/src/React";

function FunctionComponent() {
  const [number, setNumber] = useState(0);
  return (
    <button
      onClick={() => {
        debugger;
        setNumber((number) => number + 1);
      }}
    >
      {number}
    </button>
  );
}
let element = <FunctionComponent />;

const root = createRoot(document.getElementById("root"));
root.render(element);
