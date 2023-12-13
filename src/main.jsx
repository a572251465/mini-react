import { createRoot } from "react-dom/client";

const App = () => (
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
    </span>
  </div>
);

const root = createRoot(document.getElementById("root"));
root.render(<App />);
