document.addEventListener('DOMContentLoaded', () => {

  const productsImages = {
    wine: './images/wine.png',
    milk: './images/milk.png',
    cheese: './images/cheese.png',
    banana: './images/banana.png',
    apple: './images/apple.png',
    onion: './images/onion.png',
    pineapple: './images/pineapple.png',
    meat: './images/meat.png',
    chips: './images/chips.png',
    chicken: './images/chicken.png',
    jam: './images/jam.png'
  }

  const container = document.querySelector('.shelves');
  const cartElem = document.querySelector('.cart')
  const paymentButton = document.querySelector('.payment-button')
  const cartDrop = document.querySelector('.cart__drop')

  let draggedElement = null;
  let shiftX = 0
  let shiftY = 0
  let cntItemsAdded = 0
  let isTouch = false
  let initialPosition = { x: 0, y: 0 }

  const transformElement = (x, y) => {
    draggedElement.style.left = `${x - shiftX}px`;
    draggedElement.style.top = `${y - shiftY}px`;
  };

  const getCoords = (el) => {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + scrollX,
      y: rect.top + scrollY
    };
  };

  const addProductToCart = (product) => {
    const productElem = document.createElement('div');
    productElem.classList.add('cart__item');
    productElem.innerHTML = `<img src="${productsImages[product]}" alt="${product}">`;
    cartElem.querySelector('.cart__items').append(productElem);
    cntItemsAdded++

    if (cntItemsAdded >= 3) {
      paymentButton.classList.add('payment-button--active')
    }
  }

  const createGhostElement = (data) => {
    const ghostItem = document.createElement('div');
    ghostItem.classList.add('product', 'product--ghost');
    ghostItem.dataset.product = data.dataset.product;
    ghostItem.style.width = `${data.offsetWidth}px`;
    ghostItem.style.height = `${data.offsetHeight}px`;
    return ghostItem;
  };

  const isMouseInCart = (mouseX, mouseY) => {
    const { left, right, top, bottom } = cartElem.getBoundingClientRect();
    return mouseX > left && mouseX < right && mouseY > top && mouseY < bottom;
  };

  const replaceGhostToSold = el => {
    if (el) {
      el.classList.add('product--sold');
      el.classList.remove('product--ghost');
    }
  }

  const preventPageReload = (e) => {
    if (draggedElement) {
      e.preventDefault();
    }
  };

  const returnElementToInitialPosition = (ghostItem) => {
    const startX = parseFloat(draggedElement.style.left);
    const startY = parseFloat(draggedElement.style.top);
    const endX = initialPosition.x;
    const endY = initialPosition.y;

    let startTime = null;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = (time - startTime) / 150;
      if (progress < 1) {
        draggedElement.style.left = `${startX + (endX - startX) * progress}px`;
        draggedElement.style.top = `${startY + (endY - startY) * progress}px`;
        requestAnimationFrame(animate);
      } else {
        draggedElement.removeAttribute('style');
        draggedElement.classList.remove('product--dragging');
        ghostItem.remove();
        draggedElement = null;
      }

    };

    requestAnimationFrame(animate);
  };

  const onDragStart = (e) => {
    isTouch = e.type === 'touchstart';
    const startEvent = isTouch ? e.touches[0] : e;

    const target = startEvent.target.closest('.product');
    if (!target || cntItemsAdded >= 3) return;

    draggedElement = target;
    draggedElement.ondragstart = () => false;

    const elementCoords = getCoords(draggedElement);
    const ghostItem = createGhostElement(draggedElement);

    initialPosition = { x: elementCoords.x, y: elementCoords.y };
    draggedElement.classList.add('product--dragging');

    shiftX = startEvent.pageX - elementCoords.x;
    shiftY = startEvent.pageY - elementCoords.y;

    transformElement(startEvent.clientX, startEvent.clientY);

    draggedElement.insertAdjacentElement('beforeBegin', ghostItem);
    cartDrop.classList.add('cart__drop--active')

    if (isTouch) {
      document.addEventListener('touchmove', onDragMove);
      document.addEventListener('touchend', onDragEnd);
    } else {
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    }
  }

  const onDragMove = (e) => {
    if (!draggedElement) return;
    const moveEvent = isTouch ? e.touches[0] : e;

    transformElement(moveEvent.clientX, moveEvent.clientY);
  }

  const onDragEnd = (e) => {
    if (draggedElement) {
      const endEvent = isTouch ? e.changedTouches[0] : e;

      const productName = draggedElement.dataset.product
      const ghostItem = container.querySelector('.product--ghost[data-product="' + productName + '"]');

      if (isMouseInCart(endEvent.clientX, endEvent.clientY)) {
        replaceGhostToSold(ghostItem)
        addProductToCart(productName);
        draggedElement.remove()
      }
      else {
        returnElementToInitialPosition(ghostItem);
      }

      cartDrop.classList.remove('cart__drop--active')
    }

    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
  }

  document.addEventListener('touchmove', preventPageReload, { passive: false });

  container.addEventListener('mousedown', onDragStart);
  container.addEventListener('touchstart', onDragStart);
})