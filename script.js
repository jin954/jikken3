let images = JSON.parse(localStorage.getItem("images")) || [];
let currentIndex = parseInt(localStorage.getItem("currentIndex")) || 0;
let alarmTime = localStorage.getItem("alarmTime") || '';
let alarmCheckInterval;

const defaultImage = "default_image.png"; // 初期画像のパス

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
    startAlarmCheck();

    document.getElementById("saveAlarm").textContent = "設定済み";
    document.getElementById("saveAlarm").disabled = true;
    document.getElementById("resetAlarm").style.display = "inline";
    document.getElementById("alarmTime").disabled = true;
}

function startAlarmCheck() {
    clearInterval(alarmCheckInterval);
    if (!alarmTime) return;

    alarmCheckInterval = setInterval(() => {
        const now = new Date();
        const [alarmHours, alarmMinutes] = alarmTime.split(":").map(Number);
        if (now.getHours() === alarmHours && now.getMinutes() === alarmMinutes) {
            nextImage();
        }
    }, 60000); // 1分ごとにチェック
}

function resetSettings() {
    localStorage.removeItem("alarmTime");
    alarmTime = '';
    clearInterval(alarmCheckInterval);

    document.getElementById("saveAlarm").textContent = "保存";
    document.getElementById("saveAlarm").disabled = false;
    document.getElementById("resetAlarm").style.display = "none";
    document.getElementById("alarmTime").disabled = false;
}

function autoSaveImages() {
    const input = document.getElementById('uploadImage');
    const files = input.files;

    if (files.length > 0) {
        let fileCount = files.length;
        let loadedCount = 0;

        for (const file of files) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const imageUrl = event.target.result;
                registerImage(imageUrl);
                loadedCount++;

                // すべての画像が読み込み終わったらリストを更新
                if (loadedCount === fileCount) {
                    updateImageList();
                }
            };
            reader.readAsDataURL(file);
        }
        input.value = ''; // ファイル選択後にファイル入力をクリア
    }
}

function registerImage(imageUrl) {
    images.push({ url: imageUrl });
    localStorage.setItem("images", JSON.stringify(images));
    updateImageList();
}

function updateImageList() {
    const imageList = document.getElementById('imageList');

    // 既に表示されているリストを維持し、差分だけを更新する
    images.forEach((image, index) => {
        if (!imageList.children[index]) {
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
        }
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

// 時間入力に対するホイール操作を制御
const timeInput = document.getElementById("alarmTime");
timeInput.addEventListener('wheel', function(event) {
    event.preventDefault();
    const delta = event.deltaY;
    let [hours, minutes] = timeInput.value.split(':').map(Number);

    if (delta > 0) {
        minutes = (minutes + 1) % 60;
        hours = minutes === 0 ? (hours + 1) % 24 : hours;
    } else {
        minutes = (minutes === 0) ? 59 : minutes - 1;
        hours = (minutes === 59) ? (hours === 0 ? 23 : hours - 1) : hours;
    }

    timeInput.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
});

// 初期化処理
window.onload = function () {
    loadImage(currentIndex); // 初期の画像表示
    updateImageList(); // 画像リストの初期表示

    if (alarmTime) {
        document.getElementById("alarmTime").value = alarmTime;
        saveSettings();
    }
    startAlarmCheck();
};
