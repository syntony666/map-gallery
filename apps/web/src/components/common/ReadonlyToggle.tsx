import { useViewMode } from "../../hooks/useViewMode";
import { ensureAdminToken } from "../../utils/auth";
import { Button, type ButtonSize } from "./Button";

type ReadonlyToggleProps = {
  /** Raised chrome for the floating panel. */
  raised?: boolean;
  /** Translucent chrome for controls on a glass FloatingCard. */
  translucent?: boolean;
  size?: ButtonSize;
  /** Show the current mode as a label that expands on hover/focus. */
  label?: boolean;
  className?: string;
};

export function ReadonlyToggle({
  raised = false,
  translucent = false,
  size,
  label = false,
  className = "",
}: ReadonlyToggleProps) {
  const { readonly, toggleReadonly } = useViewMode();

  async function handleClick() {
    if (readonly && !(await ensureAdminToken())) {
      return;
    }

    toggleReadonly();
  }

  return (
    <Button
      raised={raised}
      translucent={translucent}
      size={size}
      icon={readonly ? "bi-lock" : "bi-unlock"}
      label={readonly ? "閱覽模式" : "編輯模式"}
      expandLabel={label}
      iconOnly={!label}
      onClick={handleClick}
      title={readonly ? "切換為編輯模式" : "切換為閱覽模式"}
      className={className}
    />
  );
}
