type ButtonProps = {
  button: {
    id: string;
    label?: string;
    icon?: string;
    onClick: () => void;
    disabled?: boolean;
  };
};

export function Button({ button }: ButtonProps) {
  return (
    <button
      key={button.id}
      type="button"
      onClick={button.onClick}
      disabled={button.disabled}
      className="rounded bg-stone-200 px-3 py-2 text-xs
              hover:bg-stone-300 disabled:cursor-not-allowed disabled:opacity-40"
      aria-label={button.label}
      title={button.label}
    >
      {button.icon && <i className={`bi ${button.icon}`}></i>}
      {button.label && <span className="ms-2">{button.label}</span>}
    </button>
  );
}
