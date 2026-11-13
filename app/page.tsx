import Link from "next/link";
import { Sprout, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-lg">
            A
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">AgriQuest</h1>
          <p className="mt-2 text-lg text-muted-foreground">Gamified platform to promote sustainable farming practices</p>
          <Badge variant="sage" className="mt-3">Demo Environment · Illustrative data only</Badge>
        </div>

        <div className="grid w-full gap-5 md:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage text-primary">
                <Sprout className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Continue as Farmer</h2>
                <p className="text-sm text-muted-foreground">Explore learning, challenges and your farm progress.</p>
              </div>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li>• Interactive sustainable farming lessons</li>
              <li>• Challenges with XP and badges</li>
              <li>• Activity submission with photo evidence</li>
            </ul>
            <Link href="/farmer/dashboard" className="mt-5 block">
              <Button fullWidth size="lg">Enter as Farmer</Button>
            </Link>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage text-primary-dark">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Continue as Admin</h2>
                <p className="text-sm text-muted-foreground">Review submissions and manage demo challenges.</p>
              </div>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li>• Review and approve farmer activities</li>
              <li>• Manage challenge catalogue</li>
              <li>• View participation analytics</li>
            </ul>
            <Link href="/admin/dashboard" className="mt-5 block">
              <Button variant="secondary" fullWidth size="lg">Enter as Admin</Button>
            </Link>
          </Card>
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>No real authentication. All data is local demo data stored in your browser.</span>
        </div>
      </div>
    </div>
  );
}