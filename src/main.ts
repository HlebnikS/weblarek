import "./scss/styles.scss";

import { ProductCatalog } from "./components/models/ProductCatalog";
import { Basket } from "./components/models/Basket";
import { Buyer } from "./components/models/Buyer";

import { Api } from "./components/base/Api";
import { API_URL, CDN_URL } from "./utils/constants";
import { WebLarekApi } from "./components/Api/WebLarekApi";

import { EventEmitter } from "./components/base/Events";

import { Gallery } from "./components/view/Gallery";
import { ensureElement } from "./utils/utils";

import { CatalogCard } from "./components/view/CatalogCard";

import { Modal } from "./components/view/Modal";
import { PreviewCard } from "./components/view/PreviewCard";
import {
  ICardEvent,
  IFormFieldChange,
  IOrderFormData,
  IContactsFormData,
  TPayment,
} from "./types";

import { Header } from "./components/view/Header";
import { BasketView } from "./components/view/BasketView";
import { BasketCard } from "./components/view/BasketCard";

import { OrderForm } from "./components/view/OrderForm";
import { ContactsForm } from "./components/view/ContactsForm";

import { Success } from "./components/view/Success";
import { IOrder } from "./types/index";

// Брокер событий
const events = new EventEmitter();

// Модели данных
const catalog = new ProductCatalog(events);
const basket = new Basket(events);
const buyer = new Buyer(events);

// API
const api = new Api(API_URL);
const webLarekApi = new WebLarekApi(api);

// Основные компоненты Представления
const header = new Header(events, ensureElement<HTMLElement>(".header"));

const gallery = new Gallery(ensureElement<HTMLElement>(".gallery"));

const modal = new Modal(events, ensureElement<HTMLElement>("#modal-container"));

// Шаблоны
const catalogCardTemplate = ensureElement<HTMLTemplateElement>("#card-catalog");

const previewCardTemplate = ensureElement<HTMLTemplateElement>("#card-preview");

const basketCardTemplate = ensureElement<HTMLTemplateElement>("#card-basket");

const basketTemplate = ensureElement<HTMLTemplateElement>("#basket");

const orderTemplate = ensureElement<HTMLTemplateElement>("#order");

const contactsTemplate = ensureElement<HTMLTemplateElement>("#contacts");

const successTemplate = ensureElement<HTMLTemplateElement>("#success");

// Создание подробной карточки
const previewElement =
  previewCardTemplate.content.firstElementChild?.cloneNode(true);

if (!(previewElement instanceof HTMLElement)) {
  throw new Error("Не удалось клонировать шаблон #card-preview");
}

const previewCard = new PreviewCard(previewElement, {
  onClick: () => {
    const product = catalog.getPreview();

    if (!product || product.price === null) {
      return;
    }

    if (basket.hasItem(product.id)) {
      events.emit<ICardEvent>("basket:remove", {
        id: product.id,
      });
    } else {
      events.emit<ICardEvent>("basket:add", {
        id: product.id,
      });
    }
  },
});

// Создание представления корзины
const basketElement = basketTemplate.content.firstElementChild?.cloneNode(true);

if (!(basketElement instanceof HTMLElement)) {
  throw new Error("Не удалось клонировать шаблон #basket");
}

const basketView = new BasketView(events, basketElement);

// Функция отображения содержимого корзины
const renderBasket = (): void => {
  const items = basket.getItems().map((product, index) => {
    const cardElement =
      basketCardTemplate.content.firstElementChild?.cloneNode(true);

    if (!(cardElement instanceof HTMLElement)) {
      throw new Error("Не удалось клонировать шаблон #card-basket");
    }

    const card = new BasketCard(cardElement, {
      onClick: () => {
        events.emit<ICardEvent>("basket:delete", {
          id: product.id,
        });
      },
    });

    return card.render({
      id: product.id,
      index: index + 1,
      title: product.title,
      price: product.price,
    });
  });

  basketView.render({
    items,
    total: basket.getTotal(),
  });

  header.render({
    counter: basket.getCount(),
  });
};

// Изменение каталога товаров
events.on("catalog:changed", () => {
  const products = catalog.getProducts();

  const cards = products.map((product) => {
    const cardElement =
      catalogCardTemplate.content.firstElementChild?.cloneNode(true);

    if (!(cardElement instanceof HTMLElement)) {
      throw new Error("Не удалось клонировать шаблон #card-catalog");
    }

    const card = new CatalogCard(cardElement, {
      onClick: () => {
        events.emit<ICardEvent>("card:select", {
          id: product.id,
        });
      },
    });

    return card.render({
      id: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      image: `${CDN_URL}${product.image}`,
    });
  });

  gallery.render({
    catalog: cards,
  });
});

// Выбор карточки в каталоге
events.on<ICardEvent>("card:select", ({ id }) => {
  const product = catalog.getProduct(id);

  if (!product) {
    return;
  }

  catalog.setPreview(product);
});

// Изменение выбранного товара
events.on("preview:changed", () => {
  const product = catalog.getPreview();

  if (!product) {
    return;
  }

  const previewContent = previewCard.render({
    id: product.id,
    title: product.title,
    price: product.price,
    category: product.category,
    image: `${CDN_URL}${product.image}`,
    description: product.description,
    selected: basket.hasItem(product.id),
  });

  modal.render({
    content: previewContent,
  });

  modal.open();
});

// Добавление товара в корзину
events.on<ICardEvent>("basket:add", ({ id }) => {
  const product = catalog.getProduct(id);

  if (!product || product.price === null) {
    return;
  }

  basket.addItem(product);
});

// Удаление товара через подробную карточку
events.on<ICardEvent>("basket:remove", ({ id }) => {
  basket.removeItem(id);
});

// Удаление товара из корзины
events.on<ICardEvent>("basket:delete", ({ id }) => {
  basket.removeItem(id);
});

// Изменение содержимого корзины
events.on("basket:changed", () => {
  renderBasket();

  const product = catalog.getPreview();

  if (product) {
    previewCard.render({
      selected: basket.hasItem(product.id),
    });
  }
});

// Открытие корзины
events.on("basket:open", () => {
  renderBasket();

  modal.render({
    content: basketView.render(),
  });

  modal.open();
});

// Закрытие модального окна
events.on("modal:close", () => {
  modal.close();
});

// Начальное состояние интерфейса
header.render({
  counter: 0,
});

basketView.render({
  items: [],
  total: 0,
});

// Создание формы оплаты и адреса
const orderElement = orderTemplate.content.firstElementChild?.cloneNode(true);
if (!(orderElement instanceof HTMLFormElement)) {
  throw new Error("Не удалось клонировать шаблон #order");
}
const orderForm = new OrderForm(events, orderElement);

// Создание формы контактов {
const contactsElement =
  contactsTemplate.content.firstElementChild?.cloneNode(true);
if (!(contactsElement instanceof HTMLFormElement)) {
  throw new Error("Не удалось клонировать шаблон #contacts");
}

const contactsForm = new ContactsForm(events, contactsElement);

// Открытие первой формы
events.on("order:open", () => {
  const data = buyer.getData();
  const errors = buyer.validate();
  orderForm.render({
    payment: data.payment || null,
    address: data.address,
    valid: !errors.payment && !errors.address,
    errors: [errors.payment, errors.address].filter(Boolean).join("; "),
  });
  modal.render({ content: orderForm.render() });
  modal.open();
});

// Изменение способа оплаты
events.on<IFormFieldChange<IOrderFormData>>(
  "order.payment:change",
  ({ value }) => {
    buyer.setData({ payment: value as TPayment });
  },
);

// Изменения адреса
events.on<IFormFieldChange<IOrderFormData>>(
  "order.address:change",
  ({ value }) => {
    buyer.setData({ address: value });
  },
);

// Изменение данных покупателя
events.on("buyer:changed", () => {
  const data = buyer.getData();
  const errors = buyer.validate();
  const orderErrors = [errors.payment, errors.address]
    .filter(Boolean)
    .join("; ");
  const contactsErrors = [errors.email, errors.phone]
    .filter(Boolean)
    .join("; ");
  orderForm.render({
    payment: data.payment || null,
    address: data.address,
    valid: !errors.payment && !errors.address,
    errors: orderErrors,
  });
  contactsForm.render({
    email: data.email,
    phone: data.phone,
    valid: !errors.email && !errors.phone,
    errors: contactsErrors,
  });
});

//Открытие второй формы
events.on("order:submit", () => {
  const errors = buyer.validate();
  if (errors.payment || errors.address) {
    return;
  }
  const data = buyer.getData();
  contactsForm.render({
    email: data.email,
    phone: data.phone,
    valid: !errors.email && !errors.phone,
    errors: [errors.email, errors.phone].filter(Boolean).join("; "),
  });
  modal.render({ content: contactsForm.render() });
});

// Изменение электронной почты
events.on<IFormFieldChange<IContactsFormData>>(
  "contacts.email:change",
  ({ value }) => {
    buyer.setData({ email: value });
  },
);

// Изменение телефона
events.on<IFormFieldChange<IContactsFormData>>(
  "contacts.phone:change",
  ({ value }) => {
    buyer.setData({ phone: value });
  },
);

// Создание компонент Success
const successElement =
  successTemplate.content.firstElementChild?.cloneNode(true);

if (!(successElement instanceof HTMLElement)) {
  throw new Error("Не удалось клонировать шаблон #success");
}

const success = new Success(successElement, {
  onClick: () => {
    modal.close();
  },
});

// Обработка отправки формы контактов
events.on("contacts:submit", () => {
  const errors = buyer.validate();

  if (errors.payment || errors.address || errors.email || errors.phone) {
    return;
  }

  const buyerData = buyer.getData();

  if (buyerData.payment !== "card" && buyerData.payment !== "cash") {
    return;
  }

  const order: IOrder = {
    payment: buyerData.payment,
    address: buyerData.address,
    email: buyerData.email,
    phone: buyerData.phone,
    total: basket.getTotal(),
    items: basket.getItems().map((product) => product.id),
  };

  webLarekApi
    .postOrder(order)
    .then((result) => {
      const successContent = success.render({
        total: result.total,
      });

      modal.render({
        content: successContent,
      });

      basket.clear();
      buyer.clear();
    })
    .catch((error) => {
      console.error("Ошибка оформления заказа:", error);
    });
});

// Получение товаров с сервера
webLarekApi
  .getProducts()
  .then((response) => {
    catalog.setProducts(response.items);
  })
  .catch((error) => {
    console.error("Ошибка загрузки каталога:", error);
  });
