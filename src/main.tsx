import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="426227223924-a2sqq0hug114ljvo3iqgidliufrihntf.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
