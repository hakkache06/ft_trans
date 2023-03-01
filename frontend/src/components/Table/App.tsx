import React, { useState } from "react";
import "./index.css";
import Home from "./Home";
import Table from "./Game";

function App() {
  const [show, gameShow] = useState(false);
  const [colorAi, setAiColor] = useState("#FFFFFF");
  const [colorPerson, setPersonColor] = useState("#FFFFFF");
  const [colorBall, setBallColor] = useState("#000000");
  const handleShow = (a: boolean, pc: string, ac: string, bc: string) => {
    gameShow(a);
    setPersonColor(pc);
    setAiColor(ac);
    setBallColor(bc);
  };
  return (
    <>
      {show === false && <Home onAccept={handleShow} />}
      {show === true && (
        <Table
          personColor={colorPerson}
          aiColor={colorAi}
          ballColor={colorBall}
        />
      )}
    </>
  );
}

export default App;
