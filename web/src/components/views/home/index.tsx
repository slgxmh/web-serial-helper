import {
  projectLoadAtom,
  projectFileAtom,
  projectNewFileAtom,
} from "@/stores/project";
import { useAtom, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";

export default function HomeView() {
  const [, setFile] = useAtom(projectFileAtom);
  const [, loadFile] = useAtom(projectLoadAtom);
  const newFile = useSetAtom(projectNewFileAtom);

  const { t } = useTranslation();

  const pickerOpts: SaveFilePickerOptions | OpenFilePickerOptions = {
    id: "web-serial-project",
    types: [
      {
        description: "Web Serial Project",
        accept: {
          "application/json": [".json"],
        },
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false,
  };

  const homeFileSelect = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
      setFile(fileHandle);
      loadFile();
    } catch (e) {
      console.log(e);
    }
  };

  const homeFileNew = async () => {
    try {
      const fileHandle = await window.showSaveFilePicker(pickerOpts);
      setFile(fileHandle);
      newFile();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="card card-border bg-base-200 w-96">
        <div className="card-body">
          <h2 className="card-title">{t("homeTitle")}</h2>
          <div className="flex flex-col items-center">
            <button className="btn btn-primary" onClick={homeFileSelect}>
              {t("homeFileSelect")}
            </button>
            <div className="divider">{t("or")}</div>
            <button className="btn" onClick={homeFileNew}>
              {t("homeFileNew")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
