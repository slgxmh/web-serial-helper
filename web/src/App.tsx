import Layout from "./components/layout";
import HomeView from "./components/views/home";
import { ItemView } from "./components/views/item";
import { projectFileAtom } from "./stores/project";
import { useAtom } from "jotai";

function App() {
  const [file] = useAtom(projectFileAtom);

  return (
    <>
      {file ? (
        <Layout>
          <ItemView />
        </Layout>
      ) : (
        <HomeView />
      )}
    </>
  );
}

export default App;
