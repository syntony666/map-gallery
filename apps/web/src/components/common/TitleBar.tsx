import { useNavigate } from "react-router";
import type {
  ButtonActionGroup,
  ButtonGroupMobileOptions,
} from "../../types/button.type";
import { Button } from "./Button";
import { ButtonGroup } from "./ButtonGroup";
import { Icon } from "./Icon";

type TitleBarComponentProps = {
  areaName: string;
  description?: string;
  /** Back-button handler; defaults to history back. */
  onBack?: () => void;
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
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));
  const Heading = `h${headingLevel}` as const;

  return (
    <header>
      <div className="flex items-center justify-between gap-4">
        <Heading className="min-w-0">
          <Button ghost onClick={handleBack} className="min-w-0">
            <Icon
              name="bi-arrow-left-short"
              className="text-3xl leading-none text-ink-strong"
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
          <Icon name="bi-chat-square-heart" className="desc-icon" />
          <span>{description}</span>
        </div>
      )}
    </header>
  );
}
