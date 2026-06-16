import { Form } from "./Form";
import { IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";
import { IOrderFormData, TPayment } from "../../types";

export class OrderForm extends Form<IOrderFormData> {
  protected paymentButtons: HTMLButtonElement[];
  protected addressInput: HTMLInputElement;
  constructor(events: IEvents, container: HTMLFormElement) {
    super(events, container);
    this.paymentButtons = Array.from(
      this.container.querySelectorAll<HTMLButtonElement>(
        'button[name="card"], button[name="cash"]',
      ),
    );
    if (this.paymentButtons.length === 0) {
      throw new Error("Не найдены кнопки выбора способа оплаты");
    }
    this.addressInput = ensureElement<HTMLInputElement>(
      'input[name="address"]',
      this.container,
    );
    this.paymentButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const payment = button.name as TPayment;
        this.onInputChange("payment", payment);
      });
    });
  }
  set payment(value: TPayment | null) {
    this.paymentButtons.forEach((button) => {
      button.classList.toggle("button_alt-active", button.name === value);
    });
  }
  set address(value: string) {
    this.addressInput.value = value;
  }
}
