// 画像リスト
const images = ["image1.jpg", "image2.jpg", "image3.jpg"];
let currentIndex = 0;

// メイン画像を表示
const mainImage = document.getElementById("mainImage");
const prevImageButton = document.getElementById("prevImage");
const nextImageButton = document.getElementById("nextImage");

// 画像切り替え関数
function updateImage() {
    mainImage.src = images[currentIndex];
}

prevImageButton.addEventListener("click", () => {
    currentIndex = (currentIndex === 0) ? images.length - 1 : currentIndex - 1;
    updateImage();
});

nextImageButton.addEventListener("click", () => {
    currentIndex = (currentIndex === images.length - 1) ? 0 : currentIndex + 1;
    updateImage();
});

// モーダル
const modal = document.getElementById("settingsModal");
const openModalButton = document.getElementById("openModal");
const closeModalButton = document.getElementById("closeModal");
const closeModalBottomButton = document.getElementById("closeModalBottom");

openModalButton.addEventListener("click", () => {
    modal.style.display = "block";
});

closeModalButton.addEventListener("click", () => {
    modal.style.display = "none";
});

closeModalBottomButton.addEventListener("click", () => {
    modal.style.display = "none";
});

// 画像アップロード
const imageUpload = document.getElementById("imageUpload");
const uploadButton = document.getElementById("uploadButton");
const imageList = document.getElementById("imageList");

uploadButton.addEventListener("click", () => {
    const file = imageUpload.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const newImage = document.createElement("li");
            newImage.innerHTML = `<img src="${e.target.result}" class="image-item"><button>削除</button>`;
            imageList.appendChild(newImage);
        };
        reader.readAsDataURL(file);
    }
});
