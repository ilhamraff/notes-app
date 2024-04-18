import "./script/components/index.js";
import "./styles/styles.css";

window.addEventListener("load", function () {
  var loader = document.querySelector("my-loading");
  loader.parentNode.removeChild(loader);
});
