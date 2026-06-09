let allNews = [];
let filter = "All";
let bookmarks = JSON.parse(localStorage.getItem("missionAccBookmarks") || "[]");
let tracker = JSON.parse(localStorage.getItem("missionAccTracker") || "{}");

const topics = [
  "English Grammar","Vocabulary","Current Affairs","Defence Awareness",
  "General Awareness","Mental Ability","Indian Polity","Indian History",
  "Geography","Economy Basics","Mathematics","SSB Awareness"
];

async function loadNews(){
  const loader = document.getElementById("loader");
  loader.style.display = "block";
  loader.textContent = "Loading live current affairs...";
  try{
    const res = await fetch("/api/current-affairs");
    const data = await res.json();
    if(!data.success) throw new Error(data.message);
    allNews = data.news;
    document.getElementById("newsCount").textContent = data.total;
    document.getElementById("updatedAt").textContent = data.updatedAt.split(",")[1]?.trim() || "Now";
    loader.style.display = "none";
    renderNews();
    renderQuiz();
  }catch(e){
    loader.textContent = "Could not load live affairs. Check after deployment or internet connection.";
  }
}

function setFilter(value){
  filter = value;
  renderNews();
}

function renderNews(){
  const grid = document.getElementById("newsGrid");
  grid.innerHTML = "";
  allNews.filter(n => filter === "All" || n.category === filter).forEach((n, i) => {
    grid.innerHTML += `
      <div class="news-card">
        <span class="tag">${n.category}</span>
        <span class="tag high">${n.importance}</span>
        <h3>${n.title}</h3>
        <p>${n.summary}</p>
        <div class="actions">
          <button class="small" onclick="saveBookmark(${i})">Bookmark</button>
          <a href="${n.link}" target="_blank"><button class="small link">Read Source</button></a>
        </div>
      </div>`;
  });
}

function saveBookmark(i){
  const item = allNews[i];
  if(!bookmarks.some(b => b.title === item.title)){
    bookmarks.push(item);
    localStorage.setItem("missionAccBookmarks", JSON.stringify(bookmarks));
  }
  renderBookmarks();
}

function renderBookmarks(){
  document.getElementById("bookCount").textContent = bookmarks.length;
  const grid = document.getElementById("bookmarkGrid");
  if(bookmarks.length === 0){
    grid.innerHTML = `<div class="card"><h3>No bookmarks yet</h3><p>Save important affairs for revision.</p></div>`;
    return;
  }
  grid.innerHTML = "";
  bookmarks.forEach((b, i) => {
    grid.innerHTML += `
      <div class="news-card">
        <span class="tag">${b.category}</span>
        <h3>${b.title}</h3>
        <p>${b.summary}</p>
        <button class="small" onclick="removeBookmark(${i})">Remove</button>
      </div>`;
  });
}

function removeBookmark(i){
  bookmarks.splice(i, 1);
  localStorage.setItem("missionAccBookmarks", JSON.stringify(bookmarks));
  renderBookmarks();
}

function renderTracker(){
  const grid = document.getElementById("trackerGrid");
  grid.innerHTML = "";
  topics.forEach(topic => {
    const status = tracker[topic] || "Not Started";
    grid.innerHTML += `
      <div class="topic">
        <span class="tag">${status}</span>
        <h3>${topic}</h3>
        <p>Track daily preparation for ${topic}.</p>
        <div class="actions">
          <button class="small" onclick="setStatus('${topic}','Not Started')">Not Started</button>
          <button class="small" onclick="setStatus('${topic}','In Progress')">In Progress</button>
          <button class="small" onclick="setStatus('${topic}','Completed')">Completed</button>
        </div>
      </div>`;
  });
  updateProgress();
}

function setStatus(topic, status){
  tracker[topic] = status;
  localStorage.setItem("missionAccTracker", JSON.stringify(tracker));
  renderTracker();
}

function updateProgress(){
  const done = topics.filter(t => tracker[t] === "Completed").length;
  document.getElementById("doneCount").textContent = done;
}

function renderQuiz(){
  const box = document.getElementById("quizBox");
  const questions = allNews.slice(0, 5).map(n => n.mcq);
  if(questions.length === 0){
    box.innerHTML = "<p>Quiz appears after live affairs load.</p>";
    return;
  }
  box.innerHTML = "";
  questions.forEach((q, index) => {
    box.innerHTML += `<h3>Q${index + 1}. ${q.question}</h3>`;
    q.options.forEach(opt => {
      box.innerHTML += `<div class="option" onclick="checkAnswer(this,'${opt}','${q.answer}')">${opt}</div>`;
    });
  });
}

function checkAnswer(el, opt, ans){
  if(opt === ans) el.classList.add("correct");
  else el.classList.add("wrong");
}

renderTracker();
renderBookmarks();
loadNews();
