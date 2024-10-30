let images = JSON.parse(localStorage.getItem("images")) || [];
let currentIndex = parseInt(localStorage.getItem("currentIndex")) || 0;
let alarmTime = localStorage.getItem("alarmTime") || '';
let alarmCheckInterval;
let imageQueue = [];
let isProcessingQueue = false;

const defaultImage = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500'><rect width='500' height='500' fill='white'/></svg>";

function compressImage(imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 200;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
    });
}

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
            imageQueue.push(file);
        }

        input.value = '';
        debounceProcessImageQueue();
    }
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const debounceProcessImageQueue = debounce(processImageQueue, 200);

async function processImageQueue() {
    if (isProcessingQueue || imageQueue.length === 0) return;

    isProcessingQueue = true;

    while (imageQueue.length > 0) {
        const file = imageQueue.shift();
        try {
            const compressedImageUrl = await compressImage(file);
            registerImage(compressedImageUrl);
        } catch (error) {
            console.error("画像の登録中にエラーが発生しました:", error);
        }
    }

    updateImageList();
    isProcessingQueue = false;
}

function registerImage(imageUrl) {
    if (!imageUrl) {
        console.warn("無効な画像URLが指定されました。");
        return;
    }
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
        debounceUpdateImageList();
    };
    buttonContainer.appendChild(upButton);

    const downButton = document.createElement("button");
    downButton.textContent = "↓";
    downButton.onclick = () => {
        moveImageDown(index);
        debounceUpdateImageList();
    };
    buttonContainer.appendChild(downButton);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.onclick = () => {
        deleteImage(index);
        debounceUpdateImageList();
    };
    buttonContainer.appendChild(deleteButton);

    imageItem.appendChild(buttonContainer);
    imageList.appendChild(imageItem);
}

const debounceUpdateImageList = debounce(updateImageList, 200);

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

window.onload = function () {
    loadImage(currentIndex);
    updateImageList();

    if (alarmTime) {
        document.getElementById("alarmTime").value = alarmTime;
        startAlarmCheck();
    }
};
