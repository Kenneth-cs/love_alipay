import { PropsWithChildren } from "react";
import Taro, { useLaunch } from "@tarojs/taro";
import "taro-ui/dist/style/index.scss";
import "./app.css";

window.Symbol = Symbol;
window.Map = Map;
window.Set = Set;

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {});
  return children;
}

export default App;
