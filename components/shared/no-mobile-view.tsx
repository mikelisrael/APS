import emptyAnimation from "@/public/animations/no-data-found.json";
import Lottie from "lottie-react";
import { ArrowRight, Monitor, Smartphone } from "lucide-react";

// ?note: when not needed anymore, make sure to remove `hidden md:block` from authentication and logged-in layout

const NoMobileView = () => {
  return (
    <main className="flex flex-col items-center justify-center p-6 duration-500 animate-in fade-in-0 md:hidden">
      <div className="[&_svg_path]:fill-primary">
        <Lottie
          animationData={emptyAnimation}
          loop={true}
          autoplay={true}
          style={{ width: 200, height: 200 }}
        />
      </div>

      <div className="relative max-w-md text-center">
        {/* Animated background elements */}
        <div className="absolute -left-20 -top-20 h-40 w-40 animate-pulse rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-40 w-40 animate-pulse rounded-full bg-primary/5 blur-3xl delay-1000" />

        <div className="relative z-10 space-y-8">
          {/* Icon Section */}
          <div className="flex items-center justify-center gap-6">
            <div className="rounded-2xl border border-border bg-card p-4 backdrop-blur-sm">
              <Smartphone className="h-12 w-12 text-muted-foreground" />
            </div>

            <div className="flex flex-col gap-2">
              <ArrowRight className="h-6 w-6 text-muted-foreground/50" />
              <ArrowRight className="h-6 w-6 text-muted-foreground/50" />
            </div>

            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 backdrop-blur-sm">
              <Monitor className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Desktop Only</h1>
            <p className="leading-relaxed text-muted-foreground">
              Our mobile experience is currently under construction. Please
              visit us on a desktop or laptop for the full experience.
            </p>
          </div>

          {/* Features badges */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            <span className="rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
              Coming Soon
            </span>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary backdrop-blur-sm">
              Mobile App
            </span>
            <span className="rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-sm text-accent-foreground backdrop-blur-sm">
              Tablet Support
            </span>
          </div>

          {/* Additional info */}
          <div className="pt-6">
            <p className="text-xs text-muted-foreground/60">
              Minimum screen width: 768px required
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NoMobileView;
