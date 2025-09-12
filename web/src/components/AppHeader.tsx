import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AppHeader() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <a className="btn btn-ghost text-xl">{t("appName")}</a>
      </div>
      <div className="navbar-center"></div>
      <div className="navbar-end">
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
