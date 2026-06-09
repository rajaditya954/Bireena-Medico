import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Button = forwardRef(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-[#06402B] text-white hover:bg-emerald-800 shadow-xl shadow-emerald-900/10 hover:shadow-emerald-900/20 active:scale-95",
      secondary: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 shadow-sm",
      glass: "bg-white/40 backdrop-blur-md border border-white/20 text-[#06402B] hover:bg-white/60 shadow-xl shadow-white/10",
      outline: "bg-transparent border-2 border-emerald-100 text-[#06402B] hover:border-emerald-600 hover:bg-emerald-50/50 hover:backdrop-blur-sm",
      ghost: "bg-transparent text-gray-600 hover:bg-emerald-50 hover:text-emerald-700",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-13 px-8 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
