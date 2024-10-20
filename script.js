let images = JSON.parse(localStorage.getItem("images")) || [];
let currentIndex = parseInt(localStorage.getItem("currentIndex")) || 0;
let displayTime = (localStorage.getItem("displayTime") || 0) * 60 * 1000;
let timer;
let selectedMode = 'timer';
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
    resetTimer();
}

function prevImage() {
    currentIndex = (currentIndex - 1 + (images.length || 1)) % (images.length || 1);
    localStorage.setItem("currentIndex", currentIndex);
    loadImage(currentIndex);
    resetTimer();
}

function startTimer() {
    clearTimeout(timer);
    if (displayTime > 0) {
        timer = setTimeout(nextImage, displayTime);
    }
}

function resetTimer() {
    clearTimeout(timer);
    startTimer();
}

function openSettings() {
    document.getElementById("settingsModal").style.display = "block";
    updateImageList();
}

function closeSettings() {
    document.getElementById("settingsModal").style.display = "none";
}

function selectMode(mode) {
    selectedMode = mode;
    if (mode === 'timer') {
        document.querySelector('.timer-settings').style.display = 'block';
        document.querySelector('.alarm-settings').style.display = 'none';
    } else {
        document.querySelector('.timer-settings').style.display = 'none';
        document.querySelector('.alarm-settings').style.display = 'block';
    }
}

function saveSettings() {
    if (selectedMode === 'timer') {
        const timerTime = document.getElementById("timerTime").value;
        const [hours, minutes] = timerTime.split(":").map(Number);
        displayTime = (hours * 60 + minutes) * 60 * 1000;
        localStorage.setItem("displayTime", (hours * 60 + minutes));
        resetTimer();

        document.getElementById("saveTimer").textContent = "設定済み";
        document.getElementById("saveTimer").disabled = true;
        document.getElementById("resetTimer").style.display = "inline";

    } else if (selectedMode === 'alarm') {
        alarmTime = document.getElementById("alarmTime").value;
        localStorage.setItem("alarmTime", alarmTime);
        alert(`毎日 ${alarmTime} に画像が切り替わります`);
        startAlarmCheck();

        document.getElementById("saveAlarm").textContent = "設定済み";
        document.getElementById("saveAlarm").disabled = true;
        document.getElementById("resetAlarm").style.display = "inline";
    }
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
    if (selectedMode === 'timer') {
        localStorage.removeItem("displayTime");
        displayTime = 0;
    } else if (selectedMode === 'alarm') {
        localStorage.removeItem("alarmTime");
        alarmTime = '';
        clearTimeout(alarmCheckInterval);
    }

    clearTimeout(timer);
    loadImage(currentIndex);

    const saveButton = selectedMode === 'timer' ? document.getElementById("saveTimer") : document.getElementById("saveAlarm");
    saveButton.textContent = "保存";
    saveButton.disabled = false;

    const resetButton = selectedMode === 'timer' ? document.getElementById("resetTimer") : document.getElementById("resetAlarm");
    resetButton.style.display = "none";
}

function saveImages() {
    const uploadInput = document.getElementById("uploadImage");
    if (uploadInput.files.length > 0) {
        for (const file of uploadInput.files) {
            const reader = new FileReader();
            reader.onload = function (e) {
                images.push({ url: e.target.result });
                localStorage.setItem("images", JSON.stringify(images));
                updateImageList();
            };
            reader.readAsDataURL(file);
        }
    }
}

function updateImageList() {
    const imageList = document.getElementById("imageList");
    imageList.innerHTML = "";
    images.forEach((image, index) => {
        const imageItem = document.createElement("div");
        imageItem.classList.add("image-item");
        
        const img = document.createElement("img");
        img.src = image.url;
        img.width = 50;
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
        imageList.appendChild(imageItem);
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

window.onload = function () {
    currentIndex = parseInt(localStorage.getItem("currentIndex")) || 0;
    loadImage(currentIndex);

    const savedDisplayTime = localStorage.getItem("displayTime");
    if (savedDisplayTime) {
        displayTime = savedDisplayTime * 60 * 1000;
        startTimer();
        document.getElementById("saveTimer").textContent = "設定済み";
        document.getElementById("saveTimer").disabled = true;
        document.getElementById("resetTimer").style.display = "inline";
        
        // タイマーの時間入力欄を更新する
        const hours = Math.floor(savedDisplayTime / 60);
        const minutes = savedDisplayTime % 60;
        document.getElementById("timerTime").value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    const savedAlarmTime = localStorage.getItem("alarmTime");
    if (savedAlarmTime) {
        alarmTime = savedAlarmTime;
        startAlarmCheck();
        document.getElementById("saveAlarm").textContent = "設定済み";
        document.getElementById("saveAlarm").disabled = true;
        document.getElementById("resetAlarm").style.display = "inline";
    }

    updateImageList();
};
