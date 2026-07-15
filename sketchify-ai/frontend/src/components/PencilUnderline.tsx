export default function PencilUnderline({ children }: { children: React.ReactNode }) {
  return (
    <span className="pencil-underline">
      {children}
      <svg viewBox="0 0 300 20" preserveAspectRatio="none">
        <path d="M2 12 C 60 18, 120 4, 180 10 S 260 16, 298 8" />
      </svg>
    </span>
  );
}
