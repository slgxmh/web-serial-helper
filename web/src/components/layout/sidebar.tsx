import { projectItemsAtom } from "../../stores/project";
import { useAtom } from "jotai";

export function SiderBar() {
  const [projectItems] = useAtom(projectItemsAtom);
  return (
    <ul className="menu bg-base-200 rounded-box w-56">
      {projectItems.map((projectItem) => (
        <li key={projectItem.name}>
          <a>{projectItem.name}</a>
        </li>
      ))}
    </ul>
  );
}
