import { Header } from "./header";
import { SiderBar } from "./sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full flex-col">
      <Header />
      <div className="flex h-full w-full flex-1">
        <SiderBar />
        {children}
      </div>
    </div>
  );
}
