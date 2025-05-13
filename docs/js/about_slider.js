const images = document.querySelectorAll('.slider_img');
const buttons = document.querySelectorAll('.btn');
let imageIndex = 0;

function show(index) {
    images[imageIndex].classList.remove('active');
    images[index].classList.add('active');
    imageIndex = index;
}

buttons.forEach((button) => {
    button.addEventListener('click', () => {
        if (button.classList.contains('prev_btn')) {
            let index = imageIndex - 1;
            if (index < 0) {
                index = images.length - 1;
            }
            show(index);
        } else if (button.classList.contains('next_btn')) {
            let index = imageIndex + 1;
            if (index >= images.length) {
                index = 0;
            }
            show(index);
        }
    });
});


if (images.length > 0) {
    show(imageIndex);
}