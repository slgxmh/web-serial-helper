export type Project = {
  name: string;
  items: ProjectItem[];
};

export type ProjectItem = {
  name: string;
  baudRate: number;
  sendMode: "text" | "hex";
  sendData: string;
  receivedMode: "text" | "hex";
};
