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
    updateModeButtons();

    if (mode === 'timer') {
        // タイマーを有効化し、アラームを無効化
        document.querySelector('.timer-settings').style.display = 'block';
        document.querySelector('.alarm-settings').style.display = 'none';
        clearTimeout(alarmCheckInterval); // アラームのチェックを停止
        startTimer(); // タイマーを開始
    } else if (mode === 'alarm') {
        // アラームを有効化し、タイマーを無効化
        document.querySelector('.timer-settings').style.display = 'none';
        document.querySelector('.alarm-settings').style.display = 'block';
        clearTimeout(timer); // タイマーを停止
        startAlarmCheck(); // アラームのチェックを開始
    }
}

function updateModeButtons() {
    const timerButton = document.getElementById("timerButton");
    const alarmButton = document.getElementById("alarmButton");
    
    if (selectedMode === 'timer') {
        timerButton.style.backgroundColor = "blue"; // タイマーモードを強調表示
        alarmButton.style.backgroundColor = "gray"; // アラームモードを非表示
    } else if (selectedMode === 'alarm') {
        timerButton.style.backgroundColor = "gray"; // タイマーモードを非表示
        alarmButton.style.backgroundColor = "blue"; // アラームモードを強調表示
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
        startAlarmCheck();

        document.getElementById("saveAlarm").textContent = "設定済み";
        document.getElementById("saveAlarm").disabled = true;
        document.getElementById("resetAlarm").style.display = "inline";
    }
}

function resetSettings() {
    if (selectedMode === 'timer') {
        localStorage.removeItem("displayTime");
        displayTime = 0;
        clearTimeout(timer);
    } else if (selectedMode === 'alarm') {
        localStorage.removeItem("alarmTime");
        alarmTime = '';
        clearTimeout(alarmCheckInterval);
    }

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
        document.getElementById("saveTimer").textContent = "設定済み";
        document.getElementById("saveTimer").disabled = true;
        document.getElementById("resetTimer").style.display = "inline";

        const hours = Math.floor(savedDisplayTime / 60);
        const minutes = savedDisplayTime % 60;
        document.getElementById("timerTime").value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

        if (selectedMode === 'timer') {
            startTimer(); // タイマーが選択されている場合、タイマーを開始
        }
    }

    const savedAlarmTime = localStorage.getItem("alarmTime");
    if (savedAlarmTime) {
        alarmTime = savedAlarmTime;
        document.getElementById("alarmTime").value = alarmTime;
        document.getElementById("saveAlarm").textContent = "設定済み";
        document.getElementById("saveAlarm").disabled = true;
        document.getElementById("resetAlarm").style.display = "inline";

        if (selectedMode === 'alarm') {
            startAlarmCheck(); // アラームが選択されている場合、アラームを開始
        }
    }

    updateImageList();
    updateModeButtons(); // ボタンの色を初期設定に合わせて更新
};
