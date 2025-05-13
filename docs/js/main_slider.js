const images = document.querySelectorAll('.slider_img');
const links = document.querySelectorAll('.slider_link');
const btn = document.querySelectorAll('.btn');
const description = document.querySelector('.description');
let imageIndex = 0;

const countries = [
  'Таиланд', 
  'ОАЭ',     
  'Египет',  
  'Испания', 
  'Турция'   
];

function show(index) {
   
    images[imageIndex].classList.remove('active');
    links[imageIndex].classList.remove('active');
   
    images[index].classList.add('active');
    links[index].classList.add('active');
    imageIndex = index;
   
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