import { createRoot } from "react-dom/client";

const App = (
  <div className="test" style={{ color: "red" }}>
    hello
    <span style={{ background: "red" }}>1111</span>
  </div>
);

const root = createRoot(document.getElementById("root"));
root.render(App);
