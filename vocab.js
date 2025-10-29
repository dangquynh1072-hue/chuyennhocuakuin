// 🌿 Kuin's Vocab App
const STORAGE_KEY = "kuin_vocab_data";
let words = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let reviewQueue = [];
let currentReview = null;

// ===============================
// 📦 Lưu dữ liệu
// ===============================
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  renderWordList();
}

// ===============================
// 🧾 Hiển thị danh sách từ
// ===============================
function renderWordList() {
  const list = document.getElementById("wordList");
  list.innerHTML = words
    .map(
      (w, i) => `
        <div class="card" onclick="startSingleReview(${i})">
            ${w.image ? `<img src="${w.image}" alt="">` : ""}
            <h3>${w.word}</h3>
            <p>${w.pinyin}</p>
            <p>${w.meaning}</p>
        </div>
    `
    )
    .join("");
}

// ===============================
// ➕ Thêm từ mới
// ===============================
document.getElementById("addWordBtn").onclick = () => {
  document.getElementById("addModal").classList.remove("hidden");
};
document.getElementById("cancelAddBtn").onclick = () => {
  document.getElementById("addModal").classList.add("hidden");
};
document.getElementById("saveWordBtn").onclick = () => {
  const w = {
    word: wordInput.value.trim(),
    pinyin: pinyinInput.value.trim(),
    meaning: meaningInput.value.trim(),
    example: exampleInput.value.trim(),
    audio: audioInput.value.trim(),
    image: imageInput.value.trim(),
    easiness: 2.5,
    interval: 1,
    repetitions: 0,
    nextReview: Date.now(),
  };
  if (!w.word || !w.meaning) return alert("Nhập đủ từ và nghĩa!");
  words.push(w);
  saveData();
  document.getElementById("addModal").classList.add("hidden");
  wordInput.value =
    pinyinInput.value =
    meaningInput.value =
    exampleInput.value =
    audioInput.value =
    imageInput.value =
      "";
};

// ===============================
// 🧠 Ôn tập
// ===============================
document.getElementById("reviewBtn").onclick = () => {
  reviewQueue = words.filter((w) => Date.now() >= w.nextReview);
  if (!reviewQueue.length) return alert("Không có từ cần ôn hôm nay!");
  document.getElementById("mainSection").classList.add("hidden");
  document.getElementById("reviewSection").classList.remove("hidden");
  nextCard();
};

function nextCard() {
  if (!reviewQueue.length) {
    alert("Hoàn thành ôn tập 🎉");
    backToList();
    return;
  }
  currentReview = reviewQueue.shift();
  document.getElementById("wordFront").textContent = currentReview.word;
  document.getElementById("wordBack").classList.add("hidden");
  document.getElementById("showMeaningBtn").disabled = false;
}

function startSingleReview(index) {
  reviewQueue = [words[index]];
  document.getElementById("mainSection").classList.add("hidden");
  document.getElementById("reviewSection").classList.remove("hidden");
  nextCard();
}

function updateSRS(grade) {
  const w = currentReview;
  const now = Date.now();
  if (grade < 3) {
    w.repetitions = 0;
    w.interval = 1;
  } else {
    w.repetitions++;
    if (w.repetitions === 1) w.interval = 1;
    else if (w.repetitions === 2) w.interval = 6;
    else w.interval *= w.easiness;
    w.easiness += 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
    if (w.easiness < 1.3) w.easiness = 1.3;
  }
  w.nextReview = now + w.interval * 86400000;
  saveData();
  nextCard();
}

document.getElementById("showMeaningBtn").onclick = () => {
  const back = document.getElementById("wordBack");
  back.classList.remove("hidden");
  back.querySelector("#meaning").textContent = currentReview.meaning;
  back.querySelector("#example").textContent = currentReview.example;
  const img = document.getElementById("imageDisplay");
  if (currentReview.image) {
    img.src = currentReview.image;
    img.classList.remove("hidden");
  } else img.classList.add("hidden");
  const audio = document.getElementById("audioPlayer");
  if (currentReview.audio) {
    audio.src = currentReview.audio;
    audio.classList.remove("hidden");
    audio.play();
  } else audio.classList.add("hidden");
  document.getElementById("showMeaningBtn").disabled = true;
};

// Buttons SRS
document.getElementById("againBtn").onclick = () => updateSRS(1);
document.getElementById("hardBtn").onclick = () => updateSRS(3);
document.getElementById("goodBtn").onclick = () => updateSRS(4);
document.getElementById("easyBtn").onclick = () => updateSRS(5);
document.getElementById("backToListBtn").onclick = backToList;

function backToList() {
  document.getElementById("reviewSection").classList.add("hidden");
  document.getElementById("mainSection").classList.remove("hidden");
  renderWordList();
}

// ===============================
// ☀️ / 🌙 Theme toggle
// ===============================
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

// ===============================
// 💾 Xuất / Nhập JSON
// ===============================
document.getElementById("exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(words, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "vocab_data.json";
  a.click();
};

document.getElementById("importBtn").onclick = () => {
  document.getElementById("fileInput").click();
};
document.getElementById("fileInput").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result);
      if (Array.isArray(imported)) {
        words = imported;
        saveData();
      } else alert("File không hợp lệ!");
    } catch {
      alert("Lỗi đọc file!");
    }
  };
  reader.readAsText(file);
};

// ===============================
// 🚀 Khởi động
// ===============================
renderWordList();
// === 🎵 Trình phát Lofi YouTube ===
const musicBtn = document.getElementById("musicBtn");
const musicPlayer = document.getElementById("musicPlayer");
const musicLink = document.getElementById("musicLink");
const musicFrame = document.getElementById("musicFrame");
const playMusic = document.getElementById("playMusic");
const stopMusic = document.getElementById("stopMusic");
const closeMusic = document.getElementById("closeMusic");

musicBtn.onclick = () => {
  musicPlayer.style.display =
    musicPlayer.style.display === "none" ? "block" : "none";
};

playMusic.onclick = () => {
  const link = musicLink.value.trim();
  if (!link) return alert("Vui lòng nhập link YouTube!");
  const videoId = extractVideoId(link);
  if (!videoId) return alert("Link không hợp lệ!");
  localStorage.setItem("lastMusic", link);
  musicFrame.innerHTML = `<iframe width="100%" height="160" src="https://www.youtube.com/embed/${videoId}?autoplay=1" allow="autoplay"></iframe>`;
};

stopMusic.onclick = () => (musicFrame.innerHTML = "");
closeMusic.onclick = () => (musicPlayer.style.display = "none");

function extractVideoId(url) {
  const match = url.match(/(?:v=|\.be\/)([^&]+)/);
  return match ? match[1] : null;
}

const lastMusic = localStorage.getItem("lastMusic");
if (lastMusic) musicLink.value = lastMusic;
