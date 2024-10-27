let images = JSON.parse(localStorage.getItem("images")) || [];
let currentIndex = parseInt(localStorage.getItem("currentIndex")) || 0;
let alarmTime = localStorage.getItem("alarmTime") || '';
let alarmCheckInterval;

const defaultImage = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500'><rect width='500' height='500' fill='white'/></svg>";

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
            resetSettings();
        }
    }, 60000);
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

async function autoSaveImages() {
    const input = document.getElementById('uploadImage');
    const files = input.files;

    if (files.length > 0) {
        const maxImageCount = 100;
        if (images.length + files.length > maxImageCount) {
            console.warn(`画像は最大${maxImageCount}枚まで登録できます。`);
            input.value = '';
            return;
        }

        for (const file of files) {
            await readFileAndRegister(file);
        }

        updateImageList(); // 最後に一度だけリストを更新
        input.value = '';
    }
}

function readFileAndRegister(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const imageUrl = event.target.result;
            registerImage(imageUrl);
            resolve();
        };
        reader.readAsDataURL(file);
    });
}

function registerImage(imageUrl) {
    images.push({ url: imageUrl });
    localStorage.setItem("images", JSON.stringify(images));
}

function updateImageList() {
    const imageList = document.getElementById('imageList');
    imageList.innerHTML = '';

    images.forEach((image, index) => {
        createImageListItem(imageList, image, index);
    });
}

function createImageListItem(imageList, image, index) {
    const imageItem = document.createElement("div");
    imageItem.classList.add("image-item");
    imageItem.dataset.index = index;

    const img = document.createElement("img");
    img.src = image.url;
    img.width = 50;
    img.height = 50;
    imageItem.appendChild(img);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("image-item-buttons");

    const upButton = document.createElement("button");
    upButton.textContent = "↑";
    upButton.onclick = () => {
        moveImageUp(index);
        updateImageList();
    };
    buttonContainer.appendChild(upButton);

    const downButton = document.createElement("button");
    downButton.textContent = "↓";
    downButton.onclick = () => {
        moveImageDown(index);
        updateImageList();
    };
    buttonContainer.appendChild(downButton);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.onclick = () => {
        deleteImage(index);
        updateImageList();
    };
    buttonContainer.appendChild(deleteButton);

    imageItem.appendChild(buttonContainer);
    imageList.appendChild(imageItem);
}

function deleteImage(index) {
    if (index < 0 || index >= images.length) return;

    images.splice(index, 1);
    localStorage.setItem("images", JSON.stringify(images));

    currentIndex = Math.min(currentIndex, images.length - 1);
    localStorage.setItem("currentIndex", currentIndex);

    updateImageList();
    loadImage(currentIndex);
}

function moveImageUp(index) {
    if (index > 0) {
        [images[index], images[index - 1]] = [images[index - 1], images[index]];
        localStorage.setItem("images", JSON.stringify(images));
        updateImageList();
    }
}

function moveImageDown(index) {
    if (index < images.length - 1) {
        [images[index], images[index + 1]] = [images[index + 1], images[index]];
        localStorage.setItem("images", JSON.stringify(images));
        updateImageList();
    }
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
    loadImage(currentIndex);
    updateImageList();

    if (alarmTime) {
        document.getElementById("alarmTime").value = alarmTime;
        startAlarmCheck();
    }
};
