import {
  newProjectItem,
  projectItemsAtom,
  projectNameAtom,
} from "../../stores/project";
import { useAtom } from "jotai";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SiderBar() {
  const [projectName, setProjectName] = useAtom(projectNameAtom);
  const [projectItems] = useAtom(projectItemsAtom);
  const [, newItem] = useAtom(newProjectItem);

  const { t } = useTranslation();
  return (
    <ul className="menu bg-base-200 rounded-box w-56 flex flex-col gap-2">
      <li className="menu-title">
        <div className="form-control w-full max-w-xs mx-auto">
          <label className="label">
            <span className="label-text">{t("projectName")}</span>
          </label>
          <input
            type="text"
            defaultValue={t("defaultProjectName")}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
        </div>
      </li>
      {projectItems.map((projectItem) => (
        <li key={projectItem.name}>
          <a>{projectItem.name}</a>
        </li>
      ))}
      <button className="btn btn-outline btn-xs" onClick={() => newItem()}>
        <Plus />
      </button>
    </ul>
  );
}
