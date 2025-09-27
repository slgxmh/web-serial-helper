import { type ProjectT, type ProjectItemT, projectZ } from "../types/project";
import { atom } from "jotai";

export const projectNameAtom = atom("");
export const projectItemsAtom = atom<ProjectItemT[]>([]);
export const projectCurrentItemIndex = atom(-1);

export const currentItem = atom((get) => {
  const index = get(projectCurrentItemIndex);
  if (index < 0) return null;
  const items = get(projectItemsAtom);
  return items[index];
});

export const saveProject = atom(null, (get) => {
  const name = get(projectNameAtom);
  const items = get(projectItemsAtom);
  if (!name) {
    alert("Please enter a project name.");
    return;
  }

  const projectData: ProjectT = {
    name,
    items,
  };

  localStorage.setItem("project", JSON.stringify(projectData));
});

export const loadProject = atom(null, (_, set) => {
  const data = localStorage.getItem("project");
  if (!data) {
    alert("No project found in local storage.");
    return;
  }
  try {
    const projectData = projectZ.safeParse(JSON.parse(data));
    if (!projectData.success) {
      alert("Failed to load project: " + projectData.error.message);
      return;
    }

    set(projectNameAtom, projectData.data.name);
    set(projectItemsAtom, projectData.data.items);
    set(projectCurrentItemIndex, -1);
  } catch (e) {
    alert("Failed to load project: " + (e as Error).message);
  }
});
