import { type ProjectT, type ProjectItemT, projectZ } from "../types/project";
import { atom } from "jotai";

const defaultProject: ProjectT = {
  name: "hello serial",
  items: [
    {
      name: "hello world",
      baudRate: 115200,
      sendMode: "hex",
      sendData: "",
      receiveMode: "hex",
    },
  ],
};

export const projectNameAtom = atom(defaultProject.name);
export const projectItemsAtom = atom<ProjectItemT[]>(defaultProject.items);
export const projectCurrentItemIndexAtom = atom(0);

export const projectCurrentItemAtom = atom((get) => {
  const index = get(projectCurrentItemIndexAtom);
  if (index < 0) throw new Error("Error project item idx");
  const items = get(projectItemsAtom);
  return items[index];
});

export const updateProjectCurrentItem = atom(
  null,
  (get, set, update: Partial<ProjectItemT>) => {
    const index = get(projectCurrentItemIndexAtom);
    if (index < 0) throw new Error("Error project item idx");
    const items = get(projectItemsAtom);
    set(
      projectItemsAtom,
      items.map((item, i) => (i === index ? { ...item, ...update } : item)),
    );
    set(saveProject);
  },
);

export const newProjectItem = atom(null, (get, set) => {
  const items = get(projectItemsAtom);
  set(projectItemsAtom, items.concat(defaultProject.items[0]));
  set(projectCurrentItemIndexAtom, items.length);
});

export const deleteProjectItem = atom(null, (get, set) => {
  const index = get(projectCurrentItemIndexAtom);
  const items = get(projectItemsAtom);
  if (items.length <= 1) {
    throw new Error("alertDeleteLast");
  }
  const newItems = items.filter((_, i) => i !== index);
  set(projectItemsAtom, newItems);
  if (index >= newItems.length) {
    set(projectCurrentItemIndexAtom, newItems.length - 1);
  }
  set(saveProject);
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
    set(projectCurrentItemIndexAtom, 0);
  } catch (e) {
    alert("Failed to load project: " + (e as Error).message);
  }
});
