document.addEventListener("DOMContentLoaded", function () {
    const imageList = [];
    const mainImage = document.getElementById("mainImage");
    let currentIndex = 0;

    document.getElementById("prevBtn").addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
        updateImage();
    });

    document.getElementById("nextBtn").addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % imageList.length;
        updateImage();
    });

    document.getElementById("stopBtn").addEventListener("click", () => {
        // スライドショー停止機能
    });

    document.getElementById("uploadImageBtn").addEventListener("click", () => {
        const fileInput = document.getElementById("imageUpload");
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imageList.push(e.target.result);
                updateImageList();
            };
            reader.readAsDataURL(file);
        }
    });

    function updateImage() {
        if (imageList.length > 0) {
            mainImage.src = imageList[currentIndex];
        }
    }

    function updateImageList() {
        const imageListContainer = document.getElementById("imageList");
        imageListContainer.innerHTML = "";
        imageList.forEach((src, index) => {
            const li = document.createElement("li");
            const img = document.createElement("img");
            img.src = src;
            img.width = 50;
            img.height = 50;

            const upButton = document.createElement("button");
            upButton.textContent = "↑";
            const downButton = document.createElement("button");
            downButton.textContent = "↓";
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "削除";

            upButton.addEventListener("click", () => moveImage(index, -1));
            downButton.addEventListener("click", () => moveImage(index, 1));
            deleteButton.addEventListener("click", () => deleteImage(index));

            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("image-item-buttons");
            buttonContainer.appendChild(upButton);
            buttonContainer.appendChild(downButton);
            buttonContainer.appendChild(deleteButton);

            const listItem = document.createElement("div");
            listItem.classList.add("image-item");
            listItem.appendChild(img);
            listItem.appendChild(buttonContainer);

            imageListContainer.appendChild(listItem);
        });
    }

    function moveImage(index, direction) {
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < imageList.length) {
            const temp = imageList[index];
            imageList[index] = imageList[newIndex];
            imageList[newIndex] = temp;
            updateImageList();
        }
    }

    function deleteImage(index) {
        imageList.splice(index, 1);
        updateImageList();
        if (currentIndex >= imageList.length) {
            currentIndex = imageList.length - 1;
        }
        updateImage();
    }

    document.getElementById("openModalBtn").addEventListener("click", () => {
        document.getElementById("modal").style.display = "block";
    });

    document.getElementById("closeModalBtn").addEventListener("click", () => {
        document.getElementById("modal").style.display = "none";
    });

    document.getElementById("closeModalBtnBottom").addEventListener("click", () => {
        document.getElementById("modal").style.display = "none";
    });
});
