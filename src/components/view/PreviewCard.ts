import { Card } from "./Card";
import { ensureElement } from "../../utils/utils";
import { categoryMap } from "../../utils/constants";
import { IPreviewCardData, ICardActions } from "../../types";
type CategoryKey = keyof typeof categoryMap;

export class PreviewCard extends Card<IPreviewCardData> {
  protected imageElement: HTMLImageElement;
  protected categoryElement: HTMLElement;
  protected descriptionElement: HTMLElement;
  protected actionButton: HTMLButtonElement;
  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);
    this.imageElement = ensureElement<HTMLImageElement>(
      ".card__image",
      this.container,
    );
    this.categoryElement = ensureElement<HTMLElement>(
      ".card__category",
      this.container,
    );
    this.descriptionElement = ensureElement<HTMLElement>(
      ".card__text",
      this.container,
    );
    this.actionButton = ensureElement<HTMLButtonElement>(
      ".card__button",
      this.container,
    );
    if (actions?.onClick) {
      this.actionButton.addEventListener("click", actions.onClick);
    }
  }
  set image(value: string) {
    this.setImage(this.imageElement, value);
  }
  set category(value: string) {
    this.categoryElement.textContent = value;
    Object.values(categoryMap).forEach((className) => {
      this.categoryElement.classList.remove(className);
    });
    const categoryClass = categoryMap[value as CategoryKey];
    if (categoryClass) {
      this.categoryElement.classList.add(categoryClass);
    }
  }
  set description(value: string) {
    this.descriptionElement.textContent = value;
  }
  set selected(value: boolean) {
    this.actionButton.textContent = value ? "Удалить из корзины" : "В корзину";
  }
  set price(value: number | null) {
    super.price = value;
    this.actionButton.disabled = value === null;
  }
}
