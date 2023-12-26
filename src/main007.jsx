import { createRoot } from "react-dom/client";

function Counter() {
  return <h1>这是渲染的大标题</h1>;
}
let element = <Counter />;

const root = createRoot(document.getElementById("root"));
root.render(element);
