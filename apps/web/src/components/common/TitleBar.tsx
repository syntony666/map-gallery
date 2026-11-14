import type {
  ButtonActionGroup,
  ButtonGroupMobileOptions,
} from "../../types/button.type";
import { Button } from "./Button";
import { ButtonGroup } from "./ButtonGroup";

type TitleBarComponentProps = {
  areaName: string;
  description?: string;
  onBack: () => void;
  buttonGroup?: ButtonActionGroup[];
  mobileActions?: ButtonGroupMobileOptions;
  /** Heading level of the title; use 2 when the page has its own h1. */
  headingLevel?: 1 | 2;
};

export function TitleBar({
  areaName,
  description,
  onBack,
  buttonGroup = [],
  mobileActions = {},
  headingLevel = 1,
}: TitleBarComponentProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <header>
      <div className="flex items-center justify-between gap-4">
        <Heading className="min-w-0">
          <Button ghost onClick={onBack} className="min-w-0">
            <i
              className="bi bi-arrow-left-short shrink-0 text-3xl leading-none
                text-ink-strong"
            />

            <span className="truncate text-2xl font-bold text-ink sm:text-3xl">
              {areaName}
            </span>
          </Button>
        </Heading>

        <ButtonGroup groups={buttonGroup} {...mobileActions} />
      </div>

      {description && (
        <div className="ml-3 text-sm text-ink-muted">
          <p className="flex items-start">
            <i className="bi bi-chat-square-heart" />
            <span>{description}</span>
          </p>
        </div>
      )}
    </header>
  );
}
