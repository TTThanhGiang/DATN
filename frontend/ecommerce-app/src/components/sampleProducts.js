// ===============================
// 🛒 DỮ LIỆU DANH MỤC & SẢN PHẨM
// ===============================

// Danh mục chính + danh mục con (không có sản phẩm ở danh mục cha)
export const categories = [{
        id: 1,
        name: "Trái cây",
        image: "/images/icon-fruits.png",
        subCategories: [
            { id: 101, name: "Chuối" },
            { id: 102, name: "Cam" },
            { id: 103, name: "Táo" },
            { id: 104, name: "Dưa hấu" },
        ],
    },
    {
        id: 2,
        name: "Rau củ",
        image: "/images/icon-vegetables.png",
        subCategories: [
            { id: 201, name: "Cà rốt" },
            { id: 202, name: "Cải xanh" },
            { id: 203, name: "Bắp cải" },
        ],
    },
    {
        id: 3,
        name: "Sữa & Sản phẩm từ sữa",
        image: "/images/icon-milk.png",
        subCategories: [
            { id: 301, name: "Sữa tươi" },
            { id: 302, name: "Phô mai" },
            { id: 303, name: "Sữa chua" },
        ],
    },
    {
        id: 4,
        name: "Đồ ăn vặt",
        image: "/images/icon-snacks.png",
        subCategories: [
            { id: 401, name: "Bánh quy" },
            { id: 402, name: "Khoai tây chiên" },
            { id: 403, name: "Kẹo" },
        ],
    },
    {
        id: 5,
        name: "Đồ uống",
        image: "/images/icon-drinks.png",
        subCategories: [
            { id: 501, name: "Nước ngọt" },
            { id: 502, name: "Nước ép" },
            { id: 503, name: "Trà & Cà phê" },
        ],
    },
    {
        id: 6,
        name: "Đồ uống",
        image: "/images/icon-drinks.png",
        subCategories: [
            { id: 601, name: "Nước ngọt" },
            { id: 602, name: "Nước ép" },
            { id: 603, name: "Trà & Cà phê" },
        ],
    },
    {
        id: 7,
        name: "Đồ uống",
        image: "/images/icon-drinks.png",
        subCategories: [
            { id: 701, name: "Nước ngọt" },
            { id: 702, name: "Nước ép" },
            { id: 703, name: "Trà & Cà phê" },
        ],
    },
    {
        id: 8,
        name: "Đồ uống",
        image: "/images/icon-drinks.png",
        subCategories: [
            { id: 801, name: "Nước ngọt" },
            { id: 802, name: "Nước ép" },
            { id: 803, name: "Trà & Cà phê" },
        ],
    },
    {
        id: 9,
        name: "Đồ uống",
        image: "/images/icon-drinks.png",
        subCategories: [
            { id: 901, name: "Nước ngọt" },
            { id: 902, name: "Nước ép" },
            { id: 903, name: "Trà & Cà phê" },
        ],
    },

];

// Hàm tiện ích
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomPrice = (min, max) => Math.floor(Math.random() * (max - min) + min);
const formatCurrency = (num) => num.toLocaleString("vi-VN") + "đ";

// ===============================
// 🧃 SINH NGẪU NHIÊN SẢN PHẨM
// ===============================

export const allProducts = categories.flatMap((cat) =>
    cat.subCategories.flatMap((sub) =>
        Array.from({ length: 6 }, (_, i) => {
            const price = randomPrice(15000, 120000);
            const oldPrice = price + randomPrice(5000, 20000);
            const discountPercent = Math.round(((oldPrice - price) / oldPrice) * 100);
            const unit = cat.id === 3 ? "hộp" : cat.id === 5 ? "chai" : "kg";

            const image = `/images/products/${sub.name
        .toLowerCase()
        .replace(/\s/g, "-")}.png`;

            return {
                id: `${sub.id}-${i + 1}`,
                name: `${sub.name} ${i + 1}`,
                categoryId: cat.id, // gắn với danh mục cha
                category: cat.name,
                subCategoryId: sub.id, // gắn với danh mục con
                subCategory: sub.name,
                price,
                oldPrice,
                discountPercent,
                pricePerUnit: cat.id === 5 ?
                    `${formatCurrency(price)}/chai` : cat.id === 3 ?
                    `${formatCurrency(price)}/hộp` : `${formatCurrency(price)}/kg`,
                unit,
                image,
            };
        })
    )
);