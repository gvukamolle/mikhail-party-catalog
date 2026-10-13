"use strict";
const grid = document.querySelector("#program-grid");
const template = document.querySelector("#program-template");
const labels = { animation: "Анимация", quest: "Квест", show: "Шоу" };
const chapters = {
  animation: ["Встреча с любимым героем", "Персонаж на выбор, игры, музыка и торжественный вынос торта."],
  quest: ["Приключение для всей команды", "Пять историй с испытаниями, поисками сокровищ и подарками для детей."],
  show: ["Самый яркий момент праздника", "Опыты, пузыри, фокусы и программы, в которых дети становятся участниками шоу."]
};
const examples = {
  "animation-standard": ["assets/731913-анимация-02.jpg", "Артисты с супергеройским реквизитом"],
  "animation-vip": ["assets/731912-анимация-01.jpg", "Артист в праздничном костюме"],
  "quest-multiverse": ["assets/731916-анимация-05.jpg", "Персонажи на тематическом празднике"],
  "show-chemistry": ["assets/732006-химическое-шоу-poster.jpg", "Момент химического шоу"],
  "show-paper": ["assets/732009-бумажное-шоу-01-poster.jpg", "Бумажное шоу"],
  "show-magic": ["assets/732012-фокусы-Вилли-Вонка-poster.jpg", "Вилли Вонка с программой фокусов"]
};
const money = new Intl.NumberFormat("ru-RU");
const programDialog = document.querySelector("#program-dialog");
let activePrograms = [];
let selectedIndex = 0;

function programTitle(program) {
  return program.id === "animation-standard" ? "Стандартная анимация" : program.title;
}

function createVisual(program, index) {
  if (program.video) {
    const video = document.createElement("video");
    video.src = program.video;
    video.poster = program.image;
    video.controls = true;
    video.playsInline = true;
    video.preload = "none";
    video.setAttribute("aria-label", `Видео программы: ${programTitle(program)}`);
    video.textContent = "Ваш браузер не поддерживает видео.";
    return video;
  }
  const source = program.image ? [program.image, program.imageAlt] : examples[program.id];
  if (source) {
    const img = document.createElement("img");
    img.src = source[0];
    img.alt = source[1];
    img.loading = "lazy";
    if (!program.image && examples[program.id] && !source[0].includes("poster")) img.className = "event-photo";
    img.width = 1536;
    img.height = 1024;
    return img;
  }
  const visual = document.createElement("div");
  visual.className = "program-placeholder";
  visual.setAttribute("aria-hidden", "true");
  const number = document.createElement("strong");
  number.textContent = String(index + 1).padStart(2, "0");
  const caption = document.createElement("span");
  caption.textContent = labels[program.category];
  visual.append(number, caption);
  return visual;
}

function renderPrograms(category) {
  grid.querySelectorAll("video").forEach(video => video.pause());
  activePrograms = window.partyPrograms.filter(program => program.category === category);
  document.querySelector("#programs").dataset.categoryActive = category;
  document.querySelector("#chapter-title").textContent = chapters[category][0];
  document.querySelector("#chapter-description").textContent = chapters[category][1];
  grid.dataset.layout = activePrograms.length === 2 ? "pair" : "grid";
  for (const filter of document.querySelectorAll(".filter")) filter.setAttribute("aria-pressed", String(filter.dataset.category === category));
  const cards = activePrograms.map((program, index) => {
    const card = template.content.firstElementChild.cloneNode(true);
    card.dataset.program = program.id;
    card.classList.add(`card-${program.category}`);
    card.querySelector(".tag").textContent = program.id === "animation-vip" ? "Анимация VIP" : labels[program.category];
    card.querySelector("h3").textContent = programTitle(program);
    card.querySelector(".program-description").textContent = program.description;
    card.querySelector(".card-bottom strong").textContent = `${money.format(program.price)} ₽`;
    card.querySelector(".card-bottom > span").textContent = program.duration;
    card.querySelector(".program-image").append(createVisual(program, index));
    const button = card.querySelector(".program-open");
    button.setAttribute("aria-label", `Состав программы: ${programTitle(program)}`);
    button.addEventListener("click", () => {
      showProgram(index);
      programDialog.showModal();
    });
    return card;
  });
  grid.replaceChildren(...cards);
  document.querySelector("#result-count").textContent = `${activePrograms.length} ${activePrograms.length === 2 ? "программы" : "программ"}`;
}

function showProgram(index) {
  document.querySelectorAll("video").forEach(video => video.pause());
  selectedIndex = index;
  const program = activePrograms[index];
  document.querySelector("#detail-visual").dataset.program = program.id;
  document.querySelector("#detail-visual").replaceChildren(createVisual(program, index));
  document.querySelector("#detail-category").textContent = labels[program.category];
  document.querySelector("#detail-title").textContent = programTitle(program);
  document.querySelector("#detail-description").textContent = program.description;
  document.querySelector("#detail-duration").textContent = program.duration;
  document.querySelector("#detail-price").textContent = `${money.format(program.price)} ₽`;
  const includes = program.includes.map(text => {
    const li = document.createElement("li");
    li.textContent = text;
    return li;
  });
  document.querySelector("#detail-includes").replaceChildren(...includes);
  const note = document.querySelector("#detail-note");
  note.textContent = program.note || "";
  note.hidden = !program.note;
  document.querySelector("#detail-position").textContent = `${index + 1} / ${activePrograms.length}`;
  document.querySelector("#previous-program").disabled = index === 0;
  document.querySelector("#next-program").disabled = index === activePrograms.length - 1;
  programDialog.querySelector(".program-dialog-shell").scrollTop = 0;
}
for (const button of document.querySelectorAll(".filter")) button.addEventListener("click", () => renderPrograms(button.dataset.category));
for (const link of document.querySelectorAll(".cover-categories a")) link.addEventListener("click", () => renderPrograms(link.dataset.category));
programDialog.querySelector(".dialog-close").addEventListener("click", () => programDialog.close());
document.querySelector("#back-to-catalogue").addEventListener("click", () => programDialog.close());
programDialog.addEventListener("click", event => { if (event.target === programDialog) programDialog.close(); });
programDialog.addEventListener("close", () => programDialog.querySelectorAll("video").forEach(video => video.pause()));
document.querySelector("#previous-program").addEventListener("click", () => { if (selectedIndex > 0) showProgram(selectedIndex - 1); });
document.querySelector("#next-program").addEventListener("click", () => { if (selectedIndex < activePrograms.length - 1) showProgram(selectedIndex + 1); });

const photos = [
  ["731914-анимация-03.jpg", "Супергерои на тематическом детском празднике"],
  ["731917-анимация-06.jpg", "Артист в образе Вилли Вонки и именинница"],
  ["731919-анимация-08.jpg", "Артисты в костюмах эльфов на семейном празднике"],
  ["731912-анимация-01.jpg", "Артист в ярком костюме среди праздничных декораций"],
  ["731915-анимация-04.jpg", "Артисты в тематических костюмах на празднике"],
  ["731916-анимация-05.jpg", "Космические персонажи на детском дне рождения"],
  ["731913-анимация-02.jpg", "Артисты с супергеройским реквизитом на празднике"],
  ["731918-анимация-07.jpg", "Гости и артист в образе Вилли Вонки на празднике"],
  ["731921-анимация-09.jpg", "Артист в образе персонажа из «Матрицы»"],
  ["732921-крио-шоу.jpg", "Артист проводит опыты с сухим льдом на крио-шоу"]
];
const photoDialog = document.querySelector("#photo-dialog");
const photoGallery = document.querySelector("#photo-gallery");
photos.forEach(([file, description], index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "gallery-photo";
  button.setAttribute("aria-label", `Открыть: ${description}`);
  button.hidden = index >= 6;
  const img = document.createElement("img");
  img.src = `assets/${file}`;
  img.alt = description;
  img.loading = "lazy";
  img.width = 960;
  img.height = 1280;
  button.append(img);
  button.addEventListener("click", () => {
    document.querySelectorAll("video").forEach(video => video.pause());
    const large = document.querySelector("#large-photo");
    large.src = img.src;
    large.alt = description;
    document.querySelector("#photo-caption").textContent = description;
    photoDialog.showModal();
  });
  photoGallery.append(button);
});
photoDialog.querySelector(".dialog-close").addEventListener("click", () => photoDialog.close());
photoDialog.addEventListener("click", event => { if (event.target === photoDialog) photoDialog.close(); });
document.querySelector("#more-photos").addEventListener("click", event => {
  const expanded = event.currentTarget.getAttribute("aria-expanded") === "true";
  for (const [index, photo] of [...photoGallery.children].entries()) if (index >= 6) photo.hidden = expanded;
  event.currentTarget.setAttribute("aria-expanded", String(!expanded));
  event.currentTarget.textContent = expanded ? "Все фотографии" : "Свернуть фотографии";
});

const videos = [
  ["732910-праздник.mp4", "Праздник в движении", "Игры, музыка и счастливые моменты"],
  ["732911-праздник.mp4", "Встреча с героями", "Любимые персонажи и командные игры"],
  ["732012-фокусы-Вилли-Вонка.mp4", "Вилли Вонка и фокусы", "Немного праздничного волшебства"],
  ["732913-праздник.mp4", "История с Вилли Вонкой", "Ещё один момент с праздника"],
  ["732914-праздник.mp4", "Звёздный праздник", "Герои и гости в центре событий"],
  ["732915-праздник.mp4", "Опыты на празднике", "Герои и удивительные эксперименты"],
  ["732916-праздник.mp4", "Шоу с опытами", "Опыты и участие гостей"],
  ["732917-праздник.mp4", "После праздника", "Ещё один ролик с праздничной площадки"],
  ["732006-химическое-шоу.mp4", "Химическое шоу", "Опыты с сухим льдом"],
  ["732009-бумажное-шоу-01.mp4", "Бумажная дискотека", "Много бумаги, музыки и движения"],
  ["732010-бумажное-шоу-02.mp4", "Бумажное шоу", "Ещё один момент с праздника"]
];
for (const [file, title, description] of videos) {
  const figure = document.createElement("figure");
  figure.className = "video-card";
  const video = document.createElement("video");
  video.src = `assets/${file}`;
  video.poster = `assets/${file.replace(".mp4", "-poster.jpg")}`;
  video.controls = true;
  video.playsInline = true;
  video.preload = "none";
  video.setAttribute("aria-label", title);
  video.textContent = "Ваш браузер не поддерживает видео.";
  const caption = document.createElement("figcaption");
  const heading = document.createElement("h3");
  heading.textContent = title;
  const text = document.createElement("p");
  text.textContent = description;
  caption.append(heading, text);
  figure.append(video, caption);
  document.querySelector("#video-gallery").append(figure);
}
document.addEventListener("play", event => {
  if (event.target.tagName === "VIDEO") {
    document.querySelectorAll("video").forEach(video => { if (video !== event.target) video.pause(); });
  }
}, true);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) document.querySelectorAll("video").forEach(video => video.pause());
});
renderPrograms("animation");
