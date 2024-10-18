let images = ["スクリーンショット 2024-10-18 094230.png"]; // 初期画像
let currentIndex = 0;
let displayTime = 12 * 60 * 60 * 1000; // デフォルトの画像表示時間 (12時間)
let timer;

// 画像を読み込む
function loadImage(index) {
    if (images.length > 0) {
        document.getElementById("currentImage").src = images[index];
    }
}

// 次の画像へ
function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    loadImage(currentIndex);
    resetTimer();
}

// 前の画像へ
function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    loadImage(currentIndex);
    resetTimer();
}

// タイマーを開始
function startTimer() {
    timer = setTimeout(nextImage, displayTime);
}

// タイマーをリセット
function resetTimer() {
    clearTimeout(timer);
    startTimer();
}

// 設定モーダルを開く
function openSettings() {
    document.getElementById("settingsModal").style.display = "block";
    updateImageList();
}

// 設定モーダルを閉じる
function closeSettings() {
    document.getElementById("settingsModal").style.display = "none";
}

// 画像リストを更新する
function updateImageList() {
    const imageList = document.getElementById("imageList");
    imageList.innerHTML = ""; // リストをクリア
    images.forEach((image, index) => {
        const div = document.createElement("div");
        div.className = "image-item";
        div.innerHTML = `画像${index + 1}: <span>${image}</span>
            <button onclick="moveImageUp(${index})">↑</button>
            <button onclick="moveImageDown(${index})">↓</button>
            <button onclick="deleteImage(${index})">削除</button>`;
        imageList.appendChild(div);
    });
}

// 画像を削除する
function deleteImage(index) {
    images.splice(index, 1);
    updateImageList();
    if (currentIndex >= images.length) {
        currentIndex = 0;
    }
    loadImage(currentIndex);
}

// 画像を上に移動する
function moveImageUp(index) {
    if (index > 0) {
        [images[index - 1], images[index]] = [images[index], images[index - 1]];
        updateImageList();
        loadImage(currentIndex);
    }
}

// 画像を下に移動する
function moveImageDown(index) {
    if (index < images.length - 1) {
        [images[index + 1], images[index]] = [images[index], images[index + 1]];
        updateImageList();
        loadImage(currentIndex);
    }
}

// 設定を保存
function saveSettings() {
    const uploadInput = document.getElementById("uploadImage");
    const timeInput = document.getElementById("displayTime").value;

    // 画像をアップロードする
    if (uploadInput.files.length > 0) {
        for (const file of uploadInput.files) {
            const url = URL.createObjectURL(file);
            if (images.length < 30) {
                images.push(url);
            } else {
                alert("画像の最大登録数は30枚です。");
                break;
            }
        }
    }

    // 表示時間を設定する
    if (timeInput >= 1 && timeInput <= 24) {
        displayTime = timeInput * 60 * 60 * 1000; // 時間をミリ秒に変換
    }

    closeSettings();
    resetTimer();
}

// 初期化処理
window.onload = function() {
    loadImage(currentIndex);
    startTimer();
    updateImageList();
};
