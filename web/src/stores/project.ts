import { type ProjectT, type ProjectItemT, projectZ } from "../types/project";
import { atom } from "jotai";

const defaultProject: ProjectT = {
  version: 0,
  name: "",
  items: [
    {
      name: "hello serial",
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
export const projectFileAtom = atom<FileSystemFileHandle | null>(null);

export const projectNewFileAtom = atom(null, async (get, set) => {
  const fileHandle = get(projectFileAtom);
  if (!fileHandle) return;
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(defaultProject, null, 2));
  await writable.close();
  set(projectFileAtom, fileHandle);
});

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

export const saveProject = atom(null, async (get) => {
  const name = get(projectNameAtom);
  const items = get(projectItemsAtom);

  const projectData: ProjectT = {
    version: 0,
    name,
    items,
  };

  const fileHandle = get(projectFileAtom);
  if (fileHandle) {
    try {
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(projectData, null, 2));
      await writable.close();
    } catch (e) {
      alert("Failed to save project: " + (e as Error).message);
    }
  } else {
    throw new Error("Error project file");
  }
});

export const loadProject = atom(null, async (get, set) => {
  const fileHandle = get(projectFileAtom);
  if (fileHandle) {
    try {
      const file = await fileHandle.getFile();
      const contents = await file.text();
      const projectData = projectZ.safeParse(JSON.parse(contents));
      if (!projectData.success) {
        throw new Error(projectData.error.message);
      }
      set(projectNameAtom, projectData.data.name);
      set(projectItemsAtom, projectData.data.items);
      set(projectCurrentItemIndexAtom, 0);
    } catch (e) {
      throw new Error("Failed to load project: " + (e as Error).message);
    }
  } else {
    throw new Error("Error project file");
  }
});
