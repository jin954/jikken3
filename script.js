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
    // スクロールを最初から有効にする
    const imageList = document.getElementById("imageList");
    imageList.style.maxHeight = "200px"; // 適切な高さに設定
    imageList.style.overflowY = "auto"; // スクロールを有効にする
}


function closeSettings() {
    document.getElementById("settingsModal").style.display = "none";
}

function saveSettings() {
    alarmTime = document.getElementById("alarmTime").value;
    localStorage.setItem("alarmTime", alarmTime);
    startAlarmCheck();

    // 保存ボタンの設定変更
    document.getElementById("saveAlarm").textContent = "設定済み";
    document.getElementById("saveAlarm").disabled = true;

    // リセットボタンを表示
    document.getElementById("resetAlarm").style.display = "inline";

    // 時間入力を無効化
    document.getElementById("alarmTime").disabled = true;
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

    // 保存ボタンを元に戻す
    document.getElementById("saveAlarm").textContent = "保存";
    document.getElementById("saveAlarm").disabled = false;

    // リセットボタンを非表示
    document.getElementById("resetAlarm").style.display = "none";

    // 時間入力を有効化
    document.getElementById("alarmTime").disabled = false;

    // デフォルトの画像を読み込む
    loadImage(currentIndex);
}

function autoSaveImages() {
    const input = document.getElementById('uploadImage');
    const files = input.files;

    if (files.length > 0) {
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = function (e) {
                // 画像をimages配列に追加
                images.push({ url: e.target.result });
                // images配列をlocalStorageに保存
                localStorage.setItem("images", JSON.stringify(images));
                // 画像リストを更新してスクロールもリセット
                updateImageList();
            };
            reader.readAsDataURL(file);
        }

        // ファイル選択後にinputをクリア
        input.value = '';
    }
}


function updateImageList() {
    const imageList = document.getElementById('imageList');
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

    // スクロール位置をリセット
    imageList.scrollTop = imageList.scrollHeight;
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

// 初期化処理
window.onload = function () {
    currentIndex = parseInt(localStorage.getItem("currentIndex")) || 0;
    loadImage(currentIndex);

    const savedAlarmTime = localStorage.getItem("alarmTime");
    if (savedAlarmTime) {
        alarmTime = savedAlarmTime;
        document.getElementById("alarmTime").value = alarmTime; // アラーム時間を復元
        startAlarmCheck();
        document.getElementById("saveAlarm").textContent = "設定済み";
        document.getElementById("saveAlarm").disabled = true;
        document.getElementById("resetAlarm").style.display = "inline";
        document.getElementById("alarmTime").disabled = true; // アラーム設定済みなら入力無効化
    }

    updateImageList();
    document.getElementById('uploadImage').addEventListener('change', autoSaveImages);

    // ホイールイベントを時間入力に追加
    document.querySelector('input[type="time"]').addEventListener('wheel', function(event) {
        event.preventDefault(); // デフォルトのスクロール動作を無効化

        const delta = Math.sign(event.deltaY); // スクロールの方向を取得（上: -1、下: 1）
        const input = this;

        // 現在の時間を取得して、新しい時間に更新する
        let [hours, minutes] = input.value.split(':').map(Number);

        // スクロール方向に基づいて時間を増減
        if (delta > 0) {
            // 下方向スクロール（時間を進める）
            minutes += 1;
            if (minutes >= 60) {
                minutes = 0;
                hours = (hours + 1) % 24; // 24時間を超えないように
            }
        } else {
            // 上方向スクロール（時間を戻す）
            minutes -= 1;
            if (minutes < 0) {
                minutes = 59;
                hours = (hours === 0 ? 23 : hours - 1);
            }
        }

        // 時刻を2桁にそろえる
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');

        // 値を即座に更新
        input.value = `${formattedHours}:${formattedMinutes}`;
    });
};
