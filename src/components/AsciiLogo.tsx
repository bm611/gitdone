const ASCII = `  ██████╗ ██╗████████╗██████╗  ██████╗ ███╗   ██╗███████╗
 ██╔════╝ ██║╚══██╔══╝██╔══██╗██╔═══██╗████╗  ██║██╔════╝
 ██║  ███╗██║   ██║   ██║  ██║██║   ██║██╔██╗ ██║█████╗  
 ██║   ██║██║   ██║   ██║  ██║██║   ██║██║╚██╗██║██╔══╝  
 ╚██████╔╝██║   ██║   ██████╔╝╚██████╔╝██║ ╚████║███████╗
  ╚═════╝ ╚═╝   ╚═╝   ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚══════╝`;

export function AsciiLogo() {
  return (
    <pre
      className="text-[var(--color-ink)] leading-tight select-none overflow-x-auto"
      style={{ fontSize: "clamp(0.35rem, 1.2vw, 0.65rem)" }}
      aria-label="GitDone"
    >
      {ASCII}
    </pre>
  );
}
