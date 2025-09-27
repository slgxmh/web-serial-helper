import { projectNameAtom } from "../../stores/project";
import { useAtom } from "jotai";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Header() {
  const { t, i18n } = useTranslation();
  const [projectName] = useAtom(projectNameAtom);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="navbar bg-base-200 shadow-sm">
      <div className="flex-none">
        <button className="btn btn-square btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block h-5 w-5 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </div>
      <div className="flex-1 flex items-center gap-2">
        <a className=" text-xl">{t("appName")}</a>
        <span>-</span>
        <span className="text-xl ">{projectName}</span>
      </div>
      <div className="flex-none">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost">
            <Globe />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
          >
            <li>
              <a onClick={() => changeLanguage("en")}>English</a>
            </li>
            <li>
              <a onClick={() => changeLanguage("zh")}>中文</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
