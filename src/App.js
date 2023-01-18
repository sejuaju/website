import { Switch } from "react-router-dom";
import Theme from "./component/theme";
import Bridge from "./pages/Bridge";
import Development from "./pages/Development";

import Lock from "./pages/Lock";
import Swap from "./pages/Swap";

function App() {
  return (
    <>
      <Switch>
        <Theme exact path="/" component={Lock} />
        <Theme exact path="/swap" component={Swap} />
        <Theme exact path="/bridge" component={Bridge} />
        <Theme exact path="/development" component={Development} />
      </Switch>
    </>
  );
}

export default App;
