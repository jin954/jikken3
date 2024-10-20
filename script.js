let images = JSON.parse(localStorage.getItem("images")) || [];
let currentIndex = parseInt(localStorage.getItem("currentIndex")) || 0;
let alarmTime = localStorage.getItem("alarmTime") || '';
let alarmCheckInterval;

const defaultImage = "default_image.png";

function loadImage(index) {
    const currentImageElement = document.getElementById("currentImage");
    if (images.length > 0) {
        currentImageElement.src = images[index].url;
    } else {
        currentImageElement.src = defaultImage;
    }
}

function nextImage() {
    currentIndex = (currentIndex + 1) % (images.length || 1);
    localStorage.setItem("currentIndex", currentIndex);
    loadImage(currentIndex);
}

function prevImage() {
    currentIndex = (currentIndex - 1 + (images.length || 1)) % (images.length || 1);
    localStorage.setItem("currentIndex", currentIndex);
    loadImage(currentIndex);
}

function openSettings() {
    document.getElementById("settingsModal").style.display = "block";
    updateImageList();
}

function closeSettings() {
    document.getElementById("settingsModal").style.display = "none";
}

function saveSettings() {
    alarmTime = document.getElementById("alarmTime").value;
    localStorage.setItem("alarmTime", alarmTime);
    alert(`毎日 ${alarmTime} に画像が切り替わります`);
    startAlarmCheck();

    document.getElementById("saveAlarm").textContent = "設定済み";
    document.getElementById("saveAlarm").disabled = true;
    document.getElementById("resetAlarm").style.display = "inline";
}

function startAlarmCheck() {
    clearTimeout(alarmCheckInterval);
    if (!alarmTime) return;

    alarmCheckInterval = setInterval(() => {
        const now = new Date();
        const [alarmHours, alarmMinutes] = alarmTime.split(":").map(Number);
        if (now.getHours() === alarmHours && now.getMinutes() === alarmMinutes) {
            nextImage();
        }
    }, 60000);
}

function resetSettings() {
    localStorage.removeItem("alarmTime");
    alarmTime = '';
    clearTimeout(alarmCheckInterval);
    loadImage(currentIndex);

    const saveButton = document.getElementById("saveAlarm");
    saveButton.textContent = "保存";
    saveButton.disabled = false;

    const resetButton = document.getElementById("resetAlarm");
    resetButton.style.display = "none";
}

// 自動的に画像を保存する関数
function autoSaveImages() {
    const input = document.getElementById('uploadImage');
    const files = input.files;

    if (files.length > 0) {
        // 画像選択時の処理をここで行う
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = function (e) {
                // 画像を配列に追加
                images.push({ url: e.target.result });
                // ローカルストレージに保存
                localStorage.setItem("images", JSON.stringify(images));
                // 画像リストを更新
                updateImageList(); // ここでリストを更新する
            };
            reader.readAsDataURL(file); // 画像ファイルを読み込む
        }

        // ファイル選択後、ファイル入力をクリア
        input.value = ''; // これでファイル選択の表示をクリア
    }
}

function updateImageList() {
    const imageList = document.getElementById("imageList");
    imageList.innerHTML = ""; // 既存のリストをクリア
    images.forEach((image, index) => {
        const imageItem = document.createElement("div");
        imageItem.classList.add("image-item");
        
        const img = document.createElement("img");
        img.src = image.url;
        img.width = 50; // サムネイルサイズ
        img.height = 50;
        imageItem.appendChild(img);

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("image-item-buttons");

        const upButton = document.createElement("button");
        upButton.textContent = "↑";
        upButton.onclick = () => moveImageUp(index);
        buttonContainer.appendChild(upButton);

        const downButton = document.createElement("button");
        downButton.textContent = "↓";
        downButton.onclick = () => moveImageDown(index);
        buttonContainer.appendChild(downButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "削除";
        deleteButton.onclick = () => deleteImage(index);
        buttonContainer.appendChild(deleteButton);

        imageItem.appendChild(buttonContainer);
        imageList.appendChild(imageItem); // 画像項目をリストに追加
    });
}

function moveImageUp(index) {
    if (index > 0) {
        const temp = images[index];
        images[index] = images[index - 1];
        images[index - 1] = temp;
        localStorage.setItem("images", JSON.stringify(images));
        updateImageList();
    }
}

function moveImageDown(index) {
    if (index < images.length - 1) {
        const temp = images[index];
        images[index] = images[index + 1];
        images[index + 1] = temp;
        localStorage.setItem("images", JSON.stringify(images));
        updateImageList();
    }
}

function deleteImage(index) {
    images.splice(index, 1);
    localStorage.setItem("images", JSON.stringify(images));
    updateImageList();
}

// window.onload で初期化
window.onload = function () {
    currentIndex = parseInt(localStorage.getItem("currentIndex")) || 0;
    loadImage(currentIndex);

    const savedAlarmTime = localStorage.getItem("alarmTime");
    if (savedAlarmTime) {
        alarmTime = savedAlarmTime;
        startAlarmCheck();
        document.getElementById("saveAlarm").textContent = "設定済み";
        document.getElementById("saveAlarm").disabled = true;
        document.getElementById("resetAlarm").style.display = "inline";
    }

    updateImageList(); // 画像リストの初期表示

    // 画像ファイルが選択されたときに自動的に保存する
    document.getElementById('uploadImage').addEventListener('change', autoSaveImages);
};
