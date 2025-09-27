import { projectItemsAtom, projectNameAtom } from "../../stores/project";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";

export function SiderBar() {
  const [projectName, setProjectName] = useAtom(projectNameAtom);
  const [projectItems] = useAtom(projectItemsAtom);

  const { t } = useTranslation();
  return (
    <ul className="menu bg-base-200 rounded-box w-56">
      <li className="menu-title">
        {" "}
        <div className="form-control w-full max-w-xs mx-auto my-4">
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
    </ul>
  );
}
