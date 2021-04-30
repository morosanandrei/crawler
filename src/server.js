const cheerio = require("cheerio");
const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);

const app = express();
const port = 3000;

const products = [];

getHtml = async () => {
  return readFile("./mockData/pachet-promotii.html", "utf8");
};

const url = "https://www.avstore.ro/pachete-promo/promotii/";

initPage = async (url) => {
  console.log("initPage");
  // const res = await fetch(url);
  // const body = await res.text();
  const body = await getHtml();
  const pageLinkList = await getPages(body);
  const data = await getData(body);
  products.push(...data);
  const sortedProducts = sortDataBy(3000);
  console.log(sortedProducts);
};

sortDataBy = (price = 4500) => {
  const newData = products
    .filter((product) => product.price < price)
    .sort((a, b) => a.diff - b.diff);

  return newData;
};

getPages = async (body) => {
  const $ = cheerio.load(body);
  const pageNumber = $(".paginare p").first();
  const pageLinkList = [];
  pageNumber.children("a").each((i, el) => {
    const $el = $(el);
    i !== 0 && pageLinkList.push($el.attr("href"));
  });
  return pageLinkList;
};

getData = async (body) => {
  const $ = cheerio.load(body);
  const $listOfProducs = $("#produse .produs.cf");
  const listOfProducs = [];
  $listOfProducs.each((i, product) => {
    const $newPrice = convertToNumber($(product).find(".pret-nou").text());
    const $oldPrice = convertToNumber(
      $(product)
        .find(".pret-vechi")
        .text()
        .split("Pret lista ")[1]
        .split(" RON")[0]
    );
    const elName = $(product).find(".cnt-detalii h2 a");
    const $name = $(elName).text();
    const href = $(elName).attr("href");
    listOfProducs.push({
      name: formatTitle($name),
      // name: $name,
      price: $newPrice,
      oldPrice: $oldPrice,
      diff: $oldPrice - $newPrice,
      href: href,
    });
  });

  return listOfProducs;
};

formatTitle = (title) => {
  return title
    .split("\n")
    .map((string) => string.trim())
    .join(" ");
};

convertToNumber = (priceString) => {
  return parseFloat(priceString) * 1000;
};

// getData(url);
initPage(url);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
