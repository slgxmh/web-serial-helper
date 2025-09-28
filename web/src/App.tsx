import Layout from "./components/layout";
import HomeView from "./components/views/home";
import "./i18n";
import { projectFileAtom } from "./stores/project";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";

function App() {
  const [file] = useAtom(projectFileAtom);

  const { t } = useTranslation();

  return <>{file ? <Layout>2</Layout> : <HomeView />}</>;
}

export default App;
