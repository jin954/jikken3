let images = JSON.parse(localStorage.getItem("images")) || [];
let currentIndex = parseInt(localStorage.getItem("currentIndex")) || 0;
let displayTime = (localStorage.getItem("displayTime") || 0) * 60 * 1000;
let selectedMode = localStorage.getItem("selectedMode") || 'timer'; // モードの状態をローカルストレージで管理
let alarmTime = localStorage.getItem("alarmTime") || '';
let timer, alarmCheckInterval;

const defaultImage = "default_image.png";

// ページが読み込まれたときに実行
window.onload = function() {
    currentIndex = parseInt(localStorage.getItem("currentIndex")) || 0;
    loadImage(currentIndex);

    // タイマーの設定を復元
    const savedDisplayTime = localStorage.getItem("displayTime");
    if (savedDisplayTime) {
        displayTime = savedDisplayTime * 60 * 1000;
        document.getElementById("timerTime").value = formatTime(savedDisplayTime);
        if (selectedMode === 'timer') {
            startTimer();
        }
    }

    // アラームの設定を復元
    const savedAlarmTime = localStorage.getItem("alarmTime");
    if (savedAlarmTime) {
        alarmTime = savedAlarmTime;
        document.getElementById("alarmTime").value = alarmTime;
        if (selectedMode === 'alarm') {
            startAlarmCheck();
        }
    }

    updateModeButtons(); // モードに応じてボタンの色を更新
    updateImageList();
};

// 画像をロード
function loadImage(index) {
    const currentImageElement = document.getElementById("currentImage");
    if (images.length > 0) {
        currentImageElement.src = images[index].url;
    } else {
        currentImageElement.src = defaultImage;
    }
}

// タイマー開始
function startTimer() {
    clearTimeout(timer);
    if (displayTime > 0) {
        timer = setTimeout(nextImage, displayTime);
    }
}

// タイマーリセット
function resetTimer() {
    clearTimeout(timer);
    startTimer();
}

// 次の画像を表示
function nextImage() {
    currentIndex = (currentIndex + 1) % (images.length || 1);
    localStorage.setItem("currentIndex", currentIndex);
    loadImage(currentIndex);
    resetTimer();
}

// アラームチェックの開始
function startAlarmCheck() {
    clearInterval(alarmCheckInterval);
    alarmCheckInterval = setInterval(() => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (currentTime === alarmTime) {
            nextImage();
            clearInterval(alarmCheckInterval); // アラームが発動したらチェックを停止
        }
    }, 1000); // 毎秒チェック
}

// モードの選択
function selectMode(mode) {
    selectedMode = mode;
    localStorage.setItem("selectedMode", selectedMode); // モードを保存
    updateModeButtons();

    if (mode === 'timer') {
        document.querySelector('.timer-settings').style.display = 'block';
        document.querySelector('.alarm-settings').style.display = 'none';
        clearInterval(alarmCheckInterval); // アラームのチェックを停止
        startTimer(); // タイマーを開始
    } else if (mode === 'alarm') {
        document.querySelector('.timer-settings').style.display = 'none';
        document.querySelector('.alarm-settings').style.display = 'block';
        clearTimeout(timer); // タイマーを停止
        startAlarmCheck(); // アラームのチェックを開始
    }
}

// ボタンの色を更新
function updateModeButtons() {
    const timerButton = document.getElementById("saveTimer");
    const alarmButton = document.getElementById("saveAlarm");

    if (selectedMode === 'timer') {
        timerButton.style.backgroundColor = "blue";
        alarmButton.style.backgroundColor = "gray";
    } else if (selectedMode === 'alarm') {
        timerButton.style.backgroundColor = "gray";
        alarmButton.style.backgroundColor = "blue";
    }
}

// 設定の保存
function saveSettings() {
    if (selectedMode === 'timer') {
        const timerTime = document.getElementById("timerTime").value;
        const [hours, minutes] = timerTime.split(":").map(Number);
        displayTime = (hours * 60 + minutes) * 60 * 1000;
        localStorage.setItem("displayTime", (hours * 60 + minutes));
        resetTimer();
    } else if (selectedMode === 'alarm') {
        alarmTime = document.getElementById("alarmTime").value;
        localStorage.setItem("alarmTime", alarmTime);
        startAlarmCheck();
    }
}

// 時間を00:00形式で表示するための関数
function formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
