type ButtonProps = {
  button: {
    id: string;
    label?: string;
    icon?: string;
    onClick: () => void;
    disabled?: boolean;
  };
  iconOnly?: boolean;
};

export function Button({ button, iconOnly }: ButtonProps) {
  return (
    <button
      key={button.id}
      type="button"
      onClick={button.onClick}
      disabled={button.disabled}
      className="rounded bg-stone-200 px-3 py-2 text-xs
              hover:bg-stone-300 disabled:cursor-not-allowed disabled:opacity-40"
      title={button.label}
    >
      {button.icon && <i className={`bi ${button.icon}`}></i>}
      {button.label && !iconOnly && (
        <span className="ms-2">{button.label}</span>
      )}
    </button>
  );
}
