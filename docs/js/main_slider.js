const images = document.querySelectorAll('.slider_img');
const links = document.querySelectorAll('.slider_link');
const btn = document.querySelectorAll('.btn');
const description = document.querySelector('.description');
let imageIndex = 0;

// Массив стран, соответствующих изображениям в слайдере
const countries = [
  'Таиланд', // images/tours/id13.webp
  'ОАЭ',     // images/tours/id15.webp
  'Египет',  // images/tours/id5.webp
  'Испания', // images/tours/id14.jpg
  'Турция'   // images/tours/id1.webp
];

function show(index) {
    // Убираем active с текущих изображения и ссылки
    images[imageIndex].classList.remove('active');
    links[imageIndex].classList.remove('active');
    // Добавляем active к новому изображению и ссылке
    images[index].classList.add('active');
    links[index].classList.add('active');
    imageIndex = index;
    // Обновляем текст в .description
    description.textContent = countries[index];
}

btn.forEach((e) => {
    e.addEventListener('click', () => {
        if (e.classList.contains('prev_btn')) {
            let index = imageIndex - 1;
            if (index < 0) {
                index = images.length - 1;
            }
            show(index);
        } else if (e.classList.contains('next_btn')) {
            let index = imageIndex + 1;
            if (index >= images.length) {
                index = 0;
            }
            show(index);
        }
    });
});

show(imageIndex);