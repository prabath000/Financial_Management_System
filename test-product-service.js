const ProductService = require('./server/services/productService');

try {
    console.log("Attempting to create product via Service...");
    const product = ProductService.create({
        name: "Test Product",
        category: "Test",
        quantity: 10,
        price: 100,
        alertLevel: 5
    });
    console.log("Product created successfully:", product);

    console.log("Attempting to fetch products...");
    const products = ProductService.getAll();
    console.log("Products found:", products.length);
    console.log(products);

} catch (err) {
    console.error("Service Error:", err);
}
