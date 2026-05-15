import "./scss/styles.scss";
import { apiProducts } from "./utils/data";

import { ProductCatalog } from "./components/models/ProductCatalog";
import { Basket } from "./components/models/Basket";
import { Buyer } from "./components/models/Buyer";

import { Api } from "./components/base/Api";
import { API_URL } from "./utils/constants";
import { WebLarekApi } from "./components/Api/WebLarekApi";

// Создание экземпляров классов
const catalog = new ProductCatalog();
const basket = new Basket();
const buyer = new Buyer();

// Проверка модели каталога товаров
catalog.setProducts(apiProducts.items);

console.log("Каталог товаров:", catalog.getProducts());

const firstProduct = catalog.getProducts()[0];

console.log("Получение товара по id:", catalog.getProduct(firstProduct.id));

catalog.setPreview(firstProduct);

console.log("Товар для подробного отображения:", catalog.getPreview());

// Проверка модели корзины
basket.addItem(firstProduct);

console.log("Товары в корзине после добавления:", basket.getItems());

console.log("Количество товаров в корзине:", basket.getCount());

console.log("Стоимость товаров в корзине:", basket.getTotal());

console.log(
  "Проверка наличия товара в корзине:",
  basket.hasItem(firstProduct.id),
);

basket.removeItem(firstProduct);

console.log("Корзина после удаления товара:", basket.getItems());

basket.clear();

console.log("Корзина после очистки:", basket.getItems());

// Проверка модели покупателя
buyer.setData({
  payment: "card",
  address: "г. Калуга ул. Поле Свободы д. 105 кв. 96",
});

console.log("Данные покупателя после частичного заполнения:", buyer.getData());

console.log("Ошибки валидации:", buyer.validate());

buyer.setData({
  email: "ol.zaharov@gmail.com",
  phone: "+79208736155",
});

console.log("Данные покупателя после полного заполнения:", buyer.getData());

console.log("Ошибки валидации после заполнения:", buyer.validate());

buyer.clear();

console.log("Данные покупателя после очистки:", buyer.getData());

const api = new Api(API_URL);
const webLarekApi = new WebLarekApi(api);

webLarekApi
  .getProducts()
  .then((data) => {
    catalog.setProducts(data.items);

    console.log("Товары с сервера:", data.items);
    console.log("Каталог из модели:", catalog.getProducts());
  })
  .catch((error) => {
    console.log(error);
  });
