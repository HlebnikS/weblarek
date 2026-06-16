import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { ICardData } from "../../types";

export abstract class Card<T extends ICardData> extends Component<T> {
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement;
  constructor(container: HTMLElement) {
    super(container);
    this.titleElement = ensureElement<HTMLElement>(
      ".card__title",
      this.container,
    );
    this.priceElement = ensureElement<HTMLElement>(
      ".card__price",
      this.container,
    );
  }
  set id(value: string) {
    this.container.dataset.id = value;
  }
  set title(value: string) {
    this.titleElement.textContent = value;
  }
  set price(value: number | null) {
    this.priceElement.textContent =
      value === null ? "Бесценно" : `${value} синапсов`;
  }
}
