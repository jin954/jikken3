let images = []; // 画像のURLを格納する配列
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
}

// 設定モーダルを閉じる
function closeSettings() {
    document.getElementById("settingsModal").style.display = "none";
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
};
