import { createRoot } from "react-dom/client";

const App = (
  <div className="name" style={{ color: "red" }}>
    <span>name: test</span>
  </div>
);

const root = createRoot(document.createElement("root"));
debugger
root.render(App);
