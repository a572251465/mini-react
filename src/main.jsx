import { createRoot } from "react-dom/client";
import { useEffect, useState, useRef } from "react/src/React";

function FunctionComponent() {
  const btnRef = useRef(null);

  function btnClickHandler() {
    alert("1111");
  }

  useEffect(() => {
    setTimeout(() => {
      btnRef.current.click();
    }, 1000);
  }, []);

  return (
    <button ref={btnRef} onClick={btnClickHandler}>
      点击我吧
    </button>
  );
}
let element = <FunctionComponent />;

const root = createRoot(document.getElementById("root"));
root.render(element);
