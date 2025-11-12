const cookieContainer = document.getElementById("cookieBox");

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
for (let i = 0; i < cookieContainer.children.length; i++) {
    const cookie = cookieContainer.children[i];
    cookie.style.backgroundColor = getRandomColor();
    cookie.addEventListener("click", function (e){
        // Get cookie's current position
        const rect = this.getBoundingClientRect();
        const cookieCenterX = rect.left + rect.width / 2;
        const cookieCenterY = rect.top + rect.height / 2;
        
        // Calculate distance to viewport center
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        
        const translateX = viewportCenterX - cookieCenterX;
        const translateY = viewportCenterY - cookieCenterY;
        
        // Apply transform with translation and scale
        this.style.transform = `translate(${translateX}px, ${translateY}px) scale(10)`;
        this.style.transition = "transform 1s ease-out"
        
        setTimeout(() => {
            this.style.transform = '';
            this.style.zIndex = '';
            this.style.transition = '';
        }, 2000);
    })
}