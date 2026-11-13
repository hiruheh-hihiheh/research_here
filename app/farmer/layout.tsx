import { FarmerShell } from "@/components/layout/FarmerShell";

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return <FarmerShell>{children}</FarmerShell>;
}