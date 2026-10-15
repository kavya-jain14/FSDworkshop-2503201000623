const express = require("express");

const app = express();
app.use(express.json());

let products = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    price: (i + 1) * 100
}));

app.get("/products", (req, res) => {
  res.json(products);
});


app.get("/products/:id", (req, res) => {
  const product = products.find(
    (p) => p.id === Number(req.params.id)
  );

  if (!product) {
    return res.status(404).send("Product not found");
  }

  res.json(product);
});


function validProduct(body, partial = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const has = (key) => Object.prototype.hasOwnProperty.call(body, key);
  if (!partial || has("name")) {
    if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 120) return false;
  }
  if (!partial || has("price")) {
    if (typeof body.price !== "number" || !Number.isFinite(body.price) || body.price < 0) return false;
  }
  return !partial || has("name") || has("price");
}

app.post("/products", (req, res) => {
  if (!validProduct(req.body)) return res.status(400).json({message: "Provide a name and a nonnegative numeric price"});
  const newProduct = {
    id: products.length
      ? Math.max(...products.map((p) => p.id)) + 1
      : 1,
    name: req.body.name.trim(),
    price: req.body.price
  };

  products.push(newProduct);

  res.status(201).json(newProduct);
});


app.put("/products/:id", (req, res) => {
  if (!validProduct(req.body, true)) return res.status(400).json({message: "Provide a valid name or nonnegative numeric price"});
  const product = products.find(
    (p) => p.id === Number(req.params.id)
  );

  if (!product) {
    return res.status(404).send("Product not found");
  }

  product.name = req.body.name?.trim() ?? product.name;
  product.price = req.body.price ?? product.price;

  res.json(product);
});


app.delete("/products/:id", (req, res) => {
  const id = Number(req.params.id);

  const productExists = products.some(
    (p) => p.id === id
  );

  if (!productExists) {
    return res.status(404).send("Product not found");
  }

  products = products.filter((p) => p.id !== id);

  res.send("Product deleted");
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === "entity.parse.failed") return res.status(400).json({message: "Send valid JSON"});
  if (error.type === "entity.too.large") return res.status(413).json({message: "Request body is too large"});
  res.status(500).json({message: "Unable to process the request"});
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}
module.exports = app;